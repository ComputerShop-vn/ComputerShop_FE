import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { chatService } from '../../api/services/chatService';
import type { ChatMessage, Conversation } from '../../api/types/chat';

interface Props {
  conversation: Conversation;
  currentUserId: number;
  onBack?: () => void;
  onClose?: () => void;
}

const fmt = (iso: string) => {
  try { return new Date(iso).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

const dateLabel = (iso: string) => {
  try {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString()) return 'Hôm nay';
    if (d.toDateString() === yesterday.toDateString()) return 'Hôm qua';
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return ''; }
};

const groupByDate = (msgs: ChatMessage[]) => {
  const groups: { label: string; msgs: ChatMessage[] }[] = [];
  msgs.forEach((m) => {
    const label = dateLabel(m.sentAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.msgs.push(m);
    else groups.push({ label, msgs: [m] });
  });
  return groups;
};

const initial = (name: string) => (name || '?').charAt(0).toUpperCase();

const ChatWindow: React.FC<Props> = ({ conversation, currentUserId, onBack, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = (smooth = false) => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
  };

  useLayoutEffect(() => {
    if (!loading && messages.length > 0) scrollToBottom(false);
  }, [loading]);

  useLayoutEffect(() => {
    if (!loading) scrollToBottom(true);
  }, [messages.length]); // eslint-disable-line

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const history = await chatService.getChatHistory(conversation.otherUserId);
        if (!cancelled) setMessages(history);
        await chatService.markAsRead(conversation.otherUserId);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [conversation.otherUserId]);

  useEffect(() => {
    chatService.connect(() => {
      setWsConnected(true);
      chatService.subscribeToConversation(currentUserId, conversation.otherUserId, (newMsg) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id && m.id !== 0)) return prev;
          return [...prev.filter((m) => m.id !== 0), newMsg];
        });
      });
    });
    return () => { chatService.unsubscribeFromConversation(currentUserId, conversation.otherUserId); };
  }, [conversation.otherUserId, currentUserId]);

  const handleSend = useCallback(() => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    const optimistic: ChatMessage = {
      id: 0, conversationId: conversation.id, senderId: currentUserId,
      senderName: 'Bạn', content: text, sentAt: new Date().toISOString(), isRead: false,
    };
    setMessages((prev) => [...prev, optimistic]);
    setInput('');
    try { chatService.sendMessage({ receiverId: conversation.otherUserId, content: text }); }
    catch (e) { console.error('[Chat] Send error:', e); }
    finally { setSending(false); inputRef.current?.focus(); }
  }, [input, sending, conversation, currentUserId]);

  const groups = groupByDate(messages);

  return (
    <div className="flex flex-col h-full" style={{ background: '#f8fafc' }}>
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: '#002B5B', borderBottom: '1px solid rgba(0,212,255,0.2)' }}>
        {onBack && (
          <button onClick={onBack} className="size-8 rounded-lg flex items-center justify-center transition" style={{ background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
            <span className="material-symbols-outlined text-lg">arrow_back</span>
          </button>
        )}
        <div className="size-9 rounded-xl flex items-center justify-center font-black text-sm" style={{ background: 'rgba(0,212,255,0.2)', color: '#00D4FF' }}>
          {initial(conversation.otherUserName)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black truncate" style={{ color: '#F8FAFC' }}>{conversation.otherUserName}</p>
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full" style={{ background: wsConnected ? '#22c55e' : '#64748b' }} />
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#64748b' }}>
              {wsConnected ? 'Trực tuyến' : 'Đang kết nối...'}
            </p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="size-8 rounded-lg flex items-center justify-center transition" style={{ color: '#64748b' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#00D4FF' }} />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <span className="material-symbols-outlined text-5xl" style={{ color: '#cbd5e1' }}>chat</span>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#94a3b8' }}>Chưa có tin nhắn</p>
            <p className="text-xs" style={{ color: '#cbd5e1' }}>Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
        ) : (
          groups.map((group) => (
            <div key={group.label}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: '#f1f5f9', color: '#94a3b8' }}>{group.label}</span>
                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
              </div>
              {group.msgs.map((msg, idx) => {
                const isMe = msg.senderId === currentUserId;
                const isOptimistic = msg.id === 0;
                const prevMsg = group.msgs[idx - 1];
                const showAvatar = !isMe && (!prevMsg || prevMsg.senderId !== msg.senderId);
                return (
                  <div key={`${msg.id}-${idx}`} className={`flex items-end gap-2 mb-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <div className="size-7 shrink-0 mb-1">
                        {showAvatar && (
                          <div className="size-7 rounded-xl flex items-center justify-center font-black text-[10px]" style={{ background: 'rgba(0,43,91,0.1)', color: '#002B5B' }}>
                            {initial(conversation.otherUserName)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`flex flex-col gap-1 max-w-[72%] ${isMe ? 'items-end' : 'items-start'}`}>
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
                        style={isMe
                          ? { background: '#002B5B', color: '#F8FAFC', opacity: isOptimistic ? 0.6 : 1 }
                          : { background: '#ffffff', color: '#1e293b', border: '1px solid #e2e8f0' }
                        }
                      >
                        {msg.content}
                      </div>
                      <span className="text-[9px] font-bold px-1" style={{ color: '#cbd5e1' }}>
                        {fmt(msg.sentAt)}{isMe && isOptimistic && ' · Đang gửi...'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3" style={{ background: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="flex items-center gap-3 rounded-2xl px-4 py-2" style={{ background: '#f1f5f9' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-transparent text-sm placeholder-gray-400 outline-none border-none focus:outline-none focus:ring-0 font-medium"
            style={{ color: '#1e293b' }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="size-9 rounded-xl flex items-center justify-center transition-all active:scale-95 disabled:opacity-40"
            style={{ background: '#002B5B', color: '#00D4FF' }}
          >
            {sending
              ? <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: '#00D4FF' }} />
              : <span className="material-symbols-outlined text-lg">send</span>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
