import { Fragment, type ReactNode } from "react";
import {
  parseCapsuleRichText,
  type CapsuleRichNode,
} from "@/mocks/fixtures/time-capsules";

function renderCapsuleNodes(nodes: CapsuleRichNode[]): ReactNode {
  return nodes.map((node, index) => {
    if (node.type === "text") return <Fragment key={index}>{node.value}</Fragment>;
    if (node.type === "br") return <br key={index} />;
    const children = renderCapsuleNodes(node.children);
    if (node.tag === "p") {
      return (
        <span key={index} className="mb-3 block last:mb-0">
          {children}
        </span>
      );
    }
    if (node.tag === "b" || node.tag === "strong") {
      return (
        <strong key={index} className="font-bold">
          {children}
        </strong>
      );
    }
    if (node.tag === "em" || node.tag === "i") {
      return (
        <em key={index} className="italic">
          {children}
        </em>
      );
    }
    return (
      <u key={index} className="underline">
        {children}
      </u>
    );
  });
}

export function CapsuleRichText({ value }: { value: string }) {
  return <>{renderCapsuleNodes(parseCapsuleRichText(value))}</>;
}
