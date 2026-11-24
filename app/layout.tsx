import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prueba PDF - SIS Guide",
  description: "Prueba aislada de impresión de flujos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
