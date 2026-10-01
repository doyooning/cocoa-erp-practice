import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const loggedIn = request.cookies.get(SESSION_COOKIE)?.value === SESSION_VALUE;

  if (pathname === "/login") {
    return loggedIn
      ? NextResponse.redirect(new URL("/dashboard", request.url))
      : NextResponse.next();
  }

  if (!loggedIn) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/login|api/logout|_next/static|_next/image|favicon.ico).*)"],
};
