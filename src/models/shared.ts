import { Schema } from "mongoose";

export const localizedStringSchema = new Schema(
  {
    en: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    vi: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
  },
  { _id: false },
);
