
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
import ChapterPage from './components/ChapterPage';
import { useBookContent } from './hooks/useBookContent';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const { content: BOOK_CONTENT, loading, error } = useBookContent();

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Scroll to top when the route changes (but not for internal anchors)
  useEffect(() => {
    if (!route.includes('#toc') && !route.startsWith('#chapter-')) {
      window.scrollTo(0, 0);
    }
  }, [route]);

  const renderContent = () => {
    // Show loading state
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-zinc-500">Loading content...</p>
          </div>
        </div>
      );
    }

    // Show error state
    if (error) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Error Loading Content</h2>
            <p className="text-zinc-500">{error}</p>
          </div>
        </div>
      );
    }

    // Robust home check: default to home if empty, root, or specific home anchors
    const isHome = route === '#/' || route === '' || route === '#toc' || route === '#';
    
    if (isHome) {
      return (
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          <Home content={BOOK_CONTENT} />
        </div>
      );
    }

    if (route.startsWith('#/chapter/')) {
      const chapterId = route.replace('#/chapter/', '');
      const allChapters = BOOK_CONTENT.parts.flatMap(p => p.chapters);
      const chapter = allChapters.find(c => c.id === chapterId);

      if (chapter) {
        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 flex-shrink-0 hidden md:block border-r border-zinc-200">
              <Sidebar content={BOOK_CONTENT} activeId={chapterId} />
            </div>
            <div className="flex-1 overflow-hidden">
              <ChapterPage chapter={chapter} allChapters={allChapters} />
            </div>
          </div>
        );
      }
    }

    if (route.startsWith('#/appendix/')) {
      const appxId = route.replace('#/appendix/', '');
      const appendix = BOOK_CONTENT.appendices.find(a => a.id === appxId);

      if (appendix) {
        return (
          <div className="flex-1 flex overflow-hidden">
            <div className="w-80 flex-shrink-0 hidden md:block border-r border-zinc-200">
              <Sidebar content={BOOK_CONTENT} activeId={appxId} />
            </div>
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
              <div className="max-w-3xl mx-auto px-6 py-24">
                <span className="text-brand font-black text-xs uppercase tracking-widest mb-4 block">Resources</span>
                <h1 className="text-5xl font-black tracking-tighter mb-12 uppercase">{appendix.title}</h1>
                <div className="prose prose-zinc lg:prose-xl max-w-none [&>p]:text-xl [&>p]:leading-relaxed [&>p]:text-zinc-600 [&>p]:mb-8 [&>p]:font-medium [&>h2]:text-3xl [&>h2]:font-black [&>h2]:tracking-tight [&>h2]:uppercase [&>h2]:mt-16 [&>h2]:mb-8 [&_em]:text-zinc-500 [&_em]:block [&_em]:bg-zinc-50 [&_em]:p-4 [&_em]:border-l-4 [&_em]:border-brand [&_em]:mb-4 [&_em]:not-italic">
                  <ReactMarkdown>{appendix.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    // Default error / fallback
    return (
      <div className="flex-1 flex overflow-hidden">
        <div className="w-80 flex-shrink-0 hidden md:block border-r border-zinc-200">
          <Sidebar content={BOOK_CONTENT} activeId="" />
        </div>
        <div className="flex-1 p-20 flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">404 - Section Missing</h2>
          <p className="text-zinc-500 mb-8 max-w-sm">We couldn't find that part of the book. It might be under review or moved.</p>
          <a href="#/" className="px-10 py-4 bg-brand text-white font-black uppercase text-xs tracking-widest transition-all hover:bg-black">Return to Homepage</a>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      {renderContent()}
    </div>
  );
};

export default App;
