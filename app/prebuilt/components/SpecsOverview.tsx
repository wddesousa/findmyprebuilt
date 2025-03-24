import { PrebuiltWithParts } from "@/app/lib/types";

export default function SpecsOverview({ prebuilt }: {prebuilt: PrebuiltWithParts}) {
  return (
    <div>
      <ul>
        <li>{prebuilt.cpu.product.name}</li>
      </ul>
    </div>
  );
}
