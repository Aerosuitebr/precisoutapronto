import { redirect } from 'next/navigation';
import { BRAND_AUTHOR_PATH } from '@/lib/brand';

export default function EquipeResolvaJatoRedirect() {
  redirect(BRAND_AUTHOR_PATH);
}
