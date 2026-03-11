import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  // Search, 
  Filter, 
  Edit2, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  Image as ImageIcon,
  X,
  CloudUpload
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils';
import { apiClient } from '../../api/apiClient';

interface Product {
  product_id: string;
  title: string;
  category_id?: number;
  base_price: number;
  currency_code: string;
  stock_quantity: number;
  sku_internal_code?: string;
  discount_factor?: number;
}

export default function ProductInventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getProducts();
        if (response?.data) {
          setProducts(response.data);
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        setError('Error loading products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="flex flex-col p-4 md:p-8 min-h-full">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Inventory</h1>
          <p className="text-slate-500 text-sm">Total: {products.length} products</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-[#21c45d] hover:bg-[#21c45d]/90 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-lg shadow-[#21c45d]/20"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#21c45d] mx-auto mb-4"></div>
            <p className="text-slate-600">Loading products...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {!loading && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="md:col-span-4 relative">
          <label className="text-[10px] font-bold text-slate-400 absolute left-3 top-1">SEARCH</label>
          <input 
            type="text" 
            className="w-full pt-4 pb-1.5 px-3 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-[#21c45d] focus:border-[#21c45d] outline-none" 
            placeholder="Product name or ID..."
          />
        </div>
        <div className="md:col-span-3 relative">
          <label className="text-[10px] font-bold text-slate-400 absolute left-3 top-1">FROM DATE</label>
          <input 
            type="date" 
            className="w-full pt-4 pb-1.5 px-3 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-[#21c45d] focus:border-[#21c45d] outline-none"
          />
        </div>
        <div className="md:col-span-3 relative">
          <label className="text-[10px] font-bold text-slate-400 absolute left-3 top-1">TO DATE</label>
          <input 
            type="date" 
            className="w-full pt-4 pb-1.5 px-3 bg-slate-50 border-slate-200 rounded-lg text-sm focus:ring-[#21c45d] focus:border-[#21c45d] outline-none"
          />
        </div>
        <div className="md:col-span-2">
          <button className="w-full h-full flex items-center justify-center gap-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-sm font-semibold text-slate-600 transition-colors">
            <Filter size={18} />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Product ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product.product_id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-slate-500">#{product.product_id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 flex items-center justify-center">
                        <ImageIcon className="text-slate-400" size={20} />
                      </div>
                      <span className="text-sm font-semibold group-hover:text-[#21c45d] transition-colors">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold">${product.base_price.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-semibold">{product.stock_quantity}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        product.stock_quantity > 10 ? 'bg-emerald-500' : 
                        product.stock_quantity > 0  ? 'bg-amber-500' : 'bg-red-500'
                      )}></span>
                      <span className={cn(
                        "text-xs font-semibold",
                        product.stock_quantity > 10 ? 'text-emerald-600' : 
                        product.stock_quantity > 0 ? 'text-amber-600' : 'text-red-600'
                      )}>
                        {getStockStatus(product.stock_quantity)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 hover:bg-[#21c45d]/10 hover:text-[#21c45d] rounded text-slate-400 transition-colors">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-1.5 hover:bg-red-50 hover:text-red-500 rounded text-slate-400 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="mt-auto border-t border-slate-200 px-6 py-4 flex items-center justify-between bg-slate-50/50">
          <p className="text-sm text-slate-500">Showing <span className="font-bold text-slate-900">1 - 3</span> of <span className="font-bold text-slate-900">432</span> products</p>
          <div className="flex items-center gap-2">
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-400 disabled:opacity-50" disabled>
              <ChevronLeft size={20} />
            </button>
            <button className="w-9 h-9 bg-[#21c45d] text-white rounded-lg font-bold text-sm">1</button>
            <button className="w-9 h-9 hover:bg-slate-200 rounded-lg font-bold text-sm transition-colors">2</button>
            <button className="w-9 h-9 hover:bg-slate-200 rounded-lg font-bold text-sm transition-colors">3</button>
            <span className="px-1">...</span>
            <button className="w-9 h-9 hover:bg-slate-200 rounded-lg font-bold text-sm transition-colors">9</button>
            <button className="p-2 border border-slate-200 rounded-lg hover:bg-white text-slate-400">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-100">
                <h3 className="text-xl font-bold">Add New Product</h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X size={24} />
                </button>
              </div>
              <form className="p-6" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Product Name</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-[#21c45d] focus:border-[#21c45d] outline-none" placeholder="Enter product name" type="text" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Category</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-[#21c45d] focus:border-[#21c45d] outline-none appearance-none">
                      <option>Select category</option>
                      <option>Electronics</option>
                      <option>Apparel</option>
                      <option>Home & Garden</option>
                      <option>Sports</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Base Price ($)</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-[#21c45d] focus:border-[#21c45d] outline-none" placeholder="0.00" type="number" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Initial Stock</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-[#21c45d] focus:border-[#21c45d] outline-none" placeholder="0" type="number" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">SKU / Product ID</label>
                    <input className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-[#21c45d] focus:border-[#21c45d] outline-none" placeholder="PRD-XXXX" type="text" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Product Images</label>
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="w-12 h-12 bg-[#21c45d]/10 rounded-full flex items-center justify-center text-[#21c45d] group-hover:scale-110 transition-transform">
                        <CloudUpload size={24} />
                      </div>
                      <p className="text-sm font-semibold">Drop your images here, or <span className="text-[#21c45d] underline">browse</span></p>
                      <p className="text-xs text-slate-400">Supports PNG, JPG (Max 5MB)</p>
                    </div>
                  </div>
                </div>
                <div className="mt-8 flex items-center justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 border border-slate-200 rounded-lg font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 bg-[#21c45d] hover:bg-[#21c45d]/90 text-white rounded-lg font-bold text-sm transition-all shadow-lg shadow-[#21c45d]/20"
                  >
                    Create Product
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
}
