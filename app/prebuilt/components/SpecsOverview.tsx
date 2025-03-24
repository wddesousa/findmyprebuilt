import { PrebuiltWithParts } from "@/app/lib/types";
import { getFullName } from "@/app/lib/utils";

export default function SpecsOverview({ prebuilt }: {prebuilt: PrebuiltWithParts}) {
  return (
    <div>
      <ul>
        <li>{getFullName(prebuilt.cpu.product)}</li>
      </ul>
    </div>
  );
}
