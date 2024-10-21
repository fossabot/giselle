import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { registerOTel } from "@vercel/otel";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";


export const metricReader = new PeriodicExportingMetricReader({
	exporter: new OTLPMetricExporter({
		url: "https://ingest.us.signoz.cloud:443/v1/metrics",
		headers: {
			"signoz-access-token": process.env.SIGNOZ_INGESTION_TOKEN,
		},
	}),
        exportIntervalMillis: 10000,
});


registerOTel({
        serviceName: "giselle",
        attributes: {
                environment: process.env.VERCEL_ENV || "not-set",
        },
        metricReader: metricReader,
});

console.log("runtime:", process.env.NEXT_RUNTIME)
console.log("--OTEL registered---")
