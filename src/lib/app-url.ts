export function getAppUrl() {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

export function getTrustedOrigins() {
  const origins = [
    process.env.BETTER_AUTH_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    "https://chapterkin.com",
    "https://www.chapterkin.com",
  ];
  if (process.env.NODE_ENV !== "production") {
    origins.push("http://localhost:3000", "http://127.0.0.1:3000");
  }
  return [...new Set(origins.filter((origin): origin is string => Boolean(origin)))];
}
