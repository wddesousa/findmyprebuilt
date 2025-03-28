import { Prisma } from "@prisma/client";
import prisma from "../db";
export type productSearchResult = {
  type: string;
  name: string;
  brand: string;
  slug: string;
  image: string;
  score_3dmark?: number;
};

export type fullProductName = {
  id: string;
  full_name: string;
  brand: string;
  name: string;
};

export interface foreignValues {
  id: string;
  name: string;
}

export const includeProduct = {
  include: {
    product: {
      include: {
        brand: true,
        prices: { orderBy: { price: Prisma.SortOrder.asc, stores: true } },
        images: true,
      },
    },
  },
};
export const includeMobaInfo = Prisma.validator<
  Prisma.Args<typeof prisma.moba, "findFirst">
>()({
  include: {
    m_2_slots: { include: { mobaM2Slot: true } },
    memory_speeds: true,
  },
});

// 1: Define a type that includes the relation to `Post`
export const includePrebuiltParts = Prisma.validator<
  Prisma.Args<typeof prisma.prebuilt, "findFirst">
>()({
  include: {
    cpu: includeProduct,
    main_storage_type: true,
    main_storage_form_factor: true,
    secondary_storage_form_factor: true,
    gpu_chipset: true,
    case_form_factors: true,
    moba_form_factor: true,
    os: true,
    moba_chipset: true,
    product: {
      include: {
        brand: true,
        images: true,
        prices: {
          include: {
            store: true,
          },
        },
      },
    },
    secondary_storage_type: true,
    performance: true,
    parts: {
      include: {
        case: includeProduct,
        moba: {
          include: {
            product: includeProduct.include.product,
            m_2_slots: includeMobaInfo.include?.m_2_slots,
          },
        },
        cooler: includeProduct,
        gpu: includeProduct,
        front_fan: includeProduct,
        psu: includeProduct,
        rear_fan: includeProduct,
        memory: includeProduct,
        storage: includeProduct,
        secondary_storage: includeProduct,
      },
    },
  },
});

// // 2: Define a type that only contains a subset of the scalar fields
// const userPersonalData = Prisma.validator<Prisma.UserDefaultArgs>()({
//   select: { email: true, name: true },
// })

// 3: This type will include a prebuilt and all their parts
export type PrebuiltWithParts = Prisma.Result<
  typeof prisma.prebuilt,
  typeof includePrebuiltParts,
  "findFirstOrThrow"
>;
export type MobaData = Prisma.Result<
  typeof prisma.moba,
  typeof includeMobaInfo,
  "findFirstOrThrow"
>;
