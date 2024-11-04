import {
	DiagConsoleLogger,
	DiagLogLevel,
	diag,
	metrics,
	trace,
} from "@opentelemetry/api";
import { SeverityNumber } from "@opentelemetry/api-logs";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import {
	BatchLogRecordProcessor,
	ConsoleLogRecordExporter,
	LoggerProvider,
} from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
	ConsoleSpanExporter,
	SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";

const headers = {
	"signoz-access-token": process.env.SIGNOZ_INGESTION_TOKEN,
};

// Metric Exporter
const metricExporter = new OTLPMetricExporter({
	url: "https://ingest.us.signoz.cloud:443/v1/metrics",
	headers,
});

export const metricReader = new PeriodicExportingMetricReader({
	exporter: metricExporter,
	exportIntervalMillis: 10000,
});

// Trace Exporter
const traceExporter = new OTLPTraceExporter({
	url: "https://ingest.us.signoz.cloud:443/v1/traces",
	headers,
});

const spanProcessor = new BatchSpanProcessor(traceExporter);

// For debug purposes, you can also use SimpleSpanProcessor with ConsoleSpanExporter
const debugSpanProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter());

// Log Exporter
const logExporter = new OTLPLogExporter({
	url: "https://ingest.us.signoz.cloud:443/v1/logs",
	headers,
});

export const loggerProvider = new LoggerProvider();
loggerProvider.addLogRecordProcessor(new BatchLogRecordProcessor(logExporter));

// Only add ConsoleLogRecordExporter in development
if (process.env.NODE_ENV !== "production") {
	loggerProvider.addLogRecordProcessor(
		new BatchLogRecordProcessor(new ConsoleLogRecordExporter()),
	);
}

const logRecordProcessor = new BatchLogRecordProcessor(logExporter);
loggerProvider.addLogRecordProcessor(logRecordProcessor);

const sdk = new NodeSDK({
	resource: new Resource({
		[SemanticResourceAttributes.SERVICE_NAME]: "giselle",
		environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "not-set",
	}),
	metricReader: metricReader,
	spanProcessors: [spanProcessor, debugSpanProcessor],
	traceExporter: traceExporter,
	logRecordProcessor: logRecordProcessor,
});
sdk.start();

export const logger = loggerProvider.getLogger("giselle");
console.log("-- OTEL registered with metrics, traces, and logs --");

diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

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
