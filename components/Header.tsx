
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center px-6 justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <a href="#/" className="flex items-center gap-1 group">
          <div className="w-8 h-8 bg-[#ff8c00] flex items-center justify-center text-white font-black text-xs">UX</div>
          <span className="font-heading font-black tracking-tighter text-xl group-hover:text-[#ff8c00] transition-colors">course.com</span>
        </a>
        <nav className="hidden md:flex gap-6">
          <a href="#/" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-[#ff8c00] transition-colors">Home</a>
          <a href="#/chapter/chapter-1" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-[#ff8c00] transition-colors">Read Book</a>
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-xs font-bold uppercase tracking-widest px-4 py-2 border border-zinc-200 hover:bg-zinc-50 transition-colors">Search</button>
        <button className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-[#ff8c00] text-white hover:bg-[#e67e00] transition-colors">Feedback</button>
      </div>
    </header>
  );
};

export default Header;
