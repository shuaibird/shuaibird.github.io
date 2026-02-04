import { visit, SKIP } from "unist-util-visit";
import { toText } from "hast-util-to-text";
import type { Root, Element, Parent } from "hast";

type Options = {
  marker?: string;
};

const defaultMarker = "%% mermaid-responsive %%";
const directionPattern = /^(\s*(?:flowchart|graph)\s+)(LR|RL|TB|TD|BT)\b/m;

function cloneNode<T>(node: T): T {
  return JSON.parse(JSON.stringify(node)) as T;
}

function setDiagram(preNode: Element, diagram: string) {
  const codeNode = preNode.children?.find(
    (child): child is Element =>
      child.type === "element" && child.tagName === "code",
  );
  if (!codeNode) return;

  codeNode.children = [{ type: "text", value: diagram }];
}

function replaceDirection(diagram: string, direction: "LR" | "TB") {
  return diagram.replace(directionPattern, `$1${direction}`);
}

function hasMermaidClass(node: Element) {
  const className = node.properties?.className;
  if (typeof className === "string") return className.split(/\s+/);
  if (Array.isArray(className)) return className;
  return [];
}

export default function rehypeMermaidResponsive(options: Options = {}) {
  const marker = options.marker ?? defaultMarker;

  return (tree: Root) => {
    visit(
      tree,
      "element",
      (
        node: Element,
        index: number | undefined,
        parent: Parent | undefined,
      ) => {
        if (node.tagName !== "pre" || index === undefined || !parent) return;

        const codeNode = node.children?.find(
          (child): child is Element =>
            child.type === "element" && child.tagName === "code",
        );
        if (!codeNode) return;

        const classList = hasMermaidClass(codeNode);
        if (!classList.includes("language-mermaid")) return;

        const diagram = toText(codeNode, { whitespace: "pre" });
        if (!diagram.includes(marker)) return;

        const cleaned = diagram.replace(/^%% mermaid-responsive %%\s*\n?/, "");

        const preLR = cloneNode(node);
        setDiagram(preLR, replaceDirection(cleaned, "LR"));

        const preTB = cloneNode(node);
        setDiagram(preTB, replaceDirection(cleaned, "TB"));

        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["mermaid-responsive"] },
          children: [
            {
              type: "element",
              tagName: "div",
              properties: {
                className: [
                  "mermaid-responsive__item",
                  "mermaid-responsive__item--lr",
                ],
              },
              children: [preLR],
            },
            {
              type: "element",
              tagName: "div",
              properties: {
                className: [
                  "mermaid-responsive__item",
                  "mermaid-responsive__item--tb",
                ],
              },
              children: [preTB],
            },
          ],
        };
        return SKIP;
      },
    );
  };
}
