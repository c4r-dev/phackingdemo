import './globals.css';

export const metadata = {
  title: "P-Hacking Interactive Demo",
  description: "P-Hacking Interactive Demo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        {children}
      </body>
    </html>
  );
}
