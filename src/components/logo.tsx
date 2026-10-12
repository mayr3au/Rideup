import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 font-display text-xl font-extrabold tracking-tight">
      <svg width="26" height="26" viewBox="0 0 32 32" aria-hidden="true">
        <path d="M4 14 C 9 4, 23 4, 28 14 L 22 15 C 19 10, 13 10, 10 15 Z" fill="var(--kite)" />
        <path d="M10 15 L 16 28 M22 15 L 16 28" stroke="var(--deep)" strokeWidth="1.6" fill="none" />
      </svg>
      <span>RIDE&apos;UP</span>
    </Link>
  );
}
