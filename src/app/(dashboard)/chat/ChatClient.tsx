"use client";

import { useState, useEffect, useRef } from "react";
import {
  Send,
  Link as LinkIcon,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import { io, Socket } from "socket.io-client";
import { SOCKET_URL, RENDER_BACKEND_URL } from "@/lib/constants";
import useSWR from "swr";
import {
  InteractiveIconWrapper,
  AnimatedEmptyState,
} from "@/components/Animations";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface Message {
  _id: string;
  spaceId: string;
  ownerId: string;
  ownerName: string;
  text: string;
  createdAt: string;
  preview?: {
    title?: string;
    description?: string;
    images?: string[];
    url?: string;
    siteName?: string;
  } | null;
}

export function ChatClient({
  spaceId,
  userId,
  userName,
}: {
  spaceId: string;
  userId: string;
  userName: string;
}) {
  const { data, isLoading } = useSWR(
    `${RENDER_BACKEND_URL}/api/spaces/${spaceId}/messages?limit=100`,
    fetcher,
    { revalidateOnFocus: true },
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages from SWR data
  useEffect(() => {
    if (data?.messages) {
      setMessages(data.messages);
    }
  }, [data]);

  // Setup Socket.io
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.emit("join_space", spaceId);

    socket.on("receive_message", (newMsg: Message) => {
      setMessages((prev) => [...prev, newMsg]);
    });

    return () => {
      socket.emit("leave_space", spaceId);
      socket.disconnect();
    };
  }, [spaceId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    setIsSending(true);

    const msgData = {
      spaceId,
      ownerId: userId,
      ownerName: userName,
      text: inputText.trim(),
    };

    socketRef.current?.emit("send_message", msgData);
    setInputText("");
    setIsSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full border border-white/5 bg-[#0A0503]/40 backdrop-blur-xl rounded-[2rem] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-white/5 bg-white/5">
        <h2 className="text-xl font-serif italic text-white flex items-center gap-2">
          Discussion
          <span className="text-xs font-sans not-italic text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
            Temps réel
          </span>
        </h2>
        <p className="text-xs text-[#A0A0A0] mt-1">
          Chat intégré pour collaborer directement dans l'espace.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-50">
            <AnimatedEmptyState type="activity" />
            <p className="text-sm font-bold mt-4 text-[#A0A0A0]">
              Aucun message.
            </p>
            <p className="text-xs text-[#666666]">
              Soyez le premier à lancer la discussion !
            </p>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isMe = msg.ownerId === userId;
            const showName = i === 0 || messages[i - 1].ownerId !== msg.ownerId;

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                {showName && !isMe && (
                  <span className="text-[10px] text-[#A0A0A0] font-bold uppercase tracking-widest pl-2 mb-1">
                    {msg.ownerName}
                  </span>
                )}
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 ${
                    isMe
                      ? "bg-orange-500/20 border border-orange-500/30 text-white rounded-tr-sm"
                      : "bg-white/5 border border-white/10 text-white rounded-tl-sm"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed break-words break-all">
                    {msg.text}
                  </p>

                  {/* Link Preview */}
                  {msg.preview && Object.keys(msg.preview).length > 0 && (
                    <a
                      href={msg.preview.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block bg-black/40 border border-white/5 rounded-xl overflow-hidden hover:border-orange-500/50 transition-colors group"
                    >
                      {msg.preview.images && msg.preview.images.length > 0 && (
                        <div className="h-32 w-full bg-black/50 overflow-hidden">
                          <img
                            src={msg.preview.images[0]}
                            alt={msg.preview.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <p className="text-xs font-bold text-white line-clamp-1">
                          {msg.preview.title}
                        </p>
                        <p className="text-[10px] text-[#A0A0A0] line-clamp-2 mt-1">
                          {msg.preview.description}
                        </p>
                        <p className="text-[9px] text-orange-400 mt-2 uppercase tracking-widest flex items-center gap-1">
                          <LinkIcon className="w-3 h-3" />{" "}
                          {msg.preview.siteName ||
                            new URL(msg.preview.url || "https://swiftdrop.app")
                              .hostname}
                        </p>
                      </div>
                    </a>
                  )}

                  <div
                    className={`text-[9px] opacity-50 mt-2 flex items-center gap-1 ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/5 bg-black/20">
        <div className="relative flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2 focus-within:border-orange-500/50 focus-within:ring-1 focus-within:ring-orange-500/50 transition-all">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message (Entrée pour envoyer)..."
            className="flex-1 max-h-32 min-h-[44px] bg-transparent resize-none outline-none text-sm text-white placeholder-[#A0A0A0] p-3 custom-scrollbar"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim() || isSending}
            className="w-11 h-11 shrink-0 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 text-white rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(249,115,22,0.3)]"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
