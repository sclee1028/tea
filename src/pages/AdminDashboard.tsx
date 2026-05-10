import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/error';
import { format } from 'date-fns';
import { LogOut, RefreshCw, LayoutDashboard } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  sweetness: string;
  ice: string;
  size: string;
}

interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalPrice: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  createdAt: any;
}

export default function AdminDashboard() {
  const { logOut } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'orders'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      // Sort in memory mostly recent first
      data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setOrders(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const preparingOrders = orders.filter(o => o.status === 'preparing');
  const otherOrders = orders.filter(o => o.status === 'completed' || o.status === 'cancelled');

  return (
    <div className="min-h-screen bg-stone-100 p-4 sm:p-8 font-sans">
      <header className="mb-8 flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
        <div className="flex items-center gap-3">
          <div className="bg-green-900 text-white p-2 rounded-lg">
             <LayoutDashboard className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-stone-800">周港茶・後台管理</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/" className="text-green-700 hover:text-green-900 font-bold text-sm">返回前台</Link>
          <button onClick={logOut} className="flex items-center gap-1 text-stone-500 hover:text-red-500 font-medium bg-stone-50 px-3 py-2 rounded-lg transition-colors border border-stone-200">
            <LogOut className="w-4 h-4" /> 登出
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Pending */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-green-200 flex flex-col h-[calc(100vh-10rem)]">
          <h2 className="text-xl font-bold text-green-900 flex items-center justify-between mb-4 pb-2 border-b-2 border-green-100">
            <span>新訂單 (待確認)</span>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">{pendingOrders.length}</span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
             {pendingOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />)}
             {pendingOrders.length === 0 && <p className="text-stone-400 text-center mt-10">目前沒有新訂單</p>}
          </div>
        </section>

        {/* Preparing */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-blue-200 flex flex-col h-[calc(100vh-10rem)]">
          <h2 className="text-xl font-bold text-blue-900 flex items-center justify-between mb-4 pb-2 border-b-2 border-blue-100">
            <span>製作中</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">{preparingOrders.length}</span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
             {preparingOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} />)}
             {preparingOrders.length === 0 && <p className="text-stone-400 text-center mt-10">目前沒有製作中的訂單</p>}
          </div>
        </section>

        {/* Completed/Cancelled */}
        <section className="bg-stone-50 rounded-2xl p-6 border border-stone-200 flex flex-col h-[calc(100vh-10rem)]">
          <h2 className="text-xl font-bold text-stone-600 flex items-center justify-between mb-4 pb-2 border-b-2 border-stone-200">
            <span>已完成 / 取消</span>
            <span className="bg-stone-200 text-stone-600 text-xs px-2 py-1 rounded-full">{otherOrders.length}</span>
          </h2>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 opacity-80">
             {otherOrders.map(order => <OrderCard key={order.id} order={order} onUpdateStatus={updateStatus} readOnly />)}
             {otherOrders.length === 0 && <p className="text-stone-400 text-center mt-10">無紀錄</p>}
          </div>
        </section>

      </div>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, readOnly = false }: { order: Order, onUpdateStatus: (id: string, st: string) => void, readOnly?: boolean }) {
  
  const StatusControls = () => {
    if (readOnly) {
      return (
        <span className={`text-sm font-bold ${order.status === 'completed' ? 'text-green-600' : 'text-stone-400'}`}>
          {order.status === 'completed' ? '已完成' : '已取消'}
        </span>
      );
    }

    if (order.status === 'pending') {
      return (
        <div className="flex gap-2 w-full mt-4">
          <button onClick={() => onUpdateStatus(order.id, 'cancelled')} className="flex-1 py-2 text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-lg transition-colors">拒絕</button>
          <button onClick={() => onUpdateStatus(order.id, 'preparing')} className="flex-1 py-2 text-white font-bold bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-md">接單製作</button>
        </div>
      );
    }

    if (order.status === 'preparing') {
      return (
        <button onClick={() => onUpdateStatus(order.id, 'completed')} className="w-full mt-4 py-3 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-md flex items-center justify-center gap-2">
           <RefreshCw className="w-4 h-4" /> 標記為完成
        </button>
      );
    }
    return null;
  };

  return (
    <div className={`p-4 rounded-xl border bg-white ${order.status === 'pending' ? 'border-green-300 shadow-md' : order.status === 'preparing' ? 'border-blue-300 shadow-sm' : 'border-stone-200'}`}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-stone-800 text-lg">{order.customerName}</h3>
        <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded font-mono">#{order.id.slice(-4).toUpperCase()}</span>
      </div>
      <p className="text-sm text-stone-600 mb-4 bg-stone-50 py-1 px-2 rounded font-mono inline-block">📞 {order.customerPhone}</p>
      
      <div className="space-y-2 mb-4 border-l-2 border-stone-200 pl-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="text-sm">
            <div className="font-bold text-stone-700">{item.name} <span className="text-stone-500 font-normal">x{item.quantity}</span></div>
            <div className="text-xs text-stone-500">{item.size} / {item.sweetness} / {item.ice}</div>
            {item.notes && <div className="text-xs text-orange-600 bg-orange-50 inline-block px-1 mt-1 rounded">備註: {item.notes}</div>}
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center text-sm font-medium border-t border-stone-100 pt-3">
        <span className="text-stone-500">{order.createdAt ? format(order.createdAt.toDate(), 'HH:mm') : ''}</span>
        <span className="text-green-800 font-bold text-lg">${order.totalPrice}</span>
      </div>

      <StatusControls />
    </div>
  );
}
