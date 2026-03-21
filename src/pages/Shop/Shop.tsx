import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../../components/ui/ProductCard';
import { productService } from '../../api/services/productService';
import { categoryService } from '../../api/services/categoryService';
import { ProductResponse } from '../../api/types/product';
import { CategoryTreeNode } from '../../api/types/category';
import { PagedResponse } from '../../api/types/common';
import Pagination from '../../components/ui/Pagination';

const PAGE_SIZE = 12;

const PRICE_RANGES = [
  { label: 'Dưới 5 triệu', min: 0, max: 5_000_000 },
  { label: '5 - 10 triệu', min: 5_000_000, max: 10_000_000 },
  { label: '10 - 20 triệu', min: 10_000_000, max: 20_000_000 },
  { label: '20 - 50 triệu', min: 20_000_000, max: 50_000_000 },
  { label: 'Trên 50 triệu', min: 50_000_000, max: Infinity },
];

const DISCOUNT_RANGES = [
  { label: 'Từ 5%', min: 5 },
  { label: 'Từ 10%', min: 10 },
  { label: 'Từ 20%', min: 20 },
  { label: 'Từ 30%', min: 30 },
  { label: 'Từ 50%', min: 50 },
];

const Shop: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const categoryFilter = queryParams.get('category');
  const searchFilter = queryParams.get('search');

  const [pagedData, setPagedData] = useState<PagedResponse<ProductResponse> | null>(null);
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<typeof PRICE_RANGES[0] | null>(null);
  const [filterDiscount, setFilterDiscount] = useState(false);
  const [sortOrder, setSortOrder] = useState<'none' | 'asc' | 'desc'>('none');
  const [openDropdown, setOpenDropdown] = useState<'price' | 'sort' | null>(null);

  useEffect(() => {
    setCurrentPage(0);
  }, [categoryFilter, searchFilter, selectedPriceRange, filterDiscount, sortOrder]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const categoryId = categoryFilter ? parseInt(categoryFilter) : undefined;

        let fetched: ProductResponse[] = [];
        let totalFromServer = 0;

        if (searchFilter) {
          // search: fetch all pages or use paged without client filter
          try {
            const data = await productService.searchProductsPaged(searchFilter, { page: 0, size: 200 });
            fetched = data.content;
            totalFromServer = data.totalElements;
          } catch {
            fetched = await productService.getAllProducts();
            totalFromServer = fetched.length;
          }
        } else {
          try {
            const data = await productService.getProductsPaged({
              page: 0,
              size: 200,
              categoryId: categoryId && !isNaN(categoryId) ? categoryId : undefined,
            });
            fetched = data.content;
            totalFromServer = data.totalElements;
          } catch {
            fetched = await productService.getAllProducts({
              categoryId: categoryId && !isNaN(categoryId) ? categoryId : undefined
            });
            totalFromServer = fetched.length;
          }
        }

        setAllProducts(fetched);

        if (categories.length === 0) {
          const cats = await categoryService.getCategoryTree();
          setCategories(cats);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentPage, categoryFilter, searchFilter]);

  // Apply client-side filters whenever allProducts or filters change
  useEffect(() => {
    let filtered = [...allProducts];

    if (selectedPriceRange) {
      filtered = filtered.filter(p => {
        const price = p.discountedPrice ?? p.basePrice;
        return price >= selectedPriceRange.min && price < selectedPriceRange.max;
      });
    }

    if (filterDiscount) {
      filtered = filtered.filter(p =>
        p.discountedPrice != null && p.discountedPrice < p.basePrice
      );
    }

    if (sortOrder === 'asc') {
      filtered.sort((a, b) => (a.discountedPrice ?? a.basePrice) - (b.discountedPrice ?? b.basePrice));
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => (b.discountedPrice ?? b.basePrice) - (a.discountedPrice ?? a.basePrice));
    }

    const start = currentPage * PAGE_SIZE;
    const pageSlice = filtered.slice(start, start + PAGE_SIZE);
    setProducts(pageSlice);
    setPagedData({
      content: pageSlice,
      totalElements: filtered.length,
      totalPages: Math.ceil(filtered.length / PAGE_SIZE),
      size: PAGE_SIZE,
      number: currentPage,
    });
  }, [allProducts, selectedPriceRange, filterDiscount, sortOrder, currentPage]);

  const handleCategoryChange = (categoryId: number | null) => {
    if (categoryId !== null) {
      navigate(`/shop?category=${categoryId}`);
    } else {
      navigate('/shop');
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // Flatten tree to find name by id
  const findCategoryName = (nodes: CategoryTreeNode[], id: number): string | null => {
    for (const n of nodes) {
      if (n.categoryId === id) return n.categoryName;
      if (n.children) {
        const found = findCategoryName(n.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const activeCategoryName = categoryFilter
    ? findCategoryName(categories, parseInt(categoryFilter)) || categoryFilter
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 font-['Jost']">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar — categories tree */}
        <aside className="w-full lg:w-64 flex-shrink-0">
          <div className="sticky top-32 space-y-8">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 border-b border-gray-100 pb-2">Danh mục</h3>
              <div className="flex flex-col gap-1">
                {/* All */}
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all text-left flex items-center justify-between ${
                    !categoryFilter ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  Tất cả
                  {!categoryFilter && <span className="material-symbols-outlined text-sm">chevron_right</span>}
                </button>

                {/* Tree nodes */}
                {categories.map((parent) => {
                  const hasChildren = parent.children && parent.children.length > 0;
                  const isExpanded = expandedIds.has(parent.categoryId);
                  const isActive = categoryFilter === String(parent.categoryId);

                  return (
                    <div key={parent.categoryId}>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCategoryChange(parent.categoryId)}
                          className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all text-left ${
                            isActive ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-600 hover:bg-gray-100 hover:text-black'
                          }`}
                        >
                          {parent.categoryName}
                        </button>
                        {hasChildren && (
                          <button
                            onClick={() => toggleExpand(parent.categoryId)}
                            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition"
                          >
                            <span className={`material-symbols-outlined text-sm transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                              expand_more
                            </span>
                          </button>
                        )}
                      </div>

                      {/* Children */}
                      {hasChildren && isExpanded && (
                        <div className="ml-4 mt-1 flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
                          {parent.children!.map((child) => {
                            const isChildActive = categoryFilter === String(child.categoryId);
                            return (
                              <button
                                key={child.categoryId}
                                onClick={() => handleCategoryChange(child.categoryId)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all text-left ${
                                  isChildActive ? 'bg-black text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                                }`}
                              >
                                {child.categoryName}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
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
          {/* Title */}
          <div className="mb-6">
            <h1 className="text-4xl font-light uppercase tracking-tight text-black">
              {activeCategoryName ? (
                <>Danh mục: <span className="font-bold">{activeCategoryName}</span></>
              ) : searchFilter ? (
                <>Kết quả: <span className="font-bold">"{searchFilter}"</span></>
              ) : (
                <>Tất cả <span className="font-bold">Sản phẩm</span></>
              )}
            </h1>
            <p className="text-gray-400 mt-1 text-[10px] font-bold uppercase tracking-[0.2em]">
              Hiển thị {pagedData?.totalElements ?? products.length} sản phẩm
            </p>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 mb-8 pb-6 border-b border-gray-100">
            {/* Price filter */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'price' ? null : 'price')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  selectedPriceRange ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-base">payments</span>
                {selectedPriceRange ? selectedPriceRange.label : 'Lọc theo giá'}
                {selectedPriceRange ? (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setSelectedPriceRange(null); setOpenDropdown(null); }}
                    className="ml-1 hover:opacity-70 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-sm">{openDropdown === 'price' ? 'expand_less' : 'expand_more'}</span>
                )}
              </button>
              {openDropdown === 'price' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30">
                  {PRICE_RANGES.map((range) => (
                    <button
                      key={range.label}
                      onClick={() => { setSelectedPriceRange(range); setOpenDropdown(null); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between ${
                        selectedPriceRange?.label === range.label ? 'text-black font-bold bg-gray-50' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      {range.label}
                      {selectedPriceRange?.label === range.label && <span className="material-symbols-outlined text-sm">check</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Discount toggle */}
            <button
              onClick={() => setFilterDiscount(!filterDiscount)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                filterDiscount ? 'bg-red-500 text-white border-red-500' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-base">local_offer</span>
              Đang giảm giá
              {filterDiscount && (
                <span
                  role="button"
                  onClick={(e) => { e.stopPropagation(); setFilterDiscount(false); }}
                  className="ml-1 hover:opacity-70 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-sm">close</span>
                </span>
              )}
            </button>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                  sortOrder !== 'none' ? 'bg-black text-white border-black' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {sortOrder === 'asc' ? 'arrow_upward' : sortOrder === 'desc' ? 'arrow_downward' : 'sort'}
                </span>
                {sortOrder === 'asc' ? 'Giá thấp → cao' : sortOrder === 'desc' ? 'Giá cao → thấp' : 'Sắp xếp'}
                {sortOrder !== 'none' ? (
                  <span
                    role="button"
                    onClick={(e) => { e.stopPropagation(); setSortOrder('none'); setOpenDropdown(null); }}
                    className="ml-1 hover:opacity-70 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-sm">{openDropdown === 'sort' ? 'expand_less' : 'expand_more'}</span>
                )}
              </button>
              {openDropdown === 'sort' && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-30">
                  {[
                    { value: 'asc' as const, label: 'Giá thấp → cao', icon: 'arrow_upward' },
                    { value: 'desc' as const, label: 'Giá cao → thấp', icon: 'arrow_downward' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setSortOrder(opt.value); setOpenDropdown(null); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center gap-2 ${
                        sortOrder === opt.value ? 'text-black font-bold bg-gray-50' : 'text-gray-600 hover:bg-gray-50 hover:text-black'
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">{opt.icon}</span>
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Clear all */}
            {(selectedPriceRange || filterDiscount || sortOrder !== 'none') && (
              <button
                onClick={() => { setSelectedPriceRange(null); setFilterDiscount(false); setSortOrder('none'); setOpenDropdown(null); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-gray-300 text-sm text-gray-400 hover:text-black hover:border-black transition"
              >
                <span className="material-symbols-outlined text-base">filter_alt_off</span>
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Close dropdown when clicking outside */}
          {openDropdown && (
            <div className="fixed inset-0 z-20" onClick={() => setOpenDropdown(null)} />
          )}

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
              {products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                    {products.map((product) => (
                      <ProductCard key={product.productId} product={product} />
                    ))}
                  </div>
                  {pagedData && pagedData.totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagedData.totalPages}
                      onPageChange={setCurrentPage}
                      className="mt-12"
                    />
                  )}
                </>
              ) : (
                <div className="py-32 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                  <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">inventory_2</span>
                  <h2 className="text-xl font-bold text-gray-400 uppercase tracking-widest">Không tìm thấy sản phẩm nào</h2>
                  <p className="text-gray-400 mt-2">Vui lòng thử lại với bộ lọc khác</p>
                  <button
                    onClick={() => { navigate('/shop'); setSelectedPriceRange(null); setFilterDiscount(false); setSortOrder('none'); }}
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
