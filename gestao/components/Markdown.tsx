import React from 'react';

/**
 * Renderizador de Markdown minimalista para os relatórios da IA.
 * Cobre: # ## ### títulos, **negrito**, listas (* - ou 1.), parágrafos.
 * Sem dependências. Não interpreta HTML (seguro).
 */

// Aplica **negrito** dentro de uma linha, retornando nós React.
function inline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={`${keyPrefix}-b${i}`} className="font-semibold text-secondary-800">{p.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={`${keyPrefix}-t${i}`}>{p}</React.Fragment>;
  });
}

interface Block {
  type: 'h1' | 'h2' | 'h3' | 'ul' | 'ol' | 'p';
  content?: string;
  items?: string[];
}

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;
  let listType: 'ul' | 'ol' = 'ul';

  const flushPara = () => {
    if (para.length) { blocks.push({ type: 'p', content: para.join(' ') }); para = []; }
  };
  const flushList = () => {
    if (list && list.length) { blocks.push({ type: listType, items: list }); }
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (line.trim() === '') { flushPara(); flushList(); continue; }

    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flushPara(); flushList();
      const level = h[1].length;
      blocks.push({ type: (['h1', 'h2', 'h3'][level - 1] as Block['type']), content: h[2] });
      continue;
    }

    const ul = line.match(/^\s*[-*]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const t: 'ul' | 'ol' = ul ? 'ul' : 'ol';
      if (!list || listType !== t) { flushList(); list = []; listType = t; }
      list.push((ul ?? ol)![1]);
      continue;
    }

    // linha normal → acumula parágrafo
    flushList();
    para.push(line.trim());
  }
  flushPara(); flushList();
  return blocks;
}

const Markdown: React.FC<{ text: string }> = ({ text }) => {
  const blocks = parse(text);
  return (
    <div className="md-body">
      {blocks.map((b, i) => {
        const k = `b${i}`;
        switch (b.type) {
          case 'h1':
            return <h1 key={k} className="font-serif text-xl text-secondary-700 mt-6 mb-3 first:mt-0">{inline(b.content!, k)}</h1>;
          case 'h2':
            return <h2 key={k} className="font-serif text-lg text-secondary-700 mt-6 mb-2 pb-1 border-b border-secondary-100">{inline(b.content!, k)}</h2>;
          case 'h3':
            return <h3 key={k} className="font-semibold text-secondary-700 mt-4 mb-1">{inline(b.content!, k)}</h3>;
          case 'ul':
            return (
              <ul key={k} className="list-disc pl-5 my-2 space-y-1 text-secondary-700 marker:text-secondary-300">
                {b.items!.map((it, j) => <li key={j}>{inline(it, `${k}-${j}`)}</li>)}
              </ul>
            );
          case 'ol':
            return (
              <ol key={k} className="list-decimal pl-5 my-2 space-y-1 text-secondary-700 marker:text-secondary-400">
                {b.items!.map((it, j) => <li key={j}>{inline(it, `${k}-${j}`)}</li>)}
              </ol>
            );
          default:
            return <p key={k} className="text-secondary-700 leading-relaxed my-2 text-justify">{inline(b.content!, k)}</p>;
        }
      })}
    </div>
  );
};

export default Markdown;
