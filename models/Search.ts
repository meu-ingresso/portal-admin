export interface SearchPayload {
  page: Number;
  limit: Number;
  search?: String;
  where?: any;
  sortBy?: any;
  sortDesc?: any;
}

export interface GetPayload {
  page: Number;
  limit: Number;
  preloads?: any;
}
