// ---------------------------------------------------------------------------
// Tiny, dependency-free highlighters for the example pages.
//
// They emit the same tk-* spans the hand-written snippets always used, so
// colours still come from the theme tokens in app/globals.css. Pure
// functions of a string: safe on the server and in client components.
// ---------------------------------------------------------------------------

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const span = (cls: string, s: string) => `<span class="tk-${cls}">${esc(s)}</span>`;

const PY_KEYWORDS = new Set(
  (
    "False None True and as assert async await break class continue def del elif else " +
    "except finally for from global if import in is lambda nonlocal not or pass raise " +
    "return try while with yield"
  ).split(" "),
);

const PY_TOKEN = new RegExp(
  [
    String.raw`(#[^\n]*)`, // 1 comment
    String.raw`([rRbBfFuU]{0,2}(?:"""[\s\S]*?"""|'''[\s\S]*?'''))`, // 2 triple string
    String.raw`([rRbBfFuU]{0,2}(?:"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'))`, // 3 string
    String.raw`(@[A-Za-z_][\w.]*)`, // 4 decorator
    String.raw`(\b\d[\d_]*(?:\.\d+)?\b)`, // 5 number
    String.raw`([A-Za-z_]\w*)`, // 6 identifier
    String.raw`(->|[=+\-*/%<>!&|^~]+)`, // 7 operator
  ].join("|"),
  "g",
);

/** Python source -> highlighted HTML. */
export function py(src: string): string {
  let out = "";
  let last = 0;
  let prevWord = "";
  PY_TOKEN.lastIndex = 0;
  for (let m = PY_TOKEN.exec(src); m; m = PY_TOKEN.exec(src)) {
    out += esc(src.slice(last, m.index));
    last = PY_TOKEN.lastIndex;
    const [tok] = m;
    if (m[1]) out += span("cm", tok);
    else if (m[2] || m[3]) out += span("str", tok);
    else if (m[4]) out += span("fn", tok);
    else if (m[5]) out += span("num", tok);
    else if (m[6]) {
      if (PY_KEYWORDS.has(tok)) out += span("kw", tok);
      else if (prevWord === "def" || prevWord === "class" || src[last] === "(")
        out += span("fn", tok);
      else out += esc(tok);
      prevWord = tok;
      continue;
    } else out += span("op", tok);
    prevWord = "";
  }
  return out + esc(src.slice(last));
}

/** Shell session -> highlighted HTML. `$ ` prompts, # comments, flags, quotes. */
export function sh(src: string): string {
  return src
    .split("\n")
    .map((line) => {
      const trimmed = line.trimStart();
      if (trimmed.startsWith("#")) return span("cm", line);
      let body = line;
      let prefix = "";
      const prompt = line.match(/^(\s*)\$ /);
      if (prompt) {
        prefix = esc(prompt[1]) + span("op", "$") + " ";
        body = line.slice(prompt[0].length);
      }
      // split off a trailing "   # comment"
      let comment = "";
      const c = body.match(/\s{2,}#.*$/);
      if (c && c.index !== undefined) {
        comment = span("cm", body.slice(c.index));
        body = body.slice(0, c.index);
      }
      const tokens = body.replace(
        /("(?:\\.|[^"\\])*"|'[^']*')|(^|\s)(--?[A-Za-z][\w-]*)/g,
        (_m, str, ws, flag) => (str ? `\u0001${str}\u0002` : `${ws}\u0003${flag}\u0004`),
      );
      const html = esc(tokens)
        .replace(/\u0001([\s\S]*?)\u0002/g, '<span class="tk-str">$1</span>')
        .replace(/\u0003([\s\S]*?)\u0004/g, '<span class="tk-op">$1</span>');
      return prefix + html + comment;
    })
    .join("\n");
}

/** Plain text (output, trees) -> escaped HTML, # comments dimmed. */
export function plain(src: string): string {
  return src
    .split("\n")
    .map((line) => {
      const c = line.match(/\s{2,}#.*$/);
      if (c && c.index !== undefined)
        return esc(line.slice(0, c.index)) + span("cm", line.slice(c.index));
      return esc(line);
    })
    .join("\n");
}

// ---------------------------------------------------------------------------
// Excerpting Python modules
// ---------------------------------------------------------------------------

/** Drop a leading module docstring (and the blank lines after it). */
export function stripDocstring(src: string): string {
  return src.replace(/^\s*(?:[rRuU]?"""[\s\S]*?"""|[rRuU]?'''[\s\S]*?''')\s*\n/, "").replace(/^\n+/, "");
}

/** Everything before the first line matching `marker`, trimmed. */
export function cutAt(src: string, marker: RegExp): string {
  const lines = src.split("\n");
  const i = lines.findIndex((l) => marker.test(l));
  return (i === -1 ? lines : lines.slice(0, i)).join("\n").replace(/\s+$/, "") + "\n";
}

/**
 * The top-level blocks of a module whose name is in `names`: a def or class
 * (with its decorators) or a top-level assignment. Returned in source order,
 * separated by a blank line, so a page can show "the part that matters".
 */
export function blocks(src: string, names: string[]): string {
  const lines = src.split("\n");
  type Block = { name: string; start: number; end: number };
  const found: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line || /^\s/.test(line) || line.startsWith("#")) {
      i++;
      continue;
    }
    const start = i;
    while (i < lines.length && lines[i].startsWith("@")) {
      // a decorator may span lines until its parens close
      let depth = 0;
      do {
        for (const ch of lines[i]) depth += ch === "(" ? 1 : ch === ")" ? -1 : 0;
        i++;
      } while (depth > 0 && i < lines.length);
    }
    const head = lines[i] ?? "";
    const m =
      head.match(/^(?:async\s+)?def\s+(\w+)/) ||
      head.match(/^class\s+(\w+)/) ||
      head.match(/^(\w+)\s*(?::[^=]+)?=/);
    i++;
    // continuation: indented lines, blank lines followed by indentation, closing brackets
    while (i < lines.length) {
      const l = lines[i];
      if (l === "" ) {
        let j = i;
        while (j < lines.length && lines[j] === "") j++;
        if (j < lines.length && /^\s/.test(lines[j])) {
          i = j;
          continue;
        }
        break;
      }
      if (/^\s/.test(l) || /^[)\]}]/.test(l)) {
        i++;
        continue;
      }
      break;
    }
    if (m) found.push({ name: m[1], start, end: i });
  }
  return (
    found
      .filter((b) => names.includes(b.name))
      .map((b) => lines.slice(b.start, b.end).join("\n").replace(/\s+$/, ""))
      .join("\n\n\n") + "\n"
  );
}

/** A brain.py without its docstring and the shared run boilerplate. */
export function brainBuilders(src: string): string {
  return cutAt(stripDocstring(src), /^def _stop_on_signals/);
}
