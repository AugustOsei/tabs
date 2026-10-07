"use client";

import { useEffect, useState } from "react";

type Props = {
  /** Absolute URL to share. */
  url: string;
  text: string;
  /** Image to send with the native share sheet and to offer as a download. */
  image?: { src: string; fileName: string };
  className?: string;
};

const pill =
  "inline-flex items-center gap-2 rounded-full border border-gold/70 px-4 py-2 font-mono text-sm text-gold transition-colors hover:bg-gold hover:text-navy";

export default function ShareButtons({ url, text, image, className = "" }: Props) {
  const [canShare, setCanShare] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- browser capability, unknown on the server
    setCanShare(typeof navigator.share === "function");
  }, []);

  async function share() {
    try {
      if (image) {
        const blob = await fetch(image.src).then((r) => (r.ok ? r.blob() : null)).catch(() => null);
        const file = blob && new File([blob], image.fileName, { type: blob.type || "image/png" });
        if (file && navigator.canShare?.({ files: [file] })) {
          await navigator.share({ files: [file], text: `${text} ${url}` });
          return;
        }
      }
      await navigator.share({ text, url });
    } catch {
      // The person closed the share sheet.
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  const message = encodeURIComponent(`${text} ${url}`);
  const links = [
    { label: "WhatsApp", href: `https://wa.me/?text=${message}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "X", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}` },
  ];

  return (
    <div className={`flex flex-wrap gap-2.5 ${className}`}>
      {canShare && (
        <button type="button" onClick={share} className="inline-flex items-center rounded-full bg-gold px-5 py-2 font-display font-extrabold text-navy">
          Share
        </button>
      )}
      {image && (
        <a href={`${image.src}&dl=1`} download={image.fileName} className={pill}>
          Download image
        </a>
      )}
      {links.map((link) => (
        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className={pill}>
          {link.label}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ))}
      <button type="button" onClick={copy} className={pill}>
        <span aria-live="polite">{copied ? "Link copied" : "Copy link"}</span>
      </button>
    </div>
  );
}
