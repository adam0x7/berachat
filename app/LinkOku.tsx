import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const MARKDOWN_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;
const ETHEREUM_ADDRESS_PATTERN = /0x[a-fA-F0-9]{40}/g;

const preprocessContent = (content: string) => {
  return content.replace(/(\[.*?\])?\(?((https?:\/\/[^\s]+)|(0x[a-fA-F0-9]{40}))\)?/g, (match, existingLink, address) => {
    if (existingLink) {
      // If it's already a markdown link, return it as is
      return match;
    } else if (address.startsWith('0x')) {
      // If it's an Ethereum address, wrap it in a markdown link
      return `[${address}](https://bartio.beratrail.io/address/${address})`;
    } else {
      // If it's a regular URL, wrap it in a markdown link
      return `[${address}](${address})`;
    }
  });
};

const MarkdownRenderer = ({ content }: { content: string }) => {
  const processedContent = preprocessContent(content);

  return (
    <ReactMarkdown
      className="text-white font-semibold"
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ node, ...props }) => (
          <a {...props} className="text-white underline hover:text-gray-300" target="_blank" rel="noopener noreferrer" />
        ),
        p: ({ node, ...props }) => <p {...props} className="text-white" />,
        h1: ({ node, ...props }) => <h1 {...props} className="text-white text-2xl font-bold" />,
        h2: ({ node, ...props }) => <h2 {...props} className="text-white text-xl font-bold" />,
        h3: ({ node, ...props }) => <h3 {...props} className="text-white text-lg font-bold" />,
        h4: ({ node, ...props }) => <h4 {...props} className="text-white text-base font-bold" />,
        h5: ({ node, ...props }) => <h5 {...props} className="text-white text-sm font-bold" />,
        h6: ({ node, ...props }) => <h6 {...props} className="text-white text-xs font-bold" />,
        ul: ({ node, ...props }) => <ul {...props} className="text-white list-disc pl-5" />,
        ol: ({ node, ...props }) => <ol {...props} className="text-white list-decimal pl-5" />,
        li: ({ node, ...props }) => <li {...props} className="text-white" />,
        table: ({ node, ...props }) => <table {...props} className="text-white border-collapse border border-gray-600 w-full my-4" />,
        thead: ({ node, ...props }) => <thead {...props} className="bg-gray-800/50" />,
        tbody: ({ node, ...props }) => <tbody {...props} className="bg-gray-900/30" />,
        tr: ({ node, ...props }) => <tr {...props} className="border-b border-gray-600/50" />,
        th: ({ node, ...props }) => <th {...props} className="text-white border border-gray-600/50 px-4 py-2 font-bold" />,
        td: ({ node, ...props }) => <td {...props} className="text-white border border-gray-600/50 px-4 py-2" />,
        code: ({ node, inline, ...props }) => 
          inline ? (
            <code {...props} className="text-white bg-gray-800 rounded px-1" />
          ) : (
            <code {...props} className="block text-white bg-gray-800 rounded p-2 whitespace-pre-wrap" />
          ),
        pre: ({ node, ...props }) => <pre {...props} className="text-white bg-gray-800 rounded p-2 my-2 overflow-x-auto" />,
        blockquote: ({ node, ...props }) => (
          <blockquote {...props} className="border-l-4 border-gray-500 pl-4 py-2 my-2 bg-gray-800/50 text-white italic" />
        ),
        em: ({ node, ...props }) => <em {...props} className="text-white italic" />,
        strong: ({ node, ...props }) => <strong {...props} className="text-white font-bold" />,
        del: ({ node, ...props }) => <del {...props} className="text-white line-through" />,
        hr: ({ node, ...props }) => <hr {...props} className="border-gray-600 my-4" />,
        img: ({ node, ...props }) => <img {...props} className="max-w-full h-auto my-2" alt={props.alt || ''} />,
      }}
    >
      {processedContent}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
