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
        // fallback to non-paged
        productService.getAllProducts()
          .then(data => setProducts(data.slice(0, 8)))
          .catch(err => console.error('Error fetching products:', err));
      })
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="bg-[#f3f4f6] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-24 flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 space-y-6 z-10">
            <h1 className="text-4xl md:text-6xl font-light leading-tight text-gray-900 uppercase">
              Hiệu suất <br />
              <span className="font-bold">Đỉnh cao.</span>
            </h1>
            <p className="text-gray-500 max-w-sm">
              Trải nghiệm chơi game và làm việc thế hệ tiếp theo với các máy trạm tùy chỉnh và laptop cao cấp của chúng tôi.
            </p>
            <Link to="/shop" className="inline-block bg-black text-white px-10 py-4 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition">
              Mua Ngay
            </Link>
          </div>
          <div className="w-full md:w-1/2 relative flex justify-center">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAOSPFHG6GSn8QGVfVQHtKhuTls0Cf_a0PPBVyGWBWXELHIIpHSg2_Ovkti0FpK-C31xs_0KvIJwYGGU5l4RsGRSudHKdY-dFQHUwEGJarOp1xyq7n2UVcZDWN0HK_ye53514XC0Cp1JMAgqUHXwstG0D_RQJ970YVjWaC6sQDbLmHV8GXyVWi9Hzb7Kkjv0MIsfRCIIgtDqqhEN8wQHtIC20NNPCUUHn-G33jkNqxMn2wW8-5UphkdtvWMVJEpeoRxNiasauT2a_Y" 
              alt="High-end Setup" 
              className="max-h-[500px] object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { icon: 'local_shipping', title: 'Miễn phí giao hàng', desc: 'Đơn hàng trên 50tr' },
          { icon: 'verified_user', title: 'Bảo hành 3 năm', desc: 'Linh kiện chính hãng' },
          { icon: 'local_offer', title: 'Ưu đãi số độc', desc: 'Giảm giá hằng ngày' },
          { icon: 'verified', title: 'Thanh toán an toàn', desc: 'Giao dịch mã hóa' },
        ].map((item, idx) => (
          <div key={idx} className="flex space-x-4 items-start group cursor-pointer">
            <span className="material-symbols-outlined text-4xl text-gray-800 group-hover:-translate-y-1 transition">{item.icon}</span>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-widest">{item.title}</h4>
              <p className="text-gray-500 text-sm">{item.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-end mb-10">
          <h2 className="text-3xl font-light uppercase tracking-wide">Sản phẩm <span className="font-bold">Bán chạy</span></h2>
          <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-black underline underline-offset-4">Đến Cửa Hàng</Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map(product => (
              <ProductCard key={product.productId} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Banner */}
      <section className="bg-gray-100 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 space-y-6">
            <div className="flex items-center space-x-4">
              <span className="w-12 h-px bg-black"></span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Phiên Bản Giới Hạn</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-light uppercase leading-tight">
              Dàn máy Gaming <br />
              <span className="font-bold">Đẳng cấp Titan</span>
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Được thiết kế cho những tựa game nặng nhất và quy trình sáng tạo chuyên sâu. Tản nhiệt nước, ép xung và sẵn sàng thống trị.
            </p>
            <Link to="/shop" className="inline-block bg-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition">
              Khám Phá Dòng Máy
            </Link>
          </div>
          <div className="md:w-1/2 relative group">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBMOHdFA3XTXAcM80rjSMRd5he5w7XyvbPyJqQcgjCxWpNcTuCAhi632wFZ1AEk-Yu2V1u98siSDnWI0gqe9mJuirSb-MT_Ja8yxpxXcVB3FzWuFs1fwZbh0mcbj4-aAOhLHHuSxNcRKQ7TNoNaU3wowCci0R1EwSQLdTqpObhGfpMxSTyglK1eU9cN0LTio5DzqivUWNndpJMfL26m_4JvOO2rS2QiWofdNwmPnqudFd39UwQuOqaTsGaBNtkgQKxIOd45ygiD3BE" 
              alt="Titan PC" 
              className="rounded shadow-2xl group-hover:scale-105 transition duration-700"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
