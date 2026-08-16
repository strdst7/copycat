import { useState } from "react";
import { cn } from "../utils/cn";
import { CatIcon } from "./CatMark";
import { clampSamples, isValidLiveUrl, isValidSourceUrl } from "../data/workflow";

interface FormCardProps {
  sourceUrl: string;
  prompt: string;
  numImages: number;
  email: string;
  onSourceUrl: (v: string) => void;
  onPrompt: (v: string) => void;
  onNumImages: (v: number) => void;
  onEmail: (v: string) => void;
  error: string | null;
  sourceError: boolean;
  running: boolean;
  onSubmit: () => void;
  liveMode: boolean;
  liveUrl: string;
  onLiveMode: (v: boolean) => void;
  onLiveUrl: (v: string) => void;
}

const inputClass =
  "w-full rounded-[5px] border border-linestrong bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-inkmute/55 outline-none transition focus:border-ink focus:ring-2 focus:ring-accent/15";

const labelClass =
  "mb-2 flex items-center gap-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-inkmute";

function FieldBadge({ kind, warn }: { kind: "req" | "opt"; warn?: boolean }) {
  return (
    <span
      className={cn(
        "flex items-center gap-1.5 font-mono text-[9px] tracking-[0.14em]",
        warn ? "text-err" : "text-inkmute/80",
      )}
    >
      <span className={cn("h-1.5 w-1.5", warn ? "bg-err" : kind === "req" ? "bg-accent" : "border border-linestrong")} />
      {kind === "req" ? "Required" : "Optional"}
    </span>
  );
}

export default function FormCard({
  sourceUrl,
  prompt,
  numImages,
  email,
  onSourceUrl,
  onPrompt,
  onNumImages,
  onEmail,
  error,
  sourceError,
  running,
  onSubmit,
  liveMode,
  liveUrl,
  onLiveMode,
  onLiveUrl,
}: FormCardProps) {
  const [showLive, setShowLive] = useState(false);
  const [previewFailed, setPreviewFailed] = useState(false);
  const sourceOk = isValidSourceUrl(sourceUrl);
  const liveUrlOk = isValidLiveUrl(liveUrl);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-linestrong bg-panel shadow-[0_1px_2px_rgb(27_26_22/0.06),0_12px_32px_-16px_rgb(27_26_22/0.18)]",
        sourceError && "animate-shake",
      )}
    >
      {/* device header */}
      <div className="flex items-center justify-between border-b border-line bg-white px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[5px] bg-ink text-[15px] text-paper">
            <CatIcon />
          </span>
          <div>
            <h2 className="font-display text-sm font-bold tracking-tight text-ink">Style Copy with Imagen 3.0</h2>
            <p className="mt-0.5 font-mono text-[10px] text-inkmute">formTrigger · /style-copy-with-imagen3</p>
          </div>
        </div>
        <span className="rounded-[3px] border border-line bg-paper px-2 py-1 font-mono text-[9px] uppercase tracking-[0.18em] text-inkmute">
          n8n
        </span>
      </div>

      <div className="space-y-6 px-6 py-6">
        <p className="text-sm leading-relaxed text-inkmute">
          Use this form to generate an image using another image as a style reference.
        </p>

        {error && (
          <div className="flex animate-fade-up items-start gap-2.5 rounded-[5px] border border-err/40 bg-err/[0.06] px-4 py-3 text-xs font-medium leading-relaxed text-err">
            <span className="mt-[3px] h-2 w-2 shrink-0 bg-err" />
            {error}
          </div>
        )}

        {/* source image url */}
        <div>
          <label className={labelClass} htmlFor="source-url">
            Source image <FieldBadge kind="req" warn={sourceError} />
          </label>
          <div className="flex items-start gap-3">
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-[5px] border border-linestrong bg-white">
              {sourceOk && !previewFailed ? (
                <img
                  key={sourceUrl}
                  src={sourceUrl}
                  alt="Source style preview"
                  className="h-full w-full object-cover"
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-sm text-inkmute/50">
                  {sourceUrl.trim() ? "img" : "—"}
                </div>
              )}
            </div>
            <input
              id="source-url"
              type="text"
              value={sourceUrl}
              onChange={(e) => {
                onSourceUrl(e.target.value);
                setPreviewFailed(false);
              }}
              placeholder="The image URL to copy the style from"
              className={cn(inputClass, sourceError && "border-err focus:border-err focus:ring-err/15")}
              spellCheck={false}
            />
          </div>
          {sourceError && (
            <p className="mt-2 flex items-center gap-2 font-mono text-[11px] font-medium text-err">
              <span className="h-1.5 w-1.5 bg-err" /> Please enter a URL for the source image.
            </p>
          )}
        </div>

        {/* prompt */}
        <div>
          <label className={labelClass} htmlFor="target-prompt">
            Target prompt <FieldBadge kind="req" />
          </label>
          <textarea
            id="target-prompt"
            value={prompt}
            onChange={(e) => onPrompt(e.target.value)}
            placeholder="The new image to generate"
            rows={3}
            className={cn(inputClass, "resize-none leading-relaxed")}
          />
          <p className="mt-2 font-mono text-[10px] text-inkmute/80">
            Imagen 3.0 re-renders this subject in the source image's style.
          </p>
        </div>

        {/* number of images */}
        <div>
          <label className={labelClass}>Number of images</label>
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-stretch rounded-[5px] border border-linestrong bg-white">
              <button
                type="button"
                onClick={() => onNumImages(clampSamples(numImages - 1))}
                disabled={numImages <= 1 || running}
                aria-label="Fewer images"
                className="w-10 rounded-l-[4px] border-r border-line font-display text-lg font-bold text-ink transition hover:bg-paper active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>
              <span className="flex w-12 items-center justify-center font-mono text-sm font-semibold text-ink">
                {String(numImages).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => onNumImages(clampSamples(numImages + 1))}
                disabled={numImages >= 4 || running}
                aria-label="More images"
                className="w-10 rounded-r-[4px] border-l border-line font-display text-lg font-bold text-ink transition hover:bg-paper active:translate-y-[1px] disabled:cursor-not-allowed disabled:opacity-30"
              >
                +
              </button>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => onNumImages(n)}
                  aria-label={`Set ${n} image${n > 1 ? "s" : ""}`}
                  className={cn(
                    "h-1.5 w-5 transition-colors",
                    n <= numImages ? "bg-accent" : "bg-line hover:bg-linestrong",
                  )}
                />
              ))}
            </div>
            <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-inkmute">Default 1 · Max 4</span>
          </div>
        </div>

        {/* email */}
        <div>
          <label className={labelClass} htmlFor="email">
            Your email <FieldBadge kind="opt" />
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            placeholder="The results will be sent to this email"
            className={inputClass}
            spellCheck={false}
          />
        </div>

        {/* submit */}
        <div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={running}
            className={cn(
              "w-full rounded-[5px] bg-accent px-6 py-3.5 font-display text-sm font-bold tracking-wide text-ink",
              "transition hover:bg-accentdeep hover:text-white active:translate-y-[1px]",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {running ? (
              <span className="flex items-center justify-center gap-2.5">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/25 border-t-ink" />
                Generating
              </span>
            ) : (
              "Generate!"
            )}
          </button>
          <p className="mt-3 text-center font-mono text-[10px] text-inkmute">
            runs on n8n · form trigger → imagen 3.0 → cloudinary
          </p>
        </div>

        {/* live mode */}
        <div className="rounded-[5px] border border-line bg-white">
          <button
            type="button"
            onClick={() => setShowLive((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-inkmute">
              <span className={cn("h-2 w-2 rounded-full", liveMode ? "bg-ok" : "border border-linestrong bg-transparent")} />
              {liveMode ? "Live — connected to your n8n form" : "Demo — simulated pipeline run"}
            </span>
            <span className="font-mono text-xs text-inkmute">{showLive ? "−" : "+"}</span>
          </button>
          {showLive && (
            <div className="space-y-3 border-t border-line px-4 py-4">
              <p className="text-[11px] leading-relaxed text-inkmute">
                Paste your published n8n <span className="font-mono text-ink">formTrigger</span> URL to run the real
                workflow. The form posts the template's exact field names:{" "}
                <span className="font-mono text-ink">SourceImage · TargetPrompt · Number of Images · Your Email (Optional)</span>
              </p>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => onLiveUrl(e.target.value)}
                placeholder="https://your-instance.app.n8n.cloud/form/style-copy-with-imagen3"
                className={inputClass}
                spellCheck={false}
              />
              {liveUrl.trim().length > 0 && !liveUrlOk && (
                <p className="flex items-center gap-2 font-mono text-[11px] font-medium text-err">
                  <span className="h-1.5 w-1.5 bg-err" /> Enter an absolute http(s) URL.
                </p>
              )}
              <button
                type="button"
                onClick={() => onLiveMode(liveMode ? false : liveUrlOk)}
                disabled={!liveMode && !liveUrlOk}
                className={cn(
                  "rounded-[4px] px-4 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition active:translate-y-[1px]",
                  "disabled:cursor-not-allowed disabled:opacity-40",
                  liveMode
                    ? "border border-linestrong bg-white text-inkmute hover:border-ink hover:text-ink"
                    : "bg-ink text-paper hover:bg-accentdeep",
                )}
              >
                {liveMode ? "Disconnect" : "Connect live workflow"}
              </button>
              <p className="text-[11px] leading-relaxed text-inkmute">
                Your prompt, source URL and email are posted directly to this endpoint from your browser.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
