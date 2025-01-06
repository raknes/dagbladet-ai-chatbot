import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

        <ul className="list-inside text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li>Aller AI Platform har fått et nytt hjem</li>
          <li className="mb-2">
            <a
              className="flex items-center gap-2 hover:underline hover:underline-offset-4"
              href="https://platform.ai.aller.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
                https://platform.ai.aller.com/
              </code>
            </a>
          </li>
        </ul>

      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center bg-slate-800">
        <a
          href="https://www.remoteproduction.no"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="sr-only">Remote Production AS 2025</span>
          <Image
            src="/logo.png"
            alt="Vercel Logo"
            width={72}
            height={16}
          />
        </a>
      </footer>
    </div>
  );
}
