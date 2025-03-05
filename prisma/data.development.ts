import { cleanedResults } from "@/app/api/scrape/types";
import { Decimal } from "@prisma/client/runtime/library";

//useful data for testing in development
export const prebuiltForUpload: cleanedResults = {
  rawResults: {
    url: 'test.com',
    prebuilt: {
      customizable: true,
      base_price: "829",
      front_fan_mm: "120",
      rear_fan_mm: "120",
      cpu_cooler_mm: "120",
      cpu_cooler_type: "Air Cooler",
      os: "Windows 11 Home",
      warranty_months: "24",
      wireless: false
    },
    prebuiltParts: {
      psu: "650W Gold 80+ Gold 650 W",
      cpu: "Intel Core i5-13400F",
      case: "NZXT H5 Flow",
      cpu_cooler: "NZXT T120",
      gpu: "NVIDIA GeForce RTX 3050",
      front_fan: "F120Q - 120mm Quiet Airflow Fans (Case Version) x1",
      rear_fan: "F120P Static Pressure Fan x1",
      main_storage: "1TB NVMe M.2 SSD",
      moba: "a chipset",
      ram: "16GB (2 x 8GB) DDR5 5200 MHz (max speed)",
      second_storage: undefined
    },
    specsHtml:
      '[{"specCategory":"Key Specs","specValues":{"Operating System":"Windows 11 Home","CPU":"Intel® Core™ i5-13400F","GPU":"NVIDIA® GeForce RTX™ 3050","RAM":"16GB (2 x 8GB) DDR5 5200 MHz (max speed)","Storage":"1TB NVMe M.2 SSD"}},{"specCategory":"Software","specValues":{"Operating System":"Windows 11 Home","PC Monitoring & Customization":"CAM","Xbox Gamepass":"30 Day Free Trial"}},{"specCategory":"Processor","specValues":{"Base AMD Processor":"AMD Ryzen™ 5 8400F","Base Intel Processor":"Intel® Core™ i5-13400F"}},{"specCategory":"Graphics","specValues":{"Chipset Manufacturer":"NVIDIA® ","Base Graphics Model":"GeForce RTX™ 3050","Upgrade Graphics Model":"GeForce RTX™ 4060"}},{"specCategory":"Memory","specValues":{"Base System Memory":"16 GB (2 × 8GB) DDR5 5200 MHz","Upgrade System Memory":"32GB (4 × 8GB) DDR5 5200 MHz","RGB":"No"}},{"specCategory":"Storage","specValues":{"Model":"Product brand may vary","Base Storage":"1TB NVMe M.2 SSD","Upgrade Storage":"2TB NVMe M.2 SSD"}},{"specCategory":"Motherboard (AMD CPU)","specValues":{"Model":"B650","Form Factor":"ATX","Wi-Fi":"Included"}},{"specCategory":"Motherboard (Intel CPU)","specValues":{"Model":"B760 ","Form Factor":"ATX","Wi-Fi":"Included"}},{"specCategory":"CPU Cooler","specValues":{"Model":"NZXT T120","Cooling type":"Air Cooler","Dimensions":"120 x 66 x 159 mm","Coldplate material":"Copper","Block material":"-","Display Panel Type":"-","Fan specs":"1 x F120P Static Pressure Fan","RGB":"No"}},{"specCategory":"Cooler Fan","specValues":{"Model":"F120P Static Pressure Fan x1","Speed":"500-1,800 ± 300 RPM","Airflow":"21.67 - 78.02 CFM","Static Pressure":"0.75 - 2.7mm-H2O","Noise":"17.9 - 30.6dBA","Dimension":"120 x 120 x 26mm"}},{"specCategory":"Case Fan - Front","specValues":{"Model":"F120Q - 120mm Quiet Airflow Fans (Case Version) x1","Speed":"500 - 1,200 ± 300 RPM","Airflow":"27.77 - 64 CFM","Static Pressure":"0.45 - 1.08 mm - H₂O","Noise":"16.7 - 22.5 dBA","Dimension":"120 x 120 x 26 mm"}},{"specCategory":"Case Fan - Rear","specValues":{"Model":"F120Q - 120mm Quiet Airflow Fans (Case Version) x1","Speed":"500 - 1,200 ± 300 RPM","Airflow":"27.77 - 64 CFM","Static Pressure":"0.45 - 1.08 mm - H₂O","Noise":"16.7 - 22.5 dBA","Dimension":"120 x 120 x 26 mm"}},{"specCategory":"Power","specValues":{"Model":"650W Gold","Wattage":"650 W","Rating":"80+ Gold"}},{"specCategory":"Case","specValues":{"Model":"NZXT H5 Flow","Motherboard Support":"Mini-ITX, MicroATX, ATX","Front I/O":"1x USB 3.2 Gen 1 Type-A / 1x USB 3.2 Gen 2 Type-C / 1x Headset Audio Jack"}},{"specCategory":"Warranty","specValues":{"Manufacturer\'s Warranty - Parts":"2 years","Manufacturer\'s Warranty - Labor":"2 years"}}]',
    images: [
      "https://www.datocms-assets.com/34299/1727324329-player-1-ww-09-04-24-hero-white-badge.png",
      "https://www.datocms-assets.com/34299/1727324327-player-1-ww-09-04-24-side-white.png",
      "https://www.datocms-assets.com/34299/1727324330-player-1-ww-09-04-24-front-white.png",
    ],
    performance: {
        "League of Legends": { R1080P: 200, R1440P: 200, R2160P: 200 },
      },
    name: "Player: One",
    brandName: "NZXT"
  },
  processedResults: {
    base_price: new Decimal(829),
    cpu_cooler_mm: 120,
    cpu_cooler_type: "AIR",
    customizable: true,
    front_fan_mm: 120,
    rear_fan_mm: 120,
    os_id: "1",
    gpu_chipset_id: "1",
    moba_chipset_id: "1",
    main_storage_gb: 1024,
    seconday_storage_gb: null,
    main_storage_type_id: "1",
    memory_modules: 2,
    memory_module_gb: 8,
    memory_speed_id: "1",
    warranty_months: 24,
    psu_efficiency_rating: "GOLD",
    psu_wattage: 650,
    secondary_storage_type_id: undefined,
    wireless: false
  },
};
