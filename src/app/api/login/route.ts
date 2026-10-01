import { NextResponse } from "next/server";
import { ADMIN_ID, ADMIN_PW, SESSION_COOKIE, SESSION_VALUE } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (body.id !== ADMIN_ID || body.password !== ADMIN_PW) {
    return NextResponse.json(
      { error: "아이디 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
