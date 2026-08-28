import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wecorporate.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/jobs",
          "/jobs/",
          "/internships",
          "/companies/",
          "/career-services",
          "/about",
          "/contact",
          "/terms",
          "/privacy",
        ],
        disallow: [
          "/c/",
          "/c/*",
          "/e/",
          "/e/*",
          "/admin/",
          "/admin/*",
          "/api/",
          "/api/*",
          "/auth/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
