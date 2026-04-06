import { getAllBlogPosts } from "@/lib/blog";
import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://evaliphy.com";

  // Static routes
  const staticRoutes = [
    "",
    "/blog",
    "/docs/quick-start",
    "/docs/introduction",
    "/docs/how-evaliphy-works",
    "/docs/understanding-RAG-testing",
    "/docs/configuration",
    "/docs/assertions",
    "/docs/assertions-api",
    "/docs/llm-as-judge",
    "/docs/http-client",
    "/docs/reporting",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Blog posts
  const blogPosts = await getAllBlogPosts();
  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
