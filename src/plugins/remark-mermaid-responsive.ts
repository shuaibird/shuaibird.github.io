import { visit } from "unist-util-visit";
import type { Root, Code } from "mdast";

type Options = {
  marker?: string;
};

const defaultMarker = "%% mermaid-responsive %%";

function hasResponsiveMeta(meta?: string | null) {
  if (!meta) return false;
  return meta.split(/\s+/).some((token) => token === "responsive");
}

export default function remarkMermaidResponsive(options: Options = {}) {
  const marker = options.marker ?? defaultMarker;
  return (tree: Root) => {
    visit(tree, "code", (node: Code) => {
      if (node.lang !== "mermaid" || !hasResponsiveMeta(node.meta)) return;

      if (node.value.includes(marker)) return;
      node.value = `${marker}\n${node.value}`;
    });
  };
}
