import Link from "next/link";
import { Card } from "@/components/ui/card";

export function StoryTile({
  storyId,
  title,
  synopsis,
  childName,
  seriesTitle,
  chapterNumber,
  coverPageId,
  coverReady,
}: {
  storyId: string;
  title: string;
  synopsis?: string | null;
  childName: string;
  seriesTitle?: string | null;
  chapterNumber?: number | null;
  coverPageId?: string | null;
  coverReady?: boolean;
}) {
  return (
    <Link href={`/stories/${storyId}`} className="block h-full">
      <Card className="h-full overflow-hidden p-0 sm:p-0 transition-transform hover:-translate-y-0.5">
        <div className="aspect-[4/3] bg-[#efe2cc]">
          {coverReady && coverPageId ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/api/pages/${coverPageId}/image`}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center px-6 text-center">
              <p className="font-serif text-2xl text-navy">{title}</p>
            </div>
          )}
        </div>
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
            {childName}
            {seriesTitle
              ? ` · ${seriesTitle}${chapterNumber ? ` · Ch. ${chapterNumber}` : ""}`
              : " · Tonight only"}
          </p>
          <h2 className="mt-1 font-serif text-2xl text-navy">{title}</h2>
          {synopsis ? (
            <p className="mt-2 line-clamp-3 text-sm text-muted">{synopsis}</p>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
