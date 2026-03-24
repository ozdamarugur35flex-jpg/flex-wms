
/**
 * Flex WMS - Netsis API Gateway
 * Backend: .NET Core Web API (StocksController)
 */

// Sunucu IP'niz ve IIS yapılandırmanıza göre burayı düzenleyin
// Eğer IIS'de 'api' klasörüne yayınladıysanız ve kodda [Route("api/...")] varsa sonuna /api eklemeniz gerekebilir
const API_BASE_URL = (import.meta as any).env.VITE_API_URL || '/api';

// --- MOCK DATA FALLBACK ---
const MOCK_STOCKS: any[] = [];

const request = async (url: string, options?: RequestInit, fallbackData?: any, mapper?: (item: any) => any) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) return fallbackData;
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      
      // Handle PascalCase to camelCase mapping if needed (common in .NET APIs)
      if (mapper) {
        if (Array.isArray(data)) {
          return data.map(item => mapper(item));
        } else if (data && typeof data === 'object') {
          return mapper(data);
        }
      }
      
      return data;
    }
    
    return fallbackData;
  } catch (error) {
    console.error(`API Error: ${url}`, error);
    return fallbackData;
  }
};

// --- MAPPERS (Netsis PascalCase -> Frontend camelCase) ---

const mapCustomerData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || item.code || item.Code || Math.random().toString(36).substr(2, 9),
    code: item.code || item.Code || '',
    name: item.name || item.Name || 'İSİMSİZ CARİ',
    type: item.type || item.Type || 'Alıcı',
    locationType: item.locationType || item.LocationType || 'Yurt İçi',
    taxNumber: item.taxNumber || item.TaxNumber || '',
    taxOffice: item.taxOffice || item.TaxOffice || '',
    phone: item.phone || item.Phone || '',
    email: item.email || item.Email || '',
    projectCode: item.projectCode || item.ProjectCode || '',
  };
};

const mapWarehouseData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || item.code || item.Code || Math.random().toString(36).substr(2, 9),
    code: item.code || item.Code || '',
    name: item.name || item.Name || 'İSİMSİZ DEPO',
    isLocked: !!(item.isLocked || item.IsLocked || item.depoKilitle === 'E' || item.DepoKilitle === 'E'),
    isLocationTracking: !!(item.isLocationTracking || item.IsLocationTracking),
    lastActivity: item.lastActivity || item.LastActivity || '',
  };
};

const mapLocationData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || item.cellCode || item.CellCode || Math.random().toString(36).substr(2, 9),
    cellCode: item.cellCode || item.CellCode || '',
    warehouseCode: item.warehouseCode || item.WarehouseCode || 'GENEL',
    description: item.description || item.Description || '',
    status: item.status || item.Status || 'Boş',
    fillRate: Number(item.fillRate || item.FillRate || 0),
    cellCount: Number(item.cellCount || item.CellCount || 0)
  };
};

const mapCellCapacityData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || `${item.warehouseCode}-${item.cellCode}` || `${item.WarehouseCode}-${item.CellCode}` || Math.random().toString(36).substr(2, 9),
    warehouseCode: item.warehouseCode || item.WarehouseCode || '',
    cellCode: item.cellCode || item.CellCode || '',
    capacityQty: Number(item.capacityQty ?? item.CapacityQty ?? 0),
    capacityWeight: Number(item.capacityWeight ?? item.CapacityWeight ?? 0),
    capacityVolume: Number(item.capacityVolume ?? item.CapacityVolume ?? 0),
    cellType: item.cellType || item.CellType || '',
  };
};

const mapStockAmbarLimitData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || `${item.stockCode}-${item.warehouseCode}` || `${item.StockCode}-${item.WarehouseCode}` || Math.random().toString(36).substr(2, 9),
    stockCode: item.stockCode || item.StockCode || '',
    stockName: item.stockName || item.StockName || '',
    warehouseCode: Number(item.warehouseCode ?? item.WarehouseCode ?? 0),
    minLevel: Number(item.minLevel ?? item.MinLevel ?? 0),
    maxLevel: Number(item.maxLevel ?? item.MaxLevel ?? 0),
    reorderPoint: Number(item.reorderPoint ?? item.ReorderPoint ?? 0),
  };
};

const mapPurchaseRequestData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || item.requestNo || item.RequestNo || Math.random().toString(36).substr(2, 9),
    requestNo: item.requestNo || item.RequestNo || '',
    date: item.date || item.Date || '',
    department: item.department || item.Department || '',
    projectCode: item.projectCode || item.ProjectCode || '',
    warehouseCode: Number(item.warehouseCode ?? item.WarehouseCode ?? 0),
    description: item.description || item.Description || '',
    status: item.status || item.Status || 'Taslak',
    requestedBy: item.requestedBy || item.RequestedBy || '',
    totalItems: Number(item.totalItems ?? item.TotalItems ?? 0),
    items: Array.isArray(item.items || item.Items) ? (item.items || item.Items).map((line: any) => ({
      id: line.id || line.Id || Math.random().toString(36).substr(2, 9),
      stockCode: line.stockCode || line.StockCode || '',
      stockName: line.stockName || line.StockName || '',
      quantity: Number(line.quantity ?? line.Quantity ?? 0),
      unit: line.unit || line.Unit || 'ADET',
      deliveryDate: line.deliveryDate || line.DeliveryDate || '',
      description: line.description || line.Description || '',
      status: line.status || line.Status || 'Bekliyor',
    })) : []
  };
};

const mapPurchaseOrderData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || item.orderNo || item.OrderNo || Math.random().toString(36).substr(2, 9),
    orderNo: item.orderNo || item.OrderNo || '',
    customerCode: item.customerCode || item.CustomerCode || '',
    customerName: item.customerName || item.CustomerName || '',
    date: item.date || item.Date || '',
    totalAmount: Number(item.totalAmount ?? item.TotalAmount ?? 0),
    status: item.status || item.Status || 'Bekliyor',
    description: item.description || item.Description || '',
    items: Array.isArray(item.items || item.Items) ? (item.items || item.Items).map((line: any) => ({
      id: line.id || line.Id || Math.random().toString(36).substr(2, 9),
      orderNo: line.orderNo || line.OrderNo || '',
      stockCode: line.stockCode || line.StockCode || '',
      stockName: line.stockName || line.StockName || '',
      quantity: Number(line.quantity ?? line.Quantity ?? 0),
      receivedQuantity: Number(line.receivedQuantity ?? line.ReceivedQuantity ?? 0),
      unit: line.unit || line.Unit || 'ADET',
      price: Number(line.price ?? line.Price ?? 0),
      deliveryDate: line.deliveryDate || line.DeliveryDate || '',
      warehouseCode: Number(line.warehouseCode ?? line.WarehouseCode ?? 0),
      status: line.status || line.Status || 'Açık',
    })) : []
  };
};

const mapPurchaseInvoiceData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || item.invoiceNo || item.InvoiceNo || Math.random().toString(36).substr(2, 9),
    invoiceNo: item.invoiceNo || item.InvoiceNo || '',
    customerCode: item.customerCode || item.CustomerCode || '',
    customerName: item.customerName || item.CustomerName || '',
    date: item.date || item.Date || '',
    totalAmount: Number(item.totalAmount ?? item.TotalAmount ?? 0),
    gibInvoiceNo: item.gibInvoiceNo || item.GibInvoiceNo || '',
    description: item.description || item.Description || '',
    items: Array.isArray(item.items || item.Items) ? (item.items || item.Items).map((line: any) => ({
      id: line.id || line.Id || Math.random().toString(36).substr(2, 9),
      invoiceNo: line.invoiceNo || line.InvoiceNo || '',
      stockCode: line.stockCode || line.StockCode || '',
      stockName: line.stockName || line.StockName || '',
      quantity: Number(line.quantity ?? line.Quantity ?? 0),
      unit: line.unit || line.Unit || 'ADET',
      price: Number(line.price ?? line.Price ?? 0),
      date: line.date || line.Date || '',
      warehouseCode: Number(line.warehouseCode ?? line.WarehouseCode ?? 0),
    })) : []
  };
};

const mapSalesInvoiceData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || item.invoiceNo || item.InvoiceNo || Math.random().toString(36).substr(2, 9),
    invoiceNo: item.invoiceNo || item.InvoiceNo || '',
    customerCode: item.customerCode || item.CustomerCode || '',
    customerName: item.customerName || item.CustomerName || '',
    date: item.date || item.Date || '',
    deliveryDate: item.deliveryDate || item.DeliveryDate || '',
    totalAmount: Number(item.totalAmount ?? item.TotalAmount ?? 0),
    projectCode: item.projectCode || item.ProjectCode || '',
    description: item.description || item.Description || '',
    taxOffice: item.taxOffice || item.TaxOffice || '',
    taxNumber: item.taxNumber || item.TaxNumber || '',
    address: item.address || item.Address || '',
    items: Array.isArray(item.items || item.Items) ? (item.items || item.Items).map((line: any) => ({
      id: line.id || line.Id || Math.random().toString(36).substr(2, 9),
      stockCode: line.stockCode || line.StockCode || '',
      stockName: line.stockName || line.StockName || '',
      quantity: Number(line.quantity ?? line.Quantity ?? 0),
      unit: line.unit || line.Unit || 'ADET',
      price: Number(line.price ?? line.Price ?? 0),
      vat: Number(line.vat ?? line.Vat ?? 20),
      total: Number(line.total ?? line.Total ?? 0),
      warehouseCode: line.warehouseCode || line.WarehouseCode || '01',
    })) : []
  };
};

const mapShipmentOrderData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || item.inckeyNo || item.InckeyNo || Math.random().toString(36).substr(2, 9),
    durum: item.durum || item.Durum || 'B',
    sevkEmriNo: item.sevkEmriNo || item.SevkEmriNo || '',
    sipInckeyNo: item.sipInckeyNo || item.SipInckeyNo || 0,
    miktar: Number(item.miktar ?? item.Miktar ?? 0),
    depo: item.depo || item.Depo || 0,
    stokKodu: item.stokKodu || item.StokKodu || '',
    stokAdi: item.stokAdi || item.StokAdi || '',
    cariIsim: item.cariIsim || item.CariIsim || '',
  };
};

const mapCustomerOrderStatusData = (item: any) => {
  if (!item) return item;
  return {
    siparisNo: item.siparisNo || item.SiparisNo || '',
    siparisTarihi: item.siparisTarihi || item.SiparisTarihi || '',
    musteriAdi: item.musteriAdi || item.MusteriAdi || '',
    stokKodu: item.stokKodu || item.StokKodu || '',
    stokAdi: item.stokAdi || item.StokAdi || '',
    siparisMiktari: Number(item.siparisMiktari ?? item.SiparisMiktari ?? 0),
    sevkEdilenMiktar: Number(item.sevkEdilenMiktar ?? item.SevkEdilenMiktar ?? 0),
    bakiyeMiktar: Number(item.bakiyeMiktar ?? item.BakiyeMiktar ?? 0),
    birimFiyat: Number(item.birimFiyat ?? item.BirimFiyat ?? 0),
    kapaliMi: !!(item.kapaliMi ?? item.KapaliMi ?? false),
  };
};

const mapStockData = (item: any) => {
  if (!item) return item;
  return {
    id: item.id || item.Id || item.code || item.Code || Math.random().toString(36).substr(2, 9),
    code: item.code || item.Code || '',
    name: item.name || item.Name || '',
    englishName: item.englishName || item.EnglishName || '',
    unit1: item.unit1 || item.Unit1 || 'ADET',
    quantity: Number(item.quantity ?? item.Quantity ?? 0),
    minStockLevel: Number(item.minStockLevel ?? item.MinStockLevel ?? 0),
    maxStockLevel: Number(item.maxStockLevel ?? item.MaxStockLevel ?? 0),
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
};

// --- API SERVICE ---

export const apiService = {
  stocks: {
    getAll: (includeYM: boolean = true) => 
      request(`${API_BASE_URL}/stocks?includeYM=${includeYM}`, undefined, MOCK_STOCKS, mapStockData),
    
    getMinLevels: () => 
      request(`${API_BASE_URL}/stocks/min-levels`, undefined, MOCK_STOCKS.filter(s => s.quantity < s.minStockLevel), mapStockData),

    getDetail: (code: string) => 
      request(`${API_BASE_URL}/stocks/${code}`, undefined, null, mapStockData),
    
    generateNextCode: (prefix: string) => 
      request(`${API_BASE_URL}/stocks/next-code/${prefix}`, undefined, { nextCode: `${prefix}0001` }),
    
    save: (data: any) => 
      request(`${API_BASE_URL}/stocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }, { success: true }),

    delete: (code: string) => 
      request(`${API_BASE_URL}/stocks/${code}`, { method: 'DELETE' }, { success: true }),
  },

  dashboard: {
    getStats: () => request(`${API_BASE_URL}/dashboard/stats`, undefined, { totalStockValue: "₺0", pendingShipments: "0", dailySales: "₺0", criticalStockCount: "0" }),
    getCharts: () => request(`${API_BASE_URL}/dashboard/charts`, undefined, []),
    getLogs: () => request(`${API_BASE_URL}/dashboard/logs`, undefined, []),
  },

  customers: {
    getAll: () => request(`${API_BASE_URL}/customers`, undefined, [], mapCustomerData),
    generateNextCode: (prefix: string) => 
      request(`${API_BASE_URL}/customers/next-code/${prefix}`, undefined, { nextCode: `${prefix}0001` }),
    save: (data: any) => request(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, { success: true }),
    delete: (code: string) => request(`${API_BASE_URL}/customers/${code}`, { method: 'DELETE' }, { success: true }),
  },

  warehouses: {
    getAll: () => request(`${API_BASE_URL}/warehouses`, undefined, [], mapWarehouseData),
    getLocations: () => request(`${API_BASE_URL}/locations`, undefined, [], mapLocationData),
    getCapacities: () => request(`${API_BASE_URL}/warehouses/capacities`, undefined, []),
    getCellCapacities: () => request(`${API_BASE_URL}/capacities`, undefined, [], mapCellCapacityData),
    getStockAmbarLimits: () => request(`${API_BASE_URL}/stocks/warehouse-limits`, undefined, [], mapStockAmbarLimitData),
  },

  purchaseRequests: {
    getAll: () => request(`${API_BASE_URL}/purchaserequests`, undefined, [], mapPurchaseRequestData),
    getDetail: (requestNo: string) => request(`${API_BASE_URL}/purchaserequests/${requestNo}`, undefined, null, mapPurchaseRequestData),
    save: (data: any) => request(`${API_BASE_URL}/purchaserequests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, { success: true }),
    delete: (requestNo: string) => request(`${API_BASE_URL}/purchaserequests/${requestNo}`, { method: 'DELETE' }, { success: true }),
    convertToOrder: (requestNo: string, customerCode: string) => request(`${API_BASE_URL}/purchaserequests/${requestNo}/convert-to-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerCode })
    }, { success: true }),
  },

  purchaseOrders: {
    getAll: () => request(`${API_BASE_URL}/purchaseorders`, undefined, [], mapPurchaseOrderData),
    getDetail: (orderNo: string) => request(`${API_BASE_URL}/purchaseorders/${orderNo}`, undefined, null, mapPurchaseOrderData),
    save: (data: any) => request(`${API_BASE_URL}/purchaseorders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, { success: true }),
    delete: (orderNo: string) => request(`${API_BASE_URL}/purchaseorders/${orderNo}`, { method: 'DELETE' }, { success: true }),
  },

  purchaseInvoices: {
    getAll: () => request(`${API_BASE_URL}/purchaseinvoices`, undefined, [], mapPurchaseInvoiceData),
    getDetail: (invoiceNo: string) => request(`${API_BASE_URL}/purchaseinvoices/${invoiceNo}`, undefined, null, mapPurchaseInvoiceData),
    save: (data: any) => request(`${API_BASE_URL}/purchaseinvoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, { success: true }),
    delete: (invoiceNo: string) => request(`${API_BASE_URL}/purchaseinvoices/${invoiceNo}`, { method: 'DELETE' }, { success: true }),
  },

  variants: {
    getAll: () => request(`${API_BASE_URL}/variants`, undefined, []),
    save: (data: any) => request(`${API_BASE_URL}/variants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, { success: true }),
    delete: (id: string) => request(`${API_BASE_URL}/variants/${id}`, { method: 'DELETE' }, { success: true }),
  },

  materialOrderTracking: {
    getAll: () => request(`${API_BASE_URL}/material-order-tracking`, undefined, []),
  },

  customerOrders: {
    getDetail: (orderNo: string) => request(`${API_BASE_URL}/customer-orders/${orderNo}`, undefined, null),
    getItems: (orderNo: string) => request(`${API_BASE_URL}/customer-orders/${orderNo}/items`, undefined, []),
    getStatusReport: () => request(`${API_BASE_URL}/customerorders/status-report`, undefined, [], mapCustomerOrderStatusData),
    getStockAnalysis: (stockCode: string, customerCode: string) => 
      request(`${API_BASE_URL}/stocks/${stockCode}/analysis?customerCode=${customerCode}`, undefined, null),
    getStockOrderBalance: (stockCode: string) => 
      request(`${API_BASE_URL}/stocks/${stockCode}/order-balance`, undefined, null),
    getCustomerSalesHistory: (customerCode: string) => 
      request(`${API_BASE_URL}/customers/${customerCode}/sales-history`, undefined, []),
  },
  shipmentOrders: {
    getAll: () => request(`${API_BASE_URL}/shipmentorders`, undefined, [], mapShipmentOrderData),
    save: (data: any) => request(`${API_BASE_URL}/shipmentorders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, { success: true }),
  },
  salesInvoices: {
    getAll: () => request(`${API_BASE_URL}/salesinvoices`, undefined, [], mapSalesInvoiceData),
    getDetail: (invoiceNo: string) => request(`${API_BASE_URL}/salesinvoices/${invoiceNo}`, undefined, null, mapSalesInvoiceData),
    getEWaybillDetails: (invoiceNo: string) => request(`${API_BASE_URL}/salesinvoices/${invoiceNo}/ewaybill`, undefined, null),
    save: (data: any) => request(`${API_BASE_URL}/salesinvoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, { success: true }),
    delete: (invoiceNo: string) => request(`${API_BASE_URL}/salesinvoices/${invoiceNo}`, { method: 'DELETE' }, { success: true }),
    generateNextNo: () => request(`${API_BASE_URL}/salesinvoices/next-no`, undefined, { nextNo: '' }),
  },
  reports: {
    getWarehouseBalances: () => request(`${API_BASE_URL}/reports/warehouse-balances`, undefined, []),
    getStockMovements: (stockCodes: string[], startDate: string, endDate: string) => 
      request(`${API_BASE_URL}/reports/stock-movements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockCodes, startDate, endDate })
      }, []),
    getStockWarehouseBalances: (stockCodes: string[]) => 
      request(`${API_BASE_URL}/reports/stock-warehouse-balances`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockCodes })
      }, []),
  },
  production: {
    getAll: () => request(`${API_BASE_URL}/production`, undefined, []),
    getMaterialStatus: (jobOrderNo: string) => request(`${API_BASE_URL}/production/material-status/${jobOrderNo}`, undefined, []),
    save: (data: any) => request(`${API_BASE_URL}/production`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }, { success: true }),
  }
};
