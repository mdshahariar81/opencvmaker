import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

type CVSnapshot = {
  cv: {
    title: string;
    slug?: string | null;
  };
  personalInformation?: any;
  summary?: any;
  education?: any[];
  workExperience?: any[];
  skills?: any[];
  projects?: any[];
  certifications?: any[];
  languages?: any[];
  awards?: any[];
  volunteerExperience?: any[];
  publications?: any[];
  conferences?: any[];
  courses?: any[];
  memberships?: any[];
  teachingExperience?: any[];
  leadershipExperience?: any[];
  activities?: any[];
  patents?: any[];
  interests?: any[];
  references?: any[];
  customSections?: any[];
};

function text(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

function addSectionHeading(title: string): Paragraph {
  return new Paragraph({
    text: title,
    heading: HeadingLevel.HEADING_1,
    spacing: {
      before: 240,
      after: 120,
    },
  });
}

function addField(
  label: string,
  value: unknown,
): Paragraph | null {
  const content = text(value);

  if (!content) {
    return null;
  }

  return new Paragraph({
    children: [
      new TextRun({
        text: `${label}: `,
        bold: true,
      }),
      new TextRun(content),
    ],
    spacing: {
      after: 60,
    },
  });
}

function addBullet(value: unknown): Paragraph | null {
  const content = text(value);

  if (!content) {
    return null;
  }

  return new Paragraph({
    text: content,
    bullet: {
      level: 0,
    },
    spacing: {
      after: 60,
    },
  });
}

export async function generateCVDocx(
  snapshot: CVSnapshot,
): Promise<Buffer> {
  const children: Paragraph[] = [];

  /**
   * CV title
   */
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: text(snapshot.cv.title) || "Resume",
          bold: true,
          size: 32,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 240,
      },
    }),
  );

  /**
   * Personal information
   */
  if (snapshot.personalInformation) {
    children.push(
      addSectionHeading("Personal Information"),
    );

    const personal = snapshot.personalInformation;

    const fields = [
      ["Name", personal.fullName],
      ["Email", personal.email],
      ["Phone", personal.phone],
      ["Location", personal.location],
      ["Website", personal.website],
      ["LinkedIn", personal.linkedin],
      ["GitHub", personal.github],
    ];

    for (const [label, value] of fields) {
      const paragraph = addField(label, value);

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Professional summary
   */
  if (snapshot.summary) {
    children.push(
      addSectionHeading("Professional Summary"),
    );

    const summaryText =
      snapshot.summary.content ??
      snapshot.summary.summary ??
      snapshot.summary.description;

    if (summaryText) {
      children.push(
        new Paragraph({
          text: text(summaryText),
          spacing: {
            after: 120,
          },
        }),
      );
    }
  }

  /**
   * Education
   */
  if (snapshot.education?.length) {
    children.push(addSectionHeading("Education"));

    for (const education of snapshot.education) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text:
                text(education.degree) ||
                "Education",
              bold: true,
            }),
          ],
        }),
      );

      const institution = addField(
        "Institution",
        education.institution,
      );

      const field = addField(
        "Field",
        education.field,
      );

      const location = addField(
        "Location",
        education.location,
      );

      const description = addField(
        "Description",
        education.description,
      );

      for (const paragraph of [
        institution,
        field,
        location,
        description,
      ]) {
        if (paragraph) {
          children.push(paragraph);
        }
      }
    }
  }

  /**
   * Work experience
   */
  if (snapshot.workExperience?.length) {
    children.push(
      addSectionHeading("Work Experience"),
    );

    for (const work of snapshot.workExperience) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text:
                text(work.position) ||
                text(work.jobTitle) ||
                "Work Experience",
              bold: true,
            }),
          ],
        }),
      );

      for (const [label, value] of [
        ["Company", work.company],
        ["Location", work.location],
        ["Start Date", work.startDate],
        ["End Date", work.endDate],
        ["Description", work.description],
      ]) {
        const paragraph = addField(label, value);

        if (paragraph) {
          children.push(paragraph);
        }
      }
    }
  }

  /**
   * Skills
   */
  if (snapshot.skills?.length) {
    children.push(addSectionHeading("Skills"));

    for (const skill of snapshot.skills) {
      const paragraph = addBullet(
        skill.name ?? skill.skill ?? skill.title,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Projects
   */
  if (snapshot.projects?.length) {
    children.push(addSectionHeading("Projects"));

    for (const project of snapshot.projects) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text:
                text(project.name) ||
                text(project.title) ||
                "Project",
              bold: true,
            }),
          ],
        }),
      );

      for (const [label, value] of [
        ["Description", project.description],
        ["URL", project.url],
        ["Technologies", project.technologies],
      ]) {
        const paragraph = addField(label, value);

        if (paragraph) {
          children.push(paragraph);
        }
      }
    }
  }

  /**
   * Certifications
   */
  if (snapshot.certifications?.length) {
    children.push(
      addSectionHeading("Certifications"),
    );

    for (const certification of snapshot.certifications) {
      const paragraph = addBullet(
        certification.name ??
          certification.title ??
          certification.issuer,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Languages
   */
  if (snapshot.languages?.length) {
    children.push(
      addSectionHeading("Languages"),
    );

    for (const language of snapshot.languages) {
      const paragraph = addBullet(
        language.name ??
          language.language ??
          language.title,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Awards
   */
  if (snapshot.awards?.length) {
    children.push(addSectionHeading("Awards"));

    for (const award of snapshot.awards) {
      const paragraph = addBullet(
        award.title ??
          award.name ??
          award.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Volunteer experience
   */
  if (snapshot.volunteerExperience?.length) {
    children.push(
      addSectionHeading("Volunteer Experience"),
    );

    for (const item of snapshot.volunteerExperience) {
      const paragraph = addBullet(
        item.organization ??
          item.role ??
          item.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Publications
   */
  if (snapshot.publications?.length) {
    children.push(
      addSectionHeading("Publications"),
    );

    for (const item of snapshot.publications) {
      const paragraph = addBullet(
        item.title ??
          item.name ??
          item.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Conferences
   */
  if (snapshot.conferences?.length) {
    children.push(
      addSectionHeading("Conferences"),
    );

    for (const item of snapshot.conferences) {
      const paragraph = addBullet(
        item.name ??
          item.title ??
          item.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Courses
   */
  if (snapshot.courses?.length) {
    children.push(addSectionHeading("Courses"));

    for (const item of snapshot.courses) {
      const paragraph = addBullet(
        item.name ??
          item.title ??
          item.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Memberships
   */
  if (snapshot.memberships?.length) {
    children.push(
      addSectionHeading("Memberships"),
    );

    for (const item of snapshot.memberships) {
      const paragraph = addBullet(
        item.organization ??
          item.name ??
          item.title,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Teaching experience
   */
  if (snapshot.teachingExperience?.length) {
    children.push(
      addSectionHeading("Teaching Experience"),
    );

    for (const item of snapshot.teachingExperience) {
      const paragraph = addBullet(
        item.institution ??
          item.role ??
          item.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Leadership experience
   */
  if (snapshot.leadershipExperience?.length) {
    children.push(
      addSectionHeading("Leadership Experience"),
    );

    for (const item of snapshot.leadershipExperience) {
      const paragraph = addBullet(
        item.organization ??
          item.role ??
          item.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Extracurricular activities
   */
  if (snapshot.activities?.length) {
    children.push(
      addSectionHeading(
        "Extracurricular Activities",
      ),
    );

    for (const item of snapshot.activities) {
      const paragraph = addBullet(
        item.name ??
          item.title ??
          item.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Patents
   */
  if (snapshot.patents?.length) {
    children.push(addSectionHeading("Patents"));

    for (const item of snapshot.patents) {
      const paragraph = addBullet(
        item.title ??
          item.name ??
          item.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Interests
   */
  if (snapshot.interests?.length) {
    children.push(addSectionHeading("Interests"));

    for (const item of snapshot.interests) {
      const paragraph = addBullet(
        item.name ??
          item.title ??
          item.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * References
   */
  if (snapshot.references?.length) {
    children.push(addSectionHeading("References"));

    for (const item of snapshot.references) {
      const paragraph = addBullet(
        item.name ??
          item.fullName ??
          item.description,
      );

      if (paragraph) {
        children.push(paragraph);
      }
    }
  }

  /**
   * Custom sections
   */
  if (snapshot.customSections?.length) {
    for (const section of snapshot.customSections) {
      const sectionTitle =
        text(section.title) ||
        text(section.name);

      if (sectionTitle) {
        children.push(
          addSectionHeading(sectionTitle),
        );
      }

      const content =
        section.content ??
        section.description;

      if (content) {
        children.push(
          new Paragraph({
            text: text(content),
            spacing: {
              after: 120,
            },
          }),
        );
      }
    }
  }

  /**
   * Build the DOCX document.
   */
  const document = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBuffer(document);
}