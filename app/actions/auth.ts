"use server";
import User from "../models/user";
import connect from "./connect";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_EXPIRES = 90 * 60;
const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-gaming-boi";

const generateToken = async ({ id }: { id: any }) => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES,
  });
};

export const signup = async (data: any) => {
  try {
    await connect();
    const { confirmPassword, ...userData } = data;
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    await User.create({ ...userData, password: hashedPassword });
    
    return { success: "User created successfully" };
  } catch (error: any) {
    console.error("Signup backend error:", error);
    return { error: "User creation failed", details: error.message };
  }
};

export const login = async (data: { email: string; password: string }) => {
  try {
    await connect();
    const cookieStore = await cookies();
    
    const user = await User.findOne({ email: data.email }).select("+password");
    
    if (!user) {
      return { error: "Incorrect email or password !" };
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      return { error: "Incorrect email or password !" };
    }

    const userObj = JSON.parse(JSON.stringify(user));
    delete userObj.password;

    const token = await generateToken({ id: user._id });

    cookieStore.set("token", token, {
      httpOnly: true,
      maxAge: JWT_EXPIRES,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
    });

    return { success: "Login successful", data: userObj };
  } catch (error: any) {
    console.error("Login backend error:", error);
    return { error: "Login failed", details: error.message };
  }
};

// 🔴 دالة الحماية الصارمة (تُستخدم فقط عند إجراء التقييمات أو عمليات الحساب)
export const protect = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) {
      return { error: "you are not authorized to perform this action!" };
    }

    const decode = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!decode || !decode.id) {
      return { error: "you are not authorized to perform this action!" };
    }
    
    return { decode };
  } catch (err: any) {
    return { error: "you are not authorized to perform this action!" };
  }
};

// 🟢 دالة GetUser إجبارية للمهام المحمية
export const getUser = async () => {
  try {
    await connect();
    const authStatus = await protect();
    if ("error" in authStatus) return { error: authStatus.error };

    const userId = (authStatus.decode as any).id;
    const user = await User.findById(userId);
    
    if (!user) {
      return { error: "you are not authorized to perform this action!" };
    }
    
    const userObj = JSON.parse(JSON.stringify(user));
    return { data: userObj };
  } catch (error: any) {
    return { error: "you are not authorized to perform this action!" };
  }
};

// 🟢 ✅ دالة جديدة (اختيارية): تجلب المستخدم إن وُجد، ولا تسبب أخطاء أو أذونات إن كان زائرًا
export const getOptionalUser = async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null; // زائر عادي بدون تسجيل دخول

    const decode = jwt.verify(token, JWT_SECRET) as { id: string };
    if (!decode || !decode.id) return null;

    await connect();
    const user = await User.findById(decode.id).select("-password");
    if (!user) return null;

    return JSON.parse(JSON.stringify(user));
  } catch (error) {
    return null; // تحاشي إطلاق أي خطأ في التيرمينال
  }
};

export const logout = async () => {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("token");
    return { success: "Logout successful" };
  } catch (error) {
    return { error: "Logout failed" };
  }
};