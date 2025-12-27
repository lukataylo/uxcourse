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

export function useBookContent() {
  const [content, setContent] = useState<BookContent>(defaultContent);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch('/content/homepage.json').then(res => res.json()) as Promise<HomepageData>,
      fetch('/content/book.md').then(res => res.text()),
      fetch('/content/appendices.json').then(res => res.json()) as Promise<AppendicesData>
    ])
      .then(([homepage, bookMarkdown, appendices]) => {
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
      })
      .catch(err => {
        console.error('Failed to load content:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { content, loading, error };
}
