import Link from "next/link";
import { notFound } from "next/navigation";
import { getGeneration } from "@/lib/storage";
import { renderMarkdown } from "@/lib/markdown";
import { CourseActions } from "./course-actions";
import { ResendEmailButton } from "./resend-button";
import { PrintTracker } from "./print-tracker";
import { PrintCover } from "./print-cover";
import { References } from "./print-references";
import { buildCitationMap, injectCitationSuperscripts } from "./print-helpers";
import type { Course, Lesson } from "@/lib/types";

/**
 * A parallel agent is adding `quality_warning` (and possibly other QA fields)
 * to the Lesson type. We read it via this loose accessor so the build keeps
 * passing in both states: present and absent. Treat undefined/empty as "no
 * warning" — don't crash, don't render the note.
 */
function getQualityWarning(lesson: Lesson): string | null {
  const w = (lesson as unknown as { quality_warning?: unknown }).quality_warning;
  if (typeof w === "string" && w.trim()) return w.trim();
  return null;
}

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const gen = await getGeneration(id);
  if (!gen) notFound();
  if (gen.status !== "ready" || !gen.course) {
    return (
      <div className="container py-20 max-w-2xl">
        <h1 className="font-serif text-3xl tracking-tight">
          Your course isn't ready yet.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Hang tight — the generator is still working.
        </p>
        <Link
          href={`/generating/${id}`}
          className="mt-6 inline-flex underline hover:text-foreground"
        >
          Watch progress
        </Link>
      </div>
    );
  }

  const course = gen.course;
  const citationMap = buildCitationMap(course);
  const renderBody = (md: string) =>
    injectCitationSuperscripts(renderMarkdown(md), citationMap);

  return (
    <>
      <PrintTracker generationId={id} />
      <PrintCover course={course} profile={gen.profile} />

      <div className="container py-16 print-container max-w-3xl">
        <header className="mb-12 course-header">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
            Generated course · {course.estimatedHours} hrs total
          </p>
          <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1]">
            {course.title}
          </h1>
          <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
            {course.subtitle}
          </p>
          <div className="mt-6 no-print flex flex-wrap items-center gap-4">
            <CourseActions courseId={course.id} generationId={id} />
            {gen.email ? (
              <ResendEmailButton
                generationId={id}
                emailHint={gen.email}
              />
            ) : null}
          </div>
        </header>

        <section
          className="prose-editorial course-intro"
          dangerouslySetInnerHTML={{ __html: renderBody(course.intro) }}
        />

        <Toc course={course} />

        {course.modules.map((mod) => (
          <section key={mod.id} className="mt-16 course-module">
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-2 module-eyebrow">
              Module
            </p>
            <h2 className="font-serif text-3xl tracking-tight">{mod.title}</h2>
            <p className="mt-3 text-muted-foreground module-summary">
              {mod.summary}
            </p>

            {mod.lessons.map((lesson) => {
              const warning = getQualityWarning(lesson);
              return (
                <article
                  key={lesson.id}
                  id={lesson.id}
                  className="mt-12 pt-10 border-t border-border course-lesson"
                >
                  <h3 className="font-serif text-2xl tracking-tight">
                    {lesson.title}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground lesson-meta">
                    {lesson.summary} · ~{lesson.estimatedMinutes} min
                  </p>

                  {warning ? (
                    <p className="mt-3 text-sm italic text-muted-foreground lesson-quality-warning">
                      This lesson draws on a thinner source base; see the
                      references for what was used.
                    </p>
                  ) : null}

                  <div
                    className="mt-6 lesson-body"
                    dangerouslySetInnerHTML={{ __html: renderBody(lesson.body) }}
                  />

                  {lesson.exercises.length ? (
                    <div className="mt-8 rounded-md border border-border bg-muted/40 p-5 lesson-exercises">
                      <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3 exercises-eyebrow">
                        Exercises
                      </div>
                      <ul className="space-y-3">
                        {lesson.exercises.map((e) => (
                          <li key={e.id} className="exercise-item">
                            <div className="font-medium">{e.prompt}</div>
                            <div className="text-sm text-muted-foreground mt-1">
                              ~{e.estimatedMinutes} min
                              {e.rubric ? ` · ${e.rubric}` : ""}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {lesson.citations.length ? (
                    <div className="mt-6 text-sm lesson-citations">
                      <div className="text-muted-foreground uppercase tracking-[0.18em] text-xs mb-2">
                        Sources
                      </div>
                      <ul className="space-y-1.5">
                        {lesson.citations.map((c) => {
                          const n = citationMap.byId[c.id];
                          return (
                            <li key={c.id}>
                              {n ? (
                                <span className="lesson-cite-num">[{n}]</span>
                              ) : null}{" "}
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noreferrer"
                                className="underline underline-offset-4 hover:text-foreground"
                              >
                                {c.title}
                                {c.author ? ` — ${c.author}` : ""}
                              </a>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>
        ))}

        <References items={citationMap.ordered} />
      </div>
    </>
  );
}

function Toc({ course }: { course: Course }) {
  return (
    <nav className="mt-12 rounded-md border border-border p-6 no-print course-toc">
      <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Contents
      </div>
      <ol className="space-y-3">
        {course.modules.map((m) => (
          <li key={m.id}>
            <div className="font-medium">{m.title}</div>
            <ul className="mt-1 ml-4 space-y-1 text-sm text-muted-foreground">
              {m.lessons.map((l) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="hover:text-foreground">
                    {l.title}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </nav>
  );
}
