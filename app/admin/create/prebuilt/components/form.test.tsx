import {
  render,
  screen,
  fireEvent,
  waitFor,
  queryByRole,
  waitForElementToBeRemoved,
} from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, it, expect, vi, afterAll, beforeEach } from "vitest";
import { DropdownInput, MainSpecsInputs, SearchInput } from "./form";
import { searchValue } from "../utils/client";
import {
  cleanPrebuiltScrapeResultSet,
  prebuiltExternalValues,
} from "@/tests/helpers/utils";
import { sleep } from "@/app/utils";

afterAll(() => {
  vi.useRealTimers();
});

describe("DropdownInput", () => {
  it("selects the correct default value for dropdown inputs", () => {
    const { rerender } = render(
      <DropdownInput
        databaseValues={prebuiltExternalValues}
        defaultValue="PLATINUM"
        label="psu_efficiency_rating"
        name="psu_efficiency_rating"
      />
    );
    // Find the <select> element
    var selectElement = screen.getByRole("combobox") as HTMLSelectElement;

    // Check that the default value is "PLATINUM"
    expect(selectElement.value).toBe("PLATINUM");

    rerender(
      <DropdownInput
        databaseValues={prebuiltExternalValues}
        defaultValue="_1fyazPe4BDuzIZvkjgLk"
        label="moba_chipset_id"
        name="moba_chipset_id"
      />
    );

    selectElement = screen.getByRole("combobox");

    // Check that the default value is "PLATINUM"
    expect(selectElement.value).toBe("_1fyazPe4BDuzIZvkjgLk");
  });
});

describe("MainSpecsInputs", () => {
  it("doesn't throw error", () => {
    render(
      <MainSpecsInputs
        databaseValues={prebuiltExternalValues}
        processedResults={cleanPrebuiltScrapeResultSet}
      />
    );
    expect(() =>
      render(
        <MainSpecsInputs
          databaseValues={prebuiltExternalValues}
          processedResults={cleanPrebuiltScrapeResultSet}
        />
      )
    ).not.toThrow();
  });
});

describe("SearchInput", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it("searches and sets values", async () => {
    vi.mock("../utils", async (importOriginal) => {
      const actualUtils = (await importOriginal()) as any; // Import the actual module
      return {
        ...actualUtils, // Spread the actual exports
        searchValue: vi.fn(() =>
          Promise.resolve([
            { name: "result 1", slug: "1" },
            { name: "result 2", slug: "2" },
          ])
        ), // Mock only searchValue
      };
    });

    render(<SearchInput name="cpu" defaultValue={"test"} />);
    const input = screen.getByDisplayValue("test");

    await userEvent.type(input, "new value");
    vi.advanceTimersByTime(300);
    expect(searchValue).toHaveBeenCalledWith(input);

    const results = await screen.findAllByRole("listitem");
    expect(results).toHaveLength(2);
    expect(results[0]).toHaveTextContent("result 1");

    await userEvent.click(results[0]);
    expect(input).toHaveValue("result 1");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
