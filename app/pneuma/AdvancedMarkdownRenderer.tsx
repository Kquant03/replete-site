import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import 'katex/dist/katex.min.css';
import Image from 'next/image';
import { FiCopy, FiCheck } from 'react-icons/fi';
import styles from './AdvancedMarkdownRenderer.module.css';

// Import languages
import javascript from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import typescript from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import python from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import csharp from 'react-syntax-highlighter/dist/esm/languages/prism/csharp';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import go from 'react-syntax-highlighter/dist/esm/languages/prism/go';
import rust from 'react-syntax-highlighter/dist/esm/languages/prism/rust';
import swift from 'react-syntax-highlighter/dist/esm/languages/prism/swift';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import scala from 'react-syntax-highlighter/dist/esm/languages/prism/scala';
import ruby from 'react-syntax-highlighter/dist/esm/languages/prism/ruby';
import php from 'react-syntax-highlighter/dist/esm/languages/prism/php';
import dart from 'react-syntax-highlighter/dist/esm/languages/prism/dart';
import html from 'react-syntax-highlighter/dist/esm/languages/prism/markup';
import css from 'react-syntax-highlighter/dist/esm/languages/prism/css';
import scss from 'react-syntax-highlighter/dist/esm/languages/prism/scss';
import bash from 'react-syntax-highlighter/dist/esm/languages/prism/bash';
import json from 'react-syntax-highlighter/dist/esm/languages/prism/json';
import yaml from 'react-syntax-highlighter/dist/esm/languages/prism/yaml';
import markdown from 'react-syntax-highlighter/dist/esm/languages/prism/markdown';
import sql from 'react-syntax-highlighter/dist/esm/languages/prism/sql';
import graphql from 'react-syntax-highlighter/dist/esm/languages/prism/graphql';

// Register languages
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('csharp', csharp);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('go', go);
SyntaxHighlighter.registerLanguage('rust', rust);
SyntaxHighlighter.registerLanguage('swift', swift);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('scala', scala);
SyntaxHighlighter.registerLanguage('ruby', ruby);
SyntaxHighlighter.registerLanguage('php', php);
SyntaxHighlighter.registerLanguage('dart', dart);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('scss', scss);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('yaml', yaml);
SyntaxHighlighter.registerLanguage('markdown', markdown);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('graphql', graphql);

interface CodeBlockProps {
  language: string;
  value: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  return (
    <div className={styles.codeBlockWrapper}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.codeBlockLanguage}>{language}</span>
        <button
          onClick={handleCopy}
          className={styles.codeBlockCopyBtn}
          aria-label="Copy code"
        >
          {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
        </button>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: 1.5,
          borderRadius: '0 0 0.5rem 0.5rem',
        }}
        wrapLongLines={true}
        className={styles.syntaxHighlighter}
      >
        {value}
      </SyntaxHighlighter>
      {copied && (
        <div className={styles.codeBlockCopiedIndicator}>
          Copied!
        </div>
      )}
    </div>
  );
};

interface AdvancedMarkdownRendererProps {
  content: string;
  className?: string;
}

const AdvancedMarkdownRenderer: React.FC<AdvancedMarkdownRendererProps> = ({ content, className }) => {
  // Preprocess the content to differentiate inline code and code blocks
  const preprocessContent = (rawContent: string) => {
    const lines = rawContent.split('\n');
    let inCodeBlock = false;
    const processedLines = lines.map(line => {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        return line;
      }
      if (!inCodeBlock) {
        // Replace inline code with a custom marker
        return line.replace(/`([^`\n]+)`/g, '§§INLINE_CODE_START§§$1§§INLINE_CODE_END§§');
      }
      return line;
    });
    return processedLines.join('\n');
  };

  const processedContent = preprocessContent(content);

  return (
    <div className={`text-gray-200 ${className || ''}`}>
      <ReactMarkdown
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : '';
            const value = String(children).replace(/\n$/, '');
            
            // Check for our custom inline code marker
            if (value.startsWith('§§INLINE_CODE_START§§') && value.endsWith('§§INLINE_CODE_END§§')) {
              const inlineCode = value.replace('§§INLINE_CODE_START§§', '').replace('§§INLINE_CODE_END§§', '');
              return (
                <code className={styles.inlineCode} {...props}>
                  {inlineCode}
                </code>
              );
            }

            return <CodeBlock language={lang} value={value} />;
          },
          p: ({ children }) => {
            if (typeof children === 'string') {
              // Replace our custom markers with actual inline code elements
              const parts = children.split(/(§§INLINE_CODE_START§§.*?§§INLINE_CODE_END§§)/);
              return (
                <p className="my-2 text-sm leading-relaxed">
                  {parts.map((part, index) => {
                    if (part.startsWith('§§INLINE_CODE_START§§') && part.endsWith('§§INLINE_CODE_END§§')) {
                      const code = part.replace('§§INLINE_CODE_START§§', '').replace('§§INLINE_CODE_END§§', '');
                      return (
                        <code key={index} className={styles.inlineCode}>
                          {code}
                        </code>
                      );
                    }
                    return part;
                  })}
                </p>
              );
            }
            return <p className="my-2 text-sm leading-relaxed">{children}</p>;
          },
          h1: ({ children }) => <h1 className="text-xl font-semibold mt-4 mb-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-lg font-medium mt-3 mb-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-base font-medium mt-3 mb-1">{children}</h3>,
          h4: ({ children }) => <h4 className="text-sm font-medium mt-2 mb-1">{children}</h4>,
          h5: ({ children }) => <h5 className="text-sm font-medium mt-2 mb-1">{children}</h5>,
          h6: ({ children }) => <h6 className="text-xs font-medium mt-2 mb-1">{children}</h6>,
          ul: ({ children }) => <ul className="list-disc pl-4 my-1 space-y-0.5 text-sm">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 my-1 space-y-0.5 text-sm">{children}</ol>,
          li: ({ children }) => <li className="mb-0.5">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-gray-400 pl-3 py-1 my-2 text-sm italic text-gray-300">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <div className="my-2">
              <Image 
                src={src || ''}
                alt={alt || ''}
                width={500}
                height={300}
                layout="responsive"
                className="rounded-md"
              />
              {alt && <p className="text-xs text-gray-400 mt-1">{alt}</p>}
            </div>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="min-w-full divide-y divide-gray-600 text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-700">{children}</thead>,
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider border border-gray-600">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-sm text-gray-300 border border-gray-600">
              {children}
            </td>
          ),
          hr: () => <hr className="my-3 border-t border-gray-600" />,
        }}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default AdvancedMarkdownRenderer;