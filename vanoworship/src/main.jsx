import { useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Coffee, Download, Heart, Instagram, Mail, MonitorDown, QrCode, X } from 'lucide-react';
import { domAnimation, LazyMotion } from 'motion/react';
import logo from '../Assets/LOGO VANOWORSHIP.webp';
import laptop from '../Assets/laptop.webp';
import laptopMobile from '../Assets/laptop-mobile.webp';
import './styles.css';
import LightRays from './LightRays';
import { TextAnimate } from './text-animate';

const downloadUrl = import.meta.env.VITE_DOWNLOAD_URL || 'https://github.com/edwardkatuuk/Website-Portfolio/releases/download/Installer_VanoWorship/VanoWorship-1.0.0-Setup.exe';

const slideUpWords = { as: 'span', animation: 'slideUp', by: 'word', startOnView: false, accessible: false };
const heroDescription = [
  'Lightweight and easy to use, with everything you need in one place.',
  'A familiar layout, built-in text animation, simple phone camera connection, and NDI support,',
  'all completely free.',
];

const supportOptions = [
  { name: 'Saweria', detail: 'QRIS and Indonesian e-wallets', url: 'https://saweria.co/EdwardKatuuk', Icon: QrCode },
  { name: 'Ko-fi', detail: 'PayPal and international cards', url: 'https://ko-fi.com/edwardkatuuk', Icon: Coffee },
];

function ActionDialog({ dialogRef, id, title, Icon, children }) {
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
          <button type="submit" aria-label="Dismiss dialog"><X size={20} aria-hidden="true" /></button>
        </form>
        <span className="dialog-icon"><Icon size={22} aria-hidden="true" /></span>
        <h2 id={`${id}-title`}>{title}</h2>
        {children}
      </div>
    </dialog>
  );
}

function LandingPage() {
  const supportDialog = useRef(null);
  const downloadDialog = useRef(null);
  const downloadLabel = <>
    <span className="action-icon"><Download aria-hidden="true" /></span>
    <span>Download <small>for Windows</small></span>
  </>;

  return (
    <main className="hero" aria-labelledby="hero-title">
      <LightRays
        className="hero-rays"
        raysOrigin="top-left"
        raysColor="#ffb06e"
        raysSpeed={1}
        lightSpread={0.5}
        rayLength={3}
        glow={0.6}
        haze={0.25}
        followMouse
        mouseInfluence={0.1}
        opacity={0.42}
      />
      <img className="brand enter" src={logo} alt="VanoWorship" />
      <h1 id="hero-title" className="headline">
        <span className="text-animate-readable">Premium Features, Zero Cost with VanoWorship</span>
        <span className="headline-line" aria-hidden="true">
          <TextAnimate {...slideUpWords}>Premium Features,</TextAnimate>
        </span>
        <span className="headline-line" aria-hidden="true">
          <em><TextAnimate {...slideUpWords} delay={0.23}>Zero Cost</TextAnimate></em>{' '}
          <TextAnimate {...slideUpWords} delay={0.46}>with</TextAnimate>
        </span>
        <span className="headline-line" aria-hidden="true">
          <TextAnimate {...slideUpWords} delay={0.62}>VanoWorship</TextAnimate>
        </span>
      </h1>
      <p className="description">
        <span className="text-animate-readable">{heroDescription.join(' ')}</span>
        <span aria-hidden="true">
          <TextAnimate {...slideUpWords} delay={0.5} duration={0.45}>{heroDescription[0]}</TextAnimate>
          <br className="desktop-break" />{' '}
          <TextAnimate {...slideUpWords} delay={0.75} duration={0.53}>{heroDescription[1]}</TextAnimate>{' '}
          <em><TextAnimate {...slideUpWords} delay={1.15}>{heroDescription[2]}</TextAnimate></em>
        </span>
      </p>
      <img
        className="laptop enter"
        src={laptop}
        srcSet={`${laptopMobile} 920w, ${laptop} 1700w`}
        sizes="(max-width: 760px) or (max-aspect-ratio: 1/1) 132vw, 76vw"
        width="1700"
        height="1432"
        alt="VanoWorship showing scripture in Preview and worship lyrics on the Live output"
        fetchPriority="high"
      />
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
          <span className="support-label">Support Here</span>
        </button>
      </div>

      <ActionDialog dialogRef={supportDialog} id="support" title="Support VanoWorship" Icon={Heart}>
        <p>Your support helps keep VanoWorship free and makes future updates possible.</p>
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
        <ActionDialog dialogRef={downloadDialog} id="download" title="Download for Windows" Icon={MonitorDown}>
          <p>The Windows installer link is currently unavailable. Please check back later.</p>
          <form method="dialog" className="dialog-footer">
            <button type="submit" className="button button-support">Close</button>
          </form>
        </ActionDialog>
      )}
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <LazyMotion features={domAnimation}>
    <LandingPage />
  </LazyMotion>
);
