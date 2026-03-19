import { series } from '@/data/series';
import FluentEmoji from '@/components/FluentEmoji';

export const metadata = {
  title: 'About — 브랜드 스토리',
  description: 'Artivoya는 단순한 컬러링북을 넘어, 하나의 완성된 작품을 경험하게 하는 프리미엄 컬러링 브랜드입니다.',
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="about-hero">
        <div className="container">
          <h1>About Artivoya</h1>
          <p>
            단순한 선이 아닙니다.
            <br />
            하나의 작품으로 완성되는 경험을 선물합니다.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="about-section">
        <div className="container">
          <div className="about-grid">
            <div className="about-text">
              <h2>왜 Artivoya를 만들었나요?</h2>
              <p>
                우리는 "컬러링"이 단순한 취미를 넘어,
                하나의 작품을 완성하는 과정이 될 수 있다고 믿습니다.
              </p>
              <p>
                정교하고 아름다운 라인아트 위에 자신만의 색을 입히는 것 —
                그 과정에서 느끼는 몰입과 성취감, 그리고 완성된 작품을
                바라보는 뿌듯함. Artivoya는 그 모든 순간을 위해
                만들어졌습니다.
              </p>
              <p>
                각각의 시리즈는 하나의 세계관입니다.
                로봇의 차가운 금속감, 바다의 깊은 푸름,
                요정의 반짝이는 날개, 사파리의 따뜻한 대지 —
                당신이 어떤 세계에 끌리든, Artivoya에서 만나실 수 있습니다.
              </p>
            </div>
            <div className="about-image">
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #E84393 50%, #8B5CF6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '4rem',
                }}
              >
                <FluentEmoji emoji="🎨" size={64} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-section about-values">
        <div className="container">
          <h2 className="section-title">Artivoya가 추구하는 것</h2>
          <p className="section-subtitle">
            우리의 모든 시리즈에 담긴 가치입니다
          </p>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon"><FluentEmoji emoji="✏️" size={36} /></div>
              <h3>정교한 디테일</h3>
              <p>
                하나하나 정성 들여 그린 라인아트.
                세밀한 디테일이 채색의 즐거움을 배가합니다.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon"><FluentEmoji emoji="🌍" size={36} /></div>
              <h3>다양한 세계관</h3>
              <p>
                로봇부터 사파리까지, 매번 새로운 세계를
                탐험하는 듯한 경험을 선사합니다.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon"><FluentEmoji emoji="🏆" size={36} /></div>
              <h3>완성의 감동</h3>
              <p>
                도안이 아닌 "작품"을 만듭니다.
                완성 후의 성취감과 감동이 우리의 목표입니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Series Overview */}
      <section className="about-section">
        <div className="container">
          <h2 className="section-title">시리즈 라인업</h2>
          <p className="section-subtitle">
            계속 확장되는 Artivoya의 세계관
          </p>
          <div className="values-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
            {series.map((s) => (
              <div key={s.id} className="value-card">
                <div className="value-icon"><FluentEmoji emoji={s.icon} size={36} /></div>
                <h3>{s.name}</h3>
                <p>{s.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
