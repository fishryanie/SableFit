import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";
import { localizedStringSchema } from "@/models/shared";

const workoutSetSchema = new Schema(
  {
    order: { type: Number, required: true },
    repsTarget: { type: Number, required: true, min: 1 },
    restSec: { type: Number, required: true, min: 0 },
    loadText: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const workoutExerciseEntrySchema = new Schema(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    sets: {
      type: [workoutSetSchema],
      default: [],
    },
  },
  { _id: false },
);

const workoutSessionSchema = new Schema(
  {
    slug: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    ownerType: {
      type: String,
      enum: ["SYSTEM", "USER"],
      default: "USER",
      index: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      default: null,
      index: true,
    },
    title: {
      type: localizedStringSchema,
      required: true,
    },
    description: {
      type: localizedStringSchema,
      required: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: "",
    },
    seedVersion: {
      type: String,
      trim: true,
      default: "",
    },
    exerciseEntries: {
      type: [workoutExerciseEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "workout_sessions",
  },
);

workoutSessionSchema.index({ ownerType: 1, ownerUserId: 1, createdAt: -1 });
workoutSessionSchema.index({ ownerType: 1, slug: 1 });

const workoutPlanScheduleEntrySchema = new Schema(
  {
    weekday: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    time: {
      type: String,
      required: true,
      trim: true,
    },
    workoutSessionId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutSession",
      required: true,
    },
  },
  { _id: false },
);

const workoutPlanSchema = new Schema(
  {
    slug: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },
    ownerType: {
      type: String,
      enum: ["SYSTEM", "USER"],
      default: "USER",
      index: true,
    },
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      default: null,
      index: true,
    },
    title: {
      type: localizedStringSchema,
      required: true,
    },
    description: {
      type: localizedStringSchema,
      required: true,
    },
    repeatEveryWeeks: {
      type: Number,
      default: 1,
      min: 1,
    },
    reminderTime: {
      type: String,
      default: "06:30",
      trim: true,
    },
    timezone: {
      type: String,
      default: "Asia/Ho_Chi_Minh",
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    levelId: {
      type: Schema.Types.ObjectId,
      ref: "ExerciseLevel",
      required: true,
    },
    goalId: {
      type: Schema.Types.ObjectId,
      ref: "ExerciseGoal",
      required: true,
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: "",
    },
    seedVersion: {
      type: String,
      trim: true,
      default: "",
    },
    scheduleEntries: {
      type: [workoutPlanScheduleEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "workout_plans",
  },
);

workoutPlanSchema.index({ ownerType: 1, ownerUserId: 1, isActive: 1 });
workoutPlanSchema.index({ ownerType: 1, slug: 1 });

const workoutOccurrenceSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
      index: true,
    },
    workoutPlanId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutPlan",
      required: true,
      index: true,
    },
    workoutSessionId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutSession",
      required: true,
    },
    scheduledFor: {
      type: Date,
      required: true,
      index: true,
    },
    notifyAt: {
      type: Date,
      required: true,
      index: true,
    },
    reminderStatus: {
      type: String,
      enum: ["PENDING", "SENT", "SKIPPED"],
      default: "PENDING",
      index: true,
    },
    status: {
      type: String,
      enum: ["UPCOMING", "COMPLETED", "MISSED", "SKIPPED"],
      default: "UPCOMING",
      index: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "workout_occurrences",
  },
);

workoutOccurrenceSchema.index({ userId: 1, scheduledFor: 1, status: 1 });

const workoutLogSetSchema = new Schema(
  {
    order: { type: Number, required: true },
    repsCompleted: { type: Number, required: true, min: 0 },
    loadText: { type: String, trim: true, default: "" },
    completed: { type: Boolean, default: true },
  },
  { _id: false },
);

const workoutLogEntrySchema = new Schema(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    sets: {
      type: [workoutLogSetSchema],
      default: [],
    },
  },
  { _id: false },
);

const workoutLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
      index: true,
    },
    occurrenceId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutOccurrence",
      required: true,
      unique: true,
    },
    workoutSessionId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutSession",
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    exerciseResults: {
      type: [workoutLogEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    collection: "workout_logs",
  },
);

const notificationSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
      index: true,
    },
    title: {
      type: localizedStringSchema,
      required: true,
    },
    body: {
      type: localizedStringSchema,
      required: true,
    },
    type: {
      type: String,
      enum: ["REMINDER", "SYSTEM"],
      default: "SYSTEM",
      index: true,
    },
    actionHref: {
      type: String,
      trim: true,
      default: "",
    },
    occurrenceId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutOccurrence",
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
    pushDeliveredAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: "notifications",
  },
);

notificationSchema.index({ userId: 1, readAt: 1, createdAt: -1 });

export type WorkoutSessionDocument = InferSchemaType<typeof workoutSessionSchema>;
export type WorkoutPlanDocument = InferSchemaType<typeof workoutPlanSchema>;
export type WorkoutOccurrenceDocument = InferSchemaType<typeof workoutOccurrenceSchema>;
export type WorkoutLogDocument = InferSchemaType<typeof workoutLogSchema>;
export type NotificationDocument = InferSchemaType<typeof notificationSchema>;

export const WorkoutSession: Model<WorkoutSessionDocument> =
  (models.WorkoutSession as Model<WorkoutSessionDocument>) ||
  model<WorkoutSessionDocument>("WorkoutSession", workoutSessionSchema);

export const WorkoutPlan: Model<WorkoutPlanDocument> =
  (models.WorkoutPlan as Model<WorkoutPlanDocument>) ||
  model<WorkoutPlanDocument>("WorkoutPlan", workoutPlanSchema);

export const WorkoutOccurrence: Model<WorkoutOccurrenceDocument> =
  (models.WorkoutOccurrence as Model<WorkoutOccurrenceDocument>) ||
  model<WorkoutOccurrenceDocument>("WorkoutOccurrence", workoutOccurrenceSchema);

export const WorkoutLog: Model<WorkoutLogDocument> =
  (models.WorkoutLog as Model<WorkoutLogDocument>) ||
  model<WorkoutLogDocument>("WorkoutLog", workoutLogSchema);

export const Notification: Model<NotificationDocument> =
  (models.Notification as Model<NotificationDocument>) ||
  model<NotificationDocument>("Notification", notificationSchema);
