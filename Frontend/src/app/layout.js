import { Inter } from "next/font/google";
import "./globals.css";
import bgimage from '../images/i2.jpg'

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  const imageUrl = bgimage.src;
  return (
    <html lang="en">
      <body
        className={`${inter.className} min-h-screen bg-fixed bg-cover bg-center`}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh'
        }}
      >
        {children}
        </body>
    </html>
  );
}
