import { logRecordProcessor, metricReader } from "@/lib/opentelemetry";
import { registerOTel } from "@vercel/otel";

registerOTel({
	serviceName: "giselle",
	metricReader,
	logRecordProcessor,
});
console.log("-- OTEL registered with metrics, traces, and logs --");
