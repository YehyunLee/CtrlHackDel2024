// components/TextWithLatex.js
import React from 'react';
import katex from 'katex';

const TextWithLatex = ({ text }) => {
  // Regular expression to match LaTeX expressions enclosed by $$$$
  const parts = text.split(/(\$\$.*?\$\$)/);

  return (
    <div>
      {parts.map((part, index) => {
        // Check if the part is a LaTeX expression
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const latexExpression = part.slice(2, -2); // Remove enclosing $$$

          try {
            const html = katex.renderToString(latexExpression, {
              throwOnError: false,
              displayMode: true,
            });
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch (error) {
            console.error("Error rendering LaTeX:", error);
            return <span key={index}>{latexExpression}</span>;
          }
        }
        // If not a LaTeX expression, render as plain text
        return <span key={index}>{part}</span>;
      })}
    </div>
  );
};

export default TextWithLatex;
