import type { MetadataRoute } from "next";
import { event } from "@/content/event";

export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: event.url, changeFrequency: "weekly", priority: 1 }];
}
