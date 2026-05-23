import Link from "next/link";
import { notFound } from "next/navigation";
import { getGeneration } from "@/lib/storage";
import { renderMarkdown } from "@/lib/markdown";
import { CourseActions } from "./course-actions";
import type { Course } from "@/lib/types";

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

  return (
    <div className="container py-16 print-container max-w-3xl">
      <header className="mb-12">
        <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
          Generated course · {course.estimatedHours} hrs total
        </p>
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight leading-[1.1]">
          {course.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
          {course.subtitle}
        </p>
        <div className="mt-6 no-print">
          <CourseActions courseId={course.id} generationId={id} />
        </div>
      </header>

      <section
        className="prose-editorial"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(course.intro) }}
      />

      <Toc course={course} />

      {course.modules.map((mod) => (
        <section key={mod.id} className="mt-16">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Module
          </p>
          <h2 className="font-serif text-3xl tracking-tight">{mod.title}</h2>
          <p className="mt-3 text-muted-foreground">{mod.summary}</p>

          {mod.lessons.map((lesson) => (
            <article
              key={lesson.id}
              id={lesson.id}
              className="mt-12 pt-10 border-t border-border"
            >
              <h3 className="font-serif text-2xl tracking-tight">{lesson.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {lesson.summary} · ~{lesson.estimatedMinutes} min
              </p>
              <div
                className="mt-6"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(lesson.body) }}
              />

              {lesson.exercises.length ? (
                <div className="mt-8 rounded-md border border-border bg-muted/40 p-5">
                  <div className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
                    Exercises
                  </div>
                  <ul className="space-y-3">
                    {lesson.exercises.map((e) => (
                      <li key={e.id}>
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
                <div className="mt-6 text-sm">
                  <div className="text-muted-foreground uppercase tracking-[0.18em] text-xs mb-2">
                    Citations
                  </div>
                  <ul className="space-y-1.5">
                    {lesson.citations.map((c) => (
                      <li key={c.id}>
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
                    ))}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
        </section>
      ))}

      {course.bibliography.length ? (
        <section className="mt-20 pt-10 border-t border-border">
          <h2 className="font-serif text-2xl tracking-tight">Bibliography</h2>
          <ul className="mt-6 space-y-2 text-sm">
            {course.bibliography.map((c) => (
              <li key={c.id}>
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
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Toc({ course }: { course: Course }) {
  return (
    <nav className="mt-12 rounded-md border border-border p-6 no-print">
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
