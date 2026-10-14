import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Municipalidad de Los Muermos - Asistente Ciudadano",
  description: "Piloto de Automatización y Conectividad Rural",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}