import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { registerOTel } from "@vercel/otel";

const header = {
	"signoz-access-token": process.env.SIGNOZ_INGESTION_TOKEN,
};

// Configure OTLP trace exporter
const traceExporter = new OTLPTraceExporter({
	url: "https://ingest.us.signoz.cloud:443/v1/traces",
	headers: header,
});

// Configure OTLP metrics exporter
const otlpMetricsExporter = new OTLPMetricExporter({
	url: "https://ingest.us.signoz.cloud:443/v1/metrics",
	headers: header,
});

// Define resource with service name
registerOTel({
	serviceName: "giselle",
	metricReader: new PeriodicExportingMetricReader({
		exporter: otlpMetricsExporter,
		exportIntervalMillis: 10000,
	}),
	traceExporter: traceExporter,
});
console.log("OTEL SDK initialized");
