import { submitProfile } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { priceLabel } from "@/lib/stripe";

const FOCUS_AREAS: Array<{ value: string; label: string; hint: string }> = [
  { value: "ai-fundamentals-for-designers", label: "AI fundamentals", hint: "Models, capabilities, limits" },
  { value: "prompting-and-instruction-design", label: "Prompting & instruction design", hint: "Treating prompts as UX" },
  { value: "ai-ux-patterns", label: "AI UX patterns", hint: "What's working in shipped products" },
  { value: "evaluation-and-eval-design", label: "Evals", hint: "Knowing if your AI feature is good" },
  { value: "agentic-interfaces", label: "Agentic interfaces", hint: "Multi-step, tool-using systems" },
  { value: "multimodal-and-voice", label: "Multimodal & voice", hint: "Beyond the chat box" },
  { value: "ethics-and-safety", label: "Ethics & safety", hint: "Practical, not preachy" },
  { value: "research-with-ai", label: "Research with AI", hint: "Synthesis, interviews, analysis" },
  { value: "design-systems-and-ai", label: "Design systems & AI", hint: "Components, tokens, generation" },
  { value: "rapid-prototyping-with-ai", label: "Rapid prototyping", hint: "v0, Cursor, Figma Make" },
];

const AI_USAGE: Array<{ value: string; label: string }> = [
  { value: "none", label: "Barely use it" },
  { value: "chatgpt-casual", label: "ChatGPT, casually" },
  { value: "copilot-daily", label: "Copilot / Cursor daily" },
  { value: "prompt-engineering", label: "I write structured prompts" },
  { value: "agents", label: "I build with agents" },
  { value: "model-fine-tuning", label: "I fine-tune or train" },
];

export default function StartPage() {
  return (
    <div className="container py-16 max-w-2xl">
      <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-3">
        Profile
      </p>
      <h1 className="font-serif text-4xl md:text-5xl tracking-tight">
        Tell us who you are.
      </h1>
      <p className="mt-4 text-muted-foreground leading-relaxed">
        Takes ~2 minutes. The more honest you are, the better the course. After
        this you'll be sent to checkout ({priceLabel()}), then to your course.
      </p>

      <form action={submitProfile} className="mt-12 space-y-10">
        <Field
          label="Email"
          hint="Where we send your course link and any refund correspondence."
        >
          <Input
            name="email"
            type="email"
            required
            placeholder="you@work.com"
            autoComplete="email"
          />
        </Field>

        <Field label="Your role" hint="e.g. Senior product designer, design engineer, design manager">
          <Input
            name="role"
            required
            placeholder="Senior product designer"
            autoComplete="organization-title"
          />
        </Field>

        <Field label="Seniority">
          <RadioGroup name="seniority" defaultValue="senior" className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {(["junior", "mid", "senior", "lead", "principal"] as const).map((s) => (
              <label
                key={s}
                className="flex items-center gap-2 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-muted text-sm capitalize"
              >
                <RadioGroupItem value={s} />
                {s}
              </label>
            ))}
          </RadioGroup>
        </Field>

        <Field label="How do you use AI today?" hint="Select any that apply.">
          <div className="grid sm:grid-cols-2 gap-2">
            {AI_USAGE.map((u) => (
              <label
                key={u.value}
                className="flex items-center gap-3 rounded-md border border-border px-3 py-2.5 cursor-pointer hover:bg-muted text-sm"
              >
                <Checkbox name="aiUsage" value={u.value} />
                {u.label}
              </label>
            ))}
          </div>
        </Field>

        <Field
          label="Focus areas"
          hint="Pick 2–4. The course will be weighted toward these."
        >
          <div className="grid sm:grid-cols-2 gap-2">
            {FOCUS_AREAS.map((f) => (
              <label
                key={f.value}
                className="flex items-start gap-3 rounded-md border border-border px-3 py-2.5 cursor-pointer hover:bg-muted"
              >
                <Checkbox name="focusAreas" value={f.value} className="mt-1" />
                <div>
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.hint}</div>
                </div>
              </label>
            ))}
          </div>
        </Field>

        <div className="grid sm:grid-cols-2 gap-8">
          <Field label="Hours per week" hint="Be realistic. We'll size exercises to fit.">
            <Input
              name="timeBudgetHours"
              type="number"
              min={1}
              max={40}
              defaultValue={4}
              required
            />
          </Field>

          <Field label="Learning style">
            <RadioGroup name="learningStyle" defaultValue="mixed" className="grid grid-cols-2 gap-2">
              {(["reading", "watching", "doing", "discussing", "mixed"] as const).map((s) => (
                <label
                  key={s}
                  className="flex items-center gap-2 rounded-md border border-border px-3 py-2 cursor-pointer hover:bg-muted text-sm capitalize"
                >
                  <RadioGroupItem value={s} />
                  {s}
                </label>
              ))}
            </RadioGroup>
          </Field>
        </div>

        <Field label="Portfolio URL" hint="Optional — helps tune examples to your context.">
          <Input
            name="portfolioUrl"
            type="url"
            placeholder="https://"
            autoComplete="url"
          />
        </Field>

        <Field
          label="What do you want to be able to do in 30 days?"
          hint="Optional, but it sharpens the course. One or two sentences is plenty."
        >
          <Textarea
            name="goal30Days"
            placeholder="Ship a working AI feature in our product that users actually use."
            rows={4}
          />
        </Field>

        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between border-t border-border">
          <p className="text-sm text-muted-foreground">
            Next: checkout ({priceLabel()}), then we generate your course.
          </p>
          <Button type="submit" size="lg">
            Continue to checkout
          </Button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base">{label}</Label>
        {hint ? (
          <p className="text-sm text-muted-foreground mt-1">{hint}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
