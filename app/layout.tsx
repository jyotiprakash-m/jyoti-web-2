import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://jyotidev.in";
const FULL_NAME = "Jyoti Prakash Mohanta";
const TITLE = `${FULL_NAME} | Full Stack AI Developer & Software Engineer`;
const DESCRIPTION =
  "Portfolio of Jyoti Prakash Mohanta — Full Stack AI Developer with 4+ years of experience building AI-native microservices, scalable backend systems, and enterprise web applications. Expert in Next.js, FastAPI, LLMs, LangGraph, RAG, and Blockchain. Trusted by tier-1 clients like SBI, Sony Bank, DRDO, and Adani Defence.";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f0f1a",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: `%s | ${FULL_NAME}`,
  },
  description: DESCRIPTION,
  keywords: [
    "Jyoti Prakash Mohanta",
    "Full Stack AI Developer",
    "AI Software Engineer",
    "Next.js Developer",
    "FastAPI Developer",
    "Python Developer",
    "Node.js Developer",
    "Blockchain Developer",
    "AI-Native Microservices",
    "LLM Integration",
    "GenAI",
    "LangGraph",
    "CrewAI",
    "RAG Systems",
    "OpenAI Agents",
    "NestJS",
    "PostgreSQL",
    "AWS",
    "Web Developer Delhi",
    "Enterprise Applications",
  ],
  authors: [{ name: FULL_NAME, url: SITE_URL }],
  creator: FULL_NAME,
  publisher: FULL_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: SITE_URL,
    siteName: FULL_NAME,
    title: TITLE,
    description: DESCRIPTION,
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: `${FULL_NAME} — Full Stack Developer & AI Engineer`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og-image.png"],
    creator: "@jyotiprakash_m",
  },
  category: "technology",
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: [
      { url: "/favicon/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { url: "/favicon/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/favicon/site.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: FULL_NAME,
  jobTitle: "Full Stack AI Developer",
  url: SITE_URL,
  description: DESCRIPTION,
  sameAs: [
    "https://linkedin.com/in/jyotiprakash-m",
    "https://github.com/jyotiprakash-m",
  ],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "C.V. Raman Global University",
  },
  worksFor: {
    "@type": "Organization",
    name: "Quadcentrix",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Saket",
    addressRegion: "Delhi",
    addressCountry: "IN",
  },
  email: "jyotiprakashmohanta32@gmail.com",
  knowsAbout: [
    "Next.js",
    "React",
    "Node.js",
    "Python",
    "TypeScript",
    "AI/LLM",
    "Blockchain",
    "NestJS",
    "FastAPI",
    "PostgreSQL",
    "AWS",
    "Docker",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
