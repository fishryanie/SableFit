import { model, models, Schema, type InferSchemaType, type Model } from "mongoose";

const appUserSchema = new Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    phoneE164: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    locale: {
      type: String,
      enum: ["vi", "en"],
      default: "vi",
    },
    timezone: {
      type: String,
      default: "Asia/Ho_Chi_Minh",
      trim: true,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    reminderTime: {
      type: String,
      default: "06:30",
      trim: true,
    },
    activePlanId: {
      type: Schema.Types.ObjectId,
      ref: "WorkoutPlan",
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "users",
  },
);

appUserSchema.index({ locale: 1, createdAt: -1 });

const appUserSessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
      index: true,
    },
    tokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: 400,
      default: "",
    },
    ipAddress: {
      type: String,
      trim: true,
      maxlength: 80,
      default: "",
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastSeenAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: "user_sessions",
  },
);

appUserSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const pushSubscriptionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "AppUser",
      required: true,
      index: true,
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    keys: {
      auth: { type: String, required: true },
      p256dh: { type: String, required: true },
    },
    platform: {
      type: String,
      trim: true,
      default: "web",
    },
    locale: {
      type: String,
      enum: ["vi", "en"],
      default: "vi",
    },
    timezone: {
      type: String,
      trim: true,
      default: "Asia/Ho_Chi_Minh",
    },
    isPwaInstalled: {
      type: Boolean,
      default: false,
    },
    lastConfirmedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    collection: "push_subscriptions",
  },
);

pushSubscriptionSchema.index({ userId: 1, status: 1, updatedAt: -1 });

export type AppUserDocument = InferSchemaType<typeof appUserSchema>;
export type AppUserSessionDocument = InferSchemaType<typeof appUserSessionSchema>;
export type PushSubscriptionDocument = InferSchemaType<typeof pushSubscriptionSchema>;

export const AppUser: Model<AppUserDocument> =
  (models.AppUser as Model<AppUserDocument>) || model<AppUserDocument>("AppUser", appUserSchema);

export const AppUserSession: Model<AppUserSessionDocument> =
  (models.AppUserSession as Model<AppUserSessionDocument>) ||
  model<AppUserSessionDocument>("AppUserSession", appUserSessionSchema);

export const PushSubscription: Model<PushSubscriptionDocument> =
  (models.PushSubscription as Model<PushSubscriptionDocument>) ||
  model<PushSubscriptionDocument>("PushSubscription", pushSubscriptionSchema);
