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

/** Recursively collects image-looking URLs from an arbitrary JSON payload (e.g. Cloudinary secure_url). */
export function extractImageUrls(data: unknown, out: string[] = []): string[] {
  if (typeof data === "string") {
    if (/^https?:\/\/\S+\.(png|jpe?g|webp|avif|gif)(\?.*)?$/i.test(data) && !out.includes(data)) {
      out.push(data);
    }
    return out;
  }
  if (Array.isArray(data)) {
    for (const item of data) extractImageUrls(item, out);
    return out;
  }
  if (data && typeof data === "object") {
    for (const value of Object.values(data as Record<string, unknown>)) {
      extractImageUrls(value, out);
    }
  }
  return out;
}
