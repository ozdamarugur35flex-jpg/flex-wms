

export interface StockCard {
  id: string;
  code: string;
  name: string;
  englishName?: string;
  barcode1?: string;
  barcode2?: string;
  barcode3?: string;
  groupCode?: string;
  unit1: string;
  purchaseVat: number;
  salesVat: number;
  purchasePrices: number[];
  salesPrices: number[];
  quantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  leadTime: number;
  isLocked: boolean;
  isAutoConsumption: boolean;
  imageUrl?: string;
  lastUpdated?: string;
  category?: string;
  lastPurchasePrice?: number;
  producerCode?: string;
  customsCode?: string;
  width?: number;
  height?: number;
  depth?: number;
  kod1?: string;
  kod2?: string;
  kod3?: string;
  kod4?: string;
  kod5?: string;
}

export interface CustomerCard { 
  id: string; 
  code: string; 
  name: string; 
  type: 'Alıcı' | 'Satıcı'; 
  locationType: 'Yurt İçi' | 'Yurt Dışı';
  taxNumber?: string;
  taxOffice?: string;
  phone?: string;
  email?: string;
}

export interface Warehouse { id: string; code: string; name: string; isLocked: boolean; isLocationTracking: boolean; lastActivity?: string; }
export interface StorageLocation { id: string; warehouseCode: string; cellCode: string; status: 'Dolu' | 'Boş' | 'Rezerve'; fillRate: number; }
export interface WarehouseCapacity { id: string; warehouseCode: string; stockGroupCode: string; maxCapacity: number; currentQuantity: number; unit: string; warningThreshold: number; }
export interface CellCapacity { id: string; warehouseCode: string; cellCode: string; capacityQty: number; capacityWeight: number; capacityVolume: number; cellType?: string; }
export interface StockAmbarLimit { id: string; stockCode: string; stockName: string; warehouseCode: number; minLevel: number; maxLevel: number; reorderPoint: number; }
export interface PurchaseRequestItem {
  id: string;
  stockCode: string;
  stockName?: string;
  quantity: number;
  unit: string;
  deliveryDate: string;
  description?: string;
  status: 'Bekliyor' | 'Onaylandı' | 'Reddedildi' | 'Siparişe Dönüştü';
}

export interface PurchaseRequest {
  id: string;
  requestNo: string;
  date: string;
  department?: string;
  projectCode?: string;
  warehouseCode: number;
  description?: string;
  status: 'Taslak' | 'Onayda' | 'Onaylandı' | 'Reddedildi' | 'Tamamlandı';
  items: PurchaseRequestItem[];
  totalItems?: number;
  requestedBy?: string;
}

export interface NetsisOrderItem {
  id: string;
  orderNo: string;
  stockCode: string;
  stockName?: string;
  quantity: number;
  receivedQuantity: number;
  unit: string;
  price: number;
  deliveryDate: string;
  warehouseCode: number;
  status: 'Açık' | 'Kapalı' | 'Sevk Edildi';
}

export interface NetsisOrder {
  id: string;
  orderNo: string;
  customerCode: string;
  customerName?: string;
  date: string;
  totalAmount: number;
  status: 'Bekliyor' | 'Onaylandı' | 'Reddedildi' | 'Tamamlandı';
  items: NetsisOrderItem[];
  description?: string;
}

export interface PurchaseInvoiceItem {
  id: string;
  invoiceNo: string;
  stockCode: string;
  stockName?: string;
  quantity: number;
  unit: string;
  price: number;
  date: string;
  warehouseCode: number;
}

export interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  customerCode: string;
  customerName?: string;
  date: string;
  totalAmount: number;
  gibInvoiceNo?: string;
  description?: string;
  items: PurchaseInvoiceItem[];
}

export interface StockVariant {
  id: string;
  stockCode: string;
  stockName: string;
  unit: string;
  supplier: string;
  width: string;
  height: string;
  conversion2: number;
  conversion3: number;
  lastUpdated: string;
}

export interface OrderTemplate {
  id: string;
  name: string;
  orderCodeCol: number;
  lineNoCol: number;
  stockCodeCol: number;
  stockNameCol: number;
  orderDateCol: number;
  deliveryDateCol: number;
  orderQtyCol: number;
  deliveredQtyCol: number;
  balanceQtyCol: number;
  descriptionCol: number;
}

export interface OrderItem {
  id: string;
  stockCode: string;
  stockName: string;
  deliveryDate: string;
  loadingDate: string;
  warehouseCode: string;
  quantity: number;
  unit: string;
  price: number;
  vat: number;
  currency: string;
  exchangeRate: number;
  total: number;
  isRework: boolean;
  revisionNo?: string;
}

export interface CustomerOrder {
  id: string;
  orderNo: string;
}

export interface MaterialOrder {
  id: string;
  orderStatus: string;
  groupCode: string;
  materialCode: string;
  materialName: string;
  orderQty: number;
  deliveredQty: number;
  balance: number;
  orderNo: string;
  supplierName: string;
  orderType: string;
  deliveryDate: string;
  notes: string;
  unit: string;
}

export interface CustomerOrderTracking {
    id: string;
    planRowNo: number;
    hasTooling: boolean;
    customerCode: string;
    customerName: string;
    orderStatus: string;
    stockCode: string;
    stockName: string;
    orderQty: number;
    deliveredQty: number;
    balance: number;
    orderNo: string;
    orderType: string;
    deliveryDate: string;
    initialDeliveryDate: string;
    notes: string;
    priceTL: number;
    priceCurrency: number;
    currencyType: string;
    productionQty: number;
    isRework: boolean;
    unit: string;
    totalAmountTL: number;
}

export interface SalesCostAnalysis {
    id: string;
    salesStatus: string;
    customerName: string;
    stockCode: string;
    stockName: string;
    salesPriceUSD: number;
    costUSD: number;
    specCode: string;
    specName: string;
    totalSalesQty: number;
    grossProfitUSD: number;
    profitPercent: number;
}

export interface MarketShareReport {
    id: string;
    stockCode: string;
    stockName: string;
    date: string;
    month: string;
    year: string;
    customerName: string;
    quantity: number;
    marketGroup: string;
    marketType: string;
    unitPriceUSD: number;
    salesAmountUSD: number;
    costUSD: number;
    materialCostAmountUSD: number;
    ratioPercent: number;
}

export interface OrderApprovalItem {
    id: string;
    orderCode: string;
    lineNo: number;
    stockCode: string;
    stockName: string;
    orderDate: string;
    deliveryDate: string;
    orderQty: number;
    deliveredQty: number;
    balance: number;
    systemBalance: number;
    systemDeliveryDate: string;
    updatedQty: number;
    updatedDate: string;
    description: string;
    status: 'New' | 'QtyChange' | 'DateChange' | 'InvalidStock' | 'StockChange';
    approvalStatus: 'Beklemede' | 'Onaylandı' | 'Reddedildi';
    lastSupplier?: string;
    lastPurchasePrice?: number;
    lastPurchaseDate?: string;
    currentStock?: number;
    minStockLevel?: number;
    rejectionReason?: string;
}

export interface WeeklyOrderTrackingRow {
    id: string;
    customerName: string;
    weeks: {
        weekNo: number;
        startDate: string;
        stockCode: string;
        quantity: number;
        unit: string;
    }[];
}

export interface WarehouseBalanceRow {
    id: string;
    warehouseName: string;
    balance: number;
}

export interface InvoiceItem {
    id: string;
    stockCode: string;
    stockName: string;
    loadingDate: string;
    deliveryDate: string;
    conversion: number;
    quantity: number;
    currencyType: string;
    currencyPrice: number;
    exchangeRate: number;
    warehouseCode: string;
    price: number;
    vat: number;
    total: number;
    orderNo?: string;
    orderLineNo?: number;
}

export interface SalesInvoice {
    id: string;
    invoiceNo: string;
    customerCode: string;
    customerName: string;
    date: string;
    deliveryDate: string;
    totalAmount: number;
    projectCode: string;
    description: string;
    taxOffice: string;
    taxNumber: string;
    address: string;
    items: InvoiceItem[];
}

export interface StockMovementLine {
    id: string;
    date: string;
    slipNo: string;
    waybillNo: string;
    type: 'Giriş' | 'Çıkış';
    inQty: number;
    outQty: number;
    balance: number;
    description: string;
    warehouseCode: string;
    cellCode: string;
    serialNo: string;
}

export interface ProductionRecord {
    id: string;
    slipNo: string;
    date: string;
    stockCode: string;
    stockName: string;
    serialNo: string;
    quantity: number;
    unit: string;
    machine: string;
    operator: string;
    jobOrderNo: string;
}

export interface DepotMaterialStatus {
    id: string;
    stockCode: string;
    stockName: string;
    unit: string;
    requiredQty: number;
    depotQty: number;
    difference: number;
}

export interface SerialStockItem {
    id: string;
    stockCode: string;
    stockName: string;
    serialNo: string;
    warehouseCode: string;
    cellCode: string;
    balance: number;
    unit: string;
}

export interface WarehouseTransferLine {
    id: string;
}

export interface WarehouseResetItem {
    id: string;
    stockCode: string;
    stockName: string;
    groupCode: string;
    unit: string;
    warehouseCode: string;
    cellCode: string;
    serialNo: string;
    balance: number;
    lastUpdated: string;
}

export interface WarehouseCell {
    id: string;
    code: string;
    warehouseCode: string;
    isSelected: boolean;
}

export interface UserDefinition {
    id: string;
    username: string;
    fullName: string;
    email: string;
    receiptSerial: string;
    isActive: boolean;
    isApprovalAuthority1: boolean;
    isApprovalAuthority2: boolean;
    isFmApprovalAuthority: boolean;
    lastLogin?: string;
}

export interface ModulePermission {
    id: string;
    moduleGroup: string;
    formDescription: string;
    canRead: boolean;
    canWrite: boolean;
    canDelete: boolean;
}

export interface UserPermissionSet {
    userId: string;
    isSystemAdmin: boolean;
    isRdPersonnel: boolean;
    canSeePrices: boolean;
    permissions: ModulePermission[];
}

export interface StockListItem {
    id: string;
    code: string;
    name: string;
    groupCode: string;
    unit: string;
}

export interface StockMovementReportItem {
    id: string;
    year: string;
    date: string;
    slipNo: string;
    type: string;
    price: number;
    inQty: number;
    outQty: number;
    balance: number;
    description: string;
    warehouseCode: string;
    customerName: string;
}

export interface StockWarehouseBalance {
    id: string;
    warehouseCode: string;
    warehouseName: string;
    balance: number;
}

export interface PurchaseRequisition {
    id: string;
    stockCode: string;
    stockName: string;
    branchName: string;
    minStockLevel: number;
    currentStock: number;
    requestedQty: number;
    requesterUser: string;
    date: string;
    status: string;
    isRevised: boolean;
}

export interface DeliveryHistory {
    date: string;
    quantity: number;
    receivedBy: string;
}

export interface PurchaseOrderItem {
    id: string;
    requisitionId: string;
    stockCode: string;
    stockName: string;
    branchName: string;
    supplierName: string;
    orderedQty: number;
    receivedQty: number;
    balance: number;
    lastPurchasePrice: number;
    lastSupplier: string;
    unit: string;
    status: string;
    isRevised: boolean;
    deliveries: DeliveryHistory[];
}

export interface ShipmentOrderItem {
    id: string;
    orderNo: string;
    stockCode: string;
    stockName: string;
    customerName: string;
    branchName: string;
    orderedQty: number;
    shippedQty: number;
    unit: string;
    status: string;
    terminalStatus: string;
    date: string;
}

export type SpreadsheetData = Record<string, SpreadsheetCell>;

export interface SpreadsheetCell {
    value: string;
    formula?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    align?: 'left' | 'center' | 'right';
    color?: string;
    background?: string;
    fontFamily?: string;
    fontSize?: number;
}

export interface SpreadsheetSheet {
    id: string;
    name: string;
    data: SpreadsheetData;
}

export interface SpreadsheetFile {
    id: string;
    name: string;
    parentId: string | null;
    ownerId: string;
    createdAt: string;
    updatedAt: string;
    sheets: SpreadsheetSheet[];
    activeSheetId: string;
    type: 'file';
}

export interface Folder {
    id: string;
    name: string;
    parentId: string | null;
    ownerId: string;
    createdAt: string;
    type: 'folder';
}

export type FileSystemItem = Folder | SpreadsheetFile;

export interface OrderBreakdownItem {
    id: string;
    date: string;
    branchName: string;
    customerCode: string;
    customerName: string;
    stockCode: string;
    stockName: string;
    groupCode: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unit: string;
}

export interface CustomerMapping {
    id: string;
    originalName: string;
    aliasName: string;
}

export interface InactiveBranch {
    id: string;
    branchName: string;
    customerName: string;
    lastPurchaseDate: string;
    daysSinceLastPurchase: number;
}

export interface CustomerOrderHeader {
  id: string;
  orderNo: string;
  date: string;
  customerCode: string;
  customerName?: string;
  deliveryDate: string;
  orderType: string; // Yurt İçi / Dışı
  totalAmount: number;
  riskStatus: {
    limit: number;
    balance: number;
    netRisk: number;
    checkRisk: number;
  };
  extraFields: Record<string, string>;
}

export interface CustomerOrderItem {
  id: string;
  stockCode: string;
  stockName: string;
  quantity: number;
  price: number;
  vatRate: number;
  total: number;
  deliveryDate: string;
}

export interface StockOrderBalance {
  warehouseBalance: number;
  reservedOrders: number;
  futureOrders: number;
}

export interface SalesAnalysis {
  pastPrices: { date: string; price: number }[];
}

export interface MaterialOrderStatus {
  id: string;
  orderNo: string;
  stockCode: string;
  stockName?: string;
  supplierCode: string;
  supplierName?: string;
  orderDate: string;
  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unit: string;
  status: 'Açık' | 'Kapalı' | 'Kısmi';
  lastDeliveryDate?: string;
  lastWaybillNo?: string;
}

export interface VariantDefinition {
  id: string;
  stockCode: string;
  stockName?: string;
  variantCode: string;
  variantName: string;
  color?: string;
  size?: string;
  barcode?: string;
  createdAt?: string;
}

export interface OperationalOrderItem {
    id: string;
    date: string;
    branchName: string;
    customerName: string;
    stockCode: string;
    stockName: string;
    orderedQty: number;
    shippedQty: number;
    balance: number;
    unit: string;
    status: string;
}