import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import "./tailwind.css";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./components/Header";
import Footer from "./components/Footer";
import FAQ from "./components/FAQ";
import { faqItems } from "./content/faq";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
          <link
            href="./favicon.png"
            rel="icon"
            sizes="80x80"
            type="image/png"
          />
          <Meta />
          <Links />
        </head>
        <body className="font-sans min-w-[740px] bg-slate-900 text-white p-4 py-8">
          <div className="min-h-screen">
            <div className="max-w-4xl mx-auto my-1">
              <Header />
              {children}
              <Footer />
              <FAQ faqItems={faqItems} />
            </div>
          </div>
          <ScrollRestoration />
          <Scripts />
        </body>
      </html>
    </QueryClientProvider>
  );
}

const queryClient = new QueryClient();

export default function App() {
  return (
    <>
      <Outlet />
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          className: "",
          style: {
            background: "linear-gradient(to right, #1f2937, #111827)",
            color: "#ffffff",
            border: "1px solid",
            borderImageSlice: 1,
            borderImageSource: "linear-gradient(to right, #2dd4bf, #f97316)",
            boxShadow: "0 0 15px rgba(45, 212, 191, 0.3)",
            fontFamily: "Iosevka Aile Web",
            fontSize: "14pt",
            borderRadius: "16px",
            padding: "16px",
            maxWidth: "550px",
          },
        }}
      />
    </>
  );
}
