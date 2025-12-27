
import React from 'react';
import { BookContent } from '../types';

interface HomeProps {
  content: BookContent;
}

const Home: React.FC<HomeProps> = ({ content }) => {
  const scrollToToc = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('toc')?.scrollIntoView({ behavior: 'smooth' });
    // Update hash without triggering a full route change that breaks our App logic
    window.history.pushState(null, '', '#toc');
  };

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-24 border-b border-zinc-100">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          <div className="lg:col-span-8 animate-fade-in">
            <h2 className="text-[#ff8c00] font-black tracking-[0.25em] uppercase text-[10px] mb-6 flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[#ff8c00]"></span>
              {content.subtitle}
            </h2>
            <h1 className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] mb-12 uppercase">
              UX DESIGN<br />
              <span className="text-zinc-200">IN THE ERA</span><br />
              OF AI
            </h1>
            <p className="text-2xl text-zinc-500 leading-relaxed mb-12 max-w-2xl font-medium italic">
              "{content.description}"
            </p>
            <div className="flex flex-wrap gap-6">
              <a href="#/chapter/chapter-1" className="px-10 py-5 bg-[#ff8c00] text-white font-black uppercase text-xs tracking-widest hover:bg-black transition-all transform hover:-translate-y-1 shadow-lg shadow-orange-100 hover:shadow-zinc-200">
                Start Reading Now
              </a>
              <button 
                onClick={scrollToToc}
                className="px-10 py-5 border-2 border-zinc-900 font-black uppercase text-xs tracking-widest hover:bg-zinc-900 hover:text-white transition-all transform hover:-translate-y-1"
              >
                Chapter Breakdown
              </button>
            </div>
          </div>
          
          <div className="lg:col-span-4 hidden lg:block sticky top-32">
             <div className="bg-zinc-50 border border-zinc-100 p-12 relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 text-zinc-100 text-[180px] font-black leading-none select-none group-hover:text-[#ff8c00] group-hover:opacity-10 transition-all">UX</div>
                <p className="text-[10px] font-black tracking-widest text-zinc-400 mb-12 uppercase">Internal Manuscript v1.0</p>
                <div className="space-y-6 relative z-10">
                   <div className="h-2 w-16 bg-zinc-900" />
                   <h3 className="text-2xl font-bold tracking-tight">Master the tools that are reshaping our industry.</h3>
                   <div className="flex flex-col gap-2">
                      <div className="h-[1px] w-full bg-zinc-200" />
                      <div className="h-[1px] w-3/4 bg-zinc-200" />
                      <div className="h-[1px] w-1/2 bg-zinc-200" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="bg-zinc-50 py-32 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto px-6">
           <div className="grid gap-12">
              {content.intro.map((para, i) => (
                <p key={i} className="text-3xl font-medium text-zinc-800 leading-tight tracking-tight">
                  {para}
                </p>
              ))}
           </div>
        </div>
      </section>

      {/* Chapter Breakdown Section */}
      <section id="toc" className="max-w-7xl mx-auto px-6 py-32 scroll-mt-20">
        <div className="mb-24">
          <h2 className="text-xs font-black tracking-[0.3em] text-[#ff8c00] uppercase mb-4">Table of Contents</h2>
          <h3 className="text-6xl font-black tracking-tighter uppercase">The Detailed Breakdown</h3>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-24">
          {content.parts.map((part, pIdx) => (
            <div key={pIdx} className="space-y-10">
              <h4 className="text-[10px] font-black tracking-[0.25em] text-zinc-400 uppercase pb-4 border-b border-zinc-100">
                {part.title}
              </h4>
              <ul className="space-y-12">
                {part.chapters.map((chapter) => (
                  <li key={chapter.id} className="group">
                    <a href={`#/chapter/${chapter.id}`} className="block">
                      <div className="flex gap-6 items-start">
                        <span className="text-4xl font-black text-zinc-100 group-hover:text-[#ff8c00] transition-colors leading-none pt-1 flex-shrink-0 w-12">
                          {chapter.number.toString().padStart(2, '0')}
                        </span>
                        <div className="border-l border-zinc-100 pl-6 group-hover:border-[#ff8c00] transition-colors">
                          <h5 className="font-black text-xl group-hover:text-[#ff8c00] transition-colors mb-3 leading-tight tracking-tight uppercase">
                            {chapter.title}
                          </h5>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                              {chapter.sections.length} Key Lessons
                            </span>
                            <div className="w-1 h-1 bg-zinc-200 rounded-full" />
                            <span className="text-[10px] font-black text-[#ff8c00] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                              Read Chapter →
                            </span>
                          </div>
                        </div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Meta */}
      <footer className="bg-zinc-900 py-32 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
           <h2 className="text-5xl font-black tracking-tighter mb-12 uppercase">Transition to AI-First Design</h2>
           <p className="text-zinc-500 max-w-2xl mx-auto text-lg mb-16 font-medium">
             This guide is a living document, updated monthly as AI tools and methodologies evolve. Join over 5,000 designers who are defining the next era of user experience.
           </p>
           <div className="flex justify-center gap-8">
              <div className="text-left">
                 <p className="text-[10px] font-black text-[#ff8c00] uppercase mb-2">Word Count</p>
                 <p className="text-2xl font-bold tracking-tighter">45,000+</p>
              </div>
              <div className="w-[1px] bg-zinc-800" />
              <div className="text-left">
                 <p className="text-[10px] font-black text-[#ff8c00] uppercase mb-2">Last Updated</p>
                 <p className="text-2xl font-bold tracking-tighter">2025</p>
              </div>
              <div className="w-[1px] bg-zinc-800" />
              <div className="text-left">
                 <p className="text-[10px] font-black text-[#ff8c00] uppercase mb-2">License</p>
                 <p className="text-2xl font-bold tracking-tighter">Open Access</p>
              </div>
           </div>
           <div className="mt-24 pt-12 border-t border-zinc-800">
              <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">© 2026 UXcourse.com — All Rights Reserved</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
