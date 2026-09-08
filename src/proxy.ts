import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPrefixes = [
  "/admin",
  "/home",
  "/onboarding",
  "/family",
  "/children",
  "/stories",
  "/library",
  "/settings",
  "/billing",
];

export function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  if (isProtected && !sessionCookie) {
    const signIn = new URL("/sign-in", request.url);
    signIn.searchParams.set("next", pathname);
    return NextResponse.redirect(signIn);
  }

  const justReset = pathname === "/sign-in" && request.nextUrl.searchParams.get("reset") === "1";
  if (
    (pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname === "/forgot-password") &&
    sessionCookie &&
    !justReset
  ) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/home/:path*",
    "/onboarding/:path*",
    "/family/:path*",
    "/children/:path*",
    "/stories/:path*",
    "/library/:path*",
    "/settings/:path*",
    "/billing/:path*",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
  ],
};
