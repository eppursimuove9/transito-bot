import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Municipalidad de Purranque - Asistente de Tránsito",
  description: "Piloto de Automatización para Tránsito y Conectividad Rural",
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