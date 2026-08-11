import { ViralClusterPage, viralClusterMetadata } from '@/components/marketing/viral-cluster-page';
import { getViralCluster } from '@/lib/seo/viral-clusters';
const cluster = getViralCluster('/pdf')!;
export const metadata = viralClusterMetadata(cluster);
export default function Page() { return <ViralClusterPage cluster={cluster} />; }
