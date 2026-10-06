import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display, Space_Mono, Syne } from "next/font/google";
import SiteFooter from "@/components/SiteFooter";
import { PostHogProvider } from "./providers";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space",
});

export const metadata: Metadata = {
  title: "Hazy — Link in Bio",
  description: "A premium dark glassmorphism link-in-bio hub for creators.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${outfit.variable} ${syne.variable} h-full antialiased`}
    >
      <body
        className={`${inter.variable} ${playfair.variable} ${spaceMono.variable} relative h-full text-foreground`}
      >
        <PostHogProvider>
          {children}
          <SiteFooter />
        </PostHogProvider>
      </body>
    </html>
  );
}
