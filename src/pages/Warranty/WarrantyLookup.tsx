import React, { useState } from 'react';
import { warrantyService } from '../../api/services/warrantyService';
import { WarrantyResponse, WarrantyStatus } from '../../api/types/warranty';

const STATUS_LABEL: Record<WarrantyStatus, { label: string; color: string }> = {
  ACTIVE:  { label: 'Còn hiệu lực', color: 'text-green-600 bg-green-50' },
  EXPIRED: { label: 'Hết hạn',      color: 'text-gray-500 bg-gray-100' },
  VOIDED:  { label: 'Đã hủy',       color: 'text-red-500 bg-red-50' },
};

const WarrantyLookup: React.FC = () => {
  const [phone, setPhone] = useState('');
  const [warranties, setWarranties] = useState<WarrantyResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError('');
    setSearched(false);
    try {
      const data = await warrantyService.getByPhone(phone.trim());
      setWarranties(data);
      setSearched(true);
    } catch (err: any) {
      setError(err.message || 'Không thể tra cứu bảo hành');
      setWarranties([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-16 font-['Jost']">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-light uppercase tracking-tight">
          Tra cứu <span className="font-bold">Bảo hành</span>
        </h1>
        <p className="text-gray-400 mt-3 text-sm uppercase tracking-widest">Nhập số điện thoại để xem thông tin bảo hành</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-3 mb-10">
        <input
          type="tel"
          placeholder="Số điện thoại..."
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className="flex-1 px-5 py-4 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-black transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? 'Đang tìm...' : 'Tra cứu'}
        </button>
      </form>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm mb-6">{error}</div>
      )}

      {searched && warranties.length === 0 && !error && (
        <div className="text-center py-16 text-gray-400">
          <span className="material-symbols-outlined text-5xl mb-3">verified_user</span>
          <p className="text-sm">Không tìm thấy thông tin bảo hành cho số điện thoại này.</p>
        </div>
      )}

      <div className="space-y-4">
        {warranties.map(w => {
          const statusInfo = STATUS_LABEL[w.status];
          const daysLeft = Math.ceil((new Date(w.endDate).getTime() - Date.now()) / 86400000);
          return (
            <div key={w.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="font-bold text-gray-900">{w.productName}</h3>
                  {w.serialNumber && (
                    <p className="text-xs text-gray-400 mt-1">S/N: {w.serialNumber}</p>
                  )}
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Ngày bắt đầu</p>
                  <p className="font-medium">{new Date(w.startDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Ngày hết hạn</p>
                  <p className="font-medium">{new Date(w.endDate).toLocaleDateString('vi-VN')}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Loại bảo hành</p>
                  <p className="font-medium">{w.type === 'MANUFACTURER' ? 'Hãng' : 'Cửa hàng'}</p>
                </div>
                {w.status === 'ACTIVE' && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Còn lại</p>
                    <p className={`font-bold ${daysLeft <= 30 ? 'text-amber-500' : 'text-green-600'}`}>
                      {daysLeft > 0 ? `${daysLeft} ngày` : 'Hết hạn hôm nay'}
                    </p>
                  </div>
                )}
              </div>

              {w.description && (
                <p className="text-xs text-gray-500 border-t border-gray-50 pt-3">{w.description}</p>
              )}

              {w.claims && w.claims.length > 0 && (
                <div className="border-t border-gray-50 pt-4 mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">
                    Lịch sử yêu cầu ({w.claims.length})
                  </p>
                  <div className="space-y-2">
                    {w.claims.map(c => (
                      <div key={c.claimId} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                        <span className="text-gray-600">{new Date(c.claimDate).toLocaleDateString('vi-VN')}</span>
                        <span className="font-medium text-gray-700">{c.customerNote || '—'}</span>
                        <span className={`font-bold uppercase tracking-widest ${
                          c.status === 'COMPLETED' ? 'text-green-600' :
                          c.status === 'REJECTED' ? 'text-red-500' :
                          c.status === 'PROCESSING' ? 'text-blue-500' : 'text-amber-500'
                        }`}>{c.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WarrantyLookup;
