import { useState, useEffect, useMemo } from "react";
import {
  Search,
  // Eye,
  // Download,
  X,
  // ShoppingBag,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../utils";

// --- 类型定义 ---
interface RawOrderItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface AddressInfo {
  tag: string;
  recipient_name: string;
  phone: string;
  full_address: string;
}

interface Order {
  id: number;
  orderNo: string;
  userId: string;
  userEmail?: string;
  currency: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: RawOrderItem[];
  address?: AddressInfo | null;
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // --- 筛选状态 ---
  const [searchNo, setSearchNo] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });

  // 判断是否处于筛选激活状态
  const hasFilters = useMemo(() => {
    return (
      searchNo !== "" ||
      statusFilter !== "ALL" ||
      dateRange.start !== "" ||
      dateRange.end !== "" ||
      priceRange.min !== "" ||
      priceRange.max !== ""
    );
  }, [searchNo, statusFilter, dateRange, priceRange]);

  const resetFilters = () => {
    setSearchNo("");
    setStatusFilter("ALL");
    setDateRange({ start: "", end: "" });
    setPriceRange({ min: "", max: "" });
  };

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:8002/api/orders");
        const resData = await response.json();

        // 1. 这里的类型直接对应后端返回的 JSON 结构 (下划线格式)
        interface BackendOrder {
          id: number;
          order_no: string;
          user_id: string;
          user_email: string; // 后端传回来的
          currency: string;
          total_price: number;
          status: string;
          created_at: string;
          items: RawOrderItem[];
          address: AddressInfo | null; // 后端传回来的
        }

        const rawData: BackendOrder[] = Array.isArray(resData.data)
          ? resData.data
          : [];

        // 2. 转换成前端使用的 Order 类型 (驼峰格式)
        const formattedOrders: Order[] = rawData.map((o) => ({
          id: o.id,
          orderNo: o.order_no,
          userId: o.user_id,
          userEmail: o.user_email, // 这里的映射最关键！
          currency: o.currency || "¥",
          totalPrice: Number(o.total_price),
          status: o.status,
          createdAt: o.created_at,
          items: o.items || [],
          address: o.address, // 这里的映射最关键！
        }));

        setOrders(formattedOrders);
      } catch (err) {
        console.error("Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, []);
  // --- 核心过滤逻辑：确保所有变量都被用到 ---
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // 1. 订单号搜索
      const matchNo = order.orderNo
        .toLowerCase()
        .includes(searchNo.toLowerCase());

      // 2. 状态匹配
      const matchStatus =
        statusFilter === "ALL" || order.status === statusFilter;

      // 3. 日期匹配
      const orderTime = new Date(order.createdAt).getTime();
      const startTime = dateRange.start
        ? new Date(dateRange.start).getTime()
        : 0;
      const endTime = dateRange.end
        ? new Date(dateRange.end).getTime() + 86400000
        : Infinity;
      const matchDate = orderTime >= startTime && orderTime <= endTime;

      // 4. 金额匹配
      const minVal = priceRange.min ? parseFloat(priceRange.min) : 0;
      const maxVal = priceRange.max ? parseFloat(priceRange.max) : Infinity;
      const matchPrice =
        order.totalPrice >= minVal && order.totalPrice <= maxVal;

      return matchNo && matchStatus && matchDate && matchPrice;
    });
  }, [orders, searchNo, statusFilter, dateRange, priceRange]);

  const updateOrderStatus = async (orderNo: string, newStatus: string) => {
    try {
      const response = await fetch(
        `http://localhost:8002/api/orders/${orderNo}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      if (response.ok) {
        // 更新本地状态，让页面即时响应
        setOrders((prev) =>
          prev.map((o) =>
            o.orderNo === orderNo ? { ...o, status: newStatus } : o,
          ),
        );
        setSelectedOrder((prev) =>
          prev ? { ...prev, status: newStatus } : null,
        );
        alert("Status updated")
      }
    } catch (err) {
      console.error("Update failed:", err);
    }
  };

  return (
    <div className="flex flex-col p-4 md:p-10 max-w-[1440px] mx-auto w-full min-h-full">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Order List
          </h1>
          <p className="text-slate-500 font-bold text-xs tracking-widest mt-1">
            {hasFilters
              ? `MATCHED: ${filteredOrders.length}`
              : `TOTAL: ${orders.length}`}{" "}
            RECORDS
          </p>
        </div>
        {/* <button className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase hover:bg-slate-50 transition-all shadow-sm">
          <Download size={14} className="mr-2" /> Export CSV
        </button> */}
      </div>
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
          <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest">
            Accessing Database...
          </p>
        </div>
      ) : (
        <>
          {/* --- 筛选区域 --- */}
          <div className="bg-white rounded-xl p-6 mb-6 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* 订单搜索 */}
              <div>
                <label className="block text-[12px] font-black text-slate-400 uppercase mb-2">
                  Order ID
                </label>
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                    size={14}
                  />
                  <input
                    type="text"
                    value={searchNo}
                    onChange={(e) => setSearchNo(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 border border-slate-200 focus:border-slate-900 outline-none text-sm transition-all"
                    placeholder="ID..."
                  />
                </div>
              </div>

              {/* 状态选择 + Reset */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[12px] font-black text-slate-400 uppercase">
                    Status
                  </label>
                  <button
                    onClick={resetFilters}
                    disabled={!hasFilters}
                    className={cn(
                      "flex items-center gap-1 text-[12px] font-black uppercase transition-colors",
                      hasFilters
                        ? "text-rose-500 hover:text-rose-700"
                        : "text-slate-200 cursor-not-allowed",
                    )}
                  >
                    <RotateCcw size={10} /> Reset
                  </button>
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 outline-none text-sm font-bold uppercase"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="PAID">Paid</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              {/* 日期范围 */}
              <div>
                <label className="block text-[12px] font-black text-slate-400 uppercase mb-2">
                  Date Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, start: e.target.value })
                    }
                    className="w-full h-10 px-2 rounded-lg bg-slate-50 border border-slate-200 text-[12px] font-bold"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, end: e.target.value })
                    }
                    className="w-full h-10 px-2 rounded-lg bg-slate-50 border border-slate-200 text-[12px] font-bold"
                  />
                </div>
              </div>

              {/* 金额范围 */}
              <div>
                <label className="block text-[12px] font-black text-slate-400 uppercase mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="MIN"
                    value={priceRange.min}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, min: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                  <input
                    type="number"
                    placeholder="MAX"
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({ ...priceRange, max: e.target.value })
                    }
                    className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- 数据表格 --- */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/80 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest">
                      Order ID
                    </th>
                    {/* <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest">
                      Client
                    </th> */}
                    <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest">
                      Created
                    </th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-6 py-4 text-[12px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="group hover:bg-slate-50/80 transition-all cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4 text-sm font-black text-slate-900 underline decoration-slate-200 underline-offset-4 group-hover:decoration-slate-900 transition-all">
                        #{order.orderNo}
                      </td>
                      {/* <td className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase">
                        {order.userId}
                      </td> */}
                      <td className="px-6 py-4 text-[12px] font-bold text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[12px] font-black uppercase tracking-tighter",
                            order.status === "PAID"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-black text-right text-slate-900">
                        {order.currency}
                        {order.totalPrice.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredOrders.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-[12px] font-black text-slate-300 uppercase tracking-[0.3em]">
                  No records match criteria
                </p>
              </div>
            )}
          </div>
        </>
      )}
      {/* 详情模态框 */}
      <AnimatePresence>
        {selectedOrder && (
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-50 p-6"
            onClick={() => setSelectedOrder(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100"
            >
              {/* Header 保持不变... */}
              <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-black tracking-tighter text-slate-900">
                    Order Detail
                  </h2>
                  <p className="text-slate-400 text-[12px] font-black mt-1 uppercase tracking-[0.2em]">
                    {selectedOrder.orderNo}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-900"
                >
                  <X size={20} />
                </button>
              </div>

              {/* 中间物品列表部分保持不变... */}
              <div className="p-8 space-y-6 max-h-[40vh] overflow-y-auto">
                {selectedOrder.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center text-[12px] font-black text-slate-300 italic">
                        ITEM
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-sm tracking-tight leading-none">
                          {item.product_name}
                        </p>
                        <p className="text-[12px] font-bold text-slate-400 uppercase mt-1">
                          QTY: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-black text-slate-900 text-sm">
                      {selectedOrder.currency}
                      {item.unit_price}
                    </p>
                  </div>
                ))}
              </div>

              {/* 底部信息区：重构左侧风格，增加右侧状态修改 */}
              <div className="p-8 bg-slate-50/80 border-t border-slate-100">
                <div className="flex flex-col md:flex-row justify-between items-start gap-8">
                  {/* 左侧：配送与联系信息 (全新风格：不加粗、不浅色、大一号、垂直罗列) */}
                  <div className="flex-1 text-slate-900 text-sm space-y-2.5">
                    {selectedOrder.address ? (
                      <>
                        <p>
                          {selectedOrder.address.recipient_name} (
                          {selectedOrder.address.tag})
                        </p>
                        <p>{selectedOrder.address.full_address}</p>
                        <p>Tel: {selectedOrder.address.phone}</p>
                      </>
                    ) : (
                      <p className="italic text-slate-400">
                        No shipping address
                      </p>
                    )}
                    <p>
                      Email: {selectedOrder.userEmail || "No Email Provided"}
                    </p>
                  </div>

                  {/* 右侧：状态修改与总价 */}
                  <div className="flex flex-col items-end gap-6 min-w-[200px]">
                    {/* 状态修改区域 */}
                    <div className="w-full">
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-2 text-right">
                        Update Status
                      </p>
                      <div className="flex gap-2">
                        <select
                          defaultValue={selectedOrder.status}
                          id="status-update-select"
                          className="flex-1 h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-bold outline-none focus:border-slate-900 transition-all"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="PAID">PAID</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                        <button
                          onClick={() => {
                            const sel = document.getElementById(
                              "status-update-select",
                            ) as HTMLSelectElement;
                            updateOrderStatus(selectedOrder.orderNo, sel.value);
                          }}
                          className="px-4 h-9 bg-slate-900 text-white text-[12px] font-black uppercase rounded-lg hover:bg-slate-800 transition-all"
                        >
                          Apply
                        </button>
                      </div>
                    </div>

                    {/* 总价显示 */}
                    <div className="text-right">
                      <p className="text-[12px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        Total Amount
                      </p>
                      <span className="text-3xl font-black text-slate-900 tracking-tighter">
                        {selectedOrder.currency}
                        {selectedOrder.totalPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>{" "}
    </div>
  );
}
