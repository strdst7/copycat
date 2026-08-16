/**
 * Metadata extracted from the n8n workflow template
 * "Style Copy with Imagen 3.0" (template 75115a4d-8af4-4408-9cb5-a3ec335a37ea)
 */

export type StepId =
  | "trigger"
  | "validate"
  | "variables"
  | "download"
  | "imagen"
  | "split"
  | "cloudinary"
  | "email";

export type StepState = "idle" | "pending" | "running" | "done" | "error" | "skipped";

export interface PipelineStep {
  id: StepId;
  name: string;
  type: string;
  icon: string;
  desc: string;
}

export const PIPELINE: PipelineStep[] = [
  {
    id: "trigger",
    name: "On form submission",
    type: "n8n-nodes-base.formTrigger",
    icon: "📝",
    desc: "Form Trigger · /style-copy-with-imagen3",
  },
  {
    id: "validate",
    name: "Form Validation",
    type: "n8n-nodes-base.if",
    icon: "🔀",
    desc: "$json.SourceImage.isUrl()",
  },
  {
    id: "variables",
    name: "Variables",
    type: "n8n-nodes-base.set",
    icon: "⚙️",
    desc: "sourceStyleUrl · targetPrompt · numberSamples",
  },
  {
    id: "download",
    name: "Download Image",
    type: "n8n-nodes-base.httpRequest",
    icon: "⬇️",
    desc: "GET · $json.sourceStyleUrl",
  },
  {
    id: "imagen",
    name: "Imagen 3.0",
    type: "n8n-nodes-base.httpRequest",
    icon: "🎨",
    desc: "POST · imagen-3.0-generate-002:predict",
  },
  {
    id: "split",
    name: "Split Out",
    type: "n8n-nodes-base.splitOut",
    icon: "✂️",
    desc: "fieldToSplitOut: predictions",
  },
  {
    id: "cloudinary",
    name: "Upload to Cloudinary",
    type: "n8n-nodes-base.httpRequest",
    icon: "☁️",
    desc: "POST · api.cloudinary.com/image/upload",
  },
  {
    id: "email",
    name: "Email Results",
    type: "n8n-nodes-base.emailSend",
    icon: "✉️",
    desc: "Only when recipient provided",
  },
];

export const RETRY_STEP: PipelineStep = {
  id: "trigger",
  name: "Retry Form",
  type: "n8n-nodes-base.form",
  icon: "🔁",
  desc: "“Please enter a URL for the source image.”",
};

export type LogLevel = "exec" | "info" | "ok" | "warn" | "error";

export interface LogEntry {
  t: string;
  level: LogLevel;
  text: string;
}

export interface AnatomyNode {
  name: string;
  type: string;
  icon: string;
  role: string;
  detail: string;
  nodeId: string;
}

export const ANATOMY: AnatomyNode[] = [
  {
    name: "On form submission",
    type: "formTrigger",
    icon: "📝",
    role: "Entry point",
    detail:
      "Renders the generation form · path /style-copy-with-imagen3 · button “Generate!” · responseMode: lastNode",
    nodeId: "20744adb",
  },
  {
    name: "Form Validation",
    type: "if",
    icon: "🔀",
    role: "Routing",
    detail:
      "Checks $json.SourceImage.isUrl() · on false routes to the Retry Form branch",
    nodeId: "917db247",
  },
  {
    name: "Retry Form",
    type: "form",
    icon: "🔁",
    role: "Error path",
    detail:
      "Re-shows the form with the message “Please enter a URL for the source image.”",
    nodeId: "65a8b617",
  },
  {
    name: "Variables",
    type: "set",
    icon: "⚙️",
    role: "Preparation",
    detail:
      "Assigns sourceStyleUrl, targetPrompt, email and clamps numberSamples into the 1–4 range",
    nodeId: "b1730c97",
  },
  {
    name: "Download Image",
    type: "httpRequest",
    icon: "⬇️",
    role: "Fetch",
    detail: "GETs the source style image from the URL provided in the form",
    nodeId: "5c26062c",
  },
  {
    name: "Imagen 3.0",
    type: "httpRequest",
    icon: "🎨",
    role: "Generation",
    detail:
      "POSTs to generativelanguage.googleapis.com · imagen-3.0-generate-002:predict · Google Gemini(PaLM) API credential",
    nodeId: "67f2bb16",
  },
  {
    name: "Split Out",
    type: "splitOut",
    icon: "✂️",
    role: "Fan-out",
    detail: "Splits the predictions array so each image is its own item",
    nodeId: "ed993205",
  },
  {
    name: "Upload to Cloudinary",
    type: "httpRequest",
    icon: "☁️",
    role: "Delivery",
    detail:
      "Uploads every render to api.cloudinary.com/v1_1/daglih2g8 · preset n8n-workflows-preset",
    nodeId: "8a0e8dae",
  },
  {
    name: "Sticky Note",
    type: "stickyNote",
    icon: "📌",
    role: "Documentation",
    detail: "Workflow annotations kept on the canvas for the next maintainer",
    nodeId: "525725ea",
  },
];

export const DEMO_SOURCE = "images/source.jpg";
export const DEMO_PROMPT = "A fluffy orange cat sitting on a windowsill at sunset";
export const DEMO_RESULTS = [
  "images/result-1.jpg",
  "images/result-2.jpg",
  "images/result-3.jpg",
  "images/result-4.jpg",
];

export const CLOUDINARY_PREFIX = "https://res.cloudinary.com/daglih2g8/image/upload/v1/n8n-workflows-preset";

/** Mirrors the n8n expression in the template's Variables node. */
export function clampSamples(v: number): number {
  if (!Number.isFinite(v) || v < 1) return 1;
  if (v > 4) return 4;
  return Math.floor(v);
}

export function isEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

/** Approximation of n8n's .isUrl() — accepts http(s) URLs plus local demo assets. */
export function isValidSourceUrl(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  if (/^https?:\/\//i.test(v)) {
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  }
  return /^(\.?\/)?[\w\-./]+\.(png|jpe?g|webp|gif|avif|svg)(\?.*)?$/i.test(v);
}

export function truncate(v: string, len: number): string {
  return v.length > len ? `${v.slice(0, len - 1)}…` : v;
}

/**
 * Parses a URL without throwing. Returns null when `value` is not a valid
 * absolute URL, so callers never have to wrap `new URL()` in try/catch.
 */
export function safeParseUrl(value: string): URL | null {
  try {
    return new URL(value.trim());
  } catch {
    return null;
  }
}

/**
 * A live workflow endpoint must be an absolute http(s) URL. Rejects other
 * schemes (javascript:, data:, file:, …) before we ever hand it to fetch().
 */
export function isValidLiveUrl(value: string): boolean {
  const url = safeParseUrl(value);
  return url !== null && (url.protocol === "http:" || url.protocol === "https:");
}

/**
 * Display host for a URL, or a safe fallback when it cannot be parsed.
 *
 * Note: `new URL("localhost:5678")` succeeds — JS reads `localhost:` as the
 * scheme and leaves `host` empty — so an empty host falls back too.
 */
export function urlHost(value: string, fallback = "the live workflow"): string {
  const host = safeParseUrl(value)?.host;
  return host && host.length > 0 ? host : fallback;
}

/** Guard rails for walking an untrusted JSON payload from a live endpoint. */
const MAX_DEPTH = 12;
const MAX_NODES = 20_000;
const MAX_URLS = 4;
const MAX_STRING_LEN = 2048;

const IMAGE_URL_RE = /^https?:\/\/\S+\.(png|jpe?g|webp|avif|gif)(\?.*)?$/i;

/**
 * Collects image-looking URLs from an arbitrary JSON payload (e.g. Cloudinary
 * secure_url).
 *
 * The payload comes from a user-supplied endpoint, so the walk is bounded on
 * every axis: nesting depth, total nodes visited, result count and string
 * length. Cycles are tracked so a self-referential object cannot loop forever.
 */
export function extractImageUrls(data: unknown): string[] {
  const out: string[] = [];
  const seen = new Set<object>();
  let visited = 0;

  const walk = (node: unknown, depth: number): void => {
    if (depth > MAX_DEPTH || visited >= MAX_NODES || out.length >= MAX_URLS) return;
    visited++;

    if (typeof node === "string") {
      if (node.length <= MAX_STRING_LEN && IMAGE_URL_RE.test(node) && !out.includes(node)) {
        out.push(node);
      }
      return;
    }

    if (node === null || typeof node !== "object") return;

    // Cycle guard — an object graph may reference itself.
    if (seen.has(node)) return;
    seen.add(node);

    if (Array.isArray(node)) {
      for (const item of node) {
        if (out.length >= MAX_URLS || visited >= MAX_NODES) break;
        walk(item, depth + 1);
      }
      return;
    }

    for (const value of Object.values(node as Record<string, unknown>)) {
      if (out.length >= MAX_URLS || visited >= MAX_NODES) break;
      walk(value, depth + 1);
    }
  };

  walk(data, 0);
  return out;
}
