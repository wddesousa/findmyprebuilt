import { Prisma } from "@prisma/client";
import prisma
 from "./db";
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

// 1: Define a type that includes the relation to `Post`
export const includePrebuiltParts = Prisma.validator<Prisma.Args<typeof prisma.prebuilt, 'findFirst'>>()({
  include: { 
    cpu: true,
    main_storage_type: true,
    gpu_chipset: true,
    case_form_factors: true,
    memory_speed: true,
    moba_form_factor: true,
    os: true,
    moba_chipset: true,
    product: {
      include: {
        brand: true,
      }
    },
    secondary_storage_type: true,
    performance: true,
    parts: {
      include: {
        case: true,
        moba: true,
        cooler: true,
        gpu: true,
        front_fan: true,
        psu: true,
        rear_fan: true,
      }
    }
  },
})

// // 2: Define a type that only contains a subset of the scalar fields
// const userPersonalData = Prisma.validator<Prisma.UserDefaultArgs>()({
//   select: { email: true, name: true },
// })

// 3: This type will include a prebuilt and all their parts
export type PrebuiltWithParts = Prisma.PrebuiltGetPayload<typeof includePrebuiltParts>

