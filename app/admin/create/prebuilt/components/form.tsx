"use client";

import { useActionState, useState } from "react";
import { submitPrebuilt } from "../action";
import { cleanedResults, prebuiltParts } from "@/app/api/scrape/types";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import axios from "axios";

const searchPcPart = async (target: HTMLInputElement) => {
  const { name, value } = target;
  const params = new URLSearchParams({ keyword: value });
  return axios
    .get(
      `${process.env.NEXT_PUBLIC_AUTOCOMPLETE_URL}/${name}?keyword=${params.toString()}`
    )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error:", error);
      return [];
    });
};


const BasicSpecInputs = ({processedResults}: { processedResults: cleanedResults["processedResults"]}) => {
  return Object.keys(processedResults).map((spec) => {
    //TODO: check if it's boolean, change to input of selection true false
    const key = spec as keyof cleanedResults["processedResults"]
    return (
      <>
        <label key={`${key}-label`} htmlFor={key}>
          {key}{" "}
        </label>
        <input
          key={key}
          className="text-black"
          type="text"
          name={key}
          defaultValue={
            processedResults[key] ?? undefined}
        />
        <br></br>
      </>
    );
    // return <input type={typeMapping[key as keyof cleanedResults["processedResults"]]} name={key} defaultValue={processedResults[key as keyof cleanedResults["processedResults"]] as string} />
  })
}

const SearchPartInputs = ({prebuiltParts}: { prebuiltParts: prebuiltParts }) => { return  (
  //TODO:SEARCH THESE IN DATABASE
  Object.keys(prebuiltParts).map((part) => { 
    const key = part as keyof prebuiltParts; // Type assertion
    return (
    <>
    <label htmlFor={part}>{part} </label>
    <input className="text-black" type="text" name={part} defaultValue={prebuiltParts[key] ?? undefined} />
    <br />
    </>)
  }
  ))
}


const SearchInput = ({ name }: { name: string }) => {
  //this will call for results in db to associate pc parts with the prebuilt. Call this component if the scraper didn't find an id in the database for the part
  const [results, setResults] = useState([{}]);
  const [partName, setPartName] = useState(undefined);

  const debounced = useDebouncedCallback(
    // function
    async (target: HTMLInputElement) => {
      const data = await searchPcPart(target);
      setResults(data);
    },
    // delay in ms
    300
  );

  const handleClick = (e) => {
    setPartName(result.name)
    setResults([{}])
  }

  return (
    <>
      <label htmlFor={name}>{name}</label>
      <input
        type="text"
        name={name}
        value={partName}
        onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
          debounced(e.target as HTMLInputElement)
        }
      />
      {results.length > 0 && (
        <div className="results">{results.map((result) => <div onClick={handleClick}></div>)}</div>
      )}
      <br></br>
    </>
  );
};

export default function NewPrebuiltForm({
  processedResults,
  rawResults,
}: cleanedResults) {
  const [state, action, pending] = useActionState(submitPrebuilt, undefined);
  const [prebuilt, setPrebuilt] = useState({ processedResults, rawResults });
  console.log("TESTING PARTS")
  console.log(rawResults.prebuiltParts)
  // const typeMapping: Record<keyof cleanedResults["processedResults"], "number" | "text" | "boolean" | "custom"> = {
  //   os_id: "text",
  //   base_price: "text",
  //   psu_wattage: "number",
  //   rear_fan_mm: "number",
  //   customizable: "boolean",
  //   front_fan_mm: "number",
  //   cpu_cooler_mm: "number",
  //   gpu_chipset_id: "text",
  //   memory_modules: "number",
  //   cpu_cooler_type: "text",
  //   main_storage_gb: "number",
  //   memory_speed_id: "text",
  //   moba_chipset_id: "text",
  //   warranty_months: "number",
  //   memory_module_gb: "number",
  //   seconday_storage_gb: "number",
  //   main_storage_type_id: "text",
  //   psu_efficiency_rating: "text",
  //   secondary_storage_type_id: "number",
  //   wireless: "boolean"
  // };


  return (
    <form key="form" action={action}>
      <h2 className="text-xl">Basic Specs</h2>
      <BasicSpecInputs processedResults={processedResults} />
      <br />

      <h2 className="text-xl">Searchable IDs</h2>
      {!processedResults.os_id && <SearchInput name="os" />}
      {!processedResults.gpu_chipset_id && <SearchInput name="gpu_chipset" />}
      {!processedResults.memory_speed_id && <SearchInput name="memory_speed" />}
      {!processedResults.moba_chipset_id && <SearchInput name="moba_chipset" />}
      {!processedResults.main_storage_type_id && <SearchInput name="main_storage_type" />}
      {!processedResults.secondary_storage_type_id && <SearchInput name="secondary_storage_type" />}
      
      <h2 className="text-xl">Parts</h2>
      <SearchPartInputs prebuiltParts={rawResults.prebuiltParts} />
    
    </form>
  );
}
