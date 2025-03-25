import { PrebuiltWithParts } from "@/app/lib/types";
import { Price } from "@prisma/client";

export default function BestPriceButtons({prices}: {prices: PrebuiltWithParts["product"]["prices"]}) {
    return <div className="flex gap-1 justify-start flex-wrap m-1 mb-2">
        {prices.map((price) => (
            <a
                key={price.id}
                href={price.link}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            >
                {price.store.name}
            </a>
        ))}
    </div>
     
}