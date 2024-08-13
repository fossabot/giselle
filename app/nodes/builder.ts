import {
	type BaseSchema,
	never,
	number,
	object,
	string,
	unknown,
} from "valibot";
import type {
	DefaultPort,
	DefaultPortType,
	DefaultPorts,
	NodeClass,
	NodeClassCategory,
	NodeClassOptions,
} from "./type";

type CreatePortArgs<TType extends DefaultPortType, TName extends string> = {
	name: TName;
	type: TType;
};
export function buildDefaultPort<
	TType extends DefaultPortType,
	TName extends string,
>(args: CreatePortArgs<TType, TName>): DefaultPort<TType, TName> {
	return args;
}

export function buildNodeClass<
	NodeName extends string,
	Category extends NodeClassCategory,
	TDefaultPorts extends DefaultPorts<any, any>,
	DataSchema extends BaseSchema<any, any, any> = never,
>(
	nodeName: NodeName,
	options: NodeClassOptions<Category, TDefaultPorts, DataSchema>,
): NodeClass<NodeName, Category, TDefaultPorts, DataSchema> {
	return {
		name: nodeName,
		category: options.category,
		defaultPorts: options.defaultPorts,
		dataSchema: options.dataSchema,
		panel: options.panel,
	};
}
// const onRequest = buildNodeClass("onRequest", {
// 	category: NodeClassCategory.Core,
// 	defaultPorts: {
// 		outputPorts: [buildPort({ type: PortType.Execution, name: "to" })],
// 	},
// });

// const response = buildNodeClass("response", {
// 	category: NodeClassCategory.Core,
// 	defaultPorts: {
// 		inputPorts: [
// 			buildPort({ type: PortType.Execution, name: "from" }),
// 			buildPort({ type: PortType.Data, name: "Output" }),
// 		],
// 	},
// });

// const text = buildNodeClass("text", {
// 	category: NodeClassCategory.Core,
// 	defaultPorts: {
// 		outputPorts: [buildPort({ type: PortType.Data, name: "text" })],
// 	},
// 	dataSchema: object({
// 		content: string(),
// 	}),
// 	defaultData: {
// 		content: "",
// 	},
// });

// export const textGeneration = buildNodeClass("textGeneration", {
// 	category: NodeClassCategory.Core,
// 	defaultPorts: {
// 		inputPorts: [
// 			buildPort({ type: PortType.Execution, name: "from" }),
// 			buildPort({ type: PortType.Data, name: "instruction" }),
// 		],
// 		outputPorts: [
// 			buildPort({ type: PortType.Execution, name: "to" }),
// 			buildPort({ type: PortType.Data, name: "result" }),
// 		],
// 	},
// });

// export const agent = buildNodeClass("agent", {
// 	category: NodeClassCategory.Agent,
// 	defaultPorts: {
// 		inputPorts: [buildPort({ type: PortType.Execution, name: "from" })],
// 		outputPorts: [buildPort({ type: PortType.Execution, name: "to" })],
// 	},
// 	dataSchema: object({
// 		agent: object({
// 			id: number(),
// 			blueprintId: number(),
// 			name: string(),
// 		}),
// 	}),
// });
