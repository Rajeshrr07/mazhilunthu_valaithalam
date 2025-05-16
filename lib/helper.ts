export interface FormatCurrency {
  (amount: number): string;
}

export const formatCurrency: FormatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};
  
  // Helper function to serialize car data
  export interface Car {
    price?: number | string;
    createdAt?: Date;
    updatedAt?: Date;
    [key: string]: string | number | Date | boolean | undefined;
  }

  export interface SerializedCarData extends Omit<Car, 'price' | 'createdAt' | 'updatedAt'> {
    price: number;
    createdAt?: string;
    updatedAt?: string;
    wishlisted: boolean;
  }

  export const serializeCarData = (
    car: Car,
    wishlisted: boolean = false
  ): SerializedCarData => {
    return {
      ...car,
      price: car.price ? parseFloat(car.price.toString()) : 0,
      createdAt: car.createdAt?.toISOString(),
      updatedAt: car.updatedAt?.toISOString(),
      wishlisted: wishlisted,
    };
  };