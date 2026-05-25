import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import AuthProvider from "@/components/AuthProvider"

export const metadata: Metadata = {
  title: "相続税AI — 相続税シミュレーション・AI相談（無料）",
  description: "家族構成と資産を入力するだけで相続税を3分で試算。累進税率・小規模宅地特例・配偶者控除に対応。条文ベースのAIが節税方法を提案します。完全無料。",
  keywords: ["相続税", "シミュレーション", "計算", "節税", "AI", "無料", "相続", "不動産", "小規模宅地", "配偶者控除"],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "相続税AI",
    title: "相続税AI — 3分で完了する相続税シミュレーション",
    description: "家族構成と資産を入力するだけで相続税を試算。条文ベースのAIが節税方法を提案。完全無料。",
  },
  twitter: {
    card: "summary_large_image",
    title: "相続税AI — 3分で完了する相続税シミュレーション",
    description: "家族構成と資産を入力するだけで相続税を試算。完全無料。",
  },
  robots: "index, follow",
  alternates: {
    canonical: "https://souzoku-ai.com",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "相続税AI",
              "description": "相続税の簡易試算・AI法律相談サービス",
              "applicationCategory": "FinanceApplication",
              "operatingSystem": "ALL",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "JPY",
              },
            }),
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <Header />
          <main className="flex-1 flex">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  )
}
