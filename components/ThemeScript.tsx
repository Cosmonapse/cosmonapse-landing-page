import { THEME_STORAGE_KEY } from "./ThemeToggle";

/**
 * Runs before first paint so the stored theme is applied without a flash of
 * the wrong palette. Dark is the default: light mode is strictly opt-in, and
 * the system `prefers-color-scheme` is deliberately not consulted.
 */
const script = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});if(t==="light"){document.documentElement.setAttribute("data-theme","light")}else{document.documentElement.setAttribute("data-theme","dark")}}catch(e){document.documentElement.setAttribute("data-theme","dark")}})();`;

export default function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
