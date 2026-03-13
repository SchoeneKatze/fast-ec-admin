const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8002";

// --- 1. 定义筛选接口 ---
export interface ProductFilters {
  product_id?: string;
  date_start?: string;
  date_end?: string;
  price_min?: string | number;
  price_max?: string | number;
  stock_status?: string;
}

// --- 2. 商品相关接口定义 ---
export interface Product {
  product_id: string;
  category_id?: number;
  brand_id?: number;
  title: string;
  description?: string;
  base_price: number;
  currency_code: string;
  tax_class: "Standard" | "Reduced" | "Zero";
  stock_quantity: number;
  sku_internal_code?: string;
  barcode?: string;
  discount_factor: number;
  created_at?: string;
  // 后端计算字段
  symbol?: string;
  final_price?: number;
  tax_rate?: number;
  category_name?: string;
}

export interface ProductListResponse {
  status: string;
  data: Product[];
  total: number;
}

export interface PricePreviewResponse {
  final_price: number;
  symbol: string;
}

export type ProductUpdate = Partial<Omit<Product, "product_id" | "created_at">>;

// --- 3. 订单相关接口定义 ---
export interface OrderItem {
  sku: string;
  title: string;
  quantity: number;
  price: number;
}

export interface Order {
  order_id: string;
  customer_name: string;
  total_amount: number;
  currency_code: string;
  symbol: string;
  status: "Pending" | "Processing" | "Completed" | "Cancelled";
  created_at: string;
  items: OrderItem[];
}

export interface OrderListResponse {
  status: string;
  data: Order[];
  total: number;
}

// --- 4. 客户端实现 ---
export const apiClient = {
  /**
   * 核心请求封装 (基于原生 fetch)
   */
  async request<T>(
    endpoint: string,
    method: string = "GET",
    body?: unknown,
  ): Promise<T> {
    const options: RequestInit = {
      method,
      headers: { "Content-Type": "application/json" },
    };

    if (body) options.body = JSON.stringify(body);

    const response = await fetch(`${BACKEND_URL}${endpoint}`, options);

    if (!response.ok) {
      const errorDetail = await response.json().catch(() => ({}));
      throw new Error(errorDetail.detail || `HTTP Error ${response.status}`);
    }

    const result = await response.json();
    if (result === null || result === undefined) {
      throw new Error("Backend response is empty");
    }
    return result as T;
  },

  // --- 商品接口 ---
  
  /**
   * 获取商品列表（带筛选）
   */
  async getProducts(filters: ProductFilters): Promise<ProductListResponse> {
    // 1. 过滤无效参数
    const cleanParams = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== "" && v !== "ALL")
    );

    // 2. 将对象转为 URL 查询字符串: ?product_id=1&price_min=10...
    const queryString = new URLSearchParams(cleanParams as Record<string, string>).toString();
    const endpoint = `/api/products${queryString ? `?${queryString}` : ""}`;

    return this.request<ProductListResponse>(endpoint, "GET");
  },

  async createProduct(productData: Product): Promise<Product> {
    return this.request<Product>("/api/products", "POST", productData);
  },

  async updateProduct(
    productId: string,
    productData: ProductUpdate,
  ): Promise<Product> {
    return this.request<Product>(
      `/api/products/${productId}`,
      "PUT",
      productData,
    );
  },

  async deleteProduct(
    productId: string,
  ): Promise<{ status: string; message: string }> {
    return this.request<{ status: string; message: string }>(
      `/api/products/${productId}`,
      "DELETE",
    );
  },

  // --- 价格试算 (Preview) ---
  async calculatePreview(params: {
    base_price: number;
    discount_factor: number;
    tax_class: string;
    currency_code: string;
  }): Promise<PricePreviewResponse> {
    return this.request<PricePreviewResponse>(
      "/api/products/calculate-preview",
      "POST",
      params,
    );
  },

  // --- 订单接口 ---
  async getOrders(skip = 0, limit = 100): Promise<OrderListResponse> {
    return this.request<OrderListResponse>(
      `/orders/api/list?skip=${skip}&limit=${limit}`,
      "GET"
    );
  },
};