import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/plans", "/exercises", "/install", "/auth/phone"],
        disallow: ["/app/", "/api/"],
      },
    ],
    sitemap: "https://sablefit.app/sitemap.xml",
  };
}
