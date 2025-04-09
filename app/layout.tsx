import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });
export const metadata: Metadata = {
  title: "Mazhilunthu Valaithalam",
  description: "A Tamil Valaithalam for Mazhilunthu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} antialiased`}>
          <Header />
          <main className="min-h-screen ">{children}</main>
          <Toaster richColors/>
          <footer className="bg-blue-50 py-12">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>Made with ❤️ by Rajesh</p>
            </div>
          </footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
