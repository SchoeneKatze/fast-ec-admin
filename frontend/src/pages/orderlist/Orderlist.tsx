import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  Filter, 
  Eye, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Plus, 
  X, 
  Mail, 
  Phone, 
  Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../utils';

interface OrderItem {
  name: string;
  description: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  date: string;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  total: number;
  items: OrderItem[];
}

const INITIAL_ORDERS: Order[] = [
  { 
    id: 'ORD-90210', 
    customerName: 'Alex Sterling', 
    customerEmail: 'alex.s@email.com', 
    date: 'Oct 24, 2023', 
    status: 'Pending', 
    total: 1240.00,
    items: [
      { 
        name: 'Nike Air Max Pro', 
        description: 'Size: 42, Color: Electric Red', 
        price: 240.00, 
        quantity: 2, 
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5mr30JaaYpscjgf678H_enuhpbf12tl0B4WsHf8sTnIjXlRAYqRqPEo-J-TXXt-uW1QId4R4kVpm5fsHDDYVJ9N1le2I0gc8h0xwNuIK63BI7ENEk9FSAsqFsALNTBrknQCAeAEDSMwhQdtws3dGUhqNDY526vuYdOVeNx4olEP85ZbcAOuODsF4AmBIxr660F3QVYKnMqZbduugfG_IdDVn2HTn95N1XiQ2_zfh3KzD4HSeXlOwHwabmr4tFd55iHTYAW19Zxcni' 
      },
      { 
        name: 'Urban Tech Backpack', 
        description: 'Waterproof, 15" Laptop Sleeve', 
        price: 760.00, 
        quantity: 1, 
        image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuATL0xJx7ZcVcI7nncs65p4cGVIBxXElXX9zKvkb6KowDGyAnf_6t18tEBI5XblsDKH4qpiTfzJ_O3Ugnq2_V39Cc4ZkWfGpLnYaKE-9o4JgMOw4H2_4FbWVBIWxiLQa14jt7t8E_H4YskNkYHcEB8M_D-jHEwCx6-4RGZAoFAcTzF0xGg3T1LweBz2f-ivK3ECsiddRUeJ0hzBJ9pwcuyk797or3WihZq0okGBKpsoNiBgBfQNry3DxAqzkH8xZg33pNIFErcZrvyu' 
      }
    ]
  },
  { id: 'ORD-90211', customerName: 'Jane Miller', customerEmail: 'jane.m@outlook.com', date: 'Oct 24, 2023', status: 'Shipped', total: 450.50, items: [] },
  { id: 'ORD-90199', customerName: 'Brian Knight', customerEmail: 'brian@knight.co', date: 'Oct 23, 2023', status: 'Delivered', total: 89.00, items: [] },
  { id: 'ORD-90188', customerName: 'Laura White', customerEmail: 'lwhite@gmail.com', date: 'Oct 22, 2023', status: 'Cancelled', total: 2400.99, items: [] },
];

export default function OrderManagement() {
  const [orders] = useState<Order[]>(INITIAL_ORDERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  return (
    <div className="flex flex-col p-4 md:p-10 max-w-[1440px] mx-auto w-full min-h-full">
      {/* Page Header */}
      <div className="flex flex-wrap justify-between items-end gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-tight">Order Management</h1>
          <p className="text-slate-500 text-base font-normal leading-normal">Monitor, filter, and process all customer transactions</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center justify-center rounded-lg h-11 px-5 bg-white border border-slate-200 text-slate-700 text-sm font-bold transition-all hover:bg-slate-50">
            <Download size={16} className="mr-2" />
            Export CSV
          </button>
          <button className="flex items-center justify-center rounded-lg h-11 px-5 bg-[#21c45d] text-white text-sm font-bold transition-all hover:opacity-90 shadow-lg shadow-[#21c45d]/20">
            <Plus size={16} className="mr-2" />
            Create New Order
          </button>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-slate-200 flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Search Orders</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                className="w-full h-11 pl-11 pr-4 rounded-lg bg-slate-50 border border-slate-200 focus:border-[#21c45d] focus:ring-1 focus:ring-[#21c45d] outline-none transition-all" 
                placeholder="Search by Order ID, product name, or customer..."
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">From</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="date" className="w-full h-11 pl-11 pr-4 rounded-lg bg-slate-50 border border-slate-200 focus:border-[#21c45d] focus:ring-1 focus:ring-[#21c45d] outline-none transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">To</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="date" className="w-full h-11 pl-11 pr-4 rounded-lg bg-slate-50 border border-slate-200 focus:border-[#21c45d] focus:ring-1 focus:ring-[#21c45d] outline-none transition-all" />
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Status:</span>
          <button className="px-4 py-1.5 rounded-full bg-[#21c45d] text-white text-xs font-bold">All Orders</button>
          <button className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-[#21c45d]/10 hover:text-[#21c45d] transition-colors">Pending</button>
          <button className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-[#21c45d]/10 hover:text-[#21c45d] transition-colors">Shipped</button>
          <button className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-[#21c45d]/10 hover:text-[#21c45d] transition-colors">Delivered</button>
          <button className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold hover:bg-[#21c45d]/10 hover:text-[#21c45d] transition-colors">Cancelled</button>
          <div className="ml-auto">
            <button className="text-[#21c45d] text-sm font-bold flex items-center gap-1 hover:underline">
              <Filter size={14} />
              Advanced Filters
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr 
                  key={order.id} 
                  className="hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <td className="px-6 py-4 text-sm font-bold text-[#21c45d]">#{order.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#21c45d]/10 flex items-center justify-center text-[#21c45d] text-xs font-bold">
                        {order.customerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="text-sm">
                        <div className="font-semibold text-slate-900">{order.customerName}</div>
                        <div className="text-slate-500 text-xs">{order.customerEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">{order.date}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
                      order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' :
                      order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    )}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">${order.total.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-slate-400 hover:text-[#21c45d] transition-colors">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="px-6 py-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50 mt-auto">
          <div className="text-sm text-slate-500 font-medium">
            Showing <span className="text-slate-900 font-bold">1-4</span> of <span className="text-slate-900 font-bold">1,240</span> orders
          </div>
          <div className="flex gap-2">
            <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-500 disabled:opacity-50" disabled>
              <ChevronLeft size={20} />
            </button>
            <button className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#21c45d] text-white font-bold">1</button>
            <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50">2</button>
            <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50">3</button>
            <div className="flex items-center px-2 text-slate-400">...</div>
            <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-600 font-medium hover:bg-slate-50">25</button>
            <button className="flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-slate-200"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white px-8 py-6 border-b border-slate-100 flex justify-between items-center z-10">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Order #{selectedOrder.id}</h3>
                  <p className="text-slate-500 font-medium">Placed on {selectedOrder.date} at 2:34 PM</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Items & Summary */}
                  <div className="lg:col-span-2 space-y-8">
                    <div>
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Order Items</h4>
                      <div className="space-y-4">
                        {selectedOrder.items.length > 0 ? selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                            <div className="w-20 h-20 rounded-lg bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="flex justify-between">
                                <div>
                                  <div className="font-bold text-slate-900">{item.name}</div>
                                  <div className="text-slate-500 text-sm italic">{item.description}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-black text-slate-900">${item.price.toFixed(2)}</div>
                                  <div className="text-slate-400 text-xs">Qty: {item.quantity}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                            No items details available for this order.
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Price Breakdown */}
                    <div className="bg-slate-50 p-6 rounded-xl space-y-3">
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Subtotal</span>
                        <span>${selectedOrder.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Shipping (Standard)</span>
                        <span className="text-green-600 font-bold uppercase text-xs">Free</span>
                      </div>
                      <div className="flex justify-between text-sm text-slate-600">
                        <span>Estimated Tax</span>
                        <span>$0.00</span>
                      </div>
                      <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                        <span className="text-lg font-bold text-slate-900">Total</span>
                        <span className="text-2xl font-black text-[#21c45d]">${selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  {/* Right Column: Customer & Shipping Details */}
                  <div className="space-y-6">
                    {/* Customer Info Card */}
                    <div className="p-6 rounded-xl border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Customer Details</h4>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-[#21c45d] text-white flex items-center justify-center font-bold text-lg">
                          {selectedOrder.customerName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{selectedOrder.customerName}</div>
                          <div className="text-slate-500 text-sm">Customer since 2021</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="text-slate-400" size={18} />
                          <span className="text-slate-700">{selectedOrder.customerEmail}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="text-slate-400" size={18} />
                          <span className="text-slate-700">+1 (555) 902-1044</span>
                        </div>
                      </div>
                    </div>
                    {/* Shipping Address Card */}
                    <div className="p-6 rounded-xl border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Shipping Address</h4>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        892 Fashion Boulevard, Suite 400<br/>
                        Beverly Hills, CA 90210<br/>
                        United States
                      </p>
                      <button className="mt-4 text-[#21c45d] text-xs font-bold hover:underline flex items-center gap-1">
                        <Edit3 size={14} />
                        Edit Address
                      </button>
                    </div>
                    {/* Order Controls */}
                    <div className="space-y-3 pt-4">
                      <label className="block text-sm font-bold text-slate-700">Change Status</label>
                      <select 
                        className="w-full h-11 rounded-lg bg-slate-50 border border-slate-200 focus:ring-[#21c45d] text-sm font-semibold outline-none"
                        defaultValue={selectedOrder.status}
                      >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                      <button className="w-full h-11 bg-[#21c45d] text-white rounded-lg font-bold shadow-lg shadow-[#21c45d]/20 hover:opacity-90 transition-all">Update Order</button>
                      <button className="w-full h-11 border border-slate-200 text-slate-600 rounded-lg font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all">Cancel Order</button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
