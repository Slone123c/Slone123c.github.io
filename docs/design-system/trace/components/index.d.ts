import type * as React from 'react';

type Tone = 'neutral' | 'signal' | 'cobalt' | 'green' | 'amber' | 'ink';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary: the one thing this view is for (max once). Default secondary. */
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'md' | 'sm';
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface TagProps { tone?: Tone; children?: React.ReactNode; className?: string }
export declare function Tag(props: TagProps): React.ReactElement;

export interface MarkerProps { /** The number that ties code, figure and prose together. */ n: number | string; tone?: 'signal' | 'ink' | 'cobalt'; className?: string }
export declare function Marker(props: MarkerProps): React.ReactElement;

export interface ArticleCardProps {
  /** Article serial number, rendered as No.017 */
  no?: number;
  /** Category, e.g. "DATA STRUCTURE" / "分布式" */
  kicker?: string;
  title: React.ReactNode;
  summary?: React.ReactNode;
  tags?: Array<string | { label: string; tone?: Tone }>;
  /** e.g. ["2026-10-12", "18 min", "进阶"] — joined with " · " */
  meta?: string[];
  href?: string;
  className?: string;
}
export declare function ArticleCard(props: ArticleCardProps): React.ReactElement;

export interface OutlineItem { id: string; title: string; level?: 1 | 2 }
export interface OutlineProps { items: OutlineItem[]; active?: string; title?: string; className?: string }
export declare function Outline(props: OutlineProps): React.ReactElement;

export interface CalloutProps {
  kind?: 'note' | 'definition' | 'invariant' | 'insight' | 'pitfall';
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}
export declare function Callout(props: CalloutProps): React.ReactElement;

export interface SpecRow { k: string; v: React.ReactNode; note?: React.ReactNode; tone?: 'green' | 'amber' | 'signal' }
export interface SpecSheetProps { title?: string; rows: SpecRow[]; className?: string }
export declare function SpecSheet(props: SpecSheetProps): React.ReactElement;

export interface MathBlockProps { children: React.ReactNode; label?: string | number; note?: React.ReactNode; className?: string }
export declare function MathBlock(props: MathBlockProps): React.ReactElement;

export interface CodeBlockProps {
  code: string;
  lang?: string;
  filename?: string;
  /** 1-based line numbers (relative to `start`) to highlight */
  highlight?: number[];
  /** line number → Marker number, e.g. { 12: 1, 18: 2 } */
  notes?: Record<number, number | string>;
  start?: number;
  lineNumbers?: boolean;
  className?: string;
}
export declare function CodeBlock(props: CodeBlockProps): React.ReactElement;

export interface Cell {
  v?: React.ReactNode;
  /** default | empty | active (being operated on) | hit (found) | ref (pointed to) | dead (deleted / evacuated) */
  state?: 'default' | 'empty' | 'active' | 'hit' | 'ref' | 'dead';
  /** small label above the cell, e.g. "top", "i", "commit" */
  tag?: string;
  /** override the index label below */
  idx?: React.ReactNode;
}
export interface CellsProps { cells: Array<Cell | string | number | null>; label?: React.ReactNode; caption?: React.ReactNode; showIndex?: boolean; indexBase?: number; cellWidth?: number; className?: string }
export declare function Cells(props: CellsProps): React.ReactElement;

export interface Step { title: React.ReactNode; desc?: React.ReactNode }
export interface StepperProps {
  steps: Step[];
  initial?: number;
  onChange?: (index: number) => void;
  /** Draw the state of the world at step i (Cells, SVG…). */
  renderStage?: (index: number) => React.ReactNode;
  className?: string;
}
export declare function Stepper(props: StepperProps): React.ReactElement;

export interface FigureProps { n?: number | string; caption?: React.ReactNode; grid?: boolean; children?: React.ReactNode; className?: string }
export declare function Figure(props: FigureProps): React.ReactElement;

export interface CompareOption { name: React.ReactNode; sub?: React.ReactNode }
export type CompareValue = React.ReactNode | { v: React.ReactNode; verdict?: 'good' | 'bad' | 'neutral' };
export interface CompareRow { k: React.ReactNode; note?: React.ReactNode; values: CompareValue[] }
export interface CompareProps {
  options: CompareOption[];
  rows: CompareRow[];
  title?: React.ReactNode;
  kicker?: string;
  /** index of the option this article is about: signal bar + numeral */
  focus?: number;
  focusLabel?: string;
  corner?: string;
  /** one-line conclusion bar (notebook variant only) */
  summary?: React.ReactNode;
  footer?: React.ReactNode;
  /** notebook (default, article pages) or swiss (system pages) */
  variant?: 'notebook' | 'swiss';
  className?: string;
}
export declare function Compare(props: CompareProps): React.ReactElement;

export interface DiagramNode {
  id: string;
  /** grid units */
  x: number; y: number; w?: number; h?: number;
  label: string; sub?: string;
  /** cross-reference number, matches a Marker in prose */
  n?: number | string;
  kind?: 'default' | 'active' | 'hit' | 'ref' | 'store' | 'external' | 'muted';
}
export interface DiagramEdge {
  from: string; to: string; label?: string;
  kind?: 'default' | 'ref' | 'active' | 'dashed';
  /** force first segment horizontal or vertical */
  axis?: 'h' | 'v';
  /** grid line (units) of the elbow */
  mid?: number;
  fromSide?: 'left' | 'right' | 'top' | 'bottom'; toSide?: 'left' | 'right' | 'top' | 'bottom';
  /** 0–1 position along the side, to separate edges sharing a side */
  fromAt?: number; toAt?: number;
  both?: boolean;
}
export interface DiagramGroup { x: number; y: number; w: number; h: number; label: string }
export interface DiagramProps {
  cols?: number; rows?: number;
  /** px per grid unit: 16 notebook, 24 swiss */
  unit?: number;
  /** notebook (default) or swiss */
  variant?: 'notebook' | 'swiss';
  /** light these nodes / edge indices as active; everything else recedes */
  highlight?: { nodes?: string[]; edges?: number[] };
  nodes: DiagramNode[]; edges?: DiagramEdge[]; groups?: DiagramGroup[];
  guides?: boolean; n?: number | string; caption?: React.ReactNode; title?: string; className?: string;
}
export declare function Diagram(props: DiagramProps): React.ReactElement;

declare global {
  interface Window {
    Trace: {
      Button: typeof Button; Tag: typeof Tag; Marker: typeof Marker; ArticleCard: typeof ArticleCard; Outline: typeof Outline;
      Callout: typeof Callout; SpecSheet: typeof SpecSheet; MathBlock: typeof MathBlock; CodeBlock: typeof CodeBlock;
      Cells: typeof Cells; Stepper: typeof Stepper; Figure: typeof Figure; Compare: typeof Compare; Diagram: typeof Diagram;
    };
  }
}
