import { Orbitron } from "next/font/google"; // Import the futuristic font
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["700"] }); // Use bold weight

export const metadata = {
  title: "Random Techno generator",
  description: "Random Techno generator",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={orbitron.className}>{children}</body>
    </html>
  );
}
