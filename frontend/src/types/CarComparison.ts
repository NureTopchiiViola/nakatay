export interface ComparisonCar {
  id: string | number;
  brand: string;
  modelName: string;
  price: number;
  imageUrl?: string;
  specs: {
    year: number | string;
    fuel: string;
    transmission: string;
    bodyType: string;
    [key: string]: string | number; // if i decide to add more specs 
  };
}

export interface SpecDefinition {
  key: string;
  label: string;
}