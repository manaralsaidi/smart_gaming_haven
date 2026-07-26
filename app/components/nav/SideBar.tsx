"use client";
import React from "react";
import { FaHeart } from "react-icons/fa";
import { GoHomeFill } from "react-icons/go";
import { MdDashboard } from "react-icons/md";
import NavLink from "./NavLink";
import Logo from "../defaults/Logo";
import { useGetUser } from "@/lib/queryFunctions";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { logout } from "@/app/actions/auth";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { IoGameController } from "react-icons/io5";
import { SiGoogleassistant } from "react-icons/si";
export const NAV_LINKS = [
  {
    link: "/",
    label: "Home",
    icon: <GoHomeFill />,
  },
  {
    link: "/category",
    label: "Category",
    icon: <MdDashboard />,
  },
  {
    link: "/games",
    label: "Games",
    icon: <IoGameController />,
  },
  {
    link: "/wishlist",
    label: "Wishlist",
    icon: <FaHeart />,
  },
  {
    link: "/AI Assistant",
    label: "AI Assistant",
    icon: <SiGoogleassistant />,
  },
];

const SideBar = () => {
  const { user, isLoading } = useGetUser();
  const queryClient = useQueryClient();
  return (
    <div className=" col-span-2">
      <div className=" py-5 px-10 h-screen sticky inset-0 flex flex-col items-start bg-black/30 text-gray-50">
        <Logo />
        {NAV_LINKS.map((navLink, i: number) => (
          <NavLink key={i} navLink={navLink} />
        ))}
        {isLoading ? (
          <div className="mt-auto">
            <Skeleton className="h-4 w-[130px]" />
            <Skeleton className="h-4 w-[100px]" />
          </div>
        ) : user?.data ? (
          <div className=" mt-auto flex flex-col gap-3 w-full">
            <NavLink
              navLink={{
                link: "/settings",
                label: "Settings",
                icon: <Settings />,
              }}
            />
            {/* 🚪 زر تسجيل الخروج بتأثير الفيريديان والتركواز عند تمرير الماوس بدلاً من الأحمر */}
            <Button
              className="w-full text-left justify-start hover:bg-teal-950/40 hover:text-teal-400 transition-colors duration-200"
              onClick={async () => {
                const res = await logout();
                if (res.success) {
                  toast.success(res.success);
                  queryClient.invalidateQueries({ queryKey: ["user"] });
                } else toast.error(res.error);
              }}
              variant={"ghost"}
            >
              Logout
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SideBar;