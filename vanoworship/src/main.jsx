import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Coffee, Download, Heart, Instagram, Mail, MonitorDown, QrCode, X } from 'lucide-react';
import { domMax, LazyMotion, m, MotionConfig, useReducedMotion, useScroll, useTransform } from 'motion/react';
import logo from '../Assets/LOGO VANOWORSHIP.webp';
import laptop from '../Assets/LAPTOP PLACEHOLDER.webp';
import laptopMobile from '../Assets/laptop-ui-mobile.webp';
import desktopBg from '../Assets/Background Hero - Baru.webp';
import './styles.css';
import LightRays from './LightRays';
import { TextAnimate } from './text-animate';
import { copy } from './locales';

const loadShowcase = () => import('./Showcase').then(m => ({ default: m.Showcase }));
const Showcase = lazy(loadShowcase);

const downloadUrl = import.meta.env.VITE_DOWNLOAD_URL || 'https://github.com/edwardkatuuk/Website-Portfolio/releases/download/Installer_VanoWorship/VanoWorship-1.0.0-Setup.exe';

const slideUpWords = { as: 'span', animation: 'slideUp', by: 'word', startOnView: false, accessible: false };

function ActionDialog({ dialogRef, id, title, closeLabel, Icon, children }) {
  return (
    <dialog
      ref={dialogRef}
      className="action-dialog"
      aria-labelledby={`${id}-title`}
      onClick={(event) => {
        if (event.target === event.currentTarget) event.currentTarget.close();
      }}
    >
      <div className="dialog-panel">
        <form method="dialog" className="dialog-close">
          <button type="submit" aria-label={closeLabel}><X size={20} aria-hidden="true" /></button>
        </form>
        <span className="dialog-icon"><Icon size={22} aria-hidden="true" /></span>
        <h2 id={`${id}-title`}>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

function preloadImage(src) {
  return new Promise(resolve => {
    const img = new Image();
    const finish = () => {
      const decoded = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
      decoded.then(() => {
        if (typeof createImageBitmap === 'function' && img.naturalWidth > 0) {
          return createImageBitmap(img).then(bmp => {
            bmp.close?.();
          }).catch(() => {});
        }
        return undefined;
      }).then(resolve, resolve);
    };
    img.onload = finish;
    img.onerror = resolve;
    img.src = src;
    if (img.complete && img.naturalWidth > 0) finish();
  });
}

function waitFrames(count) {
  return new Promise(resolve => {
    let remaining = count;
    const step = () => {
      if (--remaining <= 0) resolve();
      else requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
}

function LandingPage() {
  const heroRef = useRef(null);
  const supportDialog = useRef(null);
  const downloadDialog = useRef(null);
  const mountedAtRef = useRef(performance.now());
  const [lang, setLang] = useState('en');
  const [hasSwitchedLang, setHasSwitchedLang] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [imagesReady, setImagesReady] = useState(false);
  const [showcaseLoaded, setShowcaseLoaded] = useState(false);
  const [raysReady, setRaysReady] = useState(false);
  const [topoReady, setTopoReady] = useState(false);
  const [siteReady, setSiteReady] = useState(false);

  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const bgY = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.04, 1.13]);

  const handleRaysReady = useCallback(() => setRaysReady(true), []);
  const handleTopoReady = useCallback(() => setTopoReady(true), []);
  const handleSelectLang = useCallback((nextLang) => {
    if (nextLang === lang) return;
    setHasSwitchedLang(true);
    setLang(nextLang);
  }, [lang]);

  const t = copy[lang] || copy.en;
  const completedStages = [fontsReady, imagesReady, showcaseLoaded, raysReady, topoReady].filter(Boolean).length;
  const bootProgress = siteReady ? 1 : Math.max(0.14, completedStages / 5);

  useEffect(() => {
    document.documentElement.lang = t.langCode;
  }, [t.langCode]);

  useEffect(() => {
    let active = true;
    const isMobile = window.matchMedia?.('(max-width: 760px), (max-aspect-ratio: 1/1)').matches;
    const criticalImages = [
      logo,
      isMobile ? laptopMobile : laptop,
      desktopBg
    ];

    (document.fonts?.ready || Promise.resolve()).then(
      () => { if (active) setFontsReady(true); },
      () => { if (active) setFontsReady(true); }
    );

    Promise.all(criticalImages.map(preloadImage)).then(
      () => { if (active) setImagesReady(true); },
      () => { if (active) setImagesReady(true); }
    );

    loadShowcase().then(
      () => { if (active) setShowcaseLoaded(true); },
      () => {
        if (active) {
          setShowcaseLoaded(true);
          setTopoReady(true);
        }
      }
    );

    const fallbackTimer = setTimeout(() => {
      if (active) setSiteReady(true);
    }, 9000);

    return () => {
      active = false;
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    if (siteReady || !(fontsReady && imagesReady && showcaseLoaded && raysReady && topoReady)) return;
    let active = true;
    const minCalmDwell = prefersReducedMotion ? 120 : 1100;
    const elapsed = performance.now() - mountedAtRef.current;
    const delayMs = Math.max(0, minCalmDwell - elapsed);

    const dwellTimer = setTimeout(() => {
      if (!active) return;
      waitFrames(prefersReducedMotion ? 1 : 3).then(() => {
        if (active) setSiteReady(true);
      });
    }, delayMs);

    return () => {
      active = false;
      clearTimeout(dwellTimer);
    };
  }, [siteReady, fontsReady, imagesReady, showcaseLoaded, raysReady, topoReady, prefersReducedMotion]);

  const supportOptions = [
    { name: 'Saweria', detail: t.dialogs.saweriaDetail, url: 'https://saweria.co/EdwardKatuuk', Icon: QrCode },
    { name: 'Ko-fi', detail: t.dialogs.kofiDetail, url: 'https://ko-fi.com/edwardkatuuk', Icon: Coffee },
  ];

  const downloadLabel = <>
    <span className="action-icon"><Download aria-hidden="true" /></span>
    <span>{t.hero.downloadLabel} <small>{t.hero.downloadSub}</small></span>
  </>;

  return (
    <div className="vanoworship-page">
      <nav className="lang-switcher" data-ready={siteReady} aria-label={t.switcherAria}>
        <button
          type="button"
          className={`lang-btn${lang === 'en' ? ' is-active' : ''}`}
          aria-pressed={lang === 'en'}
          onClick={() => handleSelectLang('en')}
        >
          ENG
        </button>
        <button
          type="button"
          className={`lang-btn${lang === 'id' ? ' is-active' : ''}`}
          aria-pressed={lang === 'id'}
          onClick={() => handleSelectLang('id')}
        >
          ID
        </button>
      </nav>

      <main className="hero" ref={heroRef} data-ready={siteReady} aria-labelledby="hero-title">
      <div className="stage-loader" data-ready={siteReady} aria-hidden={siteReady}>
        <div className="stage-loader-track">
          <div className="stage-loader-fill" style={{ '--boot-progress': bootProgress }} />
        </div>
      </div>
      <div className="hero-bg-wrap" aria-hidden="true">
        <m.div
          className="hero-bg-motion"
          style={prefersReducedMotion ? undefined : { y: bgY, scale: bgScale }}
        >
          <img
            className="hero-bg-img"
            src={desktopBg}
            width="2752"
            height="1536"
            alt=""
            decoding="async"
            fetchPriority="high"
          />
        </m.div>
        <div className="hero-bg-scrim" />
      </div>
      <LightRays
        className="hero-rays"
        active={siteReady}
        onReady={handleRaysReady}
        raysOrigin="top-left"
        raysColor="#6cbcff"
        raysSpeed={1}
        lightSpread={0.5}
        rayLength={3}
        glow={0.48}
        haze={0.22}
        followMouse
        mouseInfluence={0.1}
        opacity={0.34}
      />
      <div className="hero-inner">
        <img className="brand enter" src={logo} alt="VanoWorship" />
        <h1 id="hero-title" className="headline">
          <span className="text-animate-readable">{t.hero.srTitle}</span>
          <span key={lang}>
            <span className="headline-line" aria-hidden="true">
              <TextAnimate {...slideUpWords} play={siteReady} duration={hasSwitchedLang ? 0.35 : 0.85}>{t.hero.line1}</TextAnimate>
            </span>
            <span className="headline-line" aria-hidden="true">
              <em><TextAnimate {...slideUpWords} play={siteReady} delay={hasSwitchedLang ? 0.04 : 0.25} duration={hasSwitchedLang ? 0.35 : 0.85}>{t.hero.line2Em}</TextAnimate></em>{' '}
              <TextAnimate {...slideUpWords} play={siteReady} delay={hasSwitchedLang ? 0.08 : 0.48} duration={hasSwitchedLang ? 0.35 : 0.85}>{t.hero.line2Rest}</TextAnimate>
            </span>
            <span className="headline-line" aria-hidden="true">
              <TextAnimate {...slideUpWords} play={siteReady} delay={hasSwitchedLang ? 0.12 : 0.68} duration={hasSwitchedLang ? 0.35 : 0.9}>{t.hero.line3}</TextAnimate>
            </span>
          </span>
        </h1>
        <p className="description">
          <span className="text-animate-readable">{`${t.hero.desc1} ${t.hero.desc2} ${t.hero.descEm}`}</span>
          <span key={lang} aria-hidden="true">
            <TextAnimate {...slideUpWords} play={siteReady} delay={hasSwitchedLang ? 0.06 : 0.5} duration={hasSwitchedLang ? 0.38 : 1.05}>
              {`${t.hero.desc1} ${t.hero.desc2}`}
            </TextAnimate>{' '}
            <em>
              <TextAnimate {...slideUpWords} play={siteReady} delay={hasSwitchedLang ? 0.14 : 1.05} duration={hasSwitchedLang ? 0.38 : 1.15}>
                {t.hero.descEm}
              </TextAnimate>
            </em>
          </span>
        </p>
        <picture className="laptop-picture">
          <source media="(max-width: 760px), (max-aspect-ratio: 1/1)" srcSet={laptopMobile} />
          <img
            className="laptop enter"
            src={laptop}
            width="7680"
            height="5760"
            alt={t.hero.laptopAlt}
            fetchPriority="high"
          />
        </picture>
        <div className="actions enter">
          {downloadUrl ? (
            <a className="button button-primary" href={downloadUrl} download>
              {downloadLabel}
            </a>
          ) : (
            <button className="button button-primary" type="button" onClick={() => downloadDialog.current.showModal()}>
              {downloadLabel}
            </button>
          )}
          <button className="button button-support" type="button" onClick={() => supportDialog.current.showModal()}>
            <span className="action-icon"><Heart aria-hidden="true" /></span>
            <span className="support-label">{t.hero.supportLabel}</span>
          </button>
        </div>
      </div>
      </main>

      <Suspense fallback={null}>
        <Showcase
          lang={lang}
          downloadUrl={downloadUrl}
          onDownloadFallback={() => downloadDialog.current?.showModal()}
          onOpenSupport={() => supportDialog.current?.showModal()}
          onReady={handleTopoReady}
        />
      </Suspense>

      <ActionDialog dialogRef={supportDialog} id="support" title={t.dialogs.supportTitle} closeLabel={t.dialogs.dismiss} Icon={Heart}>
        <p>{t.dialogs.supportBody}</p>
        <ul className="support-options">
          {supportOptions.map(({ name, detail, url, Icon }) => (
            <li key={name}>
              <a href={url} target="_blank" rel="noopener noreferrer">
                <span className="provider-icon"><Icon size={19} aria-hidden="true" /></span>
                <span><strong>{name}</strong><small>{detail}</small></span>
              </a>
            </li>
          ))}
        </ul>
        <div className="support-socials">
          <a href="https://www.instagram.com/edwardkatuuk/" target="_blank" rel="noopener noreferrer">
            <Instagram size={17} aria-hidden="true" /> Instagram
          </a>
          <a href="mailto:edward.katuuk@gmail.com">
            <Mail size={17} aria-hidden="true" /> Email
          </a>
        </div>
      </ActionDialog>
      {!downloadUrl && (
        <ActionDialog dialogRef={downloadDialog} id="download" title={t.dialogs.downloadTitle} closeLabel={t.dialogs.dismiss} Icon={MonitorDown}>
          <p>{t.dialogs.downloadBody}</p>
          <form method="dialog" className="dialog-footer">
            <button type="submit" className="button button-support">{t.dialogs.close}</button>
          </form>
        </ActionDialog>
      )}
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <MotionConfig reducedMotion="user">
    <LazyMotion features={domMax}>
      <LandingPage />
    </LazyMotion>
  </MotionConfig>
);
