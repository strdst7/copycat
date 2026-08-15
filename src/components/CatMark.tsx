import { cn } from "../utils/cn";

/** Small cat mark (stroke icon) that stands in for the letters “cat”. */
export function CatIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={cn(
        "inline-block w-[0.92em] shrink-0 translate-y-[0.06em] transition-transform duration-300 ease-out",
        "group-hover:-rotate-12 group-hover:scale-110",
        className,
      )}
    >
      {/* head + ears */}
      <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58 2.02 3.78 1.28 5.74 1.35 1.62 2.3 3.55 2.3 5.76 0 4.97-4.48 7.5-10 7.5s-10-2.53-10-7.5c0-2.21.95-4.14 2.3-5.76C3.55 6.74 4.17 3.54 5.57 2.96c1.39-.58 4.64.26 6.43 2.26.65-.17 1.33-.26 2-.26z" />
      {/* eyes + nose */}
      <path d="M8 14v.5" />
      <path d="M16 14v.5" />
      <path d="M11.25 16.25h1.5L12 17l-.75-.75Z" />
      {/* whiskers */}
      <path d="M4.42 11.247A13.152 13.152 0 0 0 .445 14.24" />
      <path d="M2.2 18.2a13.15 13.15 0 0 1 3.86-2.83" />
      <path d="M19.58 11.247a13.152 13.152 0 0 1 3.975 2.993" />
      <path d="M21.8 18.2a13.15 13.15 0 0 0-3.86-2.83" />
    </svg>
  );
}

/**
 * Wordmark: “Copy” + cat (in place of the letters “cat”) + “!”
 * Wrap in an element with the `group` class to get the hover wiggle.
 */
export default function CatMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-baseline whitespace-nowrap font-display font-black tracking-tight text-ink",
        className,
      )}
    >
      <span>Copy</span>
      <CatIcon className="mx-[0.14em] text-accent" />
      <span className="text-accent">!</span>
    </span>
  );
}
