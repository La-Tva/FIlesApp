"use client";

import { useState } from "react";
import { Plus, X, Folder, LayoutGrid, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { RENDER_BACKEND_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";

export function CreateModal({ 
    type, 
    userId, 
    spaceId, 
    folderId,
    isOpen, 
    onClose 
}: { 
    type: "space" | "folder", 
    userId: string,
    spaceId?: string,
    folderId?: string | null,
    isOpen: boolean, 
    onClose: () => void 
}) {
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const endpoint = type === "space" ? `${RENDER_BACKEND_URL}/api/spaces` : `${RENDER_BACKEND_URL}/api/folders`;
        const body = type === "space" 
            ? { name, ownerId: userId } 
            : { name, spaceId, parentId: folderId, ownerId: userId };

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                toast.success(`${type === 'space' ? 'Espace' : 'Dossier'} créé avec succès !`);
                onClose();
                setName("");
                router.refresh();
            } else {
                toast.error("Une erreur est survenue");
            }
        } catch (error) {
            toast.error("Impossible de joindre le serveur");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 pb-20 md:pb-6">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                />
                
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-md bg-[#0D0D0F] border border-white/10 rounded-[2.5rem] p-8 relative z-10 shadow-2xl"
                >
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                                {type === "space" ? <LayoutGrid className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                            </div>
                            <h2 className="text-xl font-bold font-outfit">Nouveau {type === "space" ? "Espace" : "Dossier"}</h2>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nom</label>
                            <input 
                                autoFocus
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={type === "space" ? "Mon Espace Perso" : "Mes Documents"}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all font-medium"
                                required
                            />
                        </div>

                        <button 
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-violet-400 hover:text-white transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 group disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Créer maintenant"}
                            {!loading && <Plus className="w-5 h-5" />}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
