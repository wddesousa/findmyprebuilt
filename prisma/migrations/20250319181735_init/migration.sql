-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('GPU', 'CPU', 'MOBA', 'CASE', 'PREBUILT', 'MEMORY', 'STORAGE', 'COOLER', 'PSU', 'CASEFAN');

-- CreateEnum
CREATE TYPE "CpuCoolerType" AS ENUM ('AIR', 'AIO');

-- CreateEnum
CREATE TYPE "DoubleDataRate" AS ENUM ('DDR2', 'DDR3', 'DDR4', 'DDR5', 'DDR6', 'DDR7');

-- CreateEnum
CREATE TYPE "PsuRating" AS ENUM ('TITANIUM', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'NONE');

-- CreateEnum
CREATE TYPE "M2Key" AS ENUM ('M', 'B', 'BM', 'E');

-- CreateEnum
CREATE TYPE "Resolution" AS ENUM ('R1080P', 'R1440P', 'R2160P');

-- CreateEnum
CREATE TYPE "TypeOfEdit" AS ENUM ('ADD', 'REMOVE', 'UPDATE');

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ProductType" NOT NULL,
    "brand_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "url" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_retired" BOOLEAN NOT NULL DEFAULT false,
    "scores" JSONB NOT NULL,
    "total_score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prebuilt" (
    "product_id" TEXT NOT NULL,
    "base_price" DECIMAL(7,2) NOT NULL,
    "memory_modules" INTEGER NOT NULL,
    "memory_module_gb" INTEGER NOT NULL,
    "memory_speed_mhz" INTEGER NOT NULL,
    "main_storage_gb" INTEGER NOT NULL,
    "moba_form_factor_id" TEXT NOT NULL,
    "secondary_storage_gb" INTEGER NOT NULL DEFAULT 0,
    "front_fan_mm" INTEGER NOT NULL,
    "rear_fan_mm" INTEGER NOT NULL,
    "cpu_air_cooler_height_mm" INTEGER NOT NULL DEFAULT 0,
    "cpu_aio_cooler_size_mm" INTEGER NOT NULL DEFAULT 0,
    "os_id" TEXT NOT NULL,
    "wireless" BOOLEAN NOT NULL,
    "psu_wattage" INTEGER NOT NULL,
    "psu_efficiency_rating" "PsuRating" NOT NULL,
    "customizable" BOOLEAN NOT NULL,
    "warranty_months" INTEGER NOT NULL,
    "specs_html" TEXT NOT NULL,
    "moba_chipset_id" TEXT NOT NULL,
    "gpu_chipset_id" TEXT NOT NULL,
    "main_storage_type_id" TEXT NOT NULL,
    "secondary_storage_type_id" TEXT NOT NULL,
    "cpu_id" TEXT NOT NULL,
    "gaming_score_1080p" INTEGER NOT NULL DEFAULT 0,
    "gaming_score_1440p" INTEGER NOT NULL DEFAULT 0,
    "gaming_score_2160p" INTEGER NOT NULL DEFAULT 0,
    "creator_score" INTEGER NOT NULL DEFAULT 0,
    "budget_score" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Prebuilt_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "PrebuiltParts" (
    "prebuilt_id" TEXT NOT NULL,
    "moba_id" TEXT,
    "gpu_id" TEXT,
    "case_id" TEXT,
    "psu_id" TEXT,
    "cooler_id" TEXT,
    "front_fan_id" TEXT,
    "rear_fan_id" TEXT,
    "memory_id" TEXT,
    "storage_id" TEXT,
    "secondary_storage_id" TEXT,

    CONSTRAINT "PrebuiltParts_pkey" PRIMARY KEY ("prebuilt_id")
);

-- CreateTable
CREATE TABLE "StorageType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "StorageType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Storage" (
    "product_id" TEXT NOT NULL,
    "part_number" TEXT[],
    "capacity_gb" INTEGER NOT NULL,
    "storage_type_id" TEXT NOT NULL,
    "form_factor" TEXT NOT NULL,
    "interface" TEXT NOT NULL,
    "nvme" BOOLEAN NOT NULL,

    CONSTRAINT "Storage_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Case" (
    "product_id" TEXT NOT NULL,
    "part_number" TEXT[],
    "type" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "power_supply" BOOLEAN NOT NULL,
    "side_panel" TEXT NOT NULL,
    "power_supply_shroud" BOOLEAN NOT NULL,
    "front_panel_usb" TEXT[],
    "maximum_video_card_length_mm" INTEGER NOT NULL,
    "drive_bays" TEXT[],
    "expansion_slots" TEXT NOT NULL,
    "volume_ml" INTEGER NOT NULL,
    "dimensions" TEXT[],

    CONSTRAINT "Case_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "CaseFan" (
    "product_id" TEXT NOT NULL,
    "part_number" TEXT[],
    "size_mm" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "airflow" TEXT NOT NULL,
    "noise_level" TEXT NOT NULL,
    "pwm" BOOLEAN NOT NULL,
    "led" TEXT NOT NULL,
    "connector" TEXT NOT NULL,
    "controller" TEXT NOT NULL,
    "static_pressure_mmh2o" DECIMAL(3,2) NOT NULL,

    CONSTRAINT "CaseFan_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "FormFactor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "FormFactor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "product_id" TEXT NOT NULL,
    "part_number" TEXT[],
    "form_factor" TEXT NOT NULL,
    "modules" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "first_word_latency" INTEGER NOT NULL,
    "cas_latency" INTEGER NOT NULL,
    "voltage" DECIMAL(3,2) NOT NULL,
    "timing" TEXT NOT NULL,
    "ecc_registered" TEXT NOT NULL,
    "heat_spreader" BOOLEAN NOT NULL,
    "memory_speed_mhz" INTEGER NOT NULL,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Price" (
    "id" TEXT NOT NULL,
    "price" DECIMAL(7,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "store_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "Price_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Store" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "store_region_iso" TEXT NOT NULL,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffiliateInfo" (
    "id" TEXT NOT NULL,
    "store_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "affiliate_id" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "AffiliateInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gpu" (
    "product_id" TEXT NOT NULL,
    "part_number" TEXT[],
    "chipset_id" TEXT NOT NULL,
    "memory_gb" INTEGER NOT NULL,
    "memory_type" TEXT NOT NULL,
    "core_clock_mhz" INTEGER NOT NULL,
    "boost_clock_mhz" INTEGER NOT NULL,
    "effective_memory_clock_mhz" INTEGER NOT NULL,
    "interface" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "frame_sync" TEXT NOT NULL,
    "length_mm" INTEGER NOT NULL,
    "tdp_w" INTEGER NOT NULL,
    "case_expansion_slot_width" INTEGER NOT NULL,
    "total_slot_width" INTEGER NOT NULL,
    "cooling" INTEGER NOT NULL,
    "external_power" TEXT NOT NULL,
    "hdmi_outputs" INTEGER NOT NULL,
    "displayport_outputs" INTEGER NOT NULL,

    CONSTRAINT "Gpu_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "GpuChipset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "score_3dmark" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "GpuChipset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cpu" (
    "product_id" TEXT NOT NULL,
    "part_number" TEXT[],
    "series" TEXT NOT NULL,
    "microarchitecture" TEXT NOT NULL,
    "core_family" TEXT NOT NULL,
    "socket_id" TEXT NOT NULL,
    "core_count" INTEGER NOT NULL,
    "thread_count" INTEGER NOT NULL,
    "performance_core_clock_ghz" DOUBLE PRECISION NOT NULL,
    "performance_core_boost_clock_ghz" DOUBLE PRECISION NOT NULL,
    "l2_cache_mb" INTEGER NOT NULL,
    "l3_cache_mb" INTEGER NOT NULL,
    "tdp_w" INTEGER NOT NULL,
    "integrated_graphics" TEXT NOT NULL,
    "maximum_supported_memory_gb" INTEGER NOT NULL,
    "ecc_support" BOOLEAN NOT NULL,
    "includes_cooler" BOOLEAN NOT NULL,
    "packaging" TEXT NOT NULL,
    "lithography_nm" INTEGER NOT NULL,
    "includes_cpu_cooler" BOOLEAN NOT NULL,
    "simultaneous_multithreading" BOOLEAN NOT NULL,
    "score_3dmark" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Cpu_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Moba" (
    "product_id" TEXT NOT NULL,
    "part_number" TEXT[],
    "socket_id" TEXT NOT NULL,
    "moba_form_factor_id" TEXT NOT NULL,
    "chipset_id" TEXT NOT NULL,
    "memory_max" INTEGER NOT NULL,
    "memory_slots" INTEGER NOT NULL,
    "color" TEXT NOT NULL,
    "pcie_x16_slots" INTEGER NOT NULL,
    "pcie_x8_slots" INTEGER NOT NULL,
    "pcie_x_slots" INTEGER NOT NULL,
    "pcie_x1_slots" INTEGER NOT NULL,
    "pci_slots" INTEGER NOT NULL,
    "mini_pcie_slots" INTEGER NOT NULL,
    "half_mini_pcie_slots" INTEGER NOT NULL,
    "mini_pcie_msata_slots" INTEGER NOT NULL,
    "msata_slots" INTEGER NOT NULL,
    "sata_6_0_gbs" INTEGER NOT NULL,
    "onboard_ethernet" TEXT NOT NULL,
    "onboard_video" TEXT NOT NULL,
    "usb_2_0_headers" INTEGER NOT NULL,
    "usb_2_0_headers_single_port" INTEGER NOT NULL,
    "usb_3_2_gen_1_headers" INTEGER NOT NULL,
    "usb_3_2_gen_2_headers" INTEGER NOT NULL,
    "usb_3_2_gen_2x2_headers" INTEGER NOT NULL,
    "supports_ecc" BOOLEAN NOT NULL,
    "wireless_networking" TEXT NOT NULL,
    "raid_support" BOOLEAN NOT NULL,
    "uses_back_connect_connectors" BOOLEAN NOT NULL,

    CONSTRAINT "Moba_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "MobaChipset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pci_generation" DECIMAL(2,1) NOT NULL,
    "cpu_oc" BOOLEAN NOT NULL,
    "memory_oc" BOOLEAN NOT NULL,
    "max_usb_5_gbps" INTEGER NOT NULL,
    "max_usb_10_gbps" INTEGER NOT NULL,
    "max_usb_20_gbps" INTEGER NOT NULL,
    "max_sata_ports" INTEGER NOT NULL,
    "max_usb_2_gen" INTEGER NOT NULL,
    "usb_4_guaranteed" BOOLEAN,
    "brand_id" TEXT NOT NULL,

    CONSTRAINT "MobaChipset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobaM2Slots" (
    "id" TEXT NOT NULL,
    "key_type" "M2Key" NOT NULL,
    "size" TEXT NOT NULL,

    CONSTRAINT "MobaM2Slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MobaM2SlotsOnMobas" (
    "id" TEXT NOT NULL,
    "moba_id" TEXT NOT NULL,
    "mobaM2Slots_id" TEXT NOT NULL,

    CONSTRAINT "MobaM2SlotsOnMobas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cooler" (
    "product_id" TEXT NOT NULL,
    "part_number" TEXT[],
    "fan_rpm" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "height_mm" INTEGER,
    "water_cooled_radiador_mm" INTEGER,
    "fanless" BOOLEAN NOT NULL,

    CONSTRAINT "Cooler_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "Psu" (
    "product_id" TEXT NOT NULL,
    "part_number" TEXT[],
    "type" TEXT NOT NULL,
    "efficiency_rating" "PsuRating",
    "wattage_w" INTEGER NOT NULL,
    "length_mm" INTEGER NOT NULL,
    "modular" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "fanless" BOOLEAN NOT NULL,
    "atx_4_pin_connectors" INTEGER NOT NULL,
    "eps_8_pin_connectors" INTEGER NOT NULL,
    "pcie_12_4_pin_12vhpwr_connectors" INTEGER NOT NULL,
    "pcie_12_pin_connectors" INTEGER NOT NULL,
    "pcie_8_pin_connectors" INTEGER NOT NULL,
    "pcie_6_2_pin_connectors" INTEGER NOT NULL,
    "pcie_6_pin_connectors" INTEGER NOT NULL,
    "sata_connectors" INTEGER NOT NULL,
    "molex_4_pin_connectors" INTEGER NOT NULL,

    CONSTRAINT "Psu_pkey" PRIMARY KEY ("product_id")
);

-- CreateTable
CREATE TABLE "OperativeSystem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "OperativeSystem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemorySpeedOnMobas" (
    "id" TEXT NOT NULL,
    "speed" INTEGER NOT NULL,
    "moba_id" TEXT NOT NULL,

    CONSTRAINT "MemorySpeedOnMobas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Socket" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Socket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Performance" (
    "id" TEXT NOT NULL,
    "resolution" "Resolution" NOT NULL,
    "game_id" TEXT NOT NULL,
    "prebuilt_id" TEXT NOT NULL,
    "fps" INTEGER NOT NULL,

    CONSTRAINT "Performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewProductQueue" (
    "id" TEXT NOT NULL,
    "website_url" TEXT NOT NULL,
    "scraped_data" JSONB NOT NULL,
    "last_scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "TypeOfEdit" NOT NULL,
    "is_curated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "NewProductQueue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductTracker" (
    "id" TEXT NOT NULL,
    "brand_id" TEXT NOT NULL,
    "current_products_slugs" TEXT[],
    "last_scraped_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "is_main" BOOLEAN NOT NULL,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CaseToFormFactor" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CaseToFormFactor_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_Prebuilt_CaseFormFactors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_Prebuilt_CaseFormFactors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_CoolerToSocket" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoolerToSocket_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Product_url_key" ON "Product"("url");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_is_retired_idx" ON "Product"("is_retired");

-- CreateIndex
CREATE INDEX "Product_slug_idx" ON "Product"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_name_brand_id_key" ON "Product"("name", "brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "Brand_name_key" ON "Brand"("name");

-- CreateIndex
CREATE UNIQUE INDEX "StorageType_name_key" ON "StorageType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "FormFactor_name_key" ON "FormFactor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Price_store_id_product_id_key" ON "Price"("store_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Store_name_key" ON "Store"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateInfo_store_id_product_id_key" ON "AffiliateInfo"("store_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "GpuChipset_name_key" ON "GpuChipset"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MobaChipset_name_key" ON "MobaChipset"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MobaM2Slots_key_type_size_key" ON "MobaM2Slots"("key_type", "size");

-- CreateIndex
CREATE UNIQUE INDEX "OperativeSystem_name_key" ON "OperativeSystem"("name");

-- CreateIndex
CREATE UNIQUE INDEX "MemorySpeedOnMobas_speed_key" ON "MemorySpeedOnMobas"("speed");

-- CreateIndex
CREATE UNIQUE INDEX "Socket_name_key" ON "Socket"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Game_name_key" ON "Game"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Performance_resolution_game_id_prebuilt_id_key" ON "Performance"("resolution", "game_id", "prebuilt_id");

-- CreateIndex
CREATE UNIQUE INDEX "NewProductQueue_website_url_key" ON "NewProductQueue"("website_url");

-- CreateIndex
CREATE UNIQUE INDEX "ProductTracker_brand_id_key" ON "ProductTracker"("brand_id");

-- CreateIndex
CREATE UNIQUE INDEX "Image_product_id_is_main_key" ON "Image"("product_id", "is_main");

-- CreateIndex
CREATE INDEX "_CaseToFormFactor_B_index" ON "_CaseToFormFactor"("B");

-- CreateIndex
CREATE INDEX "_Prebuilt_CaseFormFactors_B_index" ON "_Prebuilt_CaseFormFactors"("B");

-- CreateIndex
CREATE INDEX "_CoolerToSocket_B_index" ON "_CoolerToSocket"("B");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prebuilt" ADD CONSTRAINT "Prebuilt_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prebuilt" ADD CONSTRAINT "Prebuilt_moba_form_factor_id_fkey" FOREIGN KEY ("moba_form_factor_id") REFERENCES "FormFactor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prebuilt" ADD CONSTRAINT "Prebuilt_os_id_fkey" FOREIGN KEY ("os_id") REFERENCES "OperativeSystem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prebuilt" ADD CONSTRAINT "Prebuilt_moba_chipset_id_fkey" FOREIGN KEY ("moba_chipset_id") REFERENCES "MobaChipset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prebuilt" ADD CONSTRAINT "Prebuilt_gpu_chipset_id_fkey" FOREIGN KEY ("gpu_chipset_id") REFERENCES "GpuChipset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prebuilt" ADD CONSTRAINT "Prebuilt_main_storage_type_id_fkey" FOREIGN KEY ("main_storage_type_id") REFERENCES "StorageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prebuilt" ADD CONSTRAINT "Prebuilt_secondary_storage_type_id_fkey" FOREIGN KEY ("secondary_storage_type_id") REFERENCES "StorageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Prebuilt" ADD CONSTRAINT "Prebuilt_cpu_id_fkey" FOREIGN KEY ("cpu_id") REFERENCES "Cpu"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_prebuilt_id_fkey" FOREIGN KEY ("prebuilt_id") REFERENCES "Prebuilt"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_moba_id_fkey" FOREIGN KEY ("moba_id") REFERENCES "Moba"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_gpu_id_fkey" FOREIGN KEY ("gpu_id") REFERENCES "Gpu"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "Case"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_psu_id_fkey" FOREIGN KEY ("psu_id") REFERENCES "Psu"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_cooler_id_fkey" FOREIGN KEY ("cooler_id") REFERENCES "Cooler"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_front_fan_id_fkey" FOREIGN KEY ("front_fan_id") REFERENCES "CaseFan"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_rear_fan_id_fkey" FOREIGN KEY ("rear_fan_id") REFERENCES "CaseFan"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_memory_id_fkey" FOREIGN KEY ("memory_id") REFERENCES "Memory"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_storage_id_fkey" FOREIGN KEY ("storage_id") REFERENCES "Storage"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrebuiltParts" ADD CONSTRAINT "PrebuiltParts_secondary_storage_id_fkey" FOREIGN KEY ("secondary_storage_id") REFERENCES "Storage"("product_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Storage" ADD CONSTRAINT "Storage_storage_type_id_fkey" FOREIGN KEY ("storage_type_id") REFERENCES "StorageType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseFan" ADD CONSTRAINT "CaseFan_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateInfo" ADD CONSTRAINT "AffiliateInfo_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffiliateInfo" ADD CONSTRAINT "AffiliateInfo_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gpu" ADD CONSTRAINT "Gpu_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gpu" ADD CONSTRAINT "Gpu_chipset_id_fkey" FOREIGN KEY ("chipset_id") REFERENCES "GpuChipset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cpu" ADD CONSTRAINT "Cpu_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cpu" ADD CONSTRAINT "Cpu_socket_id_fkey" FOREIGN KEY ("socket_id") REFERENCES "Socket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moba" ADD CONSTRAINT "Moba_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moba" ADD CONSTRAINT "Moba_socket_id_fkey" FOREIGN KEY ("socket_id") REFERENCES "Socket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moba" ADD CONSTRAINT "Moba_moba_form_factor_id_fkey" FOREIGN KEY ("moba_form_factor_id") REFERENCES "FormFactor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moba" ADD CONSTRAINT "Moba_chipset_id_fkey" FOREIGN KEY ("chipset_id") REFERENCES "MobaChipset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobaChipset" ADD CONSTRAINT "MobaChipset_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobaM2SlotsOnMobas" ADD CONSTRAINT "MobaM2SlotsOnMobas_moba_id_fkey" FOREIGN KEY ("moba_id") REFERENCES "Moba"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobaM2SlotsOnMobas" ADD CONSTRAINT "MobaM2SlotsOnMobas_mobaM2Slots_id_fkey" FOREIGN KEY ("mobaM2Slots_id") REFERENCES "MobaM2Slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cooler" ADD CONSTRAINT "Cooler_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Psu" ADD CONSTRAINT "Psu_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemorySpeedOnMobas" ADD CONSTRAINT "MemorySpeedOnMobas_moba_id_fkey" FOREIGN KEY ("moba_id") REFERENCES "Moba"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Performance" ADD CONSTRAINT "Performance_prebuilt_id_fkey" FOREIGN KEY ("prebuilt_id") REFERENCES "Prebuilt"("product_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductTracker" ADD CONSTRAINT "ProductTracker_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "Brand"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseToFormFactor" ADD CONSTRAINT "_CaseToFormFactor_A_fkey" FOREIGN KEY ("A") REFERENCES "Case"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CaseToFormFactor" ADD CONSTRAINT "_CaseToFormFactor_B_fkey" FOREIGN KEY ("B") REFERENCES "FormFactor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Prebuilt_CaseFormFactors" ADD CONSTRAINT "_Prebuilt_CaseFormFactors_A_fkey" FOREIGN KEY ("A") REFERENCES "FormFactor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Prebuilt_CaseFormFactors" ADD CONSTRAINT "_Prebuilt_CaseFormFactors_B_fkey" FOREIGN KEY ("B") REFERENCES "Prebuilt"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoolerToSocket" ADD CONSTRAINT "_CoolerToSocket_A_fkey" FOREIGN KEY ("A") REFERENCES "Cooler"("product_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoolerToSocket" ADD CONSTRAINT "_CoolerToSocket_B_fkey" FOREIGN KEY ("B") REFERENCES "Socket"("id") ON DELETE CASCADE ON UPDATE CASCADE;
