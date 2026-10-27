import type { ReactNode } from "react";
import { Nav } from "@/components/Nav";
import "./globals.css";

export const metadata = { title: "Practice Tracker" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="brand">
          Practice Tracker<span className="cursor" aria-hidden="true" />
        </div>
        <Nav />
        {children}
      </body>
    </html>
  );
}
