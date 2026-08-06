import { Box, Bus, Edge, Figure, Note, Primitive, Pulse, Spark, Tag } from "./Fig";

/**
 * The site's thesis in one drawing: control flow you declared in advance,
 * against components reacting to Signals. The late reply is the whole
 * argument - on the left it has nowhere to arrive, on the right it is
 * indistinguishable from anything else on the bus.
 */
export default function CallStackVsBus() {
  return (
    <Figure
      width={920}
      height={400}
      title="A call stack beside an event bus. On the left a supervisor calls step A, which calls step B, which calls step C; a late reply arriving from outside has no frame to return into and is struck out. On the right, three participants and a late reply all sit on one synapse bus, and the late reply enters as an ordinary Signal."
      caption="Left: a supervisor holding the loop, and a reply that arrives after its frame is gone. Right: the same reply as a Signal on the bus, indistinguishable from any other."
    >
      <line x1={462} y1={24} x2={462} y2={366} className="fig-hair" />

      {/* ── call stack ─────────────────────────────────────────────── */}
      <Tag x={40} y={32} anchor="start" tone="muted">
        control flow
      </Tag>

      <Box x={220} y={74} w={172} h={46} label="supervisor" sub="holds the loop" tone="muted" />
      <Edge x1={220} y1={97} x2={220} y2={130} tone="muted" />
      <Box x={220} y={154} w={144} h={40} label="step A" plain />
      <Edge x1={220} y1={174} x2={220} y2={207} tone="muted" />
      <Box x={220} y={231} w={144} h={40} label="step B" plain />
      <Edge x1={220} y1={251} x2={220} y2={284} tone="muted" />
      <Box x={220} y={308} w={144} h={40} label="step C" plain />

      <Tag x={44} y={216} anchor="start" tone="muted">
        late reply
      </Tag>
      <line x1={46} y1={231} x2={124} y2={231} className="fig-hair fig-dash fig-flow" />
      <g className="t-muted">
        <line x1={130} y1={224} x2={144} y2={238} className="fig-strike" />
        <line x1={144} y1={224} x2={130} y2={238} className="fig-strike" />
      </g>
      <Note x={220} y={372}>
        no frame left to return into
      </Note>

      {/* ── event bus ──────────────────────────────────────────────── */}
      <Tag x={500} y={32} anchor="start" tone="accent2">
        event stream
      </Tag>

      <Box x={694} y={118} w={168} h={44} label="late reply" plain />
      <Edge x1={694} y1={140} x2={694} y2={192} tone="accent2" dashed />

      <Bus y={202} x0={500} x1={890} label="synapse" />

      <line x1={568} y1={209} x2={568} y2={268} className="fig-hair" />
      <line x1={694} y1={209} x2={694} y2={268} className="fig-hair" />
      <line x1={822} y1={209} x2={822} y2={272} className="fig-hair" />

      <Primitive x={568} y={288} kind="neuron" label="classifier" />
      <Primitive x={694} y={288} kind="neuron" label="reviewer" />
      <Primitive x={822} y={288} kind="effector" label="policy tool" />

      <Pulse x={568} y={288} r={22} delay={1.6} tone="accent" />
      <Pulse x={822} y={288} r={22} delay={3.4} tone="accent3" />

      <Spark
        route={[[694, 142], [694, 202], [568, 202], [568, 270]]}
        tone="accent2"
        dur={5.2}
        delay={0}
      />
      <Spark
        route={[[568, 270], [568, 202], [822, 202], [822, 272]]}
        tone="accent3"
        dur={5.2}
        delay={1.8}
      />
      <Spark
        route={[[822, 272], [822, 202], [694, 202], [694, 270]]}
        tone="accent3"
        dur={5.2}
        delay={3.5}
      />

      <Note x={694} y={372}>
        arrives as a Signal, like everything else
      </Note>
    </Figure>
  );
}
