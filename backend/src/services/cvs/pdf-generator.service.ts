import PDFDocument from "pdfkit";

type CVData = {
  cv: {
    title: string;
  };
  personalInformation: unknown;
  summary: unknown;
  education: unknown[];
  workExperience: unknown[];
  skills: unknown[];
  projects: unknown[];
  certifications: unknown[];
  languages: unknown[];
  awards: unknown[];
  volunteerExperience: unknown[];
  publications: unknown[];
  conferences: unknown[];
  courses: unknown[];
  memberships: unknown[];
  teachingExperience: unknown[];
  leadershipExperience: unknown[];
  activities: unknown[];
  patents: unknown[];
  interests: unknown[];
  references: unknown[];
  customSections: unknown[];
  sectionSettings: unknown[];
};

/**
 * Generates a simple, professional PDF from the complete CV data.
 *
 * Important:
 * - This service only handles PDF rendering.
 * - It does not save files.
 * - It does not create CVExport database records.
 * - Storage/API integration will be handled separately.
 */
export function generateCVPdf(cv: CVData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: cv.cv.title,
        Author: "OpenCVMaker",
        Creator: "OpenCVMaker",
      },
    });

    const chunks: Buffer[] = [];

    document.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    document.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    document.on("error", reject);

    /*
     * ---------------------------------------------------------
     * CV Header
     * ---------------------------------------------------------
     */

    document
      .fontSize(22)
      .font("Helvetica-Bold")
      .text(cv.cv.title, {
        align: "center",
      });

    document.moveDown(0.5);

    /*
     * ---------------------------------------------------------
     * Personal Information
     * ---------------------------------------------------------
     */

    const personal = cv.personalInformation as Record<string, unknown> | null;

    if (personal) {
      const name = personal["fullName"];

      if (typeof name === "string" && name.trim()) {
        document
          .fontSize(18)
          .font("Helvetica-Bold")
          .text(name.trim(), {
            align: "center",
          });

        document.moveDown(0.3);
      }

      const contactItems = [
        personal["email"],
        personal["phone"],
        personal["location"],
        personal["website"],
      ].filter(
        (value): value is string =>
          typeof value === "string" && value.trim().length > 0,
      );

      if (contactItems.length > 0) {
        document
          .fontSize(9)
          .font("Helvetica")
          .text(contactItems.join(" | "), {
            align: "center",
          });

        document.moveDown(1);
      }
    }

    /*
     * ---------------------------------------------------------
     * Professional Summary
     * ---------------------------------------------------------
     */

    if (cv.summary) {
      const summary = cv.summary as Record<string, unknown>;

      const summaryText =
        typeof summary["summary"] === "string"
          ? summary["summary"]
          : typeof summary["description"] === "string"
            ? summary["description"]
            : null;

      if (summaryText) {
        addSectionTitle(document, "Professional Summary");

        document
          .fontSize(10)
          .font("Helvetica")
          .text(summaryText);

        document.moveDown(0.7);
      }
    }

    /*
     * ---------------------------------------------------------
     * Education
     * ---------------------------------------------------------
     */

    if (cv.education.length > 0) {
      addSectionTitle(document, "Education");

      for (const item of cv.education) {
        const education = item as Record<string, unknown>;

        const degree = stringValue(education["degree"]);
        const field = stringValue(education["field"]);
        const institution = stringValue(education["institution"]);

        const heading = [degree, field].filter(Boolean).join(" - ");

        if (heading) {
          document
            .fontSize(11)
            .font("Helvetica-Bold")
            .text(heading);
        }

        if (institution) {
          document
            .fontSize(10)
            .font("Helvetica")
            .text(institution);
        }

        const dates = formatDateRange(
          education["startDate"],
          education["endDate"],
          education["current"],
        );

        if (dates) {
          document
            .fontSize(9)
            .font("Helvetica-Oblique")
            .text(dates);
        }

        const description = stringValue(education["description"]);

        if (description) {
          document
            .fontSize(9)
            .font("Helvetica")
            .text(description);
        }

        document.moveDown(0.5);
      }
    }

    /*
     * ---------------------------------------------------------
     * Work Experience
     * ---------------------------------------------------------
     */

    if (cv.workExperience.length > 0) {
      addSectionTitle(document, "Work Experience");

      for (const item of cv.workExperience) {
        const work = item as Record<string, unknown>;

        const position = stringValue(work["position"]);
        const company = stringValue(work["company"]);

        if (position) {
          document
            .fontSize(11)
            .font("Helvetica-Bold")
            .text(position);
        }

        if (company) {
          document
            .fontSize(10)
            .font("Helvetica")
            .text(company);
        }

        const dates = formatDateRange(
          work["startDate"],
          work["endDate"],
          work["current"],
        );

        if (dates) {
          document
            .fontSize(9)
            .font("Helvetica-Oblique")
            .text(dates);
        }

        const description = stringValue(work["description"]);

        if (description) {
          document
            .fontSize(9)
            .font("Helvetica")
            .text(description);
        }

        document.moveDown(0.5);
      }
    }

    /*
     * ---------------------------------------------------------
     * Skills
     * ---------------------------------------------------------
     */

    if (cv.skills.length > 0) {
      addSectionTitle(document, "Skills");

      const skills = cv.skills
        .map((item: unknown) => {
          const skill = item as Record<string, unknown>;

          return (
            stringValue(skill["name"]) ??
            stringValue(skill["skill"])
          );
        })
        .filter(
          (value: string | null): value is string =>
            Boolean(value),
        );

      if (skills.length > 0) {
        document
          .fontSize(10)
          .font("Helvetica")
          .text(skills.join(" • "));
      }

      document.moveDown(0.7);
    }

    /*
     * ---------------------------------------------------------
     * Projects
     * ---------------------------------------------------------
     */

    if (cv.projects.length > 0) {
      addSectionTitle(document, "Projects");

      for (const item of cv.projects) {
        const project = item as Record<string, unknown>;

        const name = stringValue(project["name"]);
        const description = stringValue(project["description"]);

        if (name) {
          document
            .fontSize(11)
            .font("Helvetica-Bold")
            .text(name);
        }

        if (description) {
          document
            .fontSize(9)
            .font("Helvetica")
            .text(description);
        }

        document.moveDown(0.5);
      }
    }

    /*
     * ---------------------------------------------------------
     * Certifications
     * ---------------------------------------------------------
     */

    if (cv.certifications.length > 0) {
      addSectionTitle(document, "Certifications");

      for (const item of cv.certifications) {
        const certification = item as Record<string, unknown>;

        const name = stringValue(certification["name"]);
        const issuer = stringValue(certification["issuer"]);

        const text = [name, issuer].filter(Boolean).join(" - ");

        if (text) {
          document
            .fontSize(10)
            .font("Helvetica")
            .text(text);
        }
      }

      document.moveDown(0.7);
    }

    /*
     * ---------------------------------------------------------
     * Languages
     * ---------------------------------------------------------
     */

    if (cv.languages.length > 0) {
      addSectionTitle(document, "Languages");

      for (const item of cv.languages) {
        const language = item as Record<string, unknown>;

        const name = stringValue(language["name"]);

        const level =
          stringValue(language["level"]) ??
          stringValue(language["proficiency"]);

        const text = [name, level].filter(Boolean).join(" - ");

        if (text) {
          document
            .fontSize(10)
            .font("Helvetica")
            .text(text);
        }
      }

      document.moveDown(0.7);
    }

    /*
     * ---------------------------------------------------------
     * Finalize PDF
     * ---------------------------------------------------------
     */

    document.end();
  });
}

/**
 * Adds a consistent section heading.
 */
function addSectionTitle(
  document: PDFKit.PDFDocument,
  title: string,
): void {
  document
    .fontSize(13)
    .font("Helvetica-Bold")
    .text(title);

  document
    .moveTo(50, document.y)
    .lineTo(545, document.y)
    .stroke();

  document.moveDown(0.4);
}

/**
 * Safely converts unknown values into strings.
 */
function stringValue(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Formats a start/end date range.
 */
function formatDateRange(
  startDate: unknown,
  endDate: unknown,
  current: unknown,
): string | null {
  const start = formatDate(startDate);

  if (!start) {
    return null;
  }

  if (current === true) {
    return `${start} - Present`;
  }

  const end = formatDate(endDate);

  return end ? `${start} - ${end}` : start;
}

/**
 * Formats ISO date values for the PDF.
 */
function formatDate(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(date);
}