import React from 'react';
import { BookContent } from '../types';
import Sidebar from './Sidebar';

interface PageLayoutProps {
  content: BookContent;
  activeId: string;
  children: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({ content, activeId, children }) => (
  <div className="flex-1 flex overflow-hidden">
    <div className="w-80 flex-shrink-0 hidden md:block border-r border-zinc-200">
      <Sidebar content={content} activeId={activeId} />
    </div>
    <div className="flex-1 overflow-hidden">
      {children}
    </div>
  </div>
);

export default PageLayout;
