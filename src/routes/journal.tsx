import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Companion } from "@/components/Companion";
import {
  addJournal,
  addTodo,
  removeTodo,
  toggleTodo,
  toggleTodoRemind,
  useApp,
} from "@/lib/store";
import { JOURNAL_PROMPTS } from "@/lib/data";
import { fmtDate, toKey } from "@/lib/date";
import { Bell, BookOpenText, CheckSquare, Plus, Search, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journal")({
  head: () => ({
    meta: [
      { title: "Writing — Serenity" },
      { name: "description", content: "Cozy bedside diary and ward to-do list." },
    ],
  }),
  component: WritingPage,
});

function WritingPage() {
  const app = useApp();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [prompt, setPrompt] = useState<string | undefined>();
  const [q, setQ] = useState("");

  const save = () => {
    if (!text.trim()) return;
    const body = title.trim() ? `${title.trim()}\n\n${text.trim()}` : text.trim();
    addJournal({ date: toKey(new Date()), text: body, prompt });
    setTitle("");
    setText("");
    setPrompt(undefined);
  };

  const pickPrompt = () => {
    const p = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
    setPrompt(p);
  };

  const filtered = useMemo(
    () =>
      app.journal.filter((j) =>
        !q ? true : j.text.toLowerCase().includes(q.toLowerCase()),
      ),
    [app.journal, q],
  );

  return (
    <AppShell>
      <div className="px-4 pt-6 space-y-4">
        {/* Diary card */}
        <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <BookOpenText className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h1 className="font-display text-lg text-foreground leading-tight">
                Cozy Bedside Diary
              </h1>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Notebook feel · your words stay on your phone
              </p>
            </div>
            <button
              onClick={pickPrompt}
              className="relative h-14 w-14 shrink-0"
              aria-label="Ask companion for a prompt"
            >
              <Companion id={app.companion} size="md" className="!h-14 !w-14" />
              <span className="absolute -bottom-1 -right-1 rounded-full bg-primary px-1.5 py-0.5 text-[8px] font-medium text-primary-foreground">
                Prompt me
              </span>
            </button>
          </div>

          {prompt && (
            <div className="mt-3 rounded-2xl bg-secondary/40 p-3 text-xs italic text-foreground">
              &ldquo;{prompt}&rdquo;
            </div>
          )}

          <div className="mt-3">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Diary header
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title your entry (e.g. ICU Night Shifts)"
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm italic"
            />
          </div>

          <div className="mt-3">
            <label className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Notebook page
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How are you feeling today? What did you learn?"
              rows={8}
              className="mt-1 w-full resize-none rounded-xl border border-border bg-background p-3 font-mono text-sm leading-7"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to bottom, transparent 0, transparent 27px, color-mix(in oklab, var(--color-border) 70%, transparent) 27px, color-mix(in oklab, var(--color-border) 70%, transparent) 28px)",
              }}
            />
            <button
              onClick={save}
              className="mt-2 w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground"
            >
              Save entry
            </button>
          </div>
        </section>

        {/* To-Do list */}
        <section className="rounded-3xl border border-border bg-card p-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-lg text-foreground leading-tight">
                Cozy Ward To-Do List
              </h2>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Cross off tasks · tap 🔔 for a gentle reminder
              </p>
            </div>
          </div>

          <TodoAdder />
          <div className="mt-3 space-y-1.5">
            {app.todos.length === 0 && (
              <p className="text-[11px] text-muted-foreground">
                Nothing on the list. That's allowed.
              </p>
            )}
            {app.todos.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 p-2"
              >
                <button
                  onClick={() => toggleTodo(t.id)}
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-lg border",
                    t.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-transparent",
                  )}
                  aria-label="Toggle done"
                >
                  ✓
                </button>
                <div
                  className={cn(
                    "flex-1 text-sm text-foreground",
                    t.done && "line-through text-muted-foreground",
                  )}
                >
                  {t.text}
                </div>
                <button
                  onClick={() => toggleTodoRemind(t.id)}
                  className={cn(
                    "grid h-8 w-8 place-items-center rounded-lg border border-border",
                    t.remind ? "text-accent" : "text-muted-foreground",
                  )}
                  aria-label="Remind"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  onClick={() => removeTodo(t.id)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Past records */}
        <section>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Past diary records ({app.journal.length})
            </div>
            <div className="relative flex-1 max-w-[190px]">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search past memories…"
                className="w-full rounded-full border border-border bg-card pl-7 pr-3 py-1.5 text-[11px]"
              />
            </div>
          </div>

          <div className="mt-2 space-y-2">
            {filtered.map((j) => (
              <div key={j.id} className="rounded-2xl border border-border bg-card p-3">
                <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {fmtDate(j.date, app.country)}
                </div>
                {j.prompt && (
                  <div className="mt-1 text-[11px] italic text-muted-foreground">
                    &ldquo;{j.prompt}&rdquo;
                  </div>
                )}
                <p className="mt-2 whitespace-pre-wrap text-sm italic text-foreground">
                  {j.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}

function TodoAdder() {
  const [val, setVal] = useState("");
  return (
    <div className="mt-3 flex gap-2">
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            addTodo(val);
            setVal("");
          }
        }}
        placeholder="e.g. Draw arterial blood gas for bed 4…"
        className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-xs"
      />
      <button
        onClick={() => {
          addTodo(val);
          setVal("");
        }}
        className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary"
        aria-label="Add"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
