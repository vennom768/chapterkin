import { readFile } from "node:fs/promises";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { storageImagePath } from "@/lib/ai/portraits";
import { textForReaderLevel } from "@/lib/reader-levels";

type PdfPage = {
  kind?: string | null;
  text: string;
  textLevels?: string | null;
  imagePath?: string | null;
};

export async function buildStoryPdf(input: {
  title: string;
  childName: string;
  pages: PdfPage[];
}) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.TimesRoman);
  const titleFont = await doc.embedFont(StandardFonts.TimesRomanBold);

  for (const page of input.pages) {
    const sheet = doc.addPage([612, 792]);
    const { width, height } = sheet.getSize();
    sheet.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: rgb(0.97, 0.94, 0.88),
    });

    if (page.imagePath) {
      try {
        const bytes = await readFile(storageImagePath(page.imagePath));
        if (page.imagePath.endsWith(".svg")) {
          throw new Error("skip-svg");
        }
        const image = page.imagePath.endsWith(".jpg") || page.imagePath.endsWith(".jpeg")
          ? await doc.embedJpg(bytes)
          : await doc.embedPng(bytes);
        const size = 360;
        sheet.drawImage(image, {
          x: (width - size) / 2,
          y: height - size - 72,
          width: size,
          height: size,
        });
      } catch {
        // Text-only page if the picture file is missing.
      }
    }

    const heading = page.kind === "cover" ? input.title : input.title;
    sheet.drawText(heading.slice(0, 70), {
      x: 48,
      y: 280,
      size: 16,
      font: titleFont,
      color: rgb(0.17, 0.09, 0.06),
    });
    const body =
      page.kind === "cover"
        ? `A ChapterKin story for ${input.childName}`
        : textForReaderLevel(page, "parent");
    const lines = wrapText(body, 72);
    lines.forEach((line, index) => {
      sheet.drawText(line, {
        x: 48,
        y: 250 - index * 16,
        size: 12,
        font,
        color: rgb(0.2, 0.14, 0.1),
      });
    });
  }

  return Buffer.from(await doc.save());
}

function wrapText(value: string, width: number) {
  const words = value.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 12);
}
