import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Image Generator",
  description: "Lightning fast AI image generation",
  authors: [{ name: "Sunil Ganta" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} bg-[#0e0d14] text-white min-h-screen flex flex-col`}
      >
        <Analytics />

        {/* Removed Navbar (Nav component removed entirely) */}

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* PAGE CONTENT — centered & moved upward */}
          <main className="flex flex-1 justify-center items-start pt-20">
            {children}
          </main>

          {/* FOOTER at bottom */}
          <footer className="py-6 text-center text-gray-400 text-sm">
            This playground is hosted on{" "}
            <a
              href="https://fal.ai"
              target="_blank"
              className="underline text-gray-300"
            >
              fal.ai
            </a>{" "}
            for demo purposes.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
