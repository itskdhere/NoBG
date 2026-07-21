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
import Google from "@/assets/Google";
import GitHub from "@/assets/GitHub";

export default function Auth({ type }: { type: "signin" | "signup" }) {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();

  const [stateGoogle, setStateGoogle] = useState<
    "loading" | "idle" | "processing" | "done" | "error"
  >("idle");
  const [stateGitHub, setStateGitHub] = useState<
    "loading" | "idle" | "processing" | "done" | "error"
  >("idle");

  const buttonStateGoogle = isPending ? "loading" : stateGoogle;
  const buttonStateGitHub = isPending ? "loading" : stateGitHub;

  const isAnyLoading =
    isPending ||
    stateGitHub === "processing" ||
    stateGitHub === "done" ||
    stateGoogle === "processing" ||
    stateGoogle === "done";

  useEffect(() => {
    if (session) {
      console.log("User session:", session);
      router.push("/app");
    }
  }, [session, router]);

  async function handleGoogleAuth() {
    await authClient.signIn.social(
      {
        provider: "google",
        callbackURL: "/app",
      },
      {
        onRequest() {
          setStateGoogle("processing");
        },
        onSuccess() {
          setStateGoogle("done");
        },
        onError(err) {
          console.error("Google authentication error:", err);
          setStateGoogle("error");
        },
      }
    );
  }

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
              ? "Welcome back! Please choose a provider to access your account."
              : "Join us today! Choose a provider to get started."}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col justify-center items-center gap-4 my-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex items-center justify-center gap-2 w-full cursor-pointer"
            onClick={handleGoogleAuth}
            disabled={isAnyLoading}
          >
            <Google />
            <span>
              {buttonStateGoogle === "loading" && "Loading..."}
              {buttonStateGoogle === "idle" &&
                (type === "signin"
                  ? "Sign In with Google"
                  : "Sign Up with Google")}
              {buttonStateGoogle === "processing" &&
                (type === "signin"
                  ? "Signing In with Google..."
                  : "Signing Up with Google...")}
              {buttonStateGoogle === "done" &&
                (type === "signin"
                  ? "Sign In successful! Redirecting..."
                  : "Sign Up successful! Redirecting...")}
              {buttonStateGoogle === "error" &&
                (type === "signin"
                  ? "Error signing In with Google"
                  : "Error signing Up with Google")}
            </span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex items-center justify-center gap-2 w-full cursor-pointer"
            onClick={handleGitHubAuth}
            disabled={isAnyLoading}
          >
            <GitHub />
            <span>
              {buttonStateGitHub === "loading" && "Loading..."}
              {buttonStateGitHub === "idle" &&
                (type === "signin"
                  ? "Sign In with GitHub"
                  : "Sign Up with GitHub")}
              {buttonStateGitHub === "processing" &&
                (type === "signin"
                  ? "Signing In with GitHub..."
                  : "Signing Up with GitHub...")}
              {buttonStateGitHub === "done" &&
                (type === "signin"
                  ? "Sign In successful! Redirecting..."
                  : "Sign Up successful! Redirecting...")}
              {buttonStateGitHub === "error" &&
                (type === "signin"
                  ? "Error signing In with GitHub"
                  : "Error signing Up with GitHub")}
            </span>
          </Button>
        </CardContent>

        <CardFooter>
          {type === "signin" ? (
            <p>
              Don&apos;t have an account?{" "}
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
