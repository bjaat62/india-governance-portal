import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center gap-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-saffron">404</p>
      <h1 className="font-display text-4xl text-foreground">The requested page is not available.</h1>
      <p className="text-base text-muted-foreground">
        The portal route may not have been created yet, or the requested governance record is missing from the dataset.
      </p>
      <Link href="/" className="rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white">
        Return home
      </Link>
    </div>
  );
}
