import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { AuthImage } from "@/src/components/auth-image";
import { Card, ErrorText, Muted, Screen, Title } from "@/src/components/ui";
import { api } from "@/src/lib/api";
import type { StorySummary } from "@/src/lib/types";
import { colors } from "@/src/lib/theme";

export default function LibraryScreen() {
  const [stories, setStories] = useState<StorySummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<{ stories: StorySummary[] }>("/api/mobile/stories")
      .then((data) => setStories(data.stories))
      .catch((next) => setError(next instanceof Error ? next.message : "Could not load stories."));
  }, []);

  return (
    <ScrollView>
      <Screen>
        <Title>Library</Title>
        <Muted>Stories stay for 60 days after the last read.</Muted>
        <ErrorText>{error}</ErrorText>
        {stories.map((story) => (
          <Link key={story.id} href={`/stories/${story.id}`} asChild>
            <Pressable>
              <Card>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <AuthImage
                    path={story.coverImagePath}
                    style={{ width: 88, height: 88, borderRadius: 12, backgroundColor: colors.border }}
                  />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={{ color: colors.navy, fontSize: 22, fontWeight: "700" }}>
                      {story.title}
                    </Text>
                    <Muted>
                      {story.childName}
                      {story.seriesTitle ? ` · ${story.seriesTitle}` : ""}
                    </Muted>
                  </View>
                </View>
              </Card>
            </Pressable>
          </Link>
        ))}
      </Screen>
    </ScrollView>
  );
}
