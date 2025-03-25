import { PrebuiltWithParts } from "@/app/lib/types";
import { getFullName, format, getFullStorage } from "@/app/lib/utils";
const getPartInfo = (
  part: undefined | { name: string; brand: { name: string } },
  genericInfo: string
) => (part ? getFullName(part) : genericInfo);

export default function SpecsOverview({
  prebuilt,
}: {
  prebuilt: PrebuiltWithParts;
}) {
  const mainStorageInfo = getFullStorage(
    prebuilt.main_storage_type,
    prebuilt.main_storage_gb
  );
  const secondaryStorageInfo =
    prebuilt.secondary_storage_type &&
    getFullStorage(
      prebuilt.secondary_storage_type,
      prebuilt.secondary_storage_gb
    );
  return (
    <div>
      <ul>
        <li>Prebuilt price:</li>
        <li>DIY price:</li>
        <li>{getFullName(prebuilt.cpu.product)}</li>
        <li>{prebuilt.gpu_chipset.name}</li>
        <li>{prebuilt.moba_chipset.name} Chipset</li>
        <li>
          {getPartInfo(
            prebuilt.parts?.memory?.product,
            prebuilt.fullMemoryInfo
          )}
        </li>
        <li>{prebuilt.coolingType} Cooling</li>
        <li>{getPartInfo(prebuilt.parts?.psu?.product, prebuilt.psuInfo)}</li>
        <li>
          1 x {getPartInfo(prebuilt.parts?.storage?.product, mainStorageInfo)}
        </li>
        {secondaryStorageInfo && (
          <li>
            1 x{" "}
            {getPartInfo(
              prebuilt.parts?.secondary_storage?.product,
              secondaryStorageInfo
            )}
          </li>
        )}
        <li>{prebuilt.os.name}</li>
        <li>Warranty: {format.month(prebuilt.warranty_months)}</li>
        <li>Customizable: {format.has(prebuilt.customizable)}</li>
      </ul>
    </div>
  );
}
