"use client";

import { useRef, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Zap, Monitor, Smartphone, ArrowRight } from "lucide-react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: Particle[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // PC icon center & phone icon center
    const getPC = () => ({ x: canvas.width * 0.28, y: canvas.height * 0.5 });
    const getPhone = () => ({ x: canvas.width * 0.72, y: canvas.height * 0.5 });

    const spawnParticle = () => {
      const from = Math.random() > 0.5 ? getPC() : getPhone();
      const to = from.x < canvas.width / 2 ? getPhone() : getPC();
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const life = 90 + Math.random() * 60;
      particles.push({
        x: from.x + (Math.random() - 0.5) * 20,
        y: from.y + (Math.random() - 0.5) * 20,
        vx: dx / life,
        vy: dy / life + (Math.random() - 0.5) * 0.5,
        life,
        maxLife: life,
        size: 1.5 + Math.random() * 2,
      });
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (Math.random() < 0.4) spawnParticle();

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        const progress = 1 - p.life / p.maxLife;
        const alpha = Math.sin(progress * Math.PI) * 0.8;

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, `rgba(167, 139, 250, ${alpha})`);  // violet-400
        gradient.addColorStop(1, `rgba(139, 92, 246, 0)`);           // violet-500

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        if (p.life <= 0) particles.splice(i, 1);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

export default function LandingPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    await signIn("resend", { email, redirect: false });
    setSent(true);
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-hidden flex items-center justify-center">
      {/* Ambient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(109,40,217,0.15)_0%,transparent_70%)] pointer-events-none" />

      <ParticleCanvas />

      {/* Icon pair */}
      <div className="absolute inset-0 flex items-center justify-between px-[12%] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 0.15, x: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center gap-3 text-violet-300"
        >
          <Monitor className="w-28 h-28" strokeWidth={0.8} />
          <span className="text-sm font-medium tracking-widest uppercase">Desktop</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 0.15, x: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center gap-3 text-violet-300"
        >
          <Smartphone className="w-28 h-28" strokeWidth={0.8} />
          <span className="text-sm font-medium tracking-widest uppercase">Mobile</span>
        </motion.div>
      </div>

      {/* Center card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 max-w-md w-full mx-4 text-center shadow-2xl"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
          className="w-16 h-16 bg-violet-500/20 border border-violet-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6"
        >
          <Zap className="w-8 h-8 text-violet-400" />
        </motion.div>

        <h1 className="text-4xl font-black text-white tracking-tight mb-2">SwiftDrop</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Your ephemeral digital bridge.<br />
          Share files between devices in seconds — no accounts, no clutter.
        </p>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <div className="w-12 h-12 bg-green-500/20 border border-green-400/30 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-white font-medium">Check your inbox!</p>
            <p className="text-slate-400 text-sm">We sent a magic link to <strong className="text-white">{email}</strong></p>
          </motion.div>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-3">
            <input
              type="email"
              required
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 outline-none focus:border-violet-400/50 focus:bg-white/10 transition-all text-sm"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Get started <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-slate-600">
          <span>⚡️ Instant sync</span>
          <span>🔒 Expires in 24h</span>
          <span>📱 QR pairing</span>
        </div>
      </motion.div>
    </div>
  );
}
