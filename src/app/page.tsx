"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Users,
    title: "Smart CRM",
    description:
      "AI-powered lead scoring, pipeline management, and automated follow-ups. Convert more leads with intelligent insights.",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: FolderKanban,
    title: "Project Management",
    description:
      "Kanban boards, timeline views, sprint planning, and task dependencies. Manage projects with AI-assisted planning.",
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
  },
  {
    icon: Receipt,
    title: "Invoicing & Finance",
    description:
      "Generate invoices, track payments, manage expenses, and forecast revenue. AI-powered proposals and contracts.",
    color: "from-emerald-500 to-teal-500",
    bgColor: "bg-emerald-500/10",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description:
      "Notion-like editor with AI writing assistant, semantic search, and version history. Build your team's collective intelligence.",
    color: "from-amber-500 to-orange-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description:
      "Revenue reports, team performance, client analytics, and predictive insights powered by AI trend detection.",
    color: "from-pink-500 to-rose-500",
    bgColor: "bg-pink-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Workspace Assistant",
    description:
      "Natural language queries across your entire workspace. Generate proposals, summarize meetings, and automate workflows.",
    color: "from-indigo-500 to-violet-500",
    bgColor: "bg-indigo-500/10",
  },
];

const trustedFeatures = [
  { icon: Shield, label: "Enterprise Security" },
  { icon: Globe, label: "Multi-Tenant" },
  { icon: Zap, label: "Real-time Sync" },
  { icon: Star, label: "99.9% Uptime" },
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
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 gradient-mesh opacity-40 pointer-events-none" />
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
          {["Features", "Pricing", "Docs", "Blog"].map((item) => (
            <Link
              key={item}
              href="#"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {item}
            </Link>
          ))}
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
            className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all"
          >
            Get Started
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 lg:pt-32 pb-20">
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
            <span className="font-medium">AI-Powered Business OS</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </motion.div>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight max-w-4xl">
            Your entire business,
            <br />
            <span className="gradient-text">one intelligent workspace</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Unify CRM, projects, invoicing, knowledge base, and team
            collaboration in a single AI-powered platform. Built for agencies,
            startups, and modern businesses.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
            <Link
              href="/register"
              className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-base font-semibold text-white shadow-xl shadow-brand-500/25 hover:bg-brand-600 hover:shadow-brand-500/40 transition-all"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-base font-medium hover:bg-accent transition-colors"
            >
              See Features
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-16">
            {trustedFeatures.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 text-sm text-muted-foreground"
              >
                <Icon className="h-4 w-4 text-brand-500" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Dashboard preview mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mt-20 w-full max-w-5xl"
        >
          <div className="relative rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
            {/* Mock window header */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/60" />
                <div className="h-3 w-3 rounded-full bg-amber-500/60" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-1">
                  <Globe className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    app.cortexai.com/dashboard
                  </span>
                </div>
              </div>
            </div>
            {/* Mock dashboard content */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: "Revenue", value: "$48.2K", color: "bg-emerald-500" },
                  { label: "Projects", value: "24", color: "bg-blue-500" },
                  { label: "Tasks", value: "156", color: "bg-violet-500" },
                  { label: "Clients", value: "38", color: "bg-amber-500" },
                ].map((card) => (
                  <div key={card.label} className="rounded-lg bg-muted/50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("h-2 w-2 rounded-full", card.color)} />
                      <span className="text-xs text-muted-foreground">{card.label}</span>
                    </div>
                    <span className="text-xl font-bold">{card.value}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 h-40 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-24">
                    {[40, 55, 35, 65, 50, 75, 60, 80, 70, 90, 75, 95].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.5 + i * 0.05 }}
                        className="w-4 rounded-t bg-brand-500/40"
                      />
                    ))}
                  </div>
                </div>
                <div className="h-40 rounded-lg bg-muted/30 border border-border/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-3.5 w-3.5 text-brand-500" />
                    <span className="text-xs font-medium">AI Insights</span>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-2 rounded-full bg-muted shimmer" style={{ width: `${100 - i * 15}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Glow effect behind */}
          <div className="absolute -inset-10 -z-10 bg-gradient-to-b from-brand-500/10 via-transparent to-transparent blur-3xl" />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 px-6 py-20 lg:py-32">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <span className="text-sm font-medium text-brand-500">Features</span>
            <h2 className="text-3xl sm:text-4xl font-bold mt-3">
              Everything you need,{" "}
              <span className="gradient-text">unified</span>
            </h2>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
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
                  whileHover={{ y: -4 }}
                  className="group relative rounded-xl border border-border bg-card p-6 transition-all hover:shadow-xl hover:border-brand-500/20"
                >
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-xl mb-4",
                      feature.bgColor
                    )}
                  >
                    <Icon className="h-6 w-6 text-brand-500" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-b from-brand-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 px-6 py-20 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-4xl mx-auto rounded-2xl border border-border overflow-hidden"
        >
          <div className="absolute inset-0 gradient-mesh" />
          <div className="relative p-8 lg:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold">
              Ready to transform your business?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Join thousands of teams using Cortex AI to streamline operations,
              boost productivity, and grow revenue with AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link
                href="/register"
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-8 py-3.5 text-base font-semibold text-white shadow-xl shadow-brand-500/25 hover:bg-brand-600 transition-all"
              >
                Start Free — No Credit Card
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold">Cortex AI</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Documentation
            </Link>
            <Link href="#" className="hover:text-foreground transition-colors">
              Support
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Cortex AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
