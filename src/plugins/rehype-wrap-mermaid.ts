import { visit } from "unist-util-visit";
import type { Root, Parent, Element } from "hast";

/**
 * Wrap Mermaid's rendered <svg id="mermaid-..."> in a div.mermaid
 * so build output matches dev structure.
 *
 * Must run AFTER rehype-mermaid.
 */
export default function rehypeWrapMermaid() {
  return (tree: Root) => {
    visit(
      tree,
      "element",
      (
        node: Element,
        index: number | undefined,
        parent: Parent | undefined,
      ) => {
        if (
          index === undefined ||
          !parent ||
          node.tagName !== "svg" ||
          typeof node.properties?.id !== "string" ||
          !node.properties.id.startsWith("mermaid-")
        ) {
          return;
        }

        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { className: ["mermaid"] },
          children: [node],
        };
      },
    );
  };
}
