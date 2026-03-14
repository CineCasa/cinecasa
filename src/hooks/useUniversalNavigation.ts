import { useEffect } from "react";

const FOCUSABLE_SELECTOR = '[tabindex="0"], button:not([disabled]), a[href], input:not([disabled]), select:not([disabled])';

const getCenter = (el: HTMLElement) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

const findBestCandidate = (
  current: HTMLElement,
  direction: "up" | "down" | "left" | "right"
) => {
  const all = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
    .filter(el => {
      if (el === current) return false;
      const r = el.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden";
    });

  const c = getCenter(current);
  let best: HTMLElement | null = null;
  let bestDist = Infinity;

  for (const el of all) {
    const t = getCenter(el);
    let isValid = false;

    switch (direction) {
      case "up": isValid = t.y < c.y - 10; break;
      case "down": isValid = t.y > c.y + 10; break;
      case "left": isValid = t.x < c.x - 10; break;
      case "right": isValid = t.x > c.x + 10; break;
    }

    if (!isValid) continue;

    const dx = t.x - c.x;
    const dy = t.y - c.y;
    // Weight: primary axis distance + secondary axis penalty
    let dist: number;
    if (direction === "up" || direction === "down") {
      dist = Math.abs(dy) + Math.abs(dx) * 0.3;
    } else {
      dist = Math.abs(dx) + Math.abs(dy) * 0.3;
    }

    if (dist < bestDist) {
      bestDist = dist;
      best = el;
    }
  }

  return best;
};

export const useUniversalNavigation = () => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

      let direction: "up" | "down" | "left" | "right" | null = null;
      switch (e.key) {
        case "ArrowUp": direction = "up"; break;
        case "ArrowDown": direction = "down"; break;
        case "ArrowLeft": direction = "left"; break;
        case "ArrowRight": direction = "right"; break;
        case "Enter":
          if (document.activeElement && document.activeElement !== document.body) {
            (document.activeElement as HTMLElement).click();
            e.preventDefault();
          }
          return;
        default: return;
      }

      e.preventDefault();
      const active = document.activeElement as HTMLElement;
      
      if (!active || active === document.body) {
        // Focus first focusable element
        const first = document.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
        first?.focus();
        return;
      }

      const next = findBestCandidate(active, direction);
      if (next) {
        next.focus();
        next.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);
};
