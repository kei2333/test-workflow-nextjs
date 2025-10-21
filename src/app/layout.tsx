import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IBM Mainframe Test Workflow System",
  description: "Web-based system for creating drag-and-drop test workflows for IBM mainframes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
