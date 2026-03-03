"use client";

import { useDropzone } from "react-dropzone";
import { useCallback, useState, useEffect } from "react";
import { 
    Upload, 
    X, 
    File as FileIcon, 
    Loader2, 
    CheckCircle2, 
    LayoutGrid, 
    Star, 
    Clock, 
    Users,
    Settings, 
    ChevronRight, 
    LogOut,
    ChevronDown 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { RENDER_BACKEND_URL, SOCKET_URL } from "@/lib/constants";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { io } from "socket.io-client";
import { LivingLogo, PulseIndicator, InteractiveIconWrapper } from "@/components/Animations";

interface UploadingFile {
    id: string;
    name: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
}

export function DashboardLayout({ 
    children, 
    spaceId = null,
    folderId = null,
    userId,
    userName = "User",
    userEmail = ""
}: { 
    children: React.ReactNode, 
    spaceId?: string | null,
    folderId?: string | null,
    userId: string,
    userName?: string,
    userEmail?: string
}) {
    const [uploads, setUploads] = useState<UploadingFile[]>([]);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentFilter = searchParams.get('filter') || 'all';

    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['websocket'] });
        
        const handleRefresh = (data?: any) => {
            // If we have a spaceId in data, only refresh if we are in that space
            // Otherwise refresh anyway (like for dashboard updates)
            if (!data || !data.spaceId || data.spaceId === spaceId || spaceId === 'all') {
                router.refresh();
            }
        };

        socket.on('file_uploaded', handleRefresh);
        socket.on('folder_created', handleRefresh);
        socket.on('item_deleted', handleRefresh);
        socket.on('item_renamed', handleRefresh);
        socket.on('item_updated', handleRefresh);
        socket.on('space_created', handleRefresh);
        socket.on('space_deleted', handleRefresh);

        return () => { socket.disconnect(); };
    }, [spaceId, router]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!spaceId) {
            toast.error("Veuillez entrer dans un espace pour uploader des fichiers.");
            return;
        }

        const newUploads = acceptedFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            progress: 0,
            status: 'uploading' as const
        }));

        setUploads(prev => [...prev, ...newUploads]);

        for (let i = 0; i < acceptedFiles.length; i++) {
            const file = acceptedFiles[i];
            const currentUpload = newUploads[i];

            const formData = new FormData();
            formData.append('spaceId', spaceId);
            formData.append('ownerId', userId);
            formData.append('folderId', folderId || 'null');
            formData.append('file', file);

            try {
                const res = await fetch(`${RENDER_BACKEND_URL}/api/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (res.ok) {
                    setUploads(prev => prev.map(u => u.id === currentUpload.id ? { ...u, status: 'completed', progress: 100 } : u));
                    toast.success(`${file.name} uploadé !`);
                } else {
                    throw new Error();
                }
            } catch (err) {
                setUploads(prev => prev.map(u => u.id === currentUpload.id ? { ...u, status: 'error' } : u));
                toast.error(`Erreur pour ${file.name}`);
            }
        }
    }, [spaceId, userId, folderId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop,
        noClick: true,
        noKeyboard: true
    });

    const handleLogout = async () => {
        toast.success("Déconnexion réussie");
        await signOut({ callbackUrl: "/login" });
    };

    const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

    return (
        <div {...getRootProps()} className="min-h-screen bg-transparent text-foreground selection:bg-orange-500/20 selection:text-white font-sans relative flex overflow-hidden">
            <input {...getInputProps()} />
            
            {/* Ambient Glowing Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[#F97316] rounded-bl-[100px] opacity-10 blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[#EA580C] rounded-tr-[100px] opacity-10 blur-[100px]" />
            </div>

            {/* Sidebar */}
            <aside className="w-72 bg-[#0A0503]/40 backdrop-blur-3xl border-r border-white/5 flex flex-col relative z-20 hidden lg:flex">
                <div className="p-8">
                    <Link href="/main" className="flex items-center gap-3 group">
                        <LivingLogo />
                        <span className="text-xl font-serif italic tracking-tight lowercase text-white">swiftdrop <span className="text-orange-500 font-sans not-italic text-xs ml-1">v2</span></span>
                    </Link>
                </div>

                <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto custom-scrollbar">
                    {[
                        { icon: LayoutGrid, label: 'Mes Espaces', href: '/main', filter: 'all' },
                        { icon: Star, label: 'Favoris', href: '/main?filter=favorites', filter: 'favorites' },
                        { icon: Clock, label: 'Récents', href: '/main?filter=recents', filter: 'recents' },
                        { icon: Users, label: 'Partagés', href: '/main?filter=shared', filter: 'shared' },
                    ].map((item, i) => {
                        const isActive = currentFilter === item.filter;
                        return (
                            <Link 
                                key={i} 
                                href={item.href}
                                className={`flex items-center justify-between px-4 py-3 rounded-2xl transition-all group ${isActive ? 'bg-white/10 text-white shadow-[0_0_15px_rgba(249,115,22,0.1)] border border-white/10' : 'text-[#A0A0A0] hover:text-white hover:bg-white/5'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <InteractiveIconWrapper>
                                        <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#666666] group-hover:text-white'}`} />
                                    </InteractiveIconWrapper>
                                    <span className={`text-sm tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                                </div>
                                {isActive && <PulseIndicator />}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <div className="flex items-center gap-3 p-2 rounded-2xl group transition-all">
                        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-serif italic text-sm border border-orange-500/30">
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-white truncate">{userName}</p>
                            <p className="text-[10px] text-[#A0A0A0] font-medium truncate">{userEmail || 'Membre Premium'}</p>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#0A0503]/80 backdrop-blur-2xl border-t border-white/5 z-[100] h-20 flex items-center justify-around lg:hidden px-6 pb-2">
                {[
                    { icon: LayoutGrid, href: '/main', filter: 'all' },
                    { icon: Star, href: '/main?filter=favorites', filter: 'favorites' },
                    { icon: Clock, href: '/main?filter=recents', filter: 'recents' },
                    { icon: Users, href: '/main?filter=shared', filter: 'shared' },
                ].map((item, i) => {
                    const isActive = currentFilter === item.filter;
                    return (
                        <Link 
                            key={i} 
                            href={item.href}
                            className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center transition-all relative ${isActive ? 'bg-orange-500/20 text-orange-500 scale-110 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'text-[#666666]'}`}
                        >
                            <InteractiveIconWrapper>
                                <item.icon className={`w-5 h-5`} />
                            </InteractiveIconWrapper>
                            {isActive && (
                                <div className="absolute -top-1 right-0">
                                    <PulseIndicator />
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Global Header */}
                <header className="h-20 lg:h-24 px-8 border-b border-white/5 flex items-center justify-between relative z-10 bg-[#0A0503]/40 backdrop-blur-xl">
                    <div className="flex items-center gap-4 lg:hidden">
                         <Link href="/main">
                            <LivingLogo />
                         </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-2 ml-4 lg:ml-0">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-[#999999]">Applications</p>
                         <InteractiveIconWrapper><ChevronRight className="w-3 h-3 text-white/20" /></InteractiveIconWrapper>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-white">Explorateur</p>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <div className="relative">
                            <button 
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center gap-3 px-3 py-1.5 rounded-full border border-white/10 hover:border-orange-500/50 hover:bg-white/5 transition-all group bg-transparent"
                            >
                                 <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center font-serif italic text-[10px] text-white">
                                    {initials.substring(0, 1)}
                                 </div>
                                 <span className="text-xs font-bold text-[#A0A0A0] group-hover:text-white transition-colors">{userName}</span>
                                 <InteractiveIconWrapper><ChevronDown className={`w-3 h-3 text-[#A0A0A0] group-hover:text-white transition-all ${showUserMenu ? 'rotate-180' : ''}`} /></InteractiveIconWrapper>
                            </button>

                            {/* User Dropdown */}
                            <AnimatePresence>
                                {showUserMenu && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -5 }}
                                        className="absolute right-0 top-12 w-56 bg-[#0A0503]/90 backdrop-blur-xl border border-white/5 rounded-2xl shadow-[0_10px_40px_-10px_rgba(249,115,22,0.2)] overflow-hidden z-50 p-2"
                                    >
                                        <div className="px-4 py-3 border-b border-white/5 mb-2">
                                            <p className="text-xs font-bold text-white">{userName}</p>
                                            <p className="text-[10px] text-[#A0A0A0] truncate">{userEmail}</p>
                                        </div>
                                        <button 
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-red-500/10 text-[#A0A0A0] hover:text-red-400 transition-all text-xs font-bold w-full"
                                        >
                                            <InteractiveIconWrapper><LogOut className="w-4 h-4" /></InteractiveIconWrapper> Se déconnecter
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-8">
                    <motion.div 
                        key={currentFilter}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="max-w-7xl mx-auto space-y-12 pb-20"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>

            {/* Drag Overlay */}
            <AnimatePresence>
                {isDragActive && (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-orange-600/10 backdrop-blur-md flex items-center justify-center p-12 border-4 border-dashed border-orange-500/40 m-6 rounded-[3rem] pointer-events-none"
                    >
                        <div className="flex flex-col items-center gap-6">
                            <div className="w-24 h-24 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 animate-bounce">
                                <InteractiveIconWrapper><Upload className="w-12 h-12" /></InteractiveIconWrapper>
                            </div>
                            <h2 className="text-4xl font-black font-outfit uppercase tracking-tighter text-white drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]">Lâchez pour uploader</h2>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upload Queue */}
            <div className="fixed bottom-8 right-8 z-[90] flex flex-col gap-3 w-80">
                <AnimatePresence>
                    {uploads.map((upload) => (
                        <motion.div 
                            key={upload.id}
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="glass p-4 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl"
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                upload.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                                upload.status === 'error' ? 'bg-red-500/10 text-red-400' :
                                'bg-orange-500/10 text-orange-400'
                            }`}>
                                {upload.status === 'uploading' ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                                 upload.status === 'completed' ? <InteractiveIconWrapper><CheckCircle2 className="w-5 h-5" /></InteractiveIconWrapper> :
                                 <InteractiveIconWrapper><X className="w-5 h-5" /></InteractiveIconWrapper>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate pr-4">{upload.name}</p>
                                <div className="h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                    <motion.div 
                                        className={`h-full ${upload.status === 'error' ? 'bg-red-500' : 'bg-orange-500 shadow-[0_0_10px_#ea580c]'}`}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${upload.progress}%` }}
                                    />
                                </div>
                            </div>
                            {upload.status !== 'uploading' && (
                                <button 
                                    onClick={() => setUploads(prev => prev.filter(u => u.id !== upload.id))}
                                    className="p-1 hover:bg-white/10 rounded-md transition-colors"
                                >
                                    <InteractiveIconWrapper><X className="w-3 h-3 text-[#A0A0A0]" /></InteractiveIconWrapper>
                                </button>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Click outside to close user menu */}
            {showUserMenu && (
                <div 
                    className="fixed inset-0 z-[9]" 
                    onClick={() => setShowUserMenu(false)} 
                />
            )}
        </div>
    );
}
