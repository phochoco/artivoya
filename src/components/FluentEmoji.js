// MS Fluent Emoji 3D — CDN에서 로드
const CDN = 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@latest/assets';

const EMOJI_MAP = {
  // name 키
  'robot':     `${CDN}/Robot/3D/robot_3d.png`,
  'fish':      `${CDN}/Tropical%20fish/3D/tropical_fish_3d.png`,
  'fairy':     `${CDN}/Fairy/3D/fairy_3d.png`,
  'lion':      `${CDN}/Lion/3D/lion_3d.png`,
  'sparkles':  `${CDN}/Sparkles/3D/sparkles_3d.png`,
  'email':     `${CDN}/E-mail/3D/e-mail_3d.png`,
  'cart':      `${CDN}/Shopping%20cart/3D/shopping_cart_3d.png`,
  'palette':   `${CDN}/Artist%20palette/3D/artist_palette_3d.png`,
  'pencil':    `${CDN}/Pencil/3D/pencil_3d.png`,
  'globe':     `${CDN}/Globe%20showing%20Europe-Africa/3D/globe_showing_europe-africa_3d.png`,
  'trophy':    `${CDN}/Trophy/3D/trophy_3d.png`,
  'play':      `${CDN}/Play%20button/3D/play_button_3d.png`,
  // 이모지 문자 → 같은 URL (하위호환)
  '🤖': null, '🐠': null, '🧚': null, '🦁': null, '✨': null,
  '📧': null, '🛒': null, '🎨': null, '✏️': null, '🌍': null, '🏆': null,
};

// 이모지 문자 → name 키 매핑
const EMOJI_TO_NAME = {
  '🤖': 'robot', '🐠': 'fish', '🧚': 'fairy', '🦁': 'lion',
  '✨': 'sparkles', '📧': 'email', '🛒': 'cart', '🎨': 'palette',
  '✏️': 'pencil', '🌍': 'globe', '🏆': 'trophy',
};

export default function FluentEmoji({ name, emoji, size = 24, className = '', style = {} }) {
  // emoji prop (하위호환) 또는 name prop 사용
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
