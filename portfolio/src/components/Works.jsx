import { useId, useLayoutEffect, useRef, useState } from 'react';
import AnimatedDialog from './AnimatedDialog';
import GradientASCII from './GradientASCII';
import portfolioData from '../portfolio-data.json';

const projectSummaries = {
  creators: 'Photography, video & design',
  'bank-indonesia': 'Event photography & videography',
  'the-impk-journey': 'Podcasts & promotional video',
  'malesung-project': 'Short-form editing & social design',
  'bitcoin-goceng': 'Thumbnail design',
  bitcoingoceng: 'Thumbnail design',
  'community-projects': 'Documentaries & motion graphics'
};

const projectTitleLines = {
  creators: ['Creators'],
  'bank-indonesia': ['Bank', 'Indonesia'],
  'the-impk-journey': ['The IMPK', 'Journey'],
  'malesung-project': ['Malesung', 'Project'],
  bitcoingoceng: ['Bitcoin', 'Goceng'],
  'bitcoin-goceng': ['Bitcoin', 'Goceng'],
  'community-projects': ['Community', 'Projects']
};

const mediaRatios = {
  portrait: '9 / 16',
  'portrait-wide': '3 / 4',
  square: '1',
  landscape: '16 / 9',
  'landscape-four-three': '4 / 3',
  wide: '21 / 9'
};

function getYouTubeId(src) {
  const url = new URL(src);
  return url.searchParams.get('v') || url.pathname.split('/').filter(Boolean).at(-1);
}

function ProjectBack({ children, onClick, ref }) {
  return (
    <button type="button" className="works-back" onClick={onClick} ref={ref}>
      <span className="chevron" aria-hidden="true" />
      {children}
    </button>
  );
}

function MediaCard({ item, index, total, onOpen }) {
  const { type, src, ratio } = item;
  const [thumbnailStatus, setThumbnailStatus] = useState('initial');
  const [loaded, setLoaded] = useState(false);
  const isVideo = type !== 'image';
  const youtubeId = type === 'youtube' ? getYouTubeId(src) : null;
  const thumbnail = type === 'image'
    ? 'https://wsrv.nl/?url=' + encodeURIComponent(src) + '&w=760&q=76&output=webp'
    : 'https://i.ytimg.com/vi/' + youtubeId + '/maxresdefault.jpg';
  const backupThumbnail = type === 'image'
    ? src
    : 'https://i.ytimg.com/vi/' + youtubeId + '/hqdefault.jpg';

  return (
    <li className="gallery-item">
      <button
        type="button"
        className="gallery-card"
        aria-label={'Open ' + (isVideo ? 'video ' : 'photo ') + (index + 1) + ' of ' + total}
        aria-haspopup="dialog"
        onClick={event => onOpen(event.currentTarget.firstElementChild)}
      >
        <span className="gallery-image" style={{ '--media-ratio': mediaRatios[ratio] }}>
          {thumbnailStatus === 'unavailable' ? (
            <span className="gallery-unavailable">{isVideo ? 'Video' : 'Open image'}</span>
          ) : type === 'video' ? (
            <video
              src={src + '#t=0.15'}
              preload="metadata"
              muted
              playsInline
              aria-hidden="true"
              onError={() => setThumbnailStatus('unavailable')}
            />
          ) : (
            <img
              src={thumbnailStatus === 'retry' ? backupThumbnail : thumbnail}
              alt=""
              loading={index < 3 ? 'eager' : 'lazy'}
              decoding="async"
              data-loaded={loaded}
              onLoad={() => setLoaded(true)}
              onError={() => setThumbnailStatus(status => status === 'initial' ? 'retry' : 'unavailable')}
            />
          )}
          <span className={isVideo ? 'gallery-play' : 'gallery-expand'} aria-hidden="true" />
        </span>
      </button>
    </li>
  );
}

function MediaPreview({ preview, onClose }) {
  const { item, origin, index, total } = preview;
  const isPhoto = item.type === 'image';
  const label = (isPhoto ? 'Photo ' : 'Video ') + (index + 1) + ' of ' + total;
  const tileImage = origin.querySelector('img');
  const thumbnail = tileImage?.naturalWidth ? tileImage.currentSrc : '';
  const ratio = isPhoto && tileImage?.naturalWidth
    ? tileImage.naturalWidth + ' / ' + tileImage.naturalHeight
    : mediaRatios[item.ratio];
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  let media;
  if (isPhoto) {
    media = (
      <img
        className="media-viewer-photo"
        src={item.src}
        alt=""
        data-loaded={loaded}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
      />
    );
  } else if (item.type === 'video') {
    media = <video src={item.src} controls playsInline autoPlay onError={() => setFailed(true)} />;
  } else {
    const original = new URL(item.src);
    const params = new URLSearchParams({ autoplay: '1', rel: '0', playsinline: '1' });
    const seconds = original.searchParams.get('t')?.match(/^(\d+)s?$/)?.[1];
    if (seconds) params.set('start', seconds);

    media = (
      <iframe
        src={'https://www.youtube-nocookie.com/embed/' + getYouTubeId(item.src) + '?' + params}
        title={label}
        data-loaded={loaded || !thumbnail}
        onLoad={() => setLoaded(true)}
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  }

  return (
    <AnimatedDialog open className="media-viewer" label={label} origin={origin} onClose={onClose}>
      <form className="media-viewer-actions" method="dialog">
        <button className="media-viewer-close" type="submit" autoFocus>
          Close <span className="close-icon" aria-hidden="true" />
        </button>
      </form>
      <div className="media-viewer-frame" style={{ '--media-ratio': ratio }} data-photo={isPhoto}>
        <div className="media-viewer-content" data-dialog-media>
          {thumbnail && thumbnail !== item.src && <img src={thumbnail} alt="" aria-hidden="true" />}
          {failed && !thumbnail ? <p>Media unavailable.</p> : media}
        </div>
      </div>
    </AnimatedDialog>
  );
}

function ProjectDetail({ project, active, onBack, onExit }) {
  const [category, setCategory] = useState(project.categories[0]);
  const [preview, setPreview] = useState(null);
  const gallery = useRef(null);
  const back = useRef(null);
  const galleryId = useId();

  useLayoutEffect(() => {
    if (active) back.current.focus({ preventScroll: true });
  }, [active]);

  useLayoutEffect(() => {
    gallery.current.scrollTop = 0;
  }, [category]);

  return (
    <div
      className="project-detail"
      data-active={active}
      inert={!active}
      onTransitionEnd={event => {
        if (!active && event.target === event.currentTarget && event.propertyName === 'opacity') onExit();
      }}
    >
      <header className="project-header">
        <ProjectBack onClick={onBack} ref={back}>All Projects</ProjectBack>
      </header>

      <div className="project-layout">
        <aside className="project-sidebar">
          {project.categories.length === 1 ? (
            <h1 className="project-category-title">{category.name}</h1>
          ) : <nav aria-label="Project categories" className="project-categories">
            {project.categories.map(option => (
              <button
                key={option.id}
                type="button"
                aria-current={category === option ? 'true' : undefined}
                aria-controls={galleryId}
                onClick={() => setCategory(option)}
              >
                {option.name}
              </button>
            ))}
          </nav>}

          <section aria-live="polite">
            <div className="project-info" key={category.id}>
              <h2 className="project-info-label">Project Information</h2>
              <dl>
                <div><dt>Role</dt><dd>{category.role}</dd></div>
                <div><dt>Software</dt><dd>{category.software}</dd></div>
                <div><dt>Year</dt><dd>{category.year}</dd></div>
              </dl>
              <div className="project-description">
                {category.description.split(/\r?\n\s*\r?\n/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </section>
        </aside>

        <section id={galleryId} className="project-gallery" ref={gallery} tabIndex={0} aria-label={category.name + ' media'}>
          <ul className="gallery-grid" key={category.id}>
            {category.items.map((item, index) => (
              <MediaCard
                key={index}
                item={item}
                index={index}
                total={category.items.length}
                onOpen={origin => setPreview({ item, origin, index, total: category.items.length })}
              />
            ))}
          </ul>
        </section>
      </div>
      {preview && <MediaPreview preview={preview} onClose={() => setPreview(null)} />}
    </div>
  );
}

export default function Works({ open, project, onProjectChange, onClose }) {
  const index = useRef(null);
  const title = useRef(null);
  const [lastProject, setLastProject] = useState(null);
  const projectTrigger = useRef(null);
  const shownProject = project || lastProject;

  useLayoutEffect(() => {
    if (!open) {
      projectTrigger.current = null;
      return;
    }

    if (project) return;

    if (projectTrigger.current) {
      projectTrigger.current.focus({ preventScroll: true });
    } else {
      index.current.scrollTop = 0;
      title.current.focus({ preventScroll: true });
    }
  }, [open, project]);

  return (
    <section className="works" inert={!open} aria-label="My Works">
      <div className="works-index" ref={index} inert={Boolean(project)} data-detail={Boolean(project)}>
        <GradientASCII
          className="works-background"
          aria-hidden="true"
          colors={['#181818', '#20201e']}
          shape="horizon"
          characters=" =+xX0S8#@"
          cellSize={25}
          density={0.8}
          dpr={1}
          intro={false}
        />
        <div className="works-inner">
          <ProjectBack onClick={onClose}>Back to lanyard</ProjectBack>
          <h1 className="works-title" ref={title} tabIndex={-1}>My Works</h1>
          <ul className="works-grid">
            {portfolioData.projects.map((work, i) => (
              <li key={work.id} style={{ '--entry-delay': 55 * i + 'ms' }}>
                <button
                  type="button"
                  aria-label={work.name}
                  aria-describedby={'description-' + work.id}
                  onClick={event => {
                    projectTrigger.current = event.currentTarget;
                    setLastProject(work);
                    onProjectChange(work);
                  }}
                >
                  <span className="works-grid-name" aria-hidden="true">
                      {(projectTitleLines[work.id] || [work.name]).map((line, idx) => (
                        <span key={idx} className="works-grid-line">{line}</span>
                      ))}
                    </span>
                  <span className="chevron" aria-hidden="true" />
                  <span className="works-grid-description" id={'description-' + work.id}>{projectSummaries[work.id]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {shownProject && (
        <ProjectDetail
          key={shownProject.id}
          project={shownProject}
          active={Boolean(project)}
          onBack={() => onProjectChange(null)}
          onExit={() => setLastProject(null)}
        />
      )}
    </section>
  );
}
