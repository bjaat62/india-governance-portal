import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import { Providers } from "@/components/providers";
import "@/app/globals.css";

const sans = Manrope({
  subsets: ["latin"],
  variable: "--font-sans"
});

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display"
});

export const metadata: Metadata = {
  title: {
    default: "India Governance Portal",
    template: "%s | India Governance Portal"
  },
  description:
    "Modern full-stack governance portal for India's constitutional, political, judicial, defence, and administrative offices.",
  keywords: [
    "India governance",
    "Indian politics",
    "Constitutional offices of India",
    "State government directory",
    "Judiciary and defence directory"
  ]
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
