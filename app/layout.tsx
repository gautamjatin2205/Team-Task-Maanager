import type { Metadata } from "next";
import "../frontend/app/globals.css";

export const metadata: Metadata = {
  title: "Team Task Manager",
  description: "Collaborative project and task management app"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
