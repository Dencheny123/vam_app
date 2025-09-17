export const dynamic = 'force-dynamic';
import styles from '../components/styles/WorkDetails.module.css';
import ImageCarousel from '../components/ImageCarousel';
import { notFound } from 'next/navigation';
import { generateMetadatas } from '@/shared/utils/metadata';
import { Metadata } from 'next';
import { MyWork } from '@/entities/my-work/model';
import WorkDetails from './WorkDetails';
import { reverseTransliterate } from '@/shared/utils/translater';
export interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.slug.split('-').shift();
  const name = reverseTransliterate(id!)

  return generateMetadatas(5, `${name}${' '}`) as Metadata;
}

export default function WorkDetail() {
  return <WorkDetails />;
}
