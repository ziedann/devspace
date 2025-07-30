import fs from "fs";
import path from "path";
import matter from "gray-matter";

import Link from "next/link";
import Image from "next/image";
import marked from "marked";
import Layout from "@/components/Layout";
import CategoryLabel from "@/components/CategoryLabel";

export default function PostPage({
  slug,
  frontmatter: { title, category, date, cover_image, author, author_image },
  content,
}) {
  return (
    <Layout title={title}>
      <Link href="/blog">Go Back</Link>
      <div className="max-w-5xl mx-auto px-10 py-6 bg-white rounded-lg shadow-md mt-6">
        <div className="flex justify-between items-center mt-4">
          <h1 className="text-5xl mb-7">{title}</h1>
          <CategoryLabel>{category}</CategoryLabel>
        </div>
        <div className="relative w-full h-96">
          <Image
            src={cover_image}
            alt={title}
            layout="fill"
            objectFit="cover"
            className="rounded"
          />
        </div>
        <div className="flex justify-between items-center bg-gray-100 p-2 my-8">
          <div className="flex items-center">
            <div className="relative mx-4 w-10 h-10 hidden sm:block">
              <Image
                src={author_image}
                alt={author}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <h4>{author}</h4>
          </div>
          <div className="mr-4">{date}</div>
        </div>
        <div className="blog-text mt-2">
          <div dangerouslySetInnerHTML={{ __html: marked(content) }}></div>
        </div>
      </div>
    </Layout>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync(path.join("posts"));
  const paths = files.map((filename) => ({
    params: {
      slug: filename.replace(".md", ""),
    },
  }));
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const markdownWithMeta = fs.readFileSync(
    path.join("posts", slug + ".md"),
    "utf-8"
  );
  const { data: frontmatter, content } = matter(markdownWithMeta);
  return {
    props: {
      slug,
      frontmatter,
      content,
    },
  };
}
