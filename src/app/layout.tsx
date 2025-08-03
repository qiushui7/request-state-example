import type { Metadata } from "next";
import "./globals.css";
import { SWRProvider } from "@/provider/swr-provider";

export const metadata: Metadata = {
  title: "Request State",
  description: "A modern request state management demo",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SWRProvider>
          {children}
        </SWRProvider>
      </body>
    </html>
  );
}
