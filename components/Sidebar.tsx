
import React from 'react';
import { BookContent } from '../types';

interface SidebarProps {
  content: BookContent;
  activeId: string;
}

const Sidebar: React.FC<SidebarProps> = ({ content, activeId }) => {
  return (
    <aside className="w-full h-full border-r border-zinc-200 overflow-y-auto custom-scrollbar bg-white">
      <div className="p-6 border-b border-zinc-200">
        <a href="#/" className="block">
          <h2 className="text-xs font-bold tracking-widest text-brand uppercase mb-1">Index</h2>
          <h1 className="text-xl font-bold leading-none tracking-tight">THE BOOK</h1>
        </a>
      </div>
      
      <nav className="p-4">
        {content.parts.map((part, pIdx) => (
          <div key={pIdx} className="mb-8">
            <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-4 px-2">
              {part.title}
            </h3>
            <ul className="space-y-1">
              {part.chapters.map((chapter) => (
                <li key={chapter.id}>
                  <a
                    href={`#/chapter/${chapter.id}`}
                    className={`block px-2 py-2 text-sm transition-colors rounded-sm ${
                      activeId === chapter.id
                        ? 'bg-orange-50 text-brand font-bold border-l-2 border-brand'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <span className="opacity-40 mr-2 font-normal text-xs">{chapter.number}.</span>
                    {chapter.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="mt-8 border-t border-zinc-100 pt-8">
          <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-4 px-2">
            RESOURCES
          </h3>
          <ul className="space-y-1">
            {content.appendices.map((appx) => (
              <li key={appx.id}>
                <a
                  href={`#/appendix/${appx.id}`}
                  className={`block px-2 py-2 text-sm transition-colors ${
                    activeId === appx.id
                      ? 'text-brand font-bold'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  {appx.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
