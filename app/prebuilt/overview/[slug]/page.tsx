import prisma, { getFullPrebuilt, getGpuByChipsetOrThrow } from "@/app/db";
import { PrebuiltWithParts } from "@/app/lib/types";
import Image from "@/app/components/Image";
import Section from "../../components/Section";
import SpecsOverview from "../../components/SpecsOverview";
import { getFullName } from "@/app/lib/utils";
import BestPriceButtons from "../../components/BestPriceButtons";
import { PrebuiltParts } from "@prisma/client";
import { cleanedResults, PartsMap } from "@/app/api/scrape/types";
import { getCompatibleCases, getDiyParts } from "../../utils";

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
  const DIYParts = await getDiyParts(prebuilt);

  return (
    <main className="w-full">
      <Section bg="w">
        <h1 className="text-3xl">{getFullName(prebuilt.product)}</h1>
        <div className="flex">
          <div className="flex-1 flex justify-center">
            <Image
              src={prebuilt.product.images[0].url}
              alt={prebuilt.product.name}
              width={400}
              height={400}
            />
          </div>
          <div className="flex-1">
            <BestPriceButtons prices={prebuilt.product.prices} />
            <SpecsOverview prebuilt={prebuilt} />
          </div>
        </div>
        <p>{prebuilt.gpu_chipset.name}</p>
      </Section>
      <Section bg="g">
        <h2 className="text-2xl">Prices</h2>
        <div className="flex">
          <div className="flex-1">
            <h3 className="text-xl">Prebuilt Prices</h3>
            <p>Ready-to-play and with a warranty</p>
          </div>
          <div className="flex-1">
            <h3 className="text-xl">DIY Prices</h3>
            <p>Build the same or similar PC for much less</p>
          </div>
        </div>
      </Section>
    </main>
  );
}
