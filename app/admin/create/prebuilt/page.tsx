import NewPrebuiltForm from "./components/form";
import prisma from "@/app/db";
import { cleanedResults } from "@/app/api/scrape/types";
import { getQueuedPrebuilt, getForeignValues } from "./utils";

export default async function Page() {
  const queued = await getQueuedPrebuilt();
  const databaseValues = await getForeignValues();
  console.log(queued?.scraped_data);
  console.log("CHIPSETS", databaseValues.moba_chipset_id)
  return (
    <>
      <h1>test</h1>
      {queued ? (
        <NewPrebuiltForm
          rawResults={(queued?.scraped_data as cleanedResults)?.rawResults}
          processedResults={
            (queued?.scraped_data as cleanedResults)?.processedResults
          }
          databaseValues={databaseValues}
        />
      ) : (
        <div>No queued prebuilt found</div>
      )}
    </>
  );
}
