import type { Metadata } from 'next';
import { EmbedClient } from '@/components/marketing/embed-client';
import { getViralBaseUrl } from '@/lib/viral-loop';

const PATH = '/embed';
const SITE = getViralBaseUrl().replace(/\/$/, '');

export const metadata: Metadata = {
  title: 'Badges e embeds para parceiros',
  description:
    'HTML e Markdown prontos para blogs, cursos e portais linkarem as ferramentas grátis do Precisou, Tá Pronto.',
  alternates: { canonical: PATH },
  openGraph: {
    title: 'Embeds | Precisou, Tá Pronto',
    description: 'Badges e blocos HTML com UTM para parcerias.',
    url: `${SITE}${PATH}`,
    images: [{ url: `${PATH}/opengraph-image` }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Embeds | Precisou, Tá Pronto',
    description: 'Badges e blocos HTML com UTM para parcerias.',
    images: [`${PATH}/opengraph-image`]
  }
};

export default function EmbedPage() {
  return <EmbedClient />;
}
