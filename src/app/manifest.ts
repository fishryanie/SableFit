import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "SableFit",
    short_name: "SableFit",
    description:
      "Mobile-first workout planner app and gym routine tracker with visual exercise cards and smart weekly scheduling.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f6f3",
    theme_color: "#111111",
    lang: "vi",
    categories: ["health", "fitness", "lifestyle"],
    icons: [
      {
        src: "/pwa/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/pwa/maskable-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/pwa/screens/today.png",
        sizes: "840x1720",
        type: "image/png",
        form_factor: "narrow",
        label: "Today view with active plan and next session",
      },
      {
        src: "/pwa/screens/plans.png",
        sizes: "840x1720",
        type: "image/png",
        form_factor: "narrow",
        label: "Weekly workout plans and sample templates",
      },
      {
        src: "/pwa/screens/library.png",
        sizes: "840x1720",
        type: "image/png",
        form_factor: "narrow",
        label: "Visual exercise library with filter chips",
      },
      {
        src: "/pwa/screens/install.png",
        sizes: "840x1720",
        type: "image/png",
        form_factor: "narrow",
        label: "Install flow for Add to Home Screen",
      },
    ],
  };
}
