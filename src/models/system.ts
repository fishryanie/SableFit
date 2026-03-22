import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const systemSeedStateSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    version: {
      type: String,
      required: true,
      trim: true,
    },
    checksum: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["RUNNING", "READY", "FAILED"],
      default: "READY",
      index: true,
    },
    summary: {
      taxonomyCounts: {
        equipments: { type: Number, default: 0 },
        muscleCategories: { type: Number, default: 0 },
        muscles: { type: Number, default: 0 },
        exerciseLevels: { type: Number, default: 0 },
        exerciseGoals: { type: Number, default: 0 },
        exerciseCategories: { type: Number, default: 0 },
      },
      exerciseCount: { type: Number, default: 0 },
      anatomyMediaCount: { type: Number, default: 0 },
      sessionTemplateCount: { type: Number, default: 0 },
      planTemplateCount: { type: Number, default: 0 },
    },
    lastAppliedAt: {
      type: Date,
      default: null,
    },
    lastError: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "system_seed_states",
  },
);

export type SystemSeedStateDocument = InferSchemaType<typeof systemSeedStateSchema>;

export const SystemSeedState: Model<SystemSeedStateDocument> =
  (models.SystemSeedState as Model<SystemSeedStateDocument>) ||
  model<SystemSeedStateDocument>("SystemSeedState", systemSeedStateSchema);
