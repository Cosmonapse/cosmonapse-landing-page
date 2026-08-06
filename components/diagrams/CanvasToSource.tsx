import { Edge, Figure, Note, Tag } from "./Fig";

const FILES = [
  { name: "brain.py", note: "attaches, then run()", hot: true },
  { name: "neurons/planner.py", note: "written on add", hot: true },
  { name: "engram/store.py", note: "" },
  { name: "effector/tools.py", note: "" },
  { name: "receptors/cli.py", note: "" },
];

/**
 * The claim Genesis lives or dies on: the canvas is a view of your project,
 * not a model of it. Hence the arrow back - Genesis re-reads the file after
 * every structured edit rather than trusting what it just wrote.
 */
export default function CanvasToSource() {
  return (
    <Figure
      width={900}
      height={340}
      title="On the left, the Genesis canvas showing a synapse with three component nodes and an add-a-Neuron control. An arrow labelled writes real modules points right to a file tree containing brain.py, neurons slash planner.py, engram, effector and receptors. A second arrow returns from the files to the canvas, labelled re-reads from disk."
      caption="A node you place is a module Genesis writes into your project and wires into brain.py. Every structured edit goes through the AST, and the file on disk is re-read afterwards - so Genesis never holds a guess about what your code now says."
    >
      {/* canvas panel */}
      <rect x={40} y={44} width={340} height={210} rx={12} className="fig-plain" />
      <Tag x={60} y={34} anchor="start" tone="accent3">
        Genesis canvas
      </Tag>
      <g className="t-accent2">
        <rect x={72} y={140} width={276} height={10} rx={5} className="fig-box" />
      </g>
      <g className="t-accent">
        <circle cx={130} cy={196} r={15} className="fig-hollow" />
        <line x1={130} y1={150} x2={130} y2={181} className="fig-hair" />
      </g>
      <g className="t-engram">
        <polygon points="210,182 226,198 210,214 194,198" className="fig-hollow" />
        <line x1={210} y1={150} x2={210} y2={182} className="fig-hair" />
      </g>
      <g className="t-accent2">
        <path d="M276,96 A 16,16 0 0 0 308,96 L302,96 A 10,10 0 0 1 282,96 Z" className="fig-hollow" />
        <line x1={292} y1={112} x2={292} y2={140} className="fig-hair" />
      </g>
      <g className="t-accent3">
        <rect x={72} y={64} width={104} height={26} rx={13} className="fig-box" />
        <text className="fig-tag" x={124} y={81} textAnchor="middle">
          + Neuron
        </text>
      </g>

      {/* the two arrows between them */}
      <Edge x1={392} y1={112} x2={508} y2={112} tone="accent3" label="writes real modules" labelDy={-12} />
      <Edge x1={508} y1={188} x2={392} y2={188} tone="accent3" dashed label="re-reads from disk" labelDy={22} />

      {/* project panel */}
      <rect x={520} y={44} width={340} height={210} rx={12} className="fig-plain" />
      <Tag x={540} y={34} anchor="start" tone="accent3">
        your project
      </Tag>
      {FILES.map((f, i) => {
        const y = 84 + i * 34;
        return (
          <g key={f.name} className={f.hot ? "t-accent3" : "t-neutral"}>
            {f.hot && <rect x={540} y={y - 17} width={300} height={26} rx={6} className="fig-box" />}
            <text className="fig-tag" x={556} y={y} textAnchor="start">
              {f.name}
            </text>
            {f.note && (
              <text className="fig-sub" x={824} y={y} textAnchor="end">
                {f.note}
              </text>
            )}
          </g>
        );
      })}

      <Note x={450} y={300}>
        the file on disk is the only artifact - hand-edit it and reopen, there is no resync step
      </Note>
    </Figure>
  );
}
