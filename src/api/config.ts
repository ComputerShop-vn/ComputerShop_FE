// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
export const API_VERSION = '/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  // Attributes
  ATTRIBUTES: `${API_VERSION}/attributes`,
  ATTRIBUTE_BY_ID: (id: number) => `${API_VERSION}/attributes/${id}`,
  
  // Products (to be implemented)
  PRODUCTS: `${API_VERSION}/products`,
  PRODUCT_BY_ID: (id: number) => `${API_VERSION}/products/${id}`,
  PRODUCTS_SEARCH: `${API_VERSION}/products/search`,
  
  // Categories
  CATEGORIES: `${API_VERSION}/categories`,
  CATEGORY_BY_ID: (id: number) => `${API_VERSION}/categories/${id}`,
  
  // Brands (to be implemented)
  BRANDS: `${API_VERSION}/brands`,
  BRAND_BY_ID: (id: number) => `${API_VERSION}/brands/${id}`,
  
  // Orders
  ORDERS: `${API_VERSION}/orders`,
  ORDERS_ME: `${API_VERSION}/orders/me`,
  ORDER_BY_ID: (id: number) => `${API_VERSION}/orders/${id}`,
  ORDER_UPDATE_STATUS: (id: number) => `${API_VERSION}/orders/${id}/status`,
  ORDER_CANCEL: (id: number) => `${API_VERSION}/orders/${id}/cancel`,
  
  // Users
  USERS: `${API_VERSION}/users`,
  USER_BY_ID: (id: number) => `${API_VERSION}/users/${id}`,
  USER_ME: `${API_VERSION}/users/me`,
  
  // Roles
  ROLES: `${API_VERSION}/roles`,
  ROLE_BY_ID: (id: number) => `${API_VERSION}/roles/${id}`,
  
  // Blogs
  BLOGS: `${API_VERSION}/blogs`,
  BLOG_BY_ID: (id: number) => `${API_VERSION}/blogs/${id}`,
  BLOGS_BY_USER: (userId: number) => `${API_VERSION}/blogs/user/${userId}`,
  
  // Cart
  CART: `${API_VERSION}/cart`,
  CART_ITEMS: `${API_VERSION}/cart/items`,
  CART_ITEM_BY_ID: (cartItemId: number) => `${API_VERSION}/cart/items/${cartItemId}`,
  
  // Installment Packages
  INSTALLMENT_PACKAGES: `${API_VERSION}/installment-packages`,
  INSTALLMENT_PACKAGES_ACTIVE: `${API_VERSION}/installment-packages/active`,
  INSTALLMENT_PACKAGE_BY_ID: (id: number) => `${API_VERSION}/installment-packages/${id}`,
  
  // Promotions
  PROMOTIONS: `${API_VERSION}/promotions`,
  PROMOTION_BY_ID: (id: number) => `${API_VERSION}/promotions/${id}`,
  PROMOTION_BY_CODE: (code: string) => `${API_VERSION}/promotions/code/${code}`,
  PROMOTION_ADD_TO_PRODUCTS: `${API_VERSION}/promotions/add-to-products`,
  PROMOTION_ADD_TO_CATEGORY: `${API_VERSION}/promotions/add-to-category`,
  PROMOTION_ADD_TO_BRAND: `${API_VERSION}/promotions/add-to-brand`,
  
  // PC Builds
  PC_BUILDS: `${API_VERSION}/pc-builds`,
  PC_BUILDS_DRAFT: `${API_VERSION}/pc-builds/draft`,
  PC_BUILDS_DRAFT_ITEMS: `${API_VERSION}/pc-builds/draft/items`,
  PC_BUILDS_DRAFT_SAVE: `${API_VERSION}/pc-builds/draft/save`,
  PC_BUILDS_DRAFT_ORDER: `${API_VERSION}/pc-builds/draft/order`,
  PC_BUILDS_COMPATIBLE: `${API_VERSION}/pc-builds/compatible-variants`,

  // Warranties
  WARRANTY_BY_ID: (id: number) => `${API_VERSION}/warranties/${id}`,
  WARRANTIES_BY_ORDER: (orderId: number) => `${API_VERSION}/warranties/order/${orderId}`,
  WARRANTIES_BY_PHONE: (phone: string) => `${API_VERSION}/warranties/phone/${phone}`,
  WARRANTY_UPDATE_STATUS: (id: number) => `${API_VERSION}/warranties/${id}/status`,

  // Warranty Claims
  CLAIMS: `${API_VERSION}/claims`,
  CLAIM_BY_ID: (id: number) => `${API_VERSION}/claims/${id}`,
  CLAIMS_BY_WARRANTY: (warrantyId: number) => `${API_VERSION}/claims/warranty/${warrantyId}`,

  // Payment
  PAYMENT_CREATE: `/orders/payment/createPayment`,
  PAYMENT_CALLBACK: `/orders/payment/callback`,
  PAYMENT_IPN: `/orders/payment/vnp-ipn`,
  
  // Auth
  AUTH_LOGIN: `${API_VERSION}/auth/login`,
  AUTH_LOGOUT: `${API_VERSION}/auth/logout`,
  AUTH_INTROSPECT: `${API_VERSION}/auth/introspect`,
  AUTH_REFRESH: `${API_VERSION}/auth/refresh`,
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;
