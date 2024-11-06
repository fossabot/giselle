import * as Sentry from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";
import { LangfuseExporter } from "langfuse-vercel";

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./sentry.server.config");
	}

	if (process.env.NEXT_RUNTIME === "edge") {
		await import("./sentry.edge.config");
	}

	registerOTel({
		serviceName: "langfuse-vercel-ai-nextjs-example",
		traceExporter: new LangfuseExporter({ debug: true }),
	});
}

export const onRequestError = Sentry.captureRequestError;
