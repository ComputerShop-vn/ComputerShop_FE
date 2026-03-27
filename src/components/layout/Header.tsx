
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PRODUCTS } from '../../constants/index';
import { Product } from '../../types/index';
import { useAuth } from '../../context/AuthContext';
import { categoryService } from '../../api/services/categoryService';
import { CategoryTreeNode } from '../../api/types/category';

interface HeaderProps {
  cartCount: number;
}

const Header: React.FC<HeaderProps> = ({ cartCount }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = PRODUCTS.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (productId: string) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
      setShowSuggestions(false);
    }
  };

  const [showCategories, setShowCategories] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Load category tree once
  useEffect(() => {
    categoryService.getCategoryTree().then(tree => {
      setCategoryTree(tree);
    }).catch(() => {});
  }, []);

  // Set first category active when menu opens
  useEffect(() => {
    if (showCategories && categoryTree.length > 0 && activeCategoryId === null) {
      setActiveCategoryId(categoryTree[0].categoryId);
    }
  }, [showCategories, categoryTree]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategories(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/shop?category=${categoryId}`);
    setShowCategories(false);
    setActiveCategoryId(null);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const activeCategoryData = categoryTree.find(c => c.categoryId === activeCategoryId);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 font-['Jost']">
      <div className="max-w-7xl mx-auto px-4 h-16 md:h-20 flex items-center gap-3 md:gap-6">
        
        {/* Logo */}
        <Link to="/" className="flex-shrink-0 flex items-center">
          <span className="text-xl md:text-2xl font-black tracking-tighter uppercase text-black">
            VITINH<span className="text-gray-400">.COM</span>
          </span>
        </Link>

        {/* Categories Button */}
        <div className="relative" ref={categoryRef}>
          <button 
            onClick={() => { setShowCategories(!showCategories); if (showCategories) setActiveCategoryId(null); }}
            className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg transition whitespace-nowrap border ${showCategories ? 'bg-black text-white border-black' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}
          >
            <span className="material-symbols-outlined text-xl">{showCategories ? 'close' : 'grid_view'}</span>
            <span className="text-xs font-bold uppercase tracking-wider">Danh mục</span>
            <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${showCategories ? 'rotate-180' : ''}`}>expand_more</span>
          </button>

          {/* Categories Dropdown */}
          {showCategories && (
            <div className="absolute top-full left-0 mt-2 w-[650px] bg-white border border-gray-100 rounded-2xl shadow-2xl overflow-hidden z-[70] flex animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Left Sidebar */}
              <div className="w-[240px] bg-gray-50 border-r border-gray-100 p-2">
                {categoryTree.map((cat) => (
                  <button
                    key={cat.categoryId}
                    onMouseEnter={() => setActiveCategoryId(cat.categoryId)}
                    onClick={() => handleCategoryClick(cat.categoryId)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition group text-left ${activeCategoryId === cat.categoryId ? 'bg-white shadow-sm ring-1 ring-black/5' : 'hover:bg-white/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined transition ${activeCategoryId === cat.categoryId ? 'text-black' : 'text-gray-400 group-hover:text-black'}`}>category</span>
                      <span className={`text-sm font-medium transition ${activeCategoryId === cat.categoryId ? 'text-black' : 'text-gray-600 group-hover:text-black'}`}>{cat.categoryName}</span>
                    </div>
                    {cat.children && cat.children.length > 0 && (
                      <span className={`material-symbols-outlined text-sm transition ${activeCategoryId === cat.categoryId ? 'text-black translate-x-0.5' : 'text-gray-300 group-hover:text-black'}`}>chevron_right</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Right Content (Children) */}
              <div className="flex-1 p-8 bg-white">
                {activeCategoryData && (
                  <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                      <span className="material-symbols-outlined text-black bg-gray-100 p-2 rounded-lg">category</span>
                      <h3 className="text-lg font-bold text-black uppercase tracking-tight">{activeCategoryData.categoryName}</h3>
                    </div>

                    {activeCategoryData.children && activeCategoryData.children.length > 0 ? (
                      <div className="grid grid-cols-1 gap-y-4">
                        {activeCategoryData.children.map((child) => (
                          <button
                            key={child.categoryId}
                            onClick={() => handleCategoryClick(child.categoryId)}
                            className="text-sm text-gray-500 hover:text-black hover:translate-x-2 transition-all flex items-center gap-3 group text-left"
                          >
                            <span className="w-1.5 h-1.5 bg-gray-200 rounded-full group-hover:bg-black transition-colors"></span>
                            <span className="font-medium">{child.categoryName}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">Không có danh mục con</p>
                    )}

                    <div className="mt-10 pt-6 border-t border-gray-50">
                      <button
                        onClick={() => handleCategoryClick(activeCategoryData.categoryId)}
                        className="text-[11px] font-bold uppercase tracking-widest text-black hover:underline underline-offset-8 transition-all flex items-center gap-2"
                      >
                        Xem tất cả {activeCategoryData.categoryName}
                        <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Location Selector */}
        <button className="hidden xl:flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-2 rounded-lg hover:bg-gray-100 transition whitespace-nowrap">
          <span className="material-symbols-outlined text-xl">location_on</span>
          <div className="text-left leading-tight">
            <span className="text-[11px] font-bold text-black uppercase block">Hồ Chí Minh</span>
          </div>
          <span className="material-symbols-outlined text-sm">expand_more</span>
        </button>

        {/* Build PC Link */}
        <Link to="/build-pc" className="hidden lg:flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 hover:text-black transition">
          <span className="material-symbols-outlined text-xl">build</span>
          Build PC
        </Link>



        {/* Search Bar */}
        <div className="flex-1 relative min-w-[150px]" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              placeholder="Bạn muốn mua gì hôm nay?" 
              className="w-full bg-gray-50 border-none px-4 py-2.5 pl-10 rounded-lg text-sm focus:ring-1 focus:ring-black outline-none placeholder:text-gray-400 transition"
            />
            <button type="submit" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition">
              <span className="material-symbols-outlined text-xl">search</span>
            </button>
          </form>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-[60]">
              <div className="p-2 border-b border-gray-50 bg-gray-50/50">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2">Gợi ý sản phẩm</span>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.id)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition text-left group"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate group-hover:text-black transition">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-black">{product.price.toLocaleString('vi-VN')}₫</span>
                        <span className="text-[10px] text-gray-400 uppercase tracking-tighter">{product.category}</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-gray-300 group-hover:text-black transition text-sm">arrow_forward</span>
                  </button>
                ))}
              </div>
              <button 
                onClick={handleSearchSubmit}
                className="w-full p-3 text-center text-xs font-bold uppercase tracking-widest text-gray-500 hover:bg-gray-50 hover:text-black transition border-t border-gray-50"
              >
                Xem tất cả kết quả cho "{searchQuery}"
              </button>
            </div>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-2 md:gap-5">
          {/* Cart */}
          <Link to="/cart" className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition group relative">
            <div className="relative">
              <span className="material-symbols-outlined text-2xl text-gray-700">shopping_cart</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-black text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="hidden md:block text-[11px] font-bold uppercase tracking-wider text-gray-700">Giỏ hàng</span>
          </Link>

          {/* Account */}
          <div className="relative" ref={userMenuRef}>
            {isAuthenticated ? (
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-gray-50 md:bg-transparent hover:bg-gray-50 p-2 md:px-3 rounded-lg transition"
              >
                <span className="material-symbols-outlined text-2xl text-gray-700">account_circle</span>
                <div className="hidden md:block text-left">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-gray-700 block leading-none">
                    {user?.name}
                  </span>
                  <span className="text-[9px] text-gray-400 uppercase font-bold">
                    {user?.role === 'admin' ? 'Quản trị viên' : user?.role === 'staff' ? 'Nhân viên' : 'Thành viên'}
                  </span>
                </div>
              </button>
            ) : (
              <Link to="/login" className="flex items-center gap-2 bg-gray-50 md:bg-transparent hover:bg-gray-50 p-2 md:px-3 rounded-lg transition">
                <span className="material-symbols-outlined text-2xl text-gray-700">account_circle</span>
                <span className="hidden md:block text-[11px] font-bold uppercase tracking-wider text-gray-700 leading-tight">
                  Đăng nhập
                </span>
              </Link>
            )}

            {/* User Dropdown */}
            {showUserMenu && isAuthenticated && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-[80] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-xs font-bold text-black truncate">{user?.email}</p>
                </div>
                <div className="p-1">
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 w-full p-3 text-left text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-black transition rounded-lg"
                    >
                      <span className="material-symbols-outlined text-lg">dashboard</span>
                      Quản lý
                    </Link>
                  )}
                  {user?.role === 'staff' && (
                    <Link 
                      to="/staff" 
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-3 w-full p-3 text-left text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-black transition rounded-lg"
                    >
                      <span className="material-symbols-outlined text-lg">dashboard</span>
                      Quản lý
                    </Link>
                  )}
                  <Link 
                    to="/orders" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 w-full p-3 text-left text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-black transition rounded-lg"
                  >
                    <span className="material-symbols-outlined text-lg">receipt_long</span>
                    Đơn hàng
                  </Link>
                  <Link 
                    to="/warranty" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 w-full p-3 text-left text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-black transition rounded-lg"
                  >
                    <span className="material-symbols-outlined text-lg">verified_user</span>
                    Bảo hành
                  </Link>
                  <Link 
                    to="/profile" 
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-3 w-full p-3 text-left text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-black transition rounded-lg"
                  >
                    <span className="material-symbols-outlined text-lg">manage_accounts</span>
                    Hồ sơ
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full p-3 text-left text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 transition rounded-lg"
                  >
                    <span className="material-symbols-outlined text-lg">logout</span>
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
