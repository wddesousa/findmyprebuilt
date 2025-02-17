// All possible spec categories
export type NzxtSpecCategory =
  | "Key Specs"
  | "Software"
  | "Processor"
  | "Graphics"
  | "Memory"
  | "Storage"
  | "Primary Storage"
  | "Storage"
  | "Motherboard"
  | "CPU Cooler"
  | "Cooler Fan"
  | "Case Fan - Front"
  | "Power"
  | "Case"
  | "Warranty";

// Individual interfaces for each category's spec values
interface KeySpecsValues {
  "Operating System"?: string;
  CPU?: string;
  GPU?: string;
  RAM?: string;
  Storage?: string;
}

interface SoftwareValues {
  "Operating System"?: string;
  "PC Monitoring & Customization"?: string;
  "Xbox Gamepass"?: string;
}

interface ProcessorValues {
  "Processor Brand"?: string;
  Series?: string;
  "Processor Speed (Base)"?: string;
  "Number of Cores"?: string;
}

interface GraphicsValues {
  Model?: string;
  Capacity?: string;
  "Base Graphics Model"?: string;
  "Chipset Manufacturer"?: string;
  "Upgrade Graphics Model"?: string;
}

interface MemoryValues {
  Capacity?: string;
  "Base System Memory"?: string;
  "Upgrade System Memory"?: string;
  Speed?: string;
  Interface?: string;
}

interface StorageValues {
  Model?: string;
  Capacity?: string;
  "Form Factor"?: string;
  "Base Storage"?: string;
  "Upgrade Storage"?: string;
}

interface MotherboardValues {
  Model?: string;
  "Form Factor"?: string;
  "Wi-Fi"?: string;
}

interface CPUCoolerValues {
  Model?: string;
  "Cooling type"?: string;
  Dimensions?: string;
  "Radiator material"?: string;
  "Coldplate material"?: string;
  "Heatsink material"?: string;
  "Fan specs"?: string;
  RGB?: string;
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

interface CPUFanValues {
  Model: string;
  Speed: string;
  Airflow: string;
  "Static Pressure": string;
  Noise: string;
  Dimension: string;
}

// Map each category to its corresponding spec values
export type NzxtCategorySpecMap = {
  "Key Specs": KeySpecsValues;
  Software: SoftwareValues;
  Processor: ProcessorValues;
  Graphics: GraphicsValues;
  Memory: MemoryValues;
  Storage: StorageValues;
  "Primary Storage": StorageValues;
  Motherboard: MotherboardValues;
  "CPU Cooler": CPUCoolerValues;
  "Cooler Fan"?: CPUFanValues;
  "Case Fan - Front"?: CPUFanValues;
  Power: PowerValues;
  Case: CaseValues;
  Warranty: WarrantyValues;
};

// Base type for all spec values
export interface NzxtSpecValues {
  specCategory: NzxtSpecCategory;
  specValues: NzxtCategorySpecMap[NzxtSpecCategory];
}

// Type for the entire specs array
export type NZXTSpecs = NzxtSpecValues[];
