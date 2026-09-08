import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { PlanCard } from "@/src/components/plan-card";
import { Button, ChoiceChip, ErrorText, Field, Muted, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import { useSession } from "@/src/lib/session";
import type { Series } from "@/src/lib/types";

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
        <PlanCard />
        <View style={{ flexDirection: "row", gap: 8 }}>
          {(["standalone", "series"] as const).map((value) => (
            <ChoiceChip
              key={value}
              flex
              label={value === "standalone" ? "Tonight only" : "A series"}
              selected={mode === value}
              onPress={() => setMode(value)}
            />
          ))}
        </View>
        {mode === "series"
          ? series.map((item) => (
              <ChoiceChip
                key={item.id}
                label={item.title}
                selected={seriesId === item.id}
                onPress={() => setSeriesId(item.id)}
              />
            ))
          : null}
        <Muted>Theme</Muted>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {THEMES.map((value) => (
            <ChoiceChip
              key={value || "any"}
              label={value || "Let it decide"}
              selected={theme === value}
              onPress={() => setTheme(value)}
            />
          ))}
        </View>
        <Muted>Art style</Muted>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {STYLES.map((value) => (
            <ChoiceChip
              key={value}
              label={value}
              selected={style === value}
              onPress={() => setStyle(value)}
            />
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
