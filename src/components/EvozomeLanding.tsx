'use client';

import { useEffect, useState, useCallback, useRef, useActionState } from 'react';
import { DEFAULT_CONTENT, type LandingContent } from '@/lib/content';
import { isVideoUrl } from '@/lib/uploads';
import { subscribe, type SubscribeState } from '@/app/actions/subscribe';
import TurnstileWidget from '@/components/TurnstileWidget';

const subscribeInitialState: SubscribeState = {};

/**
 * Evozome full landing page. Section order: nav, hero, resonance chamber,
 * full-bleed image, "build to heal" oversized italic, built-to-heal intro
 * + 4 cards, premium modular structure grid, armadillo feature, outside
 * gallery (click to open lightbox, arrow keys / Escape supported), footer.
 *
 * Scroll reveals + parallax are pure CSS (scroll-driven animations via
 * `animation-timeline`, with an `evoDrift` ambient fallback for browsers
 * without support). JS only toggles the `.evo-in` class via
 * IntersectionObserver and splits heading text into per-letter spans.
 *
 * Copy and images come from `content` (editable at /admin/products) —
 * everything else here is fixed page structure/design.
 */

const HEAL_CARDS = [
  {
    title: 'BUILT TO HEAL',
    weight: 400,
    inter: false,
    small: false,
    more: 'EVERY SURFACE, ANGLE AND MATERIAL IS CHOSEN FOR ITS EFFECT ON THE NERVOUS SYSTEM — NATURAL WOOD FOR WARMTH, CURVED WALLS TO SOFTEN SOUND, AND FILTERED LIGHT THAT SHIFTS WITH THE HOUR. NOTHING IS DECORATIVE; EVERY DETAIL EARNS ITS PLACE BY SUPPORTING REST, FOCUS, OR RECOVERY.',
  },
  {
    title: 'ARMADILLO / 2.0',
    inter: true,
    small: false,
    more: 'THE SECOND-GENERATION SHELL IS BUILT FROM PREFABRICATED PANELS THAT ASSEMBLE ON SITE IN DAYS, NOT MONTHS. ITS DOME GEOMETRY DISTRIBUTES SOUND EVENLY FROM CENTER TO EDGE, SO A SINGLE VOICE OR INSTRUMENT FILLS THE WHOLE SPACE WITHOUT AMPLIFICATION.',
  },
  {
    title: 'OUTSIDE',
    inter: true,
    small: false,
    more: 'THE STRUCTURE IS DESIGNED TO DISAPPEAR INTO ITS SITE — RAISED ON A LIGHT FOOTPRINT, CLAD IN MATERIALS THAT WEATHER WITH THE LANDSCAPE, AND ORIENTED TO FRAME WHATEVER VIEW SURROUNDS IT, WHETHER FOREST, DESERT, OR COASTLINE.',
  },
  {
    title: 'ARCHITECTURE THAT CHANGES HOW YOU EXPERIENCE NATURE AND SOUND',
    inter: true,
    small: true,
    more: 'RESONANCE ARCHITECTURE DRAWS ON PRINCIPLES FOUND IN ANCIENT TEMPLES, CONCERT HALLS, AND SACRED GEOMETRY — WHERE THE SHAPE OF A ROOM IS ITSELF AN INSTRUMENT. EVOZOME APPLIES THE SAME THINKING TO A STRUCTURE YOU CAN BUILD IN YOUR OWN BACKYARD.',
  },
];

function Letters({ text, as: Tag = 'span', style }: { text: string; as?: any; style?: React.CSSProperties }) {
  const lines = text.split('\n');
  let i = 0;
  return (
    <Tag data-letters style={style}>
      {lines.map((line, li) => (
        <span key={li}>
          {li > 0 && <br />}
          {[...line].map((ch) => {
            const delay = (i++ * 0.035).toFixed(3) + 's';
            return (
              <span key={i} style={{ display: 'inline-block', whiteSpace: 'pre', animationDelay: delay }}>
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}

export default function EvozomeLanding({ content = DEFAULT_CONTENT }: { content?: LandingContent }) {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1440);
  const [lightbox, setLightbox] = useState(-1);
  const [openCards, setOpenCards] = useState<Record<number, boolean>>({});
  const [subscribeState, subscribeAction, subscribePending] = useActionState(subscribe, subscribeInitialState);
  const [navOpen, setNavOpen] = useState(false);
  const [healSlide, setHealSlide] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    const onResize = () => setW(window.innerWidth);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const root = document;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add('evo-in')),
      { threshold: 0.2, rootMargin: '0px 0px -8% 0px' }
    );
    root.querySelectorAll('[data-reveal], [data-letters], [data-rule]').forEach((n) => {
      if (n.getBoundingClientRect().bottom < 0) n.classList.add('evo-in');
      io.observe(n);
    });
    const sweep = () => {
      root.querySelectorAll('[data-reveal]:not(.evo-in), [data-letters]:not(.evo-in), [data-rule]:not(.evo-in)').forEach((n) => {
        const r = n.getBoundingClientRect();
        if (r.bottom < 0 || r.top < window.innerHeight) n.classList.add('evo-in');
      });
    };
    window.addEventListener('scroll', sweep, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', sweep);
    };
  }, []);

  const step = useCallback((dir: number) => {
    setLightbox((cur) => (cur < 0 ? cur : (cur + dir + content.gallery.length) % content.gallery.length));
  }, [content.gallery.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (lightbox < 0) return;
      if (e.key === 'Escape') setLightbox(-1);
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, step]);

  const isMobile = w < 760;
  const isTablet = w >= 760 && w < 1100;
  const isNavMobile = w < 769;
  const isNarrow = w <= 1024;
  const twoCol = isMobile ? '1fr' : '1fr 1fr';
  const cardCol = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  const galleryCol = isMobile ? '1fr 1fr' : 'repeat(4, 1fr)';
  const footerCol = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)';
  const heroSrc = isMobile && content.heroImageMobile ? content.heroImageMobile : content.heroImage;
  const armadilloSrc = isMobile && content.armadilloImageMobile ? content.armadilloImageMobile : content.armadilloImage;

  return (
    <div style={{ background: 'rgb(14,15,16)', overflowX: 'hidden', fontFamily: "'Inter', system-ui, sans-serif", color: '#fff' }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Taviraj:ital,wght@0,200;0,300;0,400;0,600;1,200&family=Inter:wght@300;400;700&display=swap');
        a { color: inherit; text-decoration: none; }
        a:hover { opacity: 0.6; }
        @keyframes evoRise { from { opacity: 0; transform: translateY(26px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes evoFade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes evoLetter { from { opacity: 0; transform: translateY(0.4em); } to { opacity: 1; transform: translateY(0); } }
        [data-reveal] { opacity: 0; }
        [data-reveal].evo-in { animation: evoRise 1s cubic-bezier(.22,.61,.36,1) both; }
        [data-letters] span span { opacity: 0; }
        [data-letters].evo-in span span { animation: evoLetter .6s cubic-bezier(.22,.61,.36,1) both; }
        @keyframes evoRiseSlow { from { opacity: 0; transform: translateY(54px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes evoUnveil { from { opacity: 0; clip-path: inset(0 0 100% 0); } to { opacity: 1; clip-path: inset(0 0 0 0); } }
        @keyframes evoWipe { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        [data-reveal="slow"] { opacity: 0; }
        [data-reveal="slow"].evo-in { animation: evoRiseSlow 1.3s cubic-bezier(.22,.61,.36,1) both; }
        [data-reveal="unveil"] { opacity: 0; }
        [data-reveal="unveil"].evo-in { animation: evoUnveil 1.4s cubic-bezier(.22,.61,.36,1) both; }
        [data-rule] { transform: scaleX(0); transform-origin: left; }
        [data-rule].evo-in { animation: evoWipe 1.1s cubic-bezier(.22,.61,.36,1) both; }
        @keyframes evoDrift { 0%, 100% { transform: translate3d(0, -1.6%, 0) scale(1.12); } 50% { transform: translate3d(0, 1.6%, 0) scale(1.12); } }
        [data-parallax] { will-change: transform; animation: evoDrift 22s ease-in-out infinite; }
        [data-parallax-fg] { will-change: transform; }
        @keyframes evoParallaxBg { from { transform: translate3d(0, -8%, 0) scale(1.18); } to { transform: translate3d(0, 8%, 0) scale(1.18); } }
        @keyframes evoParallaxFg { from { transform: translate3d(0, 5%, 0); } to { transform: translate3d(0, -5%, 0); } }
        @keyframes evoParallaxHero { from { transform: translate3d(0, 0, 0) scale(1.14); } to { transform: translate3d(0, 16%, 0) scale(1.14); } }
        @keyframes evoParallaxHeroFg { from { transform: translate3d(0, 0, 0); opacity: 1; } to { transform: translate3d(0, -14%, 0); opacity: 0.5; } }
        @supports (animation-timeline: scroll()) {
          [data-parallax-hero] { animation: evoParallaxHero linear both; animation-timeline: scroll(root block); animation-range: 0 100vh; }
          [data-parallax-hero-fg] { animation: evoParallaxHeroFg linear both; animation-timeline: scroll(root block); animation-range: 0 100vh; }
        }
        @supports (animation-timeline: view()) {
          [data-parallax] { animation: evoParallaxBg linear both; animation-timeline: view(); animation-range: cover 0% cover 100%; }
          [data-parallax-fg] { animation: evoParallaxFg linear both; animation-timeline: view(); animation-range: cover 0% cover 100%; }
        }
        [data-zoom] { overflow: hidden; }
        [data-zoom] img { transition: transform 1.1s cubic-bezier(.22,.61,.36,1), filter .8s ease; }
        [data-zoom]:hover img { transform: scale(1.06); filter: brightness(1.06); }
        .evo-more { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .45s cubic-bezier(.22,.61,.36,1); }
        .evo-more.evo-open { grid-template-rows: 1fr; }
        .evo-more > div { overflow: hidden; }
        @media (prefers-reduced-motion: reduce) {
          [data-parallax], [data-parallax-fg] { animation: none !important; transform: none !important; }
          [data-reveal], [data-letters] span span, [data-rule] { opacity: 1 !important; transform: none !important; clip-path: none !important; animation: none !important; }
        }
      `}</style>

      {/* NAV */}
      <header style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: isNavMobile ? 'space-between' : undefined, padding: '34px clamp(24px,4vw,64px)', background: 'transparent' }}>
        {isNavMobile ? (
          <>
            <a href="#" aria-label="Evozome" style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/evozome/logo-light.png" alt="" width={38} height={38} style={{ width: 38, height: 38, display: 'block' }} />
              <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.22em', lineHeight: 0.87 }}>EVOZOME</span>
            </a>
            <button
              type="button"
              onClick={() => setNavOpen(true)}
              aria-label="Open menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 6, fontWeight: 700, fontSize: 18, lineHeight: 0.87 }}
            >
              MENU
            </button>
          </>
        ) : (
          <>
            <nav style={{ flex: 1, display: 'flex', justifyContent: 'flex-start', gap: 'clamp(20px,4vw,58px)', fontWeight: 700, fontSize: 18, lineHeight: 0.87 }}>
              <a href="#">HOME</a>
              <a href="#about">ABOUT</a>
              <a href="#built-to-heal">BUILT TO HEAL</a>
            </nav>
            <a href="#" aria-label="Evozome" style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, padding: '0 clamp(18px,3vw,44px)' }}>
              <img src="/evozome/logo-light.png" alt="" width={30} height={30} style={{ width: 30, height: 30, display: 'block' }} />
              <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.22em', lineHeight: 0.87 }}>EVOZOME</span>
            </a>
            <nav style={{ flex: 1, display: 'flex', justifyContent: 'flex-end', gap: 'clamp(20px,4vw,58px)', fontWeight: 700, fontSize: 18, lineHeight: 0.87 }}>
              <a href="#contact">CONTACT</a>
            </nav>
          </>
        )}
      </header>

      {/* MOBILE NAV OVERLAY */}
      {isNavMobile && navOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgb(14,15,16)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '34px clamp(24px,4vw,64px)' }}>
            <a href="#" aria-label="Evozome" onClick={() => setNavOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="/evozome/logo-light.png" alt="" width={38} height={38} style={{ width: 38, height: 38, display: 'block' }} />
              <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.22em', lineHeight: 0.87 }}>EVOZOME</span>
            </a>
            <button
              type="button"
              onClick={() => setNavOpen(false)}
              aria-label="Close menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fff', padding: 6 }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>
          <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28, fontFamily: "'Taviraj', serif", fontWeight: 400, fontSize: 'clamp(32px,8vw,52px)' }}>
            <a href="#" onClick={() => setNavOpen(false)}>HOME</a>
            <a href="#about" onClick={() => setNavOpen(false)}>ABOUT</a>
            <a href="#built-to-heal" onClick={() => setNavOpen(false)}>BUILT TO HEAL</a>
            <a href="#contact" onClick={() => setNavOpen(false)}>CONTACT</a>
          </nav>
        </div>
      )}

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '140px clamp(24px,4vw,64px) 80px', overflow: 'hidden' }}>
        {isVideoUrl(heroSrc) ? (
          <video
            key={heroSrc}
            src={heroSrc}
            autoPlay
            muted
            loop
            playsInline
            data-parallax
            data-parallax-hero
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img src={heroSrc} alt="" data-parallax data-parallax-hero style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(rgba(4,12,17,0.22), rgba(4,12,17,0.4))' }} />
        <div
          style={
            isMobile
              ? { position: 'absolute', top: '80vh', left: 0, right: 0, transform: 'translateY(-50%)', textAlign: 'center', padding: '0 clamp(24px,4vw,64px)' }
              : { position: 'relative', textAlign: 'center', maxWidth: 1513 }
          }
        >
          {/* data-parallax-fg/-hero-fg drive a CSS scroll animation on `transform`,
              which would override the positioning transform above if placed on the
              same element — kept on this inner wrapper instead so both apply. */}
          <div data-parallax-fg data-parallax-hero-fg>
            <div style={{ fontFamily: "'Taviraj', serif", fontWeight: 200, fontStyle: 'italic', fontSize: 'clamp(38px,6.4vw,80px)', lineHeight: 1.03, textWrap: 'pretty' as any, maxWidth: 950, margin: '0 auto', animation: 'evoRise 1s cubic-bezier(.22,.61,.36,1) both' }}>
              {content.heroTitle}
            </div>
            <div style={{ fontWeight: 400, fontSize: 'clamp(15px,1.4vw,21px)', lineHeight: 1.17, marginTop: 'clamp(24px,3vw,44px)', letterSpacing: '0.02em', animation: 'evoRise 1s cubic-bezier(.22,.61,.36,1) .25s both' }}>
              {content.heroSubtitle.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* INTRO STATEMENT */}
      <section style={{ position: 'relative', background: 'rgb(14,15,16)', padding: 'clamp(90px,13vw,180px) clamp(24px,4vw,64px)', overflow: 'hidden' }}>
        {!isNarrow && (
          <div data-reveal="unveil" style={{ position: 'absolute', left: isMobile ? 20 : 100, top: isMobile ? 300 : 600, width: isMobile ? 192 : 385 }}>
            <img src={content.introImageLeft} alt="" data-parallax-fg style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        )}
        {!isMobile && (
          <div data-reveal="unveil" style={{ position: 'absolute', right: 60, top: 100, width: 385, animationDelay: '.12s' }}>
            <img src={content.introImageRight} alt="" data-parallax-fg style={{ width: '100%', height: 'auto', display: 'block' }} />
          </div>
        )}
        <div style={{ position: 'relative', maxWidth: 1400, margin: '0 auto', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'clamp(22px,3vw,34px)' }}>
          {!isNarrow && (
            <div data-reveal style={{ fontWeight: 400, fontSize: 21, letterSpacing: '0.14em', lineHeight: 1.4, animationDelay: '.05s' }}>
              {content.introLabel.split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </div>
          )}
          <div data-reveal="slow" style={{ fontFamily: "'Taviraj', serif", fontWeight: 200, fontSize: 'clamp(34px,9vw,100px)', lineHeight: 1.15, animationDelay: '.1s' }}>
            {content.introStatement}
          </div>
          <a
            href="#contact"
            data-reveal
            style={{ display: 'inline-flex', alignItems: 'center', gap: 12, border: '1px solid rgb(226,224,213)', borderRadius: 0, padding: '15px 30px', fontWeight: 700, fontSize: 14, letterSpacing: '0.12em', animationDelay: '.2s' }}
          >
            CONTACT US <span aria-hidden>→</span>
          </a>
        </div>
      </section>

      {/* RESONANCE CHAMBER */}
      <section id="about" style={{ background: 'rgb(14,15,16)', color: '#fff', padding: 'clamp(80px,10vw,150px) clamp(24px,4vw,64px)' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'grid', gridTemplateColumns: twoCol, gap: 'clamp(40px,6vw,90px)', alignItems: 'end' }}>
          <Letters text={'ARMADILLO\n2.0'} as="h2" style={{ fontFamily: "'Taviraj', serif", fontWeight: 400, fontStyle: 'italic', fontSize: 'clamp(46px,7vw,100px)', lineHeight: 1.03, margin: 0 }} />
          <p data-reveal style={{ fontWeight: 400, fontSize: 18, lineHeight: 1.17, margin: 0, maxWidth: 651, animationDelay: '.15s' }}>
            {content.resonanceText}
          </p>
        </div>
        <div style={{ maxWidth: 1600, margin: 'clamp(56px,7vw,100px) auto 0', display: 'grid', gridTemplateColumns: twoCol, gap: 'clamp(18px,2vw,28px)' }}>
          <div data-reveal="unveil" data-zoom style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden' }}>
            <img src={content.resonanceImage1} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <span style={{ position: 'absolute', top: 24, left: 24, fontWeight: 700, fontSize: 36, lineHeight: 0.87, color: '#fff' }}>
              INSIDE
            </span>
          </div>
          <div data-reveal="unveil" data-zoom style={{ position: 'relative', aspectRatio: '4 / 3', overflow: 'hidden', animationDelay: '.14s' }}>
            <img src={content.resonanceImage2} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <span style={{ position: 'absolute', top: 24, left: 24, fontWeight: 700, fontSize: 36, lineHeight: 0.87, color: '#fff' }}>
              OUTSIDE
            </span>
          </div>
        </div>
      </section>

      {/* BUILD TO HEAL (oversized italic) */}
      <section
        style={{
          position: 'relative',
          minHeight: isMobile ? undefined : 'clamp(440px,76vh,900px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgb(14,15,16)',
          padding: isMobile ? 'clamp(40px,6vh,64px) 0 clamp(48px,7vh,72px)' : '0 0 clamp(90px,12vh,160px)',
        }}
      >
        <div style={{ position: 'relative', width: '100%', fontFamily: "'Taviraj', serif", fontWeight: 200, fontStyle: 'italic', fontSize: 'clamp(64px,15.5vw,300px)', lineHeight: 1.03, padding: '0 clamp(24px,4vw,64px)' }}>
          <div style={{ textAlign: 'left' }}>BUILD TO</div>
          <div style={{ textAlign: 'right' }}>HEAL</div>
        </div>
        <p
          data-reveal
          style={
            isMobile
              ? { position: 'relative', marginTop: 32, padding: '0 clamp(24px,4vw,64px)', fontWeight: 400, fontSize: 18, lineHeight: 1.17, maxWidth: 651 }
              : { position: 'absolute', left: 'clamp(24px,4vw,64px)', bottom: 'clamp(24px,4vw,64px)', fontWeight: 400, fontSize: 18, lineHeight: 1.17, margin: 0, maxWidth: 651 }
          }
        >
          {content.resonanceText}
        </p>
      </section>

      {/* ARMADILLO 2.0 FEATURE */}
      <section style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}>
        {isVideoUrl(armadilloSrc) ? (
          <video
            key={armadilloSrc}
            src={armadilloSrc}
            autoPlay
            muted
            loop
            playsInline
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <img src={armadilloSrc} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        )}
        <span style={{ position: 'absolute', top: 24, left: 24, fontWeight: 700, fontSize: 36, lineHeight: 0.87, color: '#fff' }}>
          ARMADILLO / 2.0
        </span>
        <span style={{ position: 'absolute', bottom: 24, left: 24, fontWeight: 400, fontSize: 18, lineHeight: 1.17, color: '#fff', maxWidth: 400 }}>
          ARCHITECTURE THAT CHANGES HOW YOU EXPERIENCE NATURE AND SOUND
        </span>
      </section>

      {/* RESONANCE CHAMBER WINDOW */}
      <section style={{ background: '#E2E0D5', color: 'rgb(14,15,16)', padding: 'clamp(80px,10vw,150px) clamp(24px,4vw,64px)' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'grid', gridTemplateColumns: twoCol, gap: 'clamp(40px,6vw,90px)', alignItems: 'start' }}>
          <Letters text={'RESONANCE\nCHAMBER'} as="div" style={{ fontFamily: "'Taviraj', serif", fontWeight: 400, fontSize: 'clamp(48px,7.2vw,102px)', lineHeight: 0.86 }} />
          <div data-reveal="unveil" data-zoom style={{ display: 'grid', gridTemplateColumns: twoCol, animationDelay: '.1s' }}>
            <div style={{ overflow: 'hidden', aspectRatio: isMobile ? '4 / 3' : undefined }}>
              <img src={content.windowImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ background: 'rgb(14,15,16)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: 'clamp(32px,4vw,48px)', padding: 'clamp(32px,4vw,56px)' }}>
              <img src="/evozome/logo-light.png" alt="Evozome" width={46} height={46} style={{ width: 46, height: 46, display: 'block' }} />
              <div data-reveal style={{ animationDelay: '.25s' }}>
                <h2 style={{ fontFamily: "'Taviraj', serif", fontWeight: 400, fontSize: 36, lineHeight: 0.87, margin: '0 0 24px', color: '#fff' }}>
                  {content.windowHeading}
                </h2>
                <p style={{ fontWeight: 400, fontSize: 18, lineHeight: 1.17, margin: 0, color: '#fff' }}>
                  {content.windowText}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BUILT TO HEAL intro + cards */}
      <section id="built-to-heal" style={{ background: 'rgb(14,15,16)', padding: 'clamp(80px,10vw,150px) clamp(24px,4vw,64px)' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'grid', gridTemplateColumns: twoCol, gap: 'clamp(40px,6vw,90px)', alignItems: 'start' }}>
          <Letters text={'BUILT TO\nHEAL'} as="h2" style={{ fontFamily: "'Taviraj', serif", fontWeight: 400, fontSize: 'clamp(48px,7.2vw,102px)', lineHeight: 0.86, margin: 0 }} />
          <p data-reveal style={{ fontWeight: 400, fontSize: 18, lineHeight: 1.17, margin: 0, maxWidth: 777, animationDelay: '.15s' }}>
            {content.aboutText.split('\n').map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line}
              </span>
            ))}
          </p>
        </div>

        {isNarrow ? (
          <div style={{ maxWidth: 1600, margin: 'clamp(56px,7vw,100px) auto 0' }}>
            <div
              onTouchStart={(e) => { touchStartXRef.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => {
                const startX = touchStartXRef.current;
                touchStartXRef.current = null;
                if (startX == null) return;
                const dx = e.changedTouches[0].clientX - startX;
                if (Math.abs(dx) < 40) return;
                const last = content.gallery.length - 1;
                setHealSlide((s) => (dx < 0 ? Math.min(s + 1, last) : Math.max(s - 1, 0)));
              }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ display: 'flex', transform: `translateX(-${healSlide * 100}%)`, transition: 'transform .45s cubic-bezier(.22,.61,.36,1)' }}>
                {content.gallery.map((g, i) => (
                  <div key={g.img + i} style={{ flex: '0 0 100%', minWidth: 0, display: 'flex', flexDirection: 'column', gap: 22 }}>
                    <div data-zoom onClick={() => setLightbox(i)} style={{ aspectRatio: '1 / 1', overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                      <img src={g.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      <span style={{ position: 'absolute', left: 14, bottom: 12, fontWeight: 700, fontSize: 13, letterSpacing: '0.14em', color: 'rgb(226,224,213)', mixBlendMode: 'difference' }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, position: 'relative' }}>
                      <div style={{ fontWeight: 400, fontSize: 18, lineHeight: 1.17 }}>{g.line1}</div>
                      <div style={{ fontWeight: 400, fontSize: 18, lineHeight: 1.17 }}>{g.line2}</div>
                      <div className={`evo-more${openCards[i] ? ' evo-open' : ''}`}>
                        <div>
                          <div style={{ fontWeight: 400, fontSize: 18, lineHeight: 1.17, paddingTop: 4 }}>{HEAL_CARDS[i]?.more}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setOpenCards((prev) => ({ ...prev, [i]: !prev[i] }))}
                        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 700, fontSize: 18, lineHeight: 1.17, color: '#fff', borderBottom: '1px solid rgb(226,224,213)', paddingBottom: 6, alignSelf: 'flex-start' }}
                      >
                        {openCards[i] ? 'READ LESS' : 'READ MORE'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-start', marginTop: 32 }}>
              {content.gallery.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  onClick={() => setHealSlide(i)}
                  style={{ background: 'none', border: 'none', padding: '8px 3px', cursor: 'pointer' }}
                >
                  <span style={{ display: 'block', width: healSlide === i ? 36 : 22, height: 2, background: healSlide === i ? '#fff' : 'rgba(255,255,255,0.35)', transition: 'all .3s ease' }} />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div style={{ maxWidth: 1600, margin: 'clamp(56px,7vw,100px) auto 0', display: 'grid', gridTemplateColumns: galleryCol, gap: 'clamp(14px,1.6vw,22px)' }}>
              {content.gallery.map((g, i) => (
                <div key={g.img + i} data-reveal="unveil" data-zoom onClick={() => setLightbox(i)} style={{ aspectRatio: '1 / 1', overflow: 'hidden', cursor: 'pointer', position: 'relative', animationDelay: (i * 0.11).toFixed(2) + 's' }}>
                  <img src={g.img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  <span style={{ position: 'absolute', left: 14, bottom: 12, fontWeight: 700, fontSize: 13, letterSpacing: '0.14em', color: 'rgb(226,224,213)', mixBlendMode: 'difference' }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ maxWidth: 1600, margin: '50px auto 0', display: 'grid', gridTemplateColumns: cardCol, gap: 'clamp(28px,3.4vw,52px)' }}>
              {HEAL_CARDS.map((c, i) => (
                <div key={c.title + i} data-reveal="slow" style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingTop: 26, animationDelay: (i * 0.12).toFixed(2) + 's', position: 'relative' }}>
                  <div style={{ fontWeight: 400, fontSize: 18, lineHeight: 1.17 }}>{content.gallery[i]?.line1}</div>
                  <div style={{ fontWeight: 400, fontSize: 18, lineHeight: 1.17 }}>{content.gallery[i]?.line2}</div>
                  <div className={`evo-more${openCards[i] ? ' evo-open' : ''}`}>
                    <div>
                      <div style={{ fontWeight: 400, fontSize: 18, lineHeight: 1.17, paddingTop: 4 }}>{c.more}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenCards((prev) => ({ ...prev, [i]: !prev[i] }))}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 700, fontSize: 18, lineHeight: 1.17, color: '#fff', borderBottom: '1px solid rgb(226,224,213)', paddingBottom: 6, alignSelf: 'flex-start' }}
                  >
                    {openCards[i] ? 'READ LESS' : 'READ MORE'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {lightbox >= 0 && (
        <div onClick={() => setLightbox(-1)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(4,12,17,0.94)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(20px,5vw,80px)', animation: 'evoFade .32s ease both', cursor: 'zoom-out' }}>
          <img src={content.gallery[lightbox]?.img} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block', animation: 'evoRise .45s cubic-bezier(.22,.61,.36,1) both' }} />
          <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous" style={{ position: 'absolute', left: 'clamp(14px,3vw,44px)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 30, color: 'rgb(226,224,213)', padding: 14 }}>‹</button>
          <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next" style={{ position: 'absolute', right: 'clamp(14px,3vw,44px)', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 30, color: 'rgb(226,224,213)', padding: 14 }}>›</button>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(-1); }} aria-label="Close" style={{ position: 'absolute', top: 'clamp(16px,3vw,40px)', right: 'clamp(16px,3vw,40px)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 22, color: 'rgb(226,224,213)', padding: 10 }}>×</button>
          <div style={{ position: 'absolute', bottom: 'clamp(18px,3vw,40px)', left: '50%', transform: 'translateX(-50%)', fontWeight: 700, fontSize: 14, letterSpacing: '0.18em', color: 'rgb(226,224,213)' }}>
            {String(lightbox + 1).padStart(2, '0')} / {String(content.gallery.length).padStart(2, '0')}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer id="contact" style={{ background: 'rgb(226,224,213)', color: 'rgb(14,15,16)', padding: 'clamp(70px,8vw,120px) clamp(24px,4vw,64px) 40px' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', display: 'grid', gridTemplateColumns: footerCol, gap: 'clamp(40px,5vw,80px)', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', fontFamily: "'Taviraj', serif", fontWeight: 600, fontSize: 31, lineHeight: 1.7 }}>
            <a href="#">HOME</a>
            <a href="#about">ABOUT</a>
            <a href="#built-to-heal">BUILT TO HEAL</a>
          </div>
          {isMobile && <div style={{ width: '100%', height: 1, background: 'rgb(14,15,16)' }} />}
          <div>
            <div style={{ fontFamily: "'Taviraj', serif", fontWeight: 600, fontSize: 31, lineHeight: 1.2, marginBottom: 26 }}>CONTACT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontWeight: 400, fontSize: 18, lineHeight: 1.17 }}>
              <a href={`mailto:${content.contactEmail}`}>{content.contactEmail}</a>
              <a href={`tel:+${content.contactPhone.replace(/[^\d]/g, '')}`}>{content.contactPhone}</a>
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "'Taviraj', serif", fontWeight: 600, fontSize: 31, lineHeight: 1.2, marginBottom: 26 }}>NEWSLETTER</div>
            {subscribeState.success ? (
              <div style={{ fontWeight: 400, fontSize: 16, lineHeight: 1.3, maxWidth: 420 }}>
                YOU&apos;RE SUBSCRIBED — THANK YOU.
              </div>
            ) : (
              <form action={subscribeAction} style={{ maxWidth: 420 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderBottom: '1px solid rgb(14,15,16)', paddingBottom: 12 }}>
                  <input
                    required
                    type="email"
                    name="email"
                    placeholder="YOUR EMAIL"
                    style={{ flex: 1, background: 'rgb(226,224,213)', border: 'none', outline: 'none', fontWeight: 400, fontSize: 18, color: 'rgb(14,15,16)' }}
                  />
                  <button
                    type="submit"
                    disabled={subscribePending}
                    aria-label="Subscribe"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 18, color: 'rgb(14,15,16)', opacity: subscribePending ? 0.5 : 1 }}
                  >
                    →
                  </button>
                </div>
                <div style={{ marginTop: 10 }}>
                  <TurnstileWidget resetKey={subscribeState} />
                </div>
                {subscribeState.error && (
                  <p style={{ marginTop: 8, fontSize: 13, color: '#b4643e' }}>{subscribeState.error}</p>
                )}
              </form>
            )}
          </div>
          <div>
            <div style={{ fontFamily: "'Taviraj', serif", fontWeight: 600, fontSize: 31, lineHeight: 1.2, marginBottom: 26 }}>FOLLOW</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: isNarrow ? 'space-between' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                <a href="https://www.instagram.com/evozome" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ display: 'block', width: 49, height: 49 }}>
                  <svg viewBox="0 0 49 49" style={{ width: '100%', height: '100%', display: 'block' }}>
                    <path d="M24.5 0.5 C37.76 0.5 48.5 11.24 48.5 24.5 C48.5 37.76 37.76 48.5 24.5 48.5 C11.24 48.5 0.5 37.76 0.5 24.5 C0.5 11.24 11.24 0.5 24.5 0.5 Z M18.6 13.9 C15.99 13.9 13.9 15.99 13.9 18.6 L13.9 30.4 C13.9 33.01 15.99 35.1 18.6 35.1 L30.4 35.1 C33.01 35.1 35.1 33.01 35.1 30.4 L35.1 18.6 C35.1 15.99 33.01 13.9 30.4 13.9 L18.6 13.9 Z M18.6 16.6 L30.4 16.6 C31.51 16.6 32.4 17.49 32.4 18.6 L32.4 30.4 C32.4 31.51 31.51 32.4 30.4 32.4 L18.6 32.4 C17.49 32.4 16.6 31.51 16.6 30.4 L16.6 18.6 C16.6 17.49 17.49 16.6 18.6 16.6 Z M24.5 18.7 C21.3 18.7 18.7 21.3 18.7 24.5 C18.7 27.7 21.3 30.3 24.5 30.3 C27.7 30.3 30.3 27.7 30.3 24.5 C30.3 21.3 27.7 18.7 24.5 18.7 Z M24.5 21.4 C26.21 21.4 27.6 22.79 27.6 24.5 C27.6 26.21 26.21 27.6 24.5 27.6 C22.79 27.6 21.4 26.21 21.4 24.5 C21.4 22.79 22.79 21.4 24.5 21.4 Z M31.3 17.2 C30.53 17.2 29.9 17.83 29.9 18.6 C29.9 19.37 30.53 20 31.3 20 C32.07 20 32.7 19.37 32.7 18.6 C32.7 17.83 32.07 17.2 31.3 17.2 Z" fill="rgb(4,12,17)" fillRule="evenodd" />
                  </svg>
                </a>
                <a href="https://www.linkedin.com/company/evozome?originalSubdomain=rs" target="_blank" rel="noopener noreferrer" style={{ display: 'block', width: 49, height: 49 }}><img src="/evozome/social-linkedin.svg" alt="LinkedIn" style={{ width: '100%', height: '100%', display: 'block' }} /></a>
              </div>
              {isNarrow && (
                <a href="#" aria-label="Back to top" style={{ display: 'block' }}>
                  <img src="/evozome/logo-dark.png" alt="Evozome" width={49} height={49} style={{ width: 49, height: 49, display: 'block' }} />
                </a>
              )}
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1600, margin: isMobile ? '24px auto 0' : 'clamp(50px,6vw,90px) auto 0', paddingTop: isMobile ? 12 : 24, display: 'flex', justifyContent: isMobile ? 'center' : 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: isMobile ? 6 : 14, fontWeight: 400, fontSize: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : undefined, flexWrap: isMobile ? 'wrap' : 'nowrap', order: isMobile ? 2 : 0 }}>
            <span style={isMobile ? { display: 'block', width: '100%', textAlign: 'center' } : undefined}>© {new Date().getFullYear()} EVOZOME.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'center' : undefined, gap: 10, width: isMobile ? '100%' : undefined, order: isMobile ? 1 : 0 }}>
            <span>ALL RIGHTS RESERVED.</span>
            {!isMobile && (
              <a href="#" aria-label="Back to top" style={{ display: 'block', marginLeft: 120 }}>
                <img src="/evozome/logo-dark.png" alt="Evozome" width={80} height={80} style={{ width: 80, height: 80, display: 'block' }} />
              </a>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
