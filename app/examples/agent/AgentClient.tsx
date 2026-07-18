"use client";

import React from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import PrismPreview from "@/components/PrismPreview";

// ---------------------------------------------------------------------------
// Snippets  -  kept in sync with cosmonapse-examples/14-agent/
// ---------------------------------------------------------------------------

const topologySnippet = `One dispatch, no loop  -  the Dendrites chain the run themselves

  agent-loop (orchestrator) --- ONE TASK <span class="tk-str">["planner"]</span> ---&gt; awaits the trace's FINAL

  planner-node   <span class="tk-fn">@on_agent_output</span>(<span class="tk-str">"planner"</span>)   -&gt; TASK <span class="tk-str">["research"|"coding"]</span>,
                                                 <span class="tk-kw">or</span> assemble + imprint + FINAL
  research-node  <span class="tk-fn">@on_agent_output</span>(<span class="tk-str">"research"</span>)  -&gt; TASK <span class="tk-str">["planner"]</span> (next step)
  coding-node    <span class="tk-fn">@on_agent_output</span>(<span class="tk-str">"coding"</span>)    -&gt; TASK <span class="tk-str">["planner"]</span> (next step)
  engram host    <span class="tk-fn">@on_imprint_signal</span>            -&gt; mirror <span class="tk-str">"answer"</span> imprints to disk
  tool nodes     <span class="tk-fn">@on_tool_call</span>(&lt;capability&gt;)   -&gt; run the MCP, reply TOOL_RESULT

  tools (workers)  web-node (websearch + fetch Axons) | clock | files
  planner -&gt; <span class="tk-str">["time"]</span>   research -&gt; <span class="tk-str">["websearch"] ["fetch"]</span>   coding -&gt; <span class="tk-str">["filesystem"]</span>`;
const installSnippet = `<span class="tk-cm"># Needs a real HF_TOKEN in cosmonapse-examples/.env. fetch/time run via</span>
<span class="tk-cm"># uvx (install uv); filesystem runs via npx (Node 18+).</span>
<span class="tk-op">$</span> pip install cosmonapse httpx python-dotenv mcp fastapi uvicorn
<span class="tk-op">$</span> pip install duckduckgo-mcp-server   <span class="tk-cm"># the websearch tool (launched via uvx)</span>
<span class="tk-op">$</span> uvicorn app:app <span class="tk-op">--</span>port 8000

<span class="tk-op">$</span> curl -X POST localhost:8000/run -H <span class="tk-str">'content-type: application/json'</span> \\
       -d <span class="tk-str">'{"goal": "Research X and write a Python script that does Y"}'</span>
<span class="tk-op">$</span> curl localhost:8000/memory`;
const runAgentSnippet = `<span class="tk-cm"># run_agent - dispatch ONE TASK, wait for FINAL. No loop; the nodes chain.</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">run_agent</span>(orchestrator, goal, *, max_steps<span class="tk-op">=</span>MAX_STEPS, timeout_s<span class="tk-op">=</span><span class="tk-num">600.0</span>):
    tag <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()        <span class="tk-cm"># the run's trace; also labels engram entries</span>
    sig <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(
        capabilities<span class="tk-op">=</span>[<span class="tk-str">"planner"</span>],
        input<span class="tk-op">=</span>{<span class="tk-str">"goal"</span>: goal, <span class="tk-str">"tag"</span>: tag, <span class="tk-str">"step"</span>: <span class="tk-num">1</span>, <span class="tk-str">"max_steps"</span>: max_steps,
               <span class="tk-str">"steps"</span>: [], <span class="tk-str">"sources"</span>: []},
        trace_id<span class="tk-op">=</span>tag,
        scope<span class="tk-op">=</span><span class="tk-str">"terminal"</span>,       <span class="tk-cm"># resolve on FINAL / ERROR only</span>
        finalize<span class="tk-op">=</span><span class="tk-kw">False</span>,         <span class="tk-cm"># the planner node owns FINAL, not a worker</span>
        timeout_s<span class="tk-op">=</span>timeout_s,
    )
    <span class="tk-kw">if</span> sig.type <span class="tk-kw">is</span> SignalType.ERROR:
        <span class="tk-kw">raise</span> RuntimeError(<span class="tk-str">f"run failed: {sig.payload.get('message')}"</span>)
    <span class="tk-kw">return</span> sig.payload[<span class="tk-str">"result"</span>]`;
const stockNeuronSnippet = `<span class="tk-cm"># The neuron_fn is a STOCK Neuron - an HF-router chat model with zero</span>
<span class="tk-cm"># protocol knowledge. Everything else is decorator-specified on its Axon.</span>
AXON <span class="tk-op">=</span> Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"planner"</span>, neuron_fn<span class="tk-op">=</span><span class="tk-fn">llm</span>(MODEL), capabilities<span class="tk-op">=</span>[<span class="tk-str">"planner"</span>])

<span class="tk-fn">@AXON.before_task</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">situate</span>(input):
    <span class="tk-str">"""Cache check + progress recall + clock grounding, then the prompt."""</span>
    tid, _ <span class="tk-op">=</span> <span class="tk-fn">ambient_trace</span>()
    d <span class="tk-op">=</span> AXON.dendrite

    <span class="tk-cm"># A previously remembered answer short-circuits the whole run.</span>
    cached <span class="tk-op">=</span> <span class="tk-kw">await</span> d.<span class="tk-fn">recall</span>(engram_id<span class="tk-op">=</span>ENGRAM_ID,
                            query<span class="tk-op">=</span>{<span class="tk-str">"merge_key"</span>: <span class="tk-str">f"answer:{input['goal']}"</span>},
                            deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>)

    <span class="tk-cm"># Progress is not carried by any node - it is recalled from the engram.</span>
    done <span class="tk-op">=</span> <span class="tk-kw">await</span> d.<span class="tk-fn">recall</span>(engram_id<span class="tk-op">=</span>ENGRAM_ID,
                          query<span class="tk-op">=</span>{<span class="tk-str">"tag"</span>: input[<span class="tk-str">"tag"</span>], <span class="tk-str">"top_k"</span>: <span class="tk-num">50</span>},
                          deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>)

    <span class="tk-cm"># Ground the prompt in real time - via the planner's OWN clock tool.</span>
    clock <span class="tk-op">=</span> <span class="tk-kw">await</span> bus.<span class="tk-fn">mcp</span>(d, [<span class="tk-str">"time"</span>], <span class="tk-str">"get_current_time"</span>, {<span class="tk-str">"timezone"</span>: <span class="tk-str">"UTC"</span>})
    <span class="tk-kw">return</span> {<span class="tk-str">"messages"</span>: [...]}   <span class="tk-cm"># the prompt the stock Neuron will run</span>

<span class="tk-fn">@AXON.detects_output</span>
<span class="tk-kw">def</span> <span class="tk-fn">decide</span>(raw):
    <span class="tk-str">"""Parse the model's JSON; force finish past max_steps; echo the chain."""</span>
    decision <span class="tk-op">=</span> <span class="tk-fn">_first_json</span>(raw.<span class="tk-fn">get</span>(<span class="tk-str">"response"</span>)) <span class="tk-kw">or</span> {}
    ...
    <span class="tk-kw">return</span> {<span class="tk-str">"route"</span>: route, <span class="tk-str">"task"</span>: task, **chain}`;
const chainSnippet = `<span class="tk-fn">@AXON.host.on_agent_output</span>(neuron<span class="tk-op">=</span><span class="tk-str">"planner"</span>)
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">chain</span>(sig):
    <span class="tk-str">"""Declared at module level. The Axon applies it to the HOSTING
    Dendrite when announced (subscription ensured) - no on_connect
    boilerplate, no wiring helpers."""</span>
    node <span class="tk-op">=</span> AXON.dendrite
    d <span class="tk-op">=</span> sig.payload.<span class="tk-fn">get</span>(<span class="tk-str">"output"</span>, {})
    route, goal, tag <span class="tk-op">=</span> d.<span class="tk-fn">get</span>(<span class="tk-str">"route"</span>), d.<span class="tk-fn">get</span>(<span class="tk-str">"goal"</span>), d.<span class="tk-fn">get</span>(<span class="tk-str">"tag"</span>)

    <span class="tk-kw">if</span> route <span class="tk-kw">in</span> (<span class="tk-str">"research"</span>, <span class="tk-str">"coding"</span>):
        <span class="tk-cm"># The Dendrite CREATES the next TASK - same trace, so the</span>
        <span class="tk-cm"># chain's FINAL resolves the caller's Pathway.</span>
        <span class="tk-kw">await</span> node.<span class="tk-fn">dispatch_task</span>(
            capabilities<span class="tk-op">=</span>[route],
            input<span class="tk-op">=</span>{<span class="tk-str">"task"</span>: d.<span class="tk-fn">get</span>(<span class="tk-str">"task"</span>, <span class="tk-str">""</span>), <span class="tk-str">"goal"</span>: goal, <span class="tk-str">"tag"</span>: tag, ...},
            trace_id<span class="tk-op">=</span>sig.trace_id, parent_id<span class="tk-op">=</span>sig.id,
        )
        <span class="tk-kw">return</span>

    <span class="tk-cm"># finish: assemble the report from this run's engram entries,</span>
    <span class="tk-cm"># remember it under the goal, then conclude the trace.</span>
    got <span class="tk-op">=</span> <span class="tk-kw">await</span> node.<span class="tk-fn">recall</span>(engram_id<span class="tk-op">=</span>ENGRAM_ID,
                            query<span class="tk-op">=</span>{<span class="tk-str">"tag"</span>: tag, <span class="tk-str">"top_k"</span>: <span class="tk-num">50</span>}, ...)
    <span class="tk-kw">await</span> node.<span class="tk-fn">imprint</span>(engram_id<span class="tk-op">=</span>ENGRAM_ID, op<span class="tk-op">=</span><span class="tk-str">"upsert"</span>,
                       merge_key<span class="tk-op">=</span><span class="tk-str">f"answer:{goal}"</span>,
                       entry<span class="tk-op">=</span>{<span class="tk-str">"content"</span>: report, <span class="tk-str">"tags"</span>: [<span class="tk-str">"answer"</span>]},
                       meta<span class="tk-op">=</span>{<span class="tk-str">"path"</span>: report_path},
                       await_ack<span class="tk-op">=</span><span class="tk-kw">True</span>, deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>, ...)
    <span class="tk-kw">await</span> node.<span class="tk-fn">emit_final</span>(
        trace_id<span class="tk-op">=</span>sig.trace_id, parent_id<span class="tk-op">=</span>sig.id,
        result<span class="tk-op">=</span>{<span class="tk-str">"report"</span>: report, <span class="tk-str">"source"</span>: <span class="tk-str">"web"</span>, ...},
    )`;
const researchSnippet = `<span class="tk-fn">@AXON.before_task</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">gather</span>(input):
    <span class="tk-str">"""Gather web context via MY tools, shaped into the prompt."""</span>
    search <span class="tk-op">=</span> <span class="tk-kw">await</span> bus.<span class="tk-fn">mcp</span>(d, [<span class="tk-str">"websearch"</span>], <span class="tk-str">"search"</span>,
                           {<span class="tk-str">"query"</span>: task, <span class="tk-str">"max_results"</span>: <span class="tk-num">5</span>})
    page <span class="tk-op">=</span> <span class="tk-kw">await</span> bus.<span class="tk-fn">mcp</span>(d, [<span class="tk-str">"fetch"</span>], <span class="tk-str">"fetch"</span>,
                         {<span class="tk-str">"url"</span>: url, <span class="tk-str">"max_length"</span>: <span class="tk-num">2500</span>})
    <span class="tk-kw">return</span> {<span class="tk-str">"messages"</span>: [...]}   <span class="tk-cm"># subtask + web context</span>

<span class="tk-fn">@AXON.detects_output</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">note_and_imprint</span>(raw):
    <span class="tk-str">"""Shape the note, remember it (dendrite.imprint), echo the chain."""</span>
    note <span class="tk-op">=</span> (raw.<span class="tk-fn">get</span>(<span class="tk-str">"response"</span>) <span class="tk-kw">or</span> <span class="tk-str">""</span>).<span class="tk-fn">strip</span>()
    <span class="tk-kw">await</span> AXON.dendrite.<span class="tk-fn">imprint</span>(
        engram_id<span class="tk-op">=</span>ENGRAM_ID, op<span class="tk-op">=</span><span class="tk-str">"append"</span>,
        entry<span class="tk-op">=</span>{<span class="tk-str">"content"</span>: note, <span class="tk-str">"tags"</span>: [<span class="tk-str">"research"</span>, st.<span class="tk-fn">get</span>(<span class="tk-str">"tag"</span>, <span class="tk-str">""</span>)]},
        await_ack<span class="tk-op">=</span><span class="tk-kw">True</span>, deadline_ms<span class="tk-op">=</span><span class="tk-num">2000</span>,
    )
    <span class="tk-kw">return</span> {<span class="tk-str">"note"</span>: note, **chain_state}

<span class="tk-cm"># @AXON.host.on_agent_output(neuron="research"): the chain handler hands</span>
<span class="tk-cm"># back to the planner with step + 1 - same trace, same pattern as above.</span>`;
const busSnippet = `<span class="tk-cm"># bus.py - MCP tools are NOT tasks. A tool invocation rides the cognition</span>
<span class="tk-cm"># pair built for exactly this: TOOL_CALL out, TOOL_RESULT back.</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">mcp</span>(dendrite, caps, tool, arguments, *, timeout<span class="tk-op">=</span><span class="tk-num">60.0</span>):
    <span class="tk-str">"""Call one MCP tool over the TOOL_CALL / TOOL_RESULT signal pair."""</span>
    call_id <span class="tk-op">=</span> <span class="tk-fn">new_event_id</span>()
    tid <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()            <span class="tk-cm"># own trace: never the agent chain's</span>
    pw <span class="tk-op">=</span> <span class="tk-kw">await</span> dendrite.<span class="tk-fn">observe_pathway</span>(tid)
    <span class="tk-kw">async</span> <span class="tk-kw">with</span> pw:
        <span class="tk-kw">await</span> dendrite.<span class="tk-fn">emit_tool_call</span>(
            trace_id<span class="tk-op">=</span>tid, parent_id<span class="tk-op">=</span>call_id,
            tool<span class="tk-op">=</span>tool, args<span class="tk-op">=</span>arguments, call_id<span class="tk-op">=</span>call_id,
            neuron<span class="tk-op">=</span>caps[<span class="tk-num">0</span>],         <span class="tk-cm"># directed at the CAPABILITY</span>
        )
        <span class="tk-kw">while</span> <span class="tk-kw">True</span>:
            sig <span class="tk-op">=</span> <span class="tk-kw">await</span> pw.<span class="tk-fn">wait_for</span>(SignalType.TOOL_RESULT, timeout_s<span class="tk-op">=</span>timeout)
            <span class="tk-kw">if</span> sig.payload.<span class="tk-fn">get</span>(<span class="tk-str">"call_id"</span>) <span class="tk-op">!=</span> call_id:
                <span class="tk-kw">continue</span>
            <span class="tk-kw">if</span> sig.payload.<span class="tk-fn">get</span>(<span class="tk-str">"error"</span>) <span class="tk-kw">is</span> <span class="tk-kw">not</span> <span class="tk-kw">None</span>:
                <span class="tk-kw">raise</span> RuntimeError(<span class="tk-str">f"{caps}.{tool} error: ..."</span>)
            <span class="tk-kw">return</span> sig.payload[<span class="tk-str">"result"</span>]

<span class="tk-cm"># Each exchange gets a FRESH trace, so a TOOL_RESULT can never resolve the</span>
<span class="tk-cm"># calling agent's pending chain Pathway - and doppler shows tool traffic as</span>
<span class="tk-cm"># TOOL_CALL -&gt; TOOL_RESULT, not nested TASKs. Tool calls are not role-gated</span>
<span class="tk-cm"># (only TASK/STOP are): even worker-role nodes call their tools.</span>`;
const toolsSnippet = `<span class="tk-cm"># A tool module: one stock MCP Neuron + ONE deferred host decorator.</span>
TOOL <span class="tk-op">=</span> Neuron(source<span class="tk-op">=</span><span class="tk-str">"mcp"</span>, command<span class="tk-op">=</span><span class="tk-str">"uvx"</span>, args<span class="tk-op">=</span>[<span class="tk-str">"duckduckgo-mcp-server"</span>])
AXON <span class="tk-op">=</span> Axon(neuron_id<span class="tk-op">=</span><span class="tk-str">"websearch"</span>, capabilities<span class="tk-op">=</span>[<span class="tk-str">"websearch"</span>], neuron_fn<span class="tk-op">=</span>TOOL)

<span class="tk-fn">@AXON.host.on_tool_call</span>(neuron<span class="tk-op">=</span><span class="tk-str">"websearch"</span>)     <span class="tk-cm"># calls to MY capability</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">call</span>(sig):
    <span class="tk-kw">await</span> bus.<span class="tk-fn">tool_reply</span>(AXON.dendrite, AXON.neuron_id, TOOL, sig)

<span class="tk-cm"># web-node hosts BOTH the websearch and fetch Axons - one Dendrite, two</span>
<span class="tk-cm"># tools; the directed-capability filters keep them discriminated locally.</span>`;
const memorySnippet = `ENGRAM <span class="tk-op">=</span> InMemoryEngram(engram_id<span class="tk-op">=</span><span class="tk-str">"agent-memory"</span>, engram_kind<span class="tk-op">=</span><span class="tk-str">"context"</span>)

host <span class="tk-op">=</span> Dendrite(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span>NAMESPACE,
                dendrite_id<span class="tk-op">=</span><span class="tk-str">"agent-memory-host"</span>,
                role<span class="tk-op">=</span><span class="tk-str">"worker"</span>)   <span class="tk-cm"># TOOL_CALLs aren't role-gated - no</span>
                                  <span class="tk-cm"># orchestrator rights needed for tools</span>
host.<span class="tk-fn">attach_engram</span>(ENGRAM)

<span class="tk-fn">@host.on_imprint_signal</span>
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">persist_answers</span>(sig):
    <span class="tk-str">"""Mirror "answer" imprints carrying a path to disk (filesystem MCP)."""</span>
    entry <span class="tk-op">=</span> sig.payload.<span class="tk-fn">get</span>(<span class="tk-str">"entry"</span>) <span class="tk-kw">or</span> {}
    path <span class="tk-op">=</span> (sig.meta <span class="tk-kw">or</span> {}).<span class="tk-fn">get</span>(<span class="tk-str">"path"</span>)
    <span class="tk-kw">if</span> path <span class="tk-kw">and</span> <span class="tk-str">"answer"</span> <span class="tk-kw">in</span> (entry.<span class="tk-fn">get</span>(<span class="tk-str">"tags"</span>) <span class="tk-kw">or</span> []):
        <span class="tk-kw">await</span> bus.<span class="tk-fn">mcp</span>(host, [<span class="tk-str">"filesystem"</span>], <span class="tk-str">"write_file"</span>,
                      {<span class="tk-str">"path"</span>: <span class="tk-fn">str</span>(ROOT / path),
                       <span class="tk-str">"content"</span>: entry.<span class="tk-fn">get</span>(<span class="tk-str">"content"</span>, <span class="tk-str">""</span>)})`;
const appSnippet = `<span class="tk-fn">@app.post</span>(<span class="tk-str">"/run"</span>)
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">run</span>(body: dict):
    <span class="tk-str">"""{"goal", "max_steps"?, "timeout_s"?} -&gt; the trace's FINAL payload."""</span>
    <span class="tk-kw">return</span> <span class="tk-kw">await</span> <span class="tk-fn">run_agent</span>(
        state[<span class="tk-str">"orchestrator"</span>], goal,
        max_steps<span class="tk-op">=</span><span class="tk-fn">int</span>(body.<span class="tk-fn">get</span>(<span class="tk-str">"max_steps"</span>, MAX_STEPS)),
        timeout_s<span class="tk-op">=</span><span class="tk-fn">float</span>(body.<span class="tk-fn">get</span>(<span class="tk-str">"timeout_s"</span>, <span class="tk-num">600.0</span>)),
    )

<span class="tk-fn">@app.get</span>(<span class="tk-str">"/memory"</span>)
<span class="tk-kw">async</span> <span class="tk-kw">def</span> <span class="tk-fn">memory</span>():
    <span class="tk-str">"""What the agent remembers - answers, research notes, code snapshots."""</span>
    ...

<span class="tk-cm"># A repeat goal returns instantly from the Engram ("source": "memory").</span>`;
const runSnippet = `<span class="tk-op">$</span> curl -X POST localhost:8000/run -H <span class="tk-str">'content-type: application/json'</span> \\
       -d <span class="tk-str">'{"goal": "Research the Collatz conjecture, then write a Python CLI
            that prints the Collatz sequence for N"}'</span>
{
  <span class="tk-str">"report"</span>: <span class="tk-str">"# Research the Collatz conjecture, ..."</span>,
  <span class="tk-str">"code_path"</span>: <span class="tk-str">"report/solution.py"</span>,
  <span class="tk-str">"report_path"</span>: <span class="tk-str">"report/answer.md"</span>,
  <span class="tk-str">"source"</span>: <span class="tk-str">"web"</span>,
  <span class="tk-str">"steps"</span>: [{<span class="tk-str">"route"</span>: <span class="tk-str">"research"</span>, ...}, {<span class="tk-str">"route"</span>: <span class="tk-str">"coding"</span>, ...}]
}

<span class="tk-cm"># run the same goal again - answered from memory on step 1:</span>
{ <span class="tk-str">"report"</span>: <span class="tk-str">"..."</span>, <span class="tk-str">"source"</span>: <span class="tk-str">"memory"</span>, <span class="tk-str">"steps"</span>: [] }`;
const prismWatchSnippet = `<span class="tk-cm"># Set SYNAPSE_URL to a running synapse to split across processes -</span>
<span class="tk-cm"># and to watch the chain live.</span>

<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace=agent

<span class="tk-cm"># terminal 2  -  Prism, the live browser view (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url=cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> agent

<span class="tk-cm"># terminal 3  -  the agent, pointed at the bus</span>
<span class="tk-op">$</span> SYNAPSE_URL=cosmo://127.0.0.1:7070 uvicorn app:app <span class="tk-op">--</span>port 8000`;


const scaffoldSnippet = `<span class="tk-op">$</span> cosmo init agent <span class="tk-op">-n</span> agent

<span class="tk-cm">  Scaffolded agent in ./agent</span>
<span class="tk-cm">    + config.py   + neurons/hello.py   + effector/tools.py</span>
<span class="tk-cm">    + brain.py    + demo.py            + README.md</span>`;

export default function AgentClient() {
  return (
    <>
      <header className="page-header">
        <div className="container">
          <div className="page-eyebrow">// Example 13 · Agent</div>
          <h1 className="page-title">A Choreographed Agent. No Loop.</h1>
          <p className="page-sub">
            A capability-routed agent with <strong>no supervisor loop</strong>:{" "}
            <code className="inline">run_agent</code> dispatches ONE TASK and awaits the
            trace&apos;s FINAL. Everything else is the Dendrites&apos; responsibility  -  each
            node&apos;s <code className="inline">@on_agent_output</code> handler picks Signals up
            and creates the next TASK. Every neuron_fn is a stock LLM or MCP{" "}
            <code className="inline">Neuron</code>; behaviour lives in decorator hooks. Every
            snippet is the real code from{" "}
            <code className="inline">cosmonapse-examples/14-agent</code>.
          </p>
        </div>
      </header>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Topology</div>
          <h2 className="sub-title">Planner, two specialists, four tools, one memory.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Three agent nodes (<code className="inline">role=&quot;orchestrator&quot;</code>  -  only
            because their chain handlers dispatch TASKs; tool calls are not role-gated), three
            worker tool nodes (web-node hosts the websearch AND fetch Axons), a worker engram
            host, and the caller. Chain state rides the TASK inputs; progress is recalled from the
            engram  -  no node holds run state.
          </p>
          <CodeBlock filename="topology" html={topologySnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">00 · Install &amp; run</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 16 }}>
            One process by default (in-process <code className="inline">MemorySynapse</code>);
            set <code className="inline">SYNAPSE_URL</code> to split across processes.
          </p>
          <CodeBlock html={installSnippet} maxWidth={840} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Scaffold</div>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Init, scaffold, then code. <code className="inline">cosmo init</code> writes the
            standard skeleton every example follows  -  {" "}
            <code className="inline">config.py</code>, <code className="inline">neurons/</code>,{" "}
            <code className="inline">effector/</code>, <code className="inline">brain.py</code>,{" "}
            <code className="inline">demo.py</code>  -  and the files on this page are what you
            code on top of the generated stubs.
          </p>
          <CodeBlock html={scaffoldSnippet} maxWidth={760} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">01 · One dispatch, no loop</div>
          <h2 className="sub-title">run_agent is a single dispatch_and_wait.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">scope=&quot;terminal&quot;</code> resolves the Pathway on
            FINAL / ERROR only, and <code className="inline">finalize=False</code> leaves FINAL to
            the chain  -  the run concludes when the planner node emits it. All chain TASKs share
            this trace, so that FINAL resolves this call.
          </p>
          <CodeBlock filename="brain.py" html={runAgentSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">02 · Stock Neurons, decorated behaviour</div>
          <h2 className="sub-title">The planner is just llm(MODEL) plus hooks.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">@before_task</code> shapes the TASK input  -  recall the
            answer cache and this run&apos;s progress via the Dendrite, ground the prompt with the
            clock tool. <code className="inline">@detects_output</code> shapes the raw reply into
            a validated route decision. The model itself never touches the protocol.
          </p>
          <CodeBlock filename="neurons/model/planner.py" html={stockNeuronSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">03 · The chain</div>
          <h2 className="sub-title">Dendrites create the TASKs.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Each agent&apos;s chain handler is ONE deferred host decorator  - {" "}
            <code className="inline">@AXON.host.on_agent_output</code>  -  applied to the hosting
            Dendrite when it announces the Axon, subscription ensured. The planner node routes to
            a specialist or  -  on finish  -  assembles the report from the engram, imprints it,
            and emits FINAL.
          </p>
          <CodeBlock filename="neurons/model/planner.py" html={chainSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">04 · A specialist</div>
          <h2 className="sub-title">Research: search, fetch, imprint, hand back.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            The research node gathers web context through its own tools in{" "}
            <code className="inline">@before_task</code>, imprints its note in{" "}
            <code className="inline">@detects_output</code>, and its chain handler dispatches the
            next planner TASK. The coding node is the same shape: recall notes, write{" "}
            <code className="inline">report/solution.py</code> via the filesystem MCP, imprint the
            code, hand back.
          </p>
          <CodeBlock filename="neurons/model/research.py" html={researchSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">05 · Tool calls</div>
          <h2 className="sub-title">MCP = TOOL_CALL → TOOL_RESULT. Not a TASK.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            A tool invocation rides the cognition pair made for it: the caller emits a{" "}
            <code className="inline">TOOL_CALL</code> directed at a <em>capability</em>, the tool
            node&apos;s <code className="inline">@AXON.host.on_tool_call</code> handler runs the
            MCP and answers with a <code className="inline">TOOL_RESULT</code> echoing the{" "}
            <code className="inline">call_id</code>. Fresh trace per exchange  -  tool traffic
            reads as tool traffic.
          </p>
          <CodeBlock filename="bus.py" html={busSnippet} maxWidth={880} />
          <div style={{ marginTop: 24 }}>
            <CodeBlock filename="neurons/mcp/*.py" html={toolsSnippet} maxWidth={880} />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">06 · Dendrite-owned memory</div>
          <h2 className="sub-title">No memory-access neuron.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Recall and imprint are Dendrite behaviour (<code className="inline">
            dendrite.recall / imprint(engram_id=...)</code>); ops fired from hooks inherit the
            TASK&apos;s trace via the ambient context. Host-side persistence is
            decorator-specified too: <code className="inline">@host.on_imprint_signal</code>{" "}
            mirrors answer imprints to <code className="inline">report/answer.md</code>.
          </p>
          <CodeBlock filename="brain.py" html={memorySnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">07 · The edge</div>
          <h2 className="sub-title">FastAPI stays at the edge.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            Same rule as{" "}
            <Link href="/examples/orchestrator-api" className="inline-link">Example 02</Link>: the
            web framework dispatches from its route handlers and never touches the protocol.
          </p>
          <CodeBlock filename="app.py" html={appSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">08 · Run it</div>
          <h2 className="sub-title">Web the first time, memory the second.</h2>
          <CodeBlock filename="terminal" html={runSnippet} maxWidth={880} />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Watch it in Prism</div>
          <h2 className="sub-title">TASK → TOOL_CALL → TOOL_RESULT → IMPRINT → FINAL, live.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            No observability is baked into the example  -  point{" "}
            <code className="inline">cosmo doppler</code> at the synapse and watch the chain hop
            between nodes as the run unfolds.
          </p>
          <CodeBlock filename="terminal" html={prismWatchSnippet} maxWidth={880} />
          <div style={{ marginTop: 24 }}>
            <PrismPreview namespace="agent" src="/prism/agent.mp4" />
          </div>
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/rag-mcp" className="card">
              <div className="card-icon">→</div>
              <h3>RAG + MCP coding agent</h3>
              <p>The staged retrieve → write → run pipeline this agent generalises.</p>
            </Link>
            <Link href="/examples/capability-routing" className="card">
              <div className="card-icon">→</div>
              <h3>Capability routing</h3>
              <p>Every TASK here routes by capability  -  nothing is addressed by neuron id.</p>
            </Link>
            <Link href="/examples/engram-integration" className="card">
              <div className="card-icon">→</div>
              <h3>Engram integration</h3>
              <p>The recall / imprint memory primitives the agent&apos;s cache is built on.</p>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
