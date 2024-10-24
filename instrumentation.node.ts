import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import {
	ConsoleSpanExporter,
	SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { registerOTel } from "@vercel/otel";

const header = {
	"signoz-access-token": process.env.SIGNOZ_INGESTION_TOKEN,
};

// Metric Exporter
const metricExporter = new OTLPMetricExporter({
	url: "https://ingest.us.signoz.cloud:443/v1/metrics",
	headers: header,
});

export const metricReader = new PeriodicExportingMetricReader({
	exporter: metricExporter,
	exportIntervalMillis: 10000,
});

// Trace Exporter
const traceExporter = new OTLPTraceExporter({
	url: "https://ingest.us.signoz.cloud:443/v1/traces",
	headers: header,
});

const spanProcessor = new BatchSpanProcessor(traceExporter);

// For debug purposes, you can also use SimpleSpanProcessor with ConsoleSpanExporter
const debugSpanProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter());

registerOTel({
	serviceName: "research-nextjs-vercel-telemetry",
	metricReader: metricReader,
	spanProcessors: [spanProcessor, debugSpanProcessor],
	traceExporter: traceExporter,
});

console.log("-- OTEL registered");
