import type { Metadata } from "next";
import { Archivo, Big_Shoulders_Stencil, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const stencil = Big_Shoulders_Stencil({
  variable: "--font-stencil",
  subsets: ["latin"],
  weight: ["600", "800", "900"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "INFECTED HUB — Mods de personaje para Left 4 Dead 2",
    template: "%s · INFECTED HUB",
  },
  description:
    "Tienda independiente de mods de personaje para Left 4 Dead 2: supervivientes, infectados y atuendos con licencia. No afiliada a Valve ni a Steam.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${stencil.variable} ${archivo.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-flare focus:px-4 focus:py-2 focus:text-asphalt"
        >
          Saltar al contenido
        </a>
        {children}
      </body>
    </html>
  );
}
