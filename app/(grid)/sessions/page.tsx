'use client';

import { useState, useEffect } from 'react';
import { useGetUser } from '@/lib/queryFunctions';
import Link from 'next/link';

export default function SessionsPage() {
  const { user, isLoading } = useGetUser();
  const [sessions, setSessions] = useState<any[]>([]);
  const [aiPrompt, setAiPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  // جلب الجلسات المتاحة
  const fetchSessions = async () => {
    try {
      const res = await fetch('/api/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // دالة إنشاء جلسة بالذكاء الاصطناعي
  const handleCreateAISession = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = user?.data?._id || user?.data?.id;

    if (!aiPrompt.trim() || !userId) return;

    setLoading(true);
    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, userId }),
      });

      if (res.ok) {
        setAiPrompt('');
        fetchSessions();
      }
    } catch (err) {
      console.error('Error creating session:', err);
    } finally {
      setLoading(false);
    }
  };

  // دالة الانضمام للجلسة
  const handleJoinSession = async (sessionId: string) => {
    const userId = user?.data?._id || user?.data?.id;

    if (!userId) {
      alert('يرجى تسجيل الدخول أولاً لتتمكن من الانضمام!');
      return;
    }

    try {
      const res = await fetch('/api/sessions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, userId }),
      });

      if (res.ok) {
        fetchSessions();
      }
    } catch (err) {
      console.error('Error joining session:', err);
    }
  };

  // 1️⃣ حالة التحقق من الحساب
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 text-teal-400 font-bold">
        جاري التحقق من الحساب... ⏳
      </div>
    );
  }

  // 2️⃣ حماية الصفحة: إذا لم يكن المستخدم مسجلاً للدخول
  if (!user?.data) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center bg-[#0f171e] border border-teal-500/30 rounded-2xl space-y-4 my-12" dir="rtl">
        <div className="text-4xl">🔐</div>
        <h2 className="text-2xl font-bold text-teal-400">عذراً! هذه الميزة للمسجلين فقط</h2>
        <p className="text-slate-400 text-sm">
          لإنشاء جلسات لعب بالذكاء الاصطناعي أو الانضمام إلى جلسات اللاعبين الآخرين، يرجى تسجيل الدخول أولاً.
        </p>
        <div className="pt-2 flex justify-center gap-4">
          <Link
            href="/login"
            className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-2.5 rounded-xl text-sm transition"
          >
            تسجيل الدخول (Login)
          </Link>
          <Link
            href="/signup"
            className="border border-teal-500/40 text-teal-300 hover:bg-teal-950/40 px-6 py-2.5 rounded-xl text-sm transition"
          >
            حساب جديد (Sign up)
          </Link>
        </div>
      </div>
    );
  }

  const currentUserId = user?.data?._id || user?.data?.id;

  // 3️⃣ الصفحة الكاملة للمستخدم المسجل دخول
  return (
    <div className="p-6 max-w-5xl mx-auto text-slate-100 space-y-8" dir="rtl">
      {/* العنوان الرئيسي */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
          🎮 مجتمع الجلسات التفاعلية بالذكاء الاصطناعي
        </h1>
        <p className="text-slate-400 text-sm">
          أنشئ جلسة لعب بأسلوبك الطبيعي أو انضم إلى الجلسات المتاحة فوراً!
        </p>
      </div>

      {/* قسم الإدخال بالذكاء الاصطناعي */}
      <div className="bg-[#0f171e]/80 border border-teal-500/30 p-6 rounded-2xl shadow-xl space-y-4 backdrop-blur-sm">
        <h2 className="text-xl font-bold flex items-center gap-2 text-teal-400">
          ✨ إنشاء جلسة ذكية (AI Session Creator)
        </h2>

        <form onSubmit={handleCreateAISession} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="مثال: بدنا نلعب Valorant اليوم 9 مساءً نحتاج 3 لاعبين..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="w-full bg-[#18222d] border border-teal-900/50 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-teal-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-slate-950 font-extrabold py-3 rounded-xl transition duration-200 disabled:opacity-50"
          >
            {loading ? '🤖 جاري تحليل النص وإنشاء الجلسة...' : 'إنشاء الجلسة فوراً بالذكاء الاصطناعي 🚀'}
          </button>
        </form>
      </div>

      {/* عرض قائمة الجلسات */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-200">🔥 الجلسات المتاحة حالياً</h2>

        {sessions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">لا توجد جلسات حالياً. كن أول من يُنشئ جلسة!</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {sessions.map((session) => {
              const isFull = session.joinedPlayers?.length >= session.maxPlayers;
              const hasJoined = session.joinedPlayers?.some(
                (p: any) => (p._id || p) === currentUserId
              );

              return (
                <div
                  key={session._id}
                  className="bg-[#0f171e]/90 border border-slate-800 hover:border-teal-500/40 p-5 rounded-2xl flex flex-col justify-between space-y-4 transition shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-teal-300">{session.gameTitle}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full border ${isFull ? 'bg-red-950/40 border-red-500/50 text-red-300' : 'bg-teal-950/40 border-teal-500/50 text-teal-300'}`}>
                        {session.joinedPlayers?.length || 0} / {session.maxPlayers} لاعبين
                      </span>
                    </div>

                    <p className="text-xs text-slate-400">
                      👤 المنظم: <span className="text-slate-200 font-semibold">{session.host?.name || 'مستخدم'}</span>
                    </p>

                    {session.aiSummary && (
                      <p className="text-xs bg-teal-950/30 text-teal-200 p-2.5 rounded-lg border border-teal-800/30">
                        🤖 <span className="font-semibold">ملخص الـ AI:</span> {session.aiSummary}
                      </p>
                    )}

                    <div className="text-xs text-slate-300 pt-1">
                      ⏱️ الموعد: <span className="text-white font-medium">{session.scheduledTime}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinSession(session._id)}
                    disabled={isFull || hasJoined}
                    className={`w-full py-2.5 rounded-xl font-bold text-sm transition ${
                      hasJoined
                        ? 'bg-slate-800 text-teal-400 border border-teal-500/30 cursor-default'
                        : isFull
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold'
                    }`}
                  >
                    {hasJoined ? 'أنْتِ من ضمن المشاركين ✅' : isFull ? 'الجلسة مكتملة 🔒' : 'انضمام للجلسة 🎮'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}