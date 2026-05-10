import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { handleFirestoreError, OperationType } from '../lib/error';
import { format } from 'date-fns';
import { Coffee, XCircle, CheckCircle2 } from 'lucide-react';
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

export default function CustomerOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', user.uid)
      // orderBy requires a composite index if used with where on a different field, so we sort in memory for now
      // or we can sort by createdAt descending if we deploy an index
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      // Sort in memory to avoid needing composite index just yet
      data.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setOrders(data);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, [user]);

  const cancelOrder = async (orderId: string) => {
    if (!confirm('確定要取消這筆訂單嗎？')) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'cancelled',
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-stone-800 mb-4">請先登入</h2>
        <p className="text-stone-500">您需要登入才能查看歷史訂單</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-12"><Coffee className="w-8 h-8 animate-pulse mx-auto text-green-700" /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 border-b border-stone-200 pb-4">
         <h1 className="text-2xl font-bold text-green-900">我的訂單紀錄</h1>
         <Link to="/" className="text-green-700 hover:text-green-900 font-medium text-sm">返回點單</Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl shadow-sm border border-stone-100">
          <p className="text-stone-500 mb-4">您目前還沒有任何訂單</p>
          <Link to="/" className="bg-green-900 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-800 inline-block">去逛逛菜單</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs text-stone-400 font-mono">#{order.id.slice(-6).toUpperCase()}</span>
                  <div className="text-stone-500 text-sm mt-1">
                    {order.createdAt ? format(order.createdAt.toDate(), 'yyyy-MM-dd HH:mm') : '處理中...'}
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>

              <div className="space-y-3 mb-6 bg-stone-50 p-4 rounded-xl border border-stone-100">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="font-bold text-stone-800">{item.name}</span>
                      <span className="text-stone-500 ml-2">({item.size}) {item.sweetness} / {item.ice}</span>
                    </div>
                    <div className="font-medium text-stone-700">
                      {item.quantity} x ${item.price}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center border-t border-stone-100 pt-4">
                <div className="font-bold text-lg text-green-900">總計：${order.totalPrice}</div>
                {order.status === 'pending' && (
                  <button 
                    onClick={() => cancelOrder(order.id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-bold px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> 取消訂單
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'pending': return <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">待確認</span>;
    case 'preparing': return <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold border border-blue-200">製作中</span>;
    case 'completed': return <span className="flex items-center gap-1 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200"><CheckCircle2 className="w-3 h-3" />已完成</span>;
    case 'cancelled': return <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-full text-xs font-bold border border-stone-200">已取消</span>;
    default: return null;
  }
}
