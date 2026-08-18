import { permanentRedirect } from 'next/navigation';

export default function LegacyBrandPage() {
  permanentRedirect('/precisou-ta-pronto');
}
