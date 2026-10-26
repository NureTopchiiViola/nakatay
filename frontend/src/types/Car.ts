export interface CarDetailsData {
  id: string;
  make: string;
  model: string;
  trim: string;
  price: number;
  isAvailable: boolean;
  images: string[];
  exteriorColor: string;
  interiorColor: string;
  specs: {
    year: string;
    engine: string;
    transmission: string;
    mileage: string;
  };
}