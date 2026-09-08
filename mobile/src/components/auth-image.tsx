import { useEffect, useState } from "react";
import { Image } from "expo-image";
import { authHeaders, imageUri } from "@/src/lib/api";

export function AuthImage({
  path,
  style,
}: {
  path: string | null | undefined;
  style?: object;
}) {
  const [headers, setHeaders] = useState<Record<string, string> | null>(null);
  const uri = imageUri(path);

  useEffect(() => {
    let cancelled = false;
    authHeaders().then((value) => {
      if (!cancelled) setHeaders(value as Record<string, string>);
    });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!uri || !headers) return null;
  return <Image source={{ uri, headers }} style={style} contentFit="cover" />;
}
