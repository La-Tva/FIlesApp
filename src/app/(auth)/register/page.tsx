"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Mail, Lock, ArrowRight, Github } from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Compte créé avec succès !");
        router.push("/login");
      } else {
        toast.error(data.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Erreur de connexion au serveur");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6 overflow-hidden selection:bg-violet-500/30">
      {/* Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-8 md:p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-violet-500/10 blur-3xl rounded-full" />
          
          <header className="text-center mb-10 relative">
            <motion.div 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 mb-6 shadow-xl shadow-violet-500/20"
            >
              <User className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-black font-outfit tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-2">
              SwiftDrop <span className="text-violet-400">v2</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Créer votre compte premium</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-4">
              <div className="group relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-violet-400 transition-colors">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="group relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-violet-400 transition-colors">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="nom@exemple.com"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all font-medium"
                  />
                </div>
              </div>

              <div className="group relative">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1 mb-2 block group-focus-within:text-violet-400 transition-colors">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
                  <input 
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-violet-400 hover:text-white transition-all transform active:scale-[0.98] shadow-xl shadow-white/5 flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              {isLoading ? "Création..." : "S'inscrire"}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
            <button className="w-full glass py-4 rounded-2xl flex items-center justify-center gap-3 text-slate-300 hover:text-white transition-all font-semibold border border-white/5 hover:border-white/10">
              <Github className="w-5 h-5" /> Continuer avec GitHub
            </button>
            <p className="text-center text-slate-500 text-sm">
              Déjà un compte ? <Link href="/login" className="text-violet-400 hover:text-violet-300 font-bold underline-offset-4 hover:underline transition-all">Se connecter</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
