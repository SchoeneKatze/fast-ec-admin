import  { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  // Filter,
  Edit2,
  Trash2,
  Image as ImageIcon,
  X,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../utils";
import { apiClient } from "../../api/apiClient";

// 严格对应 SQL 表结构的接口
interface Product {
  product_id: string;
  category_id?: number;
  brand_id?: number;
  title: string;
  description?: string;
  base_price: number;
  tax_rate?: number;
  currency_code: string;
  tax_class: "Standard" | "Reduced" | "Zero";
  stock_quantity: number;
  sku_internal_code?: string;
  barcode?: string;
  discount_factor: number;
  created_at?: string;

  symbol?: string;
  final_price?: number;
  category_name?: string;
  stock_status?: string;
}

// 初始表单状态
const initialForm: Product = {
  product_id: "",
  title: "",
  description: "",
  base_price: 0,
  currency_code: "USD",
  tax_class: "Standard",
  stock_quantity: 0,
  sku_internal_code: "",
  barcode: "",
  discount_factor: 1.0,
};

export default function ProductInventory() {
  // 1. 基础状态声明
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [previewData, setPreviewData] = useState<{
    price: number;
    symbol: string;
  } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState<Product>(initialForm);

  // 2. 筛选状态 (确保声明在 loadProducts 之前)
  const [filters, setFilters] = useState({
    product_id: "",
    date_start: "",
    date_end: "",
    price_min: "",
    price_max: "",
    stock_status: "ALL",
  });

  // 3. 核心加载函数 (使用 useCallback 避免死循环)
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      // 直接将当前的 filters 状态传给接口
      const response = await apiClient.getProducts(filters);
      if (response?.data) setProducts(response.data);
    } catch (err) {
      console.error("Fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // 4. 副作用：组件挂载及筛选条件改变时自动加载
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // 5. 价格预览逻辑 (防抖处理)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (isModalOpen) {
        setIsCalculating(true);
        try {
          const res = await apiClient.calculatePreview({
            base_price: formData.base_price,
            discount_factor: formData.discount_factor,
            tax_class: formData.tax_class,
            currency_code: formData.currency_code,
          });
          setPreviewData({ price: res.final_price, symbol: res.symbol });
        } catch (e) {
          console.error("Calculation failed:", e);
        } finally {
          setIsCalculating(false);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [
    isModalOpen,
    formData.base_price,
    formData.discount_factor,
    formData.tax_class,
    formData.currency_code,
  ]);

  // 6. 交互处理函数
  const getStockStatus = (stock: number) => {
    if (stock === 0) return "Out of Stock";
    if (stock < 10) return "Low Stock";
    return "In Stock";
  };

  const hasFilters = useMemo(() => {
    return (
      filters.product_id !== "" ||
      filters.date_start !== "" ||
      filters.date_end !== "" ||
      filters.price_min !== "" ||
      filters.price_max !== "" ||
      filters.stock_status !== "ALL"
    );
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      product_id: "",
      date_start: "",
      date_end: "",
      price_min: "",
      price_max: "",
      stock_status: "ALL",
    });
    // 注意：由于 useEffect 监听了 filters，这里不需要手动调用 loadProducts
  };

  const isDirty = useMemo(() => {
    const compareTarget = editingProduct || initialForm;
    const keys = [
      "title",
      "description",
      "base_price",
      "tax_class",
      "stock_quantity",
      "sku_internal_code",
      "barcode",
      "discount_factor",
    ] as const;
    return keys.some((key) => {
      const current = formData[key] ?? "";
      const original = compareTarget[key] ?? "";
      return current.toString() !== original.toString();
    });
  }, [formData, editingProduct]);

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({ ...product });
    } else {
      setEditingProduct(null);
      setFormData({
        ...initialForm,
        product_id: `PRD-${Math.floor(Math.random() * 10000)}`,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isDirty && !window.confirm("检测到未保存的更改，确定要关闭吗？"))
      return;
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const actionText = editingProduct ? "更新" : "创建";
    if (!window.confirm(`确定要${actionText}商品 [${formData.title}] 吗？`))
      return;
    try {
      if (editingProduct) {
        await apiClient.updateProduct(formData.product_id, formData);
      } else {
        await apiClient.createProduct(formData);
      }
      alert(`${actionText}成功`);
      setIsModalOpen(false);
      loadProducts();
    } catch (err) {
      alert("操作失败: " + err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(`确定要永久删除商品 #${id} 吗？`)) {
      try {
        await apiClient.deleteProduct(id);
        alert("已成功删除");
        loadProducts();
      } catch (err) {
        alert("删除失败: " + err);
      }
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-8 min-h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Product Inventory
          </h1>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest mt-1">
            Database: {products.length} Records
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openModal()}
            className="flex items-center justify-center gap-2 bg-[#21c45d] hover:bg-[#1aa84a] text-white px-6 py-3 rounded-xl font-black text-xs transition-all shadow-lg shadow-emerald-200 uppercase"
          >
            <Plus size={16} /> Add New Product
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-4 p-6 bg-white border border-slate-200 rounded-2xl mb-6 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 第一行：商品码与库存状态 */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
              Product ID
            </label>
            <input
              placeholder="Search ID..."
              value={filters.product_id}
              onChange={(e) =>
                setFilters({ ...filters, product_id: e.target.value })
              }
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
                Stock Status
              </label>
              <button
                onClick={resetFilters}
                disabled={!hasFilters}
                className={cn(
                  "flex items-center gap-1 text-[10px] font-black uppercase transition-colors",
                  hasFilters
                    ? "text-rose-500 hover:text-rose-700"
                    : "text-slate-200 cursor-not-allowed",
                )}
              >
                <RotateCcw size={10} /> Reset
              </button>
            </div>
            <select
              value={filters.stock_status}
              onChange={(e) =>
                setFilters({ ...filters, stock_status: e.target.value })
              }
              className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm bg-slate-50 outline-none focus:border-emerald-500 font-bold"
            >
              <option value="ALL">All Inventory</option>
              <option value="InStock">In Stock</option>
              <option value="OutOfStock">Out of Stock</option>
            </select>
          </div>

          {/* 第二行：日期范围 (起 & 止) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
              Date Range (Start - End)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.date_start}
                onChange={(e) =>
                  setFilters({ ...filters, date_start: e.target.value })
                }
                className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs"
              />
              <span className="text-slate-300">-</span>
              <input
                type="date"
                value={filters.date_end}
                onChange={(e) =>
                  setFilters({ ...filters, date_end: e.target.value })
                }
                className="w-full h-10 px-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
          </div>

          {/* 第三行：价格区间 (最低 - 最高) */}
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">
              Base Price Range (Min - Max)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.price_min}
                onChange={(e) =>
                  setFilters({ ...filters, price_min: e.target.value })
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
              />
              <span className="text-slate-300">-</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.price_max}
                onChange={(e) =>
                  setFilters({ ...filters, price_max: e.target.value })
                }
                className="w-full h-10 px-3 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {!loading && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  ID
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Product
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Base Price
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Stock
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Created
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr
                  key={product.product_id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* 1. 商品 ID */}
                  <td className="px-6 py-4 text-xs font-bold text-slate-400">
                    #{product.product_id}
                  </td>

                  {/* 2. 商品名称与图标 */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center">
                        <ImageIcon className="text-slate-400" size={20} />
                      </div>
                      <div>
                        <span className="text-sm font-black text-slate-900 group-hover:text-[#21c45d] transition-colors">
                          {product.title}
                        </span>
                        {/* 补充显示 SKU，增加信息密度 */}
                        {product.sku_internal_code && (
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                            SKU: {product.sku_internal_code}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 3. 价格 */}
                  <td className="px-6 py-4 text-sm font-black text-slate-900">
                    ${product.base_price.toFixed(2)}
                  </td>

                  {/* 4. 库存数量 (加回) */}
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-slate-700">
                      {product.stock_quantity}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-[10px] font-bold text-slate-400">
                    {product.created_at
                      ? new Date(product.created_at).toLocaleDateString()
                      : "N/A"}
                  </td>

                  {/* 5. 状态标签 (加回) */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "w-2 h-2 rounded-full",
                          product.stock_quantity > 10
                            ? "bg-emerald-500"
                            : product.stock_quantity > 0
                              ? "bg-amber-500"
                              : "bg-red-500",
                        )}
                      ></span>
                      <span
                        className={cn(
                          "text-[10px] font-black uppercase tracking-wider",
                          product.stock_quantity > 10
                            ? "text-emerald-600"
                            : product.stock_quantity > 0
                              ? "text-amber-600"
                              : "text-red-600",
                        )}
                      >
                        {getStockStatus(product.stock_quantity)}
                      </span>
                    </div>
                  </td>

                  {/* 6. 操作按钮 */}
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openModal(product)}
                        className="p-2 hover:bg-[#21c45d]/10 text-slate-300 hover:text-[#21c45d] rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.product_id)}
                        className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 弹窗部分 */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                  {editingProduct ? "Edit Product" : "New Inventory Item"}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form
                className="p-8 space-y-8 overflow-y-auto"
                onSubmit={handleFormSubmit}
              >
                {/* 1. 只读元数据展示 */}
                <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                      Product ID
                    </label>
                    <p className="text-xs font-black text-slate-900 italic">
                      {formData.product_id}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                      In-stock Date
                    </label>
                    <p className="text-xs font-black text-slate-900">
                      {formData.created_at
                        ? new Date(formData.created_at).toLocaleDateString()
                        : "TODAY"}
                    </p>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">
                      Current Status
                    </label>
                    <p
                      className={cn(
                        "text-[10px] font-black px-2 py-0.5 rounded inline-block",
                        formData.stock_quantity > 0
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700",
                      )}
                    >
                      {formData.stock_quantity > 0
                        ? "AVAILABLE"
                        : "OUT OF STOCK"}
                    </p>
                  </div>
                </div>

                {/* 2. 可编辑表单字段 */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Display Title
                    </label>
                    <input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full h-12 px-4 bg-white border-2 border-slate-100 rounded-xl focus:border-[#21c45d] outline-none font-bold text-sm transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Internal SKU Code
                    </label>
                    <input
                      value={formData.sku_internal_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sku_internal_code: e.target.value,
                        })
                      }
                      className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-[#21c45d]"
                      placeholder="WH-01-A"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Barcode / EAN
                    </label>
                    <input
                      value={formData.barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode: e.target.value })
                      }
                      className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-[#21c45d]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Tax Class
                    </label>
                    <select
                      value={formData.tax_class}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tax_class: e.target.value as Product["tax_class"],
                        })
                      }
                      className="w-full h-12 px-4 bg-transparent border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-[#21c45d]"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Reduced">Reduced</option>
                      <option value="Zero">Zero Tax</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Discount (0.0 - 1.0)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.discount_factor}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discount_factor: parseFloat(e.target.value),
                        })
                      }
                      className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-[#21c45d]"
                    />
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Input Currency
                    </label>
                    <select
                      value={formData.currency_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          currency_code: e.target.value,
                        })
                      }
                      className="w-full h-12 px-4 bg-transparent border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-[#21c45d]"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="CNY">CNY - Chinese Yuan</option>
                      <option value="JPY">JPY - Japanese Yen</option>
                      <option value="EUR">EUR - Euro</option>
                    </select>
                  </div>

                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Base Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.base_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          base_price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-[#21c45d]"
                      required
                    />
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-100">
                    <label className="text-[10px] font-black text-slate-400 uppercase">
                      Final Price (Calculated by Backend)
                    </label>
                    <div
                      className={cn(
                        "flex items-baseline gap-1 transition-opacity",
                        isCalculating ? "opacity-50" : "opacity-100",
                      )}
                    >
                      <span className="text-xl font-bold text-slate-900">
                        {previewData?.symbol || formData.symbol}
                      </span>
                      <span className="text-3xl font-black text-slate-900">
                        {previewData?.price ?? formData.final_price}
                      </span>
                      {isCalculating && (
                        <span className="text-[10px] text-emerald-500 animate-pulse ml-2">
                          CALCULATING...
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          stock_quantity: parseInt(e.target.value),
                        })
                      }
                      className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl font-bold text-sm outline-none focus:border-[#21c45d]"
                      required
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="w-full h-24 p-4 bg-white border-2 border-slate-100 rounded-xl focus:border-[#21c45d] outline-none font-medium text-sm transition-all resize-none"
                    />
                  </div>
                </div>

                {/* 按钮区域 */}
                <div className="pt-8 flex justify-end gap-3 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-3 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="px-10 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase shadow-xl hover:bg-[#21c45d] transition-all"
                  >
                    {editingProduct ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
