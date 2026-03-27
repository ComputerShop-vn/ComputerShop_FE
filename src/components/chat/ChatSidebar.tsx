import React from 'react';
import type { Conversation } from '../../api/types/chat';

interface Props {
  conversations: Conversation[];
  loading: boolean;
  selectedId: number | null;
  onSelect: (conv: Conversation) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const fmtTime = (iso: string) => {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000);
    if (diffMin < 1) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin}ph`;
    if (diffMin < 1440) return `${Math.floor(diffMin / 60)}g`;
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
  } catch { return ''; }
};

const initial = (name: string) => (name || '?').charAt(0).toUpperCase();

const ChatSidebar: React.FC<Props> = ({ conversations, loading, selectedId, onSelect, searchQuery, onSearchChange }) => {
  const filtered = conversations.filter((c) =>
    c.otherUserName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-white font-['Jost']">
      {/* Search */}
      <div className="p-4" style={{ borderBottom: '1px solid #e2e8f0' }}>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: '#cbd5e1' }}>search</span>
          <input
            type="text"
            placeholder="Tìm cuộc trò chuyện..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm font-medium outline-none border-none focus:outline-none focus:ring-0"
            style={{ background: '#f1f5f9', color: '#1e293b' }}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#002B5B' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#94a3b8' }}>Đang tải...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
            <span className="material-symbols-outlined text-5xl" style={{ color: '#e2e8f0' }}>chat</span>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#cbd5e1' }}>
              {searchQuery ? 'Không tìm thấy' : 'Chưa có tin nhắn nào'}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filtered.map((conv) => {
              const isSelected = selectedId === conv.otherUserId;
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv)}
                  className="w-full flex items-center gap-4 px-5 py-4 transition-all text-left relative"
                  style={{
                    background: isSelected ? 'rgba(0,43,91,0.06)' : 'transparent',
                    borderRight: isSelected ? '3px solid #002B5B' : '3px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = '#f8fafc'; }}
                  onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  <div className="relative shrink-0">
                    <div className="size-11 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm"
                      style={isSelected
                        ? { background: '#002B5B', color: '#00D4FF' }
                        : { background: '#f1f5f9', color: '#64748b' }
                      }
                    >
                      {initial(conv.otherUserName)}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 size-5 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white"
                        style={{ background: '#ef4444' }}>
                        {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-black truncate" style={{ color: isSelected ? '#002B5B' : '#1e293b' }}>
                        {conv.otherUserName}
                      </p>
                      <span className="text-[10px] font-bold shrink-0 ml-2" style={{ color: '#94a3b8' }}>{fmtTime(conv.lastMessageAt)}</span>
                    </div>
                    <p className="text-xs truncate" style={{ color: conv.unreadCount > 0 ? '#1e293b' : '#94a3b8', fontWeight: conv.unreadCount > 0 ? 700 : 500 }}>
                      {conv.lastMessage || 'Bắt đầu cuộc trò chuyện'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;
