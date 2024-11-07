import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import {
	BatchLogRecordProcessor,
	ConsoleLogRecordExporter,
	LoggerProvider,
} from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import {
	ConsoleSpanExporter,
	SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-node";
import { registerOTel } from "@vercel/otel";

// SDK初期化関数
function initializeOtelSDK() {
	console.log("Initializing OTEL SDK------------------------");

	const headers = {
		"signoz-access-token": process.env.SIGNOZ_INGESTION_TOKEN,
	};

	// Metric Exporter
	const metricExporter = new OTLPMetricExporter({
		url: "https://ingest.us.signoz.cloud:443/v1/metrics",
		headers,
	});

	const metricReader = new PeriodicExportingMetricReader({
		exporter: metricExporter,
		exportIntervalMillis: 14000,
		exportTimeoutMillis: 13000,
	});

	// Trace Exporter
	const traceExporter = new OTLPTraceExporter({
		url: "https://ingest.us.signoz.cloud:443/v1/traces",
		headers,
	});

	const spanProcessor = new BatchSpanProcessor(traceExporter);
	const debugSpanProcessor = new SimpleSpanProcessor(new ConsoleSpanExporter());

	// Log Exporter
	const logExporter = new OTLPLogExporter({
		url: "https://ingest.us.signoz.cloud:443/v1/logs",
		headers,
	});

	const loggerProvider = new LoggerProvider();
	loggerProvider.addLogRecordProcessor(
		new BatchLogRecordProcessor(logExporter),
	);
	loggerProvider.addLogRecordProcessor(
		new BatchLogRecordProcessor(new ConsoleLogRecordExporter()),
	);

	registerOTel({
		serviceName: "giselle",
		metricReader,
		spanProcessors: [spanProcessor, debugSpanProcessor],
		traceExporter,
		logRecordProcessor: new BatchLogRecordProcessor(logExporter),
	});
	diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
	console.log("-- OTEL registered with metrics, traces, and logs --");
}

// instrumentationのエントリーポイントで初期化を実行
initializeOtelSDK();
