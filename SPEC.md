# HTMD Format Specification

**Version:** 0.1.0 (Draft)  
**Status:** Work in Progress

## 1. Overview

HTMD (HyperText MarkDown) is a dual-layer document format that combines:
- A **Markdown layer** for AI/LLM consumption (inside HTML comments)
- An **HTML layer** for human visual consumption (standard HTML)

Both layers coexist in a single file. Each consumer reads only its own layer.

## 2. File Extension

- Extension: `.htmd`
- MIME type: `text/html` (browsers render it as HTML)
- Encoding: UTF-8

## 3. Block Syntax

### 3.1 MD Block (AI Layer)

MD blocks are enclosed in HTML comments with the `HTMD` delimiter:

```
<!--HTMD
[Markdown content here]
HTMD-->
```

**Rules:**
- Opening tag: `<!--HTMD` (must be on its own line)
- Closing tag: `HTMD-->` (must be on its own line)
- Content between tags is standard Markdown
- Content MUST be in English
- Multiple MD blocks are allowed per file
- MD blocks MUST NOT be nested

### 3.2 HTML Block (Human Layer)

Everything outside of `<!--HTMD ... HTMD-->` blocks is standard HTML.

**Rules:**
- Standard HTML5 syntax
- Language is the target human reader's language
- SHOULD include `<!DOCTYPE html>`, `<html>`, `<head>`, `<body>` tags for a complete document
- Each HTML section SHOULD correspond to an MD block above it

### 3.3 Pairing Convention

MD and HTML blocks SHOULD appear in pairs: MD block first, then its corresponding HTML block.

```html
<!--HTMD
# section_title
- key: value
HTMD-->

<div class="section">
  <h1>섹션 제목</h1>
  <p>값</p>
</div>
```

## 4. Document Structure

A complete HTMD document follows this structure:

```html
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>Document Title</title>
</head>
<body>

<!--HTMD
# document_metadata
- type: report
- version: 1.0
- language: ko
- created: 2026-03-16
- author: hong_gildong
HTMD-->

<!--HTMD
# section_1
- title: introduction
- summary: this section covers the project overview
HTMD-->

<section>
  <h1>소개</h1>
  <p>이 섹션은 프로젝트 개요를 다룹니다.</p>
</section>

<!--HTMD
# section_2
- title: requirements
- items:
  - auth_module_v2
  - payment_api_refactor
  - dashboard_redesign
HTMD-->

<section>
  <h2>요구사항</h2>
  <ul>
    <li>인증 모듈 v2</li>
    <li>결제 API 리팩토링</li>
    <li>대시보드 리디자인</li>
  </ul>
</section>

</body>
</html>
```

## 5. Parsing Rules

### 5.1 For AI Consumers

1. Scan the file for `<!--HTMD` opening tags
2. Extract content between `<!--HTMD` and `HTMD-->`
3. Parse extracted content as Markdown
4. Ignore all content outside MD blocks

### 5.2 For Human Consumers (Browsers)

1. Open the `.htmd` file as HTML
2. Browser automatically ignores `<!--HTMD ... HTMD-->` (HTML comments)
3. Renders remaining HTML normally

## 6. AI Generation Rules

When an AI system creates or updates an HTMD file:

1. **MD is the source of truth** — write/update MD blocks first
2. **Generate HTML from MD** — create the corresponding HTML block in the target language
3. **Maintain pairing** — every MD block should have a corresponding HTML block
4. **MD language is always English** — regardless of the HTML target language
5. **Preserve existing HTML styling** — when updating content, keep CSS classes and structure

## 7. Metadata Block

The first MD block in a document SHOULD be a metadata block:

```
<!--HTMD
# document_metadata
- type: [report | note | spec | manual | letter | ...]
- version: 1.0
- language: [target human language code]
- created: [ISO 8601 date]
- modified: [ISO 8601 date]
- author: [author identifier]
HTMD-->
```

## 8. Reserved Delimiters

| Delimiter | Purpose |
|-----------|--------|
| `<!--HTMD` | Opens an MD block |
| `HTMD-->` | Closes an MD block |

These delimiters are reserved and MUST NOT appear in normal HTML comments or content.

## 9. Versioning

This specification follows [Semantic Versioning](https://semver.org/).

- **0.x.x** — Draft / experimental
- **1.0.0** — First stable release
