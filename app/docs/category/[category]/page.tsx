import { notFound, redirect } from 'next/navigation';
import categoryRoutes from '@/lib/legacy-category-routes.json';

export default async function LegacyCategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const target = categoryRoutes[category as keyof typeof categoryRoutes];
  if (!target) notFound();
  redirect(target);
}
