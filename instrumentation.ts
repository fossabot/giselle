import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import * as Sentry from "@sentry/nextjs";
import { registerOTel } from "@vercel/otel";

export const metricReader = new PeriodicExportingMetricReader({
	exporter: new OTLPMetricExporter({
		url: "https://ingest.us.signoz.cloud:443/v1/metrics",
		headers: {
			"signoz-access-token": process.env.SIGNOZ_INGESTION_TOKEN,
		},
	}),
});

export async function register() {
	registerOTel({
		serviceName: "giselle",
		attributes: {
			environment: process.env.VERCEL_ENV || "not-set",
		},
		metricReader: metricReader,
	});

	if (process.env.NEXT_RUNTIME === "nodejs") {
		await import("./sentry.server.config");
	}

	if (process.env.NEXT_RUNTIME === "edge") {
		await import("./sentry.edge.config");
	}
}

export const onRequestError = Sentry.captureRequestError;
