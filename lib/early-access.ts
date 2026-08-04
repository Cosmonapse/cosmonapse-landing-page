/**
 * Early Access Program - single source for the route and the intake form.
 *
 * The application form is a Google Form. Replace FORM_URL with the live
 * "Send > link" URL when the form is published; nothing else needs to change,
 * because every CTA on the site reads from here.
 */

/** Root-relative route for the programme page. */
export const EARLY_ACCESS_HREF = "/early-access";

/** Label used by Nav, Footer and the homepage band. */
export const EARLY_ACCESS_LABEL = "Early Access";

/**
 * The Google Form the "Apply" buttons open.
 *
 * TODO: swap in the real form URL. Until then this points at the Google Forms
 * home page so the button is never a dead link.
 */
export const EARLY_ACCESS_FORM_URL = "https://forms.gle/VvTfX1geZa2UhSKH9";

/** True once a real form URL has been wired in. */
export const EARLY_ACCESS_FORM_READY =
  !EARLY_ACCESS_FORM_URL.includes("REPLACE_ME");
