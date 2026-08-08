"use client";

import Link from "next/link";
import Image from "next/image";
import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import { InteractiveHoverButton } from "@workspace/ui/components/interactive-hover-button";
import Footer from "@/components/Footer";
import {
  IconDownload,
  IconCrosshair,
  IconSparkles,
  IconCloud,
  IconUpload,
  IconTournament,
} from "@tabler/icons-react";

export default function Landing() {
  const { data: session, isPending } = authClient.useSession();

  return (
    <>
      <header className="sticky top-0 z-50 w-full px-6 md:px-10 py-2 md:py-4 border-b bg-background/80 backdrop-blur-md">
        <div className="flex justify-center items-center w-full">
          <div className="flex justify-between items-center w-full max-w-4xl">
            <Link
              href="/"
              className="flex justify-between items-center gap-2 hover:opacity-90"
            >
              <Image src="/logo.png" alt="NoBG" width={28} height={28} />
              <h1 className="text-2xl font-bold">NoBG</h1>
            </Link>

            <nav className="flex items-center gap-8 sm:gap-10 text-base font-medium text-muted-foreground">
              <Link
                href="#features"
                className="hover:text-foreground transition-colors"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="hover:text-foreground transition-colors"
              >
                How It Works
              </Link>
            </nav>

            <div className="flex justify-center items-center gap-4">
              <AnimatedThemeToggler className="hover:cursor-pointer" />
              {isPending ? (
                <div className="w-24 h-9 bg-muted/40 rounded-full animate-pulse" />
              ) : session ? (
                <Button
                  variant="default"
                  size="default"
                  className="px-4 rounded-full cursor-pointer"
                  render={<Link href="/app" />}
                  nativeButton={false}
                >
                  Go to App
                </Button>
              ) : (
                <>
                  <Button
                    variant="default"
                    size="default"
                    className="px-4 rounded-full cursor-pointer"
                    render={<Link href="/signup" />}
                    nativeButton={false}
                  >
                    Sign Up
                  </Button>
                  <Button
                    variant="secondary"
                    size="default"
                    className="px-4 rounded-full cursor-pointer"
                    render={<Link href="/signin" />}
                    nativeButton={false}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col justify-center items-center">
        <section className="flex flex-col justify-center items-center h-[calc(100vh-70px)] w-full max-w-4xl">
          <h2 className="text-3xl sm:text-6xl font-bold mt-4">
            <span>Backgrounds, </span>
            <span className="text-muted-foreground">Gone.</span>
          </h2>
          <p className="text-center text-lg sm:text-xl font-semibold mt-6 text-gray-600 dark:text-gray-400">
            The simplest way to isolate your subject. Drag, drop, and download
            in seconds. <br />
            No credit card required.
          </p>
          <Link href={session ? "/app" : "/signup"}>
            <InteractiveHoverButton className="mt-10">
              {session ? "Go to App" : "Get Started Free"}
            </InteractiveHoverButton>
          </Link>
        </section>

        <section
          id="features"
          className="flex flex-col items-center w-full max-w-5xl pt-5 pb-40 scroll-mt-20"
        >
          <h2 className="text-3xl font-bold mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <IconCrosshair size={40} className="text-primary" />
              <h3 className="text-xl font-semibold">Pixel Perfect Accuracy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Powered by advanced AI that handles complex edges like hair and
                fur instantly.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <IconSparkles size={40} className="text-primary" />
              <h3 className="text-xl font-semibold">100% Automatic</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No manual tracing or lasso tools. Just upload and let the model
                do the work.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <IconCloud size={40} className="text-primary" />
              <h3 className="text-xl font-semibold">Instant Cloud Sync</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Access your processed transparent images and edit history
                anytime from your dashboard.
              </p>
            </div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="flex flex-col items-center w-full max-w-5xl pt-10 pb-40 scroll-mt-20"
        >
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-2">
                <IconUpload size={28} />
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Step 1
              </p>
              <h3 className="text-lg font-semibold">Upload</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drop any image with a clear foreground subject.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-2">
                <IconTournament size={28} />
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Step 2
              </p>
              <h3 className="text-lg font-semibold">Process</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our AI detects the subject and removes the background in &lt; 5
                seconds.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-2">
                <IconDownload size={28} />
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Step 3
              </p>
              <h3 className="text-lg font-semibold">Download</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Save your transparent PNG instantly.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center w-full max-w-3xl pt-10 pb-30 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Remove Backgrounds?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            No credit card required. Upload your first image and see the magic.
          </p>
          <Link href={session ? "/app" : "/signup"}>
            <InteractiveHoverButton className="mt-10">
              {session ? "Go to App" : "Get Started — It's Free"}
            </InteractiveHoverButton>
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
