"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import Head from "next/head";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Mail, Phone, MapPin, Link2, GitCompareArrows, ExternalLink, Code2, Database,
  Brain, Cloud, Blocks, ChevronDown, Award, Briefcase, GraduationCap,
  FolderOpen, Sparkles, Cpu, Globe, Zap, Layers, Terminal, Server,
  Send, MessageSquare, Bot, FileText, TrendingUp, Shield, Headphones,
  Search, Stethoscope, BookOpen, Wallet, Tractor, BarChart3, PieChart,
  CheckCircle2, X, Menu,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const COLORS = { primary: "#6366f1", secondary: "#8b5cf6", accent: "#06b6d4", glow: "#a855f7" };

const RESUME = {
  name: "Jyoti Prakash Mohanta", title: "Full Stack Developer",
  location: "Saket, Delhi, India", phone: "+91 8658963394",
  email: "jyotiprakashmohanta32@gmail.com",
  linkedin: "linkedin.com/in/jyoti-prakash-mohanta",
  github: "github.com/jyotiprakashmohanta",
  summary: "Results-driven Full Stack Developer with 4 years of experience building web applications from idea to deployment. Creates fast, reliable, and user-friendly solutions using Next.js, scalable database design, and strong backend systems. Known for staying calm under pressure and resolving production issues quickly. Passionate about turning complex client requirements into simple, practical technology solutions that help businesses grow.",
  skills: {
    languages: ["Node.js", "Python", "TypeScript", "JavaScript"],
    frontend: ["Next.js", "React.js", "Tailwind CSS", "Three.js", "GSAP"],
    backend: ["Express.js", "NestJS", "FastAPI", "GraphQL", "REST APIs"],
    database: ["PostgreSQL", "MySQL", "Prisma", "SQLModel", "Vector DB", "Redis"],
    ai: ["LLM Integration", "GenAI", "LangGraph", "CrewAI", "OpenAI Agents", "RAG", "MCP", "Ollama"],
    cloud: ["AWS", "Azure", "Docker", "Digital Ocean", "CI/CD"],
    blockchain: ["Smart Contracts", "ERC-20", "ERC-1155", "Subgraph", "Stablecoin", "NFT", "Polygon ID"],
    other: ["DSA", "Algorithms", "System Design", "Microservices", "OAuth", "Stripe", "Kafka"],
  },
  experience: [
    {
      company: "SettleMint India", role: "Full Stack Developer", period: "Jan 2023 – Present", location: "New Delhi",
      highlights: [
        "Boosted development speed by 30% through workflow optimization",
        "Integrated ERC-20 & ERC-1155 smart contracts into Next.js apps",
        "Built 5 scalable microservices using NestJS, ORM & GraphQL",
        "Delivered enterprise projects for SBI, Sony Bank, Kawasaki, DRDO, Adani Defence",
        "Implemented MySQL stored procedures as APIs in Node.js/Next.js",
        "Improved performance, SEO, accessibility across all projects",
      ],
      tags: ["Next.js", "NestJS", "Blockchain", "AI/LLM", "Microservices"],
    },
    {
      company: "Publicis Sapient", role: "Junior Associate Technology", period: "May 2022 – Dec 2022", location: "Remote",
      highlights: [
        "Worked on Lloyds Bank project — created & executed test cases for Java app",
        "Received excellent feedback from training mentor",
        "Earned high-performance training completion certificate",
      ],
      tags: ["Java", "Testing", "Banking", "Enterprise"],
    },
  ],
  education: [{ degree: "B.Tech in Computer Science & Engineering", school: "C.V. Raman Global University, Bhubaneswar", period: "June 2018 – June 2022" }],
  certificates: [
    { name: "Microsoft Certified: Azure AI Engineer Associate", id: "879CCF5B665E7269", issued: "Jul 2025", expires: "Jul 2026" },
    { name: "AI Engineer Agentic Track — Agent & MCP Course", id: "UC-e13f52b3-237e-474d-a189-478a7c075aa0", issued: "2025" },
  ],
  projects: [
    { name: "Mascot AI", tech: ["Next.js", "FastAPI", "Digital Ocean", "MySQL", "OCR", "GenAI", "LLM"], desc: "Role-based dashboards for docdept & QA teams with AI-assisted document/protocol generation, template uploads, and admin management.", icon: "Bot", color: "#6366f1" },
    { name: "Credit Underwriting", tech: ["Next.js", "FastAPI", "Digital Ocean", "MySQL", "OCR", "GenAI", "LLM"], desc: "AI-powered corporate loan management system with advanced analyzing features and automated underwriting workflows.", icon: "TrendingUp", color: "#8b5cf6" },
    { name: "VDR (Virtual Data Room)", tech: ["Next.js", "NestJS", "AWS", "WSO2", "Microservices", "MinIO", "Blockchain", "PostgreSQL"], desc: "Dynamic workflow creation with role assignment, blockchain document validation, versioning, and AI-powered document comparison.", icon: "Shield", color: "#06b6d4" },
    { name: "Stablecoin Management", tech: ["Next.js", "PostgreSQL", "Hasura", "Subgraph", "Blockchain", "Node.js", "Metamask", "Polygon ID"], desc: "Full stablecoin platform — operator management, lazy mint, fee controls, supply management, pause/unpause, user buy/redeem/transfer.", icon: "Wallet", color: "#f59e0b" },
    { name: "Tokenized Share Application", tech: ["Next.js", "Blockchain", "NestJS", "PostgreSQL", "Metamask", "NextAuth", "NFT"], desc: "Companies register & create digital shares on blockchain. Users login via Metamask, view shares, validate on OpenSea.", icon: "Blocks", color: "#ec4899" },
    { name: "Jharkhand Govt. Projects", tech: ["Next.js", "Express.js", "MySQL", "AWS"], desc: "Fisheries, Seed & PDMC portals — supply chain for farmers to apply for schemes with role-based workflows and work orders.", icon: "Tractor", color: "#10b981" },
    { name: "Career Conversation (RAG)", tech: ["Next.js", "FastAPI", "LLM", "OpenAI", "RAG"], desc: "Digital version of me — users ask natural language questions about my career. Push notifications for connection requests.", icon: "MessageSquare", color: "#6366f1" },
    { name: "Legal Auditor (LegalShield AI)", tech: ["HTML/CSS/JS", "FastAPI", "MySQL", "GenAI", "LLM", "Vector DB", "LlamaIndex", "Ollama", "Stripe"], desc: "Privacy-first SaaS for legal document audits & AI chat. Multi-tenant RAG with zero data leakage. Stripe billing integrated.", icon: "FileText", color: "#8b5cf6" },
    { name: "SupportSim AI", tech: ["Next.js", "FastAPI", "MySQL", "GenAI", "LLM", "Vector DB", "LlamaIndex", "Ollama", "Stripe", "Kafka"], desc: "Customer Support Training Simulator — AI-driven roleplay with emotionally responsive customers. Multi-agent system with automated coaching.", icon: "Headphones", color: "#06b6d4" },
    { name: "Email Classification Agent", tech: ["Next.js", "FastAPI", "OAuth", "LangGraph", "LangSmith", "PostgreSQL", "SMTP"], desc: "Auto-classifies emails (HR/Delivery/Engineering), sentiment analysis with HuggingFace, summarization, TTS, STT, AI response generation.", icon: "Mail", color: "#f59e0b" },
    { name: "MCP Voice Assistant", tech: ["Next.js", "FastAPI", "MCP", "OpenAI Agents", "SQLite", "AWS"], desc: "Agentic chatbot with 8 MCPs — file system, Playwright automation, semantic scholar, time/location, task management, trade server, AI search, voice.", icon: "Cpu", color: "#ec4899" },
    { name: "Engineering Team (CrewAI)", tech: ["Next.js", "FastAPI", "CrewAI", "OpenAI", "OpenRouter", "Ollama", "AWS", "Docker"], desc: "Autonomous multi-agent team that plans architecture, writes code, tests end-to-end. Docker-based isolated code execution with automated QA.", icon: "Terminal", color: "#10b981" },
    { name: "Deep Research Agent", tech: ["Next.js", "FastAPI", "CrewAI", "OpenAI", "OpenRouter", "Ollama", "AWS"], desc: "Intelligent query decomposition, multi-model research (GPT-4o, Llama3, OpenRouter), structured report generation with automated email delivery.", icon: "Search", color: "#6366f1" },
    { name: "LangGraph Chatbot", tech: ["Next.js", "FastAPI", "LangGraph", "AWS", "LangSmith"], desc: "Real tools integration — emails, OCR, Telegram, web search, Wikipedia, PDF generation. Multi-user, SQL memory, parallel threads, token tracking.", icon: "Bot", color: "#8b5cf6" },
    { name: "Medical Healthcare AI", tech: ["Next.js", "FastAPI", "AWS", "OpenAI Agents", "LLM", "SMTP"], desc: "Medical report analysis, patient-specialist matching, email summaries, clinic management dashboard, bulk doctor upload, pathology reports.", icon: "Stethoscope", color: "#06b6d4" },
    { name: "RAG Notebook", tech: ["Next.js", "OpenAI", "PostgreSQL (pgvector)", "Prisma", "Docker"], desc: "Chat with documents — PDF, Word, text, web pages. Semantic search with vector embeddings. Clerk auth, real-time progress tracking.", icon: "BookOpen", color: "#f59e0b" },
  ],
};

const ICON_MAP: Record<string, React.ElementType> = {
  Bot, TrendingUp, Shield, Wallet, Blocks, Tractor, MessageSquare, FileText,
  Headphones, Mail, Cpu, Terminal, Search, Stethoscope, BookOpen,
};

function GlassCard({ children, className = "", hover = true }: { children: React.ReactNode; className?: string; hover?: boolean }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl ${hover ? "transition-all duration-500 hover:bg-white/[0.08] hover:border-white/20 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]" : ""} ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="mb-12 text-center">
      <div className="inline-flex items-center gap-3 mb-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30">
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-indigo-200 to-violet-200 bg-clip-text text-transparent">{title}</h2>
      </div>
      {subtitle && <p className="text-slate-400 text-lg max-w-2xl mx-auto">{subtitle}</p>}
    </div>
  );
}

function SkillBar({ name, level, delay = 0, color = COLORS.primary }: { name: string; level: number; delay?: number; color?: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!barRef.current) return;
    gsap.fromTo(barRef.current, { width: "0%" }, { width: `${level}%`, duration: 1.5, delay, ease: "power3.out", scrollTrigger: { trigger: barRef.current, start: "top 85%" } });
  }, [level, delay]);
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2"><span className="text-sm font-medium text-slate-300">{name}</span><span className="text-sm text-slate-500">{level}%</span></div>
      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div ref={barRef} className="h-full rounded-full relative" style={{ background: `linear-gradient(90deg, ${color}, ${COLORS.accent})`, width: "0%" }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
        </div>
      </div>
    </div>
  );
}

function TiltCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setTransform(`perspective(1000px) rotateX(${(y - 0.5) * -20}deg) rotateY(${(x - 0.5) * 20}deg) scale(1.02)`);
  };
  const handleMouseLeave = () => { setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)"); };
  return <div ref={cardRef} className={`transition-transform duration-200 ease-out ${className}`} style={{ transform }} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}>{children}</div>;
}

function HeroScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    const w = mount.offsetWidth, h = mount.offsetHeight;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f0f1a, 0.002);
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
    camera.position.z = 30;
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h); renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x0f0f1a, 1); mount.appendChild(renderer.domElement);

    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorPalette = [new THREE.Color(0x6366f1), new THREE.Color(0x8b5cf6), new THREE.Color(0x06b6d4), new THREE.Color(0xa855f7), new THREE.Color(0x3b82f6)];
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 100; positions[i * 3 + 1] = (Math.random() - 0.5) * 100; positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
      const c = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    const particleMat = new THREE.PointsMaterial({ size: 0.5, vertexColors: true, transparent: true, opacity: 0.8, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    const particles = new THREE.Points(particleGeo, particleMat); scene.add(particles);

    const shapes: THREE.Mesh[] = [];
    const shapeGeos = [new THREE.IcosahedronGeometry(1, 0), new THREE.OctahedronGeometry(1, 0), new THREE.TetrahedronGeometry(1, 0), new THREE.BoxGeometry(1, 1, 1), new THREE.TorusGeometry(0.7, 0.3, 8, 20)];
    for (let i = 0; i < 25; i++) {
      const geo = shapeGeos[Math.floor(Math.random() * shapeGeos.length)];
      const mat = new THREE.MeshBasicMaterial({ color: colorPalette[Math.floor(Math.random() * colorPalette.length)], transparent: true, opacity: 0.15, wireframe: true });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set((Math.random() - 0.5) * 60, (Math.random() - 0.5) * 60, (Math.random() - 0.5) * 40);
      mesh.scale.setScalar(Math.random() * 2 + 0.5);
      (mesh as any).userData = { rotSpeed: { x: (Math.random() - 0.5) * 0.02, y: (Math.random() - 0.5) * 0.02, z: (Math.random() - 0.5) * 0.02 }, floatSpeed: Math.random() * 0.5 + 0.2, floatOffset: Math.random() * Math.PI * 2, baseY: mesh.position.y };
      scene.add(mesh); shapes.push(mesh);
    }

    const textGroup = new THREE.Group();
    const textMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.1, wireframe: true });
    for (let i = 0; i < 50; i++) { const angle = (i / 50) * Math.PI * 2; const cube = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2, 0.3), textMat); cube.position.x = Math.cos(angle) * 15; cube.position.z = Math.sin(angle) * 15; cube.position.y = Math.sin(i * 0.5) * 3; textGroup.add(cube); }
    scene.add(textGroup);

    const lineMat = new THREE.LineBasicMaterial({ color: 0x6366f1, transparent: true, opacity: 0.05 });
    const linePositions: number[] = [];
    for (let i = 0; i < 50; i++) { const start = new THREE.Vector3((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40); const end = new THREE.Vector3(start.x + (Math.random() - 0.5) * 10, start.y + (Math.random() - 0.5) * 10, start.z + (Math.random() - 0.5) * 10); linePositions.push(start.x, start.y, start.z, end.x, end.y, end.z); }
    const lineGeo = new THREE.BufferGeometry(); lineGeo.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat); scene.add(lines);

    const clock = new THREE.Clock();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      particles.rotation.y = time * 0.05; particles.rotation.x = Math.sin(time * 0.03) * 0.1;
      shapes.forEach((shape) => { const ud = (shape as any).userData; shape.rotation.x += ud.rotSpeed.x; shape.rotation.y += ud.rotSpeed.y; shape.rotation.z += ud.rotSpeed.z; shape.position.y = ud.baseY + Math.sin(time * ud.floatSpeed + ud.floatOffset) * 2; });
      textGroup.rotation.y = time * 0.1; textGroup.rotation.x = Math.sin(time * 0.2) * 0.1;
      camera.position.x += (mouseRef.current.x * 5 - camera.position.x) * 0.02;
      camera.position.y += (-mouseRef.current.y * 5 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0); renderer.render(scene, camera);
    }; animate();

    const handleMouseMove = (e: MouseEvent) => { mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1; mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1; };
    window.addEventListener("mousemove", handleMouseMove);
    const handleResize = () => { const newW = mount.offsetWidth, newH = mount.offsetHeight; camera.aspect = newW / newH; camera.updateProjectionMatrix(); renderer.setSize(newW, newH); };
    window.addEventListener("resize", handleResize);
    return () => { cancelAnimationFrame(frameRef.current); window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("resize", handleResize); renderer.dispose(); if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement); };
  }, []);
  return <div ref={mountRef} className="absolute inset-0 z-0" />;
}

function HeroSection() {
  const contentRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!contentRef.current) return; gsap.fromTo(contentRef.current.children, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 1, stagger: 0.15, ease: "power3.out", delay: 0.5 }); }, []);
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <HeroScene />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0f0f1a]/50 to-[#0f0f1a] z-10 pointer-events-none" />
      <div ref={contentRef} className="relative z-20 text-center px-4 max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-8">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm text-slate-300">Full Stack Developer & AI Engineer</span>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6">
          <span className="bg-gradient-to-r from-white via-indigo-200 to-violet-200 bg-clip-text text-transparent">Jyoti Prakash</span><br />
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">Mohanta</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">Building web applications from idea to deployment. Next.js, AI/LLM, Blockchain, and scalable backend systems. 4+ years of turning complex requirements into simple, practical solutions.</p>
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <a href="#projects" className="group px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-105">View Projects<ChevronDown className="inline-block w-4 h-4 ml-2 group-hover:translate-y-1 transition-transform" /></a>
          <a href="#contact" className="px-8 py-4 rounded-xl border border-white/20 text-white font-semibold hover:bg-white/5 hover:border-white/40 transition-all duration-300 hover:scale-105">Get In Touch</a>
        </div>
        <div className="flex flex-wrap justify-center gap-6 text-slate-400">
          <a href={`mailto:${RESUME.email}`} className="flex items-center gap-2 hover:text-indigo-400 transition-colors"><Mail className="w-4 h-4" /><span className="text-sm">{RESUME.email}</span></a>
          <a href={`tel:${RESUME.phone}`} className="flex items-center gap-2 hover:text-indigo-400 transition-colors"><Phone className="w-4 h-4" /><span className="text-sm">{RESUME.phone}</span></a>
          <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span className="text-sm">{RESUME.location}</span></span>
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <a href={`https://${RESUME.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:scale-110"><Link2 className="w-5 h-5 text-slate-300 hover:text-indigo-400" /></a>
          <a href={`https://${RESUME.github}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-110"><GitCompareArrows className="w-5 h-5 text-slate-300 hover:text-violet-400" /></a>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce"><ChevronDown className="w-6 h-6 text-slate-500" /></div>
    </section>
  );
}

function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => { if (!sectionRef.current) return; const els = sectionRef.current.querySelectorAll(".animate-in"); gsap.fromTo(els, { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }); }, []);
  const stats = [{ label: "Years Experience", value: "4+", icon: Briefcase }, { label: "Projects Built", value: "16+", icon: FolderOpen }, { label: "Enterprise Clients", value: "7+", icon: Globe }, { label: "AI/LLM Projects", value: "10+", icon: Brain }];
  return (
    <section ref={sectionRef} id="about" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <SectionTitle icon={Sparkles} title="About Me" subtitle="Passionate about building scalable, intelligent, and beautiful web applications" />
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-in">
            <GlassCard className="p-8">
              <p className="text-slate-300 leading-relaxed text-lg mb-6">{RESUME.summary}</p>
              <div className="flex flex-wrap gap-2">{["Next.js", "AI/LLM", "Blockchain", "Microservices", "Cloud"].map((tag) => <span key={tag} className="px-3 py-1 rounded-full text-sm bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{tag}</span>)}</div>
            </GlassCard>
          </div>
          <div className="grid grid-cols-2 gap-4 animate-in">
            {stats.map((stat, i) => { const IconComp = stat.icon; return <TiltCard key={i}><GlassCard className="p-6 text-center"><IconComp className="w-8 h-8 text-indigo-400 mx-auto mb-3" /><div className="text-3xl font-bold text-white mb-1">{stat.value}</div><div className="text-sm text-slate-400">{stat.label}</div></GlassCard></TiltCard>; })}
          </div>
        </div>
      </div>
    </section>
  );
}

function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeCategory, setActiveCategory] = useState("languages");
  const categories = [
    { key: "languages", label: "Languages", icon: Code2, color: "#6366f1" }, { key: "frontend", label: "Frontend", icon: Layers, color: "#8b5cf6" },
    { key: "backend", label: "Backend", icon: Server, color: "#06b6d4" }, { key: "database", label: "Database", icon: Database, color: "#f59e0b" },
    { key: "ai", label: "AI / ML", icon: Brain, color: "#ec4899" }, { key: "cloud", label: "Cloud / DevOps", icon: Cloud, color: "#10b981" },
    { key: "blockchain", label: "Blockchain", icon: Blocks, color: "#a855f7" }, { key: "other", label: "Other", icon: Zap, color: "#3b82f6" },
  ];
  const skillLevels: Record<string, { name: string; level: number }[]> = {
    languages: [{ name: "Node.js", level: 95 }, { name: "Python", level: 90 }, { name: "TypeScript", level: 92 }, { name: "JavaScript", level: 95 }],
    frontend: [{ name: "Next.js", level: 95 }, { name: "React.js", level: 93 }, { name: "Tailwind CSS", level: 90 }, { name: "Three.js", level: 75 }, { name: "GSAP", level: 80 }],
    backend: [{ name: "Express.js", level: 95 }, { name: "NestJS", level: 88 }, { name: "FastAPI", level: 90 }, { name: "GraphQL", level: 85 }, { name: "REST APIs", level: 95 }],
    database: [{ name: "PostgreSQL", level: 90 }, { name: "MySQL", level: 92 }, { name: "Prisma", level: 88 }, { name: "Vector DB", level: 85 }, { name: "Redis", level: 80 }],
    ai: [{ name: "LLM Integration", level: 92 }, { name: "LangGraph", level: 90 }, { name: "CrewAI", level: 88 }, { name: "RAG Systems", level: 90 }, { name: "MCP", level: 85 }, { name: "Ollama", level: 88 }],
    cloud: [{ name: "AWS", level: 85 }, { name: "Azure", level: 80 }, { name: "Docker", level: 88 }, { name: "CI/CD", level: 82 }],
    blockchain: [{ name: "Smart Contracts", level: 85 }, { name: "ERC-20/1155", level: 88 }, { name: "Subgraph", level: 80 }, { name: "NFT", level: 82 }, { name: "Polygon ID", level: 78 }],
    other: [{ name: "System Design", level: 85 }, { name: "Microservices", level: 90 }, { name: "DSA", level: 88 }, { name: "Stripe", level: 82 }, { name: "Kafka", level: 75 }],
  };
  useEffect(() => { if (!sectionRef.current) return; const els = sectionRef.current.querySelectorAll(".animate-in"); gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }); }, [activeCategory]);
  return (
    <section ref={sectionRef} id="skills" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <SectionTitle icon={Cpu} title="Skills & Expertise" subtitle="Comprehensive tech stack spanning frontend, backend, AI, and blockchain" />
        <div className="animate-in flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((cat) => { const IconComp = cat.icon; return <button key={cat.key} onClick={() => setActiveCategory(cat.key)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeCategory === cat.key ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]" : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"}`}><IconComp className="w-4 h-4" />{cat.label}</button>; })}
        </div>
        <div className="animate-in grid md:grid-cols-2 gap-8">
          <GlassCard className="p-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-indigo-400" />Proficiency Levels</h3>
            {skillLevels[activeCategory].map((skill, i) => <SkillBar key={skill.name} name={skill.name} level={skill.level} delay={i * 0.1} color={categories.find((c) => c.key === activeCategory)?.color} />)}
          </GlassCard>
          <GlassCard className="p-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2"><PieChart className="w-5 h-5 text-violet-400" />Skill Distribution</h3>
            <div className="grid grid-cols-2 gap-3">
              {RESUME.skills[activeCategory as keyof typeof RESUME.skills].map((skill) => <div key={skill} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all duration-300"><CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /><span className="text-sm text-slate-300">{skill}</span></div>)}
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  );
}

function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => { if (!sectionRef.current) return; const cards = sectionRef.current.querySelectorAll(".exp-card"); gsap.fromTo(cards, { x: -60, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }); }, []);
  return (
    <section ref={sectionRef} id="experience" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <SectionTitle icon={Briefcase} title="Work Experience" subtitle="Professional journey building enterprise-grade applications" />
        <div className="relative">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-indigo-500 via-violet-500 to-transparent" />
          {RESUME.experience.map((exp, i) => (
            <div key={i} className={`exp-card relative mb-12 md:w-1/2 ${i % 2 === 0 ? "md:ml-auto md:pl-12" : "md:mr-auto md:pr-12 md:text-right"}`}>
              <div className={`absolute top-6 w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 border-2 border-[#0f0f1a] shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10 ${i % 2 === 0 ? "left-4 md:-left-2" : "left-4 md:left-auto md:-right-2"}`} />
              <TiltCard><GlassCard className="p-6 md:p-8 ml-12 md:ml-0">
                <div className="flex flex-wrap items-center gap-3 mb-3"><h3 className="text-xl font-bold text-white">{exp.role}</h3><span className="px-3 py-1 rounded-full text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">{exp.period}</span></div>
                <p className="text-violet-400 font-medium mb-1">{exp.company}</p><p className="text-slate-500 text-sm mb-4">{exp.location}</p>
                <ul className="space-y-2 mb-4">{exp.highlights.map((h, hi) => <li key={hi} className="flex items-start gap-2 text-slate-300 text-sm"><Zap className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" /><span>{h}</span></li>)}</ul>
                <div className={`flex flex-wrap gap-2 ${i % 2 !== 0 ? "md:justify-end" : ""}`}>{exp.tags.map((tag) => <span key={tag} className="px-2 py-1 rounded-md text-xs bg-white/5 text-slate-400 border border-white/10">{tag}</span>)}</div>
              </GlassCard></TiltCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [filter, setFilter] = useState("all");
  const filters = [{ key: "all", label: "All", icon: FolderOpen }, { key: "ai", label: "AI/LLM", icon: Brain }, { key: "blockchain", label: "Blockchain", icon: Blocks }, { key: "fullstack", label: "Full Stack", icon: Code2 }];
  const filteredProjects = useMemo(() => {
    if (filter === "all") return RESUME.projects;
    if (filter === "ai") return RESUME.projects.filter((p) => p.tech.some((t) => ["LLM", "GenAI", "OpenAI", "RAG", "LangGraph", "CrewAI", "Ollama", "Vector DB"].some((k) => t.includes(k))));
    if (filter === "blockchain") return RESUME.projects.filter((p) => p.tech.some((t) => ["Blockchain", "Smart Contract", "ERC", "NFT", "Subgraph", "Metamask", "Polygon"].some((k) => t.includes(k))));
    return RESUME.projects.filter((p) => !p.tech.some((t) => ["LLM", "GenAI", "OpenAI", "RAG", "Blockchain", "Smart Contract", "ERC", "NFT"].some((k) => t.includes(k))));
  }, [filter]);
  useEffect(() => { if (!sectionRef.current) return; const cards = sectionRef.current.querySelectorAll(".project-card"); gsap.fromTo(cards, { y: 60, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 70%" } }); }, [filter]);
  return (
    <section ref={sectionRef} id="projects" className="py-24 px-4 relative">
      <div className="max-w-7xl mx-auto">
        <SectionTitle icon={FolderOpen} title="Projects" subtitle="16+ production-ready applications spanning AI, blockchain, and enterprise solutions" />
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {filters.map((f) => { const IconComp = f.icon; return <button key={f.key} onClick={() => setFilter(f.key)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${filter === f.key ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]" : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 hover:text-white"}`}><IconComp className="w-4 h-4" />{f.label}</button>; })}
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => { const IconComp = ICON_MAP[project.icon] || Code2; return <TiltCard key={project.name} className="project-card"><GlassCard className="h-full flex flex-col p-6">
            <div className="flex items-center gap-3 mb-4"><div className="p-3 rounded-xl" style={{ backgroundColor: `${project.color}15`, border: `1px solid ${project.color}30` }}><IconComp className="w-6 h-6" style={{ color: project.color }} /></div><h3 className="text-lg font-bold text-white">{project.name}</h3></div>
            <p className="text-slate-400 text-sm mb-4 flex-grow">{project.desc}</p>
            <div className="flex flex-wrap gap-1.5 mb-4">{project.tech.slice(0, 5).map((t) => <span key={t} className="px-2 py-0.5 rounded-md text-xs bg-white/5 text-slate-400 border border-white/5">{t}</span>)}{project.tech.length > 5 && <span className="px-2 py-0.5 rounded-md text-xs text-slate-500">+{project.tech.length - 5}</span>}</div>
            <div className="flex gap-2"><button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"><Code2 className="w-4 h-4" />Code</button><button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-sm text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"><ExternalLink className="w-4 h-4" />Demo</button></div>
          </GlassCard></TiltCard>; })}
        </div>
      </div>
    </section>
  );
}

function EducationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => { if (!sectionRef.current) return; const cards = sectionRef.current.querySelectorAll(".edu-card"); gsap.fromTo(cards, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }); }, []);
  return (
    <section ref={sectionRef} id="education" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <SectionTitle icon={GraduationCap} title="Education & Certifications" subtitle="Academic foundation and professional certifications" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="edu-card"><GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6"><div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20"><GraduationCap className="w-6 h-6 text-indigo-400" /></div><h3 className="text-xl font-bold text-white">Education</h3></div>
            {RESUME.education.map((edu, i) => <div key={i} className="mb-4 last:mb-0"><h4 className="font-semibold text-white">{edu.degree}</h4><p className="text-violet-400">{edu.school}</p><p className="text-slate-500 text-sm">{edu.period}</p></div>)}
          </GlassCard></div>
          <div className="edu-card"><GlassCard className="p-8">
            <div className="flex items-center gap-3 mb-6"><div className="p-3 rounded-xl bg-violet-500/10 border border-violet-500/20"><Award className="w-6 h-6 text-violet-400" /></div><h3 className="text-xl font-bold text-white">Certifications</h3></div>
            {RESUME.certificates.map((cert, i) => <div key={i} className="mb-4 last:mb-0 p-4 rounded-xl bg-white/5 border border-white/5"><h4 className="font-semibold text-white text-sm">{cert.name}</h4><div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-400"><span>ID: {cert.id}</span><span>Issued: {cert.issued}</span>{cert.expires && <span>Expires: {cert.expires}</span>}</div></div>)}
          </GlassCard></div>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [formState, setFormState] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  useEffect(() => { if (!sectionRef.current) return; const els = sectionRef.current.querySelectorAll(".animate-in"); gsap.fromTo(els, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power3.out", scrollTrigger: { trigger: sectionRef.current, start: "top 75%" } }); }, []);
  const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); setSubmitted(true); setTimeout(() => setSubmitted(false), 3000); };
  return (
    <section ref={sectionRef} id="contact" className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <SectionTitle icon={Send} title="Get In Touch" subtitle="Let's build something amazing together" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="animate-in space-y-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Contact Information</h3>
              <div className="space-y-4">
                <a href={`mailto:${RESUME.email}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"><Mail className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" /><span className="text-slate-300 text-sm">{RESUME.email}</span></a>
                <a href={`tel:${RESUME.phone}`} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group"><Phone className="w-5 h-5 text-violet-400 group-hover:scale-110 transition-transform" /><span className="text-slate-300 text-sm">{RESUME.phone}</span></a>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5"><MapPin className="w-5 h-5 text-cyan-400" /><span className="text-slate-300 text-sm">{RESUME.location}</span></div>
              </div>
            </GlassCard>
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Social Links</h3>
              <div className="flex gap-3">
                <a href={`https://${RESUME.linkedin}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-indigo-500/20 hover:border-indigo-500/40 transition-all duration-300 hover:scale-110"><Link2 className="w-5 h-5 text-slate-300 hover:text-indigo-400" /></a>
                <a href={`https://${RESUME.github}`} target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-violet-500/20 hover:border-violet-500/40 transition-all duration-300 hover:scale-110"><GitCompareArrows className="w-5 h-5 text-slate-300 hover:text-violet-400" /></a>
              </div>
            </GlassCard>
          </div>
          <div className="animate-in">
            <GlassCard className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="block text-sm text-slate-400 mb-1">Name</label><input type="text" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all" placeholder="Your name" required /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Email</label><input type="email" value={formState.email} onChange={(e) => setFormState({ ...formState, email: e.target.value })} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all" placeholder="your@email.com" required /></div>
                <div><label className="block text-sm text-slate-400 mb-1">Message</label><textarea value={formState.message} onChange={(e) => setFormState({ ...formState, message: e.target.value })} rows={4} className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 focus:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all resize-none" placeholder="Tell me about your project..." required /></div>
                <button type="submit" className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-[1.02] flex items-center justify-center gap-2">{submitted ? <><CheckCircle2 className="w-5 h-5" />Message Sent!</> : <><Send className="w-5 h-5" />Send Message</>}</button>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
}

function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => { const handleScroll = () => setScrolled(window.scrollY > 50); window.addEventListener("scroll", handleScroll); return () => window.removeEventListener("scroll", handleScroll); }, []);
  const navLinks = [{ href: "#about", label: "About" }, { href: "#skills", label: "Skills" }, { href: "#experience", label: "Experience" }, { href: "#projects", label: "Projects" }, { href: "#education", label: "Education" }, { href: "#contact", label: "Contact" }];
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "bg-[#0f0f1a]/80 backdrop-blur-xl border-b border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.3)]" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="#" className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">JPM</a>
        <div className="hidden md:flex items-center gap-1">{navLinks.map((link) => <a key={link.href} href={link.href} className="px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-300">{link.label}</a>)}</div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300">{mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}</button>
      </div>
      {mobileOpen && <div className="md:hidden bg-[#0f0f1a]/95 backdrop-blur-xl border-t border-white/5 px-4 py-4 space-y-2">{navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="block px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all">{link.label}</a>)}</div>}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="py-12 px-4 border-t border-white/5">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-slate-500 text-sm mb-4">Built with Next.js, Three.js, GSAP & Tailwind CSS</p>
        <p className="text-slate-600 text-xs">&copy; 2025 Jyoti Prakash Mohanta. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default function PortfolioPage() {
  return (
    <>
      <Head>
        <title>Jyoti Prakash Mohanta | Full Stack Developer & AI Engineer</title>
        <meta name="description" content="Portfolio of Jyoti Prakash Mohanta - Full Stack Developer specializing in Next.js, AI/LLM, Blockchain, and scalable backend systems." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="min-h-screen bg-[#0f0f1a] text-white overflow-x-hidden">
        <Navigation />
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <EducationSection />
        <ContactSection />
        <Footer />
      </main>
    </>
  );
}