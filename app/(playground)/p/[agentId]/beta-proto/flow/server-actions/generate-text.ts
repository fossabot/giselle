import { type LanguageModelV1, streamObject } from "ai";
import { createArtifactId } from "../../artifact/factory";
import { schema as artifactSchema } from "../../artifact/schema";
import type { ArtifactId } from "../../artifact/types";
import type { Source } from "../source/types";
import { sourcesToText } from "../source/utils";

export interface TextArtifact {
	id: ArtifactId;
	object: "artifact.text";
	title: string;
	content: string;
}
export type BuildTextArtifactInput = Omit<TextArtifact, "id" | "object">;
export function buildTextArtifact(input: BuildTextArtifactInput): TextArtifact {
	return {
		...input,
		object: "artifact.text",
		id: createArtifactId(),
	};
}
interface GenerateArtifactObjectInput {
	model: LanguageModelV1;
	prompt: string;
	sources: Source[];
}
interface GenerateArtifactObjectOptions {
	onStreamPartialObject?: (partialObject: Partial<TextArtifact>) => void;
}
export async function generateArtifactObject({
	input,
	options,
}: {
	input: GenerateArtifactObjectInput;
	options: GenerateArtifactObjectOptions;
}) {
	const system =
		input.sources.length > 0
			? `
 Your primary objective is to fulfill the user's request by utilizing the information provided within the <Source> or <WebPage> tags. Analyze the structured content carefully and leverage it to generate accurate and relevant responses. Focus on addressing the user's needs effectively while maintaining coherence and context throughout the interaction.

 If you use the information provided in the <WebPage>, After each piece of information, add a superscript number for citation (e.g. 1, 2, etc.).

 ${sourcesToText(input.sources)}

 `
			: "You generate an answer to a question. ";

	const { partialObjectStream, object } = await streamObject({
		model: input.model,
		system,
		prompt: input.prompt,
		schema: artifactSchema,
	});

	for await (const partialObject of partialObjectStream) {
		options.onStreamPartialObject?.({
			object: "artifact.text",
			title: partialObject.artifact?.title || "",
			content: partialObject.artifact?.content || "",
		});
	}
	return await object;
}
