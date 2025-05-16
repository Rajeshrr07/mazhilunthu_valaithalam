// import { getCarById } from "@/actions/car-listing";
// import { CarDetails } from "./_components/car-details";
// import { notFound } from "next/navigation";
// interface PageProps {
//   params: {
//     id: string;
//   };
// }
// export async function generateMetadata({ params }: PageProps) {
//   const { id } = params;
//   const result = await getCarById(id);

//   if (!result.success) {
//     return {
//       title: "Car Not Found | Mazhilunthu",
//       description: "The requested car could not be found",
//     };
//   }

//   const car = result.data;

//   return {
//     title: `${car.year} ${car.make} ${car.model} | Mazhilunthu`,
//     description: car.description.substring(0, 160),
//     openGraph: {
//       images: car.images?.[0] ? [car.images[0]] : [],
//     },
//   };
// }

// export default async function CarDetailsPage({ params }: PageProps) {
//   // Fetch car details
//   const { id } = params;
//   const result = await getCarById(id);

//   // If car not found, show 404
//   if (!result.success) {
//     notFound();
//   }

//   return (
//     <div className="container mx-auto px-4 py-12">
//       <CarDetails car={result.data} testDriveInfo={result.data.testDriveInfo} />
//     </div>
//   );
// }
import { getCarById } from "@/actions/car-listing";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { CarDetails } from "./_components/car-details";

// Optional: Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const result = await getCarById(params.id);

  if (!result.success || !result.data) {
    return {
      title: "Car Not Found",
    };
  }

  const car = result.data;

  return {
    title: `${car.make} ${car.model} - Car Details`,
    description: (car.description || "").substring(0, 160),
  };
}

// Page Component
export default async function CarPage({ params }: { params: { id: string } }) {
  const result = await getCarById(params.id);

  if (!result.success || !result.data) {
    notFound();
  }

  const car = result.data;

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <CarDetails car={car} testDriveInfo={car.testDriveInfo} />
    </main>
  );
}
