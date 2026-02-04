import mermaid from "mermaid";

const RESPONSIVE_MARKER = "%% mermaid-responsive %%";
const BREAKPOINT = 720;
const directionPattern = /^(\s*(?:flowchart|graph)\s+)(LR|RL|TB|TD|BT)\b/m;

const getDirection = () => (window.innerWidth <= BREAKPOINT ? "TB" : "LR");

const getTheme = () => {
  const htmlTheme = document.documentElement.getAttribute("data-theme");
  const bodyTheme = document.body?.getAttribute("data-theme");
  const dataTheme = htmlTheme || bodyTheme;
  if (dataTheme === "dark") return "dark";
  if (dataTheme === "light") return "default";
  return "forest";
};

const baseCache = new WeakMap<HTMLElement, string>();
const getBaseDiagram = (el: HTMLElement) => {
  const cached = baseCache.get(el);
  if (cached) return cached;
  const stored = el.getAttribute("data-diagram");
  const base =
    stored && stored.trim().length > 0 ? stored : el.textContent || "";
  baseCache.set(el, base);
  return base;
};

const isResponsive = (diagram: string) => diagram.includes(RESPONSIVE_MARKER);
const setDirection = (diagram: string, dir: "LR" | "TB") =>
  diagram.replace(directionPattern, `$1${dir}`);

async function renderResponsive(options: { force?: boolean } = {}) {
  const force = options.force === true;
  const nodes = Array.from(
    document.querySelectorAll<HTMLElement>("pre.mermaid"),
  );
  const responsive = nodes.filter((el) => isResponsive(getBaseDiagram(el)));
  if (responsive.length === 0) return;

  mermaid.initialize({
    startOnLoad: false,
    theme: getTheme(),
    gitGraph: {
      mainBranchName: "main",
      showCommitLabel: true,
      showBranches: true,
      rotateCommitLabel: true,
    },
  });

  const direction = getDirection();

  await Promise.all(
    responsive.map(async (el) => {
      if (!force && el.dataset.responsiveDir === direction) return;

      const base = getBaseDiagram(el);
      const diagram = setDirection(base, direction);
      const id = `mermaid-responsive-${Math.random().toString(36).slice(2, 11)}`;

      try {
        const result = await mermaid.render(id, diagram);
        el.innerHTML = result.svg;
        el.dataset.responsiveDir = direction;
        el.setAttribute("data-processed", "true");
      } catch (error) {
        console.error("[mermaid-responsive] render error", error);
      }
    }),
  );
}

let resizeTimer: ReturnType<typeof setTimeout> | null = null;
const onResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => renderResponsive(), 150);
};

document.addEventListener("DOMContentLoaded", () => {
  renderResponsive({ force: true });
});

document.addEventListener("astro:after-swap", () => {
  renderResponsive({ force: true });
});

window.addEventListener("resize", onResize);

const themeObserver = new MutationObserver(() =>
  renderResponsive({ force: true }),
);
themeObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["data-theme"],
});
if (document.body) {
  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });

  const processedObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (
        mutation.type === "attributes" &&
        mutation.attributeName === "data-processed"
      ) {
        const target = mutation.target;
        if (target instanceof HTMLElement && target.matches("pre.mermaid")) {
          const base = getBaseDiagram(target);
          if (isResponsive(base)) {
            renderResponsive({ force: true });
            break;
          }
        }
      }
    }
  });

  processedObserver.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ["data-processed"],
  });
}
