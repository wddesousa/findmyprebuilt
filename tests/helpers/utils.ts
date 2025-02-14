import { Prisma } from "@prisma/client";
import path from "path";
import { pathToFileURL } from "url";

export const getFile = (filename: string) =>
pathToFileURL(path.join(__dirname, "../data", filename)).href;

export const caseFanResult = {
    part_number: ["UF-SLIN120-3B", "12SLIN3B"],
    size_mm: 120,
    color: "Black",
    quantity: "3-Pack",
    airflow: "0 - 61.3 CFM",
    noise_level: "0 - 29 dB",
    pwm: true,
    led: "Addressable RGB",
    connector: "4-pin PWM + 3-pin 5V Addressable RGB",
    controller: "5V Addressable RGB",
    static_pressure_mmh2o: new Prisma.Decimal(2.66),
    product: {
      name: "Uni Fan SL-Infinity",
      type: "CASEFAN",
      asin: null,
      brand: { name: "Lian Li" },
    },
  }

  export const caseResult =  {
    part_number: ["CC-H61FB-01"],
    type: "ATX Mid Tower",
    color: "Black",
    power_supply: false,
    side_panel: "Tempered Glass",
    power_supply_shroud: true,
    front_panel_usb: ["USB 3.2 Gen 2 Type-C", "USB 3.2 Gen 1 Type-A"],
    maximum_video_card_length_mm: 365,
    drive_bays: ['2 x Internal 2.5"', '1 x Internal 3.5"'],
    expansion_slots: "7 x Full-Height",
    volume_ml: 51811,
    dimensions: ["415 mm x 287 mm x 435 mm", '16.339" x 11.299" x 17.126"'],
    product: {
      name: "H6 Flow",
      type: "CASE",
      asin: null,
      brand: { name: "NZXT" },
    },
    moba_form_factors: [
      { name: "ATX" },
      { name: "Micro ATX" },
      { name: "Mini ITX" },
    ],
  }

  export const psuResult = {
    part_number: [
      "CP-9020262-NA",
      "CP-9020262-UK",
      "CP-9020262-EU",
      "CP-9020262-AU",
    ],
    type: "ATX",
    efficiency_rating: "GOLD",
    wattage_w: 750,
    length_mm: 140,
    modular: "Full",
    color: "Black",
    fanless: false,
    atx_4_pin_connectors: 0,
    eps_8_pin_connectors: 2,
    pcie_12_4_pin_12vhpwr_connectors: 1,
    pcie_12_pin_connectors: 0,
    pcie_8_pin_connectors: 0,
    pcie_6_2_pin_connectors: 3,
    pcie_6_pin_connectors: 0,
    sata_connectors: 7,
    molex_4_pin_connectors: 4,
    product: {
      name: "RM750e (2023)",
      type: "PSU",
      asin: null,
      brand: { name: "Corsair" },
    },
  }

  export const airCoolerResult = {
    part_number: ["ACFRE00124A"],
    fan_rpm: "200 - 2000 RPM",
    color: "Black",
    height_mm: 159,
    water_cooled_radiador_mm: null,
    fanless: false,
    product: {
      name: "Freezer 36 A-RGB",
      type: "COOLER",
      asin: null,
      brand: { name: "ARCTIC" },
    },
    cpu_sockets: [
      { name: "AM4" },
      { name: "AM5" },
      { name: "LGA1700" },
      { name: "LGA1851" },
    ],
  }

  export const liquidCoolerResult = {
    part_number: ["CW-9060073-WW"],
    fan_rpm: "550 - 2100 RPM",
    color: "White",
    height_mm: null,
    water_cooled_radiador_mm: 360,
    fanless: false,
    product: {
      name: "iCUE H150i ELITE CAPELLIX XT",
      type: "COOLER",
      asin: null,
      brand: { name: "Corsair" },
    },
    cpu_sockets: [
      { name: "AM4" },
      { name: "AM5" },
      { name: "LGA1150" },
      { name: "LGA1151" },
      { name: "LGA1155" },
      { name: "LGA1156" },
      { name: "LGA1200" },
      { name: "LGA1700" },
      { name: "LGA1851" },
      { name: "LGA2011" },
      { name: "LGA2011-3" },
      { name: "LGA2066" },
      { name: "sTR4" },
      { name: "sTRX4" },
    ],
  }

  export const hddStorageResult = {
    part_number: ["ST24000NT002"],
    capacity_gb: 24000,
    form_factor: '3.5"',
    interface: "SATA 6.0 Gb/s",
    nvme: false,
    product: {
      name: "IronWolf Pro 24 TB",
      type: "STORAGE",
      asin: null,
      brand: { name: "Seagate" },
    },
    storage_type: { name: "7200 RPM" },
  }

  export const ssdStorageResult = {
    part_number: ["SKC3000S/1024G"],
    capacity_gb: 1024,
    form_factor: "M.2-2280",
    interface: "M.2 PCIe 4.0 X4",
    nvme: true,
    product: {
      name: "KC3000 1.024 TB",
      type: "STORAGE",
      asin: null,
      brand: { name: "Kingston" },
    },
    storage_type: { name: "SSD" },
  }

  export const cpuResult = {
    part_number: ["100-100000910WOF"],
    series: "AMD Ryzen 7",
    microarchitecture: "Zen 4",
    core_family: "Raphael",
    core_count: 8,
    thread_count: 16,
    performance_core_clock_ghz: 4.2,
    performance_core_boost_clock_ghz: 5,
    l2_cache_mb: 8,
    l3_cache_mb: 96,
    tdp_w: 120,
    integrated_graphics: "Radeon",
    maximum_supported_memory_gb: 128,
    ecc_support: true,
    includes_cooler: false,
    packaging: "Boxed",
    lithography_nm: 5,
    includes_cpu_cooler: false,
    simultaneous_multithreading: true,
    product: {
      name: "Ryzen 7 7800X3D",
      type: "CPU",
      brand: { name: "AMD" },
    },
    socket: {
      name: "AM5",
    },
  }
  export const gpuResult = {
    boost_clock_mhz: 1777,
    case_expansion_slot_width: 2,
    chipset: {
      name: "GeForce RTX 3060 12GB",
    },
    color: "Black",
    cooling: 2,
    core_clock_mhz: 1320,
    displayport_outputs: 3,
    effective_memory_clock_mhz: 15000,
    external_power: "1 PCIe 8-pin",
    frame_sync: "G-Sync",
    hdmi_outputs: 1,
    interface: "PCIe x16",
    length_mm: 235,
    memory_gb: 12,
    memory_type: "GDDR6",
    part_number: [
      "RTX3060Ventus2X12GOC",
      "GeForce RTX 3060 VENTUS 2X 12G OC",
      "V397-022R",
      "912-V397-039",
    ],
    product: {
      name: "GeForce RTX 3060 Ventus 2X 12G",
      type: "GPU",
      brand: { name: "MSI" },
    },
    tdp_w: 170,
    total_slot_width: 2,
  }

  export const mobaResult = {
    part_number: ["Z890 Steel Legend WiFi", "90-MXBPF0-A0UAYZ"],
    memory_max: 256,
    memory_slots: 4,
    color: "Silver",
    pcie_x16_slots: 2,
    pcie_x8_slots: 0,
    pcie_x_slots: 1,
    pcie_x1_slots: 0,
    pci_slots: 0,
    mini_pcie_slots: 0,
    half_mini_pcie_slots: 0,
    mini_pcie_msata_slots: 0,
    msata_slots: 0,
    sata_6_0_gbs: 4,
    onboard_ethernet: "1 x 2.5 Gb/s (Realtek Dragon RTL8125BG)",
    onboard_video: "Depends on CPU",
    usb_2_0_headers: 2,
    usb_2_0_headers_single_port: 0,
    usb_3_2_gen_1_headers: 2,
    usb_3_2_gen_2_headers: 0,
    usb_3_2_gen_2x2_headers: 1,
    supports_ecc: false,
    wireless_networking: "Wi-Fi 7",
    raid_support: true,
    uses_back_connect_connectors: false,
    product: {
      name: "Z890 Steel Legend WiFi",
      type: "MOBA",
      asin: null,
      brand: { name: "ASRock" },
    },
    chipset: {
      name: "Z890",
    },
    memory_speeds: [
      { ddr: "DDR5", speed: 4400 },
      { ddr: "DDR5", speed: 4800 },
      { ddr: "DDR5", speed: 5200 },
      { ddr: "DDR5", speed: 5600 },
      { ddr: "DDR5", speed: 6000 },
      { ddr: "DDR5", speed: 6200 },
      { ddr: "DDR5", speed: 6400 },
      { ddr: "DDR5", speed: 6600 },
      { ddr: "DDR5", speed: 6800 },
      { ddr: "DDR5", speed: 7000 },
      { ddr: "DDR5", speed: 7200 },
      { ddr: "DDR5", speed: 7600 },
      { ddr: "DDR5", speed: 7800 },
      { ddr: "DDR5", speed: 8000 },
      { ddr: "DDR5", speed: 8200 },
      { ddr: "DDR5", speed: 8400 },
    ],
    moba_form_factor: { name: "ATX" },
    socket: { name: "LGA1851" },
  }

    export const memoryResult = {
        part_number: [ 'CMK16GX4M2B3200C16' ],
        form_factor: '288-pin DIMM (DDR4)',
        modules: '2 x 8GB',
        color: 'Black / Yellow',
        first_word_latency: 10,
        cas_latency: 16,
        voltage: new Prisma.Decimal(1.35),
        timing: '16-18-18-36',
        ecc_registered: 'Non-ECC / Unbuffered',
        heat_spreader: true,
        product: {
          name: 'Vengeance LPX 16 GB',
          type: 'MEMORY',
          asin: null,
          brand: { name: 'Corsair' }
        },
        memory_speed: { ddr: 'DDR4', speed: 3200 }
      }


export const cleanPrebuiltScrapeResultSet = {
  base_price: new Prisma.Decimal(829),
  cpu_cooler_mm: 120,
  cpu_cooler_type: 'AIR',
  customizable: true,
  front_fan_mm: 120,
  rear_fan_mm: 120,
  os_id: "1",
  gpu_chipset_id: "1",
  moba_chipset_id: "1",
  main_storage_gb: 1024,
  seconday_storage_gb: null,
  main_storage_type_id: "1",
  secondary_storage_type_id: undefined,
  memory_modules: 2,
  memory_module_gb: 8,
  memory_speed_id: "1",
  warranty_months: 24,
  wireless: undefined,
  psu_efficiency_rating: "GOLD",
  psu_wattage: 650
}

export const scrapeNzxtResults = {
  prebuilt: {
    customizable: true,
    base_price: "829",
    front_fan_mm: "120",
    rear_fan_mm: "120",
    cpu_cooler_mm: "120",
    cpu_cooler_type: "Air Cooler",
    os: "Windows 11 Home",
    warranty_months: "24",
    wireless: undefined,
  },
  prebuiltParts: {
    psu: "650W Gold 80+ Gold 650 W",
    cpu: "Intel® Core™ i5-13400F",
    case: "NZXT H5 Flow",
    cpu_cooler: "NZXT T120",
    gpu: "NVIDIA® GeForce RTX™ 3050",
    front_fan: "F120Q - 120mm Quiet Airflow Fans (Case Version) x1",
    rear_fan: "F120P Static Pressure Fan x1",
    main_storage: "1TB NVMe M.2 SSD",
    second_storage: undefined,
    moba: undefined,
    ram: "16GB (2 x 8GB) DDR5 5200 MHz (max speed)",
  },
  specsHtml: `[{"specCategory":"Key Specs","specValues":{"Operating System":"Windows 11 Home","CPU":"Intel® Core™ i5-13400F","GPU":"NVIDIA® GeForce RTX™ 3050","RAM":"16GB (2 x 8GB) DDR5 5200 MHz (max speed)","Storage":"1TB NVMe M.2 SSD"}},{"specCategory":"Software","specValues":{"Operating System":"Windows 11 Home","PC Monitoring & Customization":"CAM","Xbox Gamepass":"30 Day Free Trial"}},{"specCategory":"Processor","specValues":{"Base AMD Processor":"AMD Ryzen™ 5 8400F","Base Intel Processor":"Intel® Core™ i5-13400F"}},{"specCategory":"Graphics","specValues":{"Chipset Manufacturer":"NVIDIA® ","Base Graphics Model":"GeForce RTX™ 3050","Upgrade Graphics Model":"GeForce RTX™ 4060"}},{"specCategory":"Memory","specValues":{"Base System Memory":"16 GB (2 × 8GB) DDR5 5200 MHz","Upgrade System Memory":"32GB (4 × 8GB) DDR5 5200 MHz","RGB":"No"}},{"specCategory":"Storage","specValues":{"Model":"Product brand may vary","Base Storage":"1TB NVMe M.2 SSD","Upgrade Storage":"2TB NVMe M.2 SSD"}},{"specCategory":"Motherboard (AMD CPU)","specValues":{"Model":"B650","Form Factor":"ATX","Wi-Fi":"Included"}},{"specCategory":"Motherboard (Intel CPU)","specValues":{"Model":"B760 ","Form Factor":"ATX","Wi-Fi":"Included"}},{"specCategory":"CPU Cooler","specValues":{"Model":"NZXT T120","Cooling type":"Air Cooler","Dimensions":"120 x 66 x 159 mm","Coldplate material":"Copper","Block material":"-","Display Panel Type":"-","Fan specs":"1 x F120P Static Pressure Fan","RGB":"No"}},{"specCategory":"Cooler Fan","specValues":{"Model":"F120P Static Pressure Fan x1","Speed":"500-1,800 ± 300 RPM","Airflow":"21.67 - 78.02 CFM","Static Pressure":"0.75 - 2.7mm-H2O","Noise":"17.9 - 30.6dBA","Dimension":"120 x 120 x 26mm"}},{"specCategory":"Case Fan - Front","specValues":{"Model":"F120Q - 120mm Quiet Airflow Fans (Case Version) x1","Speed":"500 - 1,200 ± 300 RPM","Airflow":"27.77 - 64 CFM","Static Pressure":"0.45 - 1.08 mm - H₂O","Noise":"16.7 - 22.5 dBA","Dimension":"120 x 120 x 26 mm"}},{"specCategory":"Case Fan - Rear","specValues":{"Model":"F120Q - 120mm Quiet Airflow Fans (Case Version) x1","Speed":"500 - 1,200 ± 300 RPM","Airflow":"27.77 - 64 CFM","Static Pressure":"0.45 - 1.08 mm - H₂O","Noise":"16.7 - 22.5 dBA","Dimension":"120 x 120 x 26 mm"}},{"specCategory":"Power","specValues":{"Model":"650W Gold","Wattage":"650 W","Rating":"80+ Gold"}},{"specCategory":"Case","specValues":{"Model":"NZXT H5 Flow","Motherboard Support":"Mini-ITX, MicroATX, ATX","Front I/O":"1x USB 3.2 Gen 1 Type-A / 1x USB 3.2 Gen 2 Type-C / 1x Headset Audio Jack"}},{"specCategory":"Warranty","specValues":{"Manufacturer's Warranty - Parts":"2 years","Manufacturer's Warranty - Labor":"2 years"}}]`,
  images: [
    "https://www.datocms-assets.com/34299/1727324329-player-1-ww-09-04-24-hero-white-badge.png",
    "https://www.datocms-assets.com/34299/1727324327-player-1-ww-09-04-24-side-white.png",
    "https://www.datocms-assets.com/34299/1727324330-player-1-ww-09-04-24-front-white.png",
  ],
  performance: {
    "Call of Duty Modern Warfare": {
      R1080P: 75,
      R1440P: 50,
      R2160P: 25,
    },
    Fortnite: {
      R1080P: 65,
      R1440P: 40,
      R2160P: 20,
    },
    "Grand Theft Auto V": {
      R1080P: 65,
      R1440P: 40,
      R2160P: 0,
    },
    "League of Legends": {
      R1080P: 200,
      R1440P: 200,
      R2160P: 200,
    },
    Starfield: {
      R1080P: 40,
      R1440P: 30,
      R2160P: 0,
    },
  },
}

export const psuTests = [
  {
    input: "650W Gold 80+ Gold 650 W",
    expectedWattage: 650,
    expectedRating: "GOLD",
  },
  {
    input: "750 Watt - High Power - 80 PLUS Gold Certified",
    expectedWattage: 750,
    expectedRating: "GOLD",
  },
  {
    input: "750 Watt - High Power - 80 PLUS titanium Certified",
    expectedWattage: 750,
    expectedRating: "TITANIUM",
  },
  {
    input: "750 Watt - High Power - 80 PLUS Bronze Certified",
    expectedWattage: 750,
    expectedRating: "BRONZE",
  },
  {
    input: "750 Watt - High Power - 80 PLUS Platinum Certified",
    expectedWattage: 750,
    expectedRating: "PLATINUM",
  },
  {
    input: "750 Watt - High Power - 80 PLUS SILVER Certified",
    expectedWattage: 750,
    expectedRating: "SILVER",
  },
  {
    input: "750 Watt - High Power - 80 PLUS Gold Certified",
    expectedWattage: 750,
    expectedRating: "GOLD",
  },
  {
    input: "MSI MAG A750GL PCIe 5",
    expectedWattage: null,
    expectedRating: null
  },
];

export const memoryModuleTests = [
  {
    input: "16GB (2 x 8GB) DDR5 5200 MHz",
    expectedModules: { number: 2, size: 8 },
    expectedSpeed: 5200,
    expectedDDR: "DDR5",
  },
  {
    input: "16GB (2 x 8 GB) DDR5 5200 MHz",
    expectedModules: { number: 2, size: 8 },
    expectedSpeed: 5200,
    expectedDDR: "DDR5",
  },
  {
    input: "32GB [16GB x 2] DDR5-5600MHz RGB",
    expectedModules: { number: 2, size: 16 },
    expectedSpeed: 5600,
    expectedDDR: "DDR5",
  },
  {
    input: "32GB [16 GB x 2] DDR5-5600MHz RGB",
    expectedModules: { number: 2, size: 16 },
    expectedSpeed: 5600,
    expectedDDR: "DDR5",
  },
  {
    input: "32GB DDR5-5600MHz RGB RAM",
    expectedModules: { number: null, size: null },
    expectedSpeed: 5600,
    expectedDDR: "DDR5",
  },
];

export const storageTests = [
  { input: "1TB NVMe M.2 SSD", expectedSize: 1024, expectedType: "SSD" },
  { input: "2 tb NVMe M.2 SSD", expectedSize: 2048, expectedType: "SSD" },
  {
    input: "1TB NVMe M.2 SSD + 1TB NVMe M.2 SSD",
    expectedSize: 1024,
    expectedType: "SSD",
  },
  { input: "800GB NVMe M.2 SSD", expectedSize: 800, expectedType: "SSD" },
  {
    input:
      "Seagate Barracuda Compute 900 gB 3.5 7200 RPM Internal Hard Drive",
    expectedSize: 900,
    expectedType: "7200 RPM",
  },
];

export const air = {
  Model: "NZXT T120 RGB",
  "Cooling type": "Air Cooler ",
  Dimensions: "120 x 66 x 159 mm",
  "Coldplate material": "Copper",
  "Heatsink material": "Aluminum",
  "Fan specs": "1 x 120mm RGB Fan",
  RGB: "Yes",
};
export const liquid = {
  Model: "Kraken 280 RGB",
  "Cooling Type": "AIO Liquid Cooler",
  Dimensions: "143 x 315 x 30mm",
  "Radiator Material": "Aluminum",
  "Block Material": "Copper and Plastic",
  "Fan specs": "2 x F140 RGB Core Fans",
  RGB: "Yes",
};
export const fan = {
  Model: "F120Q - 120mm Quiet Airflow Fans (Case Version) x1",
  Speed: "500 - 1,200 ± 300 RPM",
  Airflow: "27.77 - 64 CFM",
  "Static Pressure": "0.45 - 1.08 mm - H₂O",
  Noise: "16.7 - 22.5 dBA",
  Dimension: "120 x 180 x 26 mm",
};