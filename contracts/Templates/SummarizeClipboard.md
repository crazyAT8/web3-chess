<%*
/**

* Grabs the clipboard (your AI response), calls the user script, and writes
* a clean note with frontmatter, a summary/outline, and the full text below.
 */
const input = await tp.system.clipboard();
if (!input || !input.trim()) {
  tR += "⚠️ Clipboard is empty. Copy an AI response first.";
} else {
  const summary = await tp.user.gpt_summary(tp, {
    text: input,
    style: "outline",   // "summary" | "outline" | "bullets"
    bullets: 8,         // used when style="bullets"
    // model: "gpt-4o-mini", // optionally override per note
  });

const title = tp.date.now("YYYY-MM-DD HH:mm") + " — AI Summary";
  tR += `---
tags: [ai, summary]
source: clipboard
created: ${tp.date.now("YYYY-MM-DD HH:mm")}
---

# ${title}

## Summary

${summary}

---

## Full text

${input}
`;
}
-%>
