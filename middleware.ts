import { NextRequest, NextResponse } from "next/server";
import { authRoutes, ProtectedRoutes } from "./routes";

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const path = req.nextUrl;

  const isProtectedRoute = ProtectedRoutes.includes(path.pathname);
  const isAuthRoute = authRoutes.includes(path.pathname);

  // 1. إذا كان المستخدم يملك Token ويحاول الدخول لصفحات تسجيل الدخول/الإنشاء -> وجهه للرئيسية
  if (token && isAuthRoute) {
    path.pathname = "/";
    return NextResponse.redirect(path);
  }

  // 2. إذا كان المستخدم لا يملك Token ويحاول الدخول لصفحة محمية -> وجهه لصفحة تسجيل الدخول
  if (!token && isProtectedRoute) {
    path.pathname = "/login"; 
    return NextResponse.redirect(path);
  }

  return NextResponse.next();
}

export const config = {
  // يغطي جميع المسارات عدا ملفات النظام والملفات الثابتة
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
