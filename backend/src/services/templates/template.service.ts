import { db } from "../../config/database.js";
import { AppError } from "../../errors/app-error.js";

export const templateService = {
  async getTemplates() {
    return db.orm.public.Template
      .where({
        isActive: true,
      })
      .orderBy(
        (template) => template.name.asc(),
      )
      .all();
  },

  async getTemplate(templateId: string) {
    const template =
      await db.orm.public.Template
        .where({
          id: templateId,
          isActive: true,
        })
        .first();

    if (!template) {
      throw new AppError(
        "Template not found",
        404,
      );
    }

    return template;
  },
};