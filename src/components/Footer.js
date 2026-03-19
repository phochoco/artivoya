import Link from 'next/link';
import { series } from '@/data/series';
import FluentEmoji from '@/components/FluentEmoji';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h3>Artivoya</h3>
          <p>
            단순한 선이 하나의 작품으로 완성되는 순간을 경험해보세요.
            <br />
            로봇, 아쿠아리움, 아이돌요정, 사파리 — 다양한 세계관을 색으로 채워보세요.
          </p>
        </div>

        <div className="footer-links">
          <h4>시리즈</h4>
          {series.map((s) => (
            <Link key={s.slug} href={`/${s.slug}`}>
              <FluentEmoji emoji={s.icon} size={16} /> {s.name}
            </Link>
          ))}
        </div>

        <div className="footer-links">
          <h4>사이트</h4>
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/faq">FAQ</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 Artivoya. All rights reserved.</span>
        <div className="footer-social">
          <a
            href="https://www.youtube.com/channel/UC063pY3PTB8q8FewhATKtPw"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
          >
            ▶
          </a>
        </div>
      </div>
    </footer>
  );
}
