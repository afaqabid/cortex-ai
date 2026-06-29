"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, Variants, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowRight,
  BarChart3,
  Users,
  FolderKanban,
  Receipt,
  BookOpen,
  Zap,
  Shield,
  Globe,
  ChevronRight,
  Star,
  Check,
  Building2,
  ChevronDown,
  Activity,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data for moving logo marquee
const clientCompanies = [
  { name: "TechFlow", logo: Sparkles },
  { name: "ApexDesign", logo: Zap },
  { name: "VertexLabs", logo: Globe },
  { name: "NovaCorp", logo: Shield },
  { name: "QuantumGroup", logo: Activity },
  { name: "EchoSystems", logo: Award },
];

const testimonialsRow1 = [
  {
    quote: "Cortex AI replaced Notion, Jira, and invoicing for our entire agency. We save $800/month and 10 hours a week.",
    author: "Sarah Jenkins",
    role: "CEO & Founder",
    company: "ApexDesign Studio",
    rating: 5,
  },
  {
    quote: "The AI Workspace Assistant is like having a Chief of Staff on demand. It summarizes client history and writes proposals in seconds.",
    author: "Michael Chen",
    role: "Co-Founder",
    company: "VertexLabs",
    rating: 5,
  },
  {
    quote: "We switched from Salesforce and couldn't be happier. Our sales pipeline scoring is incredibly accurate now.",
    author: "Amanda Ross",
    role: "Head of Growth",
    company: "NovaCorp LLC",
    rating: 5,
  },
];

const testimonialsRow2 = [
  {
    quote: "Real-time billing, automated expense tracking, and custom proposals. Cortex is the absolute holy grail for product studios.",
    author: "Liam O'Connor",
    role: "Product Director",
    company: "EchoSystems",
    rating: 5,
  },
  {
    quote: "Our security team verified Cortex's multi-tenant architecture and encryption standard. Solid enterprise-grade product.",
    author: "David Vance",
    role: "CTO",
    company: "CloudScale Inc.",
    rating: 5,
  },
  {
    quote: "5 years of absolute reliability. We have had zero critical downtime and outstanding customer support.",
    author: "Elena Rostova",
    role: "Operations Lead",
    company: "TechFlow",
    rating: 5,
  },
];

const stats = [
  { end: 5, suffix: "+ Years", label: "In Active Market", decimals: 0 },
  { end: 15000, suffix: "+", label: "Teams Worldwide", decimals: 0 },
  { end: 99.99, suffix: "%", label: "Guaranteed Uptime", decimals: 2 },
  { end: 2.4, prefix: "$", suffix: "B+", label: "Invoices Processed", decimals: 1 },
];

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

function AnimatedCounter({ end, duration = 2000, decimals = 0, prefix = "", suffix = "" }: AnimatedCounterProps) {
  const [count, setCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          let startTimestamp: number | null = null;
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            setCount(easeProgress * end);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [mounted, end, duration]);

  const formattedCount = !mounted
    ? (decimals > 0 ? "0." + "0".repeat(decimals) : "0")
    : (decimals > 0 
        ? count.toFixed(decimals) 
        : new Intl.NumberFormat("en-US").format(Math.floor(count)));

  return (
    <span ref={elementRef}>
      {prefix}
      {formattedCount}
      {suffix}
    </span>
  );
}

const features = [
  {
    icon: Users,
    title: "Smart CRM",
    description: "AI-powered lead scoring, pipeline management, and automated follow-ups. Convert more leads with intelligent insights.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    description: "Kanban boards, timeline views, sprint planning, and task dependencies. Manage projects with AI-assisted planning.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Receipt,
    title: "Invoicing & Finance",
    description: "Generate invoices, track payments, manage expenses, and forecast revenue. AI-powered proposals and contracts.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Notion-like editor with AI writing assistant, semantic search, and version history. Build your team's collective intelligence.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Revenue reports, team performance, client analytics, and predictive insights powered by AI trend detection.",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Workspace Assistant",
    description: "Natural language queries across your entire workspace. Generate proposals, summarize meetings, and automate workflows.",
    color: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-500/10",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "$29",
    description: "Essential tools for freelancers and small teams getting started.",
    features: [
      "Up to 5 team members",
      "Core CRM & pipeline scoring",
      "Basic project Kanban boards",
      "50 invoices per month",
      "5GB shared storage",
      "Standard email support",
    ],
    popular: false,
    cta: "Start Free Trial",
  },
  {
    name: "Growth",
    price: "$79",
    description: "Powerful automation and intelligence for growing scale-ups.",
    features: [
      "Up to 25 team members",
      "Advanced AI pipeline scoring",
      "Gantt & timeline project views",
      "Unlimited invoicing & finance",
      "AI Workspace Assistant (1000 queries)",
      "25GB shared storage",
      "Priority 24/7 support",
    ],
    popular: true,
    cta: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "$199",
    description: "Full compliance, dedicated support, and unlimited scale.",
    features: [
      "Unlimited team members",
      "Dedicated custom database hookups",
      "Multi-tenant active organizational units",
      "Unlimited AI assistant queries",
      "SSO & Custom domains",
      "Custom SLA & account manager",
      "Audit logs & compliance reports",
    ],
    popular: false,
    cta: "Contact Sales",
  },
];

const faqs = [
  {
    q: "Can I import my data from Notion, Jira, or Salesforce?",
    a: "Yes! Cortex AI includes a simple one-click importer tool that allows you to sync and migrate your projects, CRM leads, invoice templates, and knowledge base pages in under 10 minutes.",
  },
  {
    q: "Is my organization's data secure?",
    a: "Absolutely. Cortex AI utilizes bank-grade AES-256 encryption at rest and TLS 1.3 in transit. We support multi-tenant isolation, enterprise-level role access permissions, and periodic external penetration testing.",
  },
  {
    q: "What is the quota limit for the Gemini AI Workspace Assistant?",
    a: "The Starter plan includes basic AI scoring. The Growth plan provides up to 1,000 queries/month, and the Enterprise plan includes unlimited queries. Custom usage expansions are available upon request.",
  },
  {
    q: "Do you offer a free trial?",
    a: "Yes, we offer a fully functional 14-day free trial on both the Starter and Growth tiers. No credit card is required to sign up.",
  },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function LandingPage() {
  const [activeFaqIndex, setActiveFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaqIndex(activeFaqIndex === index ? null : index);
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden selection:bg-brand-500/30 selection:text-brand-500">
      <style>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        .animate-marquee-left {
          display: flex;
          width: max-content;
          animation: marquee-left 25s linear infinite;
        }
        .animate-marquee-right {
          display: flex;
          width: max-content;
          animation: marquee-right 25s linear infinite;
        }
        .marquee-container:hover .animate-marquee-left,
        .marquee-container:hover .animate-marquee-right {
          animation-play-state: paused;
        }
        .gradient-mesh {
          background-image: 
            radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.15) 0px, transparent 50%),
            radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
            radial-gradient(at 50% 100%, rgba(236, 72, 153, 0.1) 0px, transparent 50%);
        }
      `}</style>

      {/* Background effects */}
      <div className="fixed inset-0 gradient-mesh opacity-65 pointer-events-none" />
      <div className="fixed inset-0 dot-pattern opacity-20 pointer-events-none" />

      {/* Navbar */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-50 flex items-center justify-between px-6 lg:px-12 py-4 border-b border-border/50 bg-background/60 backdrop-blur-lg"
      >
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">Cortex AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</Link>
          <Link href="#stats" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Growth</Link>
          <Link href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
          <Link href="#faqs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">FAQ</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 lg:pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-500 mb-8"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-semibold">Trusted by 15,000+ teams worldwide</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Your entire business,
            <br />
            <span className="gradient-text">one intelligent workspace</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Unify CRM, projects, invoicing, knowledge base, and team
            collaboration in a single AI-powered platform. Running successfully in the market for the past 5 years.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-brand-500/25 hover:bg-brand-600 hover:shadow-brand-500/40 transition-all"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-8 py-4 text-base font-medium hover:bg-accent transition-colors"
            >
              See Features
            </Link>
          </div>
        </motion.div>

        {/* Dashboard preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mt-20 w-full max-w-5xl"
        >
          <div className="relative rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Mock window header */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3 bg-muted/40">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">
                    app.cortexai.com/dashboard
                  </span>
                </div>
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="p-6 space-y-4 text-left">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Revenue", value: "$48.2K", color: "bg-emerald-500" },
                  { label: "Projects", value: "24 Active", color: "bg-blue-500" },
                  { label: "Tasks", value: "156 Done", color: "bg-violet-500" },
                  { label: "Clients", value: "38 Active", color: "bg-amber-500" },
                ].map((card) => (
                  <div key={card.label} className="rounded-xl bg-muted/30 p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("h-2 w-2 rounded-full", card.color)} />
                      <span className="text-xs text-muted-foreground font-medium">{card.label}</span>
                    </div>
                    <span className="text-xl font-bold">{card.value}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 h-40 rounded-xl bg-muted/20 border border-border/50 flex items-center justify-center p-4">
                  <div className="flex items-end gap-1.5 h-full w-full justify-between pt-4">
                    {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 75, 95].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.5 + i * 0.05 }}
                        className="flex-1 rounded-t bg-brand-500/35 hover:bg-brand-500 transition-colors"
                      />
                    ))}
                  </div>
                </div>
                <div className="h-40 rounded-xl bg-muted/20 border border-border/50 p-4 flex flex-col justify-between">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-brand-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">AI Intelligence Insight</span>
                  </div>
                  <div className="space-y-1.5 flex-1 mt-2">
                    <div className="h-2 rounded bg-brand-500/10 w-full animate-pulse" />
                    <div className="h-2 rounded bg-brand-500/10 w-[90%] animate-pulse" />
                    <div className="h-2 rounded bg-brand-500/10 w-[75%] animate-pulse" />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-medium">Updated 2m ago</span>
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect behind */}
          <div className="absolute -inset-10 -z-10 bg-gradient-to-b from-brand-500/15 via-transparent to-transparent blur-3xl" />
        </motion.div>
      </section>

      {/* Moving Clients Logo Marquee */}
      <section className="relative z-10 py-20 border-y border-border/50 bg-background/50 backdrop-blur-md overflow-hidden">
        <div className="flex items-center gap-3 px-6 max-w-6xl mx-auto mb-12 text-slate-400 justify-center">
          <Building2 className="h-5 w-5 text-slate-400/80" />
          <span className="text-sm sm:text-base uppercase tracking-widest font-black text-slate-400/80">Trusted by over 130+ modern companies</span>
        </div>
        <div className="relative flex w-full overflow-x-hidden marquee-container">
          <div className="animate-marquee-left flex gap-24 items-center">
            {/* Original logos */}
            {[...clientCompanies, ...clientCompanies, ...clientCompanies, ...clientCompanies, ...clientCompanies].map((comp, idx) => {
              const CompIcon = comp.logo;
              return (
                <div key={idx} className="flex items-center gap-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors select-none">
                  <CompIcon className="h-8 w-8 opacity-75" />
                  <span className="text-2xl font-black tracking-tight">{comp.name}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="relative z-10 px-6 py-20 lg:py-32 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-bold text-brand-500 uppercase tracking-widest">Growth & Trust</span>
            <h2 className="text-3xl sm:text-5xl font-black mt-3">
              Five years of scaling <span className="gradient-text">workspace operations</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-base sm:text-lg">
              We have spent half a decade engineering robust infrastructure to handle critical CRM data, projects, and billing queries. Our uptime and transaction scale guarantee premium reliability.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                whileHover={{ y: -4 }}
                className="p-6 rounded-2xl bg-card border border-border shadow-xl text-center flex flex-col justify-center"
              >
                <span className="text-3xl sm:text-5xl font-black text-brand-500 tracking-tight">
                  <AnimatedCounter
                    end={stat.end}
                    decimals={stat.decimals}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                  />
                </span>
                <span className="text-xs sm:text-sm font-bold text-muted-foreground uppercase mt-2.5 tracking-wider">{stat.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 px-6 py-20 lg:py-32 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-20"
          >
            <span className="text-sm font-bold text-brand-500 uppercase tracking-widest">Our Ecosystem</span>
            <h2 className="text-3xl sm:text-5xl font-black mt-3">
              Everything you need, <span className="gradient-text">unified</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto text-base sm:text-lg">
              Replace your scattered tools with one powerful platform. Every
              module works together seamlessly with AI at its core.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={item}
                  whileHover={{ y: -6 }}
                  className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-2xl hover:border-brand-500/20 overflow-hidden flex flex-col justify-between"
                >
                  <div>
                    <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl mb-6", feature.bgColor)}>
                      <Icon className="h-6 w-6 text-brand-500" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Moving Testimonials Marquee */}
      <section className="relative z-10 py-20 lg:py-32 bg-muted/10 border-y border-border/30 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 mb-16 text-center">
          <span className="text-sm font-bold text-brand-500 uppercase tracking-widest">Testimonials</span>
          <h2 className="text-3xl sm:text-5xl font-black mt-3">Loved by modern creators</h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Read stories from teams who transformed their workspace. Running for 5 years with exceptional feedback.
          </p>
        </div>

        <div className="space-y-8">
          {/* Row 1: Left moving */}
          <div className="relative flex w-full overflow-x-hidden marquee-container">
            <div className="animate-marquee-left flex gap-6 items-center">
              {[...testimonialsRow1, ...testimonialsRow1, ...testimonialsRow1].map((test, idx) => (
                <div key={idx} className="w-80 sm:w-96 rounded-2xl border border-border bg-card p-6 shadow-md flex flex-col justify-between select-none">
                  <div>
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-brand-500 text-brand-500" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                      "{test.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/50">
                    <div className="h-8 w-8 rounded-full bg-brand-500/10 flex items-center justify-center font-bold text-brand-500 text-xs uppercase">
                      {test.author[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{test.author}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">{test.role}, <span className="text-brand-500 font-semibold">{test.company}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Right moving */}
          <div className="relative flex w-full overflow-x-hidden marquee-container">
            <div className="animate-marquee-right flex gap-6 items-center">
              {[...testimonialsRow2, ...testimonialsRow2, ...testimonialsRow2].map((test, idx) => (
                <div key={idx} className="w-80 sm:w-96 rounded-2xl border border-border bg-card p-6 shadow-md flex flex-col justify-between select-none">
                  <div>
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(test.rating)].map((_, i) => (
                        <Star key={i} className="h-3.5 w-3.5 fill-brand-500 text-brand-500" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic leading-relaxed">
                      "{test.quote}"
                    </p>
                  </div>
                  <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border/50">
                    <div className="h-8 w-8 rounded-full bg-brand-500/10 flex items-center justify-center font-bold text-brand-500 text-xs uppercase">
                      {test.author[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{test.author}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium">{test.role}, <span className="text-brand-500 font-semibold">{test.company}</span></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-sm font-bold text-brand-500 uppercase tracking-widest">Pricing Plans</span>
            <h2 className="text-3xl sm:text-5xl font-black mt-3">Simple, predictable pricing</h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Start with our 14-day free trial. Choose a plan that suits your scale. Cancel at any time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={cn(
                  "relative rounded-2xl border bg-card p-8 flex flex-col justify-between transition-all",
                  plan.popular 
                    ? "border-brand-500 shadow-2xl scale-100 lg:scale-105 z-20" 
                    : "border-border shadow-lg"
                )}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-500 text-white font-extrabold text-[10px] uppercase tracking-widest px-3 py-1 rounded-full shadow-md shadow-brand-500/25">
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <div className="flex items-baseline gap-1.5 mt-4">
                    <span className="text-4xl font-black text-brand-500">{plan.price}</span>
                    <span className="text-xs text-muted-foreground font-semibold">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{plan.description}</p>
                  
                  <div className="mt-8 space-y-3.5">
                    {plan.features.map((feat) => (
                      <div key={feat} className="flex items-start gap-2.5 text-xs text-slate-800 dark:text-slate-200">
                        <Check className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/register"
                    className={cn(
                      "flex items-center justify-center w-full rounded-xl py-3 text-sm font-semibold transition-all cursor-pointer",
                      plan.popular
                        ? "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/25"
                        : "border border-border bg-card hover:bg-accent text-slate-800 dark:text-slate-200"
                    )}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="relative z-10 px-6 py-20 lg:py-32 border-t border-border/30 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-bold text-brand-500 uppercase tracking-widest">Support FAQ</span>
          <h2 className="text-3xl sm:text-5xl font-black mt-3">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = activeFaqIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex items-center justify-between w-full px-6 py-5 text-left font-bold text-sm sm:text-base text-slate-900 dark:text-white hover:bg-muted/10 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform duration-250 shrink-0 ml-4", isOpen && "rotate-180")} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 border-t border-border/40 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="relative z-10 px-6 py-20 lg:py-32 border-t border-border/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-5xl mx-auto rounded-3xl border border-border overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 gradient-mesh opacity-80" />
          <div className="relative p-8 lg:p-20 text-center flex flex-col items-center">
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white max-w-2xl leading-tight">
              Ready to transform your business operations?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto text-base sm:text-lg">
              Join thousands of scale-ups, teams, and developers using Cortex AI to unify CRM, projects, and finance.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-brand-500/25 hover:bg-brand-600 hover:shadow-brand-500/45 transition-all"
              >
                Start Free — No Credit Card
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-16 bg-muted/10 backdrop-blur-md">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold">Cortex AI</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The unified business operating system powered by next-generation artificial intelligence.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4">Product</h4>
            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              <Link href="#features" className="hover:text-brand-500 transition-colors">Features</Link>
              <Link href="#pricing" className="hover:text-brand-500 transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-brand-500 transition-colors">Integrations</Link>
              <Link href="#" className="hover:text-brand-500 transition-colors">Security</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4">Resources</h4>
            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              <Link href="#" className="hover:text-brand-500 transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-brand-500 transition-colors">API Reference</Link>
              <Link href="#" className="hover:text-brand-500 transition-colors">System Status</Link>
              <Link href="#" className="hover:text-brand-500 transition-colors">Developer Portal</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-4">Company</h4>
            <div className="flex flex-col gap-2.5 text-xs text-muted-foreground">
              <Link href="#" className="hover:text-brand-500 transition-colors">About Us</Link>
              <Link href="#" className="hover:text-brand-500 transition-colors">Press Kit</Link>
              <Link href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-brand-500 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-8 border-t border-border/30 text-xs text-muted-foreground">
          <span>© 2026 Cortex AI. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-brand-500 transition-colors">Twitter</Link>
            <Link href="#" className="hover:text-brand-500 transition-colors">GitHub</Link>
            <Link href="#" className="hover:text-brand-500 transition-colors">Discord</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
