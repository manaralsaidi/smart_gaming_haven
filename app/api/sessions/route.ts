import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connect from '@/app/actions/connect';
import Session from '@/app/models/session';
import User from '@/app/models/user';
import Groq from 'groq-sdk';

// تسجيل موديل الـ User لدى Mongoose لضمان عمل الـ populate بدون أخطاء
const _User = User;

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ---------------------------------------------------------
// 1. جلب كافة الجلسات مع بيانات أصحابها واللاعبين المنضمين
// ---------------------------------------------------------
export async function GET() {
  try {
    await connect();
    const sessions = await Session.find()
      .populate('host', 'name email image')
      .populate('joinedPlayers', 'name email image')
      .sort({ createdAt: -1 });

    return NextResponse.json(sessions, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// 2. إنشاء جلسة جديدة واستخراج بياناتها عبر الذكاء الاصطناعي
// ---------------------------------------------------------
export async function POST(req: Request) {
  try {
    const { prompt, userId } = await req.json();

    if (!prompt || !userId) {
      return NextResponse.json(
        { error: 'Prompt and userId are required' },
        { status: 400 }
      );
    }

    // طلب الاستخراج من الذكاء الاصطناعي مع توجيهه لاستخراج رقم التواصل إن وُجد
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for a gaming platform. Extract the following JSON structure from the user's input:
          {
            "gameTitle": "extracted game title",
            "scheduledTime": "extracted time or 'Flexible'",
            "maxPlayers": extracted number of players needed (default to 4 if unspecified),
            "aiSummary": "a brief summary of the session in Arabic including the host's contact details or phone number if mentioned in the prompt"
          }
          Respond ONLY with raw JSON. Do NOT wrap it in markdown codeblocks (no \`\`\`json).`,
        },
        { role: 'user', content: prompt },
      ],
      model: 'llama-3.3-70b-versatile',
    });

    let aiContent = completion.choices[0]?.message?.content || '{}';

    // تنظيف رد AI من أي تنسيقات Markdown
    aiContent = aiContent.replace(/```json/g, '').replace(/```/g, '').trim();

    let parsedData: any = {};
    try {
      parsedData = JSON.parse(aiContent);
    } catch (parseError) {
      console.error('Failed to parse AI JSON response:', aiContent);
      parsedData = {
        gameTitle: 'جلسة ألعاب',
        scheduledTime: 'مرن',
        maxPlayers: 4,
        aiSummary: prompt,
      };
    }

    await connect();
    const newSession = await Session.create({
      host: userId,
      gameTitle: parsedData.gameTitle || 'Unspecified Game',
      scheduledTime: parsedData.scheduledTime || 'Flexible',
      maxPlayers: parsedData.maxPlayers || 4,
      aiSummary: parsedData.aiSummary || '',
      joinedPlayers: [userId],
    });

    // جلب الجلسة مع الـ Populate للرد المباشر
    const populatedSession = await Session.findById(newSession._id)
      .populate('host', 'name email image')
      .populate('joinedPlayers', 'name email image');

    return NextResponse.json(populatedSession, { status: 201 });
  } catch (error: any) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// 3. الانضمام للجلسة
// ---------------------------------------------------------
export async function PUT(req: Request) {
  try {
    const { sessionId, userId } = await req.json();

    if (!sessionId || !userId) {
      return NextResponse.json(
        { error: 'SessionId and userId are required' },
        { status: 400 }
      );
    }

    // التأكد من صحة صيغة الـ IDs بالنسبة لـ Mongoose
    if (
      !mongoose.Types.ObjectId.isValid(sessionId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return NextResponse.json(
        { error: 'Invalid SessionId or UserId format' },
        { status: 400 }
      );
    }

    await connect();
    const session = await Session.findById(sessionId);

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!session.joinedPlayers) {
      session.joinedPlayers = [];
    }

    // التحقق مما إذا كان المستخدم انضم مسبقاً
    const isAlreadyJoined = session.joinedPlayers.some(
      (player: any) => player.toString() === userId.toString()
    );

    if (!isAlreadyJoined) {
      if (session.joinedPlayers.length >= (session.maxPlayers || 4)) {
        return NextResponse.json(
          { error: 'Session is full' },
          { status: 400 }
        );
      }

      session.joinedPlayers.push(userId);
      await session.save();
    }

    // إرجاع البيانات محدثة مع بيانات المستخدمين
    const updatedSession = await Session.findById(sessionId)
      .populate('host', 'name email image')
      .populate('joinedPlayers', 'name email image');

    return NextResponse.json(updatedSession, { status: 200 });
  } catch (error: any) {
    console.error('Error joining session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to join session' },
      { status: 500 }
    );
  }
}