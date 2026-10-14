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

function escapeHtml(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clean(value: unknown): string {
  return String(value ?? "").trim();
}

function section(
  title: string,
  content: string,
): string {
  if (!content.trim()) {
    return "";
  }

  return `
    <div class="section">
      <h2>${escapeHtml(title)}</h2>
      ${content}
    </div>
  `;
}

function field(
  label: string,
  value: unknown,
): string {
  const content = clean(value);

  if (!content) {
    return "";
  }

  return `
    <div class="field">
      <strong>${escapeHtml(label)}:</strong>
      ${escapeHtml(content)}
    </div>
  `;
}

function item(
  title: unknown,
  details: string,
): string {
  const heading = clean(title);

  return `
    <div class="item">
      ${
        heading
          ? `<h3>${escapeHtml(heading)}</h3>`
          : ""
      }
      ${details}
    </div>
  `;
}

export async function generateCVJpg(
  snapshot: CVSnapshot,
): Promise<Buffer> {
  const personal =
    snapshot.personalInformation;

  const fullName =
    clean(personal?.fullName) ||
    clean(personal?.name) ||
    "Resume";

  const contact = [
    clean(personal?.email),
    clean(personal?.phone),
    clean(personal?.location),
    clean(personal?.website),
    clean(personal?.linkedin),
    clean(personal?.github),
  ].filter(Boolean);

  let html = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />

<style>
  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    padding: 0;
    background: #ffffff;
    color: #222222;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 18px;
    line-height: 1.5;
  }

  .page {
    width: 794px;
    min-height: 1123px;
    padding: 58px 64px;
    background: #ffffff;
  }

  .header {
    text-align: center;
    margin-bottom: 30px;
  }

  .name {
    margin: 0 0 8px;
    font-size: 38px;
    line-height: 1.15;
    font-weight: 700;
  }

  .contact {
    color: #555555;
    font-size: 15px;
    line-height: 1.7;
  }

  .section {
    margin-top: 26px;
  }

  .section h2 {
    margin: 0 0 12px;
    padding-bottom: 6px;
    border-bottom: 2px solid #222222;
    font-size: 21px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .field {
    margin: 4px 0;
  }

  .item {
    margin-bottom: 16px;
  }

  .item h3 {
    margin: 0 0 5px;
    font-size: 18px;
  }

  .description {
    margin: 4px 0;
  }

  ul {
    margin: 5px 0 0 20px;
    padding: 0;
  }

  li {
    margin-bottom: 4px;
  }
</style>
</head>

<body>
  <div class="page">

    <div class="header">
      <h1 class="name">
        ${escapeHtml(fullName)}
      </h1>

      ${
        contact.length
          ? `<div class="contact">
              ${contact
                .map(escapeHtml)
                .join(" &nbsp; | &nbsp; ")}
            </div>`
          : ""
      }
    </div>
  `;

  /**
   * Professional summary
   */
  if (snapshot.summary) {
    const summary =
      snapshot.summary.content ??
      snapshot.summary.summary ??
      snapshot.summary.description;

    html += section(
      "Professional Summary",
      `<div class="description">
        ${escapeHtml(summary)}
      </div>`,
    );
  }

  /**
   * Education
   */
  if (snapshot.education?.length) {
    const content = snapshot.education
      .map((education) =>
        item(
          education.degree ??
            education.title ??
            "Education",
          [
            field(
              "Institution",
              education.institution,
            ),
            field(
              "Field",
              education.field,
            ),
            field(
              "Location",
              education.location,
            ),
            field(
              "Description",
              education.description,
            ),
          ].join(""),
        ),
      )
      .join("");

    html += section(
      "Education",
      content,
    );
  }

  /**
   * Work experience
   */
  if (snapshot.workExperience?.length) {
    const content = snapshot.workExperience
      .map((work) =>
        item(
          work.position ??
            work.jobTitle ??
            "Work Experience",
          [
            field("Company", work.company),
            field("Location", work.location),
            field("Start Date", work.startDate),
            field("End Date", work.endDate),
            field("Description", work.description),
          ].join(""),
        ),
      )
      .join("");

    html += section(
      "Work Experience",
      content,
    );
  }

  /**
   * Skills
   */
  if (snapshot.skills?.length) {
    const content = `
      <ul>
        ${snapshot.skills
          .map(
            (skill) =>
              `<li>${escapeHtml(
                skill.name ??
                  skill.skill ??
                  skill.title,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Skills",
      content,
    );
  }

  /**
   * Projects
   */
  if (snapshot.projects?.length) {
    const content = snapshot.projects
      .map((project) =>
        item(
          project.name ??
            project.title ??
            "Project",
          [
            field(
              "Description",
              project.description,
            ),
            field("URL", project.url),
            field(
              "Technologies",
              project.technologies,
            ),
          ].join(""),
        ),
      )
      .join("");

    html += section(
      "Projects",
      content,
    );
  }

  /**
   * Certifications
   */
  if (snapshot.certifications?.length) {
    const content = `
      <ul>
        ${snapshot.certifications
          .map(
            (certification) =>
              `<li>${escapeHtml(
                certification.name ??
                  certification.title ??
                  certification.issuer,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Certifications",
      content,
    );
  }

  /**
   * Languages
   */
  if (snapshot.languages?.length) {
    const content = `
      <ul>
        ${snapshot.languages
          .map(
            (language) =>
              `<li>${escapeHtml(
                language.name ??
                  language.language ??
                  language.title,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Languages",
      content,
    );
  }

  /**
   * Awards
   */
  if (snapshot.awards?.length) {
    const content = `
      <ul>
        ${snapshot.awards
          .map(
            (award) =>
              `<li>${escapeHtml(
                award.title ??
                  award.name ??
                  award.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Awards",
      content,
    );
  }

  /**
   * Volunteer experience
   */
  if (snapshot.volunteerExperience?.length) {
    const content = `
      <ul>
        ${snapshot.volunteerExperience
          .map(
            (itemData) =>
              `<li>${escapeHtml(
                itemData.organization ??
                  itemData.role ??
                  itemData.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Volunteer Experience",
      content,
    );
  }

  /**
   * Publications
   */
  if (snapshot.publications?.length) {
    const content = `
      <ul>
        ${snapshot.publications
          .map(
            (publication) =>
              `<li>${escapeHtml(
                publication.title ??
                  publication.name ??
                  publication.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Publications",
      content,
    );
  }

  /**
   * Conferences
   */
  if (snapshot.conferences?.length) {
    const content = `
      <ul>
        ${snapshot.conferences
          .map(
            (conference) =>
              `<li>${escapeHtml(
                conference.name ??
                  conference.title ??
                  conference.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Conferences",
      content,
    );
  }

  /**
   * Courses
   */
  if (snapshot.courses?.length) {
    const content = `
      <ul>
        ${snapshot.courses
          .map(
            (course) =>
              `<li>${escapeHtml(
                course.name ??
                  course.title ??
                  course.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Courses",
      content,
    );
  }

  /**
   * Memberships
   */
  if (snapshot.memberships?.length) {
    const content = `
      <ul>
        ${snapshot.memberships
          .map(
            (membership) =>
              `<li>${escapeHtml(
                membership.organization ??
                  membership.name ??
                  membership.title,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Memberships",
      content,
    );
  }

  /**
   * Teaching experience
   */
  if (snapshot.teachingExperience?.length) {
    const content = `
      <ul>
        ${snapshot.teachingExperience
          .map(
            (teaching) =>
              `<li>${escapeHtml(
                teaching.institution ??
                  teaching.role ??
                  teaching.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Teaching Experience",
      content,
    );
  }

  /**
   * Leadership experience
   */
  if (snapshot.leadershipExperience?.length) {
    const content = `
      <ul>
        ${snapshot.leadershipExperience
          .map(
            (leadership) =>
              `<li>${escapeHtml(
                leadership.organization ??
                  leadership.role ??
                  leadership.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Leadership Experience",
      content,
    );
  }

  /**
   * Extracurricular activities
   */
  if (snapshot.activities?.length) {
    const content = `
      <ul>
        ${snapshot.activities
          .map(
            (activity) =>
              `<li>${escapeHtml(
                activity.name ??
                  activity.title ??
                  activity.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Extracurricular Activities",
      content,
    );
  }

  /**
   * Patents
   */
  if (snapshot.patents?.length) {
    const content = `
      <ul>
        ${snapshot.patents
          .map(
            (patent) =>
              `<li>${escapeHtml(
                patent.title ??
                  patent.name ??
                  patent.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Patents",
      content,
    );
  }

  /**
   * Interests
   */
  if (snapshot.interests?.length) {
    const content = `
      <ul>
        ${snapshot.interests
          .map(
            (interest) =>
              `<li>${escapeHtml(
                interest.name ??
                  interest.title ??
                  interest.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "Interests",
      content,
    );
  }

  /**
   * References
   */
  if (snapshot.references?.length) {
    const content = `
      <ul>
        ${snapshot.references
          .map(
            (reference) =>
              `<li>${escapeHtml(
                reference.name ??
                  reference.fullName ??
                  reference.description,
              )}</li>`,
          )
          .join("")}
      </ul>
    `;

    html += section(
      "References",
      content,
    );
  }

  /**
   * Custom sections
   */
  if (snapshot.customSections?.length) {
    for (const custom of snapshot.customSections) {
      const title =
        clean(custom.title) ||
        clean(custom.name);

      const content =
        custom.content ??
        custom.description;

      if (title && content) {
        html += section(
          title,
          `<div class="description">
            ${escapeHtml(content)}
          </div>`,
        );
      }
    }
  }

  html += `
  </div>
</body>
</html>
  `;

  /**
   * Convert the HTML CV into a JPEG image.
   */
  return sharp(
    Buffer.from(html, "utf-8"),
  )
    .jpeg({
      quality: 92,
    })
    .toBuffer();
}