import { setTelemetryState } from "@/lib/telemetry";
import { DiagConsoleLogger, DiagLogLevel, diag } from "@opentelemetry/api";
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
		exportIntervalMillis: 10000,
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

	const sdk = new NodeSDK({
		resource: new Resource({
			[SemanticResourceAttributes.SERVICE_NAME]: "giselle",
			environment: process.env.NEXT_PUBLIC_VERCEL_ENV || "not-set",
		}),
		metricReader,
		spanProcessors: [spanProcessor, debugSpanProcessor],
		traceExporter,
		logRecordProcessor: new BatchLogRecordProcessor(logExporter),
	});

	sdk.start();
	const logger = loggerProvider.getLogger("giselle");
	diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
	console.log("-- OTEL registered with metrics, traces, and logs --");

	// テレメトリーの状態を保存
	setTelemetryState({
		metricReader,
		loggerProvider,
		spanProcessor,
		logger,
	});
}

// instrumentationのエントリーポイントで初期化を実行
initializeOtelSDK();
