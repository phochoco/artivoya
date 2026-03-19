import FluentEmoji from '@/components/FluentEmoji';

export const metadata = {
  title: 'Contact — 문의 및 협업',
  description: 'Artivoya에 대한 문의, 제휴, 라이선스, 협업 등 다양한 비즈니스 문의를 환영합니다.',
};

export default function ContactPage() {
  return (
    <div className="contact-page">
      <div className="container">
        <div className="contact-grid">
          {/* Left: Info */}
          <div className="contact-info">
            <h1>Contact Us</h1>
            <p>
              Artivoya에 대한 문의, 제휴, 라이선스, 협업 등
              다양한 비즈니스 문의를 환영합니다.
            </p>

            <div className="contact-channels">
              <div className="contact-channel">
                <div className="contact-channel-icon"><FluentEmoji emoji="📧" size={28} /></div>
                <div>
                  <h4>이메일</h4>
                  <p>contact@artivoya.com</p>
                </div>
              </div>
              <div className="contact-channel">
                <div className="contact-channel-icon">▶</div>
                <div>
                  <h4>YouTube</h4>
                  <p>아티보야 공식 채널</p>
                </div>
              </div>
              <div className="contact-channel">
                <div className="contact-channel-icon"><FluentEmoji emoji="🛒" size={28} /></div>
                <div>
                  <h4>쿠팡</h4>
                  <p>Artivoya 공식 스토어</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Form */}
          <div className="contact-form">
            <h3 style={{ marginBottom: 'var(--space-xl)', fontSize: '1.3rem' }}>
              문의하기
            </h3>

            <div className="form-group">
              <label htmlFor="contact-name">이름 / 회사명</label>
              <input
                type="text"
                id="contact-name"
                placeholder="홍길동 / ABC 주식회사"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">이메일</label>
              <input
                type="email"
                id="contact-email"
                placeholder="your@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-type">문의 유형</label>
              <select id="contact-type" defaultValue="">
                <option value="" disabled>
                  선택해주세요
                </option>
                <option value="general">일반 문의</option>
                <option value="collaboration">협업 / 콜라보레이션</option>
                <option value="license">라이선스</option>
                <option value="wholesale">납품 / 대량 구매</option>
                <option value="media">미디어 / 보도</option>
                <option value="other">기타</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">메시지</label>
              <textarea
                id="contact-message"
                placeholder="문의 내용을 자유롭게 작성해주세요."
              />
            </div>

            <button type="button" className="btn btn-primary">
              전송하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
