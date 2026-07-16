import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist_Mono, IBM_Plex_Sans, Oxanium } from "next/font/google";
import { Providers } from "@/components/providers";
import "@workspace/ui/globals.css";
import { cn } from "@workspace/ui/lib/utils";

const oxaniumHeading = Oxanium({
  subsets: ["latin"],
  variable: "--font-heading",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "NoBG",
  description:
    "The simplest tool to remove image backgrounds. 100% automatic, free, and privacy-focused. Isolate your subject in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${oxaniumHeading.variable} ${ibmPlexSans.variable} ${geistMono.variable} font-sans antialiased `}
      >
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
