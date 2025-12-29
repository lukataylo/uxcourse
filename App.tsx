import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Home from './components/Home';
import ChapterPage from './components/ChapterPage';
import AppendixPage from './components/AppendixPage';
import PageLayout from './components/PageLayout';
import { useBookContent } from './hooks/useBookContent';

const App: React.FC = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  const { content, loading, error } = useBookContent();

  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    if (!route.includes('#toc') && !route.startsWith('#chapter-')) {
      window.scrollTo(0, 0);
    }
  }, [route]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-zinc-500">Loading content...</p>
          </div>
        </div>
      );
    }

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

    const isHome = route === '#/' || route === '' || route === '#toc' || route === '#';
    if (isHome) {
      return (
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          <Home content={content} />
        </div>
      );
    }

    const allChapters = content.parts.flatMap(p => p.chapters);

    if (route.startsWith('#/chapter/')) {
      const chapterId = route.replace('#/chapter/', '');
      const chapter = allChapters.find(c => c.id === chapterId);
      if (chapter) {
        return (
          <PageLayout content={content} activeId={chapterId}>
            <ChapterPage chapter={chapter} allChapters={allChapters} />
          </PageLayout>
        );
      }
    }

    if (route.startsWith('#/appendix/')) {
      const appxId = route.replace('#/appendix/', '');
      const appendix = content.appendices.find(a => a.id === appxId);
      if (appendix) {
        return (
          <PageLayout content={content} activeId={appxId}>
            <AppendixPage appendix={appendix} />
          </PageLayout>
        );
      }
    }

    return (
      <PageLayout content={content} activeId="">
        <div className="flex-1 p-20 flex flex-col items-center justify-center text-center">
          <h2 className="text-4xl font-black mb-4 uppercase tracking-tighter">404 - Section Missing</h2>
          <p className="text-zinc-500 mb-8 max-w-sm">We couldn't find that part of the book. It might be under review or moved.</p>
          <a href="#/" className="px-10 py-4 bg-brand text-white font-black uppercase text-xs tracking-widest transition-all hover:bg-black">Return to Homepage</a>
        </div>
      </PageLayout>
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
