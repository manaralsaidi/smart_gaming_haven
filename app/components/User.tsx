import Image from "next/image";
import React from "react";

// تعديل النوع (Type) ليكون الـ avatar اختيارياً ومحمياً من الـ null
const User = ({ user }: { user: { name: string; avatar?: { secure_url: string } | null } }) => {
  // رابط صورة افتراضية رمادية أنيقة في حال عدم وجود صورة للمستخدم
  const defaultAvatar = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

  return (
    <div className="cursor-pointer flex items-center gap-3">
      <div className="w-14 h-14 relative rounded-full overflow-hidden">
        <Image 
          fill 
          src={user?.avatar?.secure_url || defaultAvatar} 
          alt={`${user?.name || "User"}`} 
          className="object-cover" 
        />
      </div>
      <h1 className="text-base text-white">{user?.name || "User"}</h1>
    </div>
  );
};

export default User;
