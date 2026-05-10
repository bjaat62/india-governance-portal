import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PersonPage } from "@/components/person-page";
import { getPerson } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getPerson(slug);
    return {
      title: data.person.fullName,
      description: data.person.seoDescription ?? data.person.biography ?? undefined
    };
  } catch {
    return {
      title: "Leadership Profile"
    };
  }
}

export default async function PersonRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const data = await getPerson(slug);
    return <PersonPage data={data} />;
  } catch {
    notFound();
  }
}
