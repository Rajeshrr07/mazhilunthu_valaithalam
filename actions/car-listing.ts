"use server";

import { serializeCarData } from "@/lib/helper";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

interface CarFilters {
  search?: string;
  make?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: "newest" | "priceAsc" | "priceDesc";
  page?: number;
  limit?: number;
}

interface CarFiltersResponse {
  success: boolean;
  data: {
    makes: string[];
    bodyTypes: string[];
    fuelTypes: string[];
    transmissions: string[];
    priceRange: {
      min: number;
      max: number;
    };
  };
}

interface CarsResponse {
  success: boolean;
  data: ReturnType<typeof serializeCarData>[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

interface ToggleSavedCarResponse {
  success: boolean;
  saved?: boolean;
  message?: string;
  error?: string;
}

interface CarDetailsResponse {
  success: boolean;
  data?: ReturnType<typeof serializeCarData> & {
    testDriveInfo: {
      userTestDrive: {
        id: string;
        status: string;
        bookingDate: string;
      } | null;
      dealership: any | null;
    };
  };
  error?: string;
}

interface SavedCarsResponse {
  success: boolean;
  data?: ReturnType<typeof serializeCarData>[];
  error?: string;
}

/**
 * Get simplified filters for the car marketplace
 */
export async function getCarFilters(): Promise<CarFiltersResponse> {
  try {
    // Get unique makes
    const makes = await db.car.findMany({
      where: { status: "AVAILABLE" },
      select: { make: true },
      distinct: ["make"],
      orderBy: { make: "asc" },
    });

    // Get unique body types
    const bodyTypes = await db.car.findMany({
      where: { status: "AVAILABLE" },
      select: { bodyType: true },
      distinct: ["bodyType"],
      orderBy: { bodyType: "asc" },
    });

    // Get unique fuel types
    const fuelTypes = await db.car.findMany({
      where: { status: "AVAILABLE" },
      select: { fuelType: true },
      distinct: ["fuelType"],
      orderBy: { fuelType: "asc" },
    });

    // Get unique transmissions
    const transmissions = await db.car.findMany({
      where: { status: "AVAILABLE" },
      select: { transmission: true },
      distinct: ["transmission"],
      orderBy: { transmission: "asc" },
    });

    // Get min and max prices using Prisma aggregations
    const priceAggregations = await db.car.aggregate({
      where: { status: "AVAILABLE" },
      _min: { price: true },
      _max: { price: true },
    });

    interface PriceRange {
      min: number;
      max: number;
    }

    interface CarFiltersData {
      makes: string[];
      bodyTypes: string[];
      fuelTypes: string[];
      transmissions: string[];
      priceRange: PriceRange;
    }

    interface CarFiltersSuccessResponse {
      success: boolean;
      data: CarFiltersData;
    }

    return {
      success: true,
      data: {
      makes: makes.map((item: { make: string }) => item.make),
      bodyTypes: bodyTypes.map((item: { bodyType: string }) => item.bodyType),
      fuelTypes: fuelTypes.map((item: { fuelType: string }) => item.fuelType),
      transmissions: transmissions.map((item: { transmission: string }) => item.transmission),
      priceRange: {
        min: priceAggregations._min.price
        ? parseFloat(priceAggregations._min.price.toString())
        : 0,
        max: priceAggregations._max.price
        ? parseFloat(priceAggregations._max.price.toString())
        : 100000,
      },
      },
    } as CarFiltersSuccessResponse;
  } catch (error: any) {
    throw new Error("Error fetching car filters:" + error.message);
  }
}

/**
 * Get cars with simplified filters
 */
export async function getCars({
  search = "",
  make = "",
  bodyType = "",
  fuelType = "",
  transmission = "",
  minPrice = 0,
  maxPrice = Number.MAX_SAFE_INTEGER,
  sortBy = "newest",
  page = 1,
  limit = 6,
}: CarFilters): Promise<CarsResponse> {
  try {
    // Get current user if authenticated
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    // Build where conditions
    let where: any = {
      status: "AVAILABLE",
    };

    if (search) {
      where.OR = [
        { make: { contains: search, mode: "insensitive" } },
        { model: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (make) where.make = { equals: make, mode: "insensitive" };
    if (bodyType) where.bodyType = { equals: bodyType, mode: "insensitive" };
    if (fuelType) where.fuelType = { equals: fuelType, mode: "insensitive" };
    if (transmission)
      where.transmission = { equals: transmission, mode: "insensitive" };

    // Add price range
    where.price = {
      gte: parseFloat(minPrice.toString()) || 0,
    };

    if (maxPrice && maxPrice < Number.MAX_SAFE_INTEGER) {
      where.price.lte = parseFloat(maxPrice.toString());
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Determine sort order
    let orderBy = {};
    switch (sortBy) {
      case "priceAsc":
        orderBy = { price: "asc" };
        break;
      case "priceDesc":
        orderBy = { price: "desc" };
        break;
      case "newest":
      default:
        orderBy = { createdAt: "desc" };
        break;
    }

    // Get total count for pagination
    const totalCars = await db.car.count({ where });

    // Execute the main query
    const cars = await db.car.findMany({
      where,
      take: limit,
      skip,
      orderBy,
    });

    // If we have a user, check which cars are wishlisted
    let wishlisted = new Set<string>();
    if (dbUser) {
      const savedCars = await db.userSavedCar.findMany({
        where: { userId: dbUser.id },
        select: { carId: true },
      });

      wishlisted = new Set(savedCars.map((saved:any) => saved.carId));
    }

    // Serialize and check wishlist status
    const serializedCars: ReturnType<typeof serializeCarData>[] = cars.map((car: { id: string }) =>
      serializeCarData(car, wishlisted.has(car.id))
    );

    return {
      success: true,
      data: serializedCars,
      pagination: {
        total: totalCars,
        page,
        limit,
        pages: Math.ceil(totalCars / limit),
      },
    };
  } catch (error: any) {
    throw new Error("Error fetching cars:" + error.message);
  }
}

/**
 * Toggle car in user's wishlist
 */
export async function toggleSavedCar(carId: string): Promise<ToggleSavedCarResponse> {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    // Check if car exists
    const car = await db.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Check if car is already saved
    const existingSave = await db.userSavedCar.findUnique({
      where: {
        userId_carId: {
          userId: user.id,
          carId,
        },
      },
    });

    // If car is already saved, remove it
    if (existingSave) {
      await db.userSavedCar.delete({
        where: {
          userId_carId: {
            userId: user.id,
            carId,
          },
        },
      });

      revalidatePath(`/saved-cars`);
      return {
        success: true,
        saved: false,
        message: "Car removed from favorites",
      };
    }

    // If car is not saved, add it
    await db.userSavedCar.create({
      data: {
        userId: user.id,
        carId,
      },
    });

    revalidatePath(`/saved-cars`);
    return {
      success: true,
      saved: true,
      message: "Car added to favorites",
    };
  } catch (error: any) {
    throw new Error("Error toggling saved car:" + error.message);
  }
}

/**
 * Get car details by ID
 */
// export async function getCarById(carId: string): Promise<CarDetailsResponse> {
//   try {
//     // Get current user if authenticated
//     const { userId } = await auth();
//     let dbUser = null;

//     if (userId) {
//       dbUser = await db.user.findUnique({
//         where: { clerkUserId: userId },
//       });
//     }

//     // Get car details
//     const car = await db.car.findUnique({
//       where: { id: carId },
//     });

//     if (!car) {
//       return {
//         success: false,
//         error: "Car not found",
//       };
//     }

//     // Check if car is wishlisted by user
//     let isWishlisted = false;
//     if (dbUser) {
//       const savedCar = await db.userSavedCar.findUnique({
//         where: {
//           userId_carId: {
//             userId: dbUser.id,
//             carId,
//           },
//         },
//       });

//       isWishlisted = !!savedCar;
//     }

//     // Check if user has already booked a test drive for this car
//     let userTestDrive = null;
//     if (dbUser) {
//       const existingTestDrive = await db.testDriveBooking.findFirst({
//         where: {
//           carId,
//           userId: dbUser.id,
//           status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
//         },
//         orderBy: {
//           createdAt: "desc",
//         },
//       });

//       if (existingTestDrive) {
//         userTestDrive = {
//           id: existingTestDrive.id,
//           status: existingTestDrive.status,
//           bookingDate: existingTestDrive.bookingDate.toISOString(),
//         };
//       }
//     }

//     // Get dealership info for test drive availability
//     const dealership = await db.dealershipInfo.findFirst({
//       include: {
//         workingHours: true,
//       },
//     });

//     return {
//       success: true,
//       data: {
//         ...serializeCarData(car, isWishlisted),
//         testDriveInfo: {
//           userTestDrive,
//           dealership: dealership
//             ? {
//                 ...dealership,
//                 createdAt: dealership.createdAt.toISOString(),
//                 updatedAt: dealership.updatedAt.toISOString(),
//                 workingHours: dealership.workingHours.map((hour:any) => ({
//                   ...hour,
//                   createdAt: hour.createdAt.toISOString(),
//                   updatedAt: hour.updatedAt.toISOString(),
//                 })),
//               }
//             : null,
//         },
//       },
//     };
//   } catch (error: any) {
//     throw new Error("Error fetching car details:" + error.message);
//   }
// }

export async function getCarById(carId: string): Promise<CarDetailsResponse> {
  try {
    // Get current user if authenticated
    const { userId } = await auth();
    let dbUser = null;

    if (userId) {
      dbUser = await db.user.findUnique({
        where: { clerkUserId: userId },
      });
    }

    // Get car details
    const car = await db.car.findUnique({
      where: { id: carId },
    });

    if (!car) {
      return {
        success: false,
        error: "Car not found",
      };
    }

    // Check if car is wishlisted by user
    let isWishlisted = false;
    if (dbUser) {
      const savedCar = await db.userSavedCar.findUnique({
        where: {
          userId_carId: {
            userId: dbUser.id,
            carId,
          },
        },
      });

      isWishlisted = !!savedCar;
    }

    // Check if user has already booked a test drive for this car
    let userTestDrive = null;
    if (dbUser) {
      const existingTestDrive = await db.testDriveBooking.findFirst({
        where: {
          carId,
          userId: dbUser.id,
          status: { in: ["PENDING", "CONFIRMED", "COMPLETED"] },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (existingTestDrive) {
        userTestDrive = {
          id: existingTestDrive.id,
          status: existingTestDrive.status,
          bookingDate: existingTestDrive.bookingDate.toISOString(),
        };
      }
    }

    // Get dealership info for test drive availability
    const dealership = await db.dealershipInfo.findFirst({
      include: {
        workingHours: true,
      },
    });

    // ✅ Await the async serializeCarData function
    const serializedCar = await serializeCarData(car, isWishlisted);

    return {
      success: true,
      data: {
        ...serializedCar,
        testDriveInfo: {
          userTestDrive,
          dealership: dealership
            ? {
                ...dealership,
                createdAt: dealership.createdAt.toISOString(),
                updatedAt: dealership.updatedAt.toISOString(),
                workingHours: dealership.workingHours.map((hour: any) => ({
                  ...hour,
                  createdAt: hour.createdAt.toISOString(),
                  updatedAt: hour.updatedAt.toISOString(),
                })),
              }
            : null,
        },
      },
    };
  } catch (error: any) {
    throw new Error("Error fetching car details: " + error.message);
  }
}

/**
 * Get user's saved cars
 */
export async function getSavedCars(): Promise<SavedCarsResponse> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    // Get the user from our database
    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return {
        success: false,
        error: "User not found",
      };
    }

    // Get saved cars with their details
    const savedCars = await db.userSavedCar.findMany({
      where: { userId: user.id },
      include: {
        car: true,
      },
      orderBy: { savedAt: "desc" },
    });

    // Extract and format car data
    const cars: ReturnType<typeof serializeCarData>[] = savedCars.map((saved: { car: any }) => serializeCarData(saved.car));

    return {
      success: true,
      data: cars,
    };
  } catch (error: any) {
    console.error("Error fetching saved cars:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}