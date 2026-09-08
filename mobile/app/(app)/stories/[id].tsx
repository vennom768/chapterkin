import { router, useLocalSearchParams } from "expo-router";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { useEffect, useState } from "react";
import {
  Pressable,
  Share,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthImage } from "@/src/components/auth-image";
import { Button, ChoiceChip, ErrorText, Muted } from "@/src/components/ui";
import { API_URL } from "@/src/lib/auth";
import { api, authHeaders } from "@/src/lib/api";
import type { ReaderTexts, StoryDetail } from "@/src/lib/types";
import { bottomSafeInset, topSafeInset } from "@/src/lib/safe-area";
import { colors, TABLET_MIN_WIDTH } from "@/src/lib/theme";

type Level = keyof ReaderTexts;

const LEVELS: { id: Level; label: string }[] = [
  { id: "early1", label: "Learn 1" },
  { id: "early2", label: "Learn 2" },
  { id: "early3", label: "Learn 3" },
  { id: "parent", label: "Parent" },
  { id: "growing", label: "Growing" },
];

export default function StoryReaderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const landscape = width >= TABLET_MIN_WIDTH && width > height;
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [index, setIndex] = useState(0);
  const [level, setLevel] = useState<Level>("parent");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sharingLink, setSharingLink] = useState(false);
  const [sharingPdf, setSharingPdf] = useState(false);

  useEffect(() => {
    if (!id) return;
    api<StoryDetail>(`/api/mobile/stories/${id}`)
      .then((data) => {
        setStory(data);
        setShareUrl(data.shareToken ? `${API_URL}/s/${data.shareToken}` : null);
      })
      .catch((next) => setError(next instanceof Error ? next.message : "Could not open that story."));
  }, [id]);

  useEffect(() => {
    if (!story?.pages.some((page) => page.imageStatus === "pending") || !id) return;
    const timer = setInterval(() => {
      api<StoryDetail>(`/api/mobile/stories/${id}`)
        .then(setStory)
        .catch(() => undefined);
    }, 2500);
    return () => clearInterval(timer);
  }, [id, story?.pages]);

  function closeBook() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace("/library");
  }

  const page = story?.pages[index];
  const text = page?.kind === "cover" ? story?.title ?? "" : page?.texts[level] ?? page?.text ?? "";
  const canPrev = index > 0;
  const canNext = Boolean(story && index < story.pages.length - 1);

  const [touchX, setTouchX] = useState<number | null>(null);

  if (!story || !page) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, padding: 20, paddingTop: topSafeInset(insets) + 16 }}>
        <Pressable onPress={closeBook} style={{ minHeight: 44, justifyContent: "center" }}>
          <Text style={{ color: colors.navy, fontWeight: "800" }}>Close book</Text>
        </Pressable>
        <ErrorText>{error}</ErrorText>
        {!error ? <Muted>Opening tonight&apos;s book...</Muted> : null}
      </View>
    );
  }

  const art = (
    <View
      style={{
        flex: landscape ? 1 : undefined,
        aspectRatio: landscape ? undefined : 1,
        backgroundColor: colors.border,
        borderRadius: 16,
        overflow: "hidden",
      }}
    >
      <AuthImage path={page.imagePath} style={{ width: "100%", height: "100%" }} />
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        paddingTop: topSafeInset(insets) + 8,
        paddingBottom: Math.max(bottomSafeInset(insets), 12),
      }}
    >
      <View style={{ paddingHorizontal: 16, gap: 8, flex: 1 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Pressable
            onPress={closeBook}
            style={{
              minHeight: 44,
              paddingHorizontal: 14,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: colors.white,
              justifyContent: "center",
            }}
          >
            <Text style={{ color: colors.navy, fontWeight: "800" }}>Close book</Text>
          </Pressable>
          <Text style={{ flex: 1, color: colors.navy, fontSize: 18, fontWeight: "700" }} numberOfLines={2}>
            {story.title}
            {story.seriesTitle ? ` · ${story.seriesTitle}` : ""}
          </Text>
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
          {LEVELS.map((item) => (
            <ChoiceChip
              key={item.id}
              label={item.label}
              selected={level === item.id}
              onPress={() => setLevel(item.id)}
            />
          ))}
        </View>
        <View
          style={{ flex: 1, flexDirection: landscape ? "row" : "column", gap: 16 }}
          onTouchStart={(event) => setTouchX(event.nativeEvent.pageX)}
          onTouchEnd={(event) => {
            if (touchX == null) return;
            const delta = event.nativeEvent.pageX - touchX;
            if (delta < -50 && canNext) setIndex((value) => value + 1);
            if (delta > 50 && canPrev) setIndex((value) => value - 1);
            setTouchX(null);
          }}
        >
          {art}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ color: colors.reader, fontSize: landscape ? 28 : 22, lineHeight: landscape ? 38 : 30 }}>
              {text}
            </Text>
            <Muted>
              {page.kind === "cover" ? "Cover" : `Page ${index} of ${story.pages.length - 1}`}
            </Muted>
          </View>
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              label="Previous page"
              variant="secondary"
              disabled={!canPrev}
              onPress={() => setIndex((value) => value - 1)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Next page" disabled={!canNext} onPress={() => setIndex((value) => value + 1)} />
          </View>
        </View>
        <ErrorText>{error}</ErrorText>
        {status ? <Text style={{ color: colors.navy, fontWeight: "700" }}>{status}</Text> : null}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button
              label={sharingLink ? "Preparing link..." : "Share link"}
              variant="secondary"
              pending={sharingLink}
              onPress={async () => {
                setSharingLink(true);
                setError(null);
                setStatus("Preparing a share link...");
                try {
                  const result = await api<{ url: string }>(`/api/mobile/stories/${story.id}/share`, {
                    method: "POST",
                  });
                  setShareUrl(result.url);
                  setStatus("Opening the share sheet...");
                  await Share.share({ message: result.url, url: result.url });
                  setStatus("Link is ready. Anyone with it can read this story.");
                } catch (next) {
                  setStatus(null);
                  setError(next instanceof Error ? next.message : "Could not share.");
                } finally {
                  setSharingLink(false);
                }
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label={sharingPdf ? "Preparing PDF..." : "Share PDF"}
              variant="secondary"
              pending={sharingPdf}
              onPress={async () => {
                setSharingPdf(true);
                setError(null);
                setStatus("Downloading the PDF...");
                try {
                  const headers = await authHeaders();
                  const target = `${FileSystem.cacheDirectory}chapterkin-${story.id}.pdf`;
                  const download = await FileSystem.downloadAsync(
                    `${API_URL}/api/stories/${story.id}/pdf`,
                    target,
                    { headers },
                  );
                  if (await Sharing.isAvailableAsync()) {
                    setStatus("Opening the share sheet...");
                    await Sharing.shareAsync(download.uri, {
                      mimeType: "application/pdf",
                      UTI: "com.adobe.pdf",
                    });
                    setStatus("PDF is ready. You can send it or save it.");
                  } else {
                    setStatus("PDF downloaded on this device.");
                  }
                } catch (next) {
                  setStatus(null);
                  setError(next instanceof Error ? next.message : "Could not share the PDF.");
                } finally {
                  setSharingPdf(false);
                }
              }}
            />
          </View>
        </View>
        {shareUrl ? <Muted>{shareUrl}</Muted> : null}
      </View>
    </View>
  );
}
