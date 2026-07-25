import { NextResponse } from 'next/server';
import { APIURL, KEY } from '@/app/constants';

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Groq API Key is missing" }, { status: 500 });
    }

    const { messages } = await req.json();

    // 1️⃣ أخذ آخر رسالة من المستخدم
    const lastUserMessage = messages[messages.length - 1]?.text || '';
    
    // 2️⃣ البحث في الـ API
    let searchResultsText = "لم يتم إجراء بحث بعد.";
    if (lastUserMessage.trim()) {
      try {
        const searchUrl = `${APIURL}games?search=${encodeURIComponent(lastUserMessage)}&page_size=5&key=${KEY}`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(searchUrl, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.results && data.results.length > 0) {
            const gameNames = data.results.map((g: any) => g.name).join(', ');
            searchResultsText = `الألعاب المطابقة في مكتبة Gaming Haven: [${gameNames}]`;
          } else {
            searchResultsText = "لم يتم العثور على ألعاب مطابقة لهذا الاستعلام في المكتبة.";
          }
        }
      } catch (err) {
        console.error("تنبيه: تعذر جلب نتائج البحث في الوقت المحدد:", err);
        searchResultsText = "تعذر التحقق من المكتبة حالياً بسبب بطء الاتصال.";
      }
    }

    // 🎯 3️⃣systemPrompt  
    const systemPrompt = `You are the exclusive "Gaming Haven Assistant" inside the Gaming Haven platform.

PLATFORM NATURE & IMPORTANT RULES:
1. NO DOWNLOADS: Gaming Haven is a platform for exploring, reviewing, rating games, and booking gaming sessions ONLY. We DO NOT offer game downloads, torrents, or installations!
2. IF ASKED ABOUT DOWNLOADING: Politely inform the user that Gaming Haven is an information, review, and session-booking hub, and does not host game downloads.
3. SCOPE LIMITATION: If the user asks about non-gaming topics (e.g., movies, weather, cooking, general info), politely refuse:
   "أنا مساعد Gaming Haven المختص بالألعاب فقط! 🎮 كيف يمكنني مساعدتك في اختيار لعبتك القادمة؟"

REAL-TIME API DATABASE SEARCH RESULT FOR USER'S QUERY:
${searchResultsText}

4. ACCURACY: Rely on the "REAL-TIME API DATABASE SEARCH RESULT" provided above. If the game searched by the user appears in the list, confirm that it exists on Gaming Haven!
5. Keep answers clear, helpful, concise, and in the user's language (Arabic/English).`;

    // 4️⃣ تجهيز الرسائل وإرسالها إلى Groq
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text || m.parts?.[0]?.text || '',
      })),
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: formattedMessages,
        temperature: 0.4,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Groq Request Failed');
    }

    const reply = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error('Groq / Server Error:', error);
    return NextResponse.json({
      reply: "عذراً، حدث بطء مؤقت في شبكة الاتصال. يرجى إعادة محاولة إرسال السؤال مرة أخرى! 🔄"
    });
  }
}