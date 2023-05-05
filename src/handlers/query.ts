import { ProductModel } from "../models/product";
import { HttpError } from "../errors/error";

export class Query {
  public data: any;
  private queryString: any;
  constructor(data, queryString) {
    this.data = data;
    this.queryString = queryString;
  }
  async filter() {
    const query = { ...(this.queryString as any) };
    const excludedFields = ["fields", "sort", "page", "limit"];
    excludedFields.forEach((el) => delete query[el]);
    //Advanced filtering
    let queryStr = JSON.stringify(query);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.data.find(JSON.parse(queryStr));
    return this;
  }
  async sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.toString().split(",").join(" ");
      this.data = this.data.sort(sortBy);
    } else {
      this.data = this.data.sort("-createdAt");
    }
    return this;
  }
  async limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.toString().split(",").join(" ");
      this.data = this.data.select(fields);
    }
    return this;
  }
  async paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 10;
    const skip = (page - 1) * limit;
    this.data = this.data.skip(skip).limit(limit);
    if (this.queryString.page) {
      const numProducts = await ProductModel.countDocuments();
      if (skip >= numProducts) {
        throw new HttpError("This page does not exist", 404);
      }
    }
    return this;
  }
}
