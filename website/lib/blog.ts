import matter from "gray-matter";
import fs from "node:fs/promises";
import path from "node:path";

export interface BlogPost {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  content: string;
  image?: string;
}

const blogDir = path.join(process.cwd(), "..", "docs", "blog-posts");

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  try {
    const files = await fs.readdir(blogDir);
    const posts = await Promise.all(
      files
        .filter((file) => file.endsWith(".mdx"))
        .map(async (file) => {
          const slug = file.replace(".mdx", "");
          const filePath = path.join(blogDir, file);
          const fileContent = await fs.readFile(filePath, "utf8");
          const { data, content } = matter(fileContent);
          
          return {
            slug,
            title: data.title,
            date: data.date,
            description: data.description,
            author: data.author,
            image: data.image,
            content,
          };
        })
    );
    
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error("Error reading blog posts:", error);
    return [];
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(blogDir, `${slug}.mdx`);
  
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(fileContent);
    
    return {
      slug,
      title: data.title,
      date: data.date,
      description: data.description,
      author: data.author,
      image: data.image,
      content,
    };
  } catch (error) {
    console.error(`Error reading blog post: ${slug}`, error);
    return null;
  }
}
