import { Link } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Card, Muted, Screen, Title } from "@/src/components/ui";
import { useSession } from "@/src/lib/session";
import { colors } from "@/src/lib/theme";

export default function TonightScreen() {
  const { me } = useSession();
  if (!me) return null;
  const quota = me.usage.paid
    ? me.usage.unlimited
      ? "Unlimited stories this month."
      : `${me.usage.remaining} of ${me.usage.limit} stories left this month.`
    : "This account does not have a plan yet.";

  return (
    <ScrollView>
      <Screen>
        <Muted>{me.family?.name}</Muted>
        <Title>Who is tonight&apos;s story for?</Title>
        <Text style={{ color: colors.navy, fontWeight: "700" }}>{quota}</Text>
        {me.children.map((child) => (
          <Card key={child.id}>
            <Muted>
              {child.ageLabel}
              {child.calledBy !== child.name ? ` · you call them ${child.calledBy}` : ""}
            </Muted>
            <Text style={{ fontSize: 28, color: colors.navy, fontWeight: "700" }}>
              {child.calledBy || child.name}
            </Text>
            <View style={{ gap: 8, marginTop: 8 }}>
              <Link href={`/stories/new?childId=${child.id}`} asChild>
                <Pressable style={styles.primary}>
                  <Text style={styles.primaryLabel}>Write tonight&apos;s story</Text>
                </Pressable>
              </Link>
              <Link href={`/children/${child.id}/portrait`} asChild>
                <Pressable style={styles.secondary}>
                  <Text style={styles.secondaryLabel}>
                    {child.selectedPortraitId ? "Child drawing" : "Draw their picture"}
                  </Text>
                </Pressable>
              </Link>
              <Link href={`/children/${child.id}`} asChild>
                <Pressable style={styles.secondary}>
                  <Text style={styles.secondaryLabel}>Edit details</Text>
                </Pressable>
              </Link>
            </View>
          </Card>
        ))}
        <Link href="/children/new" asChild>
          <Pressable style={styles.secondary}>
            <Text style={styles.secondaryLabel}>Add a child</Text>
          </Pressable>
        </Link>
      </Screen>
    </ScrollView>
  );
}

const styles = {
  primary: {
    minHeight: 48,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  primaryLabel: { color: colors.white, fontWeight: "700" as const, fontSize: 16 },
  secondary: {
    minHeight: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  secondaryLabel: { color: colors.navy, fontWeight: "700" as const, fontSize: 16 },
};
