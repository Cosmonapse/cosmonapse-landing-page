import { Box, Bus, Edge, Figure, Note, Primitive, Tag } from "./Fig";

/**
 * Observation without participation. The asymmetry is the point: every
 * participant's line is two-way, and the tap's is one-way.
 */
export default function ReadOnlyTap() {
  return (
    <Figure
      width={900}
      height={382}
      title="A synapse bus with three participants below it, each connected by a two-way arrow. Above the bus, a read-only tap labelled Prism is connected by a single dashed arrow pointing upward, away from the bus."
      caption="Every participant's line is two-way. The tap's is not - it joins no queue group, so it competes for nothing, sees everything, and the participants cannot tell it is there."
    >
      <Box x={450} y={62} w={230} h={54} label="Prism" sub="read-only tap" tone="accent2" />

      <Edge x1={450} y1={182} x2={450} y2={94} tone="accent2" dashed />
      <Tag x={478} y={142} anchor="start" tone="accent2">
        listens only, never emits
      </Tag>

      <Bus y={192} x0={60} x1={840} label="Synapse" />

      <Edge x1={216} y1={264} x2={216} y2={200} tone="neutral" arrow="both" />
      <Edge x1={444} y1={266} x2={444} y2={200} tone="neutral" arrow="both" />
      <Edge x1={672} y1={262} x2={672} y2={200} tone="neutral" arrow="both" />

      <Primitive x={216} y={286} kind="neuron" label="intake" />
      <Primitive x={444} y={286} kind="neuron" label="specialist" />
      <Primitive x={672} y={286} kind="effector" label="policy tool" />

      <Note x={450} y={362}>
        attach it to a running system and detach again without a deploy
      </Note>
    </Figure>
  );
}
