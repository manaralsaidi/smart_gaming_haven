"use client";
import React, { useState, useEffect } from "react";
import { FaStar, FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import { createReviewAction, getGameReviews, toggleLikeReview, createReplyAction, getRepliesForReview } from "../reviewActions";

interface ReviewProps {
  gameId: string;
  user: { id?: string; _id?: string; name: string } | null;
}

const GameReviews = ({ gameId, user }: ReviewProps) => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openReplies, setOpenReplies] = useState<Record<string, boolean>>({});
  const [repliesMap, setRepliesMap] = useState<Record<string, any[]>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [isReplying, setIsReplying] = useState<Record<string, boolean>>({});

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      const data = await getGameReviews(gameId);
      setReviews(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error loading reviews:", err);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (gameId) {
      loadReviews();
    }
  }, [gameId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("You must be logged in to rate this game!");
      return;
    }
    if (rating === 0) {
      toast.error("Please select a rating!");
      return;
    }
    if (!reviewText.trim()) {
      toast.error("Please write your review!");
      return;
    }

    setIsSubmitting(true);
    try {
      // استخراج ID المستخدم آلياً سواء كان id أو _id
      const userId = user.id || user._id;

      if (!userId) {
        toast.error("User ID not found. Please log in again.");
        return;
      }

      // 🚀 استدعاء دالة الإنشاء مع تحديد النوع لتجاوز خطأ TypeScript
      const response: any = await createReviewAction(gameId, userId, reviewText, rating);

      // التأكد مما إذا كان السيرفر أرجع خطأ
      if (response?.error) {
        toast.error(response.error);
        return;
      }

      toast.success("Review submitted successfully!");
      setReviewText("");
      setRating(0);
      loadReviews();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (reviewId: string) => {
    if (!user) {
      toast.error("You must be logged in to like a review!");
      return;
    }
    const userId = user.id || user._id;
    if (!userId) return;

    // تحديث فوري (Optimistic Update) قبل رد السيرفر
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const currentlyLiked = r.likes?.includes(userId);
        return {
          ...r,
          likes: currentlyLiked
            ? r.likes.filter((id: string) => id !== userId)
            : [...(r.likes || []), userId],
          likesCount: currentlyLiked ? r.likesCount - 1 : r.likesCount + 1,
        };
      })
    );

    const response: any = await toggleLikeReview(reviewId, userId);
    if (response?.error) {
      toast.error(response.error);
      loadReviews(); // إعادة المزامنة مع السيرفر عند حدوث خطأ
    }
  };

  const handleToggleReplies = async (reviewId: string) => {
    const isOpen = openReplies[reviewId];
    setOpenReplies((prev) => ({ ...prev, [reviewId]: !isOpen }));

    // نجيب الردود فقط أول مرة ما تكون محملة
    if (!isOpen && !repliesMap[reviewId]) {
      const data = await getRepliesForReview(reviewId);
      setRepliesMap((prev) => ({ ...prev, [reviewId]: Array.isArray(data) ? data : [] }));
    }
  };

  const handleSendReply = async (reviewId: string) => {
    if (!user) {
      toast.error("You must be logged in to reply!");
      return;
    }
    const userId = user.id || user._id;
    const content = replyText[reviewId]?.trim();
    if (!content) {
      toast.error("Please write a reply!");
      return;
    }

    setIsReplying((prev) => ({ ...prev, [reviewId]: true }));
    try {
      const response: any = await createReplyAction(reviewId, userId!, content);
      if (response?.error) {
        toast.error(response.error);
        return;
      }

      // تحديث فوري لقائمة الردود المعروضة
      setRepliesMap((prev) => ({
        ...prev,
        [reviewId]: [
          ...(prev[reviewId] || []),
          { id: Date.now().toString(), content, userName: user.name, createdAt: new Date().toLocaleDateString() },
        ],
      }));
      setReplyText((prev) => ({ ...prev, [reviewId]: "" }));
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply.");
    } finally {
      setIsReplying((prev) => ({ ...prev, [reviewId]: false }));
    }
  };

  return (
    <div className="mt-12 bg-black/40 p-6 rounded-xl border border-teal-950/30 text-gray-100 max-w-4xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-teal-400 [text-shadow:0_0_10px_rgba(45,212,191,0.3)]">
        Ratings & Reviews
      </h3>

      {/* نموذج إضافة التقييم */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-10 p-4 bg-teal-950/10 rounded-lg border border-teal-900/20">
          <h4 className="text-lg font-medium mb-3">Rate this game (out of 10)</h4>
          
          <div className="flex flex-wrap gap-1.5 mb-4 items-center py-1">
            <div className="flex flex-wrap gap-1">
              {[...Array(10)].map((_, index) => {
                const currentRating = index + 1;
                return (
                  <label key={currentRating} className="flex-shrink-0 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      value={currentRating}
                      className="hidden"
                      onClick={() => setRating(currentRating)}
                    />
                    <FaStar
                      className="transition-colors duration-150"
                      size={22}
                      color={currentRating <= (hover || rating) ? "#2dd4bf" : "#374151"}
                      onMouseEnter={() => setHover(currentRating)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                );
              })}
            </div>
            <span className="ml-3 text-teal-400 font-bold text-sm bg-teal-950/40 px-2 py-0.5 rounded border border-teal-900/30">
              {rating > 0 ? `${rating} / 10` : "0 / 10"}
            </span>
          </div>

          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Tell other gamers what you think about this game..."
            className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-gray-100 focus:outline-none focus:border-teal-400 transition duration-200 h-24 resize-none mb-4"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-teal-500 hover:bg-teal-600 text-black font-bold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      ) : (
        <div className="mb-10 p-4 bg-zinc-900/50 text-gray-400 rounded-lg text-center">
          Please <span className="text-teal-400 font-bold">log in</span> to write a review.
        </div>
      )}

      {/* عرض المراجعات السابقة */}
      <div className="space-y-4">
        <h4 className="text-xl font-semibold border-b border-zinc-800 pb-2 mb-4">Gamer Community Reviews</h4>
        
        {isLoading ? (
          <p className="text-gray-500 animate-pulse">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-500">No reviews yet. Be the first to rate this game!</p>
        ) : (
          reviews.map((review, idx) => (
            <div key={review.id || review._id || idx} className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-800/50">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-teal-300">{review.userName || review.user?.name || "Gamer"}</span>
                <span className="text-xs text-gray-500">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ""}</span>
              </div>
              
              <div className="flex flex-wrap gap-1 mb-2 items-center">
                <div className="flex gap-0.5 flex-wrap">
                  {[...Array(10)].map((_, index) => (
                    <FaStar
                      key={index}
                      size={14}
                      color={index < review.rating ? "#2dd4bf" : "#374151"}
                    />
                  ))}
                </div>
                <span className="text-xs text-teal-400 font-bold ml-2">({review.rating}/10)</span>
              </div>
              
              <p className="text-gray-300 text-sm leading-relaxed">{review.reviewText || review.comment}</p>

              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => handleLike(review.id)}
                  className="flex items-center gap-1.5 text-sm transition-transform duration-150 active:scale-95 group"
                >
                  {review.likes?.includes(user?.id || user?._id) ? (
                    <FaHeart className="text-teal-400" size={16} />
                  ) : (
                    <FaRegHeart className="text-gray-400 group-hover:text-teal-400 transition-colors" size={16} />
                  )}
                  <span className="text-gray-400 group-hover:text-teal-300 transition-colors">
                    {review.likesCount || 0}
                  </span>
                </button>

                <button
                  onClick={() => handleToggleReplies(review.id)}
                  className="text-sm text-gray-400 hover:text-teal-300 transition-colors active:scale-95 duration-150"
                >
                  {openReplies[review.id] ? "Hide replies" : "Reply"}
                  {repliesMap[review.id]?.length ? ` (${repliesMap[review.id].length})` : ""}
                </button>
              </div>

              {openReplies[review.id] && (
                <div className="mt-3 pl-4 border-l-2 border-teal-900/30 space-y-3">
                  {repliesMap[review.id]?.map((reply) => (
                    <div key={reply.id} className="text-sm">
                      <span className="font-semibold text-teal-300">{reply.userName}</span>
                      <span className="text-gray-500 text-xs ml-2">{reply.createdAt}</span>
                      <p className="text-gray-300">{reply.content}</p>
                    </div>
                  ))}

                  {user ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={replyText[review.id] || ""}
                        onChange={(e) =>
                          setReplyText((prev) => ({ ...prev, [review.id]: e.target.value }))
                        }
                        placeholder="Write a reply..."
                        className="flex-1 p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-gray-100 text-sm focus:outline-none focus:border-teal-400"
                      />
                      <button
                        onClick={() => handleSendReply(review.id)}
                        disabled={isReplying[review.id]}
                        className="bg-teal-500 hover:bg-teal-600 text-black font-bold px-4 rounded-lg text-sm transition duration-200 disabled:opacity-50 active:scale-95"
                      >
                        {isReplying[review.id] ? "..." : "Send"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-xs">Log in to reply.</p>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GameReviews;