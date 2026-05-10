import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CategoryPage } from "@/components/category-page";
import { getCategoryLeaders, getCategoryPositions } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Governance`
  };
}

export default async function CategoryRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const [directory, positions] = await Promise.all([getCategoryLeaders(slug), getCategoryPositions(slug)]);
    return <CategoryPage slug={slug} directory={directory} positions={positions} />;
  } catch {
    notFound();
  }
}
