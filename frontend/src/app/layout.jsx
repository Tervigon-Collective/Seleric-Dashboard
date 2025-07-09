import PluginInit from "@/helper/PluginInit";
import "./font.css";
import "./globals.css";
import ClientProvider from "@/components/ClientProvider";

export const metadata = {
  title: "NEXT JS - Admin Dashboard Multipurpose Bootstrap 5 Template",
  description:
    "JS is a developer-friendly, ready-to-use admin template designed for building attractive, scalable, and high-performing web applications.",
};

export default function RootLayout({ children }) {
  return (
    <html lang='en'>
      <PluginInit />
      <body suppressHydrationWarning={true}>
        <ClientProvider>
          {children}
        </ClientProvider>
      </body>
    </html>
  );
}
