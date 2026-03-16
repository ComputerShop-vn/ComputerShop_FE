import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 font-['Jost']">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-gray-300">shopping_basket</span>
        </div>
        <h2 className="text-2xl font-light uppercase tracking-tight text-black mb-2">Giỏ hàng trống</h2>
        <p className="text-gray-400 text-sm mb-8">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
        <Link 
          to="/shop" 
          className="bg-black text-white px-10 py-4 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition rounded-xl shadow-xl shadow-black/10"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 md:py-20 font-['Jost']">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items List */}
        <div className="flex-1">
          <div className="flex items-end justify-between mb-10">
            <h1 className="text-4xl font-light uppercase tracking-tight text-black">
              Giỏ <span className="font-bold">Hàng</span>
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">
              {totalItems} Sản phẩm
            </span>
          </div>

          <div className="space-y-6">
            {cart.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white border border-gray-100 rounded-3xl hover:shadow-xl hover:shadow-black/5 transition-all duration-500 group"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0 text-center sm:text-left">
                  <h3 className="text-sm font-bold text-black truncate mb-1">{item.name}</h3>
                  <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{item.category}</p>
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center bg-gray-50 rounded-xl p-1">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1, item.cartItemId)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition"
                  >
                    <span className="material-symbols-outlined text-sm">remove</span>
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-black">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1, item.cartItemId)}
                    className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-black transition"
                  >
                    <span className="material-symbols-outlined text-sm">add</span>
                  </button>
                </div>

                {/* Price */}
                <div className="text-center sm:text-right min-w-[100px]">
                  <p className="text-sm font-black text-black">${(item.price * item.quantity).toLocaleString()}</p>
                  <div className="flex flex-col items-end mt-1">
                    <p className="text-[10px] text-gray-400">${item.price.toLocaleString()} / cái</p>
                    {item.originalPrice && (
                      <p className="text-[10px] text-red-400 line-through">${item.originalPrice.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                {/* Remove Button */}
                <button 
                  onClick={() => removeFromCart(item.id, item.cartItemId)}
                  className="p-2 text-gray-300 hover:text-red-500 transition"
                >
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link to="/shop" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-black transition">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white border border-gray-100 rounded-3xl p-8 sticky top-32 shadow-2xl shadow-black/5">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-black mb-8 border-b border-gray-50 pb-4">Tóm tắt đơn hàng</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tạm tính</span>
                <span className="font-bold text-black">${totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Giao hàng</span>
                <span className="text-emerald-500 font-bold uppercase text-[10px] tracking-widest">Miễn phí</span>
              </div>
              <div className="pt-4 border-t border-gray-50 flex justify-between items-end">
                <span className="text-xs font-bold uppercase tracking-widest text-black">Tổng cộng</span>
                <div className="text-right">
                  <p className="text-2xl font-black text-black leading-none">${totalPrice.toLocaleString()}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Đã bao gồm VAT</p>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-black text-white py-5 text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition rounded-2xl shadow-xl shadow-black/10 mb-4"
            >
              Tiến hành thanh toán
            </button>
            
            <div className="flex items-center justify-center gap-4 opacity-30 grayscale">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
