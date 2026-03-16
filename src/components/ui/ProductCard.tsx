import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../../types/index';
import { ProductResponse } from '../../api/types/product';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCompare } from '../../context/CompareContext';

interface ProductCardProps {
  product: Product | ProductResponse;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToCompare, isInCompare, removeFromCompare } = useCompare();
  const navigate = useNavigate();

  // Normalize product data to handle both old and new types
  const isApiProduct = 'productId' in product;
  const productId = isApiProduct ? (product as ProductResponse).productId : (product as Product).id;
  const productName = isApiProduct 
    ? ((product as ProductResponse).name || (product as ProductResponse).productName || '')
    : (product as Product).name;
  const productImage = isApiProduct 
    ? ((product as ProductResponse).thumbnailUrl || (product as ProductResponse).imageUrls?.[0] || (product as ProductResponse).primaryImage || '/placeholder.png')
    : (product as Product).image;
  const productBrand = isApiProduct ? (product as ProductResponse).brandName || '' : (product as Product).brand;
  const productPrice = isApiProduct ? (product as ProductResponse).basePrice : (product as Product).price;
  const productTag = isApiProduct ? undefined : (product as Product).tag;
  const productOriginalPrice = isApiProduct
    ? ((product as ProductResponse).discountedPrice ? (product as ProductResponse).basePrice : undefined)
    : (product as Product).originalPrice;
  const productDisplayPrice = isApiProduct
    ? ((product as ProductResponse).discountedPrice ?? (product as ProductResponse).basePrice)
    : (product as Product).price;
  const hasDiscount = isApiProduct && !!(product as ProductResponse).discountedPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Vui lòng đăng nhập để thêm vào giỏ hàng.');
      navigate('/login');
      return;
    }
    
    addToCart(product as Product);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isInCompare(productId)) {
      removeFromCompare(productId);
    } else {
      if (isApiProduct) {
        addToCompare(product as ProductResponse);
      } else {
        // Convert old Product type to ProductResponse shape
        const p = product as Product;
        addToCompare({
          productId: Number(p.id),
          name: p.name,
          basePrice: p.price,
          discountedPrice: p.originalPrice ? p.price : undefined,
          thumbnailUrl: p.image,
          brandName: p.brand,
          categoryId: 0,
          categoryName: p.category,
          brandId: 0,
        } as ProductResponse);
      }
    }
  };

  const isCompared = isInCompare(productId);

  return (
    <div className="group flex flex-col bg-white border border-transparent hover:border-gray-100 transition duration-300 relative">
      <div 
        onClick={() => navigate(`/product/${productId}`)}
        className="relative aspect-square bg-gray-50 overflow-hidden p-8 flex items-center justify-center cursor-pointer"
      >
        {productTag && (
          <span className={`absolute top-4 left-4 z-10 text-[10px] font-bold px-2 py-1 uppercase tracking-widest shadow-sm ${
            productTag === 'Giảm giá' ? 'bg-red-600 text-white' : 'bg-black text-white'
          }`}>
            {productTag}
          </span>
        )}
        {hasDiscount && !productTag && (
          <span className="absolute top-4 left-4 z-10 text-[10px] font-bold px-2 py-1 uppercase tracking-widest shadow-sm bg-red-600 text-white">
            -{Math.round((1 - (product as ProductResponse).discountedPrice! / (product as ProductResponse).basePrice) * 100)}%
          </span>
        )}
        <button 
          onClick={handleCompare}
          className={`absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center transition shadow-sm ${
            isCompared ? 'bg-black text-white' : 'bg-white text-gray-400 hover:text-black'
          }`}
          title={isCompared ? "Xóa khỏi so sánh" : "Thêm vào so sánh"}
        >
          <span className="material-symbols-outlined text-sm">compare_arrows</span>
        </button>
        <img 
          src={productImage} 
          alt={productName} 
          className="object-contain w-full h-full group-hover:scale-110 transition-transform duration-700 mix-blend-multiply"
          referrerPolicy="no-referrer"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x400?text=No+Image';
          }}
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center gap-2">
          <button 
            onClick={handleAddToCart}
            className="bg-white text-black px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-black hover:text-white transition shadow-xl"
          >
            Thêm vào giỏ
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/product/${productId}`);
            }}
            className="bg-black text-white px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-800 transition shadow-xl"
          >
            Chi tiết
          </button>
        </div>
      </div>
      <div className="p-4 text-center">
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em] mb-1">{productBrand}</p>
        <Link to={`/product/${productId}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition truncate">{productName}</h3>
        </Link>
        <div className="mt-2 flex justify-center items-center space-x-3">
          {hasDiscount ? (
            <>
              <span className="text-sm font-bold text-black">${productDisplayPrice.toLocaleString()}</span>
              <span className="text-xs text-red-500 line-through">${productPrice.toLocaleString()}</span>
            </>
          ) : (
            <>
              <span className="text-sm font-bold">${(isApiProduct ? productDisplayPrice : productPrice).toLocaleString()}</span>
              {productOriginalPrice && (
                <span className="text-xs text-red-500 line-through">${productOriginalPrice.toLocaleString()}</span>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
