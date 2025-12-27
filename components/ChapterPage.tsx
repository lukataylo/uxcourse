
import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Chapter } from '../types';
import RightNav from './RightNav';

interface ChapterPageProps {
  chapter: Chapter;
  allChapters: Chapter[];
}

const ChapterPage: React.FC<ChapterPageProps> = ({ chapter, allChapters }) => {
  const [activeSection, setActiveSection] = useState(chapter.sections[0]?.id || '');
  const sectionRefs = useRef<{[key: string]: HTMLElement | null}>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Find navigation info
  const currentIndex = allChapters.findIndex(c => c.id === chapter.id);
  const prevChapter = currentIndex > 0 ? allChapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;

  useEffect(() => {
    // 1. Reset initial scroll
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    
    // 2. Set initial active section
    setActiveSection(chapter.sections[0]?.id || '');

    // 3. Create observer
    // Removing the explicit 'root' makes it more reliable across different viewport/container states
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries.find(e => e.isIntersecting);
        if (visibleEntry) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      { 
        threshold: 0.2,
        rootMargin: '-10% 0px -40% 0px' 
      }
    );

    // 4. Observe elements
    const currentRefs = sectionRefs.current;
    chapter.sections.forEach(section => {
      const el = currentRefs[section.id];
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [chapter]);

  return (
    <div className="flex h-full w-full overflow-hidden">
      <main 
        ref={scrollContainerRef} 
        className="flex-1 overflow-y-auto custom-scrollbar bg-white scroll-smooth relative"
      >
        <div className="max-w-3xl mx-auto px-6 py-24 md:py-32">
          {/* Chapter Header */}
          <div className="mb-32 animate-fade-in">
            <div className="flex items-center gap-4 mb-8">
              <span className="text-[#ff8c00] font-black text-[10px] tracking-[0.2em] uppercase border-2 border-[#ff8c00] px-3 py-1 rounded-none">
                Chapter {chapter.number}
              </span>
              <div className="h-[1px] flex-1 bg-zinc-100" />
            </div>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-12 uppercase">
              {chapter.title}
            </h1>
            <div className="w-24 h-4 bg-zinc-900" />
          </div>

          {/* Chapter Content */}
          <div className="space-y-40 mb-56">
            {chapter.sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                ref={(el) => { sectionRefs.current[section.id] = el; }}
                className="scroll-mt-24 group"
              >
                <div className="flex items-center gap-6 mb-12">
                   <div className="w-2 h-2 bg-[#ff8c00] rounded-none group-hover:rotate-45 transition-transform duration-500" />
                   <h2 className="text-4xl font-black tracking-tight uppercase leading-none">{section.title}</h2>
                </div>
                
                <div className="prose prose-zinc lg:prose-xl max-w-none [&>p]:text-xl [&>p]:leading-relaxed [&>p]:text-zinc-600 [&>p]:mb-8 [&>p]:font-medium [&>p]:mt-0 [&_strong]:text-zinc-900 [&>ul]:text-zinc-600 [&>ul]:mb-8 [&_li]:text-xl [&_li]:leading-relaxed [&_li]:mb-2">
                  <ReactMarkdown>{section.content}</ReactMarkdown>
                </div>
              </section>
            ))}
          </div>

          {/* Chapter Footer Navigation */}
          <div className="pt-32 border-t border-zinc-100 mb-32">
            <div className="flex flex-col md:flex-row gap-12 items-center justify-between">
              <div className="flex flex-col gap-4 text-center md:text-left">
                 <span className="text-[10px] font-black text-zinc-300 uppercase tracking-[0.3em]">Up Next</span>
                 {nextChapter ? (
                    <a href={`#/chapter/${nextChapter.id}`} className="text-3xl md:text-4xl font-black hover:text-[#ff8c00] transition-all tracking-tighter uppercase group flex items-center gap-4">
                      <span className="group-hover:translate-x-2 transition-transform">{nextChapter.number}. {nextChapter.title}</span>
                      <span className="text-[#ff8c00]">→</span>
                    </a>
                 ) : (
                    <span className="text-4xl font-black text-zinc-200 uppercase tracking-tighter">End of Manuscript</span>
                 )}
              </div>
              
              <div className="flex gap-6 w-full md:w-auto">
                {prevChapter && (
                  <a 
                    href={`#/chapter/${prevChapter.id}`} 
                    className="flex-1 md:flex-none text-center text-[10px] font-black tracking-widest uppercase px-10 py-5 border-2 border-zinc-900 hover:bg-zinc-900 hover:text-white transition-all shadow-md hover:shadow-xl"
                  >
                    Back
                  </a>
                )}
                {nextChapter && (
                  <a 
                    href={`#/chapter/${nextChapter.id}`} 
                    className="flex-1 md:flex-none text-center text-[10px] font-black tracking-widest uppercase px-10 py-5 bg-[#ff8c00] text-white hover:bg-black transition-all shadow-lg shadow-orange-100 hover:shadow-zinc-200"
                  >
                    Continue
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <RightNav sections={chapter.sections} activeSectionId={activeSection} />
    </div>
  );
};

export default ChapterPage;
