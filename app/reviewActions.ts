"use server";
import { revalidatePath } from "next/cache";
import GameReview from "@/app/models/review";
import mongoose from "mongoose";
 
async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;
  const dbUrl = process.env.DATABASE_URL || process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/gaming_boi";
  return mongoose.connect(dbUrl);
}
 
// 1. فعل إضافة مراجعة وتقييم جديد
export async function createReviewAction(
  gameId: string, 
  userId: string, 
  reviewText: string, 
  rating: number
) {
  try {
    await connectDB();
    
    if (!reviewText || !rating) {
      return { error: "Review text and rating are required" };
    }
 
    // تمرير likes كـ مصفوفة فارغة [] لأن نوعها في الـ Schema هو [ObjectId]
    await GameReview.create({
      gameId,
      userId: new mongoose.Types.ObjectId(userId),
      reviewText,
      rating,
      likes: [], // 🎯 حل خطأ Cast Error
    });
 
    // تحديث كاش الصفحة فورياً بعد الإضافة
    revalidatePath(`/game/${gameId}`);
    
    // إرجاع كائن النجاح للواجهة
    return { success: true };
  } catch (error: any) {
    console.error("Error creating review:", error);
 
    // معالجة خطأ الفهرس المكرر من قاعدة البيانات
    if (error.code === 11000) {
      return { error: "Database Index issue. Please drop 'likes_1' index from MongoDB Compass." };
    }
 
    return { error: error.message || "Failed to create review" };
  }
}
 
// 3. فعل الإعجاب / إلغاء الإعجاب بمراجعة معينة
export async function toggleLikeReview(reviewId: string, userId: string) {
  try {
    await connectDB();
 
    if (!reviewId || !userId) {
      return { error: "Review ID and User ID are required" };
    }
 
    const review = await GameReview.findById(reviewId);
    if (!review) {
      return { error: "Review not found" };
    }
 
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const alreadyLiked = review.likes.some(
      (id: mongoose.Types.ObjectId) => id.toString() === userId
    );
 
    if (alreadyLiked) {
      // إلغاء الإعجاب: إزالة الـ userId من مصفوفة likes
      review.likes = review.likes.filter(
        (id: mongoose.Types.ObjectId) => id.toString() !== userId
      );
    } else {
      // إضافة الإعجاب: منع التكرار عبر التحقق اليدوي بدل unique index
      review.likes.push(userObjectId);
    }
 
    await review.save();
    revalidatePath(`/game/${review.gameId}`);
 
    return {
      success: true,
      liked: !alreadyLiked,
      likesCount: review.likes.length,
    };
  } catch (error: any) {
    console.error("Error toggling like:", error);
    return { error: error.message || "Failed to update like" };
  }
}
 
export async function getGameReviews(gameId: string) {
  try {
    await connectDB();
 
    // جلب المراجعات وترتيبها من الأحدث للأقدم
    const reviews = await GameReview.find({ gameId })
      .populate("userId", "name email") 
      .sort({ createdAt: -1 });
 
    if (!reviews || !Array.isArray(reviews)) {
      return [];
    }
 
    return reviews.map((rev) => ({
      id: rev?._id?.toString() || Math.random().toString(),
      reviewText: rev?.reviewText || "",
      rating: rev?.rating || 0,
      createdAt: rev?.createdAt ? new Date(rev.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
      userName: (rev?.userId as any)?.name || "Anonymous Gamer",
      likes: (rev?.likes || []).map((id: any) => id.toString()),
      likesCount: (rev?.likes || []).length,
    }));
 
  } catch (err) {
    console.error("Database error in getGameReviews:", err);
    return [];
  }
}