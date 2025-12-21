import type { Metadata } from "next";
import { Cormorant_Garamond, Lato } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { ConvexClientProvider } from "./providers/ConvexProvider";
import { AuthProvider } from "./providers/AuthProvider";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300", "400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "COGM Deceased Member Registry | Conference of Grand Masters",
  description: "Honor and memorialize our departed brethren of the Conference of Grand Masters, Prince Hall Masons. Submit tribute information for Most Worthy Grand Masters.",
  keywords: "COGM, Prince Hall Masons, Deceased Members, Memorial, Grand Masters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cormorant.variable} ${lato.variable} antialiased`}
      >
        <ConvexClientProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ConvexClientProvider>
        <Analytics />
      </body>
    </html>
  );
}
