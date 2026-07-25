'use client';

import { useState } from 'react';

interface Message {
  role: 'user' | 'model';
  parts: [{ text: string }];
}

export default function ChatBox() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      parts: [{ text: input }],
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages([
          ...updatedMessages,
          { role: 'model', parts: [{ text: data.reply }] },
        ]);
      } else {
        setMessages([
          ...updatedMessages,
          { role: 'model', parts: [{ text: `⚠️ ${data.error || 'An error occurred.'}` }] },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages([
        ...updatedMessages,
        { role: 'model', parts: [{ text: '⚠️ Connection error. Please try again.' }] },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] w-full max-w-md mx-auto border rounded-2xl p-4 bg-background shadow-xl">
      {/* 🎮 رأس المساعد التفاعلي */}
      <div className="pb-3 border-b flex items-center gap-2">
        <span className="text-xl">🎮</span>
        <div>
          <h3 className="font-bold text-sm">Gaming Haven Companion</h3>
          <p className="text-[11px] text-muted-foreground">مساعدك الذكي لاقتراح الألعاب والجلسات</p>
        </div>
      </div>

      {/* 💬 منطقة الرسائل */}
      <div className="flex-1 overflow-y-auto space-y-3 p-2 my-2">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-8 text-sm space-y-2">
            <p className="font-medium text-foreground">مرحباً بك في Gaming Haven! 👋</p>
            <p className="text-xs">محتار ماذا تلعب اليوم؟ أخبرني بنوع الألعاب التي تحبها وسأقترح عليك الأفضل من منصتنا!</p>
          </div>
        )}
        {messages.map((msg, index) => (
          <div
            key={index}
            dir="auto"
            className={`p-3 rounded-2xl max-w-[85%] text-sm whitespace-pre-line leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white ml-auto rounded-br-none text-right'
                : 'bg-muted text-foreground mr-auto rounded-bl-none text-right'
            }`}
          >
            {msg.parts[0].text}
          </div>
        ))}
        {loading && <div className="text-xs text-muted-foreground animate-pulse">جاري البحث في مكتبة الألعاب... 🕹️</div>}
      </div>

      {/* ✉️ حقل الإدخال */}
      <div className="flex gap-2 pt-2 border-t">
        <input
          type="text"
          className="flex-1 border rounded-xl px-3 py-2 text-sm bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="اقترح لي لعبة جماعية..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          send
        </button>
      </div>
    </div>
  );
}