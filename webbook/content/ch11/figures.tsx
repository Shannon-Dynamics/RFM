import { FourComponents, type Style } from "@/components/viz/FourComponents";

const LBM: Style[] = [
  { id: "lbm", label: "Large behavior model", examples: "Diffusion Policy, ACT, Octo, TRI LBM", train: ["policy"], infer: [["policy"]],
    note: "Only the policy is learned and run. The instruction, if there is one, comes through a small text encoder such as CLIP, not a language model, so the task is mostly specified by the demonstrations themselves." },
  { id: "vla", label: "Reactive VLA, for comparison", examples: "π0, GR00T N1.7", train: ["policy"], infer: [["policy"]],
    note: "The same single arrow, but the inputs pass through a pretrained vision-language model first. The difference between chapters 5 and 11 is what feeds the arrow, not the arrow itself." },
];

/** Figure 11.2. */
export function LbmFourComponents() {
  return <FourComponents modes={LBM} initial="lbm" />;
}
