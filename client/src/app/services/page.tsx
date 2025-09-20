export const dynamic = 'force-dynamic';
import { generateMetadatas } from '@/shared/utils/metadata';
import ServicesPage from './ServicesPage';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadatas(3);
}

export default function ServicesPages() {
  return <ServicesPage />;
}
