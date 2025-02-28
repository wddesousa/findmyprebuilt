import NewPrebuiltForm from "./components/form";
import prisma from "@/app/db";
import { cleanedResults } from "@/app/api/scrape/types";

async function getQueuedPrebuilt() {
  return prisma.newProductQueue.findFirst({ where: { is_curated: false } });
}

export default async function Page() {
  const queued = await getQueuedPrebuilt();

  console.log(queued?.scraped_data);
  return (
    <>
      <h1>test</h1>
      {queued ? (
        <NewPrebuiltForm
          rawResults={(queued?.scraped_data as cleanedResults)?.rawResults}
          processedResults={
            (queued?.scraped_data as cleanedResults)?.processedResults
          }
        />
      ) : (
        <div>No queued prebuilt found</div>
      )}
    </>
  );
}
