import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedPrefixes = [
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

  if (
    (pathname === "/sign-in" ||
      pathname === "/sign-up" ||
      pathname === "/forgot-password") &&
    sessionCookie
  ) {
    return NextResponse.redirect(new URL("/home", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
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
