export type Cars = {
    id: number;
    make: string;
    model: string;
    year: number;
    price: number;
    images: string[];
    transmission: "Automatic" | "Manual";
    fuelType: "Gasoline" | "Electric" | "Diesel"; // Add more if needed
    bodyType: "Sedan" | "SUV" | "Hatchback" | "Convertible"; // Add more if needed
    mileage: number;
    color: string;
    wishlisted: boolean;
  }[];
