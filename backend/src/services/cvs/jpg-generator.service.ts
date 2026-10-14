import sharp from "sharp";

type CVSnapshot = {
  cv: {
    title: string;
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

function escapeXml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function text(value: unknown): string {
  return String(value ?? "").trim();
}

function addText(
  lines: string[],
  value: unknown,
  x: number,
  y: number,
  size = 18,
  weight = 400,
): number {
  const content = text(value);

  if (!content) {
    return y;
  }

  lines.push(
    `<text x="${x}" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="${size}" font-weight="${weight}" fill="#222222">${escapeXml(content)}</text>`,
  );

  return y + size + 12;
}

function addSectionTitle(
  lines: string[],
  title: string,
  y: number,
): number {
  lines.push(
    `<text x="80" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="23" font-weight="700" fill="#111111">${escapeXml(title.toUpperCase())}</text>`,
  );

  y += 12;

  lines.push(
    `<line x1="80" y1="${y}" x2="1160" y2="${y}" stroke="#222222" stroke-width="2"/>`,
  );

  return y + 34;
}

function addField(
  lines: string[],
  label: string,
  value: unknown,
  y: number,
): number {
  const content = text(value);

  if (!content) {
    return y;
  }

  lines.push(
    `<text x="80" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#222222"><tspan font-weight="700">${escapeXml(label)}:</tspan><tspan> ${escapeXml(content)}</tspan></text>`,
  );

  return y + 28;
}

function addBullet(
  lines: string[],
  value: unknown,
  y: number,
): number {
  const content = text(value);

  if (!content) {
    return y;
  }

  lines.push(
    `<text x="95" y="${y}" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#222222">• ${escapeXml(content)}</text>`,
  );

  return y + 28;
}

export async function generateCVJpg(
  snapshot: CVSnapshot,
): Promise<Buffer> {
  const lines: string[] = [];

  let y = 75;

  const personal =
    snapshot.personalInformation;

  const fullName =
    text(personal?.fullName) ||
    text(personal?.name) ||
    "Resume";

  /**
   * Header
   */
  lines.push(
    `<text x="620" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#111111">${escapeXml(fullName)}</text>`,
  );

  y += 55;

  const contact = [
    text(personal?.email),
    text(personal?.phone),
    text(personal?.location),
    text(personal?.website),
    text(personal?.linkedin),
    text(personal?.github),
  ].filter(Boolean);

  if (contact.length) {
    lines.push(
      `<text x="620" y="${y}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="15" fill="#555555">${contact
        .map(escapeXml)
        .join("  |  ")}</text>`,
    );

    y += 35;
  }

  /**
   * Professional Summary
   */
  if (snapshot.summary) {
    const summary =
      snapshot.summary.content ??
      snapshot.summary.summary ??
      snapshot.summary.description;

    if (text(summary)) {
      y = addSectionTitle(
        lines,
        "Professional Summary",
        y,
      );

      y = addText(
        lines,
        summary,
        80,
        y,
        17,
      );

      y += 12;
    }
  }

  /**
   * Education
   */
  if (snapshot.education?.length) {
    y = addSectionTitle(
      lines,
      "Education",
      y,
    );

    for (const education of snapshot.education) {
      y = addText(
        lines,
        education.degree ??
          education.title ??
          "Education",
        80,
        y,
        19,
        700,
      );

      y = addField(
        lines,
        "Institution",
        education.institution,
        y,
      );

      y = addField(
        lines,
        "Field",
        education.field,
        y,
      );

      y = addField(
        lines,
        "Location",
        education.location,
        y,
      );

      y = addField(
        lines,
        "Description",
        education.description,
        y,
      );

      y += 10;
    }
  }

  /**
   * Work Experience
   */
  if (snapshot.workExperience?.length) {
    y = addSectionTitle(
      lines,
      "Work Experience",
      y,
    );

    for (const work of snapshot.workExperience) {
      y = addText(
        lines,
        work.position ??
          work.jobTitle ??
          "Work Experience",
        80,
        y,
        19,
        700,
      );

      y = addField(
        lines,
        "Company",
        work.company,
        y,
      );

      y = addField(
        lines,
        "Location",
        work.location,
        y,
      );

      y = addField(
        lines,
        "Start Date",
        work.startDate,
        y,
      );

      y = addField(
        lines,
        "End Date",
        work.endDate,
        y,
      );

      y = addField(
        lines,
        "Description",
        work.description,
        y,
      );

      y += 10;
    }
  }

  /**
   * Skills
   */
  if (snapshot.skills?.length) {
    y = addSectionTitle(
      lines,
      "Skills",
      y,
    );

    for (const skill of snapshot.skills) {
      y = addBullet(
        lines,
        skill.name ??
          skill.skill ??
          skill.title,
        y,
      );
    }

    y += 10;
  }

  /**
   * Projects
   */
  if (snapshot.projects?.length) {
    y = addSectionTitle(
      lines,
      "Projects",
      y,
    );

    for (const project of snapshot.projects) {
      y = addText(
        lines,
        project.name ??
          project.title ??
          "Project",
        80,
        y,
        19,
        700,
      );

      y = addField(
        lines,
        "Description",
        project.description,
        y,
      );

      y = addField(
        lines,
        "URL",
        project.url,
        y,
      );

      y = addField(
        lines,
        "Technologies",
        project.technologies,
        y,
      );

      y += 10;
    }
  }

  /**
   * Certifications
   */
  if (snapshot.certifications?.length) {
    y = addSectionTitle(
      lines,
      "Certifications",
      y,
    );

    for (const certification of snapshot.certifications) {
      y = addBullet(
        lines,
        certification.name ??
          certification.title ??
          certification.issuer,
        y,
      );
    }

    y += 10;
  }

  /**
   * Languages
   */
  if (snapshot.languages?.length) {
    y = addSectionTitle(
      lines,
      "Languages",
      y,
    );

    for (const language of snapshot.languages) {
      y = addBullet(
        lines,
        language.name ??
          language.language ??
          language.title,
        y,
      );
    }

    y += 10;
  }

  /**
   * Awards
   */
  if (snapshot.awards?.length) {
    y = addSectionTitle(
      lines,
      "Awards",
      y,
    );

    for (const award of snapshot.awards) {
      y = addBullet(
        lines,
        award.title ??
          award.name ??
          award.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * Volunteer Experience
   */
  if (snapshot.volunteerExperience?.length) {
    y = addSectionTitle(
      lines,
      "Volunteer Experience",
      y,
    );

    for (const item of snapshot.volunteerExperience) {
      y = addBullet(
        lines,
        item.organization ??
          item.role ??
          item.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * Publications
   */
  if (snapshot.publications?.length) {
    y = addSectionTitle(
      lines,
      "Publications",
      y,
    );

    for (const item of snapshot.publications) {
      y = addBullet(
        lines,
        item.title ??
          item.name ??
          item.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * Conferences
   */
  if (snapshot.conferences?.length) {
    y = addSectionTitle(
      lines,
      "Conferences",
      y,
    );

    for (const item of snapshot.conferences) {
      y = addBullet(
        lines,
        item.name ??
          item.title ??
          item.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * Courses
   */
  if (snapshot.courses?.length) {
    y = addSectionTitle(
      lines,
      "Courses",
      y,
    );

    for (const item of snapshot.courses) {
      y = addBullet(
        lines,
        item.name ??
          item.title ??
          item.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * Memberships
   */
  if (snapshot.memberships?.length) {
    y = addSectionTitle(
      lines,
      "Memberships",
      y,
    );

    for (const item of snapshot.memberships) {
      y = addBullet(
        lines,
        item.organization ??
          item.name ??
          item.title,
        y,
      );
    }

    y += 10;
  }

  /**
   * Teaching Experience
   */
  if (snapshot.teachingExperience?.length) {
    y = addSectionTitle(
      lines,
      "Teaching Experience",
      y,
    );

    for (const item of snapshot.teachingExperience) {
      y = addBullet(
        lines,
        item.institution ??
          item.role ??
          item.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * Leadership Experience
   */
  if (snapshot.leadershipExperience?.length) {
    y = addSectionTitle(
      lines,
      "Leadership Experience",
      y,
    );

    for (const item of snapshot.leadershipExperience) {
      y = addBullet(
        lines,
        item.organization ??
          item.role ??
          item.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * Extracurricular Activities
   */
  if (snapshot.activities?.length) {
    y = addSectionTitle(
      lines,
      "Extracurricular Activities",
      y,
    );

    for (const item of snapshot.activities) {
      y = addBullet(
        lines,
        item.name ??
          item.title ??
          item.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * Patents
   */
  if (snapshot.patents?.length) {
    y = addSectionTitle(
      lines,
      "Patents",
      y,
    );

    for (const item of snapshot.patents) {
      y = addBullet(
        lines,
        item.title ??
          item.name ??
          item.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * Interests
   */
  if (snapshot.interests?.length) {
    y = addSectionTitle(
      lines,
      "Interests",
      y,
    );

    for (const item of snapshot.interests) {
      y = addBullet(
        lines,
        item.name ??
          item.title ??
          item.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * References
   */
  if (snapshot.references?.length) {
    y = addSectionTitle(
      lines,
      "References",
      y,
    );

    for (const item of snapshot.references) {
      y = addBullet(
        lines,
        item.name ??
          item.fullName ??
          item.description,
        y,
      );
    }

    y += 10;
  }

  /**
   * Custom sections
   */
  if (snapshot.customSections?.length) {
    for (const custom of snapshot.customSections) {
      const title =
        text(custom.title) ||
        text(custom.name);

      const content =
        custom.content ??
        custom.description;

      if (title && text(content)) {
        y = addSectionTitle(
          lines,
          title,
          y,
        );

        y = addText(
          lines,
          content,
          80,
          y,
          17,
        );

        y += 10;
      }
    }
  }

  /**
   * Create a dynamic-height SVG.
   *
   * The width is kept at 1240px so the
   * resulting JPG is suitable for CV preview
   * and download.
   */
  const width = 1240;
  const height = Math.max(
    1754,
    y + 80,
  );

  const svg = `
<svg
  xmlns="http://www.w3.org/2000/svg"
  width="${width}"
  height="${height}"
  viewBox="0 0 ${width} ${height}"
>
  <rect
    width="${width}"
    height="${height}"
    fill="#ffffff"
  />

  ${lines.join("\n")}
</svg>
`;

  /**
   * SVG → JPEG conversion.
   */
  return sharp(
    Buffer.from(svg, "utf8"),
  )
    .jpeg({
      quality: 92,
      chromaSubsampling: "4:4:4",
    })
    .toBuffer();
}