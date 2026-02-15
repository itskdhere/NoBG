import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | NoBG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
