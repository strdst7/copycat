import { ANATOMY } from "../data/workflow";

export default function WorkflowAnatomy() {
  return (
    <section id="workflow" className="scroll-mt-24 space-y-8">
      <div className="max-w-2xl">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-inkmute">
          Under the hood · index of nodes
        </p>
        <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
          The workflow, node by node.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-inkmute">
          This product mirrors the exported n8n template — a form trigger, a URL validation branch, Imagen 3.0
          generation via the Google Gemini (PaLM) API and Cloudinary delivery. Nothing more, nothing less.
        </p>
      </div>

      <div className="grid gap-x-12 md:grid-cols-2">
        {ANATOMY.map((node, i) => (
          <div
            key={node.nodeId}
            className="flex gap-5 border-t border-line py-5 transition-colors hover:border-ink"
          >
            <span className="pt-0.5 font-mono text-[11px] font-semibold text-accentdeep">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="font-display text-sm font-bold tracking-tight text-ink">{node.name}</h3>
                <span className="font-mono text-[9px] font-semibold uppercase tracking-[0.16em] text-inkmute">
                  {node.role}
                </span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-inkmute">
                n8n-nodes-base.{node.type} · {node.nodeId}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-inkmute">{node.detail}</p>
            </div>
          </div>
        ))}
        {/* closing rule to balance the grid */}
        <div className="hidden border-t border-line md:block" />
      </div>
    </section>
  );
}
