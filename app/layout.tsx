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
const TITLE = `${FULL_NAME} | Full Stack Developer & AI Engineer`;
const DESCRIPTION =
  "Portfolio of Jyoti Prakash Mohanta — Full Stack Developer with 4+ years of experience in Next.js, AI/LLM, Blockchain, NestJS, FastAPI, and scalable backend systems. Building enterprise-grade web applications for clients like SBI, Sony Bank, Kawasaki, DRDO & Adani Defence.";

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
    "Full Stack Developer",
    "AI Engineer",
    "Next.js Developer",
    "React Developer",
    "Node.js Developer",
    "Python Developer",
    "Blockchain Developer",
    "NestJS",
    "FastAPI",
    "LLM Integration",
    "GenAI",
    "LangGraph",
    "CrewAI",
    "OpenAI Agents",
    "RAG",
    "MCP",
    "Web Developer Delhi",
    "Portfolio",
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
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: FULL_NAME,
  jobTitle: "Full Stack Developer",
  url: SITE_URL,
  sameAs: [
    "https://linkedin.com/in/jyotiprakash-m",
    "https://github.com/jyotiprakash-m",
  ],
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
