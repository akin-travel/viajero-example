'use client';

import { AkinProvider } from '@akin-travel/partner-sdk';
import { Header } from './components/Header';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <title>Viajero Rewards</title>
      </head>
      <body>
        <AkinProvider
          config={{
            partnerId: 'b8a131b2-c40d-42f3-8a23-604d74e99999',
            apiKey: process.env.NEXT_PUBLIC_AKIN_API_KEY!,
            environment: 'development',
            debug: process.env.NODE_ENV === 'development',
            i18n: {
              locale: 'en',
            },
            currency: {
              defaultCurrency: 'USD',
            },
          }}
        >
          <Header />
          <main>{children}</main>
        </AkinProvider>
      </body>
    </html>
  );
}
