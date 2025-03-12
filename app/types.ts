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
