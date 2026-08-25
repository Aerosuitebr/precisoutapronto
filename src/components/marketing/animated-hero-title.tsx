'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

function AnimatedLine({ text, start = 0, accent = false }: { text: string; start?: number; accent?: boolean }) {
  let characterIndex = start;
  const words = text.split(' ');

  return (
    <span className={accent ? 'hero-title-line block text-[#a9ed42]' : 'hero-title-line block'} aria-hidden="true">
      {words.map((word, wordIndex) => (
        <span key={`${word}-${wordIndex}`} className="inline-block whitespace-nowrap">
          {Array.from(word).map((character) => {
            const index = characterIndex++;
            return (
              <span
                key={`${character}-${index}`}
                className="hero-title-character inline-block"
                style={{ '--hero-character-index': index } as CSSProperties}
              >
                {character}
              </span>
            );
          })}
          {wordIndex < words.length - 1 && <span className="inline-block w-[0.22em]" aria-hidden="true" />}
        </span>
      ))}
    </span>
  );
}

export function AnimatedHeroTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const title = titleRef.current;
    if (!title || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const frame = window.requestAnimationFrame(() => {
      const characters = title.querySelectorAll<HTMLElement>('.hero-title-character');
      characters.forEach((character) => { character.style.animation = 'none'; });
      void title.offsetWidth;
      characters.forEach((character) => { character.style.removeProperty('animation'); });
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <h1
      ref={titleRef}
      className="precisoutapronto-display mt-7 text-[clamp(3rem,7vw,6.6rem)] font-black leading-[0.9] tracking-[-0.055em]"
      aria-label="Orçamento no WhatsApp. Aprovado. Pix recebido."
    >
      <AnimatedLine text="Orçamento no WhatsApp." />
      <AnimatedLine text="Aprovado. Pix recebido." start={20} accent />
    </h1>
  );
}
