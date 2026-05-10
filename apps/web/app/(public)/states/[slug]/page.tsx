import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { StatePage } from "@/components/state-page";
import { getState } from "@/lib/api";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getState(slug);
    return {
      title: `${data.state.name} Governance`,
      description: data.state.description ?? undefined
    };
  } catch {
    return {
      title: "State Profile"
    };
  }
}

export default async function StateRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const data = await getState(slug);
    return <StatePage data={data} />;
  } catch {
    notFound();
  }
}
