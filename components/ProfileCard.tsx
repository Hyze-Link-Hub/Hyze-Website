import type { ReactNode } from "react";

type ProfileCardProps = {
  username: string;
  displayName: string;
  bio: string;
  initials?: string;
  avatarUrl?: string | null;
  /** Rendered directly beneath the avatar. */
  badges?: ReactNode;
  children?: ReactNode;
};

export default function ProfileCard({
  username,
  displayName,
  bio,
  initials,
  avatarUrl,
  badges,
  children,
}: ProfileCardProps) {
  const avatarLabel = initials ?? displayName.slice(0, 2).toUpperCase();

  return (
    <div className="glass-frost relative w-full max-w-md overflow-hidden rounded-[28px] p-5 sm:p-7">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgba(54,214,255,0.14),transparent_70%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-white via-accent-ice to-accent-cyan p-[2px] shadow-[0_0_40px_-8px_rgba(54,214,255,0.6)] sm:h-28 sm:w-28"
            aria-hidden="true"
          >
            <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-surface-raised font-mono text-2xl font-bold tracking-wide text-accent-ice sm:text-3xl">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                avatarLabel
              )}
            </div>
          </div>
          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-surface-raised bg-accent-cyan shadow-glow-cyan" />
        </div>

        {badges ? <div className="mb-4">{badges}</div> : null}

        <h1 className="text-2xl font-bold leading-tight tracking-[-0.03em] text-gradient-subtle sm:text-[1.8rem]">
          {displayName}
        </h1>
        <p className="mt-1.5 inline-flex items-center rounded-full border border-subtle bg-surface-base/50 px-2.5 py-0.5 font-mono text-xs tracking-wide text-white/50">
          @{username}
        </p>
        <p className="mt-3 max-w-[18rem] text-[0.925rem] leading-relaxed text-white/60">
          {bio}
        </p>

        {children ? (
          <div className="mt-5 flex w-full flex-col items-center gap-4">
            {children}
          </div>
        ) : null}
      </div>
    </div>
  );
}
