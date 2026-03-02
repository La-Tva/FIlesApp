export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 max-w-sm w-full mx-4 text-center">
        <div className="w-16 h-16 bg-violet-500/20 border border-violet-400/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          We sent you a magic link. Click it to sign in — no password needed.
        </p>
        <p className="text-slate-600 text-xs mt-6">
          The link expires in 10 minutes.
        </p>
      </div>
    </div>
  );
}
