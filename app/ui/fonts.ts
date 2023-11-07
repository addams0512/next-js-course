import { Inter, Roboto_Mono, Lusitana } from "next/font/google";

export const fontSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const fontMono = Roboto_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto-mono",
});

export const fontSerif = Lusitana({
  subsets: ["latin"],
  display: "swap",
  weight: "400",
  variable: "--font-lusitana",
});
