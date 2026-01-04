import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LEXIO - 온라인 보드게임",
  description: "LEXIO를 온라인에서 친구들과 함께 플레이하세요!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

