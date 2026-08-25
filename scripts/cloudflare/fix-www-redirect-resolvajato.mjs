#!/usr/bin/env node
/**
 * Corrige o redirect www → apex do Precisou, Tá Pronto.
 *
 * Problema: www.precisoutapronto.com.br/* redirecionava para https://precisoutapronto.com.br/
 * (home), descartando o path. Sitemap, robots e páginas quebravam no www.
 *
 * Correção: Redirect Rule dinâmica que preserva path + query:
 *   www.precisoutapronto.com.br/sitemap.xml → https://precisoutapronto.com.br/sitemap.xml
 *
 * Uso (PowerShell):
 *   $env:CLOUDFLARE_API_TOKEN = "seu-token"
 *   node scripts/cloudflare/fix-www-redirect-resolvajato.mjs
 *
 * Token: Zone → Rules → Edit (ou Redirect Rules Edit) na zone precisoutapronto.com.br
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || '30a3329312fe1bad82168d95ea83ef7f';
const ZONE_NAME = 'precisoutapronto.com.br';
const TOKEN = process.env.CLOUDFLARE_API_TOKEN || '';
const RULE_DESC = 'Precisou, Tá Pronto www → apex (301, preserve path)';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = resolve(__dirname, 'fix-www-redirect-result.json');

async function cf(path, init = {}) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok && json.success !== false, status: res.status, json };
}

function writeResult(payload) {
  writeFileSync(outPath, JSON.stringify(payload, null, 2));
  console.log(JSON.stringify(payload, null, 2));
}

function isWwwRule(rule) {
  const blob = JSON.stringify(rule);
  return (
    blob.includes(`www.${ZONE_NAME}`) ||
    (rule.description || '').toLowerCase().includes('www') ||
    (rule.description || '').includes(RULE_DESC)
  );
}

function desiredWwwRule() {
  return {
    expression: `(http.host eq "www.${ZONE_NAME}")`,
    description: RULE_DESC,
    action: 'redirect',
    action_parameters: {
      from_value: {
        target_url: {
          expression: `concat("https://${ZONE_NAME}", http.request.uri.path)`
        },
        status_code: 301,
        preserve_query_string: true
      }
    }
  };
}

async function listPageRules() {
  return cf(`/zones/${ZONE_ID}/pagerules?status=active`);
}

async function deleteBrokenPageRules() {
  const listed = await listPageRules();
  if (!listed.ok) {
    return { ok: false, errors: listed.json?.errors, status: listed.status };
  }

  const deleted = [];
  for (const rule of listed.json.result || []) {
    const targets = JSON.stringify(rule.targets || []);
    const actions = JSON.stringify(rule.actions || []);
    const touchesWww = targets.includes(`www.${ZONE_NAME}`) || targets.includes('www.');
    const dropsPath =
      actions.includes(`https://${ZONE_NAME}/`) &&
      !actions.includes('$1') &&
      !actions.includes('${1}');

    if (touchesWww && (dropsPath || actions.includes('forwarding_url'))) {
      const del = await cf(`/zones/${ZONE_ID}/pagerules/${rule.id}`, { method: 'DELETE' });
      deleted.push({
        id: rule.id,
        ok: del.ok,
        targets: rule.targets,
        actions: rule.actions,
        errors: del.json?.errors
      });
    }
  }

  return { ok: true, deleted, all: listed.json.result || [] };
}

async function fixDynamicRedirect() {
  const get = await cf(`/zones/${ZONE_ID}/rulesets/phases/http_request_dynamic_redirect/entrypoint`);
  if (!get.ok && get.status !== 404) {
    return { ok: false, step: 'get', status: get.status, errors: get.json?.errors };
  }

  const existing = get.json?.result;
  const rules = [...(existing?.rules || [])];
  const next = desiredWwwRule();

  const idx = rules.findIndex(isWwwRule);
  if (idx >= 0) {
    rules[idx] = { ...rules[idx], ...next, id: rules[idx].id };
  } else {
    rules.unshift(next);
  }

  const put = await cf(`/zones/${ZONE_ID}/rulesets/phases/http_request_dynamic_redirect/entrypoint`, {
    method: 'PUT',
    body: JSON.stringify({ rules })
  });

  return {
    ok: put.ok,
    step: 'put',
    status: put.status,
    id: put.json?.result?.id,
    ruleCount: rules.length,
    errors: put.json?.errors
  };
}

async function listBulkRedirects() {
  // List account-level bulk redirect lists that might mention www
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '44a7c31ca337648abef38dea0c599e79';
  const lists = await cf(`/accounts/${accountId}/rules/lists?kind=redirect`);
  return lists;
}

async function main() {
  if (!TOKEN) {
    writeResult({
      ok: false,
      skipped: true,
      reason: 'CLOUDFLARE_API_TOKEN ausente',
      manual: [
        `Cloudflare → ${ZONE_NAME} → Rules → Redirect Rules`,
        `Se existir regra www → https://${ZONE_NAME}/ (estática), edite ou apague.`,
        `Crie/ajuste: If hostname equals www.${ZONE_NAME} → Dynamic URL → concat("https://${ZONE_NAME}", http.request.uri.path) · 301 · preserve query.`
      ],
      zoneId: ZONE_ID
    });
    process.exit(0);
  }

  const pageRules = await deleteBrokenPageRules();
  const dynamic = await fixDynamicRedirect();
  const bulk = await listBulkRedirects();

  const result = {
    ok: dynamic.ok,
    zoneId: ZONE_ID,
    zoneName: ZONE_NAME,
    pageRules,
    dynamicRedirect: dynamic,
    bulkRedirectLists: bulk.ok
      ? (bulk.json.result || []).map((l) => ({ id: l.id, name: l.name, count: l.count }))
      : { ok: false, errors: bulk.json?.errors }
  };

  writeResult(result);
  process.exit(result.ok ? 0 : 1);
}

main().catch((err) => {
  writeResult({ ok: false, message: err instanceof Error ? err.message : String(err) });
  process.exit(1);
});
