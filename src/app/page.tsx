"use client";

import { motion } from "framer-motion";
import { ArrowRight, Book, Globe, Shield, Zap, Mail } from "lucide-react";
import Link from "next/link";
import { DecorativeWave } from "@/components/Animations";

export default function LandingPage() {
  const features = [
    {
      icon: <Book className="w-6 h-6" />,
      title: "Workspace Notion",
      desc: "Prenez des notes et organisez vos liens dans un espace collaboratif premium.",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Accès Universel",
      desc: "Retrouvez vos fichiers et documents partout, sur n'importe quel support.",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Sécurité & Privé",
      desc: "Vos données sont chiffrées et stockées sur une infrastructure dédiée.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0503] text-white relative overflow-hidden flex flex-col">
      <DecorativeWave />

      {/* Navigation */}
      <nav className="relative z-20 flex items-center justify-between px-6 py-8 md:px-12">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <ArrowRight className="w-6 h-6 -rotate-45 text-white" />
          </div>
          <span className="text-2xl font-serif italic text-white tracking-tight">
            SwiftDrop
          </span>
        </div>
        <Link
          href="/login"
          className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm font-bold hover:bg-white/10 transition-all text-white"
        >
          Se connecter
        </Link>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-[10px] font-bold uppercase tracking-widest mb-8">
            <Zap className="w-3 h-3" /> Nouveau : Workspace Notion Intégré
          </div>
          <h1 className="text-6xl md:text-8xl font-serif italic mb-8 tracking-tight leading-[1.1]">
            L'espace de stockage <br />{" "}
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Ultra-Premium.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#A0A0A0] max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
            SwiftDrop redéfinit la gestion de vos fichiers et notes.{" "}
            <br className="hidden md:block" /> Une interface raffinée, une
            synchronisation instantanée et une sécurité inégalée.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href="/login"
              className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full font-bold text-lg hover:scale-105 transition-all shadow-[0_4px_30px_rgba(249,115,22,0.4)] flex items-center justify-center gap-3 group"
            >
              Accéder à mon espace{" "}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-40 max-w-6xl w-full px-6"
        >
          {features.map((f, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 text-left hover:border-orange-500/30 transition-all group"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 group-hover:scale-110 transition-transform">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
              <p className="text-[#808080] text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer / Contact */}
      <footer className="relative z-10 px-6 py-20 border-t border-white/5 flex flex-col items-center">
        <h2 className="text-3xl font-serif italic mb-6">Rejoindre SwiftDrop</h2>
        <p className="text-[#A0A0A0] text-center mb-10 max-w-lg">
          L'accès est actuellement restreint aux membres invités. <br /> Si vous
          souhaitez un compte, contactez-moi :
        </p>
        <a
          href="mailto:thomasimon83@gmail.com"
          className="flex items-center gap-4 px-8 py-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-orange-500/50 transition-all shadow-xl group"
        >
          <Mail className="w-6 h-6 text-orange-500" />
          <span className="text-xl font-bold tracking-tight">
            thomasimon83@gmail.com
          </span>
        </a>
        <div className="mt-20 text-[10px] uppercase tracking-[0.3em] text-[#444444] font-bold">
          SwiftDrop &copy; 2026 &mdash; Built with Passion
        </div>
      </footer>
    </div>
  );
}
