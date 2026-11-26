import { memo, useState } from 'react';
import { m } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  ChevronRight,
  Download,
  Heart,
  Layers,
  Play,
  QrCode,
  Radio,
  Sparkles,
  WifiOff,
} from 'lucide-react';
import { copy } from './locales';
import { SpotlightSurface, TiltedStage3D } from './TiltedStage';
import Topography from './Topography';

// Paste your YouTube video URL or 11-char Video ID here when ready
// Example: 'https://www.youtube.com/watch?v=YOUR_VIDEO_ID'
const YOUTUBE_VIDEO_URL = import.meta.env.VITE_YOUTUBE_ID || '';

function extractYouTubeId(input) {
  const value = String(input || '').trim();
  if (!value) return '';
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  const match = value.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : '';
}

const easeOutCubic = [0.22, 1, 0.36, 1];
const ANIM_LYRIC = 'Hallelujah';
const ANIM_CHARS = Array.from(ANIM_LYRIC);
const DEFAULT_STAGGER_S = 0.07;
const DOLLY_ZOOM = 0.14;

const ANIM_PRESETS = [
  {
    keyframe: 'vw-lyric-bounce-snap',
    duration: 2,
    ease: 'cubic-bezier(.23,1,.32,1)',
  },
  {
    keyframe: 'vw-lyric-fly-in-from-left',
    duration: 2,
    ease: 'cubic-bezier(.23,1,.32,1)',
  },
  {
    keyframe: 'vw-lyric-light-sweep-shimmer',
    duration: 2,
    ease: 'cubic-bezier(.23,1,.32,1)',
    accent: true,
  },
  {
    keyframe: 'vw-lyric-3d-camera-pull-back',
    duration: 2,
    ease: 'cubic-bezier(.16,1,.3,1)',
    blurRadius: 16,
    cameraScene: true,
  },
  {
    keyframe: 'none',
    duration: 4,
    ease: 'cubic-bezier(.16,1,.3,1)',
    blurRadius: 5,
  },
];

const featureIcons = {
  anim: Sparkles,
  dual: Layers,
  cam: QrCode,
  ndi: Radio,
  bible: BookOpen,
  offline: WifiOff,
};

const revealProps = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.08 },
  transition: { duration: 1.3, ease: easeOutCubic },
};

const stageDeckRevealProps = {
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.08 },
  transition: { duration: 1.3, delay: 0.14, ease: easeOutCubic },
};

export const Showcase = memo(function Showcase({ lang = 'en', downloadUrl, onDownloadFallback, onOpenSupport, onReady }) {
  const t = copy[lang] || copy.en;
  const chapters = t.showcase.chapters;
  const features = t.purpose.features;
  const youtubeId = extractYouTubeId(YOUTUBE_VIDEO_URL);

  const [videoStarted, setVideoStarted] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(chapters[0].id);
  const [activeFeatureId, setActiveFeatureId] = useState(features[0].id);
  const [activePresetIdx, setActivePresetIdx] = useState(0);
  const [replayTick, setReplayTick] = useState(0);
  const [swappedLive, setSwappedLive] = useState(false);
  const [bibleVersion, setBibleVersion] = useState('KJV');

  const activeChapter = chapters.find(c => c.id === activeChapterId) ?? chapters[0];
  const activeFeature = features.find(f => f.id === activeFeatureId) ?? features[0];
  const ActiveIcon = featureIcons[activeFeature.id] || Sparkles;

  return (
    <div className="vw-showcase">
      <div className="vw-topography-wrap" aria-hidden="true">
        <div className="vw-topography-sticky">
          <Topography
            color="#143095"
            lineCount={22}
            lineWidth={0.8}
            elevation={1.1}
            foreground={0.7}
            tilt={32}
            speed={0.26}
            direction="forward"
            glow={0.95}
            depthOfField={0.36}
            fog={0.35}
            hoverEffect="light"
            clickEffect="pulse"
            scale={1.9}
            detail={0}
            morph={1}
            parallax={1}
            dpr={1.25}
            onReady={onReady}
          />
          <div className="vw-topography-fade" />
        </div>
      </div>

      {/* Band 1: Editorial Intro + Unified Split Workspace Stage */}
      <section className="vw-container vw-showcase-band" aria-labelledby="video-heading">
        <m.div className="vw-grid vw-showcase-top" {...revealProps}>
          <div className="vw-showcase-intro">
            <span className="vw-kicker">{t.showcase.kicker}</span>
            <h2 id="video-heading" className="vw-heading">
              {t.showcase.titleStart} <em>{t.showcase.titleEm}</em>
            </h2>
            <p className="vw-lead">{t.showcase.lead}</p>
          </div>
        </m.div>

        <m.div className="vw-split-window" {...stageDeckRevealProps}>
          <aside className="vw-sidebar" aria-label={t.showcase.indexHeading}>
            <div className="vw-sidebar-section">
              <span className="vw-sidebar-group">{t.showcase.indexHeading}</span>
              <div className="vw-chapter-list" role="tablist" aria-label={t.showcase.indexHeading}>
                {chapters.map(ch => {
                  const selected = ch.id === activeChapterId;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      role="tab"
                      aria-selected={selected}
                      className={`vw-chapter-row${selected ? ' is-selected' : ''}`}
                      onClick={() => setActiveChapterId(ch.id)}
                    >
                      <span className="vw-chapter-num">{ch.num}</span>
                      <span className="vw-chapter-copy">
                        <strong>{ch.title}</strong>
                        <small>{ch.tag}</small>
                      </span>
                      <ChevronRight size={14} className="vw-row-chevron" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          <div className="vw-detail-pane">
            <div className="vw-detail-toolbar">
              <div className="vw-toolbar-meta">
                <strong>{activeChapter.title}</strong>
                <span>{activeChapter.num} · {activeChapter.tag}</span>
              </div>
              {youtubeId && (
                <span className="vw-stage-status">
                  <i aria-hidden="true" /> {t.showcase.statusReady}
                </span>
              )}
            </div>

            <TiltedStage3D className="vw-video-stage-3d" disabled={youtubeId && videoStarted}>
              <div className="vw-video-canvas">
                {youtubeId && videoStarted ? (
                  <iframe
                    className="vw-youtube-embed"
                    src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`}
                    title="VanoWorship Video Showcase"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <div className="vw-stage-atmosphere" aria-hidden="true" />
                    <div className="vw-video-glare" aria-hidden="true" />

                    {youtubeId ? (
                      <button
                        type="button"
                        className="vw-video-trigger"
                        onClick={() => setVideoStarted(true)}
                        aria-label={t.showcase.playAria}
                      >
                        <span className="vw-play-circle is-live" aria-hidden="true">
                          <Play size={26} fill="currentColor" />
                        </span>
                        <span className="vw-stage-title">{activeChapter.title}</span>
                        <span className="vw-stage-sub">{activeChapter.summary}</span>
                      </button>
                    ) : (
                      <div className="vw-video-placeholder">
                        <span className="vw-play-circle" aria-hidden="true">
                          <Play size={24} fill="currentColor" />
                        </span>
                        <span className="vw-stage-soon">{t.showcase.statusSoon}</span>
                        <h3>{activeChapter.title}</h3>
                        <p>{activeChapter.summary}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </TiltedStage3D>
          </div>
        </m.div>
      </section>

      {/* Band 2: Built With Purpose — Clean Fixed-Height Interactive Feature Studio */}
      <section className="vw-container vw-purpose-band" aria-labelledby="features-heading">
        <m.div className="vw-grid vw-purpose-head" {...revealProps}>
          <div className="vw-purpose-title">
            <span className="vw-kicker">{t.purpose.kicker}</span>
            <h2 id="features-heading" className="vw-heading">
              {t.purpose.titleStart} <em>{t.purpose.titleEm}</em> {t.purpose.titleEnd}
            </h2>
          </div>

          <div className="vw-purpose-summary">
            <p className="vw-lead">{t.purpose.lead}</p>
            <div className="vw-highlight-strip">
              {t.purpose.highlights.map(({ k, v }) => (
                <div key={k} className="vw-highlight-cell">
                  <span>{k}</span>
                  <strong>{v}</strong>
                </div>
              ))}
            </div>
          </div>
        </m.div>

        <SpotlightSurface as="div" className="vw-feature-studio" delay={0.1}>
          <aside className="vw-studio-sidebar" aria-label={t.purpose.kicker}>
            <div className="vw-studio-list" role="tablist" aria-label={t.purpose.kicker}>
              {features.map(item => {
                const Icon = featureIcons[item.id] || Sparkles;
                const selected = item.id === activeFeature.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    className={`vw-studio-tab${selected ? ' is-selected' : ''}`}
                    onClick={() => setActiveFeatureId(item.id)}
                  >
                    <span className="vw-studio-tab-icon" aria-hidden="true">
                      <Icon size={17} />
                    </span>
                    <span className="vw-studio-tab-copy">
                      <strong>{item.title}</strong>
                      <small>{item.tag}</small>
                    </span>
                    <ChevronRight size={14} className="vw-row-chevron" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </aside>

          <div
            className={`vw-studio-stage${activeFeature.id === 'anim' ? ' is-expanded' : ''}`}
            role="tabpanel"
            aria-label={activeFeature.title}
          >
            <div className="vw-detail-toolbar">
              <div className="vw-toolbar-meta">
                <span className="vw-studio-toolbar-icon" aria-hidden="true">
                  <ActiveIcon size={15} />
                </span>
                <strong>{activeFeature.title}</strong>
              </div>
            </div>

            <div className="vw-studio-canvas">
              {activeFeature.id === 'anim' && (() => {
                const animPreset = ANIM_PRESETS[activePresetIdx] || ANIM_PRESETS[0];
                const charTotal = ANIM_CHARS.length;
                const motionStyle = {
                  '--lyric-play': animPreset.keyframe,
                  '--lyric-duration': `${animPreset.duration}s`,
                  '--lyric-curve': animPreset.ease,
                  '--lyric-camera-duration': `${animPreset.duration * 10}s`,
                  '--lyric-zoom-start': 1 - (DOLLY_ZOOM * 4) / 7,
                  '--lyric-zoom-end': 1 + (DOLLY_ZOOM * 3) / 7,
                  ...(animPreset.blurRadius
                    ? {
                        '--blur-radius': `${animPreset.blurRadius}px`,
                        '--blur-max': '8px',
                        '--lyric-focus-entry': 'vw-optical-focus-in',
                      }
                    : {}),
                };
                return (
                  <div className="vw-demo-anim">
                    <div className="vw-demo-lyric-box">
                      <span
                        key={`${activeFeatureId}-${activePresetIdx}-${replayTick}`}
                        className={`vw-demo-lyric${animPreset.cameraScene ? ' is-camera-scene' : ''}${animPreset.accent ? ' has-sweep' : ''}`}
                        style={motionStyle}
                        aria-label={ANIM_LYRIC}
                      >
                        {ANIM_CHARS.map((ch, idx) => {
                          const offset = idx - (charTotal - 1) / 2;
                          const x = charTotal > 1 ? (2 * offset) / (charTotal - 1) : 0;
                          const unitStyle = {
                            '--lyric-stagger': `${(idx * DEFAULT_STAGGER_S).toFixed(2)}s`,
                            ...(animPreset.cameraScene
                              ? {
                                  '--spread-x': `${(35 * x).toFixed(2)}px`,
                                  '--spread-y': '0px',
                                  '--tilt-x': '8deg',
                                  '--tilt-y': `${((x < 0 ? -1 : 1) * (8 + 6 * Math.abs(x))).toFixed(2)}deg`,
                                }
                              : {}),
                          };
                          return (
                            <span
                              key={idx}
                              className={`vw-demo-char${animPreset.accent ? ' vw-demo-has-accent' : ''}`}
                              style={unitStyle}
                              aria-hidden="true"
                            >
                              <span className={`vw-demo-piece${animPreset.blurRadius ? ' is-optical-blur' : ''}`}>
                                {ch}
                              </span>
                              {animPreset.accent && (
                                <span className="vw-demo-accent is-light-sweep-shimmer">{ch}</span>
                              )}
                            </span>
                          );
                        })}
                      </span>
                    </div>
                    <div className="vw-segmented-pills is-preset-bar" role="group" aria-label={activeFeature.title}>
                      {activeFeature.presets.map((preset, idx) => {
                        const selected = activePresetIdx === idx;
                        return (
                          <button
                            key={preset}
                            type="button"
                            className={`vw-segment-btn${selected ? ' is-active' : ''}`}
                            aria-pressed={selected}
                            onClick={() => {
                              if (selected) {
                                setReplayTick(v => v + 1);
                              } else {
                                setActivePresetIdx(idx);
                              }
                            }}
                          >
                            {selected && (
                              <m.span
                                layoutId="vw-preset-thumb"
                                className="vw-segment-thumb"
                                transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                                aria-hidden="true"
                              />
                            )}
                            <span className="vw-segment-label">{preset}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

              {activeFeature.id === 'dual' && (
                <div className="vw-demo-dual">
                  <div className="vw-dual-cards">
                    <div className="vw-monitor-card">
                      <span className="vw-monitor-tag is-preview">{activeFeature.previewLabel}</span>
                      <strong>{swappedLive ? activeFeature.liveSample : activeFeature.previewSample}</strong>
                    </div>
                    <button
                      type="button"
                      className="vw-golive-pill"
                      onClick={() => setSwappedLive(v => !v)}
                    >
                      <span>{activeFeature.triggerLabel}</span>
                      <ArrowRight size={14} aria-hidden="true" />
                    </button>
                    <div className="vw-monitor-card is-live">
                      <span className="vw-monitor-tag is-onair">{activeFeature.liveLabel}</span>
                      <strong>{swappedLive ? activeFeature.previewSample : activeFeature.liveSample}</strong>
                    </div>
                  </div>
                </div>
              )}

              {activeFeature.id === 'cam' && (
                <div className="vw-demo-cam">
                  <div className="vw-qr-card">
                    <QrCode size={42} strokeWidth={1.6} aria-hidden="true" />
                    <div className="vw-qr-meta">
                      <strong>http://192.168.1.12:3000</strong>
                      <span>{activeFeature.lanLabel}</span>
                    </div>
                  </div>
                  <div className="vw-lowerthird-preview">
                    <span>{activeFeature.lowerThirdLabel}</span>
                  </div>
                </div>
              )}

              {activeFeature.id === 'ndi' && (
                <div className="vw-demo-ndi">
                  <div className="vw-alpha-grid">
                    <div className="vw-ndi-banner">{activeFeature.sampleText}</div>
                  </div>
                  <div className="vw-ndi-badges">
                    <span>{activeFeature.badgeA}</span>
                    <span>{activeFeature.badgeB}</span>
                  </div>
                </div>
              )}

              {activeFeature.id === 'bible' && (
                <div className="vw-demo-bible">
                  <div className="vw-segmented-pills is-bible-toggle" role="group" aria-label={activeFeature.title}>
                    {['KJV', 'TB'].map(ver => {
                      const selected = bibleVersion === ver;
                      return (
                        <button
                          key={ver}
                          type="button"
                          className={`vw-segment-btn${selected ? ' is-active' : ''}`}
                          aria-pressed={selected}
                          onClick={() => setBibleVersion(ver)}
                        >
                          {selected && (
                            <m.span
                              layoutId="vw-bible-thumb"
                              className="vw-segment-thumb"
                              transition={{ type: 'spring', stiffness: 460, damping: 36 }}
                              aria-hidden="true"
                            />
                          )}
                          <span className="vw-segment-label">{ver}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="vw-verse-preview">
                    <small>{activeFeature.verses[bibleVersion].ref}</small>
                    <blockquote>{activeFeature.verses[bibleVersion].text}</blockquote>
                  </div>
                </div>
              )}

              {activeFeature.id === 'offline' && (
                <div className="vw-demo-offline">
                  {activeFeature.metrics.map(({ label, value }) => (
                    <div key={label} className="vw-offline-row">
                      <span>{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {activeFeature.id !== 'anim' && (
              <div className="vw-studio-footer">
                <p>{activeFeature.summary}</p>
                <div className="vw-studio-spec">
                  <span>{activeFeature.specLabel}</span>
                  <strong>{activeFeature.specValue}</strong>
                </div>
              </div>
            )}
          </div>
        </SpotlightSurface>
      </section>

      {/* Band 3: Closing Liquid Glass Action Sheet & Footer */}
      <section className="vw-container vw-cta-band" aria-labelledby="cta-heading">
        <SpotlightSurface as="div" className="vw-cta-panel" delay={0.08}>
          <div className="vw-cta-copy">
            <span className="vw-kicker">{t.cta.kicker}</span>
            <h2 id="cta-heading" className="vw-heading">
              {t.cta.titleStart} <em>{t.cta.titleEm}</em>{t.cta.titleEnd}
            </h2>
            <p className="vw-lead">{t.cta.lead}</p>
          </div>

          <div className="vw-cta-actions">
            {downloadUrl ? (
              <a className="button button-primary" href={downloadUrl} download>
                <span className="action-icon"><Download aria-hidden="true" /></span>
                <span>{t.hero.downloadLabel} <small>{t.hero.downloadSub}</small></span>
              </a>
            ) : (
              <button className="button button-primary" type="button" onClick={onDownloadFallback}>
                <span className="action-icon"><Download aria-hidden="true" /></span>
                <span>{t.hero.downloadLabel} <small>{t.hero.downloadSub}</small></span>
              </button>
            )}
            <button className="button button-support" type="button" onClick={onOpenSupport}>
              <span className="action-icon"><Heart aria-hidden="true" /></span>
              <span className="support-label">{t.hero.supportLabel}</span>
            </button>
          </div>
        </SpotlightSurface>

        <footer className="vw-footer">
          <span>{t.cta.footerLeft}</span>
          <a className="vw-portfolio-link" href="../">
            {t.cta.footerLink} <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </footer>
      </section>
    </div>
  );
});
