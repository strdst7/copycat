import { useState } from "react";
import { cn } from "../utils/cn";
import { CLOUDINARY_PREFIX, isValidSourceUrl, truncate } from "../data/workflow";

interface ResultsProps {
  sourceUrl: string;
  prompt: string;
  results: string[];
  email: string | null;
  liveNote: string | null;
}

export default function Results({ sourceUrl, prompt, results, email, liveNote }: ResultsProps) {
  const [failed, setFailed] = useState<Record<number, boolean>>({});
  const sourceOk = isValidSourceUrl(sourceUrl);

  return (
    <section className="animate-fade-up scroll-mt-24 space-y-8" id="results">
      <div className="flex flex-wrap items-end justify-between gap-4 border-t-2 border-ink pt-5">
        <div>
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-inkmute">
            Output · Split Out → Cloudinary · {String(results.length).padStart(2, "0")} item{results.length > 1 ? "s" : ""}
          </p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Transfer complete.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-inkmute">
            “{truncate(prompt, 90)}” — re-rendered by Imagen 3.0 in the source style.
          </p>
          {liveNote && (
            <p className="mt-3 inline-flex items-center gap-2 rounded-[4px] border border-ok/50 bg-ok/[0.08] px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-ok">
              <span className="h-1.5 w-1.5 rounded-full bg-ok" /> {liveNote}
            </p>
          )}
        </div>
        {email && (
          <div className="flex items-center gap-3 rounded-[5px] border border-linestrong bg-white px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-ok" />
            <span className="font-mono text-[11px] text-inkmute">
              sent to <span className="font-semibold text-ink">{email}</span>
            </span>
          </div>
        )}
      </div>

      {/* source → model → output */}
      <div className="flex flex-wrap items-center gap-5">
        <div className="w-36 shrink-0">
          <div className="aspect-square overflow-hidden rounded-md border border-linestrong bg-white">
            {sourceOk ? (
              <img src={sourceUrl} alt="Source style" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center font-mono text-xs text-inkmute">url</div>
            )}
          </div>
          <p className="mt-2 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-inkmute">Style source</p>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[10px] uppercase tracking-[0.12em] text-inkmute">
          <span className="h-px w-10 bg-linestrong sm:w-16" />
          <span className="rounded-[4px] border border-linestrong bg-white px-2.5 py-1.5 font-semibold text-ink">
            Imagen 3.0
          </span>
          <span className="h-px w-10 bg-linestrong sm:w-16" />
        </div>
        <p className="text-sm italic text-inkmute">your prompt, their brush.</p>
      </div>

      {/* gallery */}
      <div className={cn("grid gap-4", results.length === 1 ? "max-w-sm" : "sm:grid-cols-2 lg:grid-cols-4")}>
        {results.map((src, i) => (
          <figure
            key={`${src}-${i}`}
            className="group animate-fade-up overflow-hidden rounded-md border border-linestrong bg-white transition hover:border-ink"
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div className="relative aspect-square overflow-hidden border-b border-line">
              <img
                src={src}
                alt={`Generated result ${i + 1}`}
                className={cn(
                  "h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]",
                  failed[i] && "hidden",
                )}
                onError={() => setFailed((f) => ({ ...f, [i]: true }))}
              />
              {failed[i] && (
                <div className="flex h-full w-full items-center justify-center bg-paper font-mono text-xs text-inkmute">
                  render {i + 1}
                </div>
              )}
              <span className="absolute left-2.5 top-2.5 rounded-[3px] bg-ink/80 px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.12em] text-paper">
                {String(i + 1).padStart(2, "0")}/{String(results.length).padStart(2, "0")}
              </span>
            </div>
            <figcaption className="flex items-start justify-between gap-3 px-3.5 py-3">
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-ink">{truncate(prompt, 46)}</p>
                <p className="mt-1 truncate font-mono text-[9px] text-inkmute">
                  {CLOUDINARY_PREFIX}/render-{i + 1}.jpg
                </p>
              </div>
              <a
                href={src}
                download={`copycat-${i + 1}.jpg`}
                className="shrink-0 border-b border-transparent pb-px font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-accentdeep transition hover:border-accentdeep hover:text-ink"
              >
                Save ↓
              </a>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
