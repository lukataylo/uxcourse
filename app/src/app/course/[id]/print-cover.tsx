import type { Course, LearnerProfile } from "@/lib/types";

/**
 * Print-only cover page. Hidden on screen via `.print-only`, shown as the
 * first page when the document is sent to a printer. Kept as a server
 * component (no client JS) so it ships zero kB to the browser.
 */
export function PrintCover({
  course,
  profile,
}: {
  course: Course;
  profile?: LearnerProfile;
}) {
  const date = new Date(course.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // We don't have a `name` field on LearnerProfile yet (parallel agent is
  // adding profile fields). Fall back to a role-shaped identifier so the
  // cover still feels personal. If nothing is available, skip the line.
  const learner = profile?.role
    ? `Prepared for a ${profile.seniority} ${profile.role}`
    : null;

  return (
    <section className="print-only print-cover" aria-hidden>
      <div className="print-cover-inner">
        <p className="print-cover-eyebrow">uxcourse</p>
        <h1 className="print-cover-title">{course.title}</h1>
        <p className="print-cover-subtitle">
          Custom UX &times; AI course generated on {date}
        </p>
        {learner ? <p className="print-cover-learner">{learner}</p> : null}
        <hr className="print-cover-rule" />
        <p className="print-cover-meta">
          {course.estimatedHours} hours &middot; {course.modules.length} modules
          &middot; {course.modules.reduce((n, m) => n + m.lessons.length, 0)} lessons
        </p>
      </div>
    </section>
  );
}
