import { useState, useEffect, useMemo } from "react";
import {
  Search,
  //   Eye,
  User,
  Package,
  X,
  RotateCcw,
} from "lucide-react";

// --- 类型定义 ---
interface OrderItem {
  product_name: string;
  quantity: number;
  unit_price: number;
}

interface Ticket {
  id: number;
  ticket_type: "REFUND" | "CONTACT";
  order_id: string;
  user_id: string;
  reason: string;
  details: string;
  status: "PENDING" | "FINISHED" | "DENIED";
  created_at: string;
  order_info?: {
    total_price: number;
    currency: string;
    status: string;
    items: OrderItem[];
  };
}

export default function AfterService() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [actionStatus, setActionStatus] = useState("");

  // --- 筛选状态 ---
  const [filters, setFilters] = useState({
    order_no: "",
    status: "",
    ticket_type: "",
    start_date: "", // 新增
    end_date: "", // 新增
    min_price: "",
    max_price: "",
  });

  const hasFilters = useMemo(() => {
    return (
      filters.order_no !== "" ||
      filters.status !== "" ||
      filters.start_date !== "" ||
      filters.end_date !== "" ||
      filters.min_price !== "" ||
      filters.max_price !== ""
    );
  }, [filters]);

  const resetFilters = () => {
    setFilters({
      order_no: "",
      status: "",
      ticket_type: "",
      start_date: "",
      end_date: "",
      min_price: "",
      max_price: "",
    });
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/tickets`,
      );
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error("加载失败", err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // --- 核心逻辑：包含日期范围的实时过滤 ---
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // 1. 订单号
      const matchNo = ticket.order_id
        .toLowerCase()
        .includes(filters.order_no.toLowerCase());

      // 2. 状态
      const matchStatus =
        filters.status === "" || ticket.status === filters.status;

      // 3. 日期范围筛选 (新增逻辑)
      const ticketTime = new Date(ticket.created_at).getTime();
      const startTime = filters.start_date
        ? new Date(filters.start_date).getTime()
        : 0;
      // 结束日期设为当天 23:59:59 (即下一天 0点)
      const endTime = filters.end_date
        ? new Date(filters.end_date).getTime() + 86400000
        : Infinity;
      const matchDate = ticketTime >= startTime && ticketTime <= endTime;

      // 4. 金额
      const totalPrice = ticket.order_info?.total_price || 0;
      const minVal = filters.min_price ? parseFloat(filters.min_price) : 0;
      const maxVal = filters.max_price
        ? parseFloat(filters.max_price)
        : Infinity;
      const matchPrice = totalPrice >= minVal && totalPrice <= maxVal;

      return matchNo && matchStatus && matchDate && matchPrice;
    });
  }, [tickets, filters]);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/admin/tickets/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      alert("status updated");
      fetchTickets();
      setSelectedTicket(null);
    } catch (err) {
      alert("update failed: " + err);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen text-slate-900">
      <header className="mb-8">
        <h1 className="text-3xl font-black tracking-tighter">After Service</h1>
        <p className="text-slate-500 font-bold text-xs tracking-widest mt-1">
          {hasFilters
            ? `MATCHED: ${filteredTickets.length}`
            : `TOTAL: ${tickets.length}`}{" "}
          RECORDS
        </p>
      </header>

      {/* --- 筛选区域：增加日期筛选 --- */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 订单搜索 */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
              Order No
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300"
                size={14}
              />
              <input
                type="text"
                className="w-full h-10 pl-10 pr-4 rounded-lg bg-slate-50 border border-slate-200 focus:border-black outline-none text-sm"
                placeholder="Search..."
                value={filters.order_no}
                onChange={(e) =>
                  setFilters({ ...filters, order_no: e.target.value })
                }
              />
            </div>
          </div>

          {/* 状态选择 + Reset */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-[10px] font-black text-slate-400 uppercase">
                Status
              </label>
              <button
                onClick={resetFilters}
                className={`flex items-center gap-1 text-[10px] font-black uppercase ${hasFilters ? "text-rose-500 hover:text-rose-700" : "text-slate-200"}`}
                disabled={!hasFilters}
              >
                <RotateCcw size={10} /> Reset
              </button>
            </div>
            <select
              className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 outline-none text-sm font-bold uppercase"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="FINISHED">Finished</option>
              <option value="DENIED">Denied</option>
            </select>
          </div>

          {/* 日期范围 (新增) */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
              Request Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="w-full h-10 px-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold"
                value={filters.start_date}
                onChange={(e) =>
                  setFilters({ ...filters, start_date: e.target.value })
                }
              />
              <input
                type="date"
                className="w-full h-10 px-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-bold"
                value={filters.end_date}
                onChange={(e) =>
                  setFilters({ ...filters, end_date: e.target.value })
                }
              />
            </div>
          </div>

          {/* 金额范围 */}
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">
              Price Range
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="MIN"
                className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                value={filters.min_price}
                onChange={(e) =>
                  setFilters({ ...filters, min_price: e.target.value })
                }
              />
              <input
                type="number"
                placeholder="MAX"
                className="w-full h-10 px-3 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold"
                value={filters.max_price}
                onChange={(e) =>
                  setFilters({ ...filters, max_price: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* 数据表格 (使用 filteredTickets) */}
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b">
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">
                Type
              </th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">
                Order No
              </th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">
                Total Price
              </th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">
                Date
              </th>
              <th className="p-4 text-[10px] font-black uppercase text-slate-400">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTickets.map((ticket) => (
              <tr
                key={ticket.id}
                className="hover:bg-slate-50 transition-colors cursor-pointer group"
                onClick={() => {
                  setSelectedTicket(ticket);
                  setActionStatus("");
                }}
              >
                <td className="p-4">
                  <span
                    className={`text-[10px] font-black px-2 py-1 rounded-md ${ticket.ticket_type === "REFUND" ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"}`}
                  >
                    {ticket.ticket_type}
                  </span>
                </td>
                <td className="p-4 font-bold text-sm underline decoration-slate-200 underline-offset-4 group-hover:decoration-slate-900 transition-all">
                  #{ticket.order_id}
                </td>
                <td className="p-4 text-sm font-black text-slate-900">
                  ${ticket.order_info?.total_price.toFixed(2)}
                </td>
                <td className="p-4 text-[10px] font-bold text-slate-400">
                  {new Date(ticket.created_at).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span
                    className={`w-2 h-2 rounded-full inline-block mr-2 ${ticket.status === "PENDING" ? "bg-orange-400" : ticket.status === "FINISHED" ? "bg-emerald-400" : "bg-rose-400"}`}
                  />
                  <span className="text-xs font-bold uppercase">
                    {ticket.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 详情弹窗 (保持原样不动) */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b flex justify-between items-center bg-slate-50">
              <div>
                <h2 className="text-xl font-black uppercase italic">
                  Order ID: {selectedTicket.order_id}
                </h2>
              </div>
              <button
                onClick={() => {
                  setSelectedTicket(null);
                  setActionStatus("");
                }}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
              >
                <X />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-8">
                <section>
                  <h3 className="flex items-center text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                    <User className="w-4 h-4 mr-2" /> Customer Info
                  </h3>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold">
                      User ID:{" "}
                      <span className="text-slate-600">
                        {selectedTicket.user_id}
                      </span>
                    </p>
                    <p className="text-sm mt-2">
                      Reason: {selectedTicket.reason}
                    </p>
                    <p className="text-sm font-bold mt-4 text-slate-400 uppercase">
                      Details:
                    </p>
                    <div className="text-sm bg-white p-3 rounded-xl border mt-1 min-h-[100px]">
                      {selectedTicket.details}
                    </div>
                  </div>
                </section>
                {/* 详情弹窗 (Modal) 内部修改 */}
                <section>
                  <h3 className="flex items-center text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                    Update Status
                  </h3>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400">
                        Select Action
                      </label>
                      <select
                        className="w-full h-12 px-4 rounded-xl border-2 border-white bg-white shadow-sm outline-none text-sm font-bold focus:border-black transition-all"
                        // 我们需要一个临时状态来控制提交按钮，请在组件顶部定义：
                        // const [actionStatus, setActionStatus] = useState("");
                        value={actionStatus}
                        onChange={(e) => setActionStatus(e.target.value)}
                      >
                        <option value="">--- (Select)</option>
                        <option value="FINISHED">FINISHED</option>
                        {/* 仅当类型为 REFUND 时显示 DENIED */}
                        {selectedTicket.ticket_type === "REFUND" && (
                          <option value="DENIED">DENIED</option>
                        )}
                      </select>
                    </div>

                    <button
                      onClick={() => {
                        handleUpdateStatus(selectedTicket.id, actionStatus);
                        setActionStatus(""); // 提交后重置选择
                      }}
                      disabled={!actionStatus} // 如果没选（空字符串），按钮非活性
                      className={`w-full py-4 rounded-xl font-black uppercase text-xs tracking-widest transition-all ${
                        actionStatus
                          ? "bg-black text-white hover:bg-slate-800 shadow-lg"
                          : "bg-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      Confirm and Update
                    </button>
                  </div>
                </section>
              </div>
              <div className="space-y-8">
                <section>
                  <h3 className="flex items-center text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                    <Package className="w-4 h-4 mr-2" /> Order Items
                  </h3>
                  <div className="space-y-3">
                    {selectedTicket.order_info?.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-white border-2 border-slate-50 rounded-xl hover:border-slate-100 transition-all"
                      >
                        <div className="text-sm font-bold">
                          {item.product_name}{" "}
                          <span className="text-slate-400 font-medium">
                            x{item.quantity}
                          </span>
                        </div>
                        <div className="text-sm font-black">
                          ${item.unit_price * item.quantity}
                        </div>
                      </div>
                    ))}
                    <div className="pt-4 border-t flex justify-between items-center">
                      <span className="text-sm font-black uppercase tracking-widest text-slate-400">
                        Total
                      </span>
                      <span className="text-2xl font-black italic">
                        ${selectedTicket.order_info?.total_price}
                      </span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
