"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import GitHub from "@/assets/GitHub";
// import Google from "@/assets/Google.svg";

export default function Auth({ type }: { type: "signin" | "signup" }) {
  const router = useRouter();

  const { data: session, isPending, error } = authClient.useSession();

  useEffect(() => {
    if (session) {
      console.log("User session:", session);
      router.push("/app");
    } else if (error) {
      console.error("Authentication error:", error);
    }
  }, [session, error]);

  // async function handleGoogleAuth() {
  //   await authClient.signIn.social({
  //     provider: "google",
  //     callbackURL: "/app",
  //   });
  // }

  async function handleGitHubAuth() {
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/app",
    });
  }

  return (
    <main className="flex flex-col justify-center items-center gap-6 h-screen w-full">
      <Link
        href="/"
        className="flex justify-between items-center gap-2 hover:opacity-90"
      >
        <Image src="/logo.png" alt="NoBG" width={28} height={28} />
        <h1 className="text-2xl font-bold">NoBG</h1>
      </Link>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            {type === "signin"
              ? "Sign In to Your Account"
              : "Create a New Account"}
          </CardTitle>
          <CardDescription>
            {type === "signin"
              ? "Welcome back! Please enter your credentials to access your account."
              : "Join us today! Create an account to get started."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col justify-center items-center gap-4 my-4">
          {/* <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex items-center justify-center gap-2 w-full cursor-pointer"
            onClick={handleGoogleAuth}
            disabled={isPending}
          >
            <Image src={Google} alt="Google" height={18} width={18} />
            <span>
              {type === "signin"
                ? "Sign in with Google"
                : "Sign up with Google"}
            </span>
          </Button> */}
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex items-center justify-center gap-2 w-full cursor-pointer"
            onClick={handleGitHubAuth}
            disabled={isPending}
          >
            <GitHub />
            <span>
              {type === "signin"
                ? "Sign in with Github"
                : "Sign up with GitHub"}
            </span>
          </Button>
        </CardContent>

        <CardFooter>
          {type === "signin" ? (
            <p>
              Don't have an account?{" "}
              <Link href="/signup" className="underline hover:cursor-pointer">
                Sign Up
              </Link>
            </p>
          ) : (
            <p>
              Already have an account?{" "}
              <Link href="/signin" className="underline hover:cursor-pointer">
                Sign In
              </Link>
            </p>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
