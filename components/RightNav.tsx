
import React from 'react';
import { ChapterSection } from '../types';

interface RightNavProps {
  sections: ChapterSection[];
  activeSectionId: string;
}

const RightNav: React.FC<RightNavProps> = ({ sections, activeSectionId }) => {
  return (
    <aside className="hidden lg:block w-72 h-full border-l border-zinc-200 p-8 overflow-y-auto bg-white">
      <div className="sticky top-0">
        <h3 className="text-[10px] font-black tracking-widest text-zinc-400 uppercase mb-6">
          GUIDELINES
        </h3>
        <ul className="space-y-6 relative">
          <div className="absolute left-[3px] top-2 bottom-2 w-[1px] bg-zinc-100" />
          {sections.map((section) => (
            <li key={section.id} className="relative pl-6">
              <div 
                className={`absolute left-0 top-[7px] w-[7px] h-[7px] rounded-full border border-white transition-colors duration-300 ${
                  activeSectionId === section.id ? 'bg-brand shadow-[0_0_0_2px_rgba(255,140,0,0.2)]' : 'bg-zinc-300'
                }`}
              />
              <a
                href={`#${section.id}`}
                className={`block text-[11px] leading-tight font-bold tracking-tight uppercase transition-all duration-300 ${
                  activeSectionId === section.id
                    ? 'text-brand translate-x-1'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                {section.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default RightNav;
