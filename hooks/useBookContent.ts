import { useState, useEffect } from 'react';
import { BookContent, Appendix } from '../types';
import { parseBookMarkdown } from '../utils/parseBookMarkdown';

interface HomepageData {
  title: string;
  subtitle: string;
  description: string;
  intro: string[];
}

interface AppendicesData {
  items: Appendix[];
}

const defaultContent: BookContent = {
  title: "Loading...",
  subtitle: "",
  description: "",
  intro: [],
  parts: [],
  appendices: []
};

const LOAD_TIMEOUT_MS = 15000;

async function fetchWithValidation<T>(url: string, parseAs: 'json' | 'text'): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load ${url}: ${res.status} ${res.statusText}`);
  }
  return parseAs === 'json' ? res.json() : res.text();
}

export function useBookContent() {
  const [content, setContent] = useState<BookContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let isCancelled = false;

    const loadContent = async () => {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error('Content loading timed out. Please refresh the page.'));
          }, LOAD_TIMEOUT_MS);
        });

        const fetchPromise = Promise.all([
          fetchWithValidation<HomepageData>('/content/homepage.json', 'json'),
          fetchWithValidation<string>('/content/book.md', 'text'),
          fetchWithValidation<AppendicesData>('/content/appendices.json', 'json')
        ]);

        const [homepage, bookMarkdown, appendices] = await Promise.race([
          fetchPromise,
          timeoutPromise
        ]);

        clearTimeout(timeoutId);

        if (isCancelled) return;

        const parts = parseBookMarkdown(bookMarkdown);

        setContent({
          title: homepage.title,
          subtitle: homepage.subtitle,
          description: homepage.description,
          intro: homepage.intro,
          parts,
          appendices: appendices.items
        });
        setLoading(false);
      } catch (err) {
        if (isCancelled) return;
        console.error('Failed to load content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content. Please try again.');
        setLoading(false);
      }
    };

    loadContent();

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return { content, loading, error };
}
