import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import AppProviders from "@/context/AppProviders";
import { ThemeProvider } from "@/context/ThemeProvider";
import { ReactScan } from "@/components/ReactScan";
import Analytics from "@/components/background/Analytics";

const workSans = Work_Sans({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-work-sans",
});

export const metadata: Metadata = {
  title: "Petra Vault",
  description: "Non-custodial multisig wallet solution on the Aptos Network",
  openGraph: {
    title: "Petra Vault",
    description: "Non-custodial multisig wallet solution on the Aptos Network",
    images: [{ url: "/og_image.jpeg", width: 1200, height: 630 }],
    url: "https://vault.petra.app",
    type: "website",
    siteName: "Petra Vault",
  },
  twitter: {
    card: "summary_large_image",
    title: "Petra Vault",
    description: "Non-custodial multisig wallet solution on the Aptos Network",
    images: [{ url: "/og_image.jpeg", width: 1200, height: 630 }],
    site: "@PetraWallet",
  },
  metadataBase: new URL("https://vault.petra.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {process.env.NEXT_PUBLIC_ENABLE_REACT_SCAN === "1" && <ReactScan />}
      <AppProviders>
        <body className={`${workSans.variable}`}>
          <ThemeProvider>
            {children}
            <Toaster richColors closeButton />
          </ThemeProvider>
        </body>
        <Analytics />
      </AppProviders>
    </html>
  );
}
