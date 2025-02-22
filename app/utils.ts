import slugify from "slugify";


export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  export const generateSlug = (brand: string, product_name: string) => {
    return slugify(`${brand} ${product_name}`, {lower: true});
  };
  