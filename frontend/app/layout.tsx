import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lansy.ai — Générateur de CV par IA pour la Tunisie',
  description:
    "Créez un CV professionnel optimisé ATS en 60 secondes. Collez une offre d'emploi, l'IA adapte votre CV automatiquement. 3 tokens gratuits à l'inscription.",
  keywords: ['CV', 'Tunisie', 'IA', 'ATS', 'générateur', 'emploi', 'recrutement'],
  authors: [{ name: 'Lansy.ai' }],
  openGraph: {
    title: 'Lansy.ai — Générateur de CV par IA',
    description: "Votre CV, adapté à chaque offre en 60 secondes.",
    type: 'website',
    locale: 'fr_TN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '8px',
              background: '#0F172A',
              color: '#fff',
              fontSize: '14px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </body>
    </html>
  );
}
