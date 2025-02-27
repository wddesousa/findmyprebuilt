"use client";

import { useActionState, useState } from "react";
import { submitPrebuilt } from "../action";
import { cleanedResults } from "@/app/api/scrape/types";

export default function NewPrebuiltForm({processedResults, rawResults}: cleanedResults) {
  const [state, action, pending] = useActionState(submitPrebuilt, undefined);
  const [prebuilt, setPrebuilt] = useState({processedResults, rawResults});

  return (
    <form action={action}>
      <div className=""></div>
    </form>
  );
}
