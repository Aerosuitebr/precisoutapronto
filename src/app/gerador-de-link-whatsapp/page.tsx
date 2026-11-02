import type { Metadata } from 'next';
import { SiteHeader } from '@/components/marketing/site-header';
import { SiteFooter } from '@/components/marketing/site-footer';
import { WhatsappLinkGenerator } from '@/components/marketing/whatsapp-link-generator';

export const metadata: Metadata = {
  title: 'Gerador de link de WhatsApp grátis com mensagem',
  description: 'Crie um link de WhatsApp com seu número e mensagem personalizada. Copie e compartilhe sem cadastro e sem envio automático.',
  alternates: { canonical: '/gerador-de-link-whatsapp' }
};

export default function WhatsappLinkPage() {
  return <><SiteHeader /><main className="bg-slate-50 px-4 py-12 sm:py-16"><div className="mx-auto max-w-3xl"><p className="text-sm font-bold text-blue-700">Contato profissional · grátis e sem cadastro</p><h1 className="mt-3 text-4xl font-black tracking-tight text-slate-950">Gerador de link de WhatsApp</h1><p className="mb-8 mt-5 text-lg leading-8 text-slate-600">Informe seu número brasileiro e escreva a mensagem que o cliente verá ao abrir a conversa. O link é montado no seu navegador, sem enviar mensagens automaticamente.</p><WhatsappLinkGenerator /><h2 className="mt-12 text-2xl font-bold">Como usar seu link</h2><ol className="mt-4 list-inside list-decimal space-y-3 leading-7 text-slate-600"><li>Preencha o número com 55, DDD e WhatsApp.</li><li>Revise a mensagem e copie o link gerado.</li><li>Compartilhe no perfil profissional, no site ou nas redes sociais.</li></ol></div></main><SiteFooter /></>;
}
