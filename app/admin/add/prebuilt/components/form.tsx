"use client";

import React, {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { submitPrebuilt } from "../actions";
import {
  cleanedResults,
  prebuiltParts,
  rawResult,
} from "@/app/api/scrape/types";
import { useDebouncedCallback } from "use-debounce";
import { prebuiltForeignValues } from "../types";
import { productSearchResult } from "@/app/types";
import { fetchPrebuilt, inputMap, searchValue } from "../utils/client";
import { v4 as uuidv4 } from "uuid";

const CheckboxInput = ({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked: boolean;
}) => {
  const [checked, setChecked] = useState<boolean>(defaultChecked);

  return (
    <div>
      <label>
        {label}
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={(e) => setChecked(e.currentTarget.checked)}
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
  const [value, setValue] = useState<string>(defaultValue ?? "");

  return (
    <div>
      <label>
        {label}
        <input
          type="text"
          className="text-black"
          name={name}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
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
  const [selected, setSelected] = useState<string>(defaultValue ?? "");
  if (!(name in databaseValues))
    throw Error(`dropdown not configured for ${name}`);

  return (
    <div>
      <label>
        {label}
        <select
          className="text-black"
          name={name}
          value={selected}
          onChange={(e) => setSelected(e.currentTarget.value)}
        >
          <Option displayValue={"Select"} realValue={""} />
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
  state,
}: {
  processedResults: cleanedResults["processedResults"];
  databaseValues: prebuiltForeignValues;
  state: any;
}) => {
  return Object.keys(processedResults).map((spec) => {
    const key = spec as keyof cleanedResults["processedResults"];
    const value = processedResults[key];

    const getInput = () => {
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
    };
    return (
      <div key={key}>
        {getInput()}
        {state?.errors?.[key]}
      </div>
    );
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

export const ProductNameInput = ({
  brandName,
  prebuiltName,
}: {
  brandName: string;
  prebuiltName: string;
}) => {
  const fullName = `${brandName} ${prebuiltName}`;
  const [productName, setProductName] = useState<string>(prebuiltName);
  const [prebuiltExists, setPrebuiltExists] = useState<boolean>(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    setProductName(value);

    if (value.length > 5) {
      const result = await fetchPrebuilt(fullName);
      setPrebuiltExists(result.length > 0);
    }
  };

  //check that the found name doesn't exist
  useEffect(() => {
    fetchPrebuilt(fullName)
      .then((result) => setPrebuiltExists(result.length > 0))
      .catch((error) => console.error("error fetching productName", error));
  }, []);

  useEffect(() => {
    if (prebuiltExists) {
      alert("Product already exists!");
    }
  }, [prebuiltExists]);

  return (
    <div>
      <label htmlFor="name">
        Product Name
        <input
          className="text-black"
          type="text"
          name="name"
          id="name"
          value={productName}
          onChange={onChange}
        />
      </label>
    </div>
  );
};

const ImageContainer = ({ urls }: { urls: string[] }) => {
  const [selectedImages, setSelectedImages] = useState<string[]>(urls);

  const handleButtonClick = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    index: number
  ) => {
    e.preventDefault();
    const [movedImage] = selectedImages.splice(index, 1);
    setSelectedImages([movedImage, ...selectedImages]);
  };

  return (
    <div className="flex flex-wrap">
      {selectedImages.map((image, index) => (
        <div key={image}>
          {index === 0 && <div>Main Image</div>}
          <i
            className="cursor-pointer"
            onClick={() =>
              setSelectedImages(
                selectedImages.filter(
                  (selectedImage) => selectedImage !== image
                )
              )
            }
          >
            X
          </i>
          <img src={image} width="300" />
          <input type="hidden" name="images" value={image} />
          {index !== 0 && (
            <button onClick={(e) => handleButtonClick(e, index)}>
              Select as main image
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

const StoreLinkInput = ({ title, name }: { title: string; name: string }) => {
  const [inputs, setInputs] = useState<{ id: string; value: string }[]>([
    { id: uuidv4(), value: "" },
  ]);

  const handleOnChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id: string
  ) => {
    const newInputs = inputs.map((input) =>
      input.id === id ? { ...input, value: e.currentTarget.value } : input
    );
    setInputs(newInputs);
  };

  const newInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddInput = () => {
    const newInput = { id: uuidv4(), value: "" };
    setInputs([...inputs, newInput]);

    // Focus the new input after it's added
    setTimeout(() => {
      if (newInputRef.current) {
        newInputRef.current.focus();
      }
    }, 0);
  };

  return (
    <label htmlFor="">
      {title}
      {inputs.map((thisInputValue, index) => (
        <div key={thisInputValue.id}>
          <input
            ref={index === inputs.length - 1 ? newInputRef : null}
            className="text-black"
            type="text"
            name={name}
            value={thisInputValue.value}
            onChange={(e) => handleOnChange(e, thisInputValue.id)}
          />
        </div>
      ))}
      <button onClick={handleAddInput}>add more</button>
    </label>
  );
};

export default function NewPrebuiltForm({
  cleanedResults,
  databaseValues,
}: {
  cleanedResults: cleanedResults;
  databaseValues: prebuiltForeignValues;
}) {
  const submitPrebuiltWithOriginalData = submitPrebuilt.bind(
    null,
    cleanedResults
  );

  const [state, action, pending] = useActionState(
    submitPrebuiltWithOriginalData,
    undefined
  );

  const processedResults = cleanedResults.processedResults;
  const rawResults = cleanedResults.rawResults;
  const brand = rawResults.brandName;

  return (
    <form
      onSubmit={(e) => {
        //workaround for bug that resets the form on submission
        e.preventDefault();
        startTransition(() => action(new FormData(e.currentTarget)));
      }}
    >
      {state?.message}
      <h2>Main Info</h2>
      <input type="hidden" name="brand" value={brand} />
      <input type="hidden" name="url" value={rawResults.url} />
      <ProductNameInput brandName={brand} prebuiltName={rawResults.name} />
      {state?.errors?.name}
      <h2>Images</h2>
      <ImageContainer urls={rawResults.images} />
      {state?.imageError}
      <h2 className="text-xl">Basic Specs</h2>
      <MainSpecsInputs
        processedResults={processedResults}
        databaseValues={databaseValues}
        state={state}
      />
      <br />

      <h2 className="text-xl">Parts</h2>
      {Object.keys(rawResults.prebuiltParts).map((part) => {
        const key = part as keyof prebuiltParts;
        return (
          <div key={key}>
            <SearchInput
              name={key}
              defaultValue={rawResults.prebuiltParts[key]}
            />
            {state?.errors?.[key]}
          </div>
        );
      })}
      <h2>Ecommerce stores</h2>
      <StoreLinkInput title="Amazon" name="amazon" />
      {state?.errors?.amazon}
      <div className="">
        <button disabled={pending} type="submit">
          Submit
        </button>
        <button>Skip for now</button>
        <button>Delete forever</button>
      </div>
    </form>
  );
}
