import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kakeibo — Mindful Financial Tracker",
  description: "A Japanese Kakeibo method habit & spending tracker. Transition from mindless spending to mindful wealth creation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  if (theme === 'system') {
                    var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
                  } else {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
