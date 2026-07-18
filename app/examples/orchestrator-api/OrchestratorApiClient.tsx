"use client";

import React, { useState } from "react";
import Link from "next/link";
import CodeBlock from "@/components/CodeBlock";
import PrismPreview from "@/components/PrismPreview";

// ---------------------------------------------------------------------------
// Framework tab type
// ---------------------------------------------------------------------------
type Framework = "flask" | "fastapi" | "express" | "wsgi";

const FRAMEWORKS: { id: Framework; label: string; lang: string }[] = [
  { id: "flask",   label: "Flask",   lang: "Python" },
  { id: "fastapi", label: "FastAPI", lang: "Python" },
  { id: "express", label: "Express", lang: "TypeScript" },
  { id: "wsgi",    label: "WSGI",    lang: "Python" },
];

// ---------------------------------------------------------------------------
// Shared worker (identical for all Python tabs)
// ---------------------------------------------------------------------------
const workerHtml = `<span class="tk-cm"># worker.py  -  start this before any framework server</span>
<span class="tk-kw">import</span> asyncio, os
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Axon, Dendrite, Neuron, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> os.environ.<span class="tk-fn">get</span>(<span class="tk-str">"SYNAPSE_URL"</span>, <span class="tk-str">"cosmo://127.0.0.1:7070"</span>)

<span class="tk-kw">async def</span> <span class="tk-fn">main</span>():
    neuron <span class="tk-op">=</span> <span class="tk-fn">Neuron</span>(
        source<span class="tk-op">=</span><span class="tk-str">"huggingface"</span>,
        endpoint<span class="tk-op">=</span><span class="tk-str">"https://router.huggingface.co"</span>,
        model<span class="tk-op">=</span><span class="tk-str">"meta-llama/Llama-3.1-8B-Instruct"</span>,
        api_key<span class="tk-op">=</span>os.environ[<span class="tk-str">"HF_TOKEN"</span>],
        use_chat_api<span class="tk-op">=</span><span class="tk-kw">True</span>, max_new_tokens<span class="tk-op">=</span><span class="tk-num">256</span>,
    )
    axon     <span class="tk-op">=</span> <span class="tk-fn">Axon</span>(neuron_id<span class="tk-op">=</span><span class="tk-str">"worker"</span>, neuron_fn<span class="tk-op">=</span>neuron,
                    capabilities<span class="tk-op">=</span>[<span class="tk-str">"text-generation"</span>, <span class="tk-str">"chat"</span>])
    synapse  <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    dendrite <span class="tk-op">=</span> <span class="tk-fn">Dendrite</span>(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"api-demo"</span>, dendrite_id<span class="tk-op">=</span><span class="tk-str">"worker"</span>)
    dendrite.<span class="tk-fn">attach_axon</span>(axon)
    <span class="tk-kw">async with</span> dendrite:
        <span class="tk-fn">print</span>(<span class="tk-str">"worker ready"</span>)
        <span class="tk-kw">await</span> asyncio.<span class="tk-fn">Event</span>().<span class="tk-fn">wait</span>()   <span class="tk-cm"># run until Ctrl-C</span>

asyncio.<span class="tk-fn">run</span>(<span class="tk-fn">main</span>())`;

// ---------------------------------------------------------------------------
// Flask
// ---------------------------------------------------------------------------
const flaskInstall = `<span class="tk-cm"># Install SDK + Flask</span>
pip install cosmonapse httpx flask

<span class="tk-op">$</span> export HF_TOKEN<span class="tk-op">=</span>hf_xxxxxxxxxxxxxxxxxxxxxxxx`;

const flaskWorker = `<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>api-demo

<span class="tk-cm"># terminal 2  -  the Neuron worker</span>
<span class="tk-op">$</span> python worker.py

<span class="tk-cm"># optional  -  Prism, the live browser view (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> api-demo

<span class="tk-cm"># terminal 3  -  Flask</span>
<span class="tk-op">$</span> python flask_app.py`;

const flaskApp = `<span class="tk-cm"># flask_app.py</span>
<span class="tk-kw">import</span> asyncio, threading, time, os
<span class="tk-kw">from</span> flask <span class="tk-kw">import</span> Flask, jsonify, request
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> os.environ.<span class="tk-fn">get</span>(<span class="tk-str">"SYNAPSE_URL"</span>, <span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
app <span class="tk-op">=</span> <span class="tk-fn">Flask</span>(__name__)

<span class="tk-cm"># Flask is sync  -  run a dedicated asyncio loop in a background thread</span>
<span class="tk-cm"># and share one Dendrite for the process lifetime.</span>
_loop: asyncio.AbstractEventLoop
_dendrite: Dendrite

<span class="tk-kw">async def</span> <span class="tk-fn">_connect</span>():
    <span class="tk-kw">global</span> _dendrite
    synapse   <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    _dendrite <span class="tk-op">=</span> <span class="tk-fn">Dendrite</span>(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"api-demo"</span>,
                         dendrite_id<span class="tk-op">=</span><span class="tk-str">"flask-orchestrator"</span>)
    <span class="tk-kw">await</span> _dendrite.<span class="tk-fn">__aenter__</span>()

<span class="tk-kw">def</span> <span class="tk-fn">_start_loop</span>():
    <span class="tk-kw">global</span> _loop
    _loop <span class="tk-op">=</span> asyncio.<span class="tk-fn">new_event_loop</span>()
    asyncio.<span class="tk-fn">set_event_loop</span>(_loop)
    _loop.<span class="tk-fn">run_until_complete</span>(<span class="tk-fn">_connect</span>())
    _loop.<span class="tk-fn">run_forever</span>()

threading.<span class="tk-fn">Thread</span>(target<span class="tk-op">=</span>_start_loop, daemon<span class="tk-op">=</span><span class="tk-kw">True</span>).<span class="tk-fn">start</span>()
time.<span class="tk-fn">sleep</span>(<span class="tk-num">0.5</span>)   <span class="tk-cm"># give the loop time to connect</span>

<span class="tk-op">@</span>app.<span class="tk-fn">post</span>(<span class="tk-str">"/ask"</span>)
<span class="tk-kw">def</span> <span class="tk-fn">ask</span>():
    prompt <span class="tk-op">=</span> request.<span class="tk-fn">get_json</span>().<span class="tk-fn">get</span>(<span class="tk-str">"prompt"</span>, <span class="tk-str">""</span>)
    <span class="tk-kw">if not</span> prompt:
        <span class="tk-kw">return</span> <span class="tk-fn">jsonify</span>({<span class="tk-str">"error"</span>: <span class="tk-str">"prompt required"</span>}), <span class="tk-num">400</span>
    future <span class="tk-op">=</span> asyncio.<span class="tk-fn">run_coroutine_threadsafe</span>(
        _dendrite.<span class="tk-fn">dispatch_and_wait</span>(
            neuron<span class="tk-op">=</span><span class="tk-str">"worker"</span>, input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: prompt}, timeout_s<span class="tk-op">=</span><span class="tk-num">30.0</span>,
        ), _loop,
    )
    reply <span class="tk-op">=</span> future.<span class="tk-fn">result</span>(timeout<span class="tk-op">=</span><span class="tk-num">32</span>)
    <span class="tk-kw">return</span> <span class="tk-fn">jsonify</span>({<span class="tk-str">"response"</span>: reply.payload[<span class="tk-str">"output"</span>][<span class="tk-str">"response"</span>]})

<span class="tk-kw">if</span> __name__ <span class="tk-op">==</span> <span class="tk-str">"__main__"</span>:
    app.<span class="tk-fn">run</span>(port<span class="tk-op">=</span><span class="tk-num">5000</span>)`;

const flaskCurl = `<span class="tk-op">$</span> curl <span class="tk-op">-X</span> POST http://127.0.0.1:5000/ask \\
       <span class="tk-op">-H</span> <span class="tk-str">"Content-Type: application/json"</span> \\
       <span class="tk-op">-d</span> <span class="tk-str">'{"prompt": "What is a Dendrite?"}'</span>

<span class="tk-cm">{"response": "A Dendrite is the component that connects your application ..."}</span>`;

// ---------------------------------------------------------------------------
// FastAPI
// ---------------------------------------------------------------------------
const fastapiInstall = `<span class="tk-cm"># Install SDK + FastAPI + uvicorn</span>
pip install cosmonapse httpx fastapi uvicorn

<span class="tk-op">$</span> export HF_TOKEN<span class="tk-op">=</span>hf_xxxxxxxxxxxxxxxxxxxxxxxx`;

const fastapiRun = `<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>api-demo

<span class="tk-cm"># terminal 2  -  the Neuron worker</span>
<span class="tk-op">$</span> python worker.py

<span class="tk-cm"># optional  -  Prism, the live browser view (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> api-demo

<span class="tk-cm"># terminal 3  -  FastAPI via uvicorn</span>
<span class="tk-op">$</span> uvicorn fastapi_app:app <span class="tk-op">--</span>port <span class="tk-num">8000</span>`;

const fastapiApp = `<span class="tk-cm"># fastapi_app.py</span>
<span class="tk-kw">import</span> os
<span class="tk-kw">from</span> contextlib <span class="tk-kw">import</span> asynccontextmanager
<span class="tk-kw">from</span> fastapi <span class="tk-kw">import</span> FastAPI, HTTPException
<span class="tk-kw">from</span> pydantic <span class="tk-kw">import</span> BaseModel
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> os.environ.<span class="tk-fn">get</span>(<span class="tk-str">"SYNAPSE_URL"</span>, <span class="tk-str">"cosmo://127.0.0.1:7070"</span>)

<span class="tk-cm"># FastAPI is async-native  -  no background thread needed.</span>
<span class="tk-cm"># The lifespan context manager connects once and tears down cleanly.</span>
<span class="tk-kw">class</span> <span class="tk-fn">_State</span>:
    dendrite: Dendrite

state <span class="tk-op">=</span> <span class="tk-fn">_State</span>()

<span class="tk-op">@</span><span class="tk-fn">asynccontextmanager</span>
<span class="tk-kw">async def</span> <span class="tk-fn">lifespan</span>(app: FastAPI):
    synapse       <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    state.dendrite <span class="tk-op">=</span> <span class="tk-fn">Dendrite</span>(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"api-demo"</span>,
                              dendrite_id<span class="tk-op">=</span><span class="tk-str">"fastapi-orchestrator"</span>)
    <span class="tk-kw">async with</span> state.dendrite:
        <span class="tk-kw">yield</span>          <span class="tk-cm"># server runs here</span>
    <span class="tk-kw">await</span> synapse.<span class="tk-fn">close</span>()

app <span class="tk-op">=</span> <span class="tk-fn">FastAPI</span>(lifespan<span class="tk-op">=</span>lifespan)

<span class="tk-kw">class</span> <span class="tk-fn">AskBody</span>(BaseModel):
    prompt: str
    timeout_s: float <span class="tk-op">=</span> <span class="tk-num">30.0</span>

<span class="tk-op">@</span>app.<span class="tk-fn">post</span>(<span class="tk-str">"/ask"</span>)
<span class="tk-kw">async def</span> <span class="tk-fn">ask</span>(body: AskBody):
    <span class="tk-kw">try</span>:
        reply <span class="tk-op">=</span> <span class="tk-kw">await</span> state.dendrite.<span class="tk-fn">dispatch_and_wait</span>(
            neuron<span class="tk-op">=</span><span class="tk-str">"worker"</span>, input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: body.prompt},
            timeout_s<span class="tk-op">=</span>body.timeout_s,
        )
    <span class="tk-kw">except</span> TimeoutError:
        <span class="tk-kw">raise</span> <span class="tk-fn">HTTPException</span>(<span class="tk-num">504</span>, <span class="tk-str">"worker timed out"</span>)
    <span class="tk-kw">return</span> {<span class="tk-str">"response"</span>: reply.payload[<span class="tk-str">"output"</span>][<span class="tk-str">"response"</span>]}`;

const fastapiCurl = `<span class="tk-op">$</span> curl <span class="tk-op">-X</span> POST http://127.0.0.1:8000/ask \\
       <span class="tk-op">-H</span> <span class="tk-str">"Content-Type: application/json"</span> \\
       <span class="tk-op">-d</span> <span class="tk-str">'{"prompt": "What is a Synapse?"}'</span>

<span class="tk-cm">{"response": "A Synapse is the message bus that carries Signals between ..."}</span>`;

// ---------------------------------------------------------------------------
// Express (TypeScript)
// ---------------------------------------------------------------------------
const expressInstall = `<span class="tk-cm"># Install SDK + Express</span>
npm install <span class="tk-op">@</span>cosmonapse/sdk express
npm install <span class="tk-op">-D</span> tsx <span class="tk-op">@</span>types/express`;

const expressRun = `<span class="tk-cm"># terminal 1  -  the bus (devsynapse or NATS)</span>
<span class="tk-op">$</span> docker run <span class="tk-op">-p</span> 4222:4222 nats:2.10

<span class="tk-cm"># terminal 2  -  the Neuron worker (Python)</span>
<span class="tk-op">$</span> SYNAPSE_URL<span class="tk-op">=</span>nats://127.0.0.1:4222 python worker.py

<span class="tk-cm"># terminal 3  -  Express</span>
<span class="tk-op">$</span> npx tsx express_app.ts`;

const expressApp = `<span class="tk-cm">// express_app.ts</span>
<span class="tk-kw">import</span> express <span class="tk-kw">from</span> <span class="tk-str">"express"</span>;
<span class="tk-kw">import</span> { Dendrite, NatsSynapse, newTraceId } <span class="tk-kw">from</span> <span class="tk-str">"@cosmonapse/sdk"</span>;

<span class="tk-cm">// One Dendrite per process  -  connected at startup, reused for every request.</span>
<span class="tk-kw">const</span> synapse  <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">NatsSynapse</span>({ url: process.env.SYNAPSE_URL <span class="tk-op">??</span> <span class="tk-str">"nats://127.0.0.1:4222"</span> });
<span class="tk-kw">const</span> dendrite <span class="tk-op">=</span> <span class="tk-kw">new</span> <span class="tk-fn">Dendrite</span>({ synapse, namespace: <span class="tk-str">"api-demo"</span>,
                                 dendriteId: <span class="tk-str">"express-orchestrator"</span>, heartbeatMs: <span class="tk-num">0</span> });

<span class="tk-kw">const</span> pending <span class="tk-op">=</span> <span class="tk-kw">new</span> Map&lt;string, (v: unknown) =&gt; void&gt;();
dendrite.<span class="tk-fn">onAgentOutput</span>((sig) =&gt; {
  <span class="tk-kw">const</span> resolve <span class="tk-op">=</span> pending.<span class="tk-fn">get</span>(sig.trace_id);
  <span class="tk-kw">if</span> (resolve) { pending.<span class="tk-fn">delete</span>(sig.trace_id); <span class="tk-fn">resolve</span>((sig.payload <span class="tk-kw">as</span> any).output); }
});

<span class="tk-kw">async function</span> <span class="tk-fn">dispatch</span>(prompt: string): Promise&lt;any&gt; {
  <span class="tk-kw">const</span> traceId <span class="tk-op">=</span> <span class="tk-fn">newTraceId</span>();
  <span class="tk-kw">const</span> done    <span class="tk-op">=</span> <span class="tk-kw">new</span> Promise&lt;unknown&gt;((res) =&gt; pending.<span class="tk-fn">set</span>(traceId, res));
  <span class="tk-kw">await</span> dendrite.<span class="tk-fn">dispatchTask</span>({ neuron: <span class="tk-str">"worker"</span>, input: { prompt }, traceId });
  <span class="tk-kw">return</span> done;
}

<span class="tk-kw">const</span> app <span class="tk-op">=</span> <span class="tk-fn">express</span>();
app.<span class="tk-fn">use</span>(express.<span class="tk-fn">json</span>());

app.<span class="tk-fn">post</span>(<span class="tk-str">"/ask"</span>, <span class="tk-kw">async</span> (req, res) =&gt; {
  <span class="tk-kw">const</span> { prompt } <span class="tk-op">=</span> req.body;
  <span class="tk-kw">if</span> (!prompt) { res.<span class="tk-fn">status</span>(<span class="tk-num">400</span>).<span class="tk-fn">json</span>({ error: <span class="tk-str">"prompt required"</span> }); <span class="tk-kw">return</span>; }
  <span class="tk-kw">try</span> {
    <span class="tk-kw">const</span> output <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">dispatch</span>(prompt) <span class="tk-kw">as</span> any;
    res.<span class="tk-fn">json</span>({ response: output?.response <span class="tk-op">??</span> <span class="tk-str">""</span> });
  } <span class="tk-kw">catch</span> (e: any) {
    res.<span class="tk-fn">status</span>(<span class="tk-num">504</span>).<span class="tk-fn">json</span>({ error: e.message });
  }
});

<span class="tk-cm">// Connect, then listen.</span>
synapse.<span class="tk-fn">connect</span>()
  .<span class="tk-fn">then</span>(() =&gt; dendrite.<span class="tk-fn">start</span>())
  .<span class="tk-fn">then</span>(() =&gt; app.<span class="tk-fn">listen</span>(<span class="tk-num">3000</span>, () =&gt; console.<span class="tk-fn">log</span>(<span class="tk-str">"listening on :3000"</span>)));`;

const expressCurl = `<span class="tk-op">$</span> curl <span class="tk-op">-X</span> POST http://localhost:3000/ask \\
       <span class="tk-op">-H</span> <span class="tk-str">"Content-Type: application/json"</span> \\
       <span class="tk-op">-d</span> <span class="tk-str">'{"prompt": "What is a Neuron?"}'</span>

<span class="tk-cm">{"response": "A Neuron is any async callable that processes a task ..."}</span>`;

// ---------------------------------------------------------------------------
// WSGI (raw)
// ---------------------------------------------------------------------------
const wsgiInstall = `<span class="tk-cm"># No extra dependencies  -  wsgiref ships with Python.</span>
pip install cosmonapse httpx

<span class="tk-op">$</span> export HF_TOKEN<span class="tk-op">=</span>hf_xxxxxxxxxxxxxxxxxxxxxxxx`;

const wsgiRun = `<span class="tk-cm"># terminal 1  -  the bus</span>
<span class="tk-op">$</span> cosmo synapse start memory <span class="tk-op">--</span>namespace<span class="tk-op">=</span>api-demo

<span class="tk-cm"># terminal 2  -  the Neuron worker</span>
<span class="tk-op">$</span> python worker.py

<span class="tk-cm"># optional  -  Prism, the live browser view (http://127.0.0.1:7071)</span>
<span class="tk-op">$</span> cosmo doppler <span class="tk-op">--</span>prism <span class="tk-op">--</span>url<span class="tk-op">=</span>cosmo://127.0.0.1:7070 <span class="tk-op">-n</span> api-demo

<span class="tk-cm"># terminal 3  -  raw WSGI (wsgiref dev server)</span>
<span class="tk-op">$</span> python wsgi_app.py

<span class="tk-cm"># or with gunicorn (sync workers, one process)</span>
<span class="tk-op">$</span> gunicorn <span class="tk-op">--</span>workers<span class="tk-op">=</span><span class="tk-num">1</span> <span class="tk-str">"wsgi_app:application"</span>`;

const wsgiApp = `<span class="tk-cm"># wsgi_app.py  -  the full callable, no framework</span>
<span class="tk-kw">import</span> asyncio, json, os, threading
<span class="tk-kw">from</span> cosmonapse <span class="tk-kw">import</span> Dendrite, connect_synapse

SYNAPSE_URL <span class="tk-op">=</span> os.environ.<span class="tk-fn">get</span>(<span class="tk-str">"SYNAPSE_URL"</span>, <span class="tk-str">"cosmo://127.0.0.1:7070"</span>)
_loop: asyncio.AbstractEventLoop
_dendrite: Dendrite
_ready <span class="tk-op">=</span> threading.<span class="tk-fn">Event</span>()

<span class="tk-kw">async def</span> <span class="tk-fn">_connect</span>():
    <span class="tk-kw">global</span> _dendrite
    synapse   <span class="tk-op">=</span> <span class="tk-kw">await</span> <span class="tk-fn">connect_synapse</span>(SYNAPSE_URL)
    _dendrite <span class="tk-op">=</span> <span class="tk-fn">Dendrite</span>(synapse<span class="tk-op">=</span>synapse, namespace<span class="tk-op">=</span><span class="tk-str">"api-demo"</span>,
                         dendrite_id<span class="tk-op">=</span><span class="tk-str">"wsgi-orchestrator"</span>)
    <span class="tk-kw">await</span> _dendrite.<span class="tk-fn">__aenter__</span>()

<span class="tk-kw">def</span> <span class="tk-fn">_start_loop</span>():
    <span class="tk-kw">global</span> _loop
    _loop <span class="tk-op">=</span> asyncio.<span class="tk-fn">new_event_loop</span>()
    asyncio.<span class="tk-fn">set_event_loop</span>(_loop)
    _loop.<span class="tk-fn">run_until_complete</span>(<span class="tk-fn">_connect</span>())
    _ready.<span class="tk-fn">set</span>()
    _loop.<span class="tk-fn">run_forever</span>()

threading.<span class="tk-fn">Thread</span>(target<span class="tk-op">=</span>_start_loop, daemon<span class="tk-op">=</span><span class="tk-kw">True</span>).<span class="tk-fn">start</span>()
_ready.<span class="tk-fn">wait</span>()  <span class="tk-cm"># block until the Dendrite is connected</span>

<span class="tk-kw">def</span> <span class="tk-fn">application</span>(environ, start_response):
    path <span class="tk-op">=</span> environ.<span class="tk-fn">get</span>(<span class="tk-str">"PATH_INFO"</span>, <span class="tk-str">"/"</span>)
    <span class="tk-kw">if</span> path <span class="tk-op">!=</span> <span class="tk-str">"/ask"</span>:
        start_response(<span class="tk-str">"404 Not Found"</span>, [(<span class="tk-str">"Content-Type"</span>, <span class="tk-str">"application/json"</span>)])
        <span class="tk-kw">return</span> [<span class="tk-fn">b</span><span class="tk-str">'{"error":"not found"}'</span>]
    length  <span class="tk-op">=</span> <span class="tk-fn">int</span>(environ.<span class="tk-fn">get</span>(<span class="tk-str">"CONTENT_LENGTH"</span>) <span class="tk-kw">or</span> <span class="tk-num">0</span>)
    payload <span class="tk-op">=</span> json.<span class="tk-fn">loads</span>(environ[<span class="tk-str">"wsgi.input"</span>].<span class="tk-fn">read</span>(length) <span class="tk-kw">or</span> <span class="tk-fn">b</span><span class="tk-str">"{}"</span>)
    prompt  <span class="tk-op">=</span> payload.<span class="tk-fn">get</span>(<span class="tk-str">"prompt"</span>, <span class="tk-str">""</span>)
    future  <span class="tk-op">=</span> asyncio.<span class="tk-fn">run_coroutine_threadsafe</span>(
        _dendrite.<span class="tk-fn">dispatch_and_wait</span>(
            neuron<span class="tk-op">=</span><span class="tk-str">"worker"</span>, input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: prompt}, timeout_s<span class="tk-op">=</span><span class="tk-num">30.0</span>,
        ), _loop,
    )
    reply  <span class="tk-op">=</span> future.<span class="tk-fn">result</span>(timeout<span class="tk-op">=</span><span class="tk-num">32</span>)
    body   <span class="tk-op">=</span> json.<span class="tk-fn">dumps</span>({<span class="tk-str">"response"</span>: reply.payload[<span class="tk-str">"output"</span>][<span class="tk-str">"response"</span>]}).<span class="tk-fn">encode</span>()
    start_response(<span class="tk-str">"200 OK"</span>, [
        (<span class="tk-str">"Content-Type"</span>, <span class="tk-str">"application/json"</span>),
        (<span class="tk-str">"Content-Length"</span>, <span class="tk-fn">str</span>(<span class="tk-fn">len</span>(body))),
    ])
    <span class="tk-kw">return</span> [body]

<span class="tk-kw">if</span> __name__ <span class="tk-op">==</span> <span class="tk-str">"__main__"</span>:
    <span class="tk-kw">from</span> wsgiref.simple_server <span class="tk-kw">import</span> make_server
    <span class="tk-kw">with</span> <span class="tk-fn">make_server</span>(<span class="tk-str">"127.0.0.1"</span>, <span class="tk-num">5001</span>, application) <span class="tk-kw">as</span> srv:
        srv.<span class="tk-fn">serve_forever</span>()`;

const wsgiCurl = `<span class="tk-op">$</span> curl <span class="tk-op">-X</span> POST http://127.0.0.1:5001/ask \\
       <span class="tk-op">-H</span> <span class="tk-str">"Content-Type: application/json"</span> \\
       <span class="tk-op">-d</span> <span class="tk-str">'{"prompt": "Explain WSGI in one line."}'</span>

<span class="tk-cm">{"response": "WSGI is the Python standard interface between web servers ..."}</span>`;

// ---------------------------------------------------------------------------
// Decorator snippets
// ---------------------------------------------------------------------------

// Python  -  shared across Flask / FastAPI / WSGI
const pyDecorators = `<span class="tk-cm"># Attach these to your orchestrator Dendrite after connecting.</span>
<span class="tk-cm"># They fire for every matching Signal in the namespace  -  perfect for</span>
<span class="tk-cm"># logging, metrics, clarification handling, and live progress feeds.</span>

<span class="tk-cm"># ── AGENT_OUTPUT ──────────────────────────────────────────────────────────</span>
<span class="tk-cm"># Fires when any worker finishes a TASK. Filter by neuron= or capability=.</span>
<span class="tk-cm"># dispatch_and_wait already resolves the caller's future on the same Signal;</span>
<span class="tk-cm"># use the decorator for side-effects (logging, metrics, webhooks).</span>
<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_agent_output</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_log_output</span>(sig):
    <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"[{sig.trace_id[:8]}] output from {sig.directed.id if sig.directed else '?'}"</span>)

<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_agent_output</span>(neuron<span class="tk-op">=</span><span class="tk-str">"worker"</span>)            <span class="tk-cm"># narrow by id</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_worker_done</span>(sig): ...

<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_agent_output</span>(capability<span class="tk-op">=</span><span class="tk-str">"text-generation"</span>)  <span class="tk-cm"># narrow by capability</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_gen_done</span>(sig): ...


<span class="tk-cm"># ── CLARIFICATION ─────────────────────────────────────────────────────────</span>
<span class="tk-cm"># The Neuron doesn't have enough context and asks a follow-up question.</span>
<span class="tk-cm"># respond_to_clarification re-dispatches a TASK with the answer attached,</span>
<span class="tk-cm"># keeping the same trace_id so the workflow stays coherent.</span>
<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_clarification</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_handle_clarification</span>(sig):
    question <span class="tk-op">=</span> sig.payload.<span class="tk-fn">get</span>(<span class="tk-str">"question"</span>, <span class="tk-str">""</span>)
    <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"[{sig.trace_id[:8]}] clarification: {question}"</span>)
    <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">respond_to_clarification</span>(
        sig, answer<span class="tk-op">=</span><span class="tk-str">"Please use plain English, no technical jargon."</span>
    )


<span class="tk-cm"># ── ERROR ──────────────────────────────────────────────────────────────────</span>
<span class="tk-cm"># A worker raised an exception. Log it or forward to your error tracker.</span>
<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_error_signal</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_handle_error</span>(sig):
    <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"[{sig.trace_id[:8]}] error: {sig.payload.get('message')}"</span>)


<span class="tk-cm"># ── ESCALATION ────────────────────────────────────────────────────────────</span>
<span class="tk-cm"># The Neuron hit a problem it can't resolve alone and surfaces it to the</span>
<span class="tk-cm"># orchestrator (or a human). respond_to_escalation sends a follow-up TASK.</span>
<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_escalation</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_handle_escalation</span>(sig):
    <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"[{sig.trace_id[:8]}] escalated: {sig.payload.get('reason')}"</span>)
    <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">respond_to_escalation</span>(
        sig, input<span class="tk-op">=</span>{<span class="tk-str">"override"</span>: <span class="tk-str">"proceed with best effort"</span>}
    )


<span class="tk-cm"># ── THOUGHT_DELTA ─────────────────────────────────────────────────────────</span>
<span class="tk-cm"># Streamed reasoning tokens emitted before AGENT_OUTPUT. Pipe these to</span>
<span class="tk-cm"># an SSE endpoint or WebSocket to show live progress to the user.</span>
<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_thought_delta</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_stream_thought</span>(sig):
    token <span class="tk-op">=</span> sig.payload.<span class="tk-fn">get</span>(<span class="tk-str">"delta"</span>, <span class="tk-str">""</span>)
    <span class="tk-fn">print</span>(token, end<span class="tk-op">=</span><span class="tk-str">""</span>, flush<span class="tk-op">=</span><span class="tk-kw">True</span>)


<span class="tk-cm"># ── TOOL_CALL / TOOL_RESULT ───────────────────────────────────────────────</span>
<span class="tk-cm"># Emitted when the Neuron calls an external tool. Use for audit logs.</span>
<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_tool_call</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_on_tool_call</span>(sig):
    <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"  tool → {sig.payload.get('tool_name')}"</span>)

<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_tool_result</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_on_tool_result</span>(sig):
    <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"  tool ← {sig.payload.get('tool_name')}"</span>)


<span class="tk-cm"># ── REGISTER / HEARTBEAT ──────────────────────────────────────────────────</span>
<span class="tk-cm"># Workers announce themselves on startup and each heartbeat interval.</span>
<span class="tk-cm"># Use to maintain a live worker roster or drive health dashboards.</span>
<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_register_signal</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_on_register</span>(sig):
    <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"worker joined: {sig.directed.id if sig.directed else '?'}  caps={sig.payload.get('capabilities')}"</span>)

<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_heartbeat_signal</span>
<span class="tk-kw">async def</span> <span class="tk-fn">_on_heartbeat</span>(sig):
    <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"heartbeat: {sig.directed.id if sig.directed else '?'}"</span>)


<span class="tk-cm"># ── on_trace  -  every Signal for one workflow ──────────────────────────────</span>
<span class="tk-cm"># Subscribe to all Signal types for a specific trace_id in one call.</span>
<span class="tk-cm"># Useful for per-request audit logs or live progress feeds.</span>
trace_id <span class="tk-op">=</span> <span class="tk-fn">new_trace_id</span>()

<span class="tk-op">@</span>orchestrator.<span class="tk-fn">on_trace</span>(trace_id)
<span class="tk-kw">async def</span> <span class="tk-fn">_trace_all</span>(sig):
    <span class="tk-fn">print</span>(<span class="tk-fn">f</span><span class="tk-str">"  [{sig.type.value:20}] {sig.directed.id if sig.directed else '?'}"</span>)

reply <span class="tk-op">=</span> <span class="tk-kw">await</span> orchestrator.<span class="tk-fn">dispatch_and_wait</span>(
    neuron<span class="tk-op">=</span><span class="tk-str">"worker"</span>, input<span class="tk-op">=</span>{<span class="tk-str">"prompt"</span>: prompt}, trace_id<span class="tk-op">=</span>trace_id,
)`;

// TypeScript (Express) variant
const tsDecorators = `<span class="tk-cm">// Attach to the module-level Dendrite after start().</span>

<span class="tk-cm">// ── onAgentOutput ─────────────────────────────────────────────────────────</span>
dendrite.<span class="tk-fn">onAgentOutput</span>((sig) <span class="tk-op">=&gt;</span>
  console.<span class="tk-fn">log</span>(<span class="tk-str">\`[\${sig.trace_id.slice(0, 8)}] output from \${sig.directed.id if sig.directed else '?'}\`</span>));

dendrite.<span class="tk-fn">onAgentOutput</span>({ neuron: <span class="tk-str">"worker"</span> }, (sig) <span class="tk-op">=&gt;</span> { <span class="tk-cm">/* narrow by id */</span> });
dendrite.<span class="tk-fn">onAgentOutput</span>({ capability: <span class="tk-str">"text-generation"</span> }, (sig) <span class="tk-op">=&gt;</span> { <span class="tk-cm">/* narrow by cap */</span> });


<span class="tk-cm">// ── onClarification ───────────────────────────────────────────────────────</span>
<span class="tk-cm">// The Neuron needs more context. respondToClarification keeps the trace alive.</span>
dendrite.<span class="tk-fn">onClarification</span>(<span class="tk-kw">async</span> (sig) <span class="tk-op">=&gt;</span> {
  <span class="tk-kw">const</span> question <span class="tk-op">=</span> (sig.payload <span class="tk-kw">as</span> any).question <span class="tk-kw">as</span> string;
  console.<span class="tk-fn">log</span>(<span class="tk-str">\`clarification: \${question}\`</span>);
  <span class="tk-kw">await</span> dendrite.<span class="tk-fn">respondToClarification</span>(sig, {
    answer: <span class="tk-str">"Please use plain English, no technical jargon."</span>,
  });
});


<span class="tk-cm">// ── onErrorSignal ─────────────────────────────────────────────────────────</span>
dendrite.<span class="tk-fn">onErrorSignal</span>((sig) <span class="tk-op">=&gt;</span>
  console.<span class="tk-fn">error</span>(<span class="tk-str">\`[\${sig.trace_id.slice(0, 8)}] error:\`</span>, (sig.payload <span class="tk-kw">as</span> any).message));


<span class="tk-cm">// ── onEscalation ──────────────────────────────────────────────────────────</span>
dendrite.<span class="tk-fn">onEscalation</span>(<span class="tk-kw">async</span> (sig) <span class="tk-op">=&gt;</span> {
  console.<span class="tk-fn">warn</span>(<span class="tk-str">\`escalated: \${(sig.payload <span class="tk-kw">as</span> any).reason}\`</span>);
  <span class="tk-kw">await</span> dendrite.<span class="tk-fn">respondToEscalation</span>(sig, { input: { override: <span class="tk-str">"proceed with best effort"</span> } });
});


<span class="tk-cm">// ── onThoughtDelta ────────────────────────────────────────────────────────</span>
<span class="tk-cm">// Streamed reasoning tokens. Pipe to SSE or WebSocket for live output.</span>
dendrite.<span class="tk-fn">onThoughtDelta</span>((sig) <span class="tk-op">=&gt;</span>
  process.stdout.<span class="tk-fn">write</span>((sig.payload <span class="tk-kw">as</span> any).delta <span class="tk-op">??</span> <span class="tk-str">""</span>));


<span class="tk-cm">// ── onToolCall / onToolResult ─────────────────────────────────────────────</span>
dendrite.<span class="tk-fn">onToolCall</span>((sig) <span class="tk-op">=&gt;</span> console.<span class="tk-fn">log</span>(<span class="tk-str">"  tool →"</span>, (sig.payload <span class="tk-kw">as</span> any).tool_name));
dendrite.<span class="tk-fn">onToolResult</span>((sig) <span class="tk-op">=&gt;</span> console.<span class="tk-fn">log</span>(<span class="tk-str">"  tool ←"</span>, (sig.payload <span class="tk-kw">as</span> any).tool_name));


<span class="tk-cm">// ── onRegisterSignal / onHeartbeatSignal ──────────────────────────────────</span>
dendrite.<span class="tk-fn">onRegisterSignal</span>((sig) <span class="tk-op">=&gt;</span>
  console.<span class="tk-fn">log</span>(<span class="tk-str">\`worker joined: \${sig.directed.id if sig.directed else '?'}\`</span>));
dendrite.<span class="tk-fn">onHeartbeatSignal</span>((sig) <span class="tk-op">=&gt;</span>
  console.<span class="tk-fn">log</span>(<span class="tk-str">\`heartbeat: \${sig.directed.id if sig.directed else '?'}\`</span>));


<span class="tk-cm">// ── onTrace  -  every Signal for one workflow ───────────────────────────────</span>
<span class="tk-kw">const</span> traceId <span class="tk-op">=</span> <span class="tk-fn">newTraceId</span>();
dendrite.<span class="tk-fn">onTrace</span>(traceId, (sig) <span class="tk-op">=&gt;</span>
  console.<span class="tk-fn">log</span>(<span class="tk-str">\`  [\${sig.type.padEnd(20)}] \${sig.directed.id if sig.directed else '?'}\`</span>));
<span class="tk-kw">await</span> dendrite.<span class="tk-fn">dispatchTask</span>({ neuron: <span class="tk-str">"worker"</span>, input: { prompt }, traceId });`;

const decoratorProseShared = (
  <>
    Decorators register async callbacks on the Dendrite for specific Signal
    types. They fire on every matching Signal in the namespace  -  independently
    of <code className="inline">dispatch_and_wait</code>, which resolves its own
    future on the same Signal. Use decorators for side-effects: logging,
    metrics, clarification handling, and live progress feeds.
  </>
);

// ---------------------------------------------------------------------------
// Per-framework step data
// ---------------------------------------------------------------------------
type Step = {
  eyebrow: string;
  prose: React.ReactNode;
  filename?: string;
  html: string;
  html2?: string;
  afterProse?: React.ReactNode;
  maxWidth?: number;
};

const STEPS: Record<Framework, Step[]> = {
  flask: [
    {
      eyebrow: "Install",
      prose: <>Flask is synchronous. We bridge to the async Cosmonapse SDK with a dedicated event loop running in a background thread  -  the same thread hosts the Dendrite for the whole process lifetime.</>,
      html: flaskInstall,
      maxWidth: 740,
    },
    {
      eyebrow: "Start the bus and worker",
      prose: <>The dev Synapse and the Neuron worker start first. The Flask app connects to the already-running bus on startup.</>,
      html: flaskWorker,
      maxWidth: 740,
    },
    {
      eyebrow: "The Flask app",
      prose: (
        <>
          One Dendrite per process  -  <strong>not</strong> per request. The background loop
          keeps it alive. Route handlers call{" "}
          <code className="inline">run_coroutine_threadsafe</code> to dispatch from sync
          Flask code into the async loop.
        </>
      ),
      filename: "flask_app.py",
      html: flaskApp,
    },
    {
      eyebrow: "Decorators",
      prose: decoratorProseShared,
      filename: "decorators.py",
      html: pyDecorators,
    },
    {
      eyebrow: "Try it",
      prose: <>Send a prompt and get a response from the Neuron:</>,
      html: flaskCurl,
      maxWidth: 740,
    },
  ],
  fastapi: [
    {
      eyebrow: "Install",
      prose: <>FastAPI is async-native, so route handlers can <code className="inline">await</code> the Dendrite directly  -  no background thread needed.</>,
      html: fastapiInstall,
      maxWidth: 740,
    },
    {
      eyebrow: "Start the bus and worker",
      prose: <>Same bus and worker as any other tab  -  only the web layer changes.</>,
      html: fastapiRun,
      maxWidth: 740,
    },
    {
      eyebrow: "The FastAPI app",
      prose: (
        <>
          The <code className="inline">lifespan</code> context manager connects the
          Dendrite on startup and closes it cleanly on shutdown. Route handlers{" "}
          <code className="inline">await state.dendrite.dispatch_and_wait(…)</code>{" "}
          directly  -  no threads, no bridging.
        </>
      ),
      filename: "fastapi_app.py",
      html: fastapiApp,
    },
    {
      eyebrow: "Decorators",
      prose: decoratorProseShared,
      filename: "decorators.py",
      html: pyDecorators,
    },
    {
      eyebrow: "Try it",
      prose: <>The response body is identical across all frameworks:</>,
      html: fastapiCurl,
      maxWidth: 740,
    },
  ],
  express: [
    {
      eyebrow: "Install",
      prose: <>The TypeScript SDK ships <code className="inline">NatsSynapse</code> for cross-process use. The Express server connects on startup, then reuses one Dendrite for all requests.</>,
      html: expressInstall,
      maxWidth: 740,
    },
    {
      eyebrow: "Start the bus and worker",
      prose: <>Express uses NATS here  -  swap the <code className="inline">SYNAPSE_URL</code> env var to point at any NATS server.</>,
      html: expressRun,
      maxWidth: 740,
    },
    {
      eyebrow: "The Express app",
      prose: (
        <>
          <code className="inline">dispatchTask</code> fires the TASK and a{" "}
          <code className="inline">Map</code> of pending promises resolves when{" "}
          <code className="inline">onAgentOutput</code> fires. Route handlers{" "}
          <code className="inline">await dispatch(prompt)</code>  -  clean and readable.
        </>
      ),
      filename: "express_app.ts",
      html: expressApp,
    },
    {
      eyebrow: "Decorators",
      prose: (
        <>
          The TypeScript SDK uses method calls instead of Python decorators, but
          the semantics are identical  -  callbacks fire for every matching Signal
          in the namespace. All filter options (<code className="inline">neuron</code>,{" "}
          <code className="inline">capability</code>,{" "}
          <code className="inline">traceId</code>) are available as an optional
          first argument.
        </>
      ),
      filename: "decorators.ts",
      html: tsDecorators,
    },
    {
      eyebrow: "Try it",
      prose: <>Same endpoint, same JSON shape:</>,
      html: expressCurl,
      maxWidth: 740,
    },
  ],
  wsgi: [
    {
      eyebrow: "Install",
      prose: <><code className="inline">wsgiref</code> ships with Python  -  no extra server dependency. For production, drop in gunicorn or waitress and point it at the <code className="inline">application</code> callable.</>,
      html: wsgiInstall,
      maxWidth: 740,
    },
    {
      eyebrow: "Start the bus and worker",
      prose: <>Identical to the Flask setup  -  only the app file changes.</>,
      html: wsgiRun,
      maxWidth: 740,
    },
    {
      eyebrow: "The WSGI callable",
      prose: (
        <>
          No framework at all  -  just the raw{" "}
          <code className="inline">application(environ, start_response)</code>{" "}
          contract. The Dendrite is still module-level, and{" "}
          <code className="inline">_ready.wait()</code> blocks import until it&apos;s
          connected, so the first request never arrives before the bus is live.
        </>
      ),
      filename: "wsgi_app.py",
      html: wsgiApp,
    },
    {
      eyebrow: "Decorators",
      prose: decoratorProseShared,
      filename: "decorators.py",
      html: pyDecorators,
    },
    {
      eyebrow: "Try it",
      prose: <>Runs on port 5001 by default:</>,
      html: wsgiCurl,
      maxWidth: 740,
    },
  ],
};

const EXTEND: Record<Framework, React.ReactNode> = {
  flask: (
    <>
      <p><strong>Multiple workers.</strong> Replace <code className="inline">neuron="worker"</code> with a round-robin pick from a list and add more <code className="inline">worker.py</code> processes  -  the Dendrite routes to whichever id you name.</p>
      <p><strong>Streaming.</strong> Use a <code className="inline">Pathway</code> directly instead of <code className="inline">dispatch_and_wait</code> and stream tokens back to the client via a Flask <code className="inline">Response(stream_with_context(…))</code>.</p>
      <p><strong>Auth.</strong> The Dendrite is just an object  -  wrap it in a class, inject it via Flask&apos;s app context (<code className="inline">g</code>), or keep it module-level. It&apos;s unaware of HTTP; add auth at the Flask layer as usual.</p>
    </>
  ),
  fastapi: (
    <>
      <p><strong>Background tasks.</strong> Call <code className="inline">dispatch_and_wait</code> inside a FastAPI <code className="inline">BackgroundTask</code> for fire-and-forget semantics  -  the response returns immediately while the Neuron works asynchronously.</p>
      <p><strong>Dependency injection.</strong> Wrap the Dendrite in a FastAPI <code className="inline">Depends</code> to inject it into route signatures rather than using the global <code className="inline">state</code> object.</p>
      <p><strong>WebSockets.</strong> Open a WebSocket route, iterate over a <code className="inline">Pathway</code>, and stream each partial Signal token back to the browser in real time.</p>
    </>
  ),
  express: (
    <>
      <p><strong>Capability routing.</strong> Instead of a fixed <code className="inline">"worker"</code> id, attach a <code className="inline">RegistryStore</code> to the Dendrite and call <code className="inline">findNeurons(capability)</code> to resolve the target at dispatch time.</p>
      <p><strong>Middleware.</strong> Wrap <code className="inline">dispatch</code> in Express middleware to add tracing headers, rate-limiting, or auth  -  the Cosmonapse layer is completely isolated from HTTP concerns.</p>
      <p><strong>Multiple Synapses.</strong> One Dendrite per Synapse  -  create two if you need to fan out across separate namespaces or brokers from the same Express server.</p>
    </>
  ),
  wsgi: (
    <>
      <p><strong>Gunicorn workers.</strong> Each gunicorn sync worker process creates its own Dendrite and asyncio loop  -  that&apos;s correct. The Synapse handles multi-producer traffic. Use <code className="inline">--workers=1</code> for dev; scale up as needed.</p>
      <p><strong>Upgrade path.</strong> Swap <code className="inline">wsgiref</code> for gunicorn or waitress without changing a line of Cosmonapse code. The <code className="inline">application</code> callable is framework-agnostic.</p>
      <p><strong>ASGI instead?</strong> Switch to the FastAPI tab  -  the ASGI lifespan is cleaner when you control the server config.</p>
    </>
  ),
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const scaffoldSnippet = `<span class="tk-op">$</span> cosmo init orchestrator-api <span class="tk-op">-n</span> api-demo

<span class="tk-cm">  Scaffolded orchestrator-api in ./orchestrator-api</span>
<span class="tk-cm">    + config.py   + neurons/hello.py   + effector/tools.py</span>
<span class="tk-cm">    + brain.py    + demo.py            + README.md</span>`;

export default function OrchestratorApiClient() {
  const [fw, setFw] = useState<Framework>("flask");
  const steps = STEPS[fw];

  return (
    <>
      {/* Breadcrumb */}
      <div className="example-breadcrumb">
        <div className="container">
          <Link href="/examples" className="breadcrumb-back">← Examples</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">Building an Orchestrator API</span>
        </div>
      </div>

      {/* Header */}
      <header className="page-header" style={{ marginBottom: 24 }}>
        <div className="container">
          <div className="page-eyebrow">// 09 · Orchestration</div>
          <h1 className="page-title">
            Your Framework at the Edge.<br />
            Dendrite in the Middle.
          </h1>
          <p className="page-sub">
            Flask, FastAPI, Express, or raw WSGI  -  whichever HTTP layer you
            already use. A route handler receives the request, calls{" "}
            <code className="inline">dispatch_and_wait</code> on a shared Dendrite,
            and returns the Neuron&apos;s reply. The framework never touches the
            Synapse; the Dendrite never touches HTTP.
          </p>
        </div>
      </header>

      {/* Architecture callout */}
      <section className="section-sm" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="arch-flow">
            <span className="arch-box">HTTP client</span>
            <span className="arch-arrow">→</span>
            <span className="arch-box arch-box--highlight">Flask / FastAPI / Express / WSGI</span>
            <span className="arch-arrow">→</span>
            <span className="arch-box arch-box--accent">Dendrite</span>
            <span className="arch-arrow">→</span>
            <span className="arch-box">Synapse</span>
            <span className="arch-arrow">→</span>
            <span className="arch-box">Neuron</span>
          </div>
          <p className="prose" style={{ marginTop: 16 }}>
            The Dendrite is the only Cosmonapse object your route handlers need.
            Create one per process at startup; reuse it for every request. The
            worker code is identical across all framework tabs  -  only the HTTP
            layer changes.
          </p>
        </div>
      </section>

      {/* Shared worker */}
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
          <div className="sub-eyebrow">00 · Shared worker</div>
          <p className="prose" style={{ marginBottom: 16 }}>
            Start this once before any framework server. It connects to the
            Synapse, registers under the id <code className="inline">"worker"</code>, and
            processes every TASK dispatched to it. The framework examples below
            all dispatch to this same worker.
          </p>
          <CodeBlock filename="worker.py" html={workerHtml} maxWidth={820} />
        </div>
      </section>

      {/* Framework tabs */}
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Pick your framework</div>
          <p className="prose" style={{ marginBottom: 18, marginTop: 4 }}>
            The Dendrite API is identical in every tab. The only differences
            are the install command, how you manage the async lifecycle, and
            the framework-specific request/response wiring.
          </p>
          <div className="fw-tabs" role="tablist" aria-label="Choose web framework">
            {FRAMEWORKS.map((f) => {
              const active = fw === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={active ? "fw-tab active" : "fw-tab"}
                  onClick={() => setFw(f.id)}
                >
                  <span className="fw-name">{f.label}</span>
                  <span className="fw-dot">·</span>
                  <span className="fw-lang">{f.lang}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Steps */}
      {steps.map((s, i) => (
        <section className="section-sm" key={`${fw}-${i}`}>
          <div className="container">
            <div className="sub-eyebrow">
              {String(i + 1).padStart(2, "0")} · {s.eyebrow}
            </div>
            {s.prose && (
              <p className="prose" style={{ marginBottom: 16 }}>{s.prose}</p>
            )}
            <CodeBlock filename={s.filename} html={s.html} maxWidth={s.maxWidth ?? 820} />
            {s.afterProse && (
              <p className="prose" style={{ marginTop: 16, marginBottom: 16 }}>{s.afterProse}</p>
            )}
            {s.html2 && <CodeBlock html={s.html2} maxWidth={s.maxWidth ?? 820} />}
          </div>
        </section>
      ))}

      {/* Extend */}
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Extend the pattern</div>
          <div className="prose">{EXTEND[fw]}</div>
        </div>
      </section>

      {/* Related */}
      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Watch it</div>
          <h2 className="sub-title">See it live in Prism.</h2>
          <p style={{ color: "var(--text-dim)", maxWidth: 760, marginBottom: 24 }}>
            <code className="inline">cosmo doppler --prism</code> opens a live, read-only view of
            every Signal on the bus as it fires. Run it against the dev synapse above to watch
            this workflow animate.
          </p>
          <PrismPreview namespace="api-demo" src="/prism/orchestrator-api.mp4" />
        </div>
      </section>

      <section className="section-sm">
        <div className="container">
          <div className="sub-eyebrow">Related</div>
          <div className="grid-3">
            <Link href="/examples/round-robin" className="card">
              <div className="card-icon">→</div>
              <h3>Round Robin</h3>
              <p>Dispatch across a pool of workers instead of one fixed id.</p>
            </Link>
            <Link href="/examples/real-world-neurons" className="card">
              <div className="card-icon">→</div>
              <h3>Real-world Neurons</h3>
              <p>Wrap stdio MCP servers and see why the web framework stays at the edge.</p>
            </Link>
            <Link href="/examples/capability-routing" className="card">
              <div className="card-icon">→</div>
              <h3>Capability Routing</h3>
              <p>Route by capability tag instead of a hard-coded neuron id.</p>
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        .example-breadcrumb { padding: 20px 0 0; position: relative; z-index: 1; }
        .example-breadcrumb .container {
          display: flex; align-items: center; gap: 10px;
          font-size: 13px; font-family: var(--font-mono, ui-monospace, monospace);
        }
        .breadcrumb-back { color: var(--accent); transition: color 0.15s; }
        .breadcrumb-back:hover { color: #c4b5fd; }
        .breadcrumb-sep { color: var(--text-faint); }
        .breadcrumb-current { color: var(--text-dim); }

        .arch-flow {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 16px 20px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 10px;
        }
        .arch-box {
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12px;
          padding: 5px 11px;
          border-radius: 6px;
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-dim);
          white-space: nowrap;
        }
        .arch-box--highlight {
          border-color: rgba(34, 211, 238, 0.4);
          color: #67e8f9;
          background: rgba(34, 211, 238, 0.06);
        }
        .arch-box--accent {
          border-color: rgba(139, 92, 246, 0.4);
          color: #c4b5fd;
          background: rgba(139, 92, 246, 0.08);
        }
        .arch-arrow {
          color: var(--text-faint);
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 14px;
        }

        .fw-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 4px;
        }
        .fw-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-mono, ui-monospace, monospace);
          font-size: 12.5px;
          line-height: 1;
          color: var(--text-dim);
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 9px;
          padding: 9px 13px;
          cursor: pointer;
          transition: border-color 0.15s, color 0.15s, background 0.15s, transform 0.15s;
        }
        .fw-tab:hover {
          border-color: var(--border-strong);
          color: var(--text);
          transform: translateY(-1px);
        }
        .fw-tab.active {
          color: #fff;
          border-color: rgba(34, 211, 238, 0.5);
          background: linear-gradient(
            180deg,
            rgba(34, 211, 238, 0.12),
            rgba(139, 92, 246, 0.06)
          );
          box-shadow: 0 8px 26px -14px rgba(34, 211, 238, 0.5);
        }
        .fw-name { font-weight: 600; letter-spacing: -0.01em; }
        .fw-dot  { color: var(--text-faint); }
        .fw-tab.active .fw-dot { color: var(--accent); }
        .fw-lang { color: inherit; opacity: 0.85; }
      `}</style>
    </>
  );
}
