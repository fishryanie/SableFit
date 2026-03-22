import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/plans", "/exercises", "/install", "/auth/phone"];

  return pages.map((page) => ({
    url: `https://sablefit.app${page}`,
    changeFrequency: page === "" ? "weekly" : "monthly",
    priority: page === "" ? 1 : 0.7,
    lastModified: new Date(),
  }));
}
