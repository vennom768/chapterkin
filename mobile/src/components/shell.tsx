import { Link, Slot, usePathname } from "expo-router";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ChromeContext } from "@/src/components/chrome-context";
import { bottomSafeInset, topSafeInset } from "@/src/lib/safe-area";
import { colors, TABLET_MIN_WIDTH } from "@/src/lib/theme";

const links = [
  { href: "/tonight", label: "Tonight" },
  { href: "/family", label: "Family" },
  { href: "/library", label: "Library" },
  { href: "/settings", label: "Settings" },
] as const;

export function AppChrome({ children }: { children?: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const tablet = width >= TABLET_MIN_WIDTH;
  const reading =
    pathname.startsWith("/stories/") && pathname !== "/stories/new";

  return (
    <ChromeContext.Provider value>
      <View style={[styles.root, { paddingTop: reading ? 0 : topSafeInset(insets) }]}>
        {reading ? null : (
          <View style={[styles.header, { paddingHorizontal: tablet ? 24 : 16 }]}>
            <Text style={styles.brand}>ChapterKin</Text>
          </View>
        )}
        <View style={styles.body}>
          {tablet && !reading ? (
            <View style={styles.sidebar}>
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
                return (
                  <Link key={link.href} href={link.href} asChild>
                    <Pressable style={[styles.sideLink, active && styles.sideLinkActive]}>
                      <Text style={[styles.sideLabel, active && styles.sideLabelActive]}>
                        {link.label}
                      </Text>
                    </Pressable>
                  </Link>
                );
              })}
            </View>
          ) : null}
          <View style={styles.content}>{children ?? <Slot />}</View>
        </View>
        {!tablet && !reading ? (
          <View style={[styles.tabs, { paddingBottom: Math.max(bottomSafeInset(insets), 8) }]}>
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link key={link.href} href={link.href} asChild>
                  <Pressable style={styles.tab}>
                    <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                      {link.label}
                    </Text>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        ) : null}
      </View>
    </ChromeContext.Provider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  brand: {
    color: colors.navy,
    fontSize: 22,
    fontWeight: "700",
  },
  body: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 200,
    padding: 12,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  sideLink: {
    minHeight: 44,
    borderRadius: 14,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  sideLinkActive: {
    backgroundColor: "rgba(232, 184, 109, 0.28)",
  },
  sideLabel: {
    color: colors.navy,
    fontSize: 16,
    fontWeight: "600",
  },
  sideLabelActive: {
    fontWeight: "800",
  },
  content: {
    flex: 1,
  },
  tabs: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  tab: {
    flex: 1,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },
  tabLabel: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 13,
  },
  tabLabelActive: {
    color: colors.navy,
  },
});
