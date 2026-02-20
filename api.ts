
/**
 * Flex WMS - Netsis API Gateway
 * Backend: .NET Core Web API (StocksController)
 */

const API_BASE_URL = '/api';

// --- MOCK DATA FALLBACK ---
const MOCK_STOCKS = [
  { id: '1', code: 'AL-2020', name: 'Alüminyum Profil 20x20', unit1: 'ADET', quantity: 1500, minStockLevel: 500, lastPurchasePrice: 120.50, isLocked: false, groupCode: 'HAMMADDE' },
  { id: '2', code: 'SMN-M8', name: 'Çelik Somun M8', unit1: 'ADET', quantity: 15500, minStockLevel: 1000, lastPurchasePrice: 1.25, isLocked: false, groupCode: 'BAĞLANTI' },
];

const request = async (url: string, options?: RequestInit, fallbackData?: any) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) return fallbackData;
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    
    return fallbackData;
  } catch (error) {
    console.error(`API Error: ${url}`, error);
    return fallbackData;
  }
};

export const apiService = {
  stocks: {
    // [GET] /api/stocks
    getAll: (includeYM: boolean = true) => 
      request(`${API_BASE_URL}/stocks?includeYM=${includeYM}`, undefined, MOCK_STOCKS),
    
    // Fix: Added missing getMinLevels method required by MinStockList.tsx
    getMinLevels: () => 
      request(`${API_BASE_URL}/stocks/min-levels`, undefined, MOCK_STOCKS.filter(s => s.quantity < s.minStockLevel)),

    // [GET] /api/stocks/{code}
    getDetail: (code: string) => 
      request(`${API_BASE_URL}/stocks/${code}`, undefined, MOCK_STOCKS[0]),
    
    // [GET] /api/stocks/next-code/{prefix}
    generateNextCode: (prefix: string) => 
      request(`${API_BASE_URL}/stocks/next-code/${prefix}`, undefined, { nextCode: `${prefix}0001` }),
    
    // [POST] /api/stocks
    save: (data: any) => 
      request(`${API_BASE_URL}/stocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }, { success: true, message: 'Kayıt başarılı (Mock)' }),

    // [DELETE] /api/stocks/{code}
    delete: (code: string) => 
      request(`${API_BASE_URL}/stocks/${code}`, { method: 'DELETE' }, { success: true }),
  },

  dashboard: {
    getStats: () => request(`${API_BASE_URL}/dashboard/stats`, undefined, { totalStockValue: "₺1.4M", pendingShipments: "42", dailySales: "₺38K", criticalStockCount: "12" }),
    getCharts: () => request(`${API_BASE_URL}/dashboard/charts`, undefined, []),
  },

  customers: {
    getAll: () => request(`${API_BASE_URL}/customers`, undefined, []),
  },

  warehouses: {
    getAll: () => request(`${API_BASE_URL}/warehouses`, undefined, []),
    getLocations: () => request(`${API_BASE_URL}/warehouses/locations`, undefined, []),
    getCapacities: () => request(`${API_BASE_URL}/warehouses/capacities`, undefined, []),
  }
};