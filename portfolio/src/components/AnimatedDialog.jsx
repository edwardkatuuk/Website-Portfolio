import { useLayoutEffect, useRef } from 'react';

function originTransform(surface, origin) {
  const tile = origin?.getBoundingClientRect();
  const frame = surface.parentElement.getBoundingClientRect();
  if (!tile?.width || !tile.height || !frame.width || !frame.height) {
    return 'translateY(10px) scale(0.96)';
  }

  const x = tile.left + tile.width / 2 - frame.left - frame.width / 2;
  const y = tile.top + tile.height / 2 - frame.top - frame.height / 2;
  return 'translate(' + x + 'px, ' + y + 'px) scale('
    + tile.width / frame.width + ', ' + tile.height / frame.height + ')';
}

function playDialogMotion(dialog, origin, previous, closing = false) {
  const style = getComputedStyle(dialog);
  const media = dialog.querySelector('[data-dialog-media]');
  const surface = media || dialog;
  const opacity = Number(style.opacity);
  const currentTransform = getComputedStyle(surface).transform;
  previous.forEach(animation => animation.cancel());

  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return [];

  const rest = 'translateY(0) scale(1)';
  const offset = media ? originTransform(surface, origin) : 'translateY(12px) scale(0.97)';
  const movement = closing ? [currentTransform, offset] : [offset, rest];
  const fade = closing ? [opacity, 0] : [media ? 0.45 : 0, 1];
  const timing = {
    duration: closing ? 280 : media ? 460 : 360,
    easing: style.getPropertyValue(closing ? '--ease-in-out' : '--ease-out').trim(),
    fill: closing ? 'forwards' : 'none'
  };

  return media
    ? [dialog.animate({ opacity: fade }, timing), media.animate({ transform: movement }, timing)]
    : [dialog.animate({ opacity: fade, transform: movement }, timing)];
}

export default function AnimatedDialog({ open, onClose, children, className, label, labelledBy, origin }) {
  const node = useRef(null);
  const animations = useRef([]);

  useLayoutEffect(() => {
    if (!open || node.current.open) return;
    const dialog = node.current;
    dialog.showModal();
    animations.current = playDialogMotion(dialog, origin, animations.current);
  }, [open, origin]);

  async function dismiss(event) {
    event.preventDefault();
    const dialog = node.current;
    if (!dialog.open || dialog.hasAttribute('data-closing')) return;

    dialog.setAttribute('data-closing', '');
    animations.current = playDialogMotion(dialog, origin, animations.current, true);
    await Promise.allSettled(animations.current.map(animation => animation.finished));
    if (dialog.open) dialog.close();
  }

  function close() {
    animations.current.forEach(animation => animation.cancel());
    animations.current = [];
    node.current.removeAttribute('data-closing');
    onClose();
  }

  function handleClick(event) {
    const dialog = event.currentTarget;
    if (event.target !== dialog || event.detail === 0) return;
    const bounds = dialog.getBoundingClientRect();
    if (origin || event.clientX < bounds.left || event.clientX > bounds.right
      || event.clientY < bounds.top || event.clientY > bounds.bottom) {
      void dismiss(event);
    }
  }

  return (
    <dialog
      ref={node}
      className={'animated-dialog ' + className}
      aria-label={label}
      aria-labelledby={labelledBy}
      onClose={close}
      onCancel={dismiss}
      onSubmit={dismiss}
      onClick={handleClick}
    >
      {children}
    </dialog>
  );
}
