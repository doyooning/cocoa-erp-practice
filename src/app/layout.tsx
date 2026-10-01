import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "코코아 ERP",
  description: "코코아 사내 ERP — UiPath 실습용 데모",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
