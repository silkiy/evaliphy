import { getAllBlogPosts } from "@/lib/blog";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Blog | Evaliphy",
  description: "Latest news, updates, and deep dives into RAG evaluation from the Evaliphy team.",
};

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl">From the blog</h2>
          <p className="mt-2 text-lg leading-8 text-zinc-600">
            Learn how to test your AI applications and stay up to date with Evaliphy.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article 
              key={post.slug} 
              className="bg-gray-50 flex flex-col items-start justify-between p-8 rounded-3xl border border-zinc-200  transition-all duration-300 hover:border-zinc-300 hover:shadow-xl hover:-translate-y-1 group"
            >
              <div className="w-full">
                <div className="flex items-center gap-x-4 text-xs">
                  <time dateTime={post.date} className="text-zinc-500">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  <span className="relative z-10 rounded-full bg-zinc-50 px-3 py-1.5 font-medium text-zinc-600">
                    Article
                  </span>
                </div>
                <div className="relative">
                  <h3 className="mt-4 text-xl font-bold leading-7 text-zinc-900 group-hover:text-indigo-600 transition-colors duration-200">
                    <Link href={`/blog/${post.slug}`}>
                      <span className="absolute inset-0" />
                      {post.title}
                    </Link>
                  </h3>
                  <p className="mt-4 line-clamp-3 text-sm leading-6 text-zinc-600">{post.description}</p>
                </div>
              </div>
              <div className="relative mt-8 flex items-center gap-x-4 border-t border-zinc-100 pt-6 w-full">
                <div className="text-sm leading-6">
                  <p className="font-semibold text-zinc-900">
                    {post.author}
                  </p>
                  <p className="text-zinc-500">Evaliphy Team</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
