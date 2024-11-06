import { openai } from "@ai-sdk/openai";
import { createId } from "@paralleldrive/cuid2";
import { generateText } from "ai";
import Langfuse from "langfuse";

export async function POST() {
	// const lf = new Langfuse();
	// const trace = lf.trace({
	// 	id: `toyama-${createId()}`,
	// });
	const { text } = await generateText({
		model: openai("gpt-4o-mini"),
		prompt: "What's up?",
		experimental_telemetry: { isEnabled: true },
	});
	return Response.json({ message: text });
}
