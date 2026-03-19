import { Outfit, Noto_Sans_KR } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const notoSansKr = Noto_Sans_KR({
  subsets: ['latin'],
  variable: '--font-noto',
  display: 'swap',
});

export const metadata = {
  title: {
    default: 'Artivoya — 컬러링의 즐거움, 완성의 감동',
    template: '%s | Artivoya',
  },
  description: '로봇, 아쿠아리움, 아이돌요정, 사파리 — 다양한 세계관의 프리미엄 컬러링북 브랜드 Artivoya. 단순한 선이 하나의 작품으로 완성되는 순간을 경험해보세요.',
  keywords: ['컬러링북', '컬러링', 'coloring book', 'Artivoya', '아티보야', '로봇', '아쿠아리움', '아이돌요정', '사파리'],
  authors: [{ name: 'Artivoya' }],
  openGraph: {
    type: 'website',
    locale: 'ko_KR',
    url: 'https://artivoya.com',
    siteName: 'Artivoya',
    title: 'Artivoya — 컬러링의 즐거움, 완성의 감동',
    description: '다양한 세계관의 프리미엄 컬러링북 브랜드',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artivoya — 컬러링의 즐거움, 완성의 감동',
    description: '다양한 세계관의 프리미엄 컬러링북 브랜드',
  },
  metadataBase: new URL('https://artivoya.com'),
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" className={`${outfit.variable} ${notoSansKr.variable}`}>
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
