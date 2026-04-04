import { Sidebar } from "@/app/components/Sidebar";
import { extractSections, getDocBySlug } from "@/lib/docs";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const docSlugs = [
    { slug: "introduction", title: "Introduction" },
    { slug: "quick-start", title: "Quick Start" },
    { slug: "configuration", title: "Configuration" },
    { slug: "assertions", title: "Assertions" },
    { slug: "http-client", title: "HTTP Client" },
    { slug: "reporting", title: "Reporting" },
    { slug: "understanding-RAG-testing", title: "Understanding RAG Testing" },
    { slug: "how-evaliphy-works", title: "How Evaliphy Works" },
    { slug: "llm-as-judge", title: "LLM As Judge" },
  ];

  const docs = await Promise.all(
    docSlugs.map(async (doc) => {
      const content = await getDocBySlug(doc.slug);
      const sections = content ? extractSections(content) : [];
      return {
        ...doc,
        sections,
      };
    })
  );

  return (
    <div className="container mx-auto max-w-screen-2xl px-4 md:px-8">
      <div className="flex flex-col md:flex-row gap-12 py-12">
        <aside className="w-full md:w-64 flex-shrink-0">
          <Sidebar docs={docs} />
        </aside>
        <main className="flex-1 min-w-0 max-w-3xl">
          <div className="prose prose-zinc max-w-none">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
