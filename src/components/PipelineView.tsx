import { useEffect, useRef } from "react";
import { cn } from "../utils/cn";
import { PIPELINE, RETRY_STEP, type LogEntry, type StepId, type StepState } from "../data/workflow";

interface PipelineViewProps {
  steps: Record<StepId, StepState>;
  running: boolean;
  retryBranch: boolean;
  hasEmail: boolean;
  log: LogEntry[];
}

function Led({ state }: { state: StepState }) {
  return (
    <span
      className={cn(
        "h-2 w-2 shrink-0 rounded-full transition-colors",
        (state === "idle" || state === "pending") && "bg-line",
        state === "running" && "animate-led bg-accent",
        state === "done" && "bg-ok",
        state === "error" && "bg-err",
        state === "skipped" && "border border-linestrong bg-transparent",
      )}
    />
  );
}

const tagClass: Record<LogEntry["level"], string> = {
  exec: "bg-accent/20 text-[#f6a176]",
  info: "bg-white/5 text-[#98968b]",
  ok: "bg-ok/25 text-[#a3cf7f]",
  warn: "bg-warn/25 text-[#dcb45e]",
  error: "bg-err/25 text-[#e5705f]",
};

const textClass: Record<LogEntry["level"], string> = {
  exec: "text-[#f6a176]",
  info: "text-[#b9b7ab]",
  ok: "text-[#a3cf7f]",
  warn: "text-[#dcb45e]",
  error: "text-[#e5705f]",
};

function NodeModule({
  idx,
  name,
  type,
  desc,
  state,
}: {
  idx: number;
  name: string;
  type: string;
  desc: string;
  state: StepState;
}) {
  return (
    <div
      className={cn(
        "w-[172px] shrink-0 rounded-md border bg-white px-3.5 py-3 transition-all duration-300",
        (state === "idle" || state === "pending") && "border-line opacity-55",
        state === "running" && "border-accent",
        state === "done" && "border-linestrong",
        state === "error" && "border-err",
        state === "skipped" && "border-dashed border-line opacity-50",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold text-inkmute">{String(idx).padStart(2, "0")}</span>
        <Led state={state} />
      </div>
      <p className="mt-2 truncate font-display text-[12px] font-bold leading-tight text-ink">{name}</p>
      <p className="mt-0.5 truncate font-mono text-[9px] text-inkmute">{type}</p>
      <p className="mt-1.5 truncate font-mono text-[9px] text-inkmute/80">{desc}</p>
    </div>
  );
}

export default function PipelineView({ steps, running, retryBranch, hasEmail, log }: PipelineViewProps) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const nodes = PIPELINE.map((node, i) => ({ node, idx: i + 1 })).filter(({ node }) =>
    node.id === "email" ? hasEmail || steps.email === "skipped" : true,
  );

  return (
    <div className="animate-fade-up space-y-4">
      {/* node modules */}
      <div className="overflow-x-auto rounded-lg border border-linestrong bg-panel p-5 shadow-[0_1px_2px_rgb(27_26_22/0.05)] scroll-thin">
        <div className="flex min-w-max items-center gap-0">
          {nodes.map(({ node, idx }, i) => {
            const state = node.id === "email" && !hasEmail && steps.email !== "skipped" ? "idle" : steps[node.id] ?? "idle";
            const prevState = i > 0 ? steps[nodes[i - 1].node.id] : "idle";
            const live = state === "running" || (nodes[i + 1] && steps[nodes[i + 1].node.id] === "running");
            return (
              <div key={node.id} className="flex items-center">
                {i > 0 && (
                  <div
                    className={cn(
                      "h-[2px] w-7 shrink-0",
                      live ? "animate-dash-flow" : state === "done" || prevState === "done" ? "bg-ink/30" : "bg-line",
                    )}
                  />
                )}
                <NodeModule idx={idx} name={node.name} type={node.type} desc={node.desc} state={state} />
              </div>
            );
          })}
        </div>
      </div>

      {/* retry branch */}
      {retryBranch && (
        <div className="flex animate-fade-up items-center gap-4 rounded-lg border border-err/40 bg-err/[0.05] px-5 py-4">
          <div className="flex shrink-0 flex-col items-center gap-1">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-err">false</span>
            <div className="h-7 w-px border-l border-dashed border-err/60" />
          </div>
          <div className="flex items-center gap-3 rounded-md border border-err/50 bg-white px-4 py-3">
            <span className="h-2 w-2 shrink-0 animate-led rounded-full bg-err" />
            <div>
              <p className="font-display text-[12px] font-bold text-ink">{RETRY_STEP.name}</p>
              <p className="font-mono text-[9px] text-inkmute">{RETRY_STEP.type}</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-inkmute">
            Validation failed — the workflow re-opens the form.
            <br />
            <span className="font-mono text-[11px] text-err">“Please enter a URL for the source image.”</span>
          </p>
        </div>
      )}

      {/* execution console */}
      {log.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-ink bg-console shadow-[0_12px_32px_-16px_rgb(27_26_22/0.4)]">
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-2.5">
            <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#98968b]">
              n8n · execution log
            </span>
            {running ? (
              <span className="ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#f6a176]">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" /> running
              </span>
            ) : (
              <span className="ml-auto flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#a3cf7f]">
                <span className="h-1.5 w-1.5 rounded-full bg-ok" /> stopped
              </span>
            )}
          </div>
          <div
            ref={logRef}
            className="max-h-64 space-y-1 overflow-y-auto p-4 font-mono text-[11px] leading-relaxed scroll-thin"
          >
            {log.map((entry, i) => (
              <div key={i} className="flex gap-3">
                <span className="shrink-0 text-[#6b6a62]">{entry.t}</span>
                <span className={cn("w-11 shrink-0 rounded-[2px] px-1 text-center font-semibold", tagClass[entry.level])}>
                  {entry.level.toUpperCase().padEnd(4).slice(0, 4)}
                </span>
                <span className={cn("break-all", textClass[entry.level])}>{entry.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
