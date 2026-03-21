import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-[60vh] flex flex-col items-center justify-center px-4 font-['Jost']">
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: '#1a1d27' }}>
          <span className="material-symbols-outlined text-4xl" style={{ color: '#2d3748' }}>shopping_basket</span>
        </div>
        <h2 className="text-2xl font-light uppercase tracking-tight mb-2" style={{ color: '#e2e8f0' }}>Giỏ hàng trống</h2>
        <p className="text-sm mb-8" style={{ color: '#64748b' }}>Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Link to="/shop" className="px-10 py-4 text-[11px] font-bold uppercase tracking-widest rounded-xl transition text-white" style={{ background: '#3b82f6' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-['Jost']">
      <div className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Cart Items */}
          <div className="flex-1">
            <div className="flex items-end justify-between mb-10">
              <h1 className="text-4xl font-light uppercase tracking-tight" style={{ color: '#e2e8f0' }}>
                Giỏ <span className="font-bold">Hàng</span>
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#64748b' }}>{totalItems} Sản phẩm</span>
            </div>

            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-2xl border border-gray-100 bg-white transition-all duration-300 group hover:border-gray-300 hover:shadow-sm">
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" referrerPolicy="no-referrer" />
                  </div>

                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h3 className="text-sm font-bold truncate mb-1 text-gray-900">{item.name}</h3>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-gray-400">{item.category}</p>
                  </div>

                  {/* Qty */}
                  <div className="flex items-center rounded-xl p-1 bg-gray-100">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1, item.cartItemId)}
                      className="w-8 h-8 flex items-center justify-center transition text-gray-400 hover:text-gray-900"
                    >
                      <span className="material-symbols-outlined text-sm">remove</span>
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-gray-900">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1, item.cartItemId)}
                      className="w-8 h-8 flex items-center justify-center transition text-gray-400 hover:text-gray-900"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                  </div>

                  {/* Price */}
                  <div className="text-center sm:text-right min-w-[100px]">
                    <p className="text-sm font-black text-gray-900">{fmt(item.price * item.quantity)}</p>
                    <p className="text-[10px] mt-1 text-gray-400">{fmt(item.price)} / cái</p>
                    {item.originalPrice && <p className="text-[10px] line-through text-red-400">{fmt(item.originalPrice)}</p>}
                  </div>

                  <button onClick={() => removeFromCart(item.id, item.cartItemId)} className="p-2 transition text-gray-300 hover:text-red-500">
                    <span className="material-symbols-outlined text-xl">close</span>
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition" style={{ color: '#64748b' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#3b82f6'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#64748b'}
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          {/* Summary */}
          <div className="w-full lg:w-96">
            <div className="rounded-2xl border border-gray-100 p-8 sticky top-32 bg-white">
              <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-100 text-gray-900">Tóm tắt đơn hàng</h3>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Tạm tính</span>
                  <span className="font-bold text-gray-900">{fmt(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Giao hàng</span>
                  <span className="font-bold uppercase text-[10px] tracking-widest text-emerald-500">Miễn phí</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-900">Tổng cộng</span>
                  <div className="text-right">
                    <p className="text-2xl font-black leading-none text-black">{fmt(totalPrice)}</p>
                    <p className="text-[10px] mt-1 uppercase font-bold text-gray-400">Đã bao gồm VAT</p>
                  </div>
                </div>
              </div>

              <button onClick={() => navigate('/checkout')}
                className="w-full py-4 text-[11px] font-bold uppercase tracking-widest rounded-xl transition text-white mb-4"
                style={{ background: '#3b82f6' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
              >
                Tiến hành thanh toán
              </button>

              <div className="flex items-center justify-center gap-4 opacity-20 grayscale">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
