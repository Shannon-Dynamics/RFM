import type { MDXComponents } from "mdx/types";
import { Cite } from "@/components/book/Cite";
import { Quote } from "@/components/book/Quote";
import { Figure } from "@/components/book/Figure";
import { Callout, Claim, NotSure } from "@/components/book/Callout";
import { Exercise } from "@/components/book/Exercise";
import { RustSnippet } from "@/components/book/RustSnippet";
import { WamMap } from "@/components/viz/WamMap";
import { FourComponents } from "@/components/viz/FourComponents";
import { JointDenoising } from "@/components/viz/JointDenoising";
import { ImagineThenAct } from "@/components/viz/ImagineThenAct";
import { CostVsHorizon } from "@/components/viz/CostVsHorizon";
import { DriftChart } from "@/components/viz/DriftChart";
import { RoboArenaDots } from "@/components/viz/RoboArenaDots";

const components: MDXComponents = {
  // Markdown tables scroll inside their own box on narrow screens instead of widening the page.
  table: (props) => <div className="table-scroll" data-wide><table {...props} /></div>,
  Cite, Quote, Figure, Callout, Claim, NotSure, Exercise, RustSnippet,
  WamMap, FourComponents, JointDenoising, ImagineThenAct, CostVsHorizon, DriftChart, RoboArenaDots,
};

export function useMDXComponents(inherited: MDXComponents): MDXComponents {
  return { ...inherited, ...components };
}
