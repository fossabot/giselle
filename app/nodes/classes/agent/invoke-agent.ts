"use server";

import type { Node } from "@/app/agents/blueprints";
import { createRequest, leaveMessage } from "@/app/agents/requests";
import {
	agents,
	db,
	nodeRepresentedAgents,
	portRepresentedAgentPorts,
	pullMessages,
	requestResults,
	requests,
	steps,
} from "@/drizzle";
import { logger, runs } from "@trigger.dev/sdk/v3";
import { and, asc, eq } from "drizzle-orm";

const waitForRun = async (
	runId: string,
	maxAttempts = 120,
	interval = 1000,
): Promise<void> => {
	let attempts = 0;

	while (attempts < maxAttempts) {
		logger.log(`attempt: ${attempts}`);
		const run = await runs.retrieve(runId);
		logger.log(JSON.stringify(run.attempts));

		switch (run.status) {
			case "COMPLETED":
				return;
			case "FAILED":
				throw new Error("Run failed");
			case "CANCELED":
				throw new Error("Run was cancelled");
			default:
				// If the status is still pending or in progress, we continue waiting
				await new Promise((resolve) => setTimeout(resolve, interval));
				attempts++;
		}
	}

	// If we've exceeded the maximum number of attempts, we throw an error
	throw new Error(
		`Timeout: Run did not complete within ${(maxAttempts * interval) / 1000} seconds`,
	);
};

type InvokeAgentArgs = {
	requestId: number;
	node: Node;
	resultPortId: number;
};

export const invokeAgent = async ({
	requestId,
	node,
	resultPortId,
}: InvokeAgentArgs) => {
	const messages = await db
		.with(pullMessages)
		.select()
		.from(pullMessages)
		.where(
			and(
				eq(pullMessages.requestId, requestId),
				eq(pullMessages.nodeId, node.id),
			),
		);
	const [relevantAgent] = await db
		.select({
			agentId: nodeRepresentedAgents.representedAgentId,
			blueprintId: nodeRepresentedAgents.representedBlueprintId,
		})
		.from(agents)
		.innerJoin(
			nodeRepresentedAgents,
			eq(nodeRepresentedAgents.nodeId, node.id),
		);

	const createdReqesut = await createRequest(
		relevantAgent.blueprintId,
		messages.map(({ content, representedAgentPortId }) => ({
			port: {
				id: representedAgentPortId,
			},
			message: content,
		})),
	);

	await waitForRun(createdReqesut.triggerRunId);

	const [relevantAgentRequestResult] = await db
		.select({ text: requestResults.text })
		.from(requestResults)
		.where(eq(requestResults.requestId, requestId));

	logger.log(`messages: ${JSON.stringify({ relevantAgentRequestResult })}`);
	await leaveMessage({
		requestId: requestId,
		portId: resultPortId,
		message: relevantAgentRequestResult.text,
	});
};
