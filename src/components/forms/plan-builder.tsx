"use client";

import { CalendarPlus, Save, Trash2 } from "lucide-react";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";

type PlanBuilderProps = {
  sessionOptions: Array<{
    id: string;
    title: { en: string; vi: string };
    description: { en: string; vi: string };
  }>;
  levels: Array<{ id: string; slug: string; name: { en: string; vi: string } }>;
  goals: Array<{ id: string; slug: string; name: { en: string; vi: string } }>;
};

function createScheduleEntry() {
  return {
    weekday: 1,
    time: "06:30",
    workoutSessionId: "",
  };
}

export function PlanBuilder({ sessionOptions, levels, goals }: PlanBuilderProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [levelId, setLevelId] = useState(levels[0]?.id ?? "");
  const [goalId, setGoalId] = useState(goals[0]?.id ?? "");
  const [reminderTime, setReminderTime] = useState("06:30");
  const [activate, setActivate] = useState(true);
  const [scheduleEntries, setScheduleEntries] = useState([createScheduleEntry()]);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  function updateScheduleEntry(
    index: number,
    key: "weekday" | "time" | "workoutSessionId",
    value: string,
  ) {
    setScheduleEntries((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index
          ? {
              ...entry,
              [key]: key === "weekday" ? Number(value) : value,
            }
          : entry,
      ),
    );
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    try {
      setPending(true);
      const response = await fetch("/api/app/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          levelId,
          goalId,
          reminderTime,
          activate,
          scheduleEntries: scheduleEntries.filter((entry) => entry.workoutSessionId),
        }),
      });

      if (!response.ok) {
        throw new Error("Could not save plan.");
      }

      setTitle("");
      setDescription("");
      setScheduleEntries([createScheduleEntry()]);
      setMessage("Saved.");
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("[plan-builder]", error);
      setMessage("Could not save the plan.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[30px] border border-border bg-background-secondary p-4 shadow-[0_18px_44px_rgba(17,17,17,0.06)]">
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        required
        placeholder="Plan title"
        className="h-12 w-full rounded-2xl border border-border bg-background-tertiary px-4 text-sm text-foreground"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={3}
        placeholder="Plan description"
        className="w-full rounded-2xl border border-border bg-background-tertiary px-4 py-3 text-sm text-foreground"
      />

      <div className="grid grid-cols-2 gap-2">
        <select
          value={levelId}
          onChange={(event) => setLevelId(event.target.value)}
          className="h-11 rounded-2xl border border-border bg-background-tertiary px-3 text-sm text-foreground"
        >
          {levels.map((level) => (
            <option key={level.id} value={level.id}>
              {level.name.en}
            </option>
          ))}
        </select>
        <select
          value={goalId}
          onChange={(event) => setGoalId(event.target.value)}
          className="h-11 rounded-2xl border border-border bg-background-tertiary px-3 text-sm text-foreground"
        >
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.name.en}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-[1fr_auto] gap-2">
        <input
          type="time"
          value={reminderTime}
          onChange={(event) => setReminderTime(event.target.value)}
          className="h-11 rounded-2xl border border-border bg-background-tertiary px-3 text-sm text-foreground"
        />
        <label className="inline-flex items-center gap-2 rounded-full border border-border bg-background-tertiary px-4 text-sm text-foreground">
          <input
            type="checkbox"
            checked={activate}
            onChange={(event) => setActivate(event.target.checked)}
          />
          Active
        </label>
      </div>

      <div className="space-y-3">
        {scheduleEntries.map((entry, index) => (
          <div key={`schedule-${index}`} className="grid grid-cols-[88px_1fr_42px] gap-2">
            <select
              value={entry.weekday}
              onChange={(event) => updateScheduleEntry(index, "weekday", event.target.value)}
              className="h-11 rounded-2xl border border-border bg-background-tertiary px-3 text-sm text-foreground"
            >
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label, value) => (
                <option key={label} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-[112px_1fr] gap-2">
              <input
                type="time"
                value={entry.time}
                onChange={(event) => updateScheduleEntry(index, "time", event.target.value)}
                className="h-11 rounded-2xl border border-border bg-background-tertiary px-3 text-sm text-foreground"
              />
              <select
                value={entry.workoutSessionId}
                onChange={(event) => updateScheduleEntry(index, "workoutSessionId", event.target.value)}
                className="h-11 rounded-2xl border border-border bg-background-tertiary px-3 text-sm text-foreground"
              >
                <option value="">Select session</option>
                {sessionOptions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.title.en}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() =>
                setScheduleEntries((current) =>
                  current.length === 1 ? current : current.filter((_, entryIndex) => entryIndex !== index),
                )
              }
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background-tertiary text-foreground-secondary"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setScheduleEntries((current) => [...current, createScheduleEntry()])}
          className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-background-tertiary px-4 text-sm font-medium text-foreground"
        >
          <CalendarPlus className="h-4 w-4" />
          Add day
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary-500 px-4 text-sm font-semibold text-foreground-inverted"
        >
          <Save className="h-4 w-4" />
          {pending ? "Saving" : "Save plan"}
        </button>
      </div>

      {message ? <p className="text-sm text-foreground-secondary">{message}</p> : null}
    </form>
  );
}
