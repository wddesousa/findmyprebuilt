// All possible spec categories
export type SpecCategory =
  | "Key Specs"
  | "Software"
  | "Processor"
  | "Graphics"
  | "Memory"
  | "Storage"
  | "Motherboard"
  | "CPU Cooler"
  | "Power"
  | "Case"
  | "Warranty";

// Individual interfaces for each category's spec values
interface KeySpecsValues {
  "Operating System": string;
  CPU: string;
  GPU: string;
  RAM: string;
  Storage: string;
}

interface SoftwareValues {
  "Operating System": string;
  "PC Monitoring & Customization": string;
  "Xbox Gamepass": string;
}

interface ProcessorValues {
  "Processor Brand": string;
  Series: string;
  "Processor Speed (Base)": string;
  "Number of Cores": string;
}

interface GraphicsValues {
  "Chipset Manufacturer": string;
  Model: string;
  Capacity: string;
}

interface MemoryValues {
  Capacity: string;
  Speed: string;
  Interface: string;
}

interface StorageValues {
  Model: string;
  Capacity: string;
  "Form Factor": string;
}

interface MotherboardValues {
  Model: string;
  "Form Factor": string;
  "Wi-Fi": string;
}

interface CPUCoolerValues {
  Model: string;
  "Cooling type": string;
  Dimensions: string;
  "Coldplate material": string;
  "Heatsink material": string;
  "Fan specs": string;
  RGB: string;
}

interface PowerValues {
  Model: string;
  Wattage: string;
  "Form Factor": string;
  Rating: string;
}

interface CaseValues {
  Model: string;
  "Motherboard Support": string;
  "Front I/O": string;
}

interface WarrantyValues {
  "Manufacturer's Warranty - Parts": string;
  "Manufacturer's Warranty - Labor": string;
}

// Map each category to its corresponding spec values
export type CategorySpecMap = {
  "Key Specs": KeySpecsValues;
  Software: SoftwareValues;
  Processor: ProcessorValues;
  Graphics: GraphicsValues;
  Memory: MemoryValues;
  Storage: StorageValues;
  Motherboard: MotherboardValues;
  "CPU Cooler": CPUCoolerValues;
  Power: PowerValues;
  Case: CaseValues;
  Warranty: WarrantyValues;
}

// Base type for all spec values
export interface SpecValues {
  specCategory: SpecCategory;
  specValues: CategorySpecMap[SpecCategory];
}

// Type for the entire specs array
export type NZXTSpecs = SpecValues[];



