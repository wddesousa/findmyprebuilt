"use client";

import React, { useActionState, useEffect, useState } from "react";
import { submitPrebuilt } from "../action";
import {
  cleanedResults,
  prebuiltParts,
  rawResult,
} from "@/app/api/scrape/types";
import { useDebouncedCallback } from "use-debounce";
import { prebuiltForeignValues } from "../types";
import { productSearchResult } from "@/app/types";
import { fetchPrebuilt, inputMap, searchValue } from "../utils/client";

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
        <input type="checkbox" name={name} defaultChecked={defaultChecked} />
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
          defaultValue={defaultValue}
        />
      </label>
      <br />
    </div>
  );
};

const Option = ({
  realValue,
  displayValue,
}: {
  realValue: string;
  displayValue: string;
}) => {
  return <option value={realValue}>{displayValue}</option>;
};

export const DropdownInput = ({
  label,
  name,
  defaultValue,
  databaseValues,
}: {
  label: string;
  name: string;
  defaultValue: string;
  databaseValues: prebuiltForeignValues;
}) => {
  const key = name as keyof prebuiltForeignValues;

  if (!(name in databaseValues))
    throw Error(`dropdown not configured for ${name}`);

  return (
    <div>
      <label>
        {label}
        <select className="text-black" name={name} defaultValue={defaultValue}>
          {databaseValues[key].map((option) => (
            <Option
              key={option.id}
              displayValue={option.name}
              realValue={option.id}
            />
          ))}
        </select>
      </label>
      <br />
    </div>
  );
};

export const MainSpecsInputs = ({
  processedResults,
  databaseValues,
}: {
  processedResults: cleanedResults["processedResults"];
  databaseValues: prebuiltForeignValues;
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
            key={key}
          />
        );
      case "text":
        return (
          <TextInput
            defaultValue={(value as string) ?? undefined}
            name={key}
            label={key}
            key={key}
          />
        );
      case "number":
        return (
          <TextInput
            defaultValue={(value as string) ?? undefined}
            name={key}
            label={key}
            key={key}
          />
        );
      case "dropdown":
        return (
          <DropdownInput
            name={key}
            label={key}
            key={key}
            databaseValues={databaseValues}
            defaultValue={value as string}
          />
        );
    }
  });
  // return <input type={typeMapping[key as keyof cleanedResults["processedResults"]]} name={key} defaultValue={processedResults[key as keyof cleanedResults["processedResults"]] as string} />
};

export const SearchInput = ({
  name,
  defaultValue,
}: {
  name: keyof prebuiltParts;
  defaultValue?: rawResult;
}) => {
  const [results, setResults] = useState<productSearchResult[]>([]);
  const [partName, setPartName] = useState<string>(
    defaultValue ? defaultValue : ""
  );

  const debounced = useDebouncedCallback(async (target: HTMLInputElement) => {
    const data = await searchValue(target);
    setResults(data);
  }, 300);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounced(e.currentTarget);
    setPartName(e.currentTarget.value);
  };

  const handleClick = (productName: string) => {
    setPartName(productName);
    setResults([]);
  };

  return (
    <>
      <label htmlFor={name}>
        {name}
        <input
          type="text"
          className="text-black"
          name={name}
          value={partName}
          onChange={onChange}
        />
      </label>
      {results.length > 0 && (
        <ul className="results">
          {results.map((result) => {
            return (
              <li key={result.slug} onClick={() => handleClick(result.name)}>
                {result.name}
              </li>
            );
          })}
        </ul>
      )}
      <br></br>
    </>
  );
};

export const  ProductNameInput = ({
  brandName,
  prebuiltName,
}: {
  brandName: string;
  prebuiltName: string;
}) => {
  const fullName = `${brandName} ${prebuiltName}`
  const [productName, setProductName] = useState<string>(fullName);
  const [prebuiltExists, setPrebuiltExists] = useState<boolean>(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setProductName(value);

    if (value.length > 5) {
      const result = await fetchPrebuilt(value);
      setPrebuiltExists(result.length > 0);
    }
  };

  useEffect(() => {
    if (prebuiltExists) {
      alert("Product already exists!");
    }
  }, [prebuiltExists]);
  return (
    <input
      className="text-black"
      type="text"
      name="name"
      id="name"
      value={productName}
      onChange={onChange}
    />
  );
};

export default function NewPrebuiltForm({
  processedResults,
  rawResults,
  databaseValues,
}: {
  processedResults: cleanedResults["processedResults"];
  rawResults: cleanedResults["rawResults"];
  databaseValues: prebuiltForeignValues;
}) {
  const [state, action, pending] = useActionState(submitPrebuilt, undefined);
  const [prebuilt, setPrebuilt] = useState({ processedResults, rawResults });

  return (
    <form key="form" action={action}>
      <h2>Main Info</h2>
      <ProductNameInput
        brandName={rawResults.brandName}
        prebuiltName={rawResults.name}
      />
      <h2 className="text-xl">Basic Specs</h2>
      <MainSpecsInputs
        processedResults={processedResults}
        databaseValues={databaseValues}
      />
      <br />

      <h2 className="text-xl">Parts</h2>
      {Object.keys(rawResults.prebuiltParts).map((part) => {
        const key = part as keyof prebuiltParts;
        return (
          <SearchInput
            name={key}
            defaultValue={rawResults.prebuiltParts[key]}
            key={key}
          />
        );
      })}
    </form>
  );
}
