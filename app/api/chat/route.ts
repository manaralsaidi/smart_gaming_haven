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
    let searchResultsText = "";
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
            searchResultsText = "لا توجد ألعاب مطابقة محددة في المكتبة لهذا الاستعلام المباشر.";
          }
        }
      } catch (err) {
        console.error("تنبيه: تعذر جلب نتائج البحث في الوقت المحدد:", err);
        searchResultsText = "";
      }
    }

    // 🎯 3️⃣ systemPrompt المُعدَّل والدقيق
    const systemPrompt = `You are "Gaming Haven Assistant" 🎮, a friendly, passionate, and smart AI inside the Gaming Haven platform.

CRITICAL INSTRUCTIONS:
1. NEVER mention internal status, code terms, or phrases like "لم يتم إجراء بحث بعد" or "قاعدة البيانات". Speak naturally to the user as an expert gaming companion.
2. SERVICES OFFERED: Exploring, reviewing, rating video games, and booking interactive gaming sessions with friends.
3. NO DOWNLOADS: We DO NOT host or offer game downloads/torrents. If asked about downloading, politely explain that Gaming Haven is purely an information, review, and session-booking hub.
4. BEHAVIOR & SCOPE: 
   - Answer the user DIRECTLY, enthusiastically, and concisely in Arabic.
   - Use the database context below if available. If no database results are provided or match, rely freely on your general video game knowledge to give great game recommendations or general info!
5. OFF-TOPIC RULE: If asked about non-gaming topics (cooking, weather, general history, etc.), politely refuse:
   "أنا مساعد Gaming Haven المختص بالألعاب فقط! 🎮 كيف يمكنني مساعدتك في اختيار لعبتك القادمة؟"

DATABASE SEARCH CONTEXT:
${searchResultsText || "لا توجد ألعاب محددة مُسترجعة من البحث. أجب بناءً على معرفتك الشاملة بسوق وأخبار الألعاب."}`;

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
        temperature: 0.5,
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