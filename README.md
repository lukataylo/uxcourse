# UXcourse.com

A modern, static website for presenting "UX Design in the Era of AI" - a comprehensive guide for designers transitioning to AI-enhanced design roles.

## Overview

This project is a React-based static site that renders a digital book with:
- **7 Parts** covering UX design in the AI era
- **22 Chapters** with detailed content
- **4 Appendices** with reference materials
- **Decap CMS** for content management via a visual editor

The site is designed for static hosting (GitHub Pages) with content managed through markdown files.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via CDN)
- **Decap CMS** - Git-based headless CMS
- **react-markdown** - Markdown rendering
- **GitHub Actions** - CI/CD deployment

## Project Structure

```
├── components/
│   ├── Header.tsx       # Site header with navigation
│   ├── Home.tsx         # Homepage with book intro and TOC
│   ├── Sidebar.tsx      # Navigation sidebar with parts/chapters
│   ├── ChapterPage.tsx  # Chapter content renderer
│   └── RightNav.tsx     # In-chapter section navigation
├── hooks/
│   └── useBookContent.ts    # Loads and combines content from JSON/MD files
├── utils/
│   └── parseBookMarkdown.ts # Parses markdown into structured book data
├── public/
│   ├── admin/
│   │   ├── index.html   # Decap CMS entry point
│   │   └── config.yml   # CMS configuration
│   └── content/
│       ├── homepage.json    # Homepage metadata (title, subtitle, intro)
│       ├── book.md          # Full book content in markdown
│       └── appendices.json  # Appendix content
├── types.ts             # TypeScript interfaces
├── App.tsx              # Main app with routing
└── index.tsx            # React entry point
```

## How It Works

### Content Structure

The book content is split into three files for easier management:

1. **`homepage.json`** - Book metadata displayed on the homepage
   - Title, subtitle, description
   - Introduction paragraphs

2. **`book.md`** - Full book content in markdown format
   - Uses heading levels to define structure:
     - `**PART I**` + subtitle line = Part
     - `# **Chapter N: Title**` = Chapter
     - `## **Section Title**` = Section
   - Content supports full markdown (bold, lists, etc.)

3. **`appendices.json`** - Reference materials
   - Array of appendix objects with id, title, and markdown content

### Markdown Parser

The `parseBookMarkdown.ts` utility converts the markdown file into a structured `Part[]` array:

- Detects and skips Table of Contents section
- Extracts parts from `**PART X**` headings
- Extracts chapters from `# **Chapter N: Title**` headings
- Extracts sections from `## **Title**` headings
- Normalizes paragraph breaks for proper rendering
- Cleans bold markers from titles

### Routing

Uses hash-based client-side routing:
- `#/` - Homepage
- `#/chapter/{chapter-id}` - Chapter pages
- `#/appendix/{appendix-id}` - Appendix pages

### CMS Integration

Decap CMS provides a visual editor at `/admin/`:
- Edits content files directly in the Git repository
- No backend required - works with GitHub/GitLab
- Local development proxy for editing without auth

## Development

### Prerequisites

- Node.js 18+
- npm

### Local Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Start CMS proxy (in separate terminal, for local content editing)
npm run dev:cms
```

Then visit:
- **Site**: http://localhost:3000
- **CMS**: http://localhost:3000/admin/

### Build for Production

```bash
npm run build
```

Output is in the `dist/` directory.

## Deployment

The site deploys automatically to GitHub Pages via GitHub Actions:

1. Push to `master` branch triggers the workflow
2. Workflow builds the site with Vite
3. Adds CNAME file for custom domain
4. Deploys to GitHub Pages

### GitHub Pages Setup

1. Go to repository Settings > Pages
2. Set Source to "GitHub Actions"
3. Custom domain (optional): Configure in repository settings

## Content Editing

### Via CMS (Recommended)

1. Go to `https://yoursite.com/admin/`
2. Authenticate with GitHub
3. Edit content in the visual editor
4. Save to commit changes directly to the repo

### Via Markdown

Edit files directly in `public/content/`:
- `homepage.json` for homepage content
- `book.md` for book chapters (follow heading conventions)
- `appendices.json` for appendix content

### Markdown Format for Book Content

```markdown
**PART I**

UNDERSTANDING THE NEW LANDSCAPE

# **Chapter 1: The AI Revolution in UX Design**

Intro paragraph for the chapter...

## **The Shift Toward AI as Co-Designer**

Section content here. Supports **bold**, *italics*, and lists:

- Item one
- Item two

## **Next Section Title**

More content...
```

## License

© 2026 UXcourse.com — All Rights Reserved
