import { Sorter } from "@/components/viz/Sorter";

/** Figure 1.4: what the book's definition includes. Answers follow chapter 1's three tests. */
export function ScopeSorter() {
  return (
    <Sorter
      prompt="For each system, decide whether the book counts it as a robot foundation model. Then check."
      options={["In scope", "Out of scope"]}
      items={[
        { name: "π0.5", hint: "a VLA pretrained on many robots and tasks", answer: "In scope",
          why: "It maps camera images and an instruction to an action chunk, was pretrained broadly, and is adapted by fine-tuning." },
        { name: "DreamZero", hint: "a world-action model on a video backbone", answer: "In scope",
          why: "It outputs actions and predicted futures from observations and language, and adapts to a new robot from 30 minutes of play data (a vendor claim)." },
        { name: "Cosmos-Predict2.5", hint: "a video world model used to generate robot training data", answer: "In scope",
          why: "World models used for control count, including as simulators and data engines (chapter 8), because what they predict feeds a robot's actions." },
        { name: "Gemini Robotics-ER 1.6", hint: "an embodied reasoning model that plans and judges success", answer: "In scope",
          why: "It produces plans and success judgments a controller acts on, and it is trained for embodied reasoning (chapter 10)." },
        { name: "An open-vocabulary object detector", hint: "finds objects in images from text queries", answer: "Out of scope",
          why: "Perception only. Useful inside a robot, but it never produces an action, a future or a plan." },
        { name: "A chat model writing code that calls hand-written skills", hint: "an LLM planner", answer: "Out of scope",
          why: "The plan comes from a general language model with no embodied training; the motor skills are hand-coded." },
        { name: "A Diffusion Policy trained for one task on one robot", hint: "a strong imitation policy", answer: "Out of scope",
          why: "Same family of mechanism as chapter 11, but trained narrowly: it has no breadth to adapt from." },
        { name: "TRI's Large Behavior Model", hint: "a diffusion policy pretrained on many dexterous tasks", answer: "In scope",
          why: "No language backbone, but broad multitask pretraining and cheap adaptation: chapter 11's family." },
      ]}
    />
  );
}

/** Figure 1.5: reading what is predicted, the grid's horizontal axis. */
export function ColumnSorter() {
  return (
    <Sorter
      prompt="Which column of the family grid does each model belong in? Read the hint as you would read an abstract."
      options={["Actions only", "Actions plus futures", "Futures only", "Plan in language"]}
      items={[
        { name: "OpenVLA", hint: "predicts discretised action tokens from an image and an instruction", answer: "Actions only",
          why: "Nothing about the future is generated; the output is the next actions." },
        { name: "Cosmos Policy", hint: "encodes actions, future states and values as latent video frames", answer: "Actions plus futures",
          why: "The same denoising pass produces the action and the predicted future, which is what puts it in chapter 6." },
        { name: "PointWorld", hint: "predicts how a point cloud moves under a robot's action", answer: "Futures only",
          why: "It is a world model in explicit geometry (chapter 9); a planner or policy turns its forecasts into actions." },
        { name: "Gemini Robotics-ER 2", hint: "tracks task progress and orchestrates steps for a robot", answer: "Plan in language",
          why: "It reasons and plans; motor control comes from another model below it (chapter 10)." },
        { name: "Fast-WAM", hint: "trained to predict video and actions, runs action-only at test time", answer: "Actions plus futures",
          why: "A boundary case: the family is decided by training, where futures are predicted, even though inference skips them. Chapter 6 argues it both ways." },
      ]}
    />
  );
}
