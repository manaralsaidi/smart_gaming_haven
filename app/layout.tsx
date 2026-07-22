import type { Metadata } from "next";
import "./globals.css";
import { Montserrat } from "next/font/google";
const montserrat = Montserrat({ weight: ["300", "400", "700"], subsets: ["latin"] });
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import QueryProvider from "@/lib/QueryProvider";
export const metadata: Metadata = {
  title: "Gaming Boi",
  description: "this is a gaming website ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={` ${montserrat.className}  dark antialiased`}>
        <QueryProvider>
          <ToastContainer
            position="top-center"
            autoClose={2500}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            pauseOnFocusLoss
            pauseOnHover={false}
            theme="dark"
          />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
