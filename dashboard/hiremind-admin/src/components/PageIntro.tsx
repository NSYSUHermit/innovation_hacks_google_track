interface PageIntroProps {
  title: string;
  subtitle: string;
}

/** Title block below the top bar (reference: Platform Overview + welcome line). */
export function PageIntro({ title, subtitle }: PageIntroProps) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-bold tracking-tight text-navy dark:text-white">{title}</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{subtitle}</p>
    </header>
  );
}
