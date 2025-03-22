import { IOrder, IOrderRequest } from "../types";
import { IItemPreview } from "../types";
import { Api, ApiListResponse } from "./base/api";

export interface IShopAPI {
  getProductList: () => Promise<IItemPreview[]>;
  getProductItem: (id: string) => Promise<IItemPreview>;
  placeOrder: (order: IOrderRequest) => Promise<IOrder>;
}

export class ShopAPI extends Api implements IShopAPI {
  readonly cdn: string;

  constructor(cdn: string, baseUrl: string, options?: RequestInit) {
      super(baseUrl, options);
      this.cdn = cdn;
  }

  getProductItem(id: string): Promise<IItemPreview> {
      return this.get(`/product/${id}`).then(
          (item: IItemPreview) => ({
              ...item,
              image: this.cdn + item.image,
          })
      );
  }

  getProductList(): Promise<IItemPreview[]> {
      return this.get('/product').then((data: ApiListResponse<IItemPreview>) =>
          data.items.map((item) => ({
              ...item,
              image: this.cdn + item.image
          }))
      );
  }

  placeOrder(order: IOrderRequest): Promise<IOrder> {
      return this.post('/order', order).then(
          (data: IOrder) => data
      );
  }
}