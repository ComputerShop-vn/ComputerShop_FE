import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pcBuildService } from '../api/services/pcBuildService';
import { productService } from '../api/services/productService';
import {
  PCBuildResponse,
  PCBuildItemResponse,
  ComponentType,
  COMPONENT_DISPLAY_NAMES,
  COMPONENT_ICONS,
  REQUIRED_COMPONENTS,
} from '../api/types/pcbuild';
import { ProductResponse } from '../api/types/product';
import { showToast, showConfirm } from '../components/ui/Toast';

const fmt = (v: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

// All component slots to show in order
const COMPONENT_SLOTS: ComponentType[] = [
  'CPU', 'MAINBOARD', 'RAM', 'GPU',
  'STORAGE_PRIMARY', 'STORAGE_SECONDARY',
  'PSU', 'CASE', 'COOLING',
  'MONITOR', 'KEYBOARD', 'MOUSE',
];

const BuildPC: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [build, setBuild] = useState<PCBuildResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState<ComponentType | null>(null);
  const [slotProducts, setSlotProducts] = useState<ProductResponse[]>([]);
  const [slotLoading, setSlotLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [buildName, setBuildName] = useState('');

  const fetchDraft = useCallback(async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    try {
      setLoading(true);
      const data = await pcBuildService.getDraft();
      setBuild(data);
    } catch {
      // No draft yet — that's fine, show empty state
      setBuild(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => { fetchDraft(); }, [fetchDraft]);

  // Get item for a slot
  const getItem = (slot: ComponentType): PCBuildItemResponse | undefined =>
    build?.items.find(i => i.componentType === slot);

  // Open slot picker: fetch compatible products
  const openSlot = async (slot: ComponentType) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setSelectingSlot(slot);
    setSlotLoading(true);
    setSlotProducts([]);
    try {
      // Try compatibility check first if we have items
      if (build && build.items.length > 0) {
        const currentItems = build.items.map(i => ({
          componentType: i.componentType,
          variantId: i.variantId,
        }));
        try {
          const compat = await pcBuildService.getCompatibleVariants({
            currentItems,
            targetComponentType: slot,
          });
          if (compat.categoryId) {
            const products = await productService.getAllProducts({ categoryId: compat.categoryId });
            setSlotProducts(products);
            return;
          }
        } catch {
          // Fall through to category name filter
        }
      }
      // Fallback: filter by category name
      const all = await productService.getAllProducts();
      const categoryName = getCategoryName(slot);
      const filtered = all.filter(p =>
        p.categoryName?.toLowerCase().includes(categoryName.toLowerCase())
      );
      setSlotProducts(filtered);
    } finally {
      setSlotLoading(false);
    }
  };

  const getCategoryName = (slot: ComponentType): string => {
    const map: Record<ComponentType, string> = {
      CPU: 'cpu', MAINBOARD: 'mainboard', RAM: 'ram', GPU: 'gpu',
      STORAGE_PRIMARY: 'ssd', STORAGE_SECONDARY: 'hdd',
      PSU: 'psu', CASE: 'case', COOLING: 'cooling',
      MONITOR: 'monitor', KEYBOARD: 'keyboard', MOUSE: 'mouse',
    };
    return map[slot] || slot.toLowerCase();
  };

  const handleSelectProduct = async (product: ProductResponse) => {
    if (!selectingSlot) return;
    const variant = product.variants?.[0];
    if (!variant) { showToast('Sản phẩm này chưa có variant.', 'warning'); return; }
    try {
      const updated = await pcBuildService.upsertItem({
        componentType: selectingSlot,
        variantId: variant.variantId,
        quantity: 1,
      });
      setBuild(updated);
      setSelectingSlot(null);
      showToast('Đã thêm linh kiện vào cấu hình.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Không thể thêm linh kiện', 'error');
    }
  };

  const handleRemoveItem = async (slot: ComponentType) => {
    // BE doesn't have a remove endpoint — upsert with qty 0 isn't supported
    // Workaround: re-fetch draft after removing (not ideal but safe)
    // Actually BE uses upsert (overwrite), so we can't "remove" via API directly.
    // We'll just clear locally and note to user they need to save a new build.
    // For now, alert user this limitation.
    showToast('Để xóa linh kiện, hãy chọn linh kiện khác để thay thế.', 'info');
  };

  const handleSaveBuild = async () => {
    if (!buildName.trim()) { showToast('Vui lòng nhập tên cấu hình', 'warning'); return; }
    setSavingName(true);
    try {
      const updated = await pcBuildService.saveBuild({ buildName: buildName.trim() });
      setBuild(updated);
      setShowSaveModal(false);
      setBuildName('');
      showToast('Đã lưu cấu hình thành công!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Không thể lưu cấu hình', 'error');
    } finally {
      setSavingName(false);
    }
  };

  const handleOrderBuild = () => {
    navigate('/checkout');
  };

  const missingRequired = REQUIRED_COMPONENTS.filter(c => !getItem(c));

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-['Jost']">
        <div className="text-center space-y-4">
          <span className="material-symbols-outlined text-6xl text-gray-200">build</span>
          <h2 className="text-2xl font-light uppercase tracking-widest">Đăng nhập để Build PC</h2>
          <p className="text-gray-400 text-sm">Cấu hình của bạn sẽ được lưu trên cloud</p>
          <Link to="/login" className="inline-block mt-4 px-8 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl">
            Đăng nhập
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-['Jost']">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-light uppercase tracking-tight text-black">
                Xây dựng <span className="font-bold">Cấu hình PC</span>
              </h1>
              <p className="text-gray-400 mt-2 text-sm uppercase tracking-widest">
                {build?.buildName ? `Cấu hình: ${build.buildName}` : 'Tự tay thiết kế dàn máy trong mơ của bạn'}
              </p>
            </div>
            <div className="bg-black text-white p-6 rounded-2xl shadow-xl min-w-[240px]">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mb-1">Tổng cộng dự tính</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black">{fmt(build?.totalPrice || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="max-w-5xl mx-auto px-4 mt-12">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {COMPONENT_SLOTS.map((slot, index) => {
              const item = getItem(slot);
              return (
                <div
                  key={slot}
                  className={`flex flex-col md:flex-row items-center gap-6 p-6 md:p-8 ${index !== COMPONENT_SLOTS.length - 1 ? 'border-b border-gray-50' : ''}`}
                >
                  {/* Slot label */}
                  <div className="w-full md:w-1/4 flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                      <span className="material-symbols-outlined">{COMPONENT_ICONS[slot]}</span>
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">
                        {COMPONENT_DISPLAY_NAMES[slot]}
                      </h3>
                      {REQUIRED_COMPONENTS.includes(slot) && (
                        <span className="text-[9px] text-red-400 font-bold uppercase tracking-widest">Bắt buộc</span>
                      )}
                    </div>
                  </div>

                  {/* Selected item */}
                  <div className="flex-1 w-full">
                    {item ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={item.thumbnailUrl || '/placeholder.png'}
                          alt={item.productName}
                          className="w-16 h-16 object-cover rounded-lg bg-gray-50"
                          onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-black truncate">{item.productName}</h4>
                          <p className="text-xs text-gray-400 mt-0.5">{item.variantName}</p>
                          <p className="text-xs font-bold text-gray-700 mt-1">{fmt(item.price)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(slot)}
                          className="p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 transition rounded-lg"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-300 italic">Chưa chọn linh kiện</p>
                    )}
                  </div>

                  {/* Action */}
                  <div className="w-full md:w-auto">
                    <button
                      onClick={() => openSlot(slot)}
                      className={`w-full md:w-auto px-6 py-3 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                        item
                          ? 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                          : 'bg-black text-white hover:bg-gray-800 shadow-lg shadow-black/10'
                      }`}
                    >
                      {item ? 'Thay đổi' : 'Chọn linh kiện'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Missing required warning */}
          {missingRequired.length > 0 && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 text-sm text-amber-700">
              Còn thiếu: {missingRequired.map(c => COMPONENT_DISPLAY_NAMES[c]).join(', ')}
            </div>
          )}

          {/* Actions */}
          <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black transition flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              Tiếp tục mua sắm
            </Link>
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={() => setShowSaveModal(true)}
                disabled={!build || build.items.length === 0}
                className="flex-1 md:flex-none px-8 py-4 border border-black text-black text-[11px] font-bold uppercase tracking-widest hover:bg-gray-50 transition rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Lưu cấu hình
              </button>
              <button
                onClick={handleOrderBuild}
                disabled={missingRequired.length > 0}
                className="flex-1 md:flex-none px-10 py-4 bg-black text-white text-[11px] font-bold uppercase tracking-widest hover:bg-gray-800 transition rounded-xl shadow-2xl shadow-black/20 disabled:opacity-40 disabled:cursor-not-allowed"
                title={missingRequired.length > 0 ? 'Cần chọn đủ linh kiện bắt buộc' : ''}
              >
                Đặt hàng ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product selection modal */}
      {selectingSlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectingSlot(null)} />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold uppercase tracking-tight">
                Chọn {COMPONENT_DISPLAY_NAMES[selectingSlot]}
              </h2>
              <button onClick={() => setSelectingSlot(null)} className="p-2 hover:bg-gray-100 rounded-full transition">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
              {slotLoading ? (
                <div className="flex justify-center py-16">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
                </div>
              ) : slotProducts.length > 0 ? (
                slotProducts.map(product => (
                  <div
                    key={product.productId}
                    className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl hover:border-black hover:shadow-md transition cursor-pointer group"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <img
                      src={product.thumbnailUrl || '/placeholder.png'}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded-xl bg-gray-50 group-hover:scale-105 transition duration-300"
                      onError={(e) => { e.currentTarget.src = '/placeholder.png'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-black truncate">{product.name}</h4>
                      <p className="text-xs text-gray-400 mt-1">{product.brandName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-black">
                        {fmt(product.discountedPrice ?? product.basePrice)}
                      </p>
                      {product.discountedPrice && (
                        <p className="text-xs text-red-400 line-through">{fmt(product.basePrice)}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <span className="material-symbols-outlined text-4xl text-gray-200 mb-4">inventory_2</span>
                  <p className="text-gray-400 text-sm">Không tìm thấy sản phẩm phù hợp</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Save build modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowSaveModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Lưu cấu hình</h2>
            <input
              type="text"
              placeholder="Tên cấu hình (VD: Gaming Build 2025)"
              value={buildName}
              onChange={e => setBuildName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black mb-4"
              onKeyDown={e => e.key === 'Enter' && handleSaveBuild()}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveBuild}
                disabled={savingName}
                className="flex-1 bg-black text-white py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition disabled:opacity-50"
              >
                {savingName ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-6 py-3 border border-gray-200 rounded-xl text-sm font-bold hover:bg-gray-50 transition"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuildPC;
