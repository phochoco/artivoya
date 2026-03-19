'use client';

import { useState } from 'react';
import { faqItems } from '@/data/faq';

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faq-page">
      <div className="container">
        <h1 className="section-title">자주 묻는 질문</h1>
        <p className="section-subtitle">
          Artivoya에 대해 궁금한 점을 확인해보세요
        </p>

        <div className="faq-list">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`faq-item ${openIndex === index ? 'active' : ''}`}
            >
              <button className="faq-question" onClick={() => toggleFaq(index)}>
                <span>{item.question}</span>
                <span className="faq-toggle">+</span>
              </button>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
