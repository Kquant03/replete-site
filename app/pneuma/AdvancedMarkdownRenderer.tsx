import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Components } from 'react-markdown';
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
  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const lang = match ? match[1] : '';
      const value = String(children).replace(/\n$/, '');
      
      if (!className && !lang) {
        return (
          <code className={styles.inlineCode} {...props}>
            {value}
          </code>
        );
      }

      return <CodeBlock language={lang} value={value} />;
    },
    p({ children }) {
      if (typeof children === 'string') {
        return (
          <p className={styles.paragraph}>
            {children.split(/(`.*?`)/).map((part, index) => {
              if (part.startsWith('`') && part.endsWith('`')) {
                const code = part.slice(1, -1);
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
      return <p className={styles.paragraph}>{children}</p>;
    },
    h1({ children }) { return <h1 className={styles.heading1}>{children}</h1>; },
    h2({ children }) { return <h2 className={styles.heading2}>{children}</h2>; },
    h3({ children }) { return <h3 className={styles.heading3}>{children}</h3>; },
    h4({ children }) { return <h4 className={styles.heading4}>{children}</h4>; },
    h5({ children }) { return <h5 className={styles.heading5}>{children}</h5>; },
    h6({ children }) { return <h6 className={styles.heading6}>{children}</h6>; },
    ol: ({ children, start, ...props }) => (
      <ol className={`${styles.list} ${styles.orderedList}`} start={start} {...props}>
        {children}
      </ol>
    ),
    ul: ({ children, ...props }) => (
      <ul className={`${styles.list} ${styles.unorderedList}`} {...props}>
        {children}
      </ul>
    ),
    li: ({ children, ...props }) => (
      <li className={styles.listItem} {...props}>
        {children}
      </li>
    ),
    blockquote({ children }) {
      return <blockquote className={styles.blockquote}>{children}</blockquote>;
    },
    a({ href, children }) {
      return (
        <a href={href} className={styles.link} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    },
    img({ src, alt }) {
      return (
        <div className={styles.imageWrapper}>
          <Image 
            src={src || ''}
            alt={alt || ''}
            width={500}
            height={300}
            layout="responsive"
            className={styles.image}
          />
          {alt && <p className={styles.imageCaption}>{alt}</p>}
        </div>
      );
    },
    table({ children }) {
      return (
        <div className={styles.tableContainer}>
          <table className={styles.table}>{children}</table>
        </div>
      );
    },
    thead({ children }) { return <thead className={styles.tableHead}>{children}</thead>; },
    tbody({ children }) { return <tbody>{children}</tbody>; },
    tr({ children }) { return <tr className={styles.tableRow}>{children}</tr>; },
    th({ children }) { return <th className={styles.tableHeader}>{children}</th>; },
    td({ children }) { return <td className={styles.tableCell}>{children}</td>; },
    hr() { return <hr className={styles.horizontalRule} />; },
  };

  return (
    <div className={`${styles.markdownContent} ${className || ''}`}>
      <ReactMarkdown
        components={components}
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeRaw, rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default AdvancedMarkdownRenderer;