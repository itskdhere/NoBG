"use client";

import { useEffect, useState } from "react";
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

export default function Auth({ type }: { type: "signin" | "signup" }) {
  const router = useRouter();

  const { data: session, isPending, error } = authClient.useSession();

  const [stateGitHub, setStateGitHub] = useState<
    "loading" | "idle" | "processing" | "done" | "error"
  >("idle");

  useEffect(() => {
    if (session) {
      console.log("User session:", session);
      router.push("/app");
    } else if (error) {
      console.error("Authentication error:", error);
      setStateGitHub("error");
    }
  }, [session, error]);

  useEffect(() => {
    if (isPending) {
      setStateGitHub("loading");
    } else {
      setStateGitHub("idle");
    }
  }, [isPending]);

  async function handleGitHubAuth() {
    await authClient.signIn.social(
      {
        provider: "github",
        callbackURL: "/app",
      },
      {
        onRequest() {
          setStateGitHub("processing");
        },
        onSuccess() {
          setStateGitHub("done");
        },
        onError(err) {
          console.error("GitHub authentication error:", err);
          setStateGitHub("error");
        },
      }
    );
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
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex items-center justify-center gap-2 w-full cursor-pointer"
            onClick={handleGitHubAuth}
            disabled={
              stateGitHub === "loading" ||
              stateGitHub === "processing" ||
              stateGitHub === "done"
            }
          >
            <GitHub />
            <span>
              {stateGitHub === "loading" && "Loading..."}
              {stateGitHub === "idle" &&
                (type === "signin"
                  ? "Sign In with GitHub"
                  : "Sign Up with GitHub")}
              {stateGitHub === "processing" &&
                (type === "signin"
                  ? "Signing In with GitHub..."
                  : "Signing Up with GitHub...")}
              {stateGitHub === "done" &&
                (type === "signin"
                  ? "Sign In successful!"
                  : "Sign Up successful!")}
              {stateGitHub === "error" &&
                (type === "signin"
                  ? "Error signing In with GitHub"
                  : "Error signing Up with GitHub")}
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
