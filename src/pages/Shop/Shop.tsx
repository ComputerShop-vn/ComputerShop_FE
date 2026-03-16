import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ui/ProductCard';
import { productService } from '../../api/services/productService';
import { categoryService } from '../../api/services/categoryService';
import { ProductResponse } from '../../api/types/product';
import { CategoryResponse } from '../../api/types/category';

const Shop: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category'); // categoryId as string
  const searchFilter = queryParams.get('search');

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [productsData, categoriesData] = await Promise.all([
          productService.getAllProducts(),
          categoryService.getAllCategories(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    let result = products;

    if (categoryFilter) {
      const catId = parseInt(categoryFilter);
      if (!isNaN(catId)) {
        result = result.filter(p => p.categoryId === catId);
      } else {
        // fallback: filter by name (từ header dropdown)
        result = result.filter(p =>
          p.categoryName?.toLowerCase().includes(categoryFilter.toLowerCase())
        );
      }
    }

    if (searchFilter) {
      result = result.filter(p =>
        p.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.brandName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.categoryName?.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    return result;
  }, [products, categoryFilter, searchFilter]);

  const handleCategoryChange = (categoryId: number | null) => {
    if (categoryId !== null) {
      navigate(`/shop?category=${categoryId}`);
    } else {
      navigate('/shop');
    }
  };

  const activeCategoryName = categoryFilter
    ? categories.find(c => c.categoryId === parseInt(categoryFilter))?.categoryName || categoryFilter
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-['Jost']">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-8">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 border-b border-gray-100 pb-2">Danh mục</h3>
              <div className="flex flex-wrap lg:flex-col gap-2">
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all text-left flex items-center justify-between group ${
                    !categoryFilter ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  Tất cả
                  <span className={`material-symbols-outlined text-sm ${!categoryFilter ? 'opacity-100' : 'opacity-0'}`}>chevron_right</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.categoryId}
                    onClick={() => handleCategoryChange(cat.categoryId)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all text-left flex items-center justify-between group ${
                      categoryFilter === String(cat.categoryId)
                        ? 'bg-black text-white shadow-lg shadow-black/10'
                        : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                    }`}
                  >
                    {cat.categoryName}
                    <span className={`material-symbols-outlined text-sm transition-transform group-hover:translate-x-1 ${
                      categoryFilter === String(cat.categoryId) ? 'opacity-100' : 'opacity-0'
                    }`}>chevron_right</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="hidden lg:block bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3">Hỗ trợ 24/7</h4>
              <p className="text-xs text-gray-400 leading-relaxed">Cần tư vấn cấu hình? Liên hệ ngay với đội ngũ chuyên gia của chúng tôi.</p>
              <button className="mt-4 w-full py-3 bg-white border border-gray-200 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition rounded-xl">Liên hệ ngay</button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="mb-12">
                <h1 className="text-4xl font-light uppercase tracking-tight text-black">
                  {activeCategoryName ? (
                    <>Danh mục: <span className="font-bold">{activeCategoryName}</span></>
                  ) : searchFilter ? (
                    <>Kết quả tìm kiếm cho: <span className="font-bold">"{searchFilter}"</span></>
                  ) : (
                    <>Tất cả <span className="font-bold">Sản phẩm</span></>
                  )}
                </h1>
                <p className="text-gray-400 mt-2 text-[10px] font-bold uppercase tracking-[0.2em]">
                  Hiển thị {filteredProducts.length} sản phẩm
                </p>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.productId} product={product} />
                  ))}
                </div>
              ) : (
                <div className="py-32 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">inventory_2</span>
                  <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Không tìm thấy sản phẩm nào</h2>
                  <p className="text-gray-400 mt-2">Vui lòng thử lại với bộ lọc khác</p>
                  <button 
                    onClick={() => navigate('/shop')}
                    className="mt-6 px-8 py-3 bg-black text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition"
                  >
                    Xem tất cả sản phẩm
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
