import './globals.css';

export const metadata = {
  title: 'Comms x Triggers – Pago Nube | Resultados',
  description:
    'Resultados de la campaña de Triggers y Comunicaciones por comportamiento in-app para Pago Nube (AR).',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
