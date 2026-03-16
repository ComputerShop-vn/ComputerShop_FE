
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16 border-b border-gray-800 pb-16">
        <div className="col-span-2">
          <h2 className="text-2xl font-bold tracking-widest uppercase mb-6">VITINH<span className="text-gray-500">.COM</span></h2>
          <p className="text-gray-400 max-w-sm">Linh kiện máy tính cao cấp và các bộ máy tùy chỉnh dành cho người đam mê, game thủ và chuyên gia.</p>
        </div>
        <div>
          <h5 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-gray-500">Cửa Hàng</h5>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>Laptop</li>
            <li>PC Để Bàn</li>
            <li>Linh Kiện</li>
            <li>Phụ Kiện</li>
          </ul>
        </div>
        <div>
          <h5 className="text-[10px] font-bold uppercase tracking-widest mb-6 text-gray-500">Hỗ Trợ</h5>
          <ul className="space-y-3 text-sm text-gray-400">
            <li>Liên Hệ</li>
            <li>Câu Hỏi</li>
            <li>Bảo Hành</li>
            <li>Đổi Trả</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-[10px] text-gray-600 uppercase tracking-widest">
        <p>© 2024 VITINH.COM. BẢO LƯU MỌI QUYỀN.</p>
        <div className="flex space-x-6">
          <span>Facebook</span>
          <span>Instagram</span>
          <span>Tiktok</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
