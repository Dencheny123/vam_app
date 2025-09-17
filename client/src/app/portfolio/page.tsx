import { generateMetadatas } from '@/shared/utils/metadata';
import { Metadata } from 'next';
import PortfolioPage from './WorkPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadatas(2) as Metadata;
}

export default function PortfolioPages() {
  return <PortfolioPage />;
}
