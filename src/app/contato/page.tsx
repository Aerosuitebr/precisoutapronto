import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/marketing/legal-page';
import { BRAND_EMAIL, BRAND_SITE } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Contato',
  description:
    'Fale com a equipe do Precisou, Tá Pronto para suporte, segurança, privacidade, correções ou dúvidas sobre nossas ferramentas online.',
  alternates: { canonical: '/contato' },
  openGraph: {
    title: 'Contato | Precisou, Tá Pronto',
    description:
      'Fale com a equipe do Precisou, Tá Pronto para suporte, segurança, privacidade, correções ou dúvidas sobre nossas ferramentas online.',
    url: '/contato'
  }
};

export default function ContatoPage() {
  return (
    <LegalPage title="Contato" subtitle="Estamos em precisoutapronto.com.br">
      <p>
        O Precisou, Tá Pronto é um produto da <strong>Aerosuite</strong>. Suporte, segurança e
        privacidade usam a mesma caixa Google Workspace:
      </p>
      <p>
        <a href={`mailto:${BRAND_EMAIL}`} className="font-semibold text-sky-700 hover:text-sky-800">
          {BRAND_EMAIL}
        </a>
      </p>
      <ul className="list-disc space-y-1 pl-5">
        <li>Suporte de produto e dúvidas sobre ferramentas</li>
        <li>Privacidade e solicitações de dados</li>
        <li>Relatos de segurança (veja também o security.txt)</li>
      </ul>
      <p>
        Site oficial:{' '}
        <Link href="/" className="font-semibold text-sky-700 hover:text-sky-800">
          {BRAND_SITE}
        </Link>
      </p>
      <p>
        Relatos de segurança: veja também{' '}
        <a
          href="/.well-known/security.txt"
          className="font-semibold text-sky-700 hover:text-sky-800"
        >
          security.txt
        </a>
        .
      </p>
    </LegalPage>
  );
}
