import NewPrebuiltForm from "./components/form";
import prisma from "@/app/db";
import { cleanedResults } from "@/app/api/scrape/types";
import { getQueuedPrebuilt, getForeignValues } from "./utils/server";

export default async function Page() {
  const queued = await getQueuedPrebuilt();
  const databaseValues = await getForeignValues();
  const results = queued?.scraped_data as cleanedResults;

  return (
    <>
      <h1>New {results.rawResults.brandName} Prebuild</h1>
      {queued ? (
        <NewPrebuiltForm
        cleanedResults={results}
          databaseValues={databaseValues}
        />
      ) : (
        <div>No queued prebuilt found</div>
      )}
    </>
  );
}
