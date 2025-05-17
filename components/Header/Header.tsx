import Image from "next/image";
import Link from "next/link";
import React from "react";
import LogoPng from "@/public/Assets/logo.png";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";
import { ArrowLeft, CarFront, Heart, Layout } from "lucide-react";
import { checkUser } from "@/lib/checkUser";

const Header = async ({ isAdminPage = false }) => {
  const user = await checkUser();
  const isAdmin = user?.role === "ADMIN";
  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
      <nav className="mx-auto px-4 flex items-center justify-between">
        <Link href={isAdminPage ? "/admin" : "/"} className="flex">
          <Image src={LogoPng} alt="Logo" width={200} height={60} />
        </Link>
        <div className="flex items-center gap-4">
          {isAdminPage ? (
            <Link href="/">
              <Button variant={"outline"} className="!cursor-pointer">
                <ArrowLeft size={18} />
                <span className="hidden md:inline ">Back to App</span>
              </Button>
            </Link>
          ) : (
            <SignedIn>
              <Link href="saved-cars" className="cursor-pointer">
                <Button>
                  <CarFront size={18} />
                  <span className="hidden md:inline cursor-pointer">
                    Saved Cars
                  </span>
                </Button>
              </Link>
              {!isAdmin ? (
                <Link href="reservations">
                  <Button variant={"outline"}>
                    <Heart size={18} />
                    <span className="hidden md:inline cursor-pointer">
                      My Reservation
                    </span>
                  </Button>
                </Link>
              ) : (
                <Link href="admin">
                  <Button variant={"outline"}>
                    <Layout size={18} />
                    <span className="hidden md:inline cursor-pointer">
                      Admin Portal
                    </span>
                  </Button>
                </Link>
              )}
            </SignedIn>
          )}

          <SignedOut>
            <SignInButton forceRedirectUrl={"/"}>
              <Button variant={"outline"} className="cursor-pointer">
                Login
              </Button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: {
                    width: "30px",
                    height: "30px",
                  },
                },
              }}
            ></UserButton>
          </SignedIn>
        </div>
      </nav>
    </header>
  );
};

export default Header;
