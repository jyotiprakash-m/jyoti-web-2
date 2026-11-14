"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import ThreeDesk, { type DeskDevice } from "./ThreeDesk";
import GuestbookAdmin from "./GuestbookAdmin";
import {
  ExternalLink,
  GitBranch,
  Mail,
  Phone,
  ArrowLeft,
  Sun,
  Moon,
  Laptop,
  Tablet as TabletIcon,
  Smartphone,
  CheckCircle2,
  Send,
  Bot,
  Terminal,
  MapPin,
  BookOpen,
  Music2,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Award,
  Briefcase,
  TrendingUp,
  GraduationCap,
  ChevronLeft,
  FileDown,
  User,
  PenLine,
  Settings as SettingsIcon,
  Signal,
  Database,
  Server,
  Brain,
  Cloud,
  LayoutDashboard,
  Puzzle,
  Wrench,
  Apple,
  BatteryFull,
  Wifi,
  Search,
  Folder,
  ChevronRight,
  Clock,
  Download,
  FileText,
  Compass,
  MessageCircle,
  Code2
} from "lucide-react";

// ─── Data ──────────────────────────────────────────────────────────────────────

interface Project {
  slug: string;
  name: string;
  role: string; // what Jyoti did on it (from the resume)
  sector: string;
  tagline: string;
  summary: string;
  built: string[];
  underTheHood: string[];
  metrics: { value: string; label: string }[];
  stack: string[];
  image: string;
  demo?: string;
  github?: string;
  color: string;
}

// Projects as listed on the updated resume (public/jyoti_4yr_updated.pdf)
const PROJECTS: Project[] = [
  {
    slug: "credit-underwriting",
    name: "Credit Underwriting",
    role: "Migration, frontend & secure data access",
    sector: "Fintech · AI",
    tagline: "AI-powered corporate loan management for credit assessment and underwriting.",
    summary:
      "AI-powered corporate loan management platform designed to streamline credit assessment, document processing, and underwriting workflows.",
    built: [
      "Contributed to the migration from a monolith to domain-based microservices using the Strangler Fig pattern, with isolated PostgreSQL databases per service",
      "Designed secure data access with Hasura GraphQL, type-safe generated clients, Keycloak, RS256 JWTs and Row-Level Security",
      "Built and enhanced the Next.js frontend: role-based dashboards, business workflows and reusable components",
      "Implemented asynchronous processing with RabbitMQ for OCR extraction and borrower data synchronisation"
    ],
    underTheHood: [
      "Complex loan and underwriting workflows combining document processing with AI-powered analysis to support credit decisions",
      "Services containerised with Docker; automated testing, code-quality checks and CI/CD through GitHub Actions"
    ],
    metrics: [
      { value: "125+", label: "Stored procedures migrated" },
      { value: "15+", label: "Services in Docker Compose" },
      { value: "RLS", label: "Row-level security per user" }
    ],
    stack: ["Next.js", "FastAPI", "NestJS", "PostgreSQL", "Hasura", "GraphQL", "Keycloak", "RabbitMQ", "Docker", "OCR", "GenAI / LLM"],
    image: "/projects/credit-underwriting.svg",
    color: "#0ea5e9"
  },
  {
    slug: "vdr",
    name: "VDR — Virtual Data Room",
    role: "Next.js frontend & integration",
    sector: "Enterprise · Blockchain",
    tagline: "Enterprise data room with configurable workflows and blockchain-verified documents.",
    summary:
      "Enterprise virtual data room platform for secure document management, configurable workflows, collaboration and AI-assisted document analysis.",
    built: [
      "Built the Next.js frontend for a microservice-based application, with role-based interfaces and document workflows",
      "Implemented dynamic, configurable workflows with role-based actions at each stage: approve, reject, forward, backward, review, view and download",
      "Integrated blockchain-based document validation and versioning for traceability and verification across a document's lifecycle",
      "Integrated AI-powered document comparison, summarisation and insights, with annotations across workflow stages"
    ],
    underTheHood: [
      "NestJS microservices with PostgreSQL, AWS, WSO2 and MinIO",
      "GitHub Actions supporting CI/CD and application delivery"
    ],
    metrics: [
      { value: "Blockchain", label: "Document validation & versioning" },
      { value: "AI", label: "Comparison, summaries & insights" },
      { value: "Role-based", label: "Configurable approval workflows" }
    ],
    stack: ["Next.js", "NestJS", "AWS", "WSO2", "MinIO", "Blockchain", "PostgreSQL", "GitHub CI/CD"],
    image: "/projects/vdr.jpg",
    color: "#06b6d4"
  },
  {
    slug: "stablecoin",
    name: "Stablecoin Management System",
    role: "Frontend development & integration",
    sector: "Web3 · Fintech",
    tagline: "Blockchain stablecoin platform for operators and verified users.",
    summary:
      "Blockchain-based stablecoin management platform supporting operator administration, user verification, stablecoin transactions and portfolio management.",
    built: [
      "Contributed significantly to frontend development and integration with Next.js: role-based interfaces for operators and verified users",
      "Built operator workflows for the stablecoin lifecycle: user approval, fiat assignment, minting, fee configuration, supply management and pause/freeze controls",
      "Integrated MetaMask, Polygon ID, blockchain APIs and Subgraph for user verification, wallet interactions, transaction tracking and on-chain data",
      "Implemented user flows for buying, redeeming and transferring stablecoins, with transaction history and portfolio views"
    ],
    underTheHood: [
      "Frontend integrated with Hasura GraphQL and Node.js backend services for application data, authentication and blockchain workflows"
    ],
    metrics: [
      { value: "MetaMask", label: "Wallet integration" },
      { value: "Polygon ID", label: "Identity verification" },
      { value: "Subgraph", label: "On-chain data & tracking" }
    ],
    stack: ["Next.js", "PostgreSQL", "Hasura", "Subgraph", "Node.js", "MetaMask", "Polygon ID", "Iron Session"],
    image: "/projects/stablecoin.jpg",
    color: "#f59e0b"
  },
  {
    slug: "jharkhand-portals",
    name: "Jharkhand Fisheries · Seed · PDMC",
    role: "About 30% of build & maintenance",
    sector: "Government · Supply chain",
    tagline: "State government portals where registered farmers apply for schemes.",
    summary:
      "Jharkhand government projects where registered farmers can apply for different schemes, delivered as a big, complete supply-chain system.",
    built: [
      "Contributed about 30% of the work to build and maintain the projects",
      "Different roles and logins: workflow applications and work orders are created according to the assigned role",
      "Three portals in one supply-chain programme: Fisheries, Seed and PDMC"
    ],
    underTheHood: ["Next.js frontend with Node.js (Express.js) services, a MySQL database and AWS hosting"],
    metrics: [
      { value: "~30%", label: "Contribution to build & maintain" },
      { value: "3", label: "Portals: Fisheries, Seed, PDMC" },
      { value: "Multi-role", label: "Workflows & work orders" }
    ],
    stack: ["Next.js", "Node.js (Express.js)", "MySQL", "AWS"],
    image: "/projects/govt-portals.jpg",
    color: "#10b981"
  },
  {
    slug: "customer-support",
    name: "Customer Support Simulator",
    role: "Built the full-stack application",
    sector: "AI · Multi-agent",
    tagline: "AI customer-support training simulator with automated coaching.",
    summary:
      "AI-powered customer support training simulator where AI agents role-play realistic customer interactions based on company knowledge and documents.",
    built: [
      "Designed a multi-agent workflow using LangGraph and local LLMs, with RAG-based context retrieval and automated coaching and performance scoring",
      "Built the full-stack application with Next.js and FastAPI, integrating asynchronous processing and SaaS capabilities"
    ],
    underTheHood: ["LlamaIndex and a vector database for retrieval, Ollama for local models, Kafka for async events, Stripe for billing, MySQL for data"],
    metrics: [
      { value: "Multi-agent", label: "LangGraph + local LLMs" },
      { value: "RAG", label: "Company-knowledge context" },
      { value: "Coaching", label: "Automated performance scoring" }
    ],
    stack: ["Next.js", "FastAPI", "LangGraph", "LlamaIndex", "Ollama", "Vector DB", "Kafka", "Stripe", "MySQL"],
    image: "/projects/supportsim.svg",
    demo: "https://youtu.be/9s861RY1XFQ",
    github: "https://github.com/jyotiprakash-m/0_doller_architecture_projects/tree/main/customer-support",
    color: "#8b5cf6"
  },
  {
    slug: "mcp-voice-assistant",
    name: "MCP Voice Assistant",
    role: "Built the assistant",
    sector: "AI · MCP",
    tagline: "Voice-enabled agentic assistant with 8 MCP integrations.",
    summary:
      "A voice-enabled agentic assistant that selects and runs tools based on what you ask, using the Model Context Protocol.",
    built: [
      "Built a voice-enabled agentic assistant with 8 MCP integrations, including 2 custom MCP servers for extending its capabilities",
      "Integrated tools for file-system operations, browser automation, research, task management, database CRUD, real-time search and external tool interactions",
      "Implemented voice-based interaction with an agent architecture that selects and executes tools based on user requests"
    ],
    underTheHood: ["Next.js frontend, Python (FastAPI) backend, OpenAI Agents SDK, SQLite storage and AWS"],
    metrics: [
      { value: "8", label: "MCP integrations" },
      { value: "2", label: "Custom MCP servers" },
      { value: "Voice", label: "Tool-using agent" }
    ],
    stack: ["Next.js", "Python (FastAPI)", "MCP", "OpenAI Agents", "SQLite", "AWS"],
    image: "/projects/mcp-voice-assistant.svg",
    demo: "https://youtu.be/jZFsulCfREw",
    github: "https://github.com/jyotiprakash-m/mcp-based-projects",
    color: "#ec4899"
  },
  {
    slug: "engineering-team",
    name: "Engineering Team (Multi-Agent)",
    role: "Built the system",
    sector: "AI · Multi-agent",
    tagline: "Autonomous AI engineering team that plans, codes and tests applications.",
    summary:
      "An autonomous multi-agent engineering system that goes from requirements to implementation and testing across specialised AI agents.",
    built: [
      "Built an autonomous multi-agent engineering system that plans application architecture, generates frontend and backend code, and coordinates development tasks across specialised agents",
      "Implemented Docker-based isolated code execution for backend, frontend and QA, with an automated testing workflow to validate generated applications",
      "Integrated multiple LLM providers and agent workflows to support end-to-end software development"
    ],
    underTheHood: ["CrewAI agents on a Python (FastAPI) backend, calling OpenAI, OpenRouter and Ollama models, with a Docker interpreter and AWS"],
    metrics: [
      { value: "Multi-agent", label: "Specialised AI roles" },
      { value: "Docker", label: "Isolated code execution" },
      { value: "Multi-LLM", label: "OpenAI, OpenRouter, Ollama" }
    ],
    stack: ["Next.js", "Python (FastAPI)", "CrewAI", "OpenAI", "OpenRouter", "Ollama", "AWS", "Docker"],
    image: "/projects/crew-ai.jpg",
    demo: "https://youtu.be/BARSbcWvYyg",
    github: "https://github.com/jyotiprakash-m/crewai_engineering_team",
    color: "#10b981"
  },
  {
    slug: "medical-healthcare",
    name: "Medical Healthcare AI",
    role: "Built the assistant",
    sector: "AI · Healthcare",
    tagline: "AI assistant that reads medical reports and runs clinic workflows.",
    summary:
      "An AI healthcare assistant that understands medical reports, matches patients with specialists and organises clinic management in one dashboard.",
    built: [
      "Reads and understands medical reports: upload a file and the AI extracts the important details into a clear, easy-to-read summary",
      "Helps patients reach the right care faster by matching them with the right specialists and emailing summaries with all the details attached",
      "Makes clinic management simple: patient records, appointments and doctor profiles in one modern dashboard",
      "Automates busywork such as bulk-uploading doctor data and generating pathology reports in seconds"
    ],
    underTheHood: ["Next.js frontend, Python (FastAPI) backend, OpenAI agents and LLMs, AWS, and SMTP for email summaries"],
    metrics: [
      { value: "AI", label: "Report summaries" },
      { value: "Auto", label: "Specialist matching + email" },
      { value: "Bulk", label: "Doctor data upload" }
    ],
    stack: ["Next.js", "Python (FastAPI)", "OpenAI Agents", "LLM", "AWS", "SMTP"],
    image: "/projects/medical-healthcare.svg",
    demo: "https://youtu.be/zhOWXmv9-L0",
    github: "https://github.com/jyotiprakash-m/adv-chunking/tree/master/routers/healthcare_assistant",
    color: "#14b8a6"
  },
  {
    slug: "cv-screening",
    name: "AI CV Screening",
    role: "Built the workflow",
    sector: "AI · Automation",
    tagline: "AI recruitment workflow that screens CVs and notifies the hiring team.",
    summary:
      "AI-powered recruitment workflow that automates CV screening, candidate evaluation and hiring-team notifications.",
    built: [
      "Built an end-to-end AI-powered CV screening workflow that automates candidate data capture, CV analysis, duplicate detection, scoring and hiring-team notifications",
      "Implemented dynamic Job Description integration with Google Docs, so recruiters can update requirements without modifying the automation workflow",
      "Generated match scores, matched and missing skills, and evaluation explanations, with 70%+ of candidates automatically flagged to the hiring team and results shown in a Next.js frontend"
    ],
    underTheHood: ["n8n workflow with LLM evaluation, Google Docs for job descriptions, Google Sheets for tracking and Gmail for notifications"],
    metrics: [
      { value: "70%+", label: "Candidates auto-flagged" },
      { value: "n8n", label: "Workflow automation" },
      { value: "Scores", label: "Matched & missing skills" }
    ],
    stack: ["Next.js", "n8n", "LLM", "Google Docs", "Google Sheets", "Gmail"],
    image: "/projects/cv-screening.svg",
    demo: "https://youtu.be/GcpIcm-1YMU",
    color: "#f97316"
  }
];

const DEFAULT_REPLY =
  "Jyoti is an AI Engineer and Full Stack Developer with 4 years of experience building scalable web applications and AI-powered products. Ask about his AI agents, experience, tech stack or how to reach him.";

// Ordered rules; first match wins. Word-boundary regexes avoid false hits
// (e.g. "email" previously matched "ai"). Answers come from the updated resume.
const BOT_RULES: Array<{ test: RegExp; reply: string }> = [
  {
    test: /\b(contact|hire|hiring|email|phone|reach|available)\b/i,
    reply:
      "You can reach Jyoti at jyotiprakashmohanta32@gmail.com or +91 8658963394. Tap Call or Mail on the home screen, or use the Let's build app on the tablet."
  },
  {
    test: /\b(experience|work|worked|company|quadcentrix|settlemint|career|role|job|publicis)\b/i,
    reply:
      "Jyoti has been a Full Stack Developer at Quadcentrix (formerly SettleMint India) since January 2023. He led a monolith-to-microservices migration with the Strangler Fig pattern, moved 125+ stored procedures into isolated PostgreSQL databases, built the Next.js frontend and a Hasura GraphQL + Keycloak secure data layer, and runs a 15+ service Docker Compose stack. Before that, in 2022, he worked on a Lloyds Bank application at Publicis Sapient."
  },
  {
    test: /\b(skills?|stack|tech|technolog\w*|languages?|tools?)\b/i,
    reply:
      "Python, TypeScript and JavaScript; Next.js and React on the frontend; FastAPI, Node.js, NestJS and Express on the backend; PostgreSQL, MySQL, pgvector and GraphQL for data; AWS, Azure, Docker and GitHub Actions for cloud and CI/CD; plus LLMs, RAG, LangGraph, CrewAI, AutoGen and MCP for AI."
  },
  {
    test: /\b(blockchain|tokens?|web3|smart contracts?|polygon|stablecoin)\b/i,
    reply:
      "Jyoti built the frontend and integrations for a stablecoin management platform (MetaMask, Polygon ID, Subgraph, minting and pause/freeze controls) and worked on a virtual data room with blockchain-based document validation and versioning."
  },
  {
    test: /\b(ai|agents?|langgraph|crewai|llm|rag|mcp|microservices?)\b/i,
    reply:
      "He builds AI-powered products: a LangGraph multi-agent support simulator with RAG, a CrewAI engineering team that plans, codes and tests apps, a voice assistant with 8 MCP integrations (2 custom MCP servers), and an AI CV-screening workflow that auto-flags 70%+ of candidates. He is also a Microsoft Certified Azure AI Engineer Associate."
  }
];

function getBotReply(input: string): string {
  return BOT_RULES.find((r) => r.test.test(input))?.reply ?? DEFAULT_REPLY;
}

// ─── Tablet apps: content from the updated resume in /public/jyoti_4yr_updated.pdf ──

const RESUME_URL = "/jyoti_4yr_updated.pdf";

const CERTIFICATES = [
  {
    title: "Microsoft Certified: Azure AI Engineer Associate",
    issuer: "Microsoft",
    detail: "Issued Jul 1, 2025 · Expires Jul 2, 2026",
    ids: ["Credential ID: 879CCF5B665E7269", "Certificate no.: 57B6YC-92D92B"],
    color: "from-sky-500 to-blue-700"
  },
  {
    title: "AI Engineer Agentic Track: The Complete Agent & MCP Course",
    issuer: "Udemy",
    detail: "Agents, tool use and Model Context Protocol",
    ids: ["Certificate no.: UC-e13f52b3-237e-474d-a189-478a7c075aa0"],
    url: "https://ude.my/UC-e13f52b3-237e-474d-a189-478a7c075aa0",
    color: "from-fuchsia-500 to-purple-700"
  }
];

const EXPERIENCE = [
  {
    role: "Full Stack Developer",
    company: "Quadcentrix (formerly SettleMint India), New Delhi",
    period: "Jan 2023 – Present",
    points: [
      "Led the migration of a monolithic application to a microservices architecture using the Strangler Fig pattern, including domain-based service extraction and a uv monorepo setup.",
      "Designed a database-per-service architecture, migrating domains from a monolithic MySQL database with 125+ stored procedures to isolated PostgreSQL databases with no cross-service foreign keys.",
      "Built and maintained the overall frontend with Next.js and React: reusable components, role-based interfaces and complex workflows, integrated with backend services and GraphQL APIs.",
      "Improved the existing frontend through performance optimization, usability, accessibility, SEO, responsive design and code-quality improvements.",
      "Built a secure data-access layer using Hasura GraphQL, ariadne-codegen and per-request RS256 JWTs, enabling Row-Level Security based on authenticated user claims.",
      "Extracted authentication and authorization into a Keycloak-backed Identity service and implemented asynchronous processing with RabbitMQ for OCR and data-synchronization workloads.",
      "Containerized and orchestrated a 15+ service stack using Docker Compose, and contributed to CI/CD pipelines with GitHub Actions, pytest, Ruff and SonarQube."
    ]
  },
  {
    role: "Junior Associate Technology",
    company: "Publicis Sapient",
    period: "May 2022 – Dec 2022",
    points: [
      "Worked on a Lloyds Bank application using Java, Spring Boot and ORM, contributing to backend development and application functionality.",
      "Developed and executed test cases to validate application behavior, identify issues and support reliable software delivery.",
      "Worked with the development team to understand requirements, troubleshoot issues and improve overall application and code quality."
    ]
  }
];

const EDUCATION = {
  degree: "Bachelor's Degree in Computer Science and Engineering",
  school: "C.V. Raman Global University, Bhubaneswar",
  period: "Jun 2018 – Jun 2022",
  grade: "CGPA 8.2"
};

const IMPACT_STATS = [
  { value: "4+", label: "Years building scalable web apps & AI products" },
  { value: "125+", label: "Stored procedures migrated to isolated PostgreSQL databases" },
  { value: "15+", label: "Services orchestrated with Docker Compose" },
  { value: "9", label: "Projects across fintech, Web3, government, healthcare & AI" },
  { value: "8", label: "MCP integrations in the voice assistant (2 custom servers)" },
  { value: "70%+", label: "Candidates auto-flagged by the AI CV-screening workflow" }
];

const IMPACT_DOMAINS = [
  "Fintech & lending",
  "Enterprise document management",
  "Blockchain & stablecoins",
  "Government (Jharkhand)",
  "Healthcare AI",
  "AI agents & MCP",
  "Recruitment automation"
];

// Skills as listed on the updated resume (no invented proficiency levels)
const SKILL_GROUPS: Array<{ title: string; icon: React.ComponentType<{ className?: string }>; color: string; items: string[] }> = [
  { title: "AI & Agentic AI", icon: Brain, color: "from-fuchsia-400 to-purple-700", items: ["LLMs", "Generative AI", "RAG", "AI Agents", "OpenAI Agents SDK", "LangGraph", "CrewAI", "AutoGen", "MCP", "Hugging Face", "Ollama", "OpenRouter"] },
  { title: "Languages", icon: Code2, color: "from-sky-400 to-blue-700", items: ["Python", "TypeScript", "JavaScript"] },
  { title: "Frontend", icon: LayoutDashboard, color: "from-cyan-400 to-sky-600", items: ["Next.js", "React.js"] },
  { title: "Backend", icon: Server, color: "from-emerald-400 to-teal-700", items: ["FastAPI", "Node.js", "NestJS", "Express.js"] },
  { title: "Databases & Data", icon: Database, color: "from-amber-400 to-orange-600", items: ["PostgreSQL", "MySQL", "pgvector", "Prisma", "SQLModel", "GraphQL"] },
  { title: "Cloud & DevOps", icon: Cloud, color: "from-sky-300 to-indigo-600", items: ["AWS", "Azure", "DigitalOcean", "Docker", "GitHub Actions", "CI/CD"] },
  { title: "Architecture & Engineering", icon: Puzzle, color: "from-rose-400 to-pink-700", items: ["REST APIs", "GraphQL", "Microservices", "System Design", "DSA & Problem Solving"] }
];

type TabletApp = "certs" | "exp" | "skills" | "impact" | "about" | "contact" | "settings";

const TABLET_TITLES: Record<TabletApp, string> = {
  certs: "Certificates",
  exp: "Experience",
  skills: "Skills",
  impact: "Impact",
  about: "About Jyoti",
  contact: "Let's build together",
  settings: "Settings"
};

// Lo-fi tracks from /public/music. The selected track loops until the visitor pauses or skips.
const TRACKS = [
  { src: "/music/coding-lofi-1.mp3", title: "Late Night Commits", vibe: "Lo-fi · deep focus" },
  { src: "/music/coding-lofi-2.mp3", title: "Compile & Chill", vibe: "Lo-fi · easy flow" },
  { src: "/music/coding-lofi-3.mp3", title: "Merge Conflict Café", vibe: "Lo-fi · cozy debugging" }
];

const HAND_FONT = { fontFamily: "'Bradley Hand', 'Segoe Script', 'Comic Sans MS', 'Caveat', cursive" } as const;

type GuestEntry = { id: number; name: string; message: string; created_at: string };

// Bottom dock buttons. Hover colours are explicit for day and evening: the old `dark:` hover followed
// the OS colour scheme, which painted a dark background behind dark text and made the label vanish.
const DOCK_ITEMS: Array<{
  key: DeskDevice;
  label: string;
  sub: string;
  Icon: React.ComponentType<{ className?: string }>;
  active: string;
  icon: string;
  dayHover: string;
  nightHover: string;
}> = [
  { key: "laptop", label: "Laptop", sub: "Projects", Icon: Laptop, active: "bg-indigo-600 text-white", icon: "text-indigo-500", dayHover: "hover:bg-indigo-100 hover:text-indigo-900", nightHover: "hover:bg-indigo-400/30 hover:text-white" },
  { key: "tablet", label: "Tablet", sub: "Career", Icon: TabletIcon, active: "bg-cyan-600 text-white", icon: "text-cyan-500", dayHover: "hover:bg-cyan-100 hover:text-cyan-900", nightHover: "hover:bg-cyan-400/30 hover:text-white" },
  { key: "phone", label: "Phone", sub: "AI Chat", Icon: Smartphone, active: "bg-emerald-600 text-white", icon: "text-emerald-500", dayHover: "hover:bg-emerald-100 hover:text-emerald-900", nightHover: "hover:bg-emerald-400/30 hover:text-white" },
  { key: "notebook", label: "Notes", sub: "Guestbook", Icon: BookOpen, active: "bg-amber-600 text-white", icon: "text-amber-500", dayHover: "hover:bg-amber-100 hover:text-amber-900", nightHover: "hover:bg-amber-400/30 hover:text-white" }
];

const HOVER_LABELS: Record<string, { title: string; hint: string }> = {
  laptop: { title: "Laptop", hint: "Browse my projects" },
  tablet: { title: "Tablet", hint: "Skills, career & contact" },
  phone: { title: "Phone", hint: "Chat with my AI assistant" },
  notebook: { title: "Notebook", hint: "Sign the guestbook" },
  resume: { title: "Resume", hint: "Open my CV (PDF)" },
  speaker: { title: "Speaker", hint: "Tap to play / pause" },
  mug: { title: "Coffee", hint: "Take a sip (refills when empty)" },
  plant: { title: "Jade plant", hint: "Click to water it" },
  penstand: { title: "Pen stand", hint: "Pop a pen out" },
  lamp: { title: "Desk lamp", hint: "Tap to switch on / off" },
  cat: { title: "Pikachu", hint: "Say hi" },
  desk: { title: "Send Pikachu here", hint: "Double-click to make him run to this spot" }
};

// macOS-style blue folder with the project's cover image tucked inside, peeking out of the pocket
function FolderIcon({ image, alt, tag }: { image: string; alt: string; tag: string }) {
  return (
    <div className="relative h-[84px] w-[112px] transition-transform duration-200 group-hover:-translate-y-1">
      <div className="absolute left-0 top-0 h-6 w-14 rounded-t-lg bg-[#3f95f2]" />
      <div className="absolute inset-x-0 bottom-0 top-3 rounded-lg bg-gradient-to-b from-[#4da3f7] to-[#2b78e0] shadow-md" />
      <div className="absolute inset-x-3 top-2 h-[58px] -rotate-2 overflow-hidden rounded-[3px] bg-white p-[2px] shadow-md ring-1 ring-black/10">
        <div className="relative h-full w-full overflow-hidden rounded-[2px] bg-stone-200">
          <Image src={image} alt={alt} fill sizes="112px" className="object-cover" unoptimized={image.endsWith(".svg")} />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[50px] rounded-lg bg-gradient-to-b from-[#86c8ff] to-[#4a9cf0] shadow-[0_-3px_8px_rgba(0,0,0,0.18)] ring-1 ring-white/40" />
      <span className="absolute bottom-2 right-2 h-2.5 w-2.5 rounded-full ring-1 ring-white/70" style={{ backgroundColor: tag }} />
    </div>
  );
}

// ─── Boot screen: shown from the very first paint until the 3D desk has drawn its first frame ───
const BOOT_LINES = [
  "$ bun run desk --env=production",
  "› resolving dependencies … ok",
  "› compiling shaders … ok",
  "› placing laptop, tablet & phone … ok",
  "› teaching Pikachu to avoid the mug … ok",
  "› tuning the lo-fi speaker …",
];

function DeskLoader({ ready }: { ready: boolean }) {
  const [shown, setShown] = useState(1);
  const [minDone, setMinDone] = useState(false);
  const [gone, setGone] = useState(false);
  const leaving = ready && minDone; // keep it up briefly even on a fast load, so it never just flashes

  useEffect(() => {
    const lines = setInterval(() => setShown((n) => Math.min(BOOT_LINES.length, n + 1)), 420);
    const min = setTimeout(() => setMinDone(true), 1300);
    return () => {
      clearInterval(lines);
      clearTimeout(min);
    };
  }, []);
  useEffect(() => {
    if (!leaving) return;
    const t = setTimeout(() => setGone(true), 650);
    return () => clearTimeout(t);
  }, [leaving]);

  if (gone) return null;
  const pct = leaving ? 100 : Math.round((shown / BOOT_LINES.length) * 88);
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading the desk"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#0b0d12] px-4 transition-opacity duration-500 ${
        leaving ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/10 bg-[#11141b] shadow-2xl">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-[11px] text-stone-500">jyoti@desk — zsh</span>
        </div>
        <div className="space-y-1 px-4 py-4 font-mono text-[12.5px] leading-relaxed text-stone-300">
          {BOOT_LINES.slice(0, shown).map((line, i) => (
            <p key={line} className={i === 0 ? "text-emerald-400" : undefined}>
              {line}
              {i === shown - 1 && !leaving && <span className="ml-0.5 inline-block h-3.5 w-1.5 translate-y-0.5 animate-pulse bg-stone-300" />}
            </p>
          ))}
          {leaving && <p className="text-emerald-400">✓ desk ready</p>}
          <div className="pt-3">
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-emerald-400 transition-[width] duration-500 ease-out" style={{ width: `${pct}%` }} />
            </div>
            <p className="mt-1.5 text-right text-[10px] text-stone-500">{pct}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function PradipStyleDeskPage() {
  const [evening, setEvening] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  useEffect(() => {
    // never trap the visitor behind the loader if WebGL is slow or unavailable
    const t = setTimeout(() => setSceneReady(true), 15000);
    return () => clearTimeout(t);
  }, []);
  // null = follow evening mode (lamp on at night); true/false = visitor's manual choice until the mode changes
  const [lampOverride, setLampOverride] = useState<boolean | null>(null);
  const lampOn = lampOverride ?? evening;
  const [focusedDevice, setFocusedDevice] = useState<DeskDevice | null>(null);
  const [openProject, setOpenProject] = useState<string | null>(null); // slug of the project shown in the laptop's detail window
  const [hoveredDevice, setHoveredDevice] = useState<string | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);

  // Music: one <audio> element that loops the selected track
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [trackIdx, setTrackIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const pointerRef = useRef({ x: 0, y: 0 });

  // Music panel above the speaker: opens while the pointer is on the speaker or the panel itself,
  // with a short delay on leaving so the pointer can travel from one to the other.
  const speakerAnchorRef = useRef<HTMLDivElement | null>(null);
  const [speakerPanelOpen, setSpeakerPanelOpen] = useState(false);
  const hoverRef = useRef<string | null>(null);
  const panelHoverRef = useRef(false);
  const panelTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelPanelClose = useCallback(() => {
    if (panelTimer.current) clearTimeout(panelTimer.current);
    panelTimer.current = null;
  }, []);
  const schedulePanelClose = useCallback(
    (delay: number) => {
      cancelPanelClose();
      panelTimer.current = setTimeout(() => {
        if (hoverRef.current === "speaker" || panelHoverRef.current) return; // still being used
        setSpeakerPanelOpen(false);
      }, delay);
    },
    [cancelPanelClose]
  );
  const handleHoverDevice = useCallback(
    (d: string | null) => {
      if (d === hoverRef.current) return;
      hoverRef.current = d;
      setHoveredDevice(d);
      if (d === "speaker") {
        cancelPanelClose();
        setSpeakerPanelOpen(true);
      } else {
        schedulePanelClose(350);
      }
    },
    [cancelPanelClose, schedulePanelClose]
  );
  // Keep the hover label next to the pointer but inside the viewport (flip left/up near edges)
  const placeTip = () => {
    const el = tipRef.current;
    if (!el) return;
    const { x, y } = pointerRef.current;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const left = x + 16 + w > window.innerWidth - 8 ? x - 16 - w : x + 16;
    const top = y + 18 + h > window.innerHeight - 8 ? y - 18 - h : y + 18;
    el.style.transform = `translate(${Math.max(8, left)}px, ${Math.max(8, top)}px)`;
  };

  // Phone Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ role: "bot" | "user"; text: string }>>([
    {
      role: "bot",
      text: "Hi! I'm Jyoti's AI assistant. Ask me about his AI agents, work experience, tech stack, or how to get in touch."
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Tablet Print State
  const [tabletApp, setTabletApp] = useState<TabletApp | null>(null);
  const [phoneApp, setPhoneApp] = useState<"chat" | null>(null);
  const [clockNow, setClockNow] = useState(() => new Date()); // real local time shown on the tablet

  // Guestbook (the notebook): entries come from /api/guestbook (Neon Postgres)
  const [guestEntries, setGuestEntries] = useState<GuestEntry[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);
  const [guestLoadError, setGuestLoadError] = useState<string | null>(null);
  const [guestForm, setGuestForm] = useState({ name: "", message: "", website: "" });
  const [guestStatus, setGuestStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [guestMsg, setGuestMsg] = useState("");

  // Contact form state
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const deskRef = useRef<HTMLDivElement>(null);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const tabletClock = {
    time: clockNow.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).replace(/\s?[AP]M/i, ""),
    shortDate: clockNow.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
    longDate: clockNow.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
  };
  const openProjectData = PROJECTS.find((p) => p.slug === openProject) ?? PROJECTS[0];

  // Esc key listener to exit device view
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      // inside a tablet app, Esc goes back to the home screen first
      if (focusedDevice === "tablet" && tabletApp) setTabletApp(null);
      else if (focusedDevice === "laptop" && openProject) setOpenProject(null);
      else if (focusedDevice === "phone" && phoneApp) setPhoneApp(null);
      else setFocusedDevice(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedDevice, tabletApp, openProject, phoneApp]);

  // Modal: lock page scroll, focus the close button, restore focus on close
  useEffect(() => {
    if (!focusedDevice) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    const trigger = lastTriggerRef.current;
    return () => {
      document.body.style.overflow = prevOverflow;
      trigger?.focus?.();
    };
  }, [focusedDevice]);

  // Keep the chat pinned to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chatMessages, isTyping]);

  // Clear pending timers on unmount
  useEffect(() => {
    return () => {
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, []);

  // One music player, ever: never two songs at once, and never a song that outlives the page.
  useEffect(() => {
    // A previous player (hot reload, double mount) must never keep playing behind a new one.
    const w = window as unknown as { __deskMusic?: HTMLAudioElement };
    w.__deskMusic?.pause();

    const audio = new Audio();
    w.__deskMusic = audio;
    audio.loop = true; // keeps playing the same track continuously
    audio.volume = 0.6;
    audio.preload = "none";

    // Other tabs/windows of this site: when one starts playing, the others pause.
    const tabId = Math.random().toString(36).slice(2);
    const channel = typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("desk-music") : null;
    channel?.addEventListener("message", (e) => {
      if (e.data?.type === "playing" && e.data.id !== tabId) audio.pause();
    });

    const onPlay = () => {
      setIsPlaying(true);
      channel?.postMessage({ type: "playing", id: tabId });
    };
    const onPause = () => setIsPlaying(false);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    // Closing or leaving the page stops the music (also covers back/forward-cache restores).
    const onPageHide = () => audio.pause();
    window.addEventListener("pagehide", onPageHide);

    audioRef.current = audio;
    return () => {
      window.removeEventListener("pagehide", onPageHide);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      channel?.close();
      audio.pause();
      audio.removeAttribute("src");
      audio.load(); // really abandons any download/playback in progress
      if (w.__deskMusic === audio) delete w.__deskMusic;
      audioRef.current = null;
    };
  }, []);

  const playTrack = useCallback((idx: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const src = TRACKS[idx].src;
    if (!audio.src.endsWith(src)) audio.src = src;
    setTrackIdx(idx);
    audio.play().catch((err: unknown) => {
      // Skipping tracks quickly interrupts the previous play() with an AbortError: that is expected, not a failure.
      if (!(err instanceof DOMException && err.name === "AbortError")) setIsPlaying(false);
    });
  }, []);

  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) audio.pause();
    else playTrack(trackIdx);
  }, [playTrack, trackIdx]);

  const stepTrack = useCallback(
    (dir: 1 | -1) => playTrack((trackIdx + dir + TRACKS.length) % TRACKS.length),
    [playTrack, trackIdx]
  );

  // Keep the tablet's clock live while it is open
  useEffect(() => {
    if (focusedDevice !== "tablet" && focusedDevice !== "phone") return;
    const id = setInterval(() => setClockNow(new Date()), 5000);
    return () => clearInterval(id);
  }, [focusedDevice]);

  // Load the guestbook (called when the notebook is opened)
  const loadGuestbook = useCallback(async () => {
    setGuestLoading(true);
    setGuestLoadError(null);
    try {
      const res = await fetch("/api/guestbook", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setGuestLoadError(data.error ?? "The guestbook is resting right now. Please come back soon.");
      else setGuestEntries(data.entries ?? []);
    } catch {
      setGuestLoadError("The guestbook is resting right now. Please come back soon.");
    } finally {
      setGuestLoading(false);
    }
  }, []);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestStatus("sending");
    setGuestMsg("");
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestForm)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setGuestStatus("error");
        setGuestMsg(data.error ?? "Couldn't save your note. Please try again.");
        return;
      }
      setGuestStatus("done");
      setGuestForm({ name: "", message: "", website: "" });
      if (data.pending) {
        setGuestMsg("Thank you! Your note will appear once I've read it. ✍️");
      } else {
        setGuestMsg("Thank you for signing! ✍️");
        const refreshed = await fetch("/api/guestbook", { cache: "no-store" }).then((r) => r.json()).catch(() => null);
        if (refreshed?.entries) setGuestEntries(refreshed.entries);
      }
    } catch {
      setGuestStatus("error");
      setGuestMsg("Couldn't reach the server. Please try again.");
    }
  };

  const openDevice = useCallback((dev: DeskDevice) => {
    lastTriggerRef.current = document.activeElement as HTMLElement | null;
    setHoveredDevice(null);
    hoverRef.current = null;
    setSpeakerPanelOpen(false);
    setTabletApp(null);
    setPhoneApp(null);
    setOpenProject(null);
    setClockNow(new Date());
    setFocusedDevice(dev);
    if (dev === "notebook") void loadGuestbook();
  }, [loadGuestbook]);

  // Handle phone chat message
  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend ?? chatInput).trim();
    if (!text || isTyping) return;
    if (replyTimer.current) clearTimeout(replyTimer.current);

    setChatMessages((prev) => [...prev, { role: "user", text }]);
    setChatInput("");
    setIsTyping(true);

    replyTimer.current = setTimeout(() => {
      setChatMessages((prev) => [...prev, { role: "bot", text: getBotReply(text) }]);
      setIsTyping(false);
    }, 650);
  };

  // Handle contact form submit
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_name: contactForm.name,
          from_email: contactForm.email,
          message: contactForm.message
        })
      });
      if (!res.ok) throw new Error();
      setContactStatus("sent");
      setContactForm({ name: "", email: "", message: "" });
      setTimeout(() => setContactStatus("idle"), 5000);
    } catch {
      setContactStatus("error");
      setTimeout(() => setContactStatus("idle"), 4000);
    }
  };

  return (
    <div
      className={`min-h-screen font-sans selection:bg-amber-100 selection:text-stone-900 transition-colors duration-700 ${
        evening ? "bg-[#1f1915] text-[#F3E9DA]" : "bg-[#F4F4F6] text-stone-900"
      }`}
    >
      <DeskLoader ready={sceneReady} />

      {/* ─── DESK HERO SECTION ───────────────────────────────────────────────── */}
      <section
        ref={deskRef}
        onPointerDown={(e) => {
          pointerRef.current = { x: e.clientX, y: e.clientY };
          placeTip();
        }}
        onPointerMove={(e) => {
          pointerRef.current = { x: e.clientX, y: e.clientY };
          placeTip();
        }}
        id="desk"
        aria-label="Interactive Desk Workspace"
        className={`relative h-[100svh] min-h-[580px] w-full overflow-hidden select-none transition-all duration-700 ${
          evening
            ? "bg-[radial-gradient(75%_65%_at_66%_50%,#6B5442_0%,#47392F_36%,#2E2620_70%,#221C18_100%)]"
            : "bg-[radial-gradient(120%_90%_at_50%_45%,#FFFFFF_0%,#F4F4F6_55%,#E8E8EC_100%)]"
        }`}
      >
        {/* Ambient Evening Glow Layer */}
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-700 ${
            evening ? "opacity-100 bg-[#3d2719]/30 mix-blend-multiply" : "opacity-0"
          }`}
        />

        {/* ─── Top Brand & Navigation Bar ─── */}
        <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-6 pt-5 sm:px-10 sm:pt-6">
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-semibold tracking-tight transition-colors duration-700 ${
                evening ? "text-[#F3E9DA]" : "text-stone-900"
              }`}
            >
              JPM · Jyoti Prakash
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Available for hire
            </span>
          </div>

          {/* Top Right Controls: Lamp Switch + Direct Link */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEvening(!evening);
                setLampOverride(null); // switching day/night puts the lamp back on automatic
              }}
              aria-label={evening ? "Switch to daylight" : "Switch to evening mode"}
              title={evening ? "Switch to daylight" : "Switch to evening mode"}
              className={`group flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-md transition-all duration-300 shadow-sm ${
                evening
                  ? "border-amber-500/30 bg-amber-950/40 text-amber-200 hover:bg-amber-900/50"
                  : "border-stone-300/80 bg-white/80 text-stone-700 hover:bg-white"
              }`}
            >
              {evening ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-300 transition-transform group-hover:rotate-45" />
                  <span>Daylight</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-stone-600 transition-transform group-hover:-rotate-12" />
                  <span>Evening</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                openDevice("tablet");
                setTabletApp("contact");
              }}
              className={`hidden md:inline-flex items-center gap-1 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur-md transition-all duration-300 shadow-sm ${
                evening
                  ? "border-[#6B5442] bg-[#2E2620]/80 text-[#F3E9DA] hover:bg-[#47392F]"
                  : "border-stone-300/80 bg-white/80 text-stone-700 hover:bg-white"
              }`}
            >
              Get in touch
            </button>
          </div>
        </div>

        {/* ─── Hero Statement ─── */}
        <div className="pointer-events-none absolute inset-x-0 top-16 sm:top-20 z-20 text-center px-4">
          <h1
            className={`text-[clamp(32px,4.5vw,60px)] font-semibold leading-[1.05] tracking-[-0.03em] transition-colors duration-700 ${
              evening ? "text-[#F3E9DA]" : "text-stone-900"
            }`}
          >
            Hi, I&apos;m Jyoti.
          </h1>
          <p
            className={`mx-auto mt-2.5 max-w-[34rem] text-sm sm:text-base leading-relaxed transition-colors duration-700 ${
              evening ? "text-[#CDBBA5]" : "text-stone-600"
            }`}
          >
            I build the software businesses run on. Everything on this desk is real and running.
          </p>
        </div>

        {/* ─── Real 3D Interactive WebGL Desk (Three.js) ─── */}
        <div className="absolute inset-0">
          <ThreeDesk
            evening={evening}
            onReady={() => setSceneReady(true)}
            onSelectDevice={openDevice}
            setHoveredDevice={handleHoverDevice}
            speakerAnchorRef={speakerAnchorRef}
            focusedDevice={focusedDevice}
            onSpeakerTap={() => {
              toggleMusic();
              // touch screens have no hover: show the controls briefly after a tap too
              cancelPanelClose();
              setSpeakerPanelOpen(true);
              schedulePanelClose(4000);
            }}
            speakerPlaying={isPlaying}
            lampOn={lampOn}
            onLampToggle={() => setLampOverride(!lampOn)}
          />
        </div>

        {/* Hover label that follows the pointer over interactive objects */}
        {hoveredDevice && hoveredDevice !== "speaker" && !focusedDevice && HOVER_LABELS[hoveredDevice] && (
          <div
            ref={(el) => {
              tipRef.current = el;
              placeTip();
            }}
            aria-hidden="true"
            className={`pointer-events-none fixed left-0 top-0 z-40 rounded-xl border px-3 py-2 text-xs shadow-lg backdrop-blur-md ${
              evening
                ? "border-[#6B5442] bg-[#2E2620]/90 text-[#F3E9DA]"
                : "border-stone-300/80 bg-white/90 text-stone-800"
            }`}
          >
            <div className="font-semibold">{HOVER_LABELS[hoveredDevice].title}</div>
            <div className="opacity-70">
              {hoveredDevice === "speaker"
                ? isPlaying
                  ? `Playing: ${TRACKS[trackIdx].title} · tap to pause`
                  : "Tap to play lo-fi"
                : HOVER_LABELS[hoveredDevice].hint}
            </div>
          </div>
        )}

        {/* ─── Music controls: appear above the speaker while hovering it (positioned by ThreeDesk) ─── */}
        <div ref={speakerAnchorRef} className="pointer-events-none absolute left-0 top-0 z-30 will-change-transform" style={{ transform: "translate(-9999px, -9999px)" }}>
          <div
            onPointerEnter={() => {
              panelHoverRef.current = true;
              cancelPanelClose();
            }}
            onPointerLeave={() => {
              panelHoverRef.current = false;
              schedulePanelClose(350);
            }}
            className={`absolute bottom-3 left-0 w-[18.5rem] -translate-x-1/2 transition-all duration-200 ${
              speakerPanelOpen && !focusedDevice ? "pointer-events-auto translate-y-0 opacity-100" : "translate-y-1 opacity-0"
            }`}
          >
            <div
              className={`flex items-center gap-3 rounded-2xl border px-3 py-2.5 shadow-xl backdrop-blur-xl ${
                evening ? "border-[#6B5442] bg-[#2E2620]/95 text-[#F3E9DA]" : "border-stone-300/80 bg-white/95 text-stone-800"
              }`}
            >
              <div className="flex h-8 items-end gap-[3px]" aria-hidden="true">
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    className="w-[3px] rounded-full bg-sky-500"
                    style={{
                      height: "100%",
                      transformOrigin: "bottom",
                      animation: isPlaying ? `deskEq ${0.7 + i * 0.13}s ease-in-out ${i * 0.1}s infinite` : "none",
                      transform: isPlaying ? undefined : "scaleY(0.3)"
                    }}
                  />
                ))}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold">{TRACKS[trackIdx].title}</div>
                <div className="truncate text-[11px] opacity-60">
                  {TRACKS[trackIdx].vibe} · {trackIdx + 1}/{TRACKS.length}
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button onClick={() => stepTrack(-1)} aria-label="Previous track" className="rounded-full p-1.5 hover:bg-stone-500/15">
                  <SkipBack className="h-4 w-4" />
                </button>
                <button
                  onClick={toggleMusic}
                  aria-label={isPlaying ? "Pause music" : "Play music"}
                  className="rounded-full bg-sky-500 p-2 text-white hover:bg-sky-400"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </button>
                <button onClick={() => stepTrack(1)} aria-label="Next track" className="rounded-full p-1.5 hover:bg-stone-500/15">
                  <SkipForward className="h-4 w-4" />
                </button>
              </div>
            </div>
            {/* little pointer towards the speaker */}
            <span
              className={`absolute -bottom-1.5 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r ${
                evening ? "border-[#6B5442] bg-[#2E2620]" : "border-stone-300/80 bg-white"
              }`}
              style={{ left: "calc(50% + var(--dx, 0px))" }}
            />
          </div>
        </div>

        {/* ─── Bottom Device Dock Controls ─── */}
        <div className="absolute inset-x-0 bottom-6 z-30 flex justify-center px-4">
          <div
            className={`flex items-center gap-1 sm:gap-2 rounded-full border p-1.5 backdrop-blur-xl shadow-xl transition-all duration-500 ${
              evening
                ? "border-[#6B5442] bg-[#2E2620]/85 text-[#F3E9DA]"
                : "border-stone-300/80 bg-white/90 text-stone-800"
            }`}
          >
            {DOCK_ITEMS.map(({ key, label, sub, Icon, active, icon, dayHover, nightHover }) => {
              const isActive = focusedDevice === key;
              return (
                <button
                  key={key}
                  onClick={() => openDevice(key)}
                  aria-pressed={isActive}
                  className={`flex items-center gap-1.5 sm:gap-2 rounded-full px-2.5 sm:px-3.5 py-2 text-xs font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-stone-400 active:scale-95 ${
                    isActive ? `${active} shadow-sm` : evening ? nightHover : dayHover
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : icon}`} />
                  <span>{label}</span>
                  <span className="hidden sm:inline text-[11px] opacity-60">· {sub}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── ZOOMED IN DEVICE MODAL VIEW (100% PRADIP STYLE) ────────────────── */}
      {focusedDevice && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Device preview"
          className="fixed inset-0 z-50 flex flex-col bg-stone-950/80 backdrop-blur-xl animate-in fade-in duration-300"
        >
          {/* Top Bar with "Back to the desk" Button & Esc indicator */}
          <div className="flex h-16 items-center justify-between border-b border-white/10 px-6 sm:px-10 bg-stone-950/50">
            <button
              ref={closeBtnRef}
              onClick={() => setFocusedDevice(null)}
              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-md transition-colors hover:bg-white hover:text-stone-950 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to the desk</span>
            </button>

            <div className="flex items-center gap-3">
              <span className="text-xs text-stone-400 hidden sm:inline">
                Inspecting:{" "}
                <strong className="text-white capitalize">
                  {focusedDevice === "laptop"
                    ? "Laptop · Projects"
                    : focusedDevice === "tablet"
                    ? "Tablet · Skills, Career & Contact"
                    : focusedDevice === "notebook"
                    ? "Notebook · Guestbook"
                    : focusedDevice === "resume"
                    ? "Resume · CV"
                    : "Phone · AI Chat & Quick Links"}
                </strong>
              </span>
              <kbd className="hidden sm:inline-block rounded border border-white/20 bg-white/10 px-2 py-0.5 text-xs text-stone-300 font-mono">
                Esc
              </kbd>
            </div>
          </div>

          {/* Modal Content Stage */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex items-center justify-center">
            {/* ── LAPTOP VIEW (macOS: Finder with project folders → project detail window) ── */}
            {focusedDevice === "laptop" && (
              <div
                className="w-full animate-in zoom-in-95 duration-200"
                // keep the whole 16:10 laptop inside the viewport, below the top bar
                style={{ maxWidth: "min(70rem, calc((100svh - 9.5rem) * 1.6))" }}
              >
                {/* lid: silver edge → black bezel → screen */}
                <div className="rounded-[22px] bg-gradient-to-b from-stone-300 via-stone-200 to-stone-400 p-[4px] shadow-2xl">
                  <div className="relative rounded-[18px] bg-black p-2 sm:p-3">
                    <div
                      className="relative min-h-[540px] overflow-hidden rounded-[10px] text-white sm:min-h-0 sm:aspect-[16/10]"
                      style={{
                        background:
                          "radial-gradient(circle at 28% 72%, #1b86ff 0%, transparent 42%), radial-gradient(circle at 78% 28%, #8a3ffc 0%, transparent 48%), radial-gradient(circle at 58% 78%, #13d4c8 0%, transparent 32%), radial-gradient(circle at 15% 20%, #2a3fd0 0%, transparent 40%), #05061a"
                      }}
                    >
                      {/* menu bar */}
                      <div className="absolute inset-x-0 top-0 z-40 flex h-6 items-center justify-between bg-black/35 px-3 text-[11px] backdrop-blur-md">
                        <div className="flex items-center gap-4">
                          <Apple className="h-3.5 w-3.5" />
                          <span className="font-bold">{openProject ? "Quick Look" : "Finder"}</span>
                          <span className="hidden sm:inline">File</span>
                          <span className="hidden sm:inline">Edit</span>
                          <span className="hidden sm:inline">View</span>
                          <span className="hidden sm:inline">Go</span>
                          <span className="hidden sm:inline">Window</span>
                          <span className="hidden md:inline">Help</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <BatteryFull className="h-3.5 w-3.5" />
                          <Wifi className="h-3.5 w-3.5" />
                          <Search className="hidden h-3 w-3 sm:block" />
                          <span>
                            {new Date().toLocaleString("en-US", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>

                      {/* Finder window */}
                      <div className="absolute inset-x-2 bottom-14 top-9 flex flex-col overflow-hidden rounded-xl bg-[#f6f6f6] text-stone-800 shadow-2xl ring-1 ring-black/25 sm:inset-x-[7%] sm:bottom-[13%]">
                        <div className="flex items-center gap-3 border-b border-stone-300/80 bg-gradient-to-b from-stone-100 to-stone-200 px-3 py-2">
                          <div className="flex gap-1.5">
                            <button onClick={() => setFocusedDevice(null)} aria-label="Close" className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                          </div>
                          <div className="flex items-center gap-1 text-stone-400">
                            <ChevronLeft className="h-4 w-4" />
                            <ChevronRight className="h-4 w-4" />
                          </div>
                          <div className="flex flex-1 items-center gap-1.5 text-[13px] font-semibold">
                            <Folder className="h-4 w-4 text-[#3f95f2]" />
                            Projects
                          </div>
                          <div className="hidden items-center gap-1.5 rounded-md bg-white px-2 py-1 text-[11px] text-stone-400 ring-1 ring-stone-300 sm:flex">
                            <Search className="h-3 w-3" /> Search
                          </div>
                        </div>
                        <div className="flex min-h-0 flex-1">
                          <aside className="hidden w-40 shrink-0 space-y-4 border-r border-stone-300/70 bg-stone-100/90 p-3 text-[11px] sm:block">
                            <div>
                              <p className="mb-1 font-semibold uppercase tracking-wider text-stone-400">Favorites</p>
                              {[
                                [Clock, "Recents"],
                                [Download, "Downloads"],
                                [FileText, "Documents"]
                              ].map(([Icon, label]) => {
                                const I = Icon as React.ComponentType<{ className?: string }>;
                                return (
                                  <div key={label as string} className="flex items-center gap-2 rounded-md px-2 py-1 text-stone-600">
                                    <I className="h-3.5 w-3.5 text-[#3f95f2]" />
                                    {label as string}
                                  </div>
                                );
                              })}
                              <div className="flex items-center gap-2 rounded-md bg-stone-300/70 px-2 py-1 font-medium">
                                <Folder className="h-3.5 w-3.5 text-[#3f95f2]" />
                                Projects
                              </div>
                            </div>
                            <div>
                              <p className="mb-1 font-semibold uppercase tracking-wider text-stone-400">Tags</p>
                              {PROJECTS.slice(0, 4).map((p) => (
                                <div key={p.slug} className="flex items-center gap-2 px-2 py-0.5 text-stone-600">
                                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                                  {p.sector.split(" ")[0]}
                                </div>
                              ))}
                            </div>
                          </aside>
                          <div className="min-w-0 flex-1 overflow-y-auto bg-white p-4 sm:p-5">
                            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
                              {PROJECTS.map((p) => (
                                <button
                                  key={p.slug}
                                  onClick={() => setOpenProject(p.slug)}
                                  className="group flex flex-col items-center gap-1.5 rounded-lg p-2 outline-none transition-colors hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                  <FolderIcon image={p.image} alt={p.name} tag={p.color} />
                                  <span className="line-clamp-2 text-center text-[11px] font-medium leading-tight">{p.name}</span>
                                  <span className="line-clamp-1 text-[10px] text-stone-400">{p.sector}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="border-t border-stone-200 bg-stone-100 px-3 py-1 text-center text-[10px] text-stone-500">
                          {PROJECTS.length} items
                        </div>
                      </div>

                      {/* Project detail window (opens when a folder is clicked) */}
                      {openProject && (
                        <div className="absolute inset-x-1 bottom-12 top-8 z-30 flex flex-col overflow-hidden rounded-xl bg-[#1c1d24]/95 text-stone-100 shadow-2xl ring-1 ring-white/15 backdrop-blur-xl animate-in zoom-in-95 duration-200 sm:inset-x-[4%] sm:bottom-[11%]">
                          <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-3 py-2">
                            <div className="flex gap-1.5">
                              <button onClick={() => setOpenProject(null)} aria-label="Close project" className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
                            </div>
                            <button
                              onClick={() => setOpenProject(null)}
                              className="inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs text-sky-400 hover:bg-white/10"
                            >
                              <ChevronLeft className="h-4 w-4" /> Projects
                            </button>
                            <span className="flex-1 truncate text-center text-xs font-medium text-stone-300">{openProjectData.name}</span>
                          </div>

                          <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-4 sm:p-6 lg:grid-cols-5">
                            <div className="space-y-3 lg:col-span-2">
                              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-stone-900 shadow-lg ring-1 ring-white/10">
                                <Image
                                  src={openProjectData.image}
                                  alt={openProjectData.name}
                                  fill
                                  sizes="(min-width: 1024px) 40vw, 90vw"
                                  className="object-cover"
                                  unoptimized={openProjectData.image.endsWith(".svg")}
                                />
                                <span className="absolute left-2 top-2 rounded-md bg-black/70 px-2 py-0.5 text-[10px] font-semibold backdrop-blur">
                                  {openProjectData.sector}
                                </span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-center">
                                {openProjectData.metrics.map((m) => (
                                  <div key={m.label} className="rounded-lg bg-white/5 p-2 ring-1 ring-white/10">
                                    <div className="text-sm font-bold">{m.value}</div>
                                    <div className="text-[9px] leading-tight text-stone-400">{m.label}</div>
                                  </div>
                                ))}
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {openProjectData.demo && (
                                  <a
                                    href={openProjectData.demo}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-sky-600 px-3 py-2 text-xs font-semibold hover:bg-sky-500"
                                  >
                                    <ExternalLink className="h-3.5 w-3.5" /> Watch demo
                                  </a>
                                )}
                                {openProjectData.github && (
                                  <a
                                    href={openProjectData.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs font-semibold hover:bg-white/10"
                                  >
                                    <GitBranch className="h-3.5 w-3.5" /> View code
                                  </a>
                                )}
                              </div>
                            </div>

                            <div className="space-y-4 lg:col-span-3">
                              <div>
                                <p className="font-mono text-[11px] text-sky-400">
                                  {openProjectData.role}
                                </p>
                                <h2 className="text-xl font-bold sm:text-2xl">{openProjectData.name}</h2>
                                <p className="mt-1 text-sm leading-relaxed text-stone-300">{openProjectData.summary}</p>
                              </div>
                              <div>
                                <h3 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">What was built</h3>
                                <ul className="space-y-1.5">
                                  {openProjectData.built.map((b) => (
                                    <li key={b} className="flex items-start gap-2 text-xs text-stone-300">
                                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                      <span>{b}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="rounded-xl bg-black/30 p-3 ring-1 ring-white/5">
                                <h3 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-stone-400">
                                  <Terminal className="h-3.5 w-3.5 text-cyan-400" /> Under the hood
                                </h3>
                                <ul className="space-y-1">
                                  {openProjectData.underTheHood.map((h) => (
                                    <li key={h} className="text-xs leading-relaxed text-stone-400">
                                      • {h}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {openProjectData.stack.map((s) => (
                                  <span key={s} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-[11px] text-stone-300">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* dock */}
                      <div className="absolute inset-x-0 bottom-2 z-40 flex justify-center">
                        <div className="flex items-end gap-1.5 rounded-2xl bg-white/20 px-2 py-1.5 ring-1 ring-white/25 backdrop-blur-xl">
                          {(
                            [
                              [Folder, "from-sky-400 to-blue-600"],
                              [Compass, "from-cyan-300 to-blue-500"],
                              [Mail, "from-sky-300 to-blue-600"],
                              [MessageCircle, "from-green-400 to-emerald-600"],
                              [Code2, "from-indigo-400 to-violet-700"],
                              [Terminal, "from-stone-600 to-black"],
                              [Music2, "from-pink-400 to-rose-600"]
                            ] as Array<[React.ComponentType<{ className?: string }>, string]>
                          ).map(([Icon, grad], i) => (
                            <span key={i} className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b ${grad} shadow sm:h-9 sm:w-9`}>
                              <Icon className="h-4 w-4 text-white sm:h-[18px] sm:w-[18px]" />
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* base */}
                <div className="relative -mx-[2.5%] h-3 rounded-b-[24px] bg-gradient-to-b from-stone-200 to-stone-400 shadow-xl">
                  <span className="absolute left-1/2 top-0 h-1.5 w-24 -translate-x-1/2 rounded-b-lg bg-stone-500/50" />
                </div>
              </div>
            )}

            {/* ── TABLET VIEW (iPad-style home screen with apps) ── */}
            {focusedDevice === "tablet" && (
              <div
                className="w-full animate-in zoom-in-95 duration-200"
                // keep the whole 4:3 tablet inside the viewport, below the top bar: width follows the available height
                style={{ maxWidth: "min(62rem, calc((100svh - 9rem) * 1.333))" }}
              >
                {/* silver frame → black bezel → screen */}
                <div className="rounded-[34px] bg-gradient-to-b from-stone-300 via-stone-200 to-stone-400 p-[5px] shadow-2xl">
                  <div className="rounded-[30px] bg-black p-3 sm:p-4">
                    <div className="relative min-h-[520px] overflow-hidden rounded-[18px] bg-[#dc4a44] text-white sm:min-h-0 sm:aspect-[4/3]">
                      {/* wallpaper */}
                      <div className="absolute inset-0 bg-[linear-gradient(120deg,#f0a040_0%,#e4543f_35%,#d63f58_60%,#7a5bb0_100%)]" />
                      <div className="absolute -bottom-28 -right-28 h-[80%] w-[70%] rounded-full bg-[radial-gradient(circle_at_30%_30%,#2b5da3,#0f4a86_55%,#0b2f63)] opacity-90" />

                      {/* status bar */}
                      <div className="absolute inset-x-0 top-0 z-30 flex items-center justify-between px-5 pt-2.5 text-[11px] font-medium text-white/90">
                        <span>{tabletClock.time} · {tabletClock.shortDate}</span>
                        <span className="flex items-center gap-2">
                          <span>100%</span>
                          {!tabletApp && (
                            <button
                              onClick={() => setTabletApp("settings")}
                              aria-label="Settings"
                              title="Settings"
                              className="rounded-full p-0.5 text-white/90 transition-colors hover:bg-white/20 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                            >
                              <SettingsIcon className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </span>
                      </div>

                      {/* HOME SCREEN */}
                      {!tabletApp && (
                        <div className="absolute inset-0 z-10 flex flex-col px-6 pb-6 pt-12 sm:px-10">
                          <div>
                            <div className="text-6xl font-light tracking-tight sm:text-7xl">{tabletClock.time}</div>
                            <div className="mt-1 text-sm opacity-90 sm:text-lg">{tabletClock.longDate}</div>
                          </div>
                          <div className="mt-8 grid max-w-3xl grid-cols-3 gap-4 sm:mt-10 sm:grid-cols-6 sm:gap-3">
                            {(
                              [
                                ["certs", "Certificates", Award, "from-sky-400 to-blue-700"],
                                ["exp", "Experience", Briefcase, "from-amber-400 to-orange-600"],
                                ["skills", "Skills", Wrench, "from-sky-400 to-indigo-600"],
                                ["impact", "Impact", TrendingUp, "from-emerald-400 to-teal-700"],
                                ["about", "About Jyoti", User, "from-fuchsia-400 to-purple-700"],
                                ["contact", "Let's build", Send, "from-rose-400 to-pink-700"]
                              ] as Array<[TabletApp, string, React.ComponentType<{ className?: string }>, string]>
                            ).map(([key, label, Icon, grad]) => (
                              <button
                                key={key}
                                onClick={() => setTabletApp(key)}
                                className="group flex flex-col items-center gap-2 outline-none"
                              >
                                <span
                                  className={`flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-gradient-to-b ${grad} shadow-lg ring-1 ring-white/25 transition-transform group-hover:scale-105 group-active:scale-95 group-focus-visible:ring-2 group-focus-visible:ring-white sm:h-24 sm:w-24 sm:rounded-[28px]`}
                                >
                                  <Icon className="h-9 w-9 text-white sm:h-12 sm:w-12" />
                                </span>
                                <span className="text-xs font-medium sm:text-sm">{label}</span>
                              </button>
                            ))}
                          </div>
                          <div className="mt-auto flex justify-center">
                            <span className="h-1 w-32 rounded-full bg-white/70" />
                          </div>
                        </div>
                      )}

                      {/* APP WINDOW */}
                      {tabletApp && (
                        <div className="absolute inset-0 z-20 flex flex-col bg-[#f6f5f1] text-stone-900 animate-in slide-in-from-bottom-4 duration-300">
                          <div className="flex items-center gap-3 border-b border-stone-200 bg-white/80 px-4 pb-3 pt-9 backdrop-blur sm:px-6">
                            <button
                              onClick={() => setTabletApp(null)}
                              className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50"
                            >
                              <ChevronLeft className="h-5 w-5" />
                              Home
                            </button>
                            <h3 className="flex-1 pr-14 text-center text-base font-semibold">
                              {TABLET_TITLES[tabletApp]}
                            </h3>
                          </div>

                          <div className="flex-1 overflow-y-auto p-4 sm:p-7">
                            {tabletApp === "certs" && (
                              <div className="grid gap-4 sm:grid-cols-2">
                                {CERTIFICATES.map((c) => (
                                  <div key={c.title} className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                                    <div className={`flex items-center gap-3 bg-gradient-to-r ${c.color} px-4 py-3 text-white`}>
                                      <Award className="h-6 w-6 shrink-0" />
                                      <span className="text-xs font-semibold uppercase tracking-wider">{c.issuer}</span>
                                    </div>
                                    <div className="space-y-2 p-4">
                                      <h4 className="text-sm font-bold leading-snug">{c.title}</h4>
                                      <p className="text-xs text-stone-500">{c.detail}</p>
                                      {c.ids.map((id) => (
                                        <p key={id} className="break-all font-mono text-[11px] text-stone-600">
                                          {id}
                                        </p>
                                      ))}
                                      {c.url && (
                                        <a
                                          href={c.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="mt-1 inline-flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-stone-700"
                                        >
                                          <ExternalLink className="h-3.5 w-3.5" />
                                          Verify certificate
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {tabletApp === "exp" && (
                              <div className="space-y-7">
                                <ol className="relative space-y-7 border-l-2 border-stone-200 pl-6">
                                  {EXPERIENCE.map((job) => (
                                    <li key={job.role + job.company} className="relative">
                                      <span className="absolute -left-[31px] top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-orange-500 ring-2 ring-orange-200" />
                                      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                                        <h4 className="text-base font-bold">{job.role}</h4>
                                        <span className="text-xs font-medium text-stone-500">{job.period}</span>
                                      </div>
                                      <p className="text-sm text-stone-600">{job.company}</p>
                                      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-stone-700">
                                        {job.points.map((p) => (
                                          <li key={p} className="flex gap-2">
                                            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-stone-400" />
                                            <span>{p}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </li>
                                  ))}
                                </ol>
                                <div className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                                  <GraduationCap className="mt-0.5 h-6 w-6 shrink-0 text-indigo-500" />
                                  <div>
                                    <h4 className="text-sm font-bold">{EDUCATION.degree}</h4>
                                    <p className="text-xs text-stone-600">{EDUCATION.school}</p>
                                    <p className="text-xs text-stone-500">
                                      {EDUCATION.period} · {EDUCATION.grade}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {tabletApp === "skills" && (
                              <div className="grid gap-4 sm:grid-cols-2">
                                {SKILL_GROUPS.map(({ title, icon: Icon, color, items }) => (
                                  <div key={title} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                                    <div className="mb-3 flex items-center gap-2.5">
                                      <span className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-b ${color} text-white shadow-sm`}>
                                        <Icon className="h-4 w-4" />
                                      </span>
                                      <h4 className="text-sm font-bold">{title}</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5">
                                      {items.map((s) => (
                                        <span
                                          key={s}
                                          className="rounded-md border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-[11px] text-stone-700"
                                        >
                                          {s}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {tabletApp === "impact" && (
                              <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                  {IMPACT_STATS.map((s) => (
                                    <div key={s.label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                                      <div className="bg-gradient-to-r from-orange-500 to-pink-600 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl">
                                        {s.value}
                                      </div>
                                      <p className="mt-1 text-xs leading-snug text-stone-600">{s.label}</p>
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-stone-500">Where I&apos;ve built</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {IMPACT_DOMAINS.map((c) => (
                                      <span key={c} className="rounded-full border border-stone-300 bg-white px-3 py-1 text-xs font-medium">
                                        {c}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <a
                                  href={RESUME_URL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-700"
                                >
                                  <FileDown className="h-4 w-4" />
                                  View full resume (PDF)
                                </a>
                              </div>
                            )}
                            {tabletApp === "about" && (
                              <div className="space-y-6">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-widest text-amber-600">AI Engineer | Full Stack Developer</p>
                                  <h4 className="mt-1 text-2xl font-bold leading-tight sm:text-3xl">
                                    One developer,
                                    <br />
                                    end-to-end execution.
                                  </h4>
                                  <p className="mt-3 text-sm leading-relaxed text-stone-600 sm:text-base">
                                    Full Stack Developer with 4 years of experience building scalable web applications and AI-powered
                                    products. Experienced with Next.js, Python, FastAPI, Node.js, NestJS, LLMs, RAG and AI agents, with
                                    a strong focus on solving real-world problems and turning ideas into reliable, production-ready
                                    solutions.
                                  </p>
                                </div>
                                <div className="space-y-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
                                  <a href="mailto:jyotiprakashmohanta32@gmail.com" className="flex items-center gap-3 text-sm text-stone-700 hover:text-indigo-600">
                                    <Mail className="h-4 w-4 text-stone-400" />
                                    <span className="break-all">jyotiprakashmohanta32@gmail.com</span>
                                  </a>
                                  <a href="tel:+918658963394" className="flex items-center gap-3 text-sm text-stone-700 hover:text-indigo-600">
                                    <Phone className="h-4 w-4 text-stone-400" />
                                    <span>+91 8658963394</span>
                                  </a>
                                  <div className="flex items-center gap-3 text-sm text-stone-500">
                                    <MapPin className="h-4 w-4 text-stone-400" />
                                    <span>Saket, Delhi, India</span>
                                  </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                  <a
                                    href="https://linkedin.com/in/jyotiprakash-m"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                                  >
                                    LinkedIn
                                  </a>
                                  <a
                                    href="https://github.com/jyotiprakash-m"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg border border-stone-300 bg-white px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-stone-100"
                                  >
                                    GitHub
                                  </a>
                                  <a
                                    href={RESUME_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="rounded-lg bg-stone-900 px-4 py-2 text-xs font-semibold text-white hover:bg-stone-700"
                                  >
                                    Resume PDF
                                  </a>
                                </div>
                              </div>
                            )}

                            {tabletApp === "settings" && <GuestbookAdmin />}

                            {tabletApp === "contact" && (
                              <div className="mx-auto max-w-xl">
                                <h4 className="text-xl font-bold">Let&apos;s build together</h4>
                                <p className="mb-5 mt-1 text-sm text-stone-500">
                                  Have a product to ship or a team to scale? Drop a message directly.
                                </p>
                                <form onSubmit={handleContactSubmit} className="space-y-4">
                                  <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                      <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium text-stone-600">
                                        Your Name
                                      </label>
                                      <input
                                        id="contact-name"
                                        type="text"
                                        required
                                        autoComplete="name"
                                        value={contactForm.name}
                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                        placeholder="Jane Doe"
                                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
                                    <div>
                                      <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium text-stone-600">
                                        Email Address
                                      </label>
                                      <input
                                        id="contact-email"
                                        type="email"
                                        required
                                        autoComplete="email"
                                        value={contactForm.email}
                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                        placeholder="jane@company.com"
                                        className="w-full rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                      />
                                    </div>
                                  </div>
                                  <div>
                                    <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-stone-600">
                                      Message
                                    </label>
                                    <textarea
                                      id="contact-message"
                                      required
                                      rows={4}
                                      value={contactForm.message}
                                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                      placeholder="Tell me about the software or systems you want to build..."
                                      className="w-full resize-none rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={contactStatus === "sending"}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
                                  >
                                    {contactStatus === "sending" ? (
                                      "Sending..."
                                    ) : contactStatus === "sent" ? (
                                      "✓ Message Sent!"
                                    ) : contactStatus === "error" ? (
                                      "Failed to send — email directly"
                                    ) : (
                                      <>
                                        <Send className="h-4 w-4" />
                                        <span>Send Message</span>
                                      </>
                                    )}
                                  </button>
                                  <p role="status" aria-live="polite" className="sr-only">
                                    {contactStatus === "sent" ? "Message sent" : contactStatus === "error" ? "Message failed to send" : ""}
                                  </p>
                                </form>
                              </div>
                            )}

                          </div>

                          {/* home indicator */}
                          <button
                            onClick={() => setTabletApp(null)}
                            aria-label="Go to home screen"
                            className="flex justify-center py-2.5"
                          >
                            <span className="h-1 w-32 rounded-full bg-stone-400" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── PHONE VIEW (iPhone X-style: iOS home screen → AI chat app + quick links) ── */}
            {focusedDevice === "phone" && (
              <div
                className="animate-in zoom-in-95 duration-200"
                // keep the whole phone inside the viewport, below the top bar
                style={{ height: "min(58rem, calc(100svh - 7rem))", aspectRatio: "9 / 19" }}
              >
                <div className="relative h-full w-full">
                  {/* side buttons: mute switch, volume up/down, power */}
                  <span className="absolute -left-[3px] top-[15%] h-6 w-[3px] rounded-l bg-stone-400" />
                  <span className="absolute -left-[3px] top-[22%] h-12 w-[3px] rounded-l bg-stone-400" />
                  <span className="absolute -left-[3px] top-[31%] h-12 w-[3px] rounded-l bg-stone-400" />
                  <span className="absolute -right-[3px] top-[26%] h-20 w-[3px] rounded-r bg-stone-400" />

                  {/* steel frame → black bezel → screen */}
                  <div className="h-full w-full rounded-[54px] bg-gradient-to-b from-stone-300 via-stone-100 to-stone-400 p-[4px] shadow-2xl">
                    <div className="h-full w-full rounded-[50px] bg-black p-[9px]">
                      <div className="relative h-full overflow-hidden rounded-[42px] bg-[#ff6a00] text-white">
                        {/* wallpaper */}
                        <div className="absolute inset-0 bg-[linear-gradient(160deg,#ff9a1f_0%,#ff6a00_28%,#e8333c_58%,#c2306c_100%)]" />
                        <div className="absolute -left-10 top-[55%] h-[34%] w-[120%] -rotate-12 rounded-[50%] bg-[#f3ece6] opacity-90" />
                        <div className="absolute -bottom-16 -right-16 h-[44%] w-[90%] rotate-12 rounded-[50%] bg-[#a23fb5] opacity-90" />
                        <div className="absolute -bottom-24 -left-10 h-[36%] w-[80%] -rotate-6 rounded-[50%] bg-[#e8206b] opacity-95" />

                        {/* notch + status bar */}
                        <div className="absolute left-1/2 top-0 z-40 flex h-[26px] w-[40%] -translate-x-1/2 items-center justify-center gap-2 rounded-b-[18px] bg-black">
                          <span className="h-1 w-10 rounded-full bg-stone-800" />
                          <span className="h-2 w-2 rounded-full bg-[#101a2a]" />
                        </div>
                        <div
                          className={`absolute inset-x-0 top-0 z-30 flex h-9 items-center justify-between px-6 pt-1 text-[11px] font-semibold transition-colors ${
                            phoneApp ? "text-stone-900" : "text-white"
                          }`}
                        >
                          <span>{tabletClock.time}</span>
                          <span className="flex items-center gap-1">
                            <Signal className="h-3 w-3" />
                            <Wifi className="h-3 w-3" />
                            <BatteryFull className="h-3.5 w-3.5" />
                          </span>
                        </div>

                        {/* HOME SCREEN */}
                        {!phoneApp && (
                          <div className="absolute inset-0 z-10 flex flex-col px-5 pb-3 pt-14">
                            <div className="grid grid-cols-4 gap-x-4 gap-y-5">
                              {(
                                [
                                  ["AI Chat", MessageCircle, "from-green-400 to-emerald-600", "chat"],
                                  ["Call", Phone, "from-green-400 to-green-600", "tel:+918658963394"],
                                  ["Mail", Mail, "from-sky-400 to-blue-600", "mailto:jyotiprakashmohanta32@gmail.com"],
                                  ["Resume", FileText, "from-rose-400 to-red-600", RESUME_URL],
                                  ["GitHub", GitBranch, "from-stone-600 to-black", "https://github.com/jyotiprakash-m"],
                                  ["LinkedIn", User, "from-sky-500 to-blue-800", "https://linkedin.com/in/jyotiprakash-m"]
                                ] as Array<[string, React.ComponentType<{ className?: string }>, string, string]>
                              ).map(([label, Icon, grad, target]) => {
                                const inner = (
                                  <>
                                    <span
                                      className={`flex h-[44px] w-[44px] items-center justify-center rounded-[14px] bg-gradient-to-b ${grad} shadow-md ring-1 ring-white/20 transition-transform group-hover:scale-105 group-active:scale-95`}
                                    >
                                      <Icon className="h-5 w-5 text-white" />
                                    </span>
                                    <span className="text-[9px] font-medium drop-shadow">{label}</span>
                                  </>
                                );
                                return target === "chat" ? (
                                  <button key={label} onClick={() => setPhoneApp("chat")} className="group flex flex-col items-center gap-1 outline-none">
                                    {inner}
                                  </button>
                                ) : (
                                  <a
                                    key={label}
                                    href={target}
                                    {...(target.startsWith("http") || target.endsWith(".pdf") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                    className="group flex flex-col items-center gap-1 outline-none"
                                  >
                                    {inner}
                                  </a>
                                );
                              })}
                            </div>

                            {/* page dots + dock */}
                            <div className="mt-auto">
                              <div className="mb-3 flex justify-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                                <span className="h-1.5 w-1.5 rounded-full bg-white" />
                                <span className="h-1.5 w-1.5 rounded-full bg-white/50" />
                              </div>
                              <div className="flex justify-around rounded-[24px] bg-white/25 px-3 py-2 ring-1 ring-white/25 backdrop-blur-xl">
                                <a href="tel:+918658963394" aria-label="Call" className="flex h-[44px] w-[44px] items-center justify-center rounded-[14px] bg-gradient-to-b from-green-400 to-green-600 shadow">
                                  <Phone className="h-5 w-5 text-white" />
                                </a>
                                <a href="mailto:jyotiprakashmohanta32@gmail.com" aria-label="Mail" className="flex h-[44px] w-[44px] items-center justify-center rounded-[14px] bg-gradient-to-b from-sky-400 to-blue-600 shadow">
                                  <Mail className="h-5 w-5 text-white" />
                                </a>
                                <button onClick={() => setPhoneApp("chat")} aria-label="AI Chat" className="flex h-[44px] w-[44px] items-center justify-center rounded-[14px] bg-gradient-to-b from-green-400 to-emerald-600 shadow">
                                  <MessageCircle className="h-5 w-5 text-white" />
                                </button>
                                <a href={RESUME_URL} target="_blank" rel="noopener noreferrer" aria-label="Resume" className="flex h-[44px] w-[44px] items-center justify-center rounded-[14px] bg-gradient-to-b from-rose-400 to-red-600 shadow">
                                  <FileText className="h-5 w-5 text-white" />
                                </a>
                              </div>
                              <div className="mt-2 flex justify-center">
                                <span className="h-1 w-28 rounded-full bg-white/80" />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* AI CHAT APP (iMessage style) */}
                        {phoneApp === "chat" && (
                          <div className="absolute inset-0 z-20 flex flex-col bg-white text-stone-900 animate-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center gap-2 border-b border-stone-200 bg-stone-50/95 px-3 pb-2 pt-10 backdrop-blur">
                              <button
                                onClick={() => setPhoneApp(null)}
                                aria-label="Back to home screen"
                                className="inline-flex items-center rounded-full px-1 py-0.5 text-sm text-blue-600 hover:bg-blue-50"
                              >
                                <ChevronLeft className="h-5 w-5" />
                                Home
                              </button>
                              <div className="flex flex-1 flex-col items-center pr-12">
                                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 text-white">
                                  <Bot className="h-4 w-4" />
                                </span>
                                <span className="mt-0.5 text-[11px] font-semibold">Jyoti&apos;s AI Assistant</span>
                              </div>
                            </div>

                            <div role="log" aria-live="polite" className="flex-1 space-y-2 overflow-y-auto bg-white px-3 py-3 text-[13px]">
                              {chatMessages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                  <div
                                    className={`max-w-[80%] rounded-[18px] px-3.5 py-2 leading-snug ${
                                      m.role === "user" ? "rounded-br-md bg-[#0a84ff] text-white" : "rounded-bl-md bg-[#e9e9eb] text-stone-900"
                                    }`}
                                  >
                                    {m.text}
                                  </div>
                                </div>
                              ))}
                              {isTyping && (
                                <div className="flex justify-start">
                                  <div className="flex gap-1 rounded-[18px] rounded-bl-md bg-[#e9e9eb] px-4 py-3">
                                    {[0, 1, 2].map((d) => (
                                      <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-stone-400" style={{ animationDelay: `${d * 0.15}s` }} />
                                    ))}
                                  </div>
                                </div>
                              )}
                              <div ref={chatEndRef} />
                            </div>

                            <div className="flex gap-1.5 overflow-x-auto border-t border-stone-200 bg-stone-50 px-3 py-2">
                              {["AI agents?", "Work experience?", "Tech stack?", "How to hire Jyoti?"].map((chip) => (
                                <button
                                  key={chip}
                                  onClick={() => handleSendMessage(chip)}
                                  className="shrink-0 rounded-full border border-blue-200 bg-white px-3 py-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50"
                                >
                                  {chip}
                                </button>
                              ))}
                            </div>

                            <div className="flex items-center gap-2 bg-stone-50 px-3 pb-5 pt-2">
                              <input
                                type="text"
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                                aria-label="Message Jyoti's AI assistant"
                                placeholder="iMessage"
                                className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-2 text-[13px] text-stone-900 placeholder-stone-400 focus:border-blue-400 focus:outline-none"
                              />
                              <button
                                onClick={() => handleSendMessage()}
                                aria-label="Send message"
                                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0a84ff] text-white hover:bg-blue-500"
                              >
                                <Send className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <button onClick={() => setPhoneApp(null)} aria-label="Go to home screen" className="absolute inset-x-0 bottom-1 flex justify-center py-1">
                              <span className="h-1 w-28 rounded-full bg-stone-800/70" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── RESUME VIEW (the PDF, shown in-page) ── */}
            {focusedDevice === "resume" && (
              <div
                className="flex w-full max-w-4xl flex-col animate-in zoom-in-95 duration-200"
                style={{ height: "calc(100svh - 9.5rem)" }}
              >
                <div className="mb-3 flex items-center justify-between gap-3 text-white">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-400">Resume</p>
                    <h3 className="text-lg font-semibold">Jyoti Prakash Mohanta</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={RESUME_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden rounded-full px-3 py-2 text-sm text-stone-300 underline-offset-4 hover:text-white hover:underline sm:inline-block"
                    >
                      Not loading? Open full PDF
                    </a>
                    <a
                      href={RESUME_URL}
                      download
                      className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white hover:text-stone-950"
                    >
                      Download PDF
                    </a>
                  </div>
                </div>
                <iframe
                  src={`${RESUME_URL}#view=FitH&toolbar=0`}
                  title="Resume PDF"
                  className="w-full flex-1 rounded-xl bg-white shadow-2xl"
                />
              </div>
            )}

            {/* ── NOTEBOOK VIEW (GUESTBOOK) ── */}
            {focusedDevice === "notebook" && (
              <div className="w-full max-w-5xl rounded-2xl bg-[#15151b] p-2 shadow-2xl animate-in zoom-in-95 duration-200 sm:p-3">
                <div className="grid overflow-hidden rounded-xl bg-[#faf5ea] text-stone-800 [background-image:repeating-linear-gradient(transparent,transparent_31px,rgba(110,118,135,0.22)_32px)] md:grid-cols-2">
                  {/* Left page: sign the notebook */}
                  <div className="relative p-6 sm:p-9 md:border-r md:border-stone-300/70 md:shadow-[inset_-18px_0_24px_-18px_rgba(60,40,10,0.35)]">
                    <p className="text-[11px] font-semibold uppercase tracking-widest text-stone-500">Guestbook</p>
                    <h3 className="mt-1 text-3xl italic text-[#1f2f6e]" style={HAND_FONT}>
                      Sign my notebook
                    </h3>
                    <p className="mt-2 text-sm leading-8 text-[#1f2f6e]" style={HAND_FONT}>
                      Say hi, leave feedback, or tell me what you&apos;d like to build. I read every note.
                    </p>
                    <form onSubmit={handleGuestSubmit} className="mt-4 space-y-3">
                      {/* honeypot: hidden from people, bots fill it */}
                      <input
                        type="text"
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        aria-hidden="true"
                        value={guestForm.website}
                        onChange={(e) => setGuestForm({ ...guestForm, website: e.target.value })}
                        className="absolute -left-[9999px] h-0 w-0 opacity-0"
                      />
                      <div>
                        <label htmlFor="guest-name" className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                          Your name
                        </label>
                        <input
                          id="guest-name"
                          required
                          maxLength={40}
                          value={guestForm.name}
                          onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                          placeholder="e.g. Priya from Bengaluru"
                          className="mt-1 w-full border-0 border-b-2 border-[#1f2f6e]/40 bg-transparent px-1 py-1.5 text-lg text-[#1f2f6e] placeholder-[#1f2f6e]/35 focus:border-[#1f2f6e] focus:outline-none"
                          style={HAND_FONT}
                        />
                      </div>
                      <div>
                        <label htmlFor="guest-message" className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
                          Your note
                        </label>
                        <textarea
                          id="guest-message"
                          required
                          rows={4}
                          maxLength={240}
                          value={guestForm.message}
                          onChange={(e) => setGuestForm({ ...guestForm, message: e.target.value })}
                          placeholder="Loved the desk! …"
                          className="mt-1 w-full resize-none rounded-lg border-2 border-[#1f2f6e]/25 bg-white/60 px-3 py-2 text-lg leading-7 text-[#1f2f6e] placeholder-[#1f2f6e]/35 focus:border-[#1f2f6e] focus:outline-none"
                          style={HAND_FONT}
                        />
                        <p className="mt-0.5 text-right text-[10px] text-stone-400">{guestForm.message.length}/240</p>
                      </div>
                      <button
                        type="submit"
                        disabled={guestStatus === "sending"}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1f2f6e] px-5 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-[#2a3f94] disabled:opacity-50"
                      >
                        <PenLine className="h-4 w-4" />
                        {guestStatus === "sending" ? "Signing…" : "Sign the notebook"}
                      </button>
                      <p role="status" aria-live="polite" className={`text-sm ${guestStatus === "error" ? "text-red-600" : "text-emerald-700"}`}>
                        {guestMsg}
                      </p>
                    </form>
                  </div>

                  {/* Right page: what visitors wrote */}
                  <div className="p-6 sm:p-9 md:shadow-[inset_18px_0_24px_-18px_rgba(60,40,10,0.35)]">
                    <h3 className="text-3xl italic text-[#1f2f6e]" style={HAND_FONT}>
                      Notes from visitors
                    </h3>
                    <div className="mt-3 max-h-[52vh] space-y-4 overflow-y-auto pr-2">
                      {guestLoading && <p className="text-sm text-stone-500">Opening the notebook…</p>}
                      {!guestLoading && guestLoadError && <p className="text-sm text-stone-500">{guestLoadError}</p>}
                      {!guestLoading && !guestLoadError && guestEntries.length === 0 && (
                        <p className="text-lg text-[#1f2f6e]" style={HAND_FONT}>
                          No notes yet. Be the first to sign! ✍️
                        </p>
                      )}
                      {guestEntries.map((g) => (
                        <div key={g.id}>
                          <p className="text-lg leading-7 text-[#1f2f6e]" style={HAND_FONT}>
                            “{g.message}”
                          </p>
                          <p className="text-sm text-stone-500" style={HAND_FONT}>
                            — {g.name},{" "}
                            {new Date(g.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}



      {/* ─── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className={`py-8 px-6 border-t text-center text-xs text-stone-400 ${evening ? "border-white/10" : "border-stone-200"}`}>
        <p>© {new Date().getFullYear()} Jyoti Prakash Mohanta · Built with Next.js &amp; Tailwind</p>
      </footer>
    </div>
  );
}
