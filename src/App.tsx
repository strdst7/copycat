import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "./utils/cn";
import {
  ANATOMY,
  DEMO_PROMPT,
  DEMO_RESULTS,
  DEMO_SOURCE,
  PIPELINE,
  clampSamples,
  extractImageUrls,
  isEmail,
  isValidSourceUrl,
  truncate,
  type LogEntry,
  type LogLevel,
  type StepId,
  type StepState,
} from "./data/workflow";
import CatMark from "./components/CatMark";
import FormCard from "./components/FormCard";
import PipelineView from "./components/PipelineView";
import Results from "./components/Results";
import WorkflowAnatomy from "./components/WorkflowAnatomy";

const TEMPLATE_URL =
  "https://fnrmbtzxuuzmydocnpux.supabase.co/storage/v1/object/public/templates/75115a4d-8af4-4408-9cb5-a3ec335a37ea.json";

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const INITIAL_STEPS = Object.fromEntries(
  PIPELINE.map((s) => [s.id, "idle"]),
) as Record<StepId, StepState>;

export default function App() {
  // form state
  const [sourceUrl, setSourceUrl] = useState(DEMO_SOURCE);
  const [prompt, setPrompt] = useState(DEMO_PROMPT);
  const [numImages, setNumImages] = useState(4);
  const [email, setEmail] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [sourceInvalid, setSourceInvalid] = useState(false);

  // live connection
  const [liveMode, setLiveMode] = useState(false);
  const [liveUrl, setLiveUrl] = useState("");

  // pipeline state
  const [started, setStarted] = useState(false);
  const [running, setRunning] = useState(false);
  const [steps, setSteps] = useState<Record<StepId, StepState>>(INITIAL_STEPS);
  const [retryBranch, setRetryBranch] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [results, setResults] = useState<string[] | null>(null);
  const [resultsEmail, setResultsEmail] = useState<string | null>(null);
  const [liveNote, setLiveNote] = useState<string | null>(null);

  const startRef = useRef(0);
  const pipelineRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const pushLog = useCallback((level: LogLevel, text: string) => {
    const t = `${((performance.now() - startRef.current) / 1000).toFixed(2)}s`;
    setLog((prev) => [...prev, { t, level, text }]);
  }, []);

  useEffect(() => {
    if (running) {
      pipelineRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [running]);

  useEffect(() => {
    if (results && !running) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [results, running]);

  const postLiveForm = async (): Promise<string[]> => {
    const fd = new FormData();
    fd.append("SourceImage", sourceUrl);
    fd.append("TargetPrompt", prompt);
    fd.append("Number of Images", String(clampSamples(numImages)));
    if (email.trim()) fd.append("Your Email (Optional)", email.trim());
    const res = await fetch(liveUrl.trim(), { method: "POST", body: fd });
    if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
    const text = await res.text();
    try {
      return extractImageUrls(JSON.parse(text));
    } catch {
      return extractImageUrls(text);
    }
  };

  const runPipeline = async () => {
    setStarted(true);
    setRunning(true);
    setRetryBranch(false);
    setResults(null);
    setResultsEmail(null);
    setLiveNote(null);
    setLog([]);
    startRef.current = performance.now();
    setSteps(INITIAL_STEPS);

    const step = (id: StepId, state: StepState) => setSteps((prev) => ({ ...prev, [id]: state }));

    const sourceOk = isValidSourceUrl(sourceUrl);
    const samples = clampSamples(numImages);

    // 1 · form trigger
    step("trigger", "running");
    pushLog("exec", "Workflow execution started");
    pushLog("info", "Form Trigger received submission · path /style-copy-with-imagen3");
    await sleep(400);
    step("trigger", "done");

    // 2 · validation (IF) — mirrors the Retry Form branch on failure
    step("validate", "running");
    pushLog("info", `Form Validation · condition: $json.SourceImage.isUrl() → ${sourceOk}`);
    await sleep(550);
    if (!sourceOk) {
      step("validate", "error");
      setRetryBranch(true);
      pushLog("error", "Condition not met — branching to “Retry Form”");
      pushLog("warn", "Retry Form · “Please enter a URL for the source image.”");
      setFormError("Please enter a URL for the source image.");
      setSourceInvalid(true);
      setRunning(false);
      return;
    }
    step("validate", "done");
    pushLog("ok", "Condition passed — continuing on the true branch");

    // 3 · variables (set)
    step("variables", "running");
    await sleep(450);
    pushLog("info", `Set · sourceStyleUrl = ${truncate(sourceUrl, 46)}`);
    pushLog("info", `Set · targetPrompt = ${truncate(prompt, 46)}`);
    pushLog("info", `Set · numberSamples = ${samples}  (clamped to 1–4)`);
    if (email.trim()) pushLog("info", `Set · email = ${email.trim()}`);
    step("variables", "done");

    // 4 · download image
    step("download", "running");
    pushLog("info", `HTTP Request · GET ${truncate(sourceUrl, 60)}`);
    await sleep(700);
    pushLog("ok", "Source image downloaded · 200 OK · 2.4 MB");
    step("download", "done");

    // 5 · imagen 3.0
    step("imagen", "running");
    pushLog("info", "HTTP Request · POST …/v1beta/models/imagen-3.0-generate-002:predict");
    pushLog("info", `Body · prompt + “Generate the following image: ${truncate(prompt, 40)}” · sampleCount: ${samples}`);
    let liveUrls: string[] = [];
    if (liveMode && liveUrl.trim()) {
      try {
        liveUrls = await postLiveForm();
        pushLog("ok", `Live workflow responded · ${liveUrls.length} image URL(s) extracted`);
        if (liveUrls.length === 0) pushLog("warn", "No image URLs in response — falling back to demo renders");
      } catch (err) {
        pushLog("error", `Live form request failed — ${err instanceof Error ? err.message : "unknown error"}`);
        pushLog("warn", "Falling back to demo renders");
      }
    } else {
      await sleep(2300);
      pushLog("ok", `Imagen 3.0 · ${samples} prediction(s) generated (Google Gemini / PaLM API)`);
    }
    step("imagen", "done");

    // 6 · split out
    step("split", "running");
    await sleep(520);
    pushLog("ok", `Split Out · field “predictions” → ${samples} item(s)`);
    step("split", "done");

    // 7 · cloudinary
    step("cloudinary", "running");
    await sleep(850);
    if (liveMode) {
      pushLog("ok", "Delivered by the live workflow · upload preset n8n-workflows-preset");
    } else {
      pushLog("ok", `Cloudinary · ${samples} image(s) uploaded · v1_1/daglih2g8/image/upload`);
    }
    step("cloudinary", "done");

    // 8 · email (conditional)
    if (email.trim()) {
      step("email", "running");
      await sleep(650);
      pushLog("ok", `Results emailed to ${email.trim()}`);
      step("email", "done");
    } else {
      step("email", "skipped");
      pushLog("info", "Email Results skipped — no recipient provided");
    }

    const finalUrls = (liveMode && liveUrls.length > 0 ? liveUrls : DEMO_RESULTS).slice(0, samples);
    setResults(finalUrls);
    setResultsEmail(email.trim() || null);
    setLiveNote(liveMode ? `Live response from ${new URL(liveUrl).host}` : null);
    setRunning(false);
    pushLog("exec", "Workflow execution finished");
  };

  const handleSubmit = () => {
    if (running) return;
    setFormError(null);
    setSourceInvalid(false);
    if (!prompt.trim()) {
      setFormError("Please describe the image you want to generate.");
      return;
    }
    if (email.trim() && !isEmail(email.trim())) {
      setFormError("Please enter a valid email address.");
      return;
    }
    void runPipeline();
  };

  const hasEmail = email.trim().length > 0;
  const totalNodes = hasEmail || steps.email === "skipped" ? PIPELINE.length : PIPELINE.length - 1;
  const doneCount = PIPELINE.filter((s) => steps[s.id] === "done").length;

  return (
    <div className="relative min-h-screen overflow-x-clip bg-paper font-sans text-ink">
      {/* matte paper texture */}
      <div className="pointer-events-none fixed inset-0 bg-dots" aria-hidden />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {/* header */}
        <header className="sticky top-0 z-40 -mx-4 mb-4 border-b border-line bg-paper/90 px-4 backdrop-blur-sm sm:-mx-6 sm:px-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between py-4">
            <a href="#" className="group">
              <CatMark className="text-lg" />
            </a>
            <nav className="flex items-center gap-6 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-inkmute">
              <a href="#workflow" className="transition hover:text-ink">
                Workflow
              </a>
              <a href="#results" className="transition hover:text-ink">
                Results
              </a>
              <a
                href={TEMPLATE_URL}
                target="_blank"
                rel="noreferrer"
                className="rounded-[5px] border border-linestrong bg-white px-3 py-1.5 text-ink transition hover:border-ink"
              >
                Template JSON ↗
              </a>
            </nav>
          </div>
        </header>

        {/* hero — the machine and its control panel */}
        <section className="grid items-start gap-12 pb-20 pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pt-20">
          <div className="space-y-9">
            <p className="flex items-center gap-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-inkmute">
              <span className="h-2 w-2 bg-accent" /> n8n workflow template → live product
            </p>

            <h1 className="font-display text-[46px] font-black leading-[1.02] tracking-[-0.025em] text-ink sm:text-6xl lg:text-[68px]">
              Your prompt.
              <br />
              <span className="text-accent">Their style.</span>
            </h1>

            <p className="max-w-md text-[15px] leading-relaxed text-inkmute">
              Point Imagen 3.0 at any image as a style reference, describe what you want, and the workflow
              generates, splits and uploads up to four renders — automatically.
            </p>

            <ol className="max-w-md">
              {["Paste a style reference URL", "Describe the subject you want", "Press Generate — watch the machine work"].map(
                (s, i) => (
                  <li key={s} className="flex items-baseline gap-4 border-t border-line py-3.5 transition-colors hover:border-ink">
                    <span className="font-mono text-[11px] font-semibold text-accentdeep">{String(i + 1).padStart(2, "0")}</span>
                    <span className="text-sm font-medium text-ink">{s}</span>
                  </li>
                ),
              )}
            </ol>

            {/* spec plate */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 border-t-2 border-ink pt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-inkmute">
              <span>Model · Imagen 3.0</span>
              <span>Nodes · {String(ANATOMY.length).padStart(2, "0")}</span>
              <span>Outputs · 1–4</span>
              <span>Delivery · Cloudinary</span>
            </div>
          </div>

          <FormCard
            sourceUrl={sourceUrl}
            prompt={prompt}
            numImages={numImages}
            email={email}
            onSourceUrl={setSourceUrl}
            onPrompt={setPrompt}
            onNumImages={setNumImages}
            onEmail={setEmail}
            error={formError}
            sourceError={sourceInvalid}
            running={running}
            onSubmit={handleSubmit}
            liveMode={liveMode}
            liveUrl={liveUrl}
            onLiveMode={setLiveMode}
            onLiveUrl={setLiveUrl}
          />
        </section>

        {/* pipeline */}
        {(started || running) && (
          <section ref={pipelineRef} className="scroll-mt-24 pb-24">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-t-2 border-ink pt-5">
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-inkmute">
                  Live execution
                </p>
                <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
                  The machine at work.
                </h2>
              </div>
              <span
                className={cn(
                  "flex items-center gap-2.5 rounded-[5px] border px-3.5 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.16em]",
                  running
                    ? "border-accent/50 bg-accent/[0.07] text-accentdeep"
                    : retryBranch
                      ? "border-err/50 bg-err/[0.06] text-err"
                      : "border-ok/50 bg-ok/[0.07] text-ok",
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    running ? "animate-led bg-accent" : retryBranch ? "bg-err" : "bg-ok",
                  )}
                />
                {running
                  ? `Executing ${String(doneCount).padStart(2, "0")}/${String(totalNodes).padStart(2, "0")}`
                  : retryBranch
                    ? "Awaiting retry"
                    : "Complete"}
              </span>
            </div>
            <PipelineView steps={steps} running={running} retryBranch={retryBranch} hasEmail={hasEmail} log={log} />
          </section>
        )}

        {/* results */}
        {results && (
          <div ref={resultsRef} className="pb-24">
            <Results sourceUrl={sourceUrl} prompt={prompt} results={results} email={resultsEmail} liveNote={liveNote} />
          </div>
        )}

        {/* anatomy */}
        <WorkflowAnatomy />
      </div>

      {/* footer */}
      <footer className="relative border-t border-linestrong bg-panel">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="group">
            <CatMark className="text-xl" />
          </div>
          <p className="font-mono text-[11px] text-ink">
            <a
              href="https://aimirah.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-accentdeep underline decoration-accent/40 underline-offset-4 transition hover:text-ink"
            >
              aimirah.com
            </a>{" "}
            2026. / nur amirah mohd kamil.
          </p>
        </div>
      </footer>
    </div>
  );
}
