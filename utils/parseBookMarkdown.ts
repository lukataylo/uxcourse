import { Part, Chapter, ChapterSection } from '../types';

function generateId(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 50);
}

function cleanTitle(text: string): string {
  // Remove markdown bold markers and extra whitespace
  return text.replace(/\*\*/g, '').replace(/_/g, '').trim();
}

export function parseBookMarkdown(markdown: string): Part[] {
  const lines = markdown.split('\n');
  const parts: Part[] = [];

  let currentPart: Part | null = null;
  let currentChapter: Chapter | null = null;
  let currentSection: ChapterSection | null = null;
  let chapterNumber = 0;
  let contentBuffer: string[] = [];
  let skipNextLine = false;
  let inTableOfContents = false;

  const flushContent = () => {
    if (currentSection && contentBuffer.length > 0) {
      // Join lines and normalize paragraph breaks
      // Convert single newlines within paragraphs to spaces
      // Keep double newlines as paragraph separators
      const rawContent = contentBuffer.join('\n').trim();

      // Normalize: collapse multiple blank lines to double newline (paragraph break)
      // Then convert remaining single newlines to spaces (same paragraph)
      const normalized = rawContent
        .replace(/\n{3,}/g, '\n\n')  // Collapse 3+ newlines to 2
        .replace(/\n\n/g, '{{PARA}}')  // Temporarily mark paragraph breaks
        .replace(/\n/g, ' ')  // Single newlines become spaces
        .replace(/{{PARA}}/g, '\n\n')  // Restore paragraph breaks
        .replace(/  +/g, ' ');  // Collapse multiple spaces

      currentSection.content = normalized;
      contentBuffer = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1] || '';

    // Skip lines we've already processed
    if (skipNextLine) {
      skipNextLine = false;
      continue;
    }

    // Detect Table of Contents section and skip it
    if (line.includes('Table of Contents') || line.includes('TABLE OF CONTENTS')) {
      inTableOfContents = true;
      continue;
    }

    // Exit Table of Contents when we hit a chapter heading, Introduction, or actual Part header
    if (inTableOfContents) {
      // Actual part headers are just "**PART I**" without the full title
      // TOC entries have "**PART I: FULL TITLE**"
      const isActualPartHeader = /^\*\*PART\s+[IVXLC]+\*\*$/.test(line.trim());
      const isChapterOrIntro = line.startsWith('# ') && /chapter\s+\d+|introduction/i.test(line);

      if (isActualPartHeader || isChapterOrIntro) {
        inTableOfContents = false;
        // Don't continue - process this line
      } else {
        continue; // Skip TOC content
      }
    }

    // Part heading: **PART I** or **PART I: TITLE** (bold on its own line)
    // Also check for pattern like "**PART I**" followed by subtitle on next line
    if (/^\*\*PART\s+[IVXLC]+/.test(line.trim())) {
      flushContent();
      let title = cleanTitle(line);

      // Check if next line is a subtitle (not empty, not a heading)
      if (nextLine && !nextLine.startsWith('#') && !nextLine.startsWith('**') && nextLine.trim()) {
        title = title + ': ' + cleanTitle(nextLine);
        skipNextLine = true;
      }

      currentPart = {
        title: title.toUpperCase(),
        chapters: []
      };
      parts.push(currentPart);
      currentChapter = null;
      currentSection = null;
      continue;
    }

    // Chapter heading: # **Chapter 1: Title** or # Chapter 1: Title
    if (line.startsWith('# ') && /chapter\s+\d+/i.test(line)) {
      flushContent();
      chapterNumber++;
      const fullTitle = cleanTitle(line.substring(2));
      // Extract title without "Chapter N:" prefix
      const titleMatch = fullTitle.match(/^Chapter\s+\d+:\s*(.+)$/i);
      const title = titleMatch ? titleMatch[1] : fullTitle;

      currentChapter = {
        id: `chapter-${chapterNumber}`,
        number: chapterNumber,
        title,
        sections: []
      };

      if (currentPart) {
        currentPart.chapters.push(currentChapter);
      } else {
        // Create a default part if none exists
        currentPart = {
          title: 'CONTENT',
          chapters: []
        };
        parts.push(currentPart);
        currentPart.chapters.push(currentChapter);
      }
      currentSection = null;
      continue;
    }

    // Section heading: ## **Title** or ## Title
    if (line.startsWith('## ')) {
      flushContent();
      const title = cleanTitle(line.substring(3));

      // Skip if this looks like a table of contents entry or intro heading before chapters
      if (!currentChapter) {
        continue;
      }

      currentSection = {
        id: generateId(title),
        title,
        content: ''
      };

      currentChapter.sections.push(currentSection);
      continue;
    }

    // Skip # headings that aren't chapters (like # **Introduction** or # **Table of Contents**)
    if (line.startsWith('# ')) {
      // If it's not a chapter heading and not a part, treat content after it as belonging to current section
      continue;
    }

    // Regular content - only add if we're inside a section
    if (currentSection) {
      contentBuffer.push(line);
    }
  }

  // Flush any remaining content
  flushContent();

  return parts;
}
