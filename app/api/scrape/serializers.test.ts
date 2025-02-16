import { expect, test } from "vitest";
import { mobaChipsetCustomSerializer } from "./serializers";

test("correcly extract pci generation", () => {
  expect(
    mobaChipsetCustomSerializer["intel"]["pci_generation"]!(
      "\n                                                        \n                                                            \n                                                            \n                                                                3.0, 4.0\n                                                            \n                                                        \n                                                    "
    )
  ).toBe(4);

  expect(
    mobaChipsetCustomSerializer["intel"]["pci_generation"]!(
      "\n                                                        \n                                                            \n                                                            \n                                                                3.0\n                                                            \n                                                        \n                                                    "
    )
  ).toBe(3);
});
