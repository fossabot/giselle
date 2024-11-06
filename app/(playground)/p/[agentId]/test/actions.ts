"use server";
import { log } from "@/lib/telemetry";
import {
	DiagConsoleLogger,
	DiagLogLevel,
	diag,
	metrics,
} from "@opentelemetry/api";
import { SeverityNumber, logs } from "@opentelemetry/api-logs";

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
