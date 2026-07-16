/**
 * Animation utilities - using CSS/RAF to avoid anime.js React bundling conflicts.
 * Stagger-in effects for Dashboard cards, GameHub, etc.
 */
export function staggerIn(selector: string, _options?: { delay?: number; duration?: number; start?: number }) {
  const els = document.querySelectorAll(selector);
  if (els.length === 0) return;

  els.forEach((el, i) => {
    const delay = 100 + i * 80;
    (el as HTMLElement).style.opacity = '0';
    (el as HTMLElement).style.transform = 'translateY(20px)';
    (el as HTMLElement).style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';

    requestAnimationFrame(() => {
      setTimeout(() => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'translateY(0)';
      }, delay);
    });
  });
}

export function staggerCards(selector: string = '[data-animate="card"]') {
  staggerIn(selector, { delay: 100, duration: 500, start: 150 });
}
