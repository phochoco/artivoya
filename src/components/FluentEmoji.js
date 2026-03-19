// MS Fluent Emoji 3D — 로컬 저장 (/public/emoji/)
const EMOJI_MAP = {
  'robot':     '/emoji/robot.png',
  'fish':      '/emoji/fish.png',
  'fairy':     '/emoji/fairy.png',
  'lion':      '/emoji/lion.png',
  'sparkles':  '/emoji/sparkles.png',
  'email':     '/emoji/email.png',
  'cart':      '/emoji/cart.png',
  'palette':   '/emoji/palette.png',
  'pencil':    '/emoji/pencil.png',
  'globe':     '/emoji/globe.png',
  'trophy':    '/emoji/trophy.png',
};

// 이모지 문자 → name 키 매핑 (하위호환)
const EMOJI_TO_NAME = {
  '🤖': 'robot', '🐠': 'fish', '🧚': 'fairy', '🦁': 'lion',
  '✨': 'sparkles', '📧': 'email', '🛒': 'cart', '🎨': 'palette',
  '✏️': 'pencil', '🌍': 'globe', '🏆': 'trophy',
};

export default function FluentEmoji({ name, emoji, size = 24, className = '', style = {} }) {
  const key = name || EMOJI_TO_NAME[emoji] || emoji;
  const url = EMOJI_MAP[key];

  if (!url) {
    return <span style={{ fontSize: size, ...style }}>{emoji || key}</span>;
  }

  return (
    <img
      src={url}
      alt={key}
      width={size}
      height={size}
      className={className}
      style={{
        display: 'inline-block',
        verticalAlign: 'middle',
        width: size,
        height: size,
        ...style,
      }}
      loading="lazy"
    />
  );
}
