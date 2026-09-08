import { NextResponse } from "next/server";

export const MOBILE_CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type, Cookie, Expo-Origin",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

export function corsOptions() {
  return new NextResponse(null, { status: 204, headers: MOBILE_CORS_HEADERS });
}

export function corsJson(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: MOBILE_CORS_HEADERS });
}

export function mobileError(message: string, status = 400, extra?: Record<string, unknown>) {
  return corsJson({ error: message, ...extra }, status);
}
