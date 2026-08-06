"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface InstallCommand {
  cmd: string;
  /** What the line does, shown dimmed beside it. */
  note?: string;
}

/**
 * The commands that get somebody from this page to a running system.
 *
 * Each row copies itself on click. The command stays real selectable text
 * inside the button, so if the Clipboard API is unavailable - an insecure
 * origin, a browser that refuses the permission - the row is still exactly
 * as useful as a static <pre> would have been. That is the whole fallback:
 * a failed copy does nothing rather than announcing something it did not do.
 */
export default function InstallCommands({
  commands,
  caption,
  center,
}: {
  commands: InstallCommand[];
  caption?: string;
  center?: boolean;
}) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(async (cmd: string) => {
    try {
      await navigator.clipboard.writeText(cmd);
    } catch {
      return;
    }
    setCopied(cmd);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(null), 1800);
  }, []);

  return (
    <div className={`install${center ? " center" : ""}`}>
      <ul className="install-rows">
        {commands.map(({ cmd, note }) => (
          <li key={cmd}>
            <button
              type="button"
              className="install-row"
              data-copied={copied === cmd ? "true" : undefined}
              onClick={() => copy(cmd)}
              aria-label={`Copy ${cmd} to the clipboard`}
            >
              <span className="install-prompt" aria-hidden="true">
                $
              </span>
              <code className="install-cmd">{cmd}</code>
              {note && <span className="install-note">{note}</span>}
              <span className="install-copy" aria-hidden="true">
                {copied === cmd ? "copied" : "copy"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Announced rather than only shown, so the confirmation is not
          exclusive to people watching that corner of the row. */}
      <p className="install-live" role="status" aria-live="polite">
        {copied ? `${copied} copied to the clipboard` : ""}
      </p>

      {caption && <p className="install-caption">{caption}</p>}
    </div>
  );
}
