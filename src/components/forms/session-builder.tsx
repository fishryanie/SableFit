"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

type ExerciseOption = {
  id: string;
  slug: string;
  name: {
    en: string;
    vi: string;
  };
};

type SessionBuilderProps = {
  exerciseOptions: ExerciseOption[];
};

type EntryDraft = {
  exerciseId: string;
  notes: string;
  sets: Array<{
    order: number;
    repsTarget: number;
    restSec: number;
    loadText: string;
  }>;
};

function createSet(order: number) {
  return {
    order,
    repsTarget: 10,
    restSec: 60,
    loadText: "",
  };
}

function createEntry(): EntryDraft {
  return {
    exerciseId: "",
    notes: "",
    sets: [createSet(1), createSet(2), createSet(3)],
  };
}

export function SessionBuilder({ exerciseOptions }: SessionBuilderProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [entries, setEntries] = useState<EntryDraft[]>([createEntry()]);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  function updateEntry(index: number, next: Partial<EntryDraft>) {
    setEntries((current) => current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...next } : entry)));
  }

  function updateSet(entryIndex: number, setIndex: number, key: "repsTarget" | "restSec" | "loadText", value: string) {
    setEntries((current) =>
      current.map((entry, currentEntryIndex) => {
        if (currentEntryIndex !== entryIndex) {
          return entry;
        }

        return {
          ...entry,
          sets: entry.sets.map((set, currentSetIndex) =>
            currentSetIndex === setIndex
              ? {
                  ...set,
                  [key]: key === "loadText" ? value : Number(value) || 0,
                }
              : set,
          ),
        };
      }),
    );
  }

  function addEntry() {
    setEntries((current) => [...current, createEntry()]);
  }

  function addSet(entryIndex: number) {
    setEntries((current) =>
      current.map((entry, currentEntryIndex) =>
        currentEntryIndex === entryIndex
          ? {
              ...entry,
              sets: [...entry.sets, createSet(entry.sets.length + 1)],
            }
          : entry,
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    const payload = {
      title,
      description,
      entries: entries.filter((entry) => entry.exerciseId),
    };

    try {
      setPending(true);
      const response = await fetch("/api/app/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Could not save session.");
      }

      setTitle("");
      setDescription("");
      setEntries([createEntry()]);
      setMessage("Saved.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("[session-builder]", error);
      setMessage("Could not save the session.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_18px_44px_rgba(17,17,17,0.06)]">
      <div className="space-y-3">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          placeholder="Session title"
          className="h-12 w-full rounded-2xl border border-border bg-background-tertiary px-4 text-sm text-foreground"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          placeholder="Short notes for this workout session"
          className="w-full rounded-2xl border border-border bg-background-tertiary px-4 py-3 text-sm text-foreground"
        />
      </div>

      <div className="space-y-3">
        {entries.map((entry, entryIndex) => (
          <div key={`entry-${entryIndex}`} className="rounded-[24px] border border-border bg-background-tertiary p-3">
            <div className="mb-3 flex items-center justify-between gap-2">
              <select
                value={entry.exerciseId}
                onChange={(event) => updateEntry(entryIndex, { exerciseId: event.target.value })}
                className="h-11 min-w-0 flex-1 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
              >
                <option value="">Select exercise</option>
                {exerciseOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name.en}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() =>
                  setEntries((current) => (current.length === 1 ? current : current.filter((_, index) => index !== entryIndex)))
                }
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-foreground-secondary"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <input
              value={entry.notes}
              onChange={(event) => updateEntry(entryIndex, { notes: event.target.value })}
              placeholder="Notes for this exercise"
              className="mb-3 h-11 w-full rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
            />

            <div className="space-y-2">
              {entry.sets.map((set, setIndex) => (
                <div key={`set-${entryIndex}-${setIndex}`} className="grid grid-cols-3 gap-2">
                  <input
                    type="number"
                    min={1}
                    value={set.repsTarget}
                    onChange={(event) => updateSet(entryIndex, setIndex, "repsTarget", event.target.value)}
                    placeholder="Reps"
                    className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                  />
                  <input
                    type="number"
                    min={0}
                    value={set.restSec}
                    onChange={(event) => updateSet(entryIndex, setIndex, "restSec", event.target.value)}
                    placeholder="Rest"
                    className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                  />
                  <input
                    value={set.loadText}
                    onChange={(event) => updateSet(entryIndex, setIndex, "loadText", event.target.value)}
                    placeholder="Load"
                    className="h-10 rounded-2xl border border-border bg-background px-3 text-sm text-foreground"
                  />
                </div>
              ))}

              <button
                type="button"
                onClick={() => addSet(entryIndex)}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-3 text-sm font-medium text-foreground"
              >
                <Plus className="h-4 w-4" />
                Add set
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={addEntry}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background-tertiary px-4 text-sm font-medium text-foreground"
        >
          <Plus className="h-4 w-4" />
          Add exercise
        </button>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-foreground-inverted"
        >
          <Save className="h-4 w-4" />
          {pending ? "Saving" : "Save session"}
        </button>
      </div>

      {message ? <p className="text-sm text-foreground-secondary">{message}</p> : null}
    </form>
  );
}
