import { router, useLocalSearchParams } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { AuthImage } from "@/src/components/auth-image";
import { Button, ErrorText, Muted, Screen, Title } from "@/src/components/ui";
import { API_URL } from "@/src/lib/auth";
import { api, authHeaders } from "@/src/lib/api";
import { useSession } from "@/src/lib/session";
import type { Portrait } from "@/src/lib/types";
import { colors } from "@/src/lib/theme";

export default function PortraitScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { me, refresh } = useSession();
  const child = me?.children.find((item) => item.id === id);
  const [portraits, setPortraits] = useState<Portrait[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [drawing, setDrawing] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const data = await api<{ portraits: Portrait[] }>(`/api/mobile/children/${id}`);
    setPortraits(data.portraits);
    return data.portraits;
  }, [id]);

  useEffect(() => {
    load().catch((next) => setError(next instanceof Error ? next.message : "Could not load drawings."));
  }, [load]);

  useEffect(() => {
    if (!drawing || !id) return;
    const timer = setInterval(() => {
      load()
        .then((next) => {
          if (next && next.length >= 3) setDrawing(false);
        })
        .catch(() => undefined);
    }, 2000);
    return () => clearInterval(timer);
  }, [drawing, id, load]);

  if (!child) {
    return (
      <Screen>
        <Title>Child not found</Title>
      </Screen>
    );
  }

  async function generate(photo?: ImagePicker.ImagePickerAsset) {
    if (!id) return;
    setPending(true);
    setError(null);
    try {
      const body = new FormData();
      if (photo?.uri) {
        body.append("photo", {
          uri: photo.uri,
          name: photo.fileName ?? "child.jpg",
          type: photo.mimeType ?? "image/jpeg",
        } as never);
      }
      const headers = await authHeaders();
      const response = await fetch(`${API_URL}/api/children/${id}/portraits`, {
        method: "POST",
        headers,
        body,
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Could not start drawings.");
      }
      setDrawing(true);
      await load();
    } catch (next) {
      setError(next instanceof Error ? next.message : "Could not start drawings.");
    } finally {
      setPending(false);
    }
  }

  return (
    <ScrollView>
      <Screen>
        <Title>Draw {child.calledBy || child.name}</Title>
        <Muted>
          Use a photo once if you want. We do not keep the photo. Pick the drawing stories should use.
        </Muted>
        <ErrorText>{error}</ErrorText>
        {drawing ? <Muted>Drawing {Math.min(portraits.length, 3)} of 3...</Muted> : null}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
          {portraits.map((portrait) => (
            <Pressable
              key={portrait.id}
              onPress={async () => {
                await api(`/api/mobile/portraits/${portrait.id}/select`, {
                  method: "POST",
                  body: JSON.stringify({ childId: child.id }),
                });
                await refresh();
                await load();
              }}
              style={{
                width: 150,
                borderRadius: 16,
                overflow: "hidden",
                borderWidth: portrait.selected ? 3 : 1,
                borderColor: portrait.selected ? colors.accent : colors.border,
              }}
            >
              <AuthImage path={portrait.imagePath} style={{ width: 150, height: 150 }} />
              {portrait.selected ? (
                <Text style={{ textAlign: "center", padding: 6, fontWeight: "700", color: colors.navy }}>
                  Using this one
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
        <Button
          label="Take a photo"
          pending={pending}
          onPress={async () => {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (!permission.granted) {
              setError("Camera permission is needed for a photo.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ["images"],
              quality: 0.7,
            });
            if (!result.canceled && result.assets[0]) {
              await generate(result.assets[0]);
            }
          }}
        />
        <Button
          label="Choose a photo"
          variant="secondary"
          pending={pending}
          onPress={async () => {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permission.granted) {
              setError("Photo library permission is needed.");
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ["images"],
              quality: 0.7,
            });
            if (!result.canceled && result.assets[0]) {
              await generate(result.assets[0]);
            }
          }}
        />
        <Button
          label="Draw without a photo"
          variant="secondary"
          pending={pending}
          onPress={() => generate()}
        />
        <Button label="Done" variant="secondary" onPress={() => router.replace("/tonight")} />
      </Screen>
    </ScrollView>
  );
}
