import { number, object, string } from "valibot";
import { buildDefaultPort, buildNodeClass } from "../../builder";
import { DefaultPortType, NodeClassCategory } from "../../type";

export const agent = buildNodeClass("agent", {
	categories: [NodeClassCategory.LLM],
	defaultPorts: {
		inputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "from" }),
		],
		outputPorts: [
			buildDefaultPort({ type: DefaultPortType.Execution, name: "to" }),
			buildDefaultPort({ type: DefaultPortType.Data, name: "result" }),
		],
	},
	dataSchema: object({
		relevantAgent: object({
			id: number(),
			blueprintId: number(),
			name: string(),
		}),
	}),
	action: async () => {},
});
