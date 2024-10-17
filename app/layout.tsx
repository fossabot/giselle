import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { GoogleTagManager } from "@next/third-parties/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { rosart } from "./fonts";

const title = "Giselle";
const description = "AI for Agentic Workflows. Human-AI Collaboration";
const url = process.env.NEXT_PUBLIC_SITE_URL || "https://studio.giselles.ai";

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description,
		url,
		siteName: title,
		images: [
			{
				url: `${url}/og.png`,
				width: 1200,
				height: 600,
			},
		],
		locale: "en_US",
		type: "website",
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<GoogleTagManager gtmId={process.env.GTM_ID ?? ""} />

			<body className={`${rosart.variable} font-sans`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					disableTransitionOnChange
				>
					{children}
				</ThemeProvider>
				<SpeedInsights />
			</body>
		</html>
	);
}