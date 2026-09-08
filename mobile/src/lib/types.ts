export type Usage = {
  paid: boolean;
  promo: boolean;
  planId: string | null;
  planName: string | null;
  planLabel: string | null;
  used: number;
  limit: number | null;
  remaining: number | null;
  unlimited: boolean;
  canGenerate: boolean;
};

export type Child = {
  id: string;
  name: string;
  calledBy: string;
  age: number;
  ageMonths: number | null;
  ageLabel: string;
  sex: "boy" | "girl" | string | null;
  hair: string | null;
  eyes: string | null;
  skin: string | null;
  usualClothes: string | null;
  favoriteThings: string | null;
  callsMom: string | null;
  callsDad: string | null;
  notes: string | null;
  selectedPortraitId: string | null;
  portraitPacks: number;
};

export type HouseholdMember = {
  id?: string;
  name: string;
  relationship: "parent" | "grandparent" | "friend" | "pet" | "other";
  appearance: string | null;
  speciesOrBreed: string | null;
  hair: string | null;
  eyes: string | null;
  skin: string | null;
  usualClothes: string | null;
};

export type Family = {
  id: string;
  name: string;
  notes: string | null;
  household: HouseholdMember[];
};

export type Me = {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
  };
  usage: Usage;
  family: Family | null;
  children: Child[];
  needsOnboarding: boolean;
};

export type Portrait = {
  id: string;
  imagePath: string;
  source: string | null;
  selected: boolean;
};

export type Series = {
  id: string;
  title: string;
  childId: string;
  lastChapterNumber: number;
};

export type StorySummary = {
  id: string;
  title: string;
  childId: string;
  childName: string | null;
  seriesId: string | null;
  seriesTitle: string | null;
  chapterNumber: number | null;
  mode: string;
  status: string;
  createdAt: string;
  coverImagePath: string | null;
  coverImageStatus: string;
};

export type ReaderTexts = {
  early1: string;
  early2: string;
  early3: string;
  parent: string;
  growing: string;
};

export type StoryPage = {
  id: string;
  pageIndex: number;
  kind: string | null;
  text: string;
  texts: ReaderTexts;
  imageStatus: string;
  imagePath: string | null;
};

export type StoryDetail = {
  id: string;
  title: string;
  childId: string;
  childName: string;
  seriesId: string | null;
  seriesTitle: string | null;
  chapterNumber: number | null;
  mode: string;
  status: string;
  shareToken: string | null;
  illustrationStyle: string;
  pages: StoryPage[];
};
