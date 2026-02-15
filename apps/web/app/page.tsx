import Link from "next/link";
import Image from "next/image";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { AnimatedThemeToggler } from "@workspace/ui/components/animated-theme-toggler";
import { InteractiveHoverButton } from "@workspace/ui/components/interactive-hover-button";
import {
  Github,
  LoaderPinwheel,
  Download,
  Crosshair,
  Sparkles,
  ShieldCheck,
  Upload,
  ShoppingBag,
  Megaphone,
  UserCircle,
  Palette,
} from "lucide-react";

export default function Landing() {
  return (
    <>
      <header className="absolute w-full px-6 md:px-10 py-2 md:py-4">
        <div className="flex justify-center items-center w-full">
          <div className="flex justify-between items-center w-full max-w-4xl">
            <Link
              href="/"
              className="flex justify-between items-center gap-2 hover:opacity-90"
            >
              <Image src="/logo.png" alt="NoBG" width={28} height={28} />
              <h1 className="text-2xl font-bold">NoBG</h1>
            </Link>

            <div className="flex justify-center items-center gap-4">
              <AnimatedThemeToggler className="hover:cursor-pointer" />
              <Button
                variant="default"
                size="default"
                className="px-4 rounded-full cursor-pointer"
                asChild
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
              <Button
                variant="secondary"
                size="default"
                className="px-4 rounded-full cursor-pointer"
                asChild
              >
                <Link href="/signin">Sign In</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex flex-col justify-center items-center">
        <section className="flex flex-col justify-center items-center h-screen w-full max-w-4xl py-14">
          <Badge
            variant="outline"
            className="font-mono font-medium text-sm px-3 py-1 mt-6"
          >
            v1.0 Now Live
          </Badge>
          <h2 className="text-3xl sm:text-6xl font-bold mt-4">
            <span>Backgrounds, </span>
            <span className="text-muted-foreground">Gone.</span>
          </h2>
          <p className="text-center text-lg sm:text-xl font-semibold mt-6 text-gray-600 dark:text-gray-400">
            The simplest way to isolate your subject. Drag, drop, and download
            in seconds. <br />
            No credit card required.
          </p>
          <Link href="/signup">
            <InteractiveHoverButton className="mt-10">
              Get Started Free
            </InteractiveHoverButton>
          </Link>
        </section>

        <section className="flex flex-col items-center w-full max-w-5xl py-16">
          <h2 className="text-3xl font-bold mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <Crosshair size={40} className="text-primary" />
              <h3 className="text-xl font-semibold">Pixel Perfect Accuracy</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Powered by advanced AI that handles complex edges like hair and
                fur instantly.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <Sparkles size={40} className="text-primary" />
              <h3 className="text-xl font-semibold">100% Automatic</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No manual tracing or lasso tools. Just upload and let the model
                do the work.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <ShieldCheck size={40} className="text-primary" />
              <h3 className="text-xl font-semibold">Privacy First</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Guest images are processed in RAM and deleted immediately. We
                don&apos;t train on your data.
              </p>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center w-full max-w-5xl py-16">
          <h2 className="text-3xl font-bold mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-2">
                <Upload size={28} />
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
                <LoaderPinwheel size={28} />
              </div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Step 2
              </p>
              <h3 className="text-lg font-semibold">Process</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our AI detects the subject and removes the background in &lt; 3
                seconds.
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-3 p-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary mb-2">
                <Download size={28} />
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

        <section className="flex flex-col items-center w-full max-w-5xl py-16">
          <h2 className="text-3xl font-bold mb-12">Use Cases</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            <div className="flex items-start gap-4 rounded-xl border p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">E-Commerce</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Turn product photos into professional catalog shots.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0">
                <Megaphone size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Marketing</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create clean assets for social media and ads.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0">
                <UserCircle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Profile Pics</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remove messy backgrounds for LinkedIn or CVs.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-xl border p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary shrink-0">
                <Palette size={24} />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Designers</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Stop wasting hours masking objects in Photoshop.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex flex-col items-center w-full max-w-3xl py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Remove Backgrounds?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            No sign-up needed. Upload your first image and see the magic.
          </p>
          <Link href="/signup">
            <InteractiveHoverButton className="mt-10">
              Get Started — It&apos;s Free
            </InteractiveHoverButton>
          </Link>
        </section>
      </main>

      <footer className="flex flex-col justify-center items-center gap-2 px-6 md:px-10 py-2 md:py-4 max-h-20 w-full text-sm border-t text-gray-700 dark:text-gray-300">
        <div>
          Developed & Maintained by{" "}
          <Link
            href="https://itskdhere.com"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            KD
          </Link>
        </div>

        <div>
          <Link
            href="https://github.com/itskdhere/NoBG"
            target="_blank"
            rel="noopener noreferrer"
            className="flex justify-center items-center gap-1 underline"
          >
            <Github className="size-3.5" />
            <span>itskdhere/NoBG</span>
          </Link>
        </div>
      </footer>
    </>
  );
}
