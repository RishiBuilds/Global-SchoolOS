import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/auth-provider";
import { QueryProvider } from "@/providers/query-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "SchoolOS Global — School Management System",
  description:
    "A comprehensive, modern school management system designed to computerize and digitize all school operations.",
  keywords: ["school management", "ERP", "education", "SchoolOS"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-bg-primary text-text-primary">
        <AuthProvider>
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              toastOptions={{
                style: {
                  background: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  color: "#0F172A",
                },
              }}
            />
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
