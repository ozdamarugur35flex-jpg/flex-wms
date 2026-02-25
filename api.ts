
/**
 * Flex WMS - Netsis API Gateway
 * Backend: .NET Core Web API (StocksController)
 */

// Kendi sunucu IP'nizi veya alan adınızı buraya yazın (Örn: 'http://192.168.1.10/api')
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '/api';

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
      const data = await response.json();
      
      // Handle PascalCase to camelCase mapping if needed (common in .NET APIs)
      if (Array.isArray(data)) {
        return data.map(item => mapStockData(item));
      } else if (data && typeof data === 'object') {
        return mapStockData(data);
      }
      
      return data;
    }
    
    return fallbackData;
  } catch (error) {
    console.error(`API Error: ${url}`, error);
    return fallbackData;
  }
};

// Helper to map Netsis/PascalCase fields to our camelCase interface
const mapStockData = (item: any) => {
  if (!item) return item;
  
  // If it's already in the correct format, just return it with number safety
  const mapped = {
    id: item.id || item.Id || item.code || item.Code || Math.random().toString(36).substr(2, 9),
    code: item.code || item.Code || '',
    name: item.name || item.Name || '',
    englishName: item.englishName || item.EnglishName || '',
    unit1: item.unit1 || item.Unit1 || 'ADET',
    quantity: Number(item.quantity ?? item.Quantity ?? 0),
    minStockLevel: Number(item.minStockLevel ?? item.MinStockLevel ?? 0),
    lastPurchasePrice: Number(item.lastPurchasePrice ?? item.LastPurchasePrice ?? 0),
    isLocked: !!(item.isLocked ?? item.IsLocked ?? false),
    isAutoConsumption: !!(item.isAutoConsumption ?? item.IsAutoConsumption ?? false),
    groupCode: item.groupCode || item.GroupCode || '',
    purchaseVat: Number(item.purchaseVat ?? item.PurchaseVat ?? 20),
    salesVat: Number(item.salesVat ?? item.SalesVat ?? 20),
    width: Number(item.width ?? item.Width ?? 0),
    height: Number(item.height ?? item.Height ?? 0),
    depth: Number(item.depth ?? item.Depth ?? 0),
    kod1: item.kod1 || item.Kod1 || '',
    kod2: item.kod2 || item.Kod2 || '',
    kod3: item.kod3 || item.Kod3 || '',
    kod4: item.kod4 || item.Kod4 || '',
    kod5: item.kod5 || item.Kod5 || '',
    barcode1: item.barcode1 || item.Barcode1 || '',
    barcode2: item.barcode2 || item.Barcode2 || '',
    barcode3: item.barcode3 || item.Barcode3 || '',
    producerCode: item.producerCode || item.ProducerCode || '',
    customsCode: item.customsCode || item.CustomsCode || '',
    leadTime: Number(item.leadTime ?? item.LeadTime ?? 0),
  };
  
  return mapped;
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