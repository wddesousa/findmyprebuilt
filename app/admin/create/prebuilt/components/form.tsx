"use client";

import { useActionState, useState } from "react";
import { submitPrebuilt } from "../action";
import { cleanedResults, prebuiltParts } from "@/app/api/scrape/types";
import { inputMap } from "../utils";
import { useDebounce, useDebouncedCallback } from "use-debounce";
import axios from "axios";
import { ExecFileSyncOptionsWithStringEncoding } from "child_process";
import { prebuiltForeignValues } from "../types";

const searchValue = async (target: HTMLInputElement) => {
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

const CheckboxInput = ({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}) => {
  return (
    <div>
      <label>
        {label}
        <input
          type="checkbox"
          name={name}
          key={name}
          defaultChecked={defaultChecked}
        />
      </label>
      <br />
    </div>
  );
};

const TextInput = ({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue: string;
}) => {
  return (
    <div>
      <label>
        {label}
        <input
          type="text"
          className="text-black"
          name={name}
          key={name}
          defaultValue={defaultValue}
        />
      </label>
      <br />
    </div>
  );
};

const Option = ({realValue, displayValue, defaultSelected}: {realValue: string, displayValue: string, defaultSelected:string}) => {
return <option value={realValue} defaultValue={defaultSelected}>{displayValue}</option>
}

const DropdownInput = ({
  label,
  name,
  defaultValue,
  databaseValues,
}: {
  label: string;
  name: string;
  defaultValue: string
  databaseValues: prebuiltForeignValues;
}) => {
  const key = name as keyof prebuiltForeignValues
  if (!(name in databaseValues))
  throw Error(`dropdown not configured for ${name}`)
  return (
    <div>
      <label>
        {label}
        <select
          className="text-black"
          name={name}
          key={name}
        >
          {databaseValues[key].map((option) => <Option displayValue={option.name} realValue={option.id} defaultSelected={defaultValue}/>)}
          
        </select>
      </label>
      <br />
    </div>
  );
};

const MainSpecsInputs = ({
  processedResults,
  databaseValues
}: {
  processedResults: cleanedResults["processedResults"];
  databaseValues: prebuiltForeignValues
}) => {
  return Object.keys(processedResults).map((spec) => {
    const key = spec as keyof cleanedResults["processedResults"];
    const value = processedResults[key];

    switch (inputMap[key]) {
      case "boolean":
        return (
          <CheckboxInput
            defaultChecked={value === true}
            name={key}
            label={key}
          />
        );
      case "text":
        return (
          <TextInput
            defaultValue={(value as string) ?? undefined}
            name={key}
            label={key}
          />
        );
      case "number":
        return (
          <TextInput
            defaultValue={(value as string) ?? undefined}
            name={key}
            label={key}
          />
        );
      case "dropdown":
        return (
          <DropdownInput
            name={key}
            label={key}
            databaseValues={databaseValues}
            defaultValue={value as string}

          />
        );
    }
  });
  // return <input type={typeMapping[key as keyof cleanedResults["processedResults"]]} name={key} defaultValue={processedResults[key as keyof cleanedResults["processedResults"]] as string} />
};

const SearchPartInputs = ({
  prebuiltParts,
}: {
  prebuiltParts: prebuiltParts;
}) => {
  return (
    //TODO:SEARCH THESE IN DATABASE
    Object.keys(prebuiltParts).map((part) => {
      const key = part as keyof prebuiltParts; // Type assertion
      return (
        <>
          <label htmlFor={part}>{part} </label>
          <input
            className="text-black"
            type="text"
            name={part}
            defaultValue={prebuiltParts[key] ?? undefined}
          />
          <br />
        </>
      );
    })
  );
};

const SearchInput = ({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) => {
  //this will call for results in db to associate pc parts with the prebuilt. Call this component if the scraper didn't find an id in the database for the part
  const [results, setResults] = useState([{}]);
  const [partName, setPartName] = useState(undefined);

  const debounced = useDebouncedCallback(
    // function
    async (target: HTMLInputElement) => {
      const data = await searchValue(target);
      setResults(data);
    },
    // delay in ms
    300
  );

  const handleClick = (e) => {
    setPartName(result.name);
    setResults([{}]);
  };

  return (
    <>
      <label htmlFor={name}>{name}</label>
      <input
        type="text"
        className="text-black"
        name={name}
        key={name}
        value={partName}
        defaultValue={defaultValue}
        onKeyUp={(e: React.KeyboardEvent<HTMLInputElement>) =>
          debounced(e.target as HTMLInputElement)
        }
      />
      {results.length > 0 && (
        <div className="results">
          {results.map((result) => (
            <div onClick={handleClick}></div>
          ))}
        </div>
      )}
      <br></br>
    </>
  );
};

export default function NewPrebuiltForm({
  processedResults,
  rawResults,
  databaseValues
}: {processedResults: cleanedResults["processedResults"], rawResults: cleanedResults["rawResults"], databaseValues: prebuiltForeignValues}) {
  const [state, action, pending] = useActionState(submitPrebuilt, undefined);
  const [prebuilt, setPrebuilt] = useState({ processedResults, rawResults });

  return (
    <form key="form" action={action}>
      <h2 className="text-xl">Basic Specs</h2>
      <MainSpecsInputs processedResults={processedResults} databaseValues={databaseValues}  />
      <br />

      <h2 className="text-xl">Parts</h2>
      {Object.keys(rawResults.prebuiltParts).map((part) => {
        const key = part as keyof prebuiltParts;
        return (
          <SearchInput
            name={key}
            defaultValue={rawResults.prebuiltParts[key] ?? undefined}
          />
        );
      })}
    </form>
  );
}
