'use client';

import { useEffect, useState } from 'react';
import { Save, UserRoundCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { FormField } from '@/components/ui/form-field';
import { useToast } from '@/components/ui/toast';
import { growthSegments } from '@/lib/growth/segments';

const STORAGE_KEY = 'rj-growth-segment';

export function ProfileSettings() {
  const { toast } = useToast();
  const [segment, setSegment] = useState('');
  const [occupation, setOccupation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetch('/api/profile', { cache: 'no-store' })
      .then((response) => response.json())
      .then((data) => {
        setSegment(data.profile?.segment || localStorage.getItem(STORAGE_KEY) || '');
        setOccupation(data.profile?.occupation || '');
        setCompanyName(data.profile?.companyName || '');
      })
      .finally(() => setLoading(false));
  }, []);

  async function save() {
    if (!segment) return;
    setSaving(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ segment, occupation, companyName })
      });
      if (!response.ok) throw new Error();
      localStorage.setItem(STORAGE_KEY, segment);
      toast('Perfil atualizado. Seus atalhos serão personalizados.');
    } catch {
      toast('Não foi possível salvar o perfil agora.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="perfil" className="scroll-mt-24 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
          <UserRoundCog className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-bold text-slate-950">Meu perfil profissional</h2>
          <p className="text-sm text-slate-600">Usado para priorizar ferramentas e conteúdos.</p>
        </div>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <FormField label="Área principal" htmlFor="profile-segment" required>
          <Select id="profile-segment" value={segment} onChange={(event) => setSegment(event.target.value)} disabled={loading}>
            <option value="">Selecione sua área</option>
            {growthSegments.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
          </Select>
        </FormField>
        <FormField label="Profissão ou função" htmlFor="profile-occupation">
          <Input id="profile-occupation" value={occupation} onChange={(event) => setOccupation(event.target.value)} placeholder="Ex.: Designer freelancer" disabled={loading} />
        </FormField>
        <FormField label="Empresa ou marca" htmlFor="profile-company">
          <Input id="profile-company" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Opcional" disabled={loading} />
        </FormField>
      </div>
      <Button className="mt-5" onClick={save} disabled={!segment || loading || saving}>
        <Save className="h-4 w-4" /> {saving ? 'Salvando…' : 'Salvar perfil'}
      </Button>
    </section>
  );
}
