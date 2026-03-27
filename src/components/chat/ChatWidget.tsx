import React, { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../../api/services/chatService';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import type { Conversation } from '../../api/types/chat';

const STAFF_ROLE = 'STAFF';

interface Props {
  currentUserId: number;
  openToUserId?: number;
  openToUserName?: string;
}

const ChatWidget: React.FC<Props> = ({ currentUserId, openToUserId, openToUserName }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConvs, setLoadingConvs] = useState(false);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [staffList, setStaffList] = useState<{ userId: number; username: string }[]>([]);
  const selectedRef = useRef<Conversation | null>(null);
  selectedRef.current = selected;

  const loadConversations = useCallback(async () => {
    try {
      const convs = await chatService.getConversations();
      const activeId = selectedRef.current?.otherUserId;
      setConversations(convs.map((c) =>
        c.otherUserId === activeId ? { ...c, unreadCount: 0 } : c
      ));
    } catch (e) {
      console.error('[ChatWidget] load error:', e);
    }
  }, []);

  const unreadTotal = conversations.reduce((s, c) => {
    if (c.otherUserId === selected?.otherUserId) return s;
    return s + (c.unreadCount || 0);
  }, 0);

  // Poll unread when widget closed
  useEffect(() => {
    if (isOpen) return;
    const poll = async () => {
      try {
        const convs = await chatService.getConversations();
        setConversations(convs);
      } catch {}
    };
    poll();
    const id = setInterval(poll, 15000);
    return () => clearInterval(id);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setLoadingConvs(true);
    loadConversations().finally(() => setLoadingConvs(false));
    chatService.getStaffList().then(setStaffList).catch(() => {});
    const id = setInterval(loadConversations, 30000);
    return () => clearInterval(id);
  }, [isOpen, loadConversations]);

  useEffect(() => {
    if (!selected) return;
    setConversations((prev) =>
      prev.map((c) => c.otherUserId === selected.otherUserId ? { ...c, unreadCount: 0 } : c)
    );
  }, [selected?.otherUserId]); // eslint-disable-line

  // open-chat-with-staff event
  useEffect(() => {
    const handler = async (e: CustomEvent) => {
      const { userId, userName } = (e.detail || {}) as { userId?: number; userName?: string };
      setIsOpen(true);
      let targetId = userId;
      let targetName = userName ?? 'Nhân viên hỗ trợ';
      if (!targetId) {
        try {
          const list = await chatService.getStaffList();
          if (list.length > 0) { targetId = list[0].userId; targetName = list[0].username; }
        } catch {}
      }
      if (!targetId) return;
      setConversations((prev) => {
        const existing = prev.find((c) => c.otherUserId === targetId);
        setSelected(existing ?? {
          id: 0, roomKey: '', otherUserId: targetId!,
          otherUserName: targetName, otherUserRole: STAFF_ROLE,
          lastMessage: '', lastMessageAt: new Date().toISOString(), unreadCount: 0,
        });
        return prev;
      });
    };
    window.addEventListener('open-chat-with-staff', handler as EventListener);
    return () => window.removeEventListener('open-chat-with-staff', handler as EventListener);
  }, []);

  useEffect(() => {
    if (!openToUserId) return;
    setIsOpen(true);
    const existing = conversations.find((c) => c.otherUserId === openToUserId);
    setSelected(existing ?? {
      id: 0, roomKey: '', otherUserId: openToUserId,
      otherUserName: openToUserName || 'Nhân viên hỗ trợ',
      otherUserRole: STAFF_ROLE,
      lastMessage: '', lastMessageAt: new Date().toISOString(), unreadCount: 0,
    });
  }, [openToUserId]); // eslint-disable-line

  const handleSelect = (conv: Conversation) => setSelected(conv);

  const handleStartChatWithStaff = () => {
    if (staffList.length === 0) return;
    const staff = staffList[0];
    const existing = conversations.find((c) => c.otherUserId === staff.userId);
    setSelected(existing ?? {
      id: 0, roomKey: '', otherUserId: staff.userId,
      otherUserName: staff.username, otherUserRole: STAFF_ROLE,
      lastMessage: '', lastMessageAt: new Date().toISOString(), unreadCount: 0,
    });
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-[999] size-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          style={{ background: '#002B5B', color: '#00D4FF', boxShadow: '0 4px 24px rgba(0,43,91,0.4)' }}
          aria-label="Mở chat"
        >
          <span className="material-symbols-outlined text-2xl">chat</span>
          {unreadTotal > 0 && (
            <span className="absolute -top-1 -right-1 size-5 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse"
              style={{ background: '#ef4444' }}>
              {unreadTotal > 9 ? '9+' : unreadTotal}
            </span>
          )}
        </button>
      )}

      {/* Widget window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[999] w-full max-w-[400px] h-[540px] shadow-2xl rounded-2xl flex flex-col overflow-hidden"
          style={{ border: '1px solid rgba(0,43,91,0.15)', background: '#ffffff' }}>
          {!selected ? (
            <>
              {/* Header */}
              <div className="p-4 flex items-center justify-between" style={{ background: '#002B5B', borderBottom: '1px solid rgba(0,212,255,0.2)' }}>
                <div className="flex items-center gap-3">
                  <div className="size-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(0,212,255,0.2)' }}>
                    <span className="material-symbols-outlined text-lg" style={{ color: '#00D4FF' }}>chat</span>
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-tight" style={{ color: '#F8FAFC' }}>Tin nhắn</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#64748b' }}>{conversations.length} cuộc trò chuyện</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="size-8 rounded-lg flex items-center justify-center transition" style={{ color: '#64748b' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.15)'; (e.currentTarget as HTMLElement).style.color = '#ef4444'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>

              {/* New chat button */}
              {staffList.length > 0 && (
                <div className="px-4 pt-3 pb-1">
                  <button
                    onClick={handleStartChatWithStaff}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition"
                    style={{ background: '#002B5B', color: '#00D4FF' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#001a3d'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = '#002B5B'}
                  >
                    <span className="material-symbols-outlined text-lg">support_agent</span>
                    Chat với nhân viên hỗ trợ
                  </button>
                </div>
              )}

              <div className="flex-1 overflow-hidden">
                <ChatSidebar
                  conversations={conversations}
                  loading={loadingConvs}
                  selectedId={null}
                  onSelect={handleSelect}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            </>
          ) : (
            <ChatWindow
              conversation={selected}
              currentUserId={currentUserId}
              onBack={() => setSelected(null)}
              onClose={() => setIsOpen(false)}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ChatWidget;
