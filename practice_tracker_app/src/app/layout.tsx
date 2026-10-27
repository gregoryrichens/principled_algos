import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata = { title: "Practice Tracker" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <nav>
          <Link href="/">Today</Link> · <Link href="/log">Log</Link> ·{" "}
          <Link href="/history">History</Link> · <Link href="/import">Import</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
