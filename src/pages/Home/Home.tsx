import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ui/ProductCard';
import { productService } from '../../api/services/productService';
import { ProductResponse } from '../../api/types/product';

const Home: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productService.getProductsPaged({ page: 0, size: 8 })
      .then(data => setProducts(data.content))
      .catch(() => {
        productService.getAllProducts()
          .then(data => setProducts(data.slice(0, 8)))
          .catch(err => console.error('Error fetching products:', err));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#F8FAFC' }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #002B5B 0%, #003d7a 60%, #002B5B 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }} />

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-28 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 space-y-8 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest" style={{ borderColor: 'rgba(0,212,255,0.4)', color: '#00D4FF', background: 'rgba(0,212,255,0.08)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00D4FF' }} />
              Silicon Horizon — Thế hệ mới
            </div>
            <h1 className="text-5xl md:text-7xl font-black leading-none tracking-tight" style={{ color: '#F8FAFC' }}>
              HIỆU SUẤT<br />
              <span style={{ color: '#00D4FF' }}>ĐỈNH CAO.</span>
            </h1>
            <p className="text-base leading-relaxed max-w-sm" style={{ color: '#94a3b8' }}>
              Linh kiện máy tính cao cấp, cấu hình gaming và workstation chuyên nghiệp. Hiệu năng vượt trội, bảo hành chính hãng.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90 hover:-translate-y-0.5" style={{ background: '#00D4FF', color: '#002B5B' }}>
                <span className="material-symbols-outlined text-base">storefront</span>
                Mua Ngay
              </Link>
              <Link to="/build-pc" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:opacity-90" style={{ border: '1px solid rgba(0,212,255,0.4)', color: '#00D4FF', background: 'rgba(0,212,255,0.08)' }}>
                <span className="material-symbols-outlined text-base">build</span>
                Build PC
              </Link>
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center relative">
            <div className="absolute inset-0 rounded-3xl blur-2xl opacity-20" style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }} />
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOSPFHG6GSn8QGVfVQHtKhuTls0Cf_a0PPBVyGWBWXELHIIpHSg2_Ovkti0FpK-C31xs_0KvIJwYGGU5l4RsGRSudHKdY-dFQHUwEGJarOp1xyq7n2UVcZDWN0HK_ye53514XC0Cp1JMAgqUHXwstG0D_RQJ970YVjWaC6sQDbLmHV8GXyVWi9Hzb7Kkjv0MIsfRCIIgtDqqhEN8wQHtIC20NNPCUUHn-G33jkNqxMn2wW8-5UphkdtvWMVJEpeoRxNiasauT2a_Y"
              alt="High-end Setup"
              className="relative max-h-[480px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: 'local_shipping', title: 'Miễn phí giao hàng', desc: 'Đơn hàng trên 50tr' },
            { icon: 'verified_user', title: 'Bảo hành 3 năm', desc: 'Linh kiện chính hãng' },
            { icon: 'local_offer', title: 'Ưu đãi độc quyền', desc: 'Giảm giá hằng ngày' },
            { icon: 'lock', title: 'Thanh toán an toàn', desc: 'Giao dịch mã hóa' },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition group-hover:scale-110" style={{ background: 'rgba(0,43,91,0.08)', color: '#002B5B' }}>
                <span className="material-symbols-outlined text-xl">{item.icon}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: '#002B5B' }}>{item.title}</h4>
                <p className="text-xs mt-0.5" style={{ color: '#64748B' }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] mb-2" style={{ color: '#00D4FF', textShadow: 'none' }}>
              <span style={{ color: '#002B5B' }}>— Nổi bật</span>
            </p>
            <h2 className="text-3xl font-black uppercase tracking-tight" style={{ color: '#002B5B' }}>
              Sản phẩm <span style={{ color: '#00D4FF' }}>Bán chạy</span>
            </h2>
          </div>
          <Link to="/shop" className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest transition hover:opacity-70" style={{ color: '#002B5B' }}>
            Xem tất cả
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12" style={{ border: '3px solid #e2e8f0', borderTopColor: '#002B5B' }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="mx-4 mb-16 rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #002B5B 0%, #003d7a 50%, #002B5B 100%)' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(rgba(0,212,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.4) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: 'radial-gradient(circle, #00D4FF, transparent)' }} />
        <div className="relative max-w-7xl mx-auto px-8 py-16 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px" style={{ background: '#00D4FF' }} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]" style={{ color: '#00D4FF' }}>Phiên Bản Giới Hạn</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight" style={{ color: '#F8FAFC' }}>
              Gaming<br />
              <span style={{ color: '#00D4FF' }}>Titan Series</span>
            </h2>
            <p className="leading-relaxed" style={{ color: '#94a3b8' }}>
              Tản nhiệt nước, ép xung tối đa. Được thiết kế cho những tựa game nặng nhất và quy trình sáng tạo chuyên sâu.
            </p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition hover:opacity-90" style={{ background: '#00D4FF', color: '#002B5B' }}>
              Khám Phá Ngay
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>
          <div className="md:w-1/2 relative group">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMOHdFA3XTXAcM80rjSMRd5he5w7XyvbPyJqQcgjCxWpNcTuCAhi632wFZ1AEk-Yu2V1u98siSDnWI0gqe9mJuirSb-MT_Ja8yxpxXcVB3FzWuFs1fwZbh0mcbj4-aAOhLHHuSxNcRKQ7TNoNaU3wowCci0R1EwSQLdTqpObhGfpMxSTyglK1eU9cN0LTio5DzqivUWNndpJMfL26m_4JvOO2rS2QiWofdNwmPnqudFd39UwQuOqaTsGaBNtkgQKxIOd45ygiD3BE"
              alt="Titan PC"
              className="rounded-2xl shadow-2xl group-hover:scale-105 transition duration-700"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
