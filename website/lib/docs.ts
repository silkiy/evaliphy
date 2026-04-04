import fs from "node:fs/promises";
import path from "node:path";

export interface DocSection {
  title: string;
  id: string;
}

export interface DocMetadata {
  title: string;
  sections: DocSection[];
}

export async function getDocBySlug(slug: string) {
  const docsDir = path.join(process.cwd(), "..", "docs");
  const filePath = path.join(docsDir, `${slug}.mdx`);
  
  try {
    const content = await fs.readFile(filePath, "utf8");
    return content;
  } catch (error) {
    console.error(`Error reading doc: ${slug}`, error);
    return null;
  }
}

export function extractSections(content: string): DocSection[] {
  const sections: DocSection[] = [];
  const lines = content.split("\n");
  
  for (const line of lines) {
    const match = line.match(/^##\s+(.+)$/);
    if (match) {
      const title = match[1].trim();
      const id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
      sections.push({ title, id });
    }
  }
  
  return sections;
}
