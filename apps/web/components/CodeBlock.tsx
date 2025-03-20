"use client";

import { useQuery } from "@tanstack/react-query";
import { createHighlighter } from "shiki";

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  lang?: string;
}

export default function CodeBlock({ value, ...props }: CodeBlockProps) {
  const { data: highlighter } = useQuery({
    queryKey: ["highlighter"],
    queryFn: async () => {
      const highlighter = await createHighlighter({
        themes: ["github-light"],
        langs: ["json"],
      });

      return highlighter;
    },
  });

  const out = highlighter?.codeToHtml(value, {
    lang: "json",
    theme: "github-light",
  });

  return out ? (
    <div dangerouslySetInnerHTML={{ __html: out }} {...props} />
  ) : (
    <div className="w-full h-32" />
  );
}
