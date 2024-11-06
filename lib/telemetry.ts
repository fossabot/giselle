import { type Logger, SeverityNumber } from "@opentelemetry/api-logs";
import type { LoggerProvider } from "@opentelemetry/sdk-logs";
import type { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import type { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";

type TelemetryState = {
	metricReader: PeriodicExportingMetricReader;
	loggerProvider: LoggerProvider;
	spanProcessor: BatchSpanProcessor;
	logger: Logger;
} | null;

let telemetryState: TelemetryState = null;

export function setTelemetryState(state: TelemetryState) {
	telemetryState = state;
}

export async function flushTelemetry() {
	if (!telemetryState) {
		console.warn("OTEL state not initialized, skipping telemetry flush");
		return;
	}

	try {
		log(SeverityNumber.INFO, "Exporting telemetry data", {
			runtime: process.env.NEXT_RUNTIME ?? "",
			environment: process.env.VERCEL_ENV ?? "",
		});

		await Promise.all([
			telemetryState.metricReader.forceFlush(),
			telemetryState.loggerProvider.forceFlush(),
			telemetryState.spanProcessor.forceFlush(),
			new Promise((resolve) => setTimeout(resolve, 10000)),
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
	}
}

export function log(
	severity: SeverityNumber,
	message: string,
	attributes?: Record<string, string>,
) {
	if (!telemetryState?.logger) {
		console.warn("Logger not initialized, falling back to console");
		const consoleMethod =
			severity <= SeverityNumber.INFO ? console.log : console.error;
		consoleMethod(message, attributes);
		return;
	}

	const consoleMethod =
		severity <= SeverityNumber.INFO ? console.log : console.error;
	consoleMethod(message, attributes);

	telemetryState.logger.emit({
		severityNumber: severity,
		body: message,
		attributes,
	});
}
