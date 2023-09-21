import { model, Schema, Document, Model, Types } from "mongoose";

export interface CategoryData {
  title: string;
  parent?: Types.ObjectId;
  isDeleted?: boolean;
}

export interface CategoryDocument extends CategoryData, Document {
//   Add any additional methods or virtual properties specific to this model
}

const categorySchema: Schema<CategoryData> = new Schema<CategoryData>(
  {
    title: {
      type: String,
      require: true,
      index:true
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: "Category",
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Category: Model<CategoryDocument> = model<CategoryDocument>(
  "Category",
  categorySchema
);

export default Category;
