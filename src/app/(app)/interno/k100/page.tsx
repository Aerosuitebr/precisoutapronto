'use client';

import { AuthGate } from '@/components/auth/auth-gate';
import { K100Panel } from '@/components/account/k100-panel';
import { PageHero } from '@/components/shared/page-hero';
import { BarChart3 } from 'lucide-react';

export default function InternalK100Page() {
  return (
    <AuthGate title="Painel interno" description="Entre com a conta interna." publicAccess={false}>
      <div className="space-y-5">
        <PageHero title="Métricas internas" subtitle="Aquisição viral e ofícios dos criadores recrutados." icon={BarChart3} />
        <K100Panel />
      </div>
    </AuthGate>
  );
}
