"use server";
import { logger, loggerProvider, metricReader } from "@/instrumentation";
import {
	DiagConsoleLogger,
	DiagLogLevel,
	diag,
	metrics,
} from "@opentelemetry/api";
import { SeverityNumber, logs } from "@opentelemetry/api-logs";
import { waitUntil } from "@vercel/functions";

// Enable debug logging for OpenTelemetry
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);

const meter = metrics.getMeter("server action");
const counter = meter.createCounter("function_call", {
	description: "number of function calls",
});

// Helper function to log to both console and OpenTelemetry
type AttributeValue = string | number | boolean | AttributeObject;
interface AttributeObject {
	[key: string]: AttributeValue;
}

function log(
	severity: SeverityNumber,
	message: string,
	attributes?: Record<string, AttributeValue>,
) {
	// Log to console
	const consoleMethod =
		severity <= SeverityNumber.INFO ? console.log : console.error;
	consoleMethod(message, attributes);

	// Log to OpenTelemetry
	logger.emit({ severityNumber: severity, body: message, attributes });
}

export async function async_counter() {
	log(
		SeverityNumber.INFO,
		"async_counter() start ---------------------------------",
	);
	const start = Date.now();
	await new Promise((resolve) => setTimeout(resolve, 1000));
	counter.add(1, {
		function: "async_counter",
		environment: process.env.VERCEL_ENV || "development",
	});
	const end = Date.now();
	log(
		SeverityNumber.INFO,
		`-----------------------------async_counter() duration: ${end - start}ms`,
	);
	return;
}
