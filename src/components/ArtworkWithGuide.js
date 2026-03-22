'use client';

import { useState } from 'react';
import ColorPalette from './ColorPalette';
import ColorHighlight from './ColorHighlight';

export default function ArtworkWithGuide({ imageUrl, slug, customTip, children }) {
  const [highlightColor, setHighlightColor] = useState(null);

  return (
    <>
      <div className="artwork-image-wrapper">
        <ColorHighlight imageUrl={imageUrl} highlightColor={highlightColor}>
          {children}
        </ColorHighlight>
      </div>
      <div className="artwork-info-with-guide">
        <ColorPalette
          imageUrl={imageUrl}
          slug={slug}
          customTip={customTip}
          onHighlightColor={setHighlightColor}
        />
      </div>
    </>
  );
}
