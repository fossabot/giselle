import * as Sentry from "@sentry/nextjs";

export async function register() {
	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./instrumentation.node");
		await import("./sentry.server.config");
	}

	if (process.env.NEXT_RUNTIME === "edge") {
		await import("./sentry.edge.config");
	}
}

export const onRequestError = Sentry.captureRequestError;

export function log(
	severity: SeverityNumber,
	message: string,
	attributes?: Record<string, string>,
) {
	const consoleMethod =
		severity <= SeverityNumber.INFO ? console.log : console.error;
	consoleMethod(message, attributes);

	logger.emit({ severityNumber: severity, body: message, attributes });
}

export async function flushTelemetry() {
	try {
		log(SeverityNumber.INFO, "Exporting telemetry data", {
			runtime: process.env.NEXT_RUNTIME ?? "",
			environment: process.env.VERCEL_ENV ?? "",
		});

		await Promise.all([
			metricReader.forceFlush(),
			loggerProvider.forceFlush(),
			spanProcessor.forceFlush(),
			new Promise((resolve) => setTimeout(resolve, 10000)), // wait for exporting
		]);

		log(SeverityNumber.INFO, "flushTelemetry() completed", {
			runtime: process.env.NEXT_RUNTIME ?? "",
			environment: process.env.VERCEL_ENV ?? "",
		});
	} catch (error) {
		log(SeverityNumber.ERROR, "Error in flushTelemetry():", {
			error: error instanceof Error ? error.message : String(error),
			runtime: process.env.NEXT_RUNTIME ?? "",
			environment: process.env.VERCEL_ENV ?? "",
		});
		throw error;
	}
}
