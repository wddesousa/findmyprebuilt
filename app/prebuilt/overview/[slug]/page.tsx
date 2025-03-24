import prisma, { getFullPrebuilt } from "@/app/db";
import { PrebuiltWithParts } from "@/app/lib/types";
import Image from "@/app/components/Image";
import Section from "../../components/Section";
import SpecsOverview from "../../components/SpecsOverview";

interface Post {
  id: string;
  title: string;
  content: string;
}

// Next.js will invalidate the cache when a
// request comes in, at most once every 60 seconds.
export const revalidate = 60 * 60 * 24; // 1 day

// We'll prerender only the params from `generateStaticParams` at build time.
// If a request comes in for a path that hasn't been generated,
// Next.js will server-render the page on-demand.
export const dynamicParams = false; // or false, to 404 on unknown paths

export async function generateStaticParams() {
  const prebuilts = await prisma.product.findMany({
    where: { type: "PREBUILT" },
  });
  return prebuilts.map((prebuilt) => ({
    slug: prebuilt.slug,
  }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const prebuilt = (await getFullPrebuilt(slug)) as PrebuiltWithParts;
  return (
    <main className="w-full">
      <Section bg="w">
        <h1 className="text-2xl">{prebuilt.product.name}</h1>
        <div className="flex">
          <div className="flex-1">
            <Image
              src={prebuilt.product.images[0].url}
              alt={prebuilt.product.name}
              width={400}
              height={400}
            />
          </div>
          <div className="flex-1">
            <SpecsOverview prebuilt={prebuilt} />
          </div>
        </div>
        <p>{prebuilt.gpu_chipset.name}</p>
      </Section>
    </main>
  );
}
