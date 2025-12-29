import React, { useState } from 'react';

const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="h-16 border-b border-zinc-200 bg-white flex items-center px-6 justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <a href="#/" className="flex items-center gap-1 group" aria-label="Go to homepage">
          <div className="w-8 h-8 bg-brand flex items-center justify-center text-white font-black text-xs">UX</div>
          <span className="font-heading font-black tracking-tighter text-xl group-hover:text-brand transition-colors">course.com</span>
        </a>
        <nav className="hidden md:flex gap-6" aria-label="Main navigation">
          <a href="#/" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-brand transition-colors">Home</a>
          <a href="#/chapter/chapter-1" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-brand transition-colors">Read Book</a>
        </nav>
      </div>

      {/* Desktop buttons */}
      <div className="hidden md:flex items-center gap-4">
        <a
          href="mailto:luka.taylor@gmail.com?subject=UXcourse.com%20Feedback"
          className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-brand text-white hover:bg-brand-dark transition-colors"
          aria-label="Send feedback via email"
        >
          Feedback
        </a>
      </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden p-2 text-zinc-600 hover:text-brand transition-colors"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-zinc-200 shadow-lg md:hidden">
          <nav className="flex flex-col p-4" aria-label="Mobile navigation">
            <a
              href="#/"
              className="py-3 text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-brand transition-colors border-b border-zinc-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </a>
            <a
              href="#/chapter/chapter-1"
              className="py-3 text-sm font-bold uppercase tracking-widest text-zinc-600 hover:text-brand transition-colors border-b border-zinc-100"
              onClick={() => setMobileMenuOpen(false)}
            >
              Read Book
            </a>
            <a
              href="mailto:luka.taylor@gmail.com?subject=UXcourse.com%20Feedback"
              className="py-3 text-sm font-bold uppercase tracking-widest text-brand hover:text-brand-dark transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Send Feedback
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
