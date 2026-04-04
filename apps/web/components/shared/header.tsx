'use client';

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold lg:hidden">AestheticTrack</h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded-full bg-primary/20" />
      </div>
    </header>
  );
}
