'use client';

import { useState } from 'react';
import Link from 'next/link';
import { series } from '@/data/series';
import FluentEmoji from '@/components/FluentEmoji';

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobile = () => setMobileOpen(!mobileOpen);
  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="header">
      <div className="header-inner">
        <Link href="/" className="header-logo" onClick={closeMobile}>
          Artivoya
        </Link>

        <nav className="header-nav">
          {series.map((s) => (
            <Link key={s.slug} href={`/${s.slug}`}>
              {s.name}
            </Link>
          ))}
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
        </nav>

        <button
          className={`mobile-menu-btn ${mobileOpen ? 'active' : ''}`}
          onClick={toggleMobile}
          aria-label="메뉴 열기/닫기"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {mobileOpen && (
        <nav className="mobile-nav active">
          <button
            className="mobile-nav-close"
            onClick={closeMobile}
            aria-label="닫기"
          >
            ✕
          </button>

          <div className="mobile-nav-section">
            <span className="mobile-nav-label">시리즈</span>
            {series.map((s) => (
              <Link key={s.slug} href={`/${s.slug}`} onClick={closeMobile}>
                <FluentEmoji name={s.icon} size={20} /> {s.name}
              </Link>
            ))}
          </div>

          <div className="mobile-nav-section">
            <span className="mobile-nav-label">정보</span>
            <Link href="/about" onClick={closeMobile}>About</Link>
            <Link href="/contact" onClick={closeMobile}>Contact</Link>
            <Link href="/faq" onClick={closeMobile}>FAQ</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
