"use client";

import { useState } from "react";

// Renders the image, or the striped "image unavailable" block if it fails to load.
export default function ArtImage({
  src, alt, brokenStyle, ...rest
}: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string; brokenStyle?: React.CSSProperties }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div role="img" aria-label={`${alt} (image unavailable)`} className="broken" style={brokenStyle ?? { height: 220 }}>
        <span>image unavailable</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} onError={() => setFailed(true)} {...rest} />;
}
