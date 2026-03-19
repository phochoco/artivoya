// MS Fluent Emoji 3D 이미지로 네이티브 이모지 대체
const FLUENT_CDN = 'https://raw.githubusercontent.com/microsoft/fluentui-emoji/main/assets';

const EMOJI_MAP = {
  '🤖': `${FLUENT_CDN}/Robot/3D/robot_3d.png`,
  '🐠': `${FLUENT_CDN}/Tropical%20fish/3D/tropical_fish_3d.png`,
  '🧚': `${FLUENT_CDN}/Fairy/3D/fairy_3d.png`,
  '🦁': `${FLUENT_CDN}/Lion/3D/lion_3d.png`,
  '✨': `${FLUENT_CDN}/Sparkles/3D/sparkles_3d.png`,
  '📧': `${FLUENT_CDN}/E-mail/3D/e-mail_3d.png`,
  '🛒': `${FLUENT_CDN}/Shopping%20cart/3D/shopping_cart_3d.png`,
  '🎨': `${FLUENT_CDN}/Artist%20palette/3D/artist_palette_3d.png`,
  '✏️': `${FLUENT_CDN}/Pencil/3D/pencil_3d.png`,
  '🌍': `${FLUENT_CDN}/Globe%20showing%20Europe-Africa/3D/globe_showing_europe-africa_3d.png`,
  '🏆': `${FLUENT_CDN}/Trophy/3D/trophy_3d.png`,
};

export default function FluentEmoji({ emoji, size = 24, className = '', style = {} }) {
  const url = EMOJI_MAP[emoji];

  if (!url) {
    return <span style={{ fontSize: size, ...style }}>{emoji}</span>;
  }

  return (
    <img
      src={url}
      alt={emoji}
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
