"use client";

import { User, Shield, HardDrive, Smartphone, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function ProfileClient({ items }: { items: any[] }) {
  const handleClick = (item: any) => {
    switch (item.id) {
      case 'personal': toast.info("Modification du profil bientôt disponible."); break;
      case 'security': toast.info("Paramètres de sécurité bientôt disponibles."); break;
      case 'storage': toast.info("Détails du stockage par appareil bientôt disponibles."); break;
      case 'subscription': toast.info("Gestion de l'abonnement bientôt disponible."); break;
      default: toast.info(`La section "${item.label}" sera bientôt disponible.`);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item, i) => (
        <div 
            key={i} 
            onClick={() => handleClick(item)}
            className="glass glass-hover p-6 rounded-3xl flex items-center justify-between group cursor-pointer border border-white/5"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:text-violet-400 transition-colors">
              <item.icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-white/90">{item.label}</h3>
              <p className="text-xs text-slate-500">{item.description}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
        </div>
      ))}
    </div>
  );
}
