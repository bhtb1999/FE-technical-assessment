import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hugging Face Prompt Workspace",
  description: "A lightweight AI prompt app built with Next.js and Hugging Face.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
