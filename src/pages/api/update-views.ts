// pages/api/update-views.ts

import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const { slug } = req.body;

    if (!slug || typeof slug !== "string") {
      return res.status(400).json({ error: "Invalid or missing 'slug' in request body." });
    }

    const filePath = path.join(process.cwd(), "posts", `${slug}.mdx`);

    if (fs.existsSync(filePath)) {
      try {
        const fileContents = fs.readFileSync(filePath, "utf8");
        const { data, content } = matter(fileContents);

        // Increment the view count
        data.views = (data.views || 0) + 1;

        // Reconstruct the file with updated front matter
        const updatedContent = matter.stringify(content, data);
        fs.writeFileSync(filePath, updatedContent, "utf8");

        console.log(`Views updated for '${slug}': ${data.views}`);

        return res.status(200).json({ message: "Views updated successfully", views: data.views });
      } catch (error) {
        console.error(`Error updating views for '${slug}':`, error);
        return res.status(500).json({ error: "Internal Server Error" });
      }
    } else {
      console.error(`Post not found: '${slug}'`);
      return res.status(404).json({ error: "Post not found" });
    }
  } else {
    // Method Not Allowed
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
  }
}
