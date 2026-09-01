import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Companion } from "@/components/Companion";
import {
  addJournal,
  addTodo,
  removeJournal,
  removeTodo,
  toggleTodo,
  toggleTodoRemind,
  useApp,
} from "@/lib/store";
import { JOURNAL_PROMPTS, pickJournalPrompt } from "@/lib/data";
import { fmtDate, toKey } from "@/lib/date";
import { cancelTodoLadder, requestNotifPermission, scheduleTodoLadder } from "@/lib/notify";
import { playScratch } from "@/lib/sound";
import { rotationForDate } from "@/lib/postings";
import {
  Bell,
  BookOpenText,
  ChevronDown,
  CheckSquare,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/journal")({
  validateSearch: (search: Record<string, unknown>) => ({
    prompt: typeof search.prompt === "string" ? search.prompt : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Writing — Serenity" },
      { name: "description", content: "Bedside diary and to-do list." },
    ],
  }),
  component: WritingPage,
});

function WritingPage() {
  const { prompt: incomingPrompt } = Route.useSearch();
  const [openJournal, setOpenJournal] = useState(true);
  const [openTodo, setOpenTodo] = useState(!incomingPrompt);

  useEffect(() => {
    if (incomingPrompt) {
      setOpenJournal(true);
      setOpenTodo(false);
    }
  }, [incomingPrompt]);

  return (
    <AppShell>
      <div className="space-y-4 px-4 pt-6">
        <h1 className="font-display text-2xl text-foreground">Writing</h1>

        <CollapsibleTile
          icon={<BookOpenText className="h-5 w-5" />}
          title="Bedside Diary"
          open={openJournal}
          onToggle={() => setOpenJournal((v) => !v)}
        >
          <JournalPanel initialPrompt={incomingPrompt} />
        </CollapsibleTile>

        <CollapsibleTile
          icon={<CheckSquare className="h-5 w-5" />}
          title="To-Do List"
          open={openTodo}
          onToggle={() => setOpenTodo((v) => !v)}
        >
          <TodoPanel />
        </CollapsibleTile>
      </div>
    </AppShell>
  );
}

function CollapsibleTile({
  icon,
  title,
  open,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card p-4">
      <button type="button" onClick={onToggle} className="flex w-full items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
            {icon}
          </div>
          <h2 className="font-display text-lg text-foreground leading-tight">{title}</h2>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")}
        />
      </button>
      {open && <div className="mt-4">{children}</div>}
    </section>
  );
}

function JournalPanel({ initialPrompt }: { initialPrompt?: string }) {
  const [editing, setEditing] = useState(!!initialPrompt);
  const nav = useNavigate();

  useEffect(() => {
    if (initialPrompt) {
      setEditing(true);
    }
  }, [initialPrompt]);

  const handleClose = () => {
    setEditing(false);
    nav({ to: "/journal", search: {}, replace: true });
  };

  if (editing)
    return <JournalEditor onClose={handleClose} initialPrompt={initialPrompt} />;

  return <JournalList onNew={() => setEditing(true)} />;
}

function JournalEditor({
  onClose,
  initialPrompt,
}: {
  onClose: () => void;
  initialPrompt?: string;
}) {
  const app = useApp();
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [rating, setRating] = useState<number>(3);
  const [prompt, setPrompt] = useState<string | undefined>(initialPrompt);

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
    }
  }, [initialPrompt]);

  const pickPrompt = () => {
    setPrompt(pickJournalPrompt());
  };

  const save = () => {
    if (!text.trim()) return;
    const today = toKey(new Date());
    const rot = rotationForDate(app.rotations, today);
    addJournal({
      date: today,
      title: title.trim() || undefined,
      text: text.trim(),
      prompt,
      rating,
      rotationId: rot?.id,
    });
    setTitle("");
    setText("");
    setPrompt(undefined);
    onClose();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <button onClick={onClose} className="text-xs text-muted-foreground">
          ← All entries
        </button>
        <button
          onClick={pickPrompt}
          className="flex items-center gap-1 rounded-full bg-primary/15 px-3 py-1 text-[11px] text-primary"
        >
          <span className="h-6 w-6">
            <Companion id={app.companion} size="sm" className="!h-6 !w-6" />
          </span>
          Prompt me
        </button>
      </div>
      {prompt && (
        <div className="rounded-2xl bg-secondary/40 p-3 text-xs italic text-foreground">
          "{prompt}"
        </div>
      )}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
      />
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write on the lines…"
        rows={12}
        autoFocus={!!initialPrompt}
        className="w-full resize-none rounded-xl border border-border bg-background p-3 font-mono text-[13px] text-foreground journal-lines"
      />
      <div>
        <div className="text-[11px] text-muted-foreground">How was the day? (1–5)</div>
        <div className="mt-1 flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setRating(n)}
              className={cn(
                "grid h-8 w-8 place-items-center rounded-full text-xs",
                rating === n
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <button
        onClick={save}
        className="w-full rounded-full bg-primary py-2.5 text-sm font-medium text-primary-foreground"
      >
        Save entry
      </button>
    </div>
  );
}

function JournalList({ onNew }: { onNew: () => void }) {
  const app = useApp();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"date" | "rating" | "rotation">("date");

  const filtered = useMemo(() => {
    let list = app.journal.filter((j) => {
      if (!q) return true;
      const hay = `${j.title ?? ""} ${j.text}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
    if (sort === "date") list = [...list].sort((a, b) => b.date.localeCompare(a.date));
    if (sort === "rating") list = [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    if (sort === "rotation")
      list = [...list].sort((a, b) => (a.rotationId ?? "").localeCompare(b.rotationId ?? ""));
    return list;
  }, [app.journal, q, sort]);

  return (
    <div className="space-y-3">
      <button
        onClick={onNew}
        className="flex w-full items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-sm font-medium text-primary-foreground"
      >
        <Plus className="h-4 w-4" /> New entry
      </button>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search headings…"
            className="w-full rounded-full border border-border bg-background pl-7 pr-3 py-1.5 text-[11px]"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as "date" | "rating" | "rotation")}
          className="rounded-full border border-border bg-background px-2 py-1.5 text-[11px]"
        >
          <option value="date">Date</option>
          <option value="rating">Rating</option>
          <option value="rotation">Rotation</option>
        </select>
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-[11px] text-muted-foreground">No entries yet.</p>
        )}
        {filtered.map((j) => {
          const rot = app.rotations.find((r) => r.id === j.rotationId);
          return (
            <div key={j.id} className="rounded-2xl border border-border bg-background/60 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  {j.title && (
                    <div className="text-sm font-medium text-foreground">{j.title}</div>
                  )}
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {fmtDate(j.date, app.country)}
                    {rot && ` · ${rot.name}`}
                    {j.rating && ` · ${"★".repeat(j.rating)}`}
                  </div>
                </div>
                <button
                  onClick={() => removeJournal(j.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-xs text-foreground/90">{j.text}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TodoPanel() {
  const app = useApp();
  const [val, setVal] = useState("");

  const onToggleDone = (id: string, done: boolean) => {
    toggleTodo(id);
    if (!done) playScratch();
  };

  const onBell = async (id: string, text: string, currently: boolean) => {
    toggleTodoRemind(id);
    if (!currently) {
      const perm = await requestNotifPermission();
      if (perm === "granted") scheduleTodoLadder(id, text);
    } else {
      cancelTodoLadder(id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              addTodo(val);
              setVal("");
            }
          }}
          placeholder="Add a task…"
          className="flex-1 rounded-full border border-border bg-background px-3 py-2 text-xs"
        />
        <button
          onClick={() => {
            addTodo(val);
            setVal("");
          }}
          className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      {app.todos.length === 0 && (
        <p className="text-[11px] text-muted-foreground">Nothing on the list. That's allowed.</p>
      )}
      {app.todos.map((t) => (
        <div
          key={t.id}
          className="flex items-center gap-2 rounded-2xl border border-border bg-background/60 p-2"
        >
          <button
            onClick={() => onToggleDone(t.id, t.done)}
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
              "flex-1 text-sm text-foreground transition-all",
              t.done && "line-through text-muted-foreground",
            )}
          >
            {t.text}
          </div>
          <button
            onClick={() => onBell(t.id, t.text, !!t.remind)}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-lg border border-border",
              t.remind ? "text-accent" : "text-muted-foreground",
            )}
            aria-label="Remind"
          >
            <Bell className="h-4 w-4" />
          </button>
          <button
            onClick={() => {
              cancelTodoLadder(t.id);
              removeTodo(t.id);
            }}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted-foreground"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
