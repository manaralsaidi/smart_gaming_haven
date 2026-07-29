import { NextResponse } from 'next/server';
import connect from '@/app/actions/connect';
import { Session } from '../../models/session';
// 1. جلب كل الجلسات
export async function GET() {
  try {
    await connect(); // 
    const sessions = await Session.find().sort({ createdAt: -1 });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

// 2. إنشاء جلسة بالذكاء الاصطناعي
export async function POST(req: Request) {
  try {
    await connect();  
    const body = await req.json();

    if (body.prompt) {
      const apiKey = process.env.GROQ_API_KEY;
      const systemPrompt = `You are an AI Gaming Matchmaker. Extract game session details from the user prompt and respond ONLY in valid JSON format with this exact structure:
{
  "hostName": "Player",
  "gameTitle": "Extracted Game Name",
  "scheduledTime": "Extracted Time or 'Tonight'",
  "maxPlayers": 4,
  "discordLink": "https://discord.gg/gaming",
  "aiSummary": "A short 1-sentence hype description in Arabic for the session"
}`;

      const aiResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: body.prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      const aiData = await aiResponse.json();
      const extractedData = JSON.parse(aiData.choices[0].message.content);
      
      const newSession = await Session.create({
        ...extractedData,
        hostName: body.userName || extractedData.hostName || 'Gamer',
      });

      return NextResponse.json(newSession, { status: 201 });
    }

    const newSession = await Session.create(body);
    return NextResponse.json(newSession, { status: 201 });

  } catch (error) {
    console.error('Session creation error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}

// 3. الانضمام للجلسة
export async function PUT(req: Request) {
  try {
    await connect();
    const { sessionId, playerName } = await req.json();

    const session = await Session.findById(sessionId);
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    if (session.joinedPlayers.length < session.maxPlayers) {
      if (!session.joinedPlayers.includes(playerName)) {
        session.joinedPlayers.push(playerName);
        await session.save();
      }
    }

    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join session' }, { status: 500 });
  }
}