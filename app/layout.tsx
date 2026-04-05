import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CSV Insight Studio v2',
  description: 'Cross-filtered browser-only analytics for CSV datasets.',
};

const themeBootstrapScript = `
(() => {
  try {
    const theme = localStorage.getItem('theme');
    const shouldUseDark = theme ? theme === 'dark' : true;
    document.documentElement.classList.toggle('dark', shouldUseDark);
  } catch {
    document.documentElement.classList.add('dark');
  }
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body className={`${inter.className} bg-zinc-50 text-zinc-950 antialiased dark:bg-zinc-950 dark:text-zinc-100`}>
        {children}
      </body>
    </html>
  );
}
