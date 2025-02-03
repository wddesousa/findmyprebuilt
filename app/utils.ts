export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


export function capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }