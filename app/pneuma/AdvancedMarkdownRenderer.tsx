import React, { useMemo, lazy, Suspense } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import Image from 'next/image';

// Lazy load SyntaxHighlighter
const LazySyntaxHighlighter = lazy(() => import('react-syntax-highlighter/dist/esm/prism-light'));

interface AdvancedMarkdownRendererProps {
  content: string;
  className?: string;
}

const AdvancedMarkdownRenderer: React.FC<AdvancedMarkdownRendererProps> = React.memo(({ content, className }) => {
  const MarkdownComponents: object = useMemo(() => ({
    code({ inline, className, children, ...props }: {
      inline?: boolean;
      className?: string;
      children: React.ReactNode;
      [key: string]: unknown;
    }) {
      const match = /language-(\w+)/.exec(className || '');
      const lang = match ? match[1] : '';
      const codeString = String(children).replace(/\n$/, '');

      if (inline) {
        return (
          <code className="bg-gray-700 text-gray-200 rounded px-1 py-0.5 font-mono text-sm" {...props}>
            {codeString}
          </code>
        );
      }

      return (
        <Suspense fallback={<div className="animate-pulse bg-gray-700 h-20 rounded-md"></div>}>
          <LazySyntaxHighlighter
            language={lang}
            style={vscDarkPlus}
            customStyle={{
              borderRadius: '0.375rem',
              padding: '0.75rem',
              fontSize: '0.875rem',
              lineHeight: '1.5',
              margin: '0.5rem 0'
            }}
            wrapLongLines={true}
            {...props}
          >
            {codeString}
          </LazySyntaxHighlighter>
        </Suspense>
      );
    },
    p: ({ children }: { children: React.ReactNode }) => <p className="my-2 text-sm leading-relaxed">{children}</p>,
    h1: ({ children }: { children: React.ReactNode }) => <h1 className="text-xl font-semibold mt-4 mb-2">{children}</h1>,
    h2: ({ children }: { children: React.ReactNode }) => <h2 className="text-lg font-medium mt-3 mb-2">{children}</h2>,
    h3: ({ children }: { children: React.ReactNode }) => <h3 className="text-base font-medium mt-3 mb-1">{children}</h3>,
    h4: ({ children }: { children: React.ReactNode }) => <h4 className="text-sm font-medium mt-2 mb-1">{children}</h4>,
    h5: ({ children }: { children: React.ReactNode }) => <h5 className="text-sm font-medium mt-2 mb-1">{children}</h5>,
    h6: ({ children }: { children: React.ReactNode }) => <h6 className="text-xs font-medium mt-2 mb-1">{children}</h6>,
    ul: ({ children }: { children: React.ReactNode }) => <ul className="list-disc pl-4 my-2 space-y-1 text-sm">{children}</ul>,
    ol: ({ children }: { children: React.ReactNode }) => <ol className="list-decimal pl-4 my-2 space-y-1 text-sm">{children}</ol>,
    li: ({ children }: { children: React.ReactNode }) => <li className="mb-1">{children}</li>,
    blockquote: ({ children }: { children: React.ReactNode }) => (
      <blockquote className="border-l-2 border-gray-400 pl-3 py-1 my-2 text-sm italic text-gray-300">
        {children}
      </blockquote>
    ),
    a: ({ href, children }: { href: string; children: React.ReactNode }) => (
      <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    img: ({ src, alt }: { src: string; alt?: string }) => (
      <div className="my-2">
        <Image 
          src={src}
          alt={alt || ''}
          width={500}
          height={300}
          layout="responsive"
          className="rounded-md"
        />
        {alt && <p className="text-xs text-gray-400 mt-1">{alt}</p>}
      </div>
    ),
    table: ({ children }: { children: React.ReactNode }) => (
      <div className="overflow-x-auto my-2">
        <table className="min-w-full divide-y divide-gray-600 text-sm">
          {children}
        </table>
      </div>
    ),
    thead: ({ children }: { children: React.ReactNode }) => <thead className="bg-gray-700">{children}</thead>,
    th: ({ children }: { children: React.ReactNode }) => (
      <th className="px-2 py-1 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
        {children}
      </th>
    ),
    td: ({ children }: { children: React.ReactNode }) => (
      <td className="px-2 py-1 text-sm text-gray-300">
        {children}
      </td>
    ),
    hr: () => <hr className="my-3 border-t border-gray-600" />,
  }), []);

  return (
    <div className={`text-gray-200 ${className || ''}`}>
      <ReactMarkdown
        components={MarkdownComponents}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

AdvancedMarkdownRenderer.displayName = 'AdvancedMarkdownRenderer';

export default AdvancedMarkdownRenderer;