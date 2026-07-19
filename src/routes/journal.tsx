import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Companion } from "@/components/Companion";
import { addJournal, useApp } from "@/lib/store";
import { JOURNAL_PROMPTS } from "@/lib/data";
import { fmtDate, toKey } from "@/lib/date";
import { MessageCircleHeart } from "lucide-react";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Journal — Serenity" },
      { name: "description", content: "Free-form entries and gentle prompts." },
    ],
  }),
  component: JournalPage,
});

function JournalPage() {
  const app = useApp();
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState<string | undefined>();

  const save = () => {
    if (!text.trim()) return;
    addJournal({ date: toKey(new Date()), text: text.trim(), prompt });
    setText("");
    setPrompt(undefined);
  };

  const pickPrompt = () => {
    const p = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
    setPrompt(p);
  };

  return (
    <AppShell>
      <div className="px-4 pt-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl text-foreground">Journal</h1>
            <p className="text-xs text-muted-foreground">Write freely. Nothing leaves your phone.</p>
          </div>
          <button
            onClick={pickPrompt}
            className="relative h-16 w-16 shrink-0"
            aria-label="Ask companion for a prompt"
          >
            <Companion id={app.companion} size="md" className="!h-16 !w-16" />
            <MessageCircleHeart className="absolute -bottom-1 -right-1 h-4 w-4 text-accent" />
          </button>
        </div>

        {prompt && (
          <div className="mt-4 rounded-2xl bg-card p-3 text-sm italic text-foreground">
            &ldquo;{prompt}&rdquo;
          </div>
        )}

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="today…"
          rows={6}
          className="mt-3 w-full resize-none rounded-2xl border border-border bg-card p-3 text-sm"
        />
        <button
          onClick={save}
          className="mt-2 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground"
        >
          Save entry
        </button>

        <div className="mt-6 space-y-2">
          {app.journal.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No entries yet. When you're ready.
            </p>
          )}
          {app.journal.map((j) => (
            <div key={j.id} className="rounded-2xl bg-card p-3">
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {fmtDate(j.date, app.country)}
              </div>
              {j.prompt && (
                <div className="mt-1 text-[11px] italic text-muted-foreground">
                  &ldquo;{j.prompt}&rdquo;
                </div>
              )}
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{j.text}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
