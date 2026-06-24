"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-950 items-center justify-center">
        {/* Gradient mesh background */}
        <div className="absolute inset-0 gradient-mesh opacity-80" />
        <div className="absolute inset-0 dot-pattern opacity-30" />

        {/* Floating orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-brand-500/20 blur-3xl"
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -30, 20, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl"
          animate={{
            x: [0, -25, 15, 0],
            y: [0, 25, -15, 0],
            scale: [1, 0.9, 1.1, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
        <motion.div
          className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full bg-cyan-500/15 blur-3xl"
          animate={{
            x: [0, 20, -10, 0],
            y: [0, -20, 10, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Content */}
        <div className="relative z-10 max-w-lg px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/25">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">Cortex AI</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Your AI-Powered
              <br />
              <span className="gradient-text">Business Operating System</span>
            </h1>
            <p className="text-lg text-surface-400 leading-relaxed">
              Unify your CRM, projects, invoicing, knowledge base, and team
              collaboration in one intelligent workspace powered by AI.
            </p>
          </motion.div>

          <motion.div
            className="mt-12 grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            {[
              { label: "Smart CRM", desc: "AI-powered lead scoring" },
              { label: "Projects", desc: "Kanban & timeline views" },
              { label: "Invoicing", desc: "Automated billing" },
              { label: "AI Assistant", desc: "Natural language queries" },
            ].map((feature, i) => (
              <motion.div
                key={feature.label}
                className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm p-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: "rgba(99,102,241,0.3)" }}
              >
                <div className="text-sm font-semibold text-white">
                  {feature.label}
                </div>
                <div className="text-xs text-surface-400 mt-1">
                  {feature.desc}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Auth Form */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">Cortex AI</span>
            </Link>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
