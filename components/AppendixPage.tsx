import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Appendix } from '../types';

interface AppendixPageProps {
  appendix: Appendix;
}

const AppendixPage: React.FC<AppendixPageProps> = ({ appendix }) => (
  <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
    <div className="max-w-3xl mx-auto px-6 py-24">
      <span className="text-brand font-black text-xs uppercase tracking-widest mb-4 block">Resources</span>
      <h1 className="text-5xl font-black tracking-tighter mb-12 uppercase">{appendix.title}</h1>
      <div className="prose prose-zinc lg:prose-xl max-w-none [&>p]:text-xl [&>p]:leading-relaxed [&>p]:text-zinc-600 [&>p]:mb-8 [&>p]:font-medium [&>h2]:text-3xl [&>h2]:font-black [&>h2]:tracking-tight [&>h2]:uppercase [&>h2]:mt-16 [&>h2]:mb-8 [&_em]:text-zinc-500 [&_em]:block [&_em]:bg-zinc-50 [&_em]:p-4 [&_em]:border-l-4 [&_em]:border-brand [&_em]:mb-4 [&_em]:not-italic">
        <ReactMarkdown>{appendix.content}</ReactMarkdown>
      </div>
    </div>
  </div>
);

export default AppendixPage;
