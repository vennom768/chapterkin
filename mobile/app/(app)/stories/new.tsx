import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Button, ErrorText, Field, Muted, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/session";
import type { Series } from "@/src/lib/types";
import { colors } from "@/src/lib/theme";

const THEMES = ["", "cozy", "adventure", "silly", "nature", "friendship", "bedtime"];
const STYLES = ["watercolor", "cartoon", "crayon", "collage", "vintage", "ink"];

export default function NewStoryScreen() {
  const { childId: queryChildId } = useLocalSearchParams<{ childId?: string }>();
  const { me } = useSession();
  const child = me?.children.find((item) => item.id === queryChildId) ?? me?.children[0];
  const [mode, setMode] = useState<"standalone" | "series">("standalone");
  const [seriesId, setSeriesId] = useState<string>("");
  const [series, setSeries] = useState<Series[]>([]);
  const [theme, setTheme] = useState("");
  const [style, setStyle] = useState("watercolor");
  const [dailyPrompt, setDailyPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!child) return;
    api<{ series: Series[] }>(`/api/mobile/children/${child.id}/series`)
      .then((data) => setSeries(data.series))
      .catch(() => undefined);
  }, [child?.id]);

  if (!child || !me) {
    return (
      <Screen>
        <Title>Choose a child first</Title>
      </Screen>
    );
  }

  const quota = me.usage.paid
    ? me.usage.unlimited
      ? "Unlimited stories on your plan."
      : `${me.usage.remaining} of ${me.usage.limit} stories left this month.`
    : "This account does not have a plan yet.";

  return (
    <ScrollView>
      <Screen>
        <Title>A story for {child.calledBy || child.name}</Title>
        <Muted>{quota}</Muted>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["standalone", "series"] as const).map((value) => (
            <Pressable
              key={value}
              onPress={() => setMode(value)}
              style={{
                flex: 1,
                minHeight: 44,
                borderRadius: 999,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: mode === value ? colors.navy : colors.white,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: mode === value ? colors.gold : colors.navy, fontWeight: "700" }}>
                {value === "standalone" ? "Tonight only" : "A series"}
              </Text>
            </Pressable>
          ))}
        </View>
        {mode === "series"
          ? series.map((item) => (
              <Pressable key={item.id} onPress={() => setSeriesId(item.id)}>
                <Text style={{ color: seriesId === item.id ? colors.accent : colors.navy, fontWeight: "700" }}>
                  {item.title}
                </Text>
              </Pressable>
            ))
          : null}
        <Muted>Theme</Muted>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {THEMES.map((value) => (
            <Pressable
              key={value || "any"}
              onPress={() => setTheme(value)}
              style={{
                paddingHorizontal: 12,
                minHeight: 40,
                borderRadius: 999,
                justifyContent: "center",
                backgroundColor: theme === value ? colors.gold : colors.white,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.navy, fontWeight: "700" }}>{value || "Let it decide"}</Text>
            </Pressable>
          ))}
        </View>
        <Muted>Art style</Muted>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {STYLES.map((value) => (
            <Pressable
              key={value}
              onPress={() => setStyle(value)}
              style={{
                paddingHorizontal: 12,
                minHeight: 40,
                borderRadius: 999,
                justifyContent: "center",
                backgroundColor: style === value ? colors.gold : colors.white,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text style={{ color: colors.navy, fontWeight: "700", textTransform: "capitalize" }}>
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
        <Field
          label="Something from today"
          multiline
          value={dailyPrompt}
          onChangeText={setDailyPrompt}
        />
        <ErrorText>{error}</ErrorText>
        {me.usage.canGenerate ? (
          <Button
            label="Generate story"
            pending={pending}
            onPress={async () => {
              setPending(true);
              setError(null);
              try {
                const result = await api<{ storyId: string }>("/api/mobile/stories", {
                  method: "POST",
                  body: JSON.stringify({
                    childId: child.id,
                    mode,
                    seriesId: mode === "series" ? seriesId || null : null,
                    theme: theme || null,
                    dailyPrompt: dailyPrompt || null,
                    illustrationStyle: style,
                  }),
                });
                router.replace(`/stories/${result.storyId}`);
              } catch (next) {
                setError(next instanceof Error ? next.message : "Could not write that story.");
                setPending(false);
              }
            }}
          />
        ) : (
          <Muted>This account does not have a plan yet.</Muted>
        )}
      </Screen>
    </ScrollView>
  );
}
