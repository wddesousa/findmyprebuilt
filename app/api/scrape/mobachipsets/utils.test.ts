import { expect } from "vitest";
import { extractUsbNumbers } from "./utils";
import {test} from 'vitest'

test("correctly extracts usb number", () => {
    var string =
      "\n                                                        \n                                                            \n                                                            \n                                                                10 USB 3.2 Ports- Up to 4 USB 3.2 Gen 2x2 (20Gb/s) Ports- Up to 10 USB 3.2 Gen 2x1 (10Gb/s) Ports- Up to 2 USB 3.2 Gen 1x1 (5Gb/s) Ports14 USB 2.0 Ports\n                                                            \n                                                        \n                                                    ";
    expect(extractUsbNumbers(string, "20", "speed")).toEqual(4);
    expect(extractUsbNumbers(string, "10", "speed")).toEqual(10);
    expect(extractUsbNumbers(string, "5", "speed")).toEqual(2);
    expect(extractUsbNumbers(string, "342", "speed")).toEqual(0);
  
    string =
      "\n                                                        \n                                                            \n                                                            \n                                                                10 USB 3.0 Ports14 USB 2.0 Ports\n                                                            \n                                                        \n                                                    ";
    expect(extractUsbNumbers(string, "3.0", "version")).toEqual(10);
    expect(extractUsbNumbers(string, "2.0", "version")).toEqual(14);
  });