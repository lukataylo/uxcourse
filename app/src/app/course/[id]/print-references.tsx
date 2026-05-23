import type { NumberedCitation } from "./print-helpers";

/**
 * Numbered course-wide references section, shown both on screen (replaces the
 * old "Bibliography") and in print. URLs are printed in full because hover
 * tooltips don't exist on paper.
 */
export function References({ items }: { items: NumberedCitation[] }) {
  if (!items.length) return null;
  return (
    <section className="mt-20 pt-10 border-t border-border references-section">
      <h2 className="font-serif text-2xl tracking-tight references-heading">
        References
      </h2>
      <ol className="mt-6 space-y-3 text-sm references-list">
        {items.map((c) => (
          <li key={c.id} id={`ref-${c.number}`} className="references-item">
            <span className="references-number">{c.number}.</span>{" "}
            <span className="references-title">{c.title}</span>
            {c.author ? (
              <span className="references-author"> &mdash; {c.author}</span>
            ) : null}
            {c.sourceType ? (
              <span className="references-source"> &middot; {c.sourceType}</span>
            ) : null}
            <div className="references-url">
              <a
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-foreground"
              >
                {c.url}
              </a>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
