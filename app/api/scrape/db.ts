import { spec } from "node:test/reporters";
import { PrismaModelMap } from "./types";
import prisma from "@/app/db";
import { Prisma, ProductType, PsuRating } from "@prisma/client";

export async function saveCpu(specs: PrismaModelMap["cpu"]) {
  return prisma.cpu.create({
    data: {
      product: {
        create: {
          name: specs.product_name,
          brand: {
            connectOrCreate: {
              where: { name: specs.brand },
              create: { name: specs.brand },
            },
          },
          type: "CPU",
          url: specs.url,
        },
      },
      socket: {
        connectOrCreate: {
          where: { name: specs.socket },
          create: { name: specs.socket },
        },
      },
      part_number: specs.part_number,
      series: specs.series,
      microarchitecture: specs.microarchitecture,
      core_family: specs.core_family,
      core_count: specs.core_count,
      thread_count: specs.thread_count,
      performance_core_clock_ghz: specs.performance_core_clock_ghz,
      performance_core_boost_clock_ghz: specs.performance_core_boost_clock_ghz,
      l2_cache_mb: specs.l2_cache_mb,
      l3_cache_mb: specs.l3_cache_mb,
      tdp_w: specs.tdp_w,
      integrated_graphics: specs.integrated_graphics,
      maximum_supported_memory_gb: specs.maximum_supported_memory_gb,
      ecc_support: specs.ecc_support,
      includes_cooler: specs.includes_cooler,
      packaging: specs.packaging,
      lithography_nm: specs.lithography_nm,
      includes_cpu_cooler: specs.includes_cpu_cooler,
      simultaneous_multithreading: specs.simultaneous_multithreading,
    },
    include: { product: { include: { brand: true } }, socket: true },
  });
}

export async function saveGpu(specs: PrismaModelMap["gpu"]) {
  return prisma.gpu.create({
    data: {
      product: {
        create: {
          name: specs.product_name,
          brand: {
            connectOrCreate: {
              where: { name: specs.brand },
              create: { name: specs.brand },
            },
          },
          type: "GPU",
          url: specs.url,
        },
      },
      part_number: specs.part_number,
      chipset: {
        connectOrCreate: {
          where: { name: specs.chipset_id },
          create: { name: specs.chipset_id },
        },
      },
      memory_gb: specs.memory_gb,
      memory_type: specs.memory_type,
      core_clock_mhz: specs.core_clock_mhz,
      boost_clock_mhz: specs.boost_clock_mhz,
      effective_memory_clock_mhz: specs.effective_memory_clock_mhz,
      interface: specs.interface,
      color: specs.color,
      frame_sync: specs.frame_sync,
      length_mm: specs.length_mm,
      tdp_w: specs.tdp_w,
      case_expansion_slot_width: specs.case_expansion_slot_width,
      total_slot_width: specs.total_slot_width,
      cooling: specs.cooling,
      external_power: specs.external_power,
      hdmi_outputs: specs.hdmi_outputs,
      displayport_outputs: specs.displayport_outputs,
    },
    include: { product: { include: { brand: true } }, chipset: true },
  });
}
export async function saveMoba(specs: PrismaModelMap["moba"]) {
  const data = {
    data: {
      product: {
        create: {
          name: specs.product_name,
          brand: {
            connectOrCreate: {
              where: { name: specs.brand },
              create: { name: specs.brand },
            },
          },
          type: ProductType.MOBA,
          url: specs.url,
        },
      },
      part_number: specs.part_number,
      socket: {
        connectOrCreate: {
          where: { name: specs.socket },
          create: { name: specs.socket },
        },
      },
      moba_form_factor: {
        connectOrCreate: {
          where: { name: specs.moba_form_factor_id },
          create: { name: specs.moba_form_factor_id },
        },
      },
      chipset: {
        connect: {
          name: specs.chipset_id.replace(/Intel|AMD/g, "").trim(),
        },
      },
      memory_max: specs.memory_max,
      memory_speeds: {
        connectOrCreate: specs.memory_speed.map((speed) => ({
          where: {
            ddr_speed: { ddr: speed.ddr, speed: speed.speed },
          },
          create: { ddr: speed.ddr, speed: speed.speed },
        })),
      },
      memory_slots: specs.memory_slots,
      color: specs.color,
      pcie_x16_slots: specs.pcie_x16_slots,
      pcie_x8_slots: specs.pcie_x8_slots,
      pcie_x_slots: specs.pcie_x_slots,
      pcie_x1_slots: specs.pcie_x1_slots,
      pci_slots: specs.pci_slots,
      m_2_slots: {
        create: specs.m_2_slots.map((m2Slot) => ({
          mobaM2Slot: {
            connectOrCreate: {
              where: {
                key_type_size: { key_type: m2Slot.key_type, size: m2Slot.size },
              },
              create: { key_type: m2Slot.key_type, size: m2Slot.size },
            },
          },
        })),
      },
      mini_pcie_slots: specs.mini_pcie_slots,
      half_mini_pcie_slots: specs.half_mini_pcie_slots,
      mini_pcie_msata_slots: specs.mini_pcie_msata_slots,
      msata_slots: specs.msata_slots,
      sata_6_0_gbs: specs.sata_6_0_gbs,
      onboard_ethernet: specs.onboard_ethernet,
      onboard_video: specs.onboard_video,
      usb_2_0_headers: specs.usb_2_0_headers,
      usb_2_0_headers_single_port: specs.usb_2_0_headers_single_port,
      usb_3_2_gen_1_headers: specs.usb_3_2_gen_1_headers,
      usb_3_2_gen_2_headers: specs.usb_3_2_gen_2_headers,
      usb_3_2_gen_2x2_headers: specs.usb_3_2_gen_2x2_headers,
      supports_ecc: specs.supports_ecc,
      wireless_networking: specs.wireless_networking,
      raid_support: specs.raid_support,
      uses_back_connect_connectors: specs.uses_back_connect_connectors,
    },
    include: {
      product: { include: { brand: true } },
      chipset: true,
      m_2_slots: true,
      memory_speeds: true,
      moba_form_factor: true,
      socket: true,
    },
  }
  return prisma.moba.create(data);
}

export async function saveMemory(specs: PrismaModelMap["memory"]) {
  return prisma.memory.create({
    data: {
      product: {
        create: {
          name: specs.product_name,
          brand: {
            connectOrCreate: {
              where: { name: specs.brand },
              create: { name: specs.brand },
            },
          },
          type: "MEMORY",
          url: specs.url,
        },
      },
      part_number: specs.part_number,
      memory_speed: {
        connectOrCreate: {
          where: {
            ddr_speed: {
              ddr: specs.memory_speed.ddr,
              speed: specs.memory_speed.speed,
            },
          },
          create: {
            ddr: specs.memory_speed.ddr,
            speed: specs.memory_speed.speed,
          },
        },
      },
      form_factor: specs.form_factor,
      modules: specs.modules,
      color: specs.color,
      first_word_latency: specs.first_word_latency,
      cas_latency: specs.cas_latency,
      voltage: specs.voltage,
      timing: specs.timing,
      ecc_registered: specs.ecc_registered,
      heat_spreader: specs.heat_spreader,
    },
    include: {
      product: { include: { brand: true } },
      memory_speed: true,
    },
  });
}
export async function saveStorage(specs: PrismaModelMap["storage"]) {
  const data = {
    data: {
      product: {
        create: {
          name: specs.product_name,
          brand: {
            connectOrCreate: {
              where: { name: specs.brand },
              create: { name: specs.brand },
            },
          },
          type: ProductType.STORAGE,
          url: specs.url,
        },
      },
      part_number: specs.part_number,
      storage_type: {
        connectOrCreate: {
          where: { name: specs.storage_type_id },
          create: { name: specs.storage_type_id },
        },
      },
      form_factor: specs.form_factor,
      capacity_gb: specs.capacity_gb,
      interface: specs.interface,
      nvme: specs.nvme,
    },
    include: {
      product: { include: { brand: true } },
      storage_type: true,
    },
  }
  console.log(JSON.stringify(data))
  return prisma.storage.create(data);
}

export async function savePsu(specs: PrismaModelMap["psu"]) {
  const data ={
    data: {
      product: {
        create: {
          name: specs.product_name,
          brand: {
            connectOrCreate: {
              where: { name: specs.brand },
              create: { name: specs.brand },
            },
          },
          type: ProductType.PSU,
          url: specs.url,
        },
      },
      part_number: specs.part_number,
      color: specs.color,
      fanless: specs.fanless,
      atx_4_pin_connectors: specs.atx_4_pin_connectors,
      efficiency_rating: specs.efficiency_rating as PsuRating,
      eps_8_pin_connectors: specs.eps_8_pin_connectors,
      length_mm: specs.length_mm,
      modular: specs.modular,
      type: specs.type,
      wattage_w: specs.wattage_w,
      pcie_12_4_pin_12vhpwr_connectors: specs.pcie_12_4_pin_12vhpwr_connectors,
      pcie_12_pin_connectors: specs.pcie_12_pin_connectors,
      pcie_8_pin_connectors: specs.pcie_8_pin_connectors,
      pcie_6_2_pin_connectors: specs.pcie_6_2_pin_connectors,
      pcie_6_pin_connectors: specs.pcie_6_pin_connectors,
      sata_connectors: specs.sata_connectors,
      molex_4_pin_connectors: specs.molex_4_pin_connectors,
    },
    include: {
      product: { include: { brand: true } },
    },
  }
  return prisma.psu.create(data);
}

export async function saveCase(specs: PrismaModelMap["case"]) {
  const data = {
    data: {
      product: {
        create: {
          name: specs.product_name,
          brand: {
            connectOrCreate: {
              where: { name: specs.brand },
              create: { name: specs.brand },
            },
          },
          type: ProductType.CASE,
          url: specs.url,
        },
      },
      part_number: specs.part_number,
      type: specs.type,
      color: specs.color,
      power_supply: specs.power_supply,
      side_panel: specs.side_panel,
      power_supply_shroud: specs.power_supply_shroud,
      front_panel_usb: specs.front_panel_usb,
      moba_form_factors: {
        connectOrCreate: specs.moba_form_factors.map((form) => ({
          where: { name: form },
          create: { name: form },
        })),
      },
      maximum_video_card_length_mm: specs.maximum_video_card_length_mm,
      drive_bays: specs.drive_bays,
      expansion_slots: specs.expansion_slots,
      volume_ml: specs.volume_ml,
      dimensions: specs.dimensions,
    },
    include: {
      product: { include: { brand: true } },
      moba_form_factors: true,
    },
  }
  return prisma.case.create(data);
}

export async function saveCooler(specs: PrismaModelMap["cooler"]) {
//   const include = Prisma.validator(prisma, 'cooler', 'create', 'include')({
//     cpu_sockets: {
//         orderBy: [{ name: 'asc' }]
//     },
// })
  const data = {
    data: {
      product: {
        create: {
          name: specs.product_name,
          brand: {
            connectOrCreate: {
              where: { name: specs.brand },
              create: { name: specs.brand },
            },
          },
          type: ProductType.COOLER,
          url: specs.url,
        },
      },
      part_number: specs.part_number,
      cpu_sockets: {
        connectOrCreate: specs.cpu_sockets.map((socket) => ({
          where: { name: socket.name },
          create: { name: socket.name },
        })),
      },
      color: specs.color,
      fan_rpm: specs.fan_rpm,
      fanless: specs.fanless,
      height_mm: specs.height_mm,
      water_cooled_radiador_mm: specs.water_cooled_radiador_mm,
    }
  }
  return prisma.cooler.create(data);
}

export async function saveCaseFan(specs: PrismaModelMap["caseFan"]) {
  const data = {
    product: {
      create: {
        name: specs.product_name,
        brand: {
          connectOrCreate: {
            where: { name: specs.brand },
            create: { name: specs.brand },
          },
        },
        type: ProductType.CASEFAN,
        url: specs.url,
      },
    },
    part_number: specs.part_number,
    size_mm: specs.size_mm,
    color: specs.color,
    quantity: specs.quantity,
    airflow: specs.airflow,
    noise_level: specs.noise_level,
    pwm: specs.pwm,
    led: specs.led,
    connector: specs.connector,
    controller: specs.controller,
    static_pressure_mmh2o: specs.static_pressure_mmh2o,
  }

  return prisma.caseFan.create({
    data: data,
    include: {
      product: { include: { brand: true } },
    },
  });
}

export async function upsertBrand(brand: string) {
  return prisma.brand.upsert({
    where: { name: brand },
    update: {},
    create: { name: brand },
  });
}
