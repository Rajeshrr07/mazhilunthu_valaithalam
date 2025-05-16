// import { getCarById } from "@/actions/car-listing";
// import { notFound } from "next/navigation";
// import { TestDriveForm } from "./_components/test-drive-form";

// export async function generateMetadata() {
//   return {
//     title: `Book Test Drive | Mazhilunthu`,
//     description: `Schedule a test drive in few seconds`,
//   };
// }

// export default async function TestDrivePage({
//   params,
// }: {
//   params: { id: string };
// }) {
//   // Fetch car details
//   const { id } = params;
//   const result = await getCarById(id);

//   // If car not found, show 404
//   if (!result.success) {
//     notFound();
//   }

//   return (
//     <div className="container mx-auto px-4 py-12">
//       <h1 className="text-6xl mb-6 gradient-title">Book a Test Drive</h1>
//       <TestDriveForm
//         car={result.data}
//         testDriveInfo={result.data.testDriveInfo}
//       />
//     </div>
//   );
// }

import { getCarById } from "@/actions/car-listing";
import { notFound } from "next/navigation";
import { TestDriveForm } from "./_components/test-drive-form";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  return {
    title: `Book Test Drive | Mazhilunthu`,
    description: `Schedule a test drive for car ID ${id} in just a few seconds.`,
  };
}

export default async function TestDrivePage({ params }: PageProps) {
  const { id } = await params;

  // Fetch car details
  const result = await getCarById(id);

  // If car not found, show 404
  if (!result.success || !result.data) {
    notFound();
  }

  // Destructure required car fields
  const {
    id: carId,
    year,
    make,
    model,
    price,
    mileage,
    fuelType,
    transmission,
    bodyType,
    color,
    images,
    testDriveInfo, // exclude from car
  } = result.data;

  const car = {
    id: String(carId),
    year: Number(year),
    make: String(make),
    model: String(model),
    price: Number(price),
    mileage: Number(mileage),
    fuelType: String(fuelType),
    transmission: String(transmission),
    bodyType: String(bodyType),
    color: String(color),
    images: Array.isArray(images) ? images.map(String) : [],
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-6xl mb-6 gradient-title">Book a Test Drive</h1>
      <TestDriveForm car={car} testDriveInfo={testDriveInfo} />
    </div>
  );
}
