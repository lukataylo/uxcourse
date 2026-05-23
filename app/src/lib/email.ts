/**
 * Email adapter.
 *
 * In MOCK mode (default) sends are logged to stdout and appended to
 * `data/email-log.json`. In real mode (RESEND_API_KEY set + MOCK=false) the
 * adapter would call Resend's HTTP API.
 *
 * Real-mode dependency (NOT yet installed — install when wiring up):
 *   npm install resend
 *
 * Required env vars for real mode:
 *   RESEND_API_KEY   — secret key from resend.com
 *   EMAIL_FROM       — verified sender, e.g. "uxcourse <hello@uxcourse.dev>"
 *   APP_URL          — public base URL, used to build links in the email
 *
 * The point of this module is the *shape*, not the integration. All callers
 * should be able to swap MOCK → real by flipping env vars; no call sites
 * change.
 */

import { appendJsonLog } from "./storage";

export type EmailKind =
  | "course-ready"
  | "refund-confirmation"
  | "refund-approved";

export interface EmailSendResult {
  ok: boolean;
  /** True if this was a logged mock send rather than a real provider call. */
  mock: boolean;
  /** Provider-side id if available. */
  id?: string;
  /** Error message if !ok. */
  error?: string;
}

interface EmailLogEntry {
  to: string;
  kind: EmailKind;
  subject: string;
  body: string;
  sentAt: string;
  mock: boolean;
}

function appUrl(): string {
  return process.env.APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
}

function isMockMode(): boolean {
  // MOCK defaults to "true". Real send requires MOCK=false AND a Resend key.
  const mock = (process.env.MOCK ?? "true") !== "false";
  return mock || !process.env.RESEND_API_KEY;
}

async function deliver(
  to: string,
  kind: EmailKind,
  subject: string,
  body: string,
): Promise<EmailSendResult> {
  const sentAt = new Date().toISOString();
  const mock = isMockMode();

  if (mock) {
    // Console log for dev visibility.
    // eslint-disable-next-line no-console
    console.log(
      `[email:mock] → ${to} · ${kind} · "${subject}"\n${body}\n---`,
    );
    const entry: EmailLogEntry = {
      to,
      kind,
      subject,
      body,
      sentAt,
      mock: true,
    };
    try {
      await appendJsonLog<EmailLogEntry>("email-log.json", entry);
    } catch (err) {
      // Don't let logging failures cascade — emails are best-effort.
      // eslint-disable-next-line no-console
      console.warn("[email:mock] failed to append to email-log.json", err);
    }
    return { ok: true, mock: true, id: `mock_${sentAt}` };
  }

  // Real send path. Behind a guard so the absence of the dep doesn't break
  // typecheck / build. When wiring up, uncomment + `npm install resend`.
  if (process.env.RESEND_API_KEY) {
    try {
      // TODO: uncomment when the Resend SDK is installed.
      // const { Resend } = await import("resend");
      // const resend = new Resend(process.env.RESEND_API_KEY);
      // const res = await resend.emails.send({
      //   from: process.env.EMAIL_FROM ?? "uxcourse <hello@uxcourse.dev>",
      //   to,
      //   subject,
      //   text: body,
      // });
      // if (res.error) {
      //   return { ok: false, mock: false, error: res.error.message };
      // }
      // return { ok: true, mock: false, id: res.data?.id };
      throw new Error(
        "Resend SDK not installed. Run `npm install resend` and uncomment the call site in lib/email.ts.",
      );
    } catch (err) {
      return {
        ok: false,
        mock: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  return { ok: false, mock: false, error: "no provider configured" };
}

export async function sendCourseReady(
  to: string,
  courseId: string,
  courseTitle: string,
): Promise<EmailSendResult> {
  const url = `${appUrl()}/course/${courseId}`;
  const subject = `Your custom course is ready: ${courseTitle}`;
  const body = [
    `Your course is ready to read.`,
    ``,
    `${courseTitle}`,
    `${url}`,
    ``,
    `Download the markdown or print as PDF from the course page. It's yours forever — no login required, just hold on to this link.`,
    ``,
    `— uxcourse`,
  ].join("\n");
  return deliver(to, "course-ready", subject, body);
}

export async function sendRefundConfirmation(
  to: string,
  generationId: string,
): Promise<EmailSendResult> {
  const subject = `We got your refund request`;
  const body = [
    `Thanks — we've received your refund request for course ${generationId}.`,
    ``,
    `We review every request by hand within 24 hours. You'll get a follow-up email once it's processed. If it's been more than a day, just reply to this email.`,
    ``,
    `— uxcourse`,
  ].join("\n");
  return deliver(to, "refund-confirmation", subject, body);
}

export async function sendRefundApproved(
  to: string,
  generationId: string,
): Promise<EmailSendResult> {
  const subject = `Refund approved`;
  const body = [
    `Your refund for course ${generationId} has been approved.`,
    ``,
    `It will appear on the original payment method within 5–10 business days, depending on your bank. The course remains accessible at the link you already have — keep it if it's useful.`,
    ``,
    `— uxcourse`,
  ].join("\n");
  return deliver(to, "refund-approved", subject, body);
}
