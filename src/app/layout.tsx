import type { Metadata } from "next"
import { inter, notoSansSC, notoSerifSC, jetbrainsMono } from "@/lib/fonts"
import { Logo } from "@/components/Logo"
import { NavLinks } from "@/components/NavLinks"
import { WindLine } from "@/components/WindLine"
import { ThemeToggle } from "@/components/ThemeToggle"
import { AuthProvider } from "@/lib/session"
import "./globals.css"

export const metadata: Metadata = {
  title: "KAIROS · 几",
  description: "万物即将对齐但尚未对齐的那个至高时刻",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-Hans"
      className={`${inter.variable} ${notoSansSC.variable} ${notoSerifSC.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <header
          className="sticky top-0 z-50 px-6 py-3 flex items-center justify-between"
          style={{
            background: 'rgba(7, 7, 8, 0.85)',
            backdropFilter: 'blur(16px) saturate(180%)',
            WebkitBackdropFilter: 'blur(16px) saturate(180%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center gap-2">
            <Logo size="sm" showText />
            <span
              style={{
                fontFamily: 'var(--font-chinese-heading)',
                fontSize: '13px',
                color: 'var(--kairo-whisper)',
                fontWeight: 700,
              }}
            >
              凯洛斯
            </span>
          </div>

          <NavLinks />

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div
              className="w-8 h-8 rounded-full"
              style={{
                background: 'var(--kairo-between)',
                border: '1px solid var(--kairo-emerging)',
              }}
            />
          </div>
        </header>

        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>

        <footer className="py-6 flex flex-col items-center gap-3">
          <WindLine />
          <span
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '11px',
              color: 'var(--kairo-murmur)',
            }}
          >
            KAIROS © 2026
          </span>
        </footer>
      </body>
    </html>
  )
}