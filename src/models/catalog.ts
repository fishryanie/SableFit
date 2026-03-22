import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";
import { localizedStringSchema } from "@/models/shared";

const taxonomySchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: localizedStringSchema,
      required: true,
    },
    description: {
      type: localizedStringSchema,
      required: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    aliases: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isSystem: {
      type: Boolean,
      default: true,
      index: true,
    },
    seedVersion: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

taxonomySchema.index({ isSystem: 1, order: 1 });
taxonomySchema.index({ aliases: 1 });
taxonomySchema.index({ "name.en": "text", "name.vi": "text", aliases: "text", slug: "text" });

const muscleSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: localizedStringSchema,
      required: true,
    },
    description: {
      type: localizedStringSchema,
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    aliases: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "MuscleCategory",
      required: true,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    isSystem: {
      type: Boolean,
      default: true,
      index: true,
    },
    seedVersion: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "muscles",
  },
);

muscleSchema.index({ categoryId: 1, order: 1 });
muscleSchema.index({ aliases: 1 });

const localizedStepSchema = new Schema(
  {
    en: { type: String, required: true, trim: true, maxlength: 500 },
    vi: { type: String, required: true, trim: true, maxlength: 500 },
  },
  { _id: false },
);

const exerciseMediaSchema = new Schema(
  {
    style: {
      type: String,
      enum: ["ANATOMY", "ILLUSTRATION"],
      default: "ANATOMY",
    },
    status: {
      type: String,
      enum: ["READY", "FALLBACK"],
      default: "READY",
      index: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
      trim: true,
    },
    detailUrl: {
      type: String,
      required: true,
      trim: true,
    },
    keyframes: {
      type: [
        new Schema(
          {
            order: {
              type: Number,
              required: true,
            },
            label: {
              type: localizedStringSchema,
              required: true,
            },
            url: {
              type: String,
              required: true,
              trim: true,
            },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    animationUrl: {
      type: String,
      required: true,
      trim: true,
    },
    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    videoPosterUrl: {
      type: String,
      trim: true,
      default: "",
    },
    sourceProvider: {
      type: String,
      trim: true,
      default: "LOCAL_CACHE",
    },
    sourcePath: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

const exerciseSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: localizedStringSchema,
      required: true,
    },
    description: {
      type: localizedStringSchema,
      required: true,
    },
    instructionSteps: {
      type: [localizedStepSchema],
      default: [],
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    imageAlt: {
      type: localizedStringSchema,
      required: true,
    },
    media: {
      type: exerciseMediaSchema,
      required: true,
    },
    aliases: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },
    primaryEquipmentId: {
      type: Schema.Types.ObjectId,
      ref: "Equipment",
      default: null,
      index: true,
    },
    equipmentIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Equipment", required: true }],
      default: [],
    },
    primaryMuscleIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Muscle", required: true }],
      default: [],
    },
    secondaryMuscleIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "Muscle" }],
      default: [],
    },
    muscleCategoryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "MuscleCategory" }],
      default: [],
    },
    goalIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "ExerciseGoal", required: true }],
      default: [],
    },
    levelId: {
      type: Schema.Types.ObjectId,
      ref: "ExerciseLevel",
      required: true,
    },
    categoryIds: {
      type: [{ type: Schema.Types.ObjectId, ref: "ExerciseCategory", required: true }],
      default: [],
    },
    movementPattern: {
      type: String,
      trim: true,
      default: "general",
      index: true,
    },
    source: {
      type: String,
      trim: true,
      default: "INTERNAL_CURATION",
    },
    sourceUrl: {
      type: String,
      trim: true,
      default: "",
    },
    reviewStatus: {
      type: String,
      enum: ["APPROVED", "DRAFT"],
      default: "APPROVED",
      index: true,
    },
    isSystem: {
      type: Boolean,
      default: true,
      index: true,
    },
    seedVersion: {
      type: String,
      trim: true,
      default: "",
    },
    isSearchable: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    collection: "exercises",
  },
);

exerciseSchema.index({ slug: 1, reviewStatus: 1 });
exerciseSchema.index({ "name.en": "text", "name.vi": "text", aliases: "text", slug: "text" });
exerciseSchema.index({ reviewStatus: 1, isSystem: 1, levelId: 1 });
exerciseSchema.index({ equipmentIds: 1, reviewStatus: 1, isSearchable: 1 });
exerciseSchema.index({ primaryMuscleIds: 1, reviewStatus: 1, isSearchable: 1 });
exerciseSchema.index({ muscleCategoryIds: 1, reviewStatus: 1, isSearchable: 1 });
exerciseSchema.index({ goalIds: 1, reviewStatus: 1, isSearchable: 1 });
exerciseSchema.index({ categoryIds: 1, reviewStatus: 1, isSearchable: 1 });
exerciseSchema.index({ aliases: 1 });
exerciseSchema.index({ "media.style": 1, "media.status": 1, reviewStatus: 1 });

export type TaxonomyDocument = InferSchemaType<typeof taxonomySchema>;
export type MuscleDocument = InferSchemaType<typeof muscleSchema>;
export type ExerciseDocument = InferSchemaType<typeof exerciseSchema>;

export const Equipment: Model<TaxonomyDocument> =
  (models.Equipment as Model<TaxonomyDocument>) ||
  model<TaxonomyDocument>("Equipment", taxonomySchema, "equipments");

export const MuscleCategory: Model<TaxonomyDocument> =
  (models.MuscleCategory as Model<TaxonomyDocument>) ||
  model<TaxonomyDocument>("MuscleCategory", taxonomySchema, "muscle_categories");

export const ExerciseGoal: Model<TaxonomyDocument> =
  (models.ExerciseGoal as Model<TaxonomyDocument>) ||
  model<TaxonomyDocument>("ExerciseGoal", taxonomySchema, "exercise_goals");

export const ExerciseLevel: Model<TaxonomyDocument> =
  (models.ExerciseLevel as Model<TaxonomyDocument>) ||
  model<TaxonomyDocument>("ExerciseLevel", taxonomySchema, "exercise_levels");

export const ExerciseCategory: Model<TaxonomyDocument> =
  (models.ExerciseCategory as Model<TaxonomyDocument>) ||
  model<TaxonomyDocument>("ExerciseCategory", taxonomySchema, "exercise_categories");

export const Muscle: Model<MuscleDocument> =
  (models.Muscle as Model<MuscleDocument>) || model<MuscleDocument>("Muscle", muscleSchema);

export const Exercise: Model<ExerciseDocument> =
  (models.Exercise as Model<ExerciseDocument>) || model<ExerciseDocument>("Exercise", exerciseSchema);
