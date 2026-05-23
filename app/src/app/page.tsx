import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles, Target, ScrollText } from "lucide-react";
import { priceLabel } from "@/lib/stripe";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="container pt-20 pb-24 md:pt-32 md:pb-32">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-6">
            A course, written for one person — you.
          </p>
          <h1 className="font-serif text-5xl md:text-7xl leading-[1.05] tracking-tight text-foreground">
            Custom UX
            <span className="text-accent"> × </span>
            AI courses, generated from the field's best thinking.
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
            Tell us your role, your goals, and how much time you have. We compose a
            course from 200+ public-domain articles, talks, podcasts, and books —
            cited, sequenced, and exercised.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link
              href="/start"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-7 text-base font-medium text-primary-foreground hover:bg-primary/90"
            >
              Build my course <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how"
              className="inline-flex h-12 items-center justify-center rounded-md border border-border px-7 text-base font-medium hover:bg-muted"
            >
              See how it works
            </Link>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            {priceLabel()} one-off. Delivered in minutes. Yours forever.
          </p>
        </div>
      </section>

      {/* Sources strip */}
      <section className="border-y border-border/70 bg-muted/40">
        <div className="container py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground">
            Drawn from
          </p>
          <div className="text-sm text-foreground/80 flex flex-wrap gap-x-6 gap-y-1">
            <span>Nielsen Norman Group</span>
            <span>Anthropic Research</span>
            <span>Andrej Karpathy</span>
            <span>Lilian Weng</span>
            <span>IDEO</span>
            <span>NN/g UX Conference talks</span>
            <span>The Pragmatic Engineer</span>
            <span>+ 200 more</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="container py-24">
        <h2 className="font-serif text-3xl md:text-4xl tracking-tight max-w-2xl">
          A course written for one person — not a cohort, not a curriculum.
        </h2>
        <div className="mt-14 grid md:grid-cols-3 gap-10">
          <Feature
            icon={<Target className="h-5 w-5" />}
            title="1. Tell us who you are"
            body="Role, seniority, current AI usage, focus areas, time budget, and what you want to do in 30 days."
          />
          <Feature
            icon={<Sparkles className="h-5 w-5" />}
            title="2. We compose the course"
            body="A generator weighs every source in our dataset against your profile, then drafts modules, lessons, and exercises with full citations."
          />
          <Feature
            icon={<BookOpen className="h-5 w-5" />}
            title="3. You read, do, and ship"
            body="Read it online, download as markdown or PDF. Every claim links back to its public-domain source."
          />
        </div>
      </section>

      {/* What's inside */}
      <section className="bg-muted/40 border-y border-border/70">
        <div className="container py-24 grid md:grid-cols-2 gap-16 items-start">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4">
              What's inside
            </p>
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">
              A long-form read, an exercise plan, and a bibliography you'll actually
              open.
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Most "AI for designers" content is a sales funnel. This is a craft
              artifact — opinionated, sequenced, cited. Closer to a long essay than
              a video course.
            </p>
          </div>
          <ul className="space-y-5">
            {[
              ["6–10 modules", "Sequenced from where you are to where you want to be."],
              ["20–40 lessons", "Each one ~25 minutes, with a clear takeaway."],
              ["Hands-on exercises", "Sized to your weekly time budget."],
              ["Inline citations", "Every claim links to a public source."],
              ["Downloadable", "Markdown and print-ready PDF."],
            ].map(([title, body]) => (
              <li key={title} className="flex gap-4">
                <ScrollText className="h-5 w-5 mt-1 text-accent shrink-0" />
                <div>
                  <div className="font-medium">{title}</div>
                  <div className="text-sm text-muted-foreground">{body}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="container py-24">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4">
            One price
          </p>
          <h2 className="font-serif text-4xl md:text-5xl tracking-tight">
            {priceLabel()}. Once. Yours.
          </h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            No subscription, no seat licensing, no upsell. One course, generated for
            you, delivered in minutes. If it doesn't land, email us and we'll
            refund — no form to fill.
          </p>
          <Link
            href="/start"
            className="mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-md bg-primary px-8 text-base font-medium text-primary-foreground hover:bg-primary/90"
          >
            Start my course <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-accent/10 text-accent">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
