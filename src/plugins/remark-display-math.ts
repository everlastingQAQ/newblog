import type { Paragraph, Parent, PhrasingContent, Root, RootContent } from "mdast";
import type { Plugin } from "unified";

type PositionedNode = {
	position?: {
		start?: { offset?: number };
		end?: { offset?: number };
	};
};

type InlineMathNode = PositionedNode & {
	type: "inlineMath";
	value: string;
};

function getDoubleDollarInlineMath(node: PhrasingContent, source: string): InlineMathNode | undefined {
	const candidate = node as Partial<InlineMathNode> & { type?: string; value?: unknown };
	if (candidate.type !== "inlineMath" || typeof candidate.value !== "string") return undefined;

	const start = candidate.position?.start?.offset;
	const end = candidate.position?.end?.offset;
	if (typeof start !== "number" || typeof end !== "number") return undefined;

	const raw = source.slice(start, end).trim();
	if (!raw.startsWith("$$") || !raw.endsWith("$$")) return undefined;

	return candidate as InlineMathNode;
}

function hasMeaningfulContent(children: PhrasingContent[]) {
	return children.some((child) => {
		const maybeText = child as PhrasingContent & { value?: unknown };
		return child.type !== "text" || (typeof maybeText.value === "string" && maybeText.value.trim().length > 0);
	});
}

function createDisplayMathNode(node: InlineMathNode): RootContent {
	return {
		data: {
			hChildren: [
				{
					children: [{ type: "text", value: node.value }],
					properties: { className: ["language-math", "math-display"] },
					tagName: "code",
					type: "element",
				},
			],
			hName: "pre",
		},
		meta: null,
		position: node.position,
		type: "math",
		value: node.value,
	} as RootContent;
}

function createParagraph(source: Paragraph, children: PhrasingContent[]): RootContent {
	return {
		...source,
		children,
	} as RootContent;
}

function splitParagraphMath(node: Paragraph, source: string): RootContent[] | undefined {
	const replacement: RootContent[] = [];
	let paragraphChildren: PhrasingContent[] = [];
	let changed = false;

	const flushParagraph = () => {
		if (!hasMeaningfulContent(paragraphChildren)) {
			paragraphChildren = [];
			return;
		}

		replacement.push(createParagraph(node, paragraphChildren));
		paragraphChildren = [];
	};

	for (const child of node.children) {
		const inlineMath = getDoubleDollarInlineMath(child, source);
		if (inlineMath) {
			changed = true;
			flushParagraph();
			replacement.push(createDisplayMathNode(inlineMath));
			continue;
		}

		paragraphChildren.push(child);
	}

	flushParagraph();

	return changed ? replacement : undefined;
}

function transformChildren(parent: Parent, source: string) {
	for (let index = 0; index < parent.children.length; index++) {
		const child = parent.children[index];

		if (child.type === "paragraph") {
			const replacement = splitParagraphMath(child, source);
			if (replacement) {
				parent.children.splice(index, 1, ...replacement);
				index += replacement.length - 1;
				continue;
			}
		}

		if ("children" in child && Array.isArray(child.children)) {
			transformChildren(child as Parent, source);
		}
	}
}

export const remarkDisplayMath: Plugin<[], Root> = () => (tree, file) => {
	transformChildren(tree, String(file.value));
};
