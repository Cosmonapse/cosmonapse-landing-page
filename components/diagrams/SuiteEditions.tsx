import { Box, Figure, Note, Tag } from "./Fig";

/**
 * Where the open source line falls.
 *
 * Left of the divider is Apache 2.0 and stays that way. Right of it is what
 * gets sold. The left column is deliberately whole on its own - nothing on
 * the paid side is load-bearing for anything on the free side - which is the
 * only claim this drawing is really making.
 */
export default function SuiteEditions() {
  return (
    <Figure
      width={900}
      height={380}
      title="A dashed vertical line divides the suite. On the open source side, Core sits under a free Genesis and Prism build. On the commercial side, a Pro tier sits beside them, with Cloud and Enterprise stacked above."
      caption="Core is Apache 2.0 and always will be. The essential Genesis and Prism builds are free with it. Pro, Cloud and Enterprise are the commercial layers, and none of them are shipping yet."
    >
      <Tag x={60} y={40} anchor="start" tone="accent">
        OPEN SOURCE · APACHE 2.0 · FOREVER
      </Tag>
      <Tag x={548} y={40} anchor="start" tone="accent3">
        COMMERCIAL · PLANNED
      </Tag>

      <line x1={520} y1={22} x2={520} y2={342} className="fig-hair fig-dash" />

      {/* Free side */}
      <Box
        x={288}
        y={92}
        w={456}
        h={54}
        label="Genesis + Prism, essential builds"
        sub="design it, run it, watch it - all local"
        tone="accent2"
      />
      <Box
        x={288}
        y={172}
        w={456}
        h={58}
        label="Cosmonapse Core"
        sub="Signal envelope · SDK · runtime · transports"
        tone="accent"
      />

      <Note x={288} y={232}>
        one pip install, no account, no key
      </Note>
      <Note x={288} y={254}>
        nothing on the right is load-bearing for anything on the left
      </Note>

      {/* Paid side */}
      <Box
        x={708}
        y={92}
        w={336}
        h={54}
        label="Pro"
        sub="the deeper Genesis and Prism surface"
        tone="accent3"
      />
      <Box
        x={708}
        y={172}
        w={336}
        h={54}
        label="Cloud"
        sub="hosted brains · deploy · collaborate"
        tone="accent3"
      />
      <Box
        x={708}
        y={252}
        w={336}
        h={54}
        label="Enterprise"
        sub="RBAC · audit · tenancy · HA · support"
        tone="accent3"
      />

      <Note x={708} y={306}>
        sold against operating burden, never against the protocol
      </Note>

      <Note x={450} y={366}>
        the protocol stays open so the systems you build on it stay yours
      </Note>
    </Figure>
  );
}
