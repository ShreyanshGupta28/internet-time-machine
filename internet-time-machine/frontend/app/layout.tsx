import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import Providers from "@/components/shared/Providers";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Chronos V2 — Internet Time Machine",
  description:
    "An Apple-quality interactive museum of web history. Explore Wayback snapshots inside desktop and mobile viewports with scrubbing timeline, compare retro vs modern layout evolutions, and read real-time Claude-3.5 AI design biographies.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <ClerkProvider>
          <Providers>
            {/* Top Global Navigation Bar */}
            <Navbar />

            {/* Central Page Contents */}
            <main className="flex-1 flex flex-col pt-8 bg-bg-base relative">
              {children}
            </main>

            {/* Bottom Footer Details */}
            <Footer />
          </Providers>
        </ClerkProvider>
      </body>
    </html>
  );
}

