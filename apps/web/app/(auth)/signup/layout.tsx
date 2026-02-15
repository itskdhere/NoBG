import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | NoBG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
