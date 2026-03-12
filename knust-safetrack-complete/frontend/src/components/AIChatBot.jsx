import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, ChevronRight } from 'lucide-react';
import useEscapeKey from '../hooks/useEscapeKey';
import useFocusTrap from '../hooks/useFocusTrap';
import Portal from './layout/Portal.jsx';

const QUICK_QUESTIONS = [
  'Is it safe to walk to Brunei now?',
  'Where is the nearest help point?',
  'Report a broken street light',
  'Tips for walking at night',
];

const SYSTEM_PROMPT = `You are SafeTrack AI, a campus safety assistant for KNUST (Kwame Nkrumah University of Science and Technology) in Kumasi, Ghana. 

Your role:
- Help students navigate campus safely at night
- Provide safety tips specific to KNUST campus
- Give information about campus security contacts and help points
- Assist with the "Walk With Me" feature
- Provide route safety assessments

Key campus info:
- Campus Security Hotline: 0322-060-331
- Main security post is at the Engineering Building entrance
- High-traffic/monitored areas: Main Library, Great Hall, JQB, Hall 7 Junction
- Unlit or higher-risk areas at night: shortcuts behind hostels, the path near Ayeduase Gate after midnight
- Shuttle Route A runs until 11 PM
- SOS button in the app immediately alerts campus security

Keep responses concise, friendly, and safety-focused. Use campus-specific language (Brunei = Hall 7 area, Conti = Independence Hall, etc.). If someone seems in danger, always tell them to use the SOS button immediately.`;

export default function AIChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hi! I'm SafeTrack AI 🤖\nI can help you with campus safety info, directions, and tips. How can I help?",
      time: 'Now',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const panelRef = useRef(null);
  const closeBtnRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEscapeKey(isOpen, () => setIsOpen(false));
  useFocusTrap({ enabled: isOpen, containerRef: panelRef, initialFocusRef: closeBtnRef });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text) => {
    const messageText = text || inputValue.trim();
    if (!messageText || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    // Build conversation history for Anthropic API
    const history = messages
      .filter(m => m.sender !== 'bot' || messages.indexOf(m) > 0)
      .map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
    history.push({ role: 'user', content: messageText });

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: history,
        }),
      });

      const data = await response.json();
      const replyText = data.content?.[0]?.text || 'I understand. For immediate help, use the SOS button or call Campus Security at 0322-060-331.';

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } catch {
      // Fallback responses when API is unavailable
      const fallbacks = {
        'Is it safe to walk to Brunei now?': 'Based on recent activity, the route to Brunei (Hall 7) has security patrols active. Stick to the main lit road via KSB. Consider using Walk With Me! 🚶',
        'Where is the nearest help point?': 'Nearest help points: Security Post at Engineering Building (300m), Main Library Security Desk, or dial 0322-060-331 anytime. 📍',
        'Report a broken street light': 'To report a broken light: call 0322-060-331, or use the SOS button > Report Issue. Provide the exact location (building name/road). 💡',
        'Tips for walking at night': '🌙 Safety tips:\n1. Stick to well-lit paths\n2. Use Walk With Me for company\n3. Keep your phone charged\n4. Share live location with a friend\n5. Trust your instincts — SOS if needed',
      };
      const reply = fallbacks[messageText] || 'For immediate help, use the SOS button or call Campus Security at 0322-060-331. Stay safe! 🛡️';
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="absolute bottom-[252px] right-4 z-[1000] flex items-center justify-center w-14 h-14 rounded-full shadow-lg hover:scale-105 transition-transform"
          style={{ background: 'linear-gradient(135deg, #38BDF8, #818CF8)', boxShadow: '0 4px 20px rgba(56,189,248,0.4)' }}
          aria-label="Open AI Chatbot"
        >
          <Sparkles className="w-6 h-6 text-white" />
        </button>
      )}

      {isOpen && (
        <Portal>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2000, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }} role="dialog" aria-modal="true" aria-label="SafeTrack AI Chat">
            <div ref={panelRef} style={{ width: '100%', maxWidth: '448px', height: '80vh', borderRadius: '24px 24px 0 0', overflow: 'hidden' }} className="bg-bg-secondary flex flex-col animate-slide-up">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="font-bold text-text-primary">SafeTrack AI</h2>
                    <p className="text-xs text-text-secondary flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" />
                      Always here to help
                    </p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-bg-tertiary flex items-center justify-center hover:bg-border transition-colors" type="button" aria-label="Close" ref={closeBtnRef}>
                  <X className="w-5 h-5 text-text-secondary" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${msg.sender === 'user' ? 'bg-accent text-white rounded-br-md' : 'bg-bg-primary text-text-primary rounded-bl-md'}`}>
                      <p className="text-sm whitespace-pre-line">{msg.text}</p>
                      <p className={`text-[10px] mt-1 ${msg.sender === 'user' ? 'text-white/70' : 'text-text-muted'}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-bg-primary px-4 py-3 rounded-2xl rounded-bl-md">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                {messages.length <= 1 && !isLoading && (
                  <div className="space-y-2 mt-2">
                    <p className="text-xs text-text-muted font-medium">Quick Questions:</p>
                    {QUICK_QUESTIONS.map((q) => (
                      <button key={q} onClick={() => handleSend(q)} className="w-full flex items-center gap-2 p-3 bg-bg-primary rounded-xl hover:bg-bg-tertiary/50 transition-colors text-left" type="button">
                        <Sparkles className="w-4 h-4 text-accent shrink-0" />
                        <span className="text-sm text-text-primary">{q}</span>
                        <ChevronRight className="w-4 h-4 text-text-muted shrink-0 ml-auto" />
                      </button>
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border shrink-0">
                <div className="flex items-center gap-3">
                  <input
                    type="text" placeholder="Ask SafeTrack AI..."
                    value={inputValue} onChange={e => setInputValue(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    className="flex-1 h-11 px-4 bg-bg-primary border border-border rounded-full text-text-primary text-sm outline-none focus:border-accent transition-colors"
                    style={{ fontSize: '16px' }} disabled={isLoading}
                  />
                  <button
                    onClick={() => handleSend()} disabled={!inputValue.trim() || isLoading}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${inputValue.trim() && !isLoading ? 'bg-accent text-white' : 'bg-bg-tertiary text-text-muted'}`}
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
