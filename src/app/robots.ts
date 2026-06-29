import type { MetadataRoute } from "next";
import { env } from "@/lib/env";

// robots.txt: indexa la tienda, bloquea áreas privadas y de checkout.

export default function robots(): MetadataRoute.Robots {
  const base = env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/cuenta", "/checkout", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
