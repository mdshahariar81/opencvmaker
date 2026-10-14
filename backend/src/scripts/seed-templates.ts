import { db } from "../config/database.js";

const templates = [
  {
    key: "modern",
    name: "Modern CV",
    description:
      "A clean and professional modern CV layout suitable for technology, business, and creative roles.",
    version: "1.0.0",
    config: {
      layout: "modern",
      typography: "clean",
      sidebar: false,
      accentColor: "#2563EB",
    },
    isActive: true,
    isDefault: true,
  },
  {
    key: "classic",
    name: "Classic CV",
    description:
      "A traditional and professional CV layout designed for academic, corporate, and formal applications.",
    version: "1.0.0",
    config: {
      layout: "classic",
      typography: "traditional",
      sidebar: false,
      accentColor: "#111827",
    },
    isActive: true,
    isDefault: false,
  },
  {
    key: "minimal",
    name: "Minimal CV",
    description:
      "A simple and elegant CV layout focused on readability, whitespace, and essential information.",
    version: "1.0.0",
    config: {
      layout: "minimal",
      typography: "minimal",
      sidebar: false,
      accentColor: "#374151",
    },
    isActive: true,
    isDefault: false,
  },
];

async function seedTemplates() {
  for (const template of templates) {
    const existing =
      await db.orm.public.Template
        .where({
          key: template.key,
        })
        .first();

    if (existing) {
      console.log(
        `Template "${template.key}" already exists. Skipping.`,
      );
      continue;
    }

    await db.orm.public.Template.create(
      template,
    );

    console.log(
      `Created template: ${template.key}`,
    );
  }

  console.log("Template seeding completed.");
}

await seedTemplates();