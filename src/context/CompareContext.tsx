import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProductResponse } from '../api/types/product';

interface CompareContextType {
  compareItems: ProductResponse[];
  addToCompare: (product: ProductResponse) => void;
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
  isInCompare: (productId: number) => boolean;
  isSearchModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;
}

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [compareItems, setCompareItems] = useState<ProductResponse[]>([]);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const addToCompare = (product: ProductResponse) => {
    if (compareItems.find((item) => item.productId === product.productId)) return;
    if (compareItems.length >= 3) {
      alert('Bạn chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc.');
      return;
    }
    // Chỉ cho phép cùng category nếu đã có sản phẩm
    if (compareItems.length > 0 && compareItems[0].categoryId !== product.categoryId) {
      alert(`Chỉ có thể so sánh các sản phẩm cùng danh mục "${compareItems[0].categoryName}".`);
      return;
    }
    setCompareItems((prev) => [...prev, product]);
  };

  const removeFromCompare = (productId: number) => {
    setCompareItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCompare = () => setCompareItems([]);

  const isInCompare = (productId: number) =>
    compareItems.some((item) => item.productId === productId);

  return (
    <CompareContext.Provider value={{
      compareItems,
      addToCompare,
      removeFromCompare,
      clearCompare,
      isInCompare,
      isSearchModalOpen,
      openSearchModal: () => setIsSearchModalOpen(true),
      closeSearchModal: () => setIsSearchModalOpen(false),
    }}>
      {children}
    </CompareContext.Provider>
  );
};

export const useCompare = () => {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used within a CompareProvider');
  return context;
};
