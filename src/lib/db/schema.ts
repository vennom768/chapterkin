import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  issuer: text("issuer").notNull().default("credential"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const family = pgTable("family", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const childProfile = pgTable("child_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  familyId: text("family_id")
    .notNull()
    .references(() => family.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  calledBy: text("called_by").notNull(),
  age: integer("age").notNull(),
  callsMom: text("calls_mom"),
  callsDad: text("calls_dad"),
  hair: text("hair"),
  eyes: text("eyes"),
  skin: text("skin"),
  usualClothes: text("usual_clothes"),
  favoriteThings: text("favorite_things"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const householdMember = pgTable("household_member", {
  id: text("id").primaryKey(),
  familyId: text("family_id")
    .notNull()
    .references(() => family.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  relationship: text("relationship").notNull(),
  appearance: text("appearance"),
  speciesOrBreed: text("species_or_breed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const storySeries = pgTable("story_series", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  childId: text("child_id")
    .notNull()
    .references(() => childProfile.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  premise: text("premise"),
  runningSummary: text("running_summary").notNull().default(""),
  lastChapterSynopsis: text("last_chapter_synopsis"),
  lastChapterNumber: integer("last_chapter_number").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const story = pgTable("story", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  childId: text("child_id")
    .notNull()
    .references(() => childProfile.id, { onDelete: "cascade" }),
  seriesId: text("series_id").references(() => storySeries.id, {
    onDelete: "set null",
  }),
  mode: text("mode").notNull(),
  title: text("title").notNull(),
  theme: text("theme"),
  dailyPrompt: text("daily_prompt"),
  ageBand: text("age_band").notNull(),
  chapterNumber: integer("chapter_number"),
  synopsis: text("synopsis"),
  illustrationStyle: text("illustration_style").notNull().default("watercolor"),
  status: text("status").notNull().default("generating"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const storyPage = pgTable(
  "story_page",
  {
    id: text("id").primaryKey(),
    storyId: text("story_id")
      .notNull()
      .references(() => story.id, { onDelete: "cascade" }),
    pageIndex: integer("page_index").notNull(),
    kind: text("kind").notNull().default("page"),
    text: text("text").notNull(),
    imagePrompt: text("image_prompt").notNull(),
    imagePath: text("image_path"),
    imageStatus: text("image_status").notNull().default("pending"),
  },
  (table) => [uniqueIndex("story_page_story_idx").on(table.storyId, table.pageIndex)],
);

export const familyRelations = relations(family, ({ many }) => ({
  children: many(childProfile),
  household: many(householdMember),
}));

export const childProfileRelations = relations(childProfile, ({ one, many }) => ({
  family: one(family, {
    fields: [childProfile.familyId],
    references: [family.id],
  }),
  stories: many(story),
  series: many(storySeries),
}));

export const householdMemberRelations = relations(householdMember, ({ one }) => ({
  family: one(family, {
    fields: [householdMember.familyId],
    references: [family.id],
  }),
}));

export const storySeriesRelations = relations(storySeries, ({ one, many }) => ({
  child: one(childProfile, {
    fields: [storySeries.childId],
    references: [childProfile.id],
  }),
  stories: many(story),
}));

export const storyRelations = relations(story, ({ one, many }) => ({
  child: one(childProfile, {
    fields: [story.childId],
    references: [childProfile.id],
  }),
  series: one(storySeries, {
    fields: [story.seriesId],
    references: [storySeries.id],
  }),
  pages: many(storyPage),
}));

export const storyPageRelations = relations(storyPage, ({ one }) => ({
  story: one(story, {
    fields: [storyPage.storyId],
    references: [story.id],
  }),
}));

export const siteSetting = pgTable("site_setting", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const subscription = pgTable("subscription", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  stripeCustomerId: text("stripe_customer_id").unique(),
  stripeSubscriptionId: text("stripe_subscription_id").unique(),
  planId: text("plan_id").notNull().default("none"),
  status: text("status").notNull().default("none"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
