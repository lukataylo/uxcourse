
export interface ChapterSection {
  id: string;
  title: string;
  content: string;
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  sections: ChapterSection[];
}

export interface Part {
  title: string;
  chapters: Chapter[];
}

export interface Appendix {
  id: string;
  title: string;
  content: string;
}

export interface BookContent {
  title: string;
  subtitle: string;
  description: string;
  intro: string[];
  parts: Part[];
  appendices: Appendix[];
}
