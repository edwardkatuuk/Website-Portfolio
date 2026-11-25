import { lazy, startTransition, Suspense, useLayoutEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/inter/latin-400.css';
import '@fontsource/inter/latin-600.css';
import GradientASCII from './components/GradientASCII';
import Lanyard from './components/Lanyard';
import portrait from '../Assets/edward-badge.webp';
import contacts from './contacts.json';
import './styles.css';

const loadWorks = () => import('./components/Works');
const Works = lazy(loadWorks);
const sections = ['About Me', 'My Works'];

function prefetchWorks() {
  loadWorks().catch(() => {});
}

function Portfolio() {
  const [returnedFromVano] = useState(() => history.state?.returnedFromVano === true);
  const [flipped, setFlipped] = useState(returnedFromVano);
  const [cardPage, setCardPage] = useState(returnedFromVano ? 'menu-returned' : 'menu');
  const [worksOpen, setShowsWorks] = useState(null);
  const showsWorks = worksOpen === true;
  const [activeProject, setActiveProject] = useState(null);
  const turn = useRef(null);
  const front = useRef(null);
  const firstEntry = useRef(null);
  const cardBack = useRef(null);
  const cardMenu = useRef(null);
  const aboutPanel = useRef(null);
  const workTrigger = useRef(null);
  const vanoLink = useRef(null);
  const focusAfterFlip = useRef(false);
  const aboutVisible = cardPage === 'about' || cardPage === 'leaving-about';
  const pageLeaving = cardPage === 'leaving-menu' || cardPage === 'leaving-about';

  function flip(moveFocus = false) {
    focusAfterFlip.current = moveFocus;
    if (!flipped) setCardPage('menu');
    setFlipped(value => !value);
  }

  function onButtonFlip(event) {
    flip(event.detail === 0);
  }

  function openSection(section) {
    if (section === 'About Me') {
      setCardPage(matchMedia('(prefers-reduced-motion: reduce)').matches ? 'about' : 'leaving-menu');
    } else {
      startTransition(() => setShowsWorks(true));
    }
  }

  function rememberMenu(event) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    history.replaceState({ ...history.state, returnedFromVano: true }, '');
  }

  function closeAbout() {
    if (cardPage === 'leaving-about') return;
    focusAfterFlip.current = true;
    setCardPage(cardPage === 'about' && !matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'leaving-about' : 'menu-returned');
  }

  function handleEscape(event) {
    if (event.key !== 'Escape' || event.defaultPrevented || event.target.closest?.('dialog')) return;
    if (activeProject) {
      setActiveProject(null);
    } else if (showsWorks) {
      setShowsWorks(false);
    } else if (flipped && (aboutVisible || pageLeaving)) {
      closeAbout();
    } else if (flipped) {
      flip(true);
    }
  }

  useLayoutEffect(() => {
    if (flipped && pageLeaving) {
      cardBack.current.focus({ preventScroll: true });
    } else if (flipped && cardPage === 'about') {
      aboutPanel.current.focus({ preventScroll: true });
    } else if (focusAfterFlip.current) {
      focusAfterFlip.current = false;
      (flipped ? firstEntry : front).current.focus({ preventScroll: true });
    }
  }, [flipped, cardPage, pageLeaving]);

  useLayoutEffect(() => {
    if (!pageLeaving) return;

    const leavingAbout = cardPage === 'leaving-about';
    const elements = leavingAbout
      ? Array.from(aboutPanel.current.children)
      : Array.from(cardMenu.current.children);
    const styles = getComputedStyle(cardBack.current);
    const duration = parseFloat(styles.getPropertyValue('--card-content-duration'));
    const stagger = parseFloat(styles.getPropertyValue('--card-menu-stagger'));
    const animations = elements.map((element, index) => {
      const { opacity, transform } = getComputedStyle(element);
      return element.animate(
        [
          { opacity: Number(opacity) || 1, transform },
          { opacity: 0, transform: 'translateY(14px)' }
        ],
        {
          duration: Math.round(duration * 0.72),
          delay: (elements.length - 1 - index) * stagger,
          easing: 'cubic-bezier(0.32, 1, 0.23, 1)',
          fill: 'both'
        }
      );
    });
    Promise.all(animations.map(animation => animation.finished)).then(
      () => setCardPage(leavingAbout ? 'menu-returned' : 'about'),
      () => {}
    );
    return () => animations.forEach(animation => animation.cancel());
  }, [cardPage, pageLeaving]);

  useLayoutEffect(() => {
    if (worksOpen === false) workTrigger.current?.focus({ preventScroll: true });
  }, [worksOpen]);

  useLayoutEffect(() => {
    if (!returnedFromVano) return;
    const state = { ...history.state };
    delete state.returnedFromVano;
    history.replaceState(state, '');
    vanoLink.current.focus({ preventScroll: true });
  }, [returnedFromVano]);

  return (
    <main className="portfolio-stage" data-works={showsWorks} onKeyDown={handleEscape}>
      <div className="portfolio-slide">
        <div className="portfolio" data-back={flipped} data-resumed={returnedFromVano} inert={showsWorks}>
          <GradientASCII
            className="ascii"
            aria-hidden="true"
            colors={['#191e57', '#263d8e', '#4c9cd1', '#42c4ed', '#f1f5ff']}
            shape="horizon"
            characters=" +xX0S8#@"
            cellSize={31}
            density={0.84}
            glyphOpacity={0.67}
            gradientOpacity={0.83}
            softness={0.66}
            flow={0.34}
            speed={0.22}
            glow={0.24}
            flicker={0.12}
            grain={0.14}
            dpr={1}
            intro={!returnedFromVano}
            mouseInteraction
            clickEffect="wave"
          />

          <Lanyard
            className="scene"
            frontImage={portrait}
            cardColor="#eaeaea"
            strapColor="#151515"
            strapWidth={0.68}
            finish="matte"
            cornerRadius={0.25}
            size={0.565}
            strapLength={0.494}
            gravity={0.5}
            damping={0.61}
            elasticity={0.74}
            breeze={0.5}
            intro={!returnedFromVano}
            interactive
            flipped={flipped}
            onFlip={flip}
            overlayRef={turn}
          />

          <div className="card-space">
            <div className="fallback-strap" aria-hidden="true"><i /></div>
            <div className="card-turn" ref={turn}>
              <div className="card-face card-front" inert={flipped}>
                <img src={portrait} alt="" className="fallback-portrait" />
                <button ref={front} type="button" className="flip-target" onClick={onButtonFlip} aria-label="Flip Edward Katuuk’s lanyard" />
              </div>
              <div className="card-face card-back" ref={cardBack} inert={!flipped} tabIndex={-1}>
                <button type="button" className="flip-target" onClick={onButtonFlip} aria-label="Flip the lanyard back to the portrait" tabIndex={-1} />
                {aboutVisible ? (
                  <section className="card-about" ref={aboutPanel} inert={pageLeaving} tabIndex={-1} aria-labelledby="card-about-name">
                    <div className="card-about-bio">
                      <h1 id="card-about-name">Estevano E. Katuuk</h1>
                      <p>Just a Regular normal 22yrs old guy from Indonesia.</p>
                    </div>
                    <div className="card-about-actions">
                      <a className="card-action" href={contacts.instagramURL} target="_blank" rel="noreferrer">
                        Instagram <span className="chevron" aria-hidden="true" />
                      </a>
                      <a className="card-action" href={'mailto:' + contacts.email}>
                        Email <span className="chevron" aria-hidden="true" />
                      </a>
                      <button type="button" className="card-action card-about-back" onClick={closeAbout}>
                        <span className="chevron" aria-hidden="true" /> Back
                      </button>
                    </div>
                  </section>
                ) : (
                  <nav ref={cardMenu} className="card-menu" aria-label="Portfolio sections" inert={pageLeaving} data-returned={cardPage === 'menu-returned'}>
                    {sections.map((section, index) => {
                      const [first, second] = section.split(' ');
                      return (
                        <button
                          key={section}
                          ref={index === 0 ? firstEntry : workTrigger}
                          type="button"
                          className="card-action"
                          aria-label={section}
                          onPointerEnter={section === 'My Works' ? prefetchWorks : undefined}
                          onFocus={section === 'My Works' ? prefetchWorks : undefined}
                          onClick={() => openSection(section)}
                        >
                          <span aria-hidden="true">{first}<br />{second}</span>
                          <span className="chevron" aria-hidden="true" />
                        </button>
                      );
                    })}
                    <a
                      ref={vanoLink}
                      className="card-action"
                      href="./vanoworship/"
                      aria-label="VanoWorship"
                      onClick={rememberMenu}
                    >
                      <span aria-hidden="true">Vano<br />Worship</span>
                      <span className="chevron" aria-hidden="true" />
                    </a>
                  </nav>
                )}
              </div>
            </div>
          </div>

          <button type="button" className="hint" onClick={onButtonFlip} inert={flipped} tabIndex={-1}>
            <span>click the lanyard</span>
          </button>
        </div>

        {worksOpen !== null && (
          <Works
            open={showsWorks}
            project={activeProject}
            onProjectChange={setActiveProject}
            onClose={() => setShowsWorks(false)}
          />
        )}
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')).render(
  <Suspense fallback={null}>
    <Portfolio />
  </Suspense>
);
