import { generateMetadatas } from '@/shared/utils/metadata';
import { Metadata } from 'next';
import WorksList from './WorksList';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadatas(4) as Metadata;
}

export default function WorksLists() {
  return <WorksList/>
}
