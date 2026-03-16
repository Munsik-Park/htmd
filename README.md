# HTMD - HyperText MarkDown

A dual-layer document format where **AI reads Markdown** and **humans see rendered HTML** — in a single file.

## Concept

HTMD (`.htmd`) is a file format that embeds two layers in one document:

| Layer | Audience | Language | Role |
|-------|----------|----------|------|
| **MD Block** | AI / LLM | Always English | Source of truth — structured, token-efficient data |
| **HTML Block** | Human | User's language (ko, ja, en, etc.) | Visual presentation — rendered in browser |

The browser renders the HTML and ignores the MD block (HTML comment).  
The AI reads the MD block and ignores the HTML (skips visual noise).

## How It Works

```html
<!--HTMD
# project_status
- id: PRJ-0042
- status: in_progress
- owner: hong_gildong
- deadline: 2026-04-01
- completion: 68%
HTMD-->

<h1>프로젝트 현황</h1>
<p><strong>담당자:</strong> 홍길동</p>
<p><strong>마감일:</strong> 2026년 4월 1일</p>
<p><strong>진행률:</strong> 68%</p>
```

### What each consumer sees:

- **Browser**: Renders `<h1>프로젝트 현황</h1>` and the rest. The `<!--HTMD ... HTMD-->` block is an HTML comment — completely invisible.
- **AI**: Parses only the `<!--HTMD ... HTMD-->` block. Compact English Markdown. Low token cost. High information density.

## Design Principles

1. **MD is the single source of truth.** HTML is always derived from MD.
2. **MD is always in English.** Optimized for AI token efficiency and universal machine readability.
3. **HTML is in the user's language.** Korean, Japanese, English — whatever the human reader needs.
4. **AI generates both layers.** When AI updates MD, it regenerates the corresponding HTML block.
5. **The file extension is `.htmd`.** Opens in any browser as a valid HTML file.

## File Extension

`.htmd` — browsers treat it as HTML (with proper content-type), and AI tooling recognizes the dual-layer convention.

## Quick Start

`.htmd` files must be served over HTTP to render correctly — browsers display them as plain text when opened via `file://`.

### Python (port 8000)

```bash
python3 tools/serve.py
```

Then open [http://localhost:8000/examples/hello.htmd](http://localhost:8000/examples/hello.htmd).

### Node.js (port 3000)

```bash
node tools/serve.js
```

Then open [http://localhost:3000/examples/hello.htmd](http://localhost:3000/examples/hello.htmd).

Both servers serve `.htmd` files with `Content-Type: text/html` so your browser renders them as HTML.

## Project Status

This project is in the **specification phase**. See [SPEC.md](SPEC.md) for the format specification.

## License

[MIT](LICENSE)
