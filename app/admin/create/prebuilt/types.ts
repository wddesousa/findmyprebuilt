export interface foreignValues {
    id: string;
    name: string;
  }
  
 export type prebuiltForeignValues = {
    os_id: foreignValues[];
    gpu_chipset_id: foreignValues[];
    cpu_cooler_type: foreignValues[];
    memory_speed_id: foreignValues[];
    moba_chipset_id: foreignValues[];
    main_storage_type_id: foreignValues[];
    psu_efficiency_rating: foreignValues[];
  };
  