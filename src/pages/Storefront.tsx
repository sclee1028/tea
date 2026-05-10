import { useState } from 'react';
import { MENU, menuCategories, MenuItem, SWEETNESS_OPTIONS, ICE_OPTIONS } from '../lib/menu';
import { useCart, CartItem } from '../lib/CartContext';
import { useAuth } from '../lib/AuthContext';
import { ShoppingCart, Plus, X, ArrowRight, Info } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/error';
import { useNavigate } from 'react-router-dom';

export default function Storefront() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero / Information */}
      <div className="mb-8 rounded-xl bg-stone-200 p-6 shadow-sm border border-stone-300">
        <h2 className="text-2xl font-bold text-green-900 mb-2">基隆廟口精品飲</h2>
        <p className="text-stone-700 flex items-center gap-2">
          <Info className="w-5 h-5 text-green-800" />
          一杯在地誠心純品飲。基隆廟口店 / 固定大杯(L) / <span className="text-blue-600">❆ 冷飲</span> <span className="text-red-600">♨ 熱飲</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_350px] gap-8 relative items-start">
        {/* Menu List */}
        <div className="space-y-12">
          {menuCategories.map(category => (
            <section key={category}>
              <h3 className="text-2xl font-bold text-green-900 border-b-2 border-green-800 pb-2 mb-6 inline-block">{category}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {MENU.filter(item => item.category === category).map(item => (
                  <div key={item.id} 
                    onClick={() => setSelectedItem(item)}
                    className="group bg-white p-4 rounded-xl shadow-sm border border-green-100 hover:shadow-md hover:border-green-400 cursor-pointer transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                        {item.name}
                        {item.temperature.includes('hot') && <span className="text-red-500 text-xs">♨</span>}
                        {item.temperature.includes('iced') && <span className="text-blue-500 text-xs">❆</span>}
                      </h4>
                      <span className="text-green-900 font-bold">${item.priceL}</span>
                    </div>
                    {item.notes && <p className="text-sm text-stone-500 mb-4">{item.notes}</p>}
                    <button className="mt-2 text-green-700 bg-green-50 group-hover:bg-green-100 w-full py-2 rounded-lg flex justify-center items-center gap-1 font-medium transition-colors">
                      <Plus className="w-4 h-4" /> 選擇客製化
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Desktop Cart Sidebar */}
        <div className="hidden md:block sticky top-24">
          <CartPanel onClose={() => {}} />
        </div>
      </div>

      {/* Item Modal */}
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {/* Mobile Cart Floating Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <CartFloatingButton onClick={() => setIsCartOpen(true)} />
      </div>

      {/* Mobile Cart Drawer */}
      {isCartOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}>
          <div className="w-[90%] max-w-[400px] h-full bg-stone-50 shadow-2xl relative" onClick={e => e.stopPropagation()}>
             <CartPanel onClose={() => setIsCartOpen(false)} isMobile />
          </div>
        </div>
      )}
    </div>
  );
}

function ItemModal({ item, onClose }: { item: MenuItem, onClose: () => void }) {
  const { addToCart } = useCart();
  const hasMultipleSizes = item.priceM !== undefined;
  
  const [size, setSize] = useState<'M'|'L'>('L');
  const [sweetness, setSweetness] = useState(SWEETNESS_OPTIONS[0]);
  const [ice, setIce] = useState(ICE_OPTIONS[0]);
  const [quantity, setQuantity] = useState(1);
  const [temperatureType, setTemperatureType] = useState(item.temperature === 'iced' ? 'iced' : 'iced'); // default to iced if both are available

  const price = size === 'M' && item.priceM ? item.priceM : item.priceL;

  const handleAdd = () => {
    addToCart({
      ...item,
      cartItemId: Math.random().toString(36).substring(7),
      quantity,
      selectedSize: size,
      selectedSweetness: item.fixedSweetness ? '固定甜度' : sweetness,
      selectedIce: temperatureType === 'hot' ? '熱飲' : ice,
      itemPrice: price,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-green-900 text-stone-50 p-4 flex justify-between items-center">
          <h3 className="font-bold text-xl">{item.name}</h3>
          <button onClick={onClose} className="p-1 hover:bg-green-800 rounded-full"><X className="w-6 h-6" /></button>
        </div>
        
        <div className="p-6 space-y-6">
          {item.notes && <p className="text-stone-600 bg-stone-50 p-3 rounded-lg text-sm">{item.notes}</p>}

          {/* Temperature Toggle strictly if hot/iced */}
          {item.temperature === 'hot/iced' && (
            <div className="space-y-2">
              <label className="font-bold text-stone-800">溫度</label>
              <div className="flex gap-2">
                <RadioBtn label="冷飲" selected={temperatureType === 'iced'} onClick={() => setTemperatureType('iced')} />
                <RadioBtn label="熱飲" selected={temperatureType === 'hot'} onClick={() => setTemperatureType('hot')} />
              </div>
            </div>
          )}

          {/* Size */}
          {hasMultipleSizes && (
            <div className="space-y-2">
              <label className="font-bold text-stone-800">容量</label>
              <div className="flex gap-2">
                <RadioBtn label="全杯(L)" selected={size === 'L'} onClick={() => setSize('L')} />
                {item.priceM && <RadioBtn label="中杯(M)" selected={size === 'M'} onClick={() => setSize('M')} />}
              </div>
            </div>
          )}

          {/* Sweetness */}
          <div className="space-y-2">
            <label className="font-bold text-stone-800">甜度 {item.fixedSweetness && <span className="text-green-600 text-sm font-normal">(固定甜度)</span>}</label>
            {!item.fixedSweetness ? (
              <div className="flex flex-wrap gap-2">
                {SWEETNESS_OPTIONS.map(opt => (
                  <RadioBtn key={opt} label={opt} selected={sweetness === opt} onClick={() => setSweetness(opt)} />
                ))}
              </div>
            ) : (
             <div className="text-stone-500 text-sm italic">此飲品甜度由完美比例調製，無法調整。</div>
            )}
            {item.hasBrownSugarOption && <div className="text-xs text-stone-500 mt-1">此飲品使用手熬黑糖</div>}
          </div>

          {/* Ice */}
          {temperatureType === 'iced' && (
            <div className="space-y-2">
              <label className="font-bold text-stone-800">冰量</label>
              <div className="flex flex-wrap gap-2">
                {ICE_OPTIONS.map(opt => (
                  <RadioBtn key={opt} label={opt} selected={ice === opt} onClick={() => setIce(opt)} />
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center justify-between pt-4 border-t border-stone-100">
            <div className="flex items-center gap-4 bg-stone-100 rounded-lg p-1">
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow-sm font-bold text-lg text-stone-600"
              >-</button>
              <span className="w-4 text-center font-bold text-stone-800">{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)}
                className="w-10 h-10 flex items-center justify-center bg-white rounded-md shadow-sm font-bold text-lg text-stone-600"
              >+</button>
            </div>
            <div className="text-2xl font-bold text-green-900">
              ${price * quantity}
            </div>
          </div>

          <button 
            onClick={handleAdd}
            className="w-full bg-green-900 hover:bg-green-800 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-green-900/20 transition-transform active:scale-95"
          >
            <ShoppingCart className="w-5 h-5" /> 加入購物車
          </button>
        </div>
      </div>
    </div>
  );
}

function RadioBtn({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg border font-medium transition-all ${
        selected ? 'border-green-600 bg-green-50 text-green-800 shadow-sm' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
      }`}
    >
      {label}
    </button>
  );
}

function CartFloatingButton({ onClick }: { onClick: () => void }) {
  const { totalItems } = useCart();
  if (totalItems === 0) return null;
  return (
    <button 
      onClick={onClick}
      className="bg-green-900 text-white p-4 rounded-full shadow-2xl flex items-center justify-center relative hover:scale-105 transition-transform"
    >
      <ShoppingCart className="w-6 h-6" />
      <span className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border-2 border-white">
        {totalItems}
      </span>
    </button>
  );
}

function CartPanel({ onClose, isMobile = false }: { onClose: () => void, isMobile?: boolean }) {
  const { items, removeFromCart, totalItems, totalPrice, clearCart } = useCart();
  const { user, signIn } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      alert("請先登入即可結帳");
      signIn();
      return;
    }
    if (items.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("請填寫取餐人姓名與電話");
      return;
    }

    setSubmitting(true);
    try {
      const orderId = doc(collection(db, 'orders')).id;
      const orderData = {
        userId: user.uid,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        totalPrice,
        status: 'pending',
        items: items.map(i => ({
           id: i.cartItemId,
           name: i.name,
           price: i.itemPrice,
           quantity: i.quantity,
           sweetness: i.selectedSweetness,
           ice: i.selectedIce,
           size: i.selectedSize,
           notes: i.notes || ''
        })),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'orders', orderId), orderData);
      clearCart();
      onClose();
      navigate('/orders');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'orders');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-xl flex flex-col h-[calc(100vh-8rem)] ${isMobile ? 'h-full rounded-none' : ''}`}>
      <div className="p-4 border-b border-stone-100 flex justify-between items-center bg-stone-50 rounded-t-2xl">
        <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-green-800" />
          我的餐點
        </h3>
        {isMobile && <button onClick={onClose}><X className="w-6 h-6 text-stone-500" /></button>}
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {items.length === 0 ? (
          <div className="text-center text-stone-400 py-12">
            <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>購物車是空的</p>
          </div>
        ) : (
          items.map(item => (
            <div key={item.cartItemId} className="flex gap-3 bg-stone-50 p-3 rounded-xl border border-stone-100">
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-stone-800">{item.name} <span className="font-normal text-sm text-stone-500">({item.selectedSize})</span></h4>
                  <button onClick={() => removeFromCart(item.cartItemId)} className="text-stone-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                </div>
                <div className="text-xs text-stone-500 mt-1 space-x-2">
                  <span>{item.selectedSweetness}</span>
                  <span>|</span>
                  <span>{item.selectedIce}</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                  <span className="text-green-800 font-bold">${item.itemPrice}</span>
                  <span className="text-sm font-medium bg-stone-200 px-2 py-1 rounded text-stone-700">x {item.quantity}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="p-4 border-t border-stone-100 bg-stone-50 mt-auto rounded-b-2xl">
          <div className="space-y-3 mb-4">
             <input 
               type="text" 
               placeholder="取餐人姓名" 
               value={customerName}
               onChange={e => setCustomerName(e.target.value)}
               className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
             />
             <input 
               type="tel" 
               placeholder="聯絡電話" 
               value={customerPhone}
               onChange={e => setCustomerPhone(e.target.value)}
               className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
             />
          </div>
          
          <div className="flex justify-between items-center mb-4 text-lg">
            <span className="font-bold text-stone-600">總計 ({totalItems} 杯)</span>
            <span className="font-bold text-2xl text-green-900">${totalPrice}</span>
          </div>

          <button 
             onClick={handleCheckout}
             disabled={submitting || !user}
             className="w-full bg-green-900 hover:bg-green-800 disabled:bg-stone-300 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            {submitting ? '送出中...' : user ? '確認結帳' : '請先登入結帳'}
            {!submitting && <ArrowRight className="w-5 h-5" />}
          </button>
        </div>
      )}
    </div>
  );
}
