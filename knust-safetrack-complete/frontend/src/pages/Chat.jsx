import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, ArrowLeft, Search, ChevronRight, Edit2, Trash2, Check, X, MoreVertical } from 'lucide-react';
import TopBar from '../components/layout/TopBar';
import BottomNav from '../components/layout/BottomNav';
import MenuDrawer from '../components/MenuDrawer';
import { chatAPI } from '../services/api.js';

const FALLBACK_CONVS = [
  { id: 'conv-1', partnerName: 'Kwame Asante', partnerHostel: 'Unity Hall', partnerAvatar: 'KA', isGroup: false, lastMessage: 'Are you heading to the library tonight?', lastMessageTime: new Date(Date.now()-18*60000).toISOString(), unread: 2 },
  { id: 'conv-2', partnerName: 'Ama Serwaa', partnerHostel: 'Queens Hall', partnerAvatar: 'AS', isGroup: false, lastMessage: 'Thanks for the walk! Got home safe 🙏', lastMessageTime: new Date(Date.now()-105*60000).toISOString(), unread: 0 },
  { id: 'conv-3', partnerName: 'Walk Group — Brunei', partnerHostel: 'Group • 4 members', partnerAvatar: 'WG', isGroup: true, lastMessage: 'Kofi: Who is heading to Brunei around 10?', lastMessageTime: new Date(Date.now()-130*60000).toISOString(), unread: 5 },
  { id: 'conv-4', partnerName: 'Yaw Mensah', partnerHostel: 'Hall 7 (Brunei)', partnerAvatar: 'YM', isGroup: false, lastMessage: 'I just saw security near Tech Junction', lastMessageTime: new Date(Date.now()-24*3600000).toISOString(), unread: 0 },
];

const FALLBACK_MSGS = [
  { id: 'm1', senderId: 'them', text: 'Hey! Are you still at the library?', time: new Date(Date.now()-30*60000).toISOString() },
  { id: 'm2', senderId: 'me', text: 'Yeah I am. Planning to leave around 10', time: new Date(Date.now()-28*60000).toISOString() },
  { id: 'm3', senderId: 'them', text: 'Are you heading to the library tonight?', time: new Date(Date.now()-18*60000).toISOString() },
  { id: 'm4', senderId: 'them', text: 'I was thinking we could walk together. Same direction', time: new Date(Date.now()-17*60000).toISOString() },
];

function timeLabel(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = diff / 60000;
  if (mins < 60) return `${Math.floor(mins)}m ago`;
  if (mins < 1440) return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return 'Yesterday';
}

export default function Chat({ onSignOut }) {
  const [showMenu, setShowMenu] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [conversations, setConversations] = useState(FALLBACK_CONVS);
  const [messages, setMessages] = useState(FALLBACK_MSGS);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  // Edit/delete state
  const [activeMenu, setActiveMenu] = useState(null); // msg id with menu open
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const editInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    chatAPI.getConversations().then(setConversations).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeChat) {
      chatAPI.getMessages(activeChat).then(setMessages).catch(() => setMessages(FALLBACK_MSGS));
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (editingId && editInputRef.current) editInputRef.current.focus();
  }, [editingId]);

  // Close menu when tapping elsewhere
  useEffect(() => {
    if (!activeMenu) return;
    const close = () => setActiveMenu(null);
    setTimeout(() => document.addEventListener('click', close, { once: true }), 10);
  }, [activeMenu]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    const text = newMessage.trim();
    setNewMessage('');
    const tempMsg = { id: `tmp-${Date.now()}`, senderId: 'me', text, time: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    try {
      const saved = await chatAPI.sendMessage(activeChat, text);
      setMessages(prev => prev.map(m => m.id === tempMsg.id ? { ...saved, senderId: 'me' } : m));
    } catch { /* keep optimistic */ }
  };

  const handleDelete = (id) => {
    setMessages(prev => prev.filter(m => m.id !== id));
    setActiveMenu(null);
  };

  const handleStartEdit = (msg) => {
    setEditingId(msg.id);
    setEditText(msg.text);
    setActiveMenu(null);
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    setMessages(prev => prev.map(m => m.id === id ? { ...m, text: editText.trim(), edited: true } : m));
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => { setEditingId(null); setEditText(''); };

  const filteredConversations = conversations.filter(c =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeChat) {
    const chat = conversations.find(c => c.id === activeChat);
    return (
      <div className="relative w-full h-screen flex flex-col bg-bg-primary">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-bg-secondary border-b border-border safe-area-top">
          <button onClick={() => setActiveChat(null)} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-bg-tertiary transition-colors" aria-label="Back">
            <ArrowLeft className="w-5 h-5 text-text-primary" />
          </button>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${chat?.isGroup ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
            {chat?.partnerAvatar}
          </div>
          <div className="flex-1">
            <p className="font-semibold text-text-primary text-sm">{chat?.partnerName}</p>
            <p className="text-xs text-text-secondary">{chat?.partnerHostel}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2" onClick={() => setActiveMenu(null)}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.senderId === 'me' ? 'justify-end' : 'justify-start'}`}>
              <div className="relative group max-w-[78%]">
                {/* Long-press / tap menu trigger for own messages */}
                {msg.senderId === 'me' && editingId !== msg.id && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setActiveMenu(activeMenu === msg.id ? null : msg.id); }}
                    className="absolute -left-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-bg-tertiary"
                    aria-label="Message options"
                  >
                    <MoreVertical className="w-4 h-4 text-text-muted" />
                  </button>
                )}

                {editingId === msg.id ? (
                  /* Inline edit input */
                  <div className="flex items-center gap-2 min-w-[200px]">
                    <input
                      ref={editInputRef}
                      type="text"
                      value={editText}
                      onChange={e => setEditText(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSaveEdit(msg.id); if (e.key === 'Escape') handleCancelEdit(); }}
                      className="flex-1 px-3 py-2 bg-bg-primary border border-primary rounded-xl text-text-primary text-sm outline-none"
                      style={{ fontSize: '16px' }}
                    />
                    <button type="button" onClick={() => handleSaveEdit(msg.id)} className="p-2 bg-primary rounded-full hover:bg-primary-dark">
                      <Check className="w-4 h-4 text-bg-primary" />
                    </button>
                    <button type="button" onClick={handleCancelEdit} className="p-2 bg-bg-tertiary rounded-full hover:bg-border">
                      <X className="w-4 h-4 text-text-secondary" />
                    </button>
                  </div>
                ) : (
                  <div className={`px-4 py-2.5 rounded-2xl ${msg.senderId === 'me' ? 'bg-primary text-bg-primary rounded-br-md' : 'bg-bg-secondary text-text-primary rounded-bl-md'}`}>
                    <p className="text-sm">{msg.text}</p>
                    <div className={`flex items-center gap-1 mt-1 ${msg.senderId === 'me' ? 'justify-end' : ''}`}>
                      <p className={`text-[10px] ${msg.senderId === 'me' ? 'text-bg-primary/70' : 'text-text-muted'}`}>
                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      {msg.edited && <p className={`text-[10px] ${msg.senderId === 'me' ? 'text-bg-primary/50' : 'text-text-muted'}`}>· edited</p>}
                    </div>
                  </div>
                )}

                {/* Context menu dropdown */}
                {activeMenu === msg.id && msg.senderId === 'me' && (
                  <div
                    className="absolute right-0 bottom-full mb-1 bg-bg-secondary border border-border rounded-xl shadow-xl overflow-hidden z-50"
                    onClick={e => e.stopPropagation()}
                    style={{ minWidth: '140px' }}
                  >
                    <button type="button" onClick={() => handleStartEdit(msg)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-text-primary hover:bg-bg-tertiary transition-colors">
                      <Edit2 className="w-4 h-4 text-primary" /> Edit
                    </button>
                    <div className="h-px bg-border" />
                    <button type="button" onClick={() => handleDelete(msg.id)}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 py-3 bg-bg-secondary border-t border-border safe-area-bottom">
          <div className="flex items-center gap-3">
            <input
              type="text" inputMode="text" autoComplete="off"
              placeholder="Type a message..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              className="flex-1 h-11 px-4 bg-bg-primary border border-border rounded-full text-text-primary text-sm outline-none focus:border-primary transition-colors"
              style={{ fontSize: '16px' }}
            />
            <button onClick={handleSend} disabled={!newMessage.trim()}
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${newMessage.trim() ? 'bg-primary text-bg-primary' : 'bg-bg-tertiary text-text-muted'}`}
              aria-label="Send message">
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-center text-xs text-text-muted mt-2">Hold a message to edit or delete</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-bg-primary pb-20">
      <TopBar currentLocation="Messages" showSearch={false} onMenuClick={() => setShowMenu(true)} />
      <div className="pt-20 px-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-10 pr-4 bg-bg-secondary border border-border rounded-xl text-text-primary text-sm outline-none focus:border-primary transition-colors"
            style={{ fontSize: '16px' }} />
        </div>
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle className="w-5 h-5 text-primary" />
          <h2 className="font-semibold text-text-primary">Recent Chats</h2>
        </div>
        <div className="space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="bg-bg-secondary rounded-xl p-6 border border-border text-center">
              <p className="font-semibold text-text-primary">No conversations yet</p>
              <p className="text-sm text-text-secondary mt-1">Start a walk with someone to begin chatting</p>
            </div>
          ) : filteredConversations.map((convo) => (
            <button key={convo.id} onClick={() => setActiveChat(convo.id)}
              className="w-full flex items-center gap-3 p-3 bg-bg-secondary rounded-xl border border-border hover:border-primary/30 transition-colors text-left">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${convo.isGroup ? 'bg-secondary/20 text-secondary' : 'bg-primary/20 text-primary'}`}>
                {convo.partnerAvatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-text-primary text-sm truncate">{convo.partnerName}</p>
                  <span className="text-xs text-text-muted shrink-0">{timeLabel(convo.lastMessageTime)}</span>
                </div>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-sm text-text-secondary truncate">{convo.lastMessage}</p>
                  {convo.unread > 0 && (
                    <span className="w-5 h-5 bg-primary text-bg-primary text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">{convo.unread}</span>
                  )}
                </div>
                <p className="text-xs text-text-muted mt-0.5">{convo.partnerHostel}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
            </button>
          ))}
        </div>
      </div>
      <BottomNav activeTab="chat" />
      <MenuDrawer isOpen={showMenu} onClose={() => setShowMenu(false)} onSignOut={onSignOut} />
    </div>
  );
}
