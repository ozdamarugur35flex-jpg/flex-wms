import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- MOCK DATABASE (Netsis Simülasyonu) ---
  let customers = [
    { id: 'C001', code: 'C001', name: 'Aksoy Metal Ltd.', type: 'Satıcı', locationType: 'Yurt İçi', taxOffice: 'Maslak V.D.', taxNumber: '1234567890', phone: '0212 555 11 22', email: 'info@aksoymetal.com', specialCode1: 'S' },
    { id: 'C002', code: 'C002', name: 'Global Trading Co.', type: 'Satıcı', locationType: 'Yurt Dışı', taxOffice: 'London Tax', taxNumber: 'GB99887766', phone: '+44 20 7766 5544', email: 'sales@globaltrading.com', specialCode1: 'S' },
    { id: '12001010006', code: '12001010006', name: 'Örnek Müşteri A.Ş.', type: 'Alıcı', locationType: 'Yurt İçi', taxOffice: 'Kadıköy V.D.', taxNumber: '9998887766', phone: '0216 111 22 33', email: 'info@ornek.com', specialCode1: 'F' }
  ];

  let stocks = [
    { 
      id: 'AL-2020', 
      code: 'AL-2020', 
      name: 'Alüminyum Profil 20x20', 
      englishName: 'Aluminum Profile 20x20',
      barcode1: '8680001',
      barcode2: '',
      barcode3: '',
      groupCode: 'HAMMADDE',
      unit1: 'ADET',
      purchaseVat: 10,
      salesVat: 10,
      quantity: 400,
      minStockLevel: 500,
      warehouseCode: 100,
      isLocked: false,
      producerCode: 'AKSOY-01',
      customsCode: '7604.21.00.00.00',
      width: 20,
      height: 20,
      depth: 2000,
      kod1: 'PROFIL',
      kod2: 'ALU',
      kod3: '',
      kod4: '',
      kod5: '',
      lastPurchasePrice: 120.50,
      salesPrices: [1390]
    },
    {
      id: 'STK-1820',
      code: 'STK-1820',
      name: 'Örnek Stok 1820',
      groupCode: 'MAMUL',
      unit1: 'ADET',
      purchaseVat: 1,
      salesVat: null,
      quantity: 50,
      minStockLevel: 100,
      warehouseCode: 100,
      isLocked: false,
      salesPrices: [1390]
    }
  ];

  let variants: any[] = [
    {
      id: 'V1',
      stockCode: 'AL-2020',
      stockName: 'Alüminyum Profil 20x20',
      variantCode: 'AL-2020-BLK',
      variantName: 'Siyah Eloksal',
      color: 'Siyah',
      size: '20x20',
      barcode: 'VAR-001',
      createdAt: new Date().toISOString()
    }
  ];

  let materialOrderTracking: any[] = [
    {
      id: 'MOT1',
      orderNo: 'SIP-00124',
      stockCode: 'AL-2020',
      stockName: 'Alüminyum Profil 20x20',
      supplierCode: 'C001',
      supplierName: 'Aksoy Metal Ltd.',
      orderDate: '2024-03-01',
      orderedQuantity: 1000,
      receivedQuantity: 600,
      remainingQuantity: 400,
      unit: 'ADET',
      status: 'Kısmi',
      lastDeliveryDate: '2024-03-10',
      lastWaybillNo: 'IRS-9988'
    },
    {
      id: 'MOT2',
      orderNo: 'SIP-00125',
      stockCode: 'AL-2020',
      stockName: 'Alüminyum Profil 20x20',
      supplierCode: 'C002',
      supplierName: 'Global Trading Co.',
      orderDate: '2024-03-05',
      orderedQuantity: 500,
      receivedQuantity: 500,
      remainingQuantity: 0,
      unit: 'ADET',
      status: 'Kapalı',
      lastDeliveryDate: '2024-03-11',
      lastWaybillNo: 'IRS-9990'
    }
  ];

  // --- API ROUTES ---

  // [GET] /api/stocks
  app.get("/api/stocks", (req, res) => {
    const { includeYM } = req.query;
    let filtered = stocks;
    if (includeYM === 'false') {
      filtered = stocks.filter(s => s.groupCode !== 'YMA');
    }
    res.json(filtered);
  });

  // [GET] /api/stocks/next-code/:prefix
  app.get("/api/stocks/next-code/:prefix", (req, res) => {
    const { prefix } = req.params;
    const lastStock = stocks
      .filter(s => s.code.startsWith(prefix))
      .sort((a, b) => b.code.localeCompare(a.code))[0];
    
    let nextNum = 1;
    if (lastStock) {
      const numPart = lastStock.code.replace(prefix, "");
      if (!isNaN(parseInt(numPart))) {
        nextNum = parseInt(numPart) + 1;
      }
    }
    const nextCode = `${prefix}${nextNum.toString().padStart(4, '0')}`;
    res.json({ nextCode });
  });

  // [POST] /api/stocks
  app.post("/api/stocks", (req, res) => {
    const data = req.body;
    const index = stocks.findIndex(s => s.code === data.code);
    if (index > -1) {
      stocks[index] = { ...stocks[index], ...data };
    } else {
      stocks.push({ ...data, id: data.code });
    }
    res.json({ success: true, message: "Netsis (Sim) kaydı başarılı." });
  });

  // [GET] /api/dashboard/stats
  app.get("/api/dashboard/stats", (req, res) => {
    res.json({
      totalStockValue: "₺1.4M",
      pendingShipments: "42",
      dailySales: "₺38K",
      criticalStockCount: stocks.filter(s => s.quantity < s.minStockLevel).length.toString()
    });
  });

  // [GET] /api/dashboard/charts
  app.get("/api/dashboard/charts", (req, res) => {
    res.json([
      { name: 'Pzt', satis: 4000, alis: 2400 },
      { name: 'Sal', satis: 3000, alis: 1398 },
      { name: 'Çar', satis: 2000, alis: 9800 },
      { name: 'Per', satis: 2780, alis: 3908 },
      { name: 'Cum', satis: 1890, alis: 4800 },
    ]);
  });
  
  // [GET] /api/dashboard/logs
  app.get("/api/dashboard/logs", (req, res) => {
    res.json([
      { message: "Netsis Entegrasyonu: Başarılı", time: "14:05" },
      { message: "Stok Güncelleme Tamamlandı", time: "13:45" },
      { message: "Yeni Sevkiyat Emri Alındı", time: "12:30" },
      { message: "Depo Sayımı Başlatıldı", time: "10:15" }
    ]);
  });

  // [GET] /api/stocks/min-levels
  app.get("/api/stocks/min-levels", (req, res) => {
    const minStocks = stocks.filter(s => s.quantity < s.minStockLevel && (s as any).warehouseCode === 100);
    res.json(minStocks);
  });

  // [GET] /api/stocks/:code
  app.get("/api/stocks/:code", (req, res) => {
    const stock = stocks.find(s => s.code === req.params.code);
    if (stock) res.json(stock);
    else res.status(404).json({ message: "Stok bulunamadı" });
  });

  // [DELETE] /api/stocks/:code
  app.delete("/api/stocks/:code", (req, res) => {
    stocks = stocks.filter(s => s.code !== req.params.code);
    res.json({ success: true });
  });

  // [GET] /api/customers
  app.get("/api/customers", (req, res) => {
    res.json(customers);
  });

  // [GET] /api/customers/next-code/:prefix
  app.get("/api/customers/next-code/:prefix", (req, res) => {
    const { prefix } = req.params;
    const lastCustomer = customers
      .filter(c => c.code.startsWith(prefix))
      .sort((a, b) => b.code.localeCompare(a.code))[0];
    
    let nextNum = 1;
    if (lastCustomer) {
      const numPart = lastCustomer.code.replace(prefix, "");
      if (!isNaN(parseInt(numPart))) {
        nextNum = parseInt(numPart) + 1;
      }
    }
    const nextCode = `${prefix}${nextNum.toString().padStart(4, '0')}`;
    res.json({ nextCode });
  });

  // [POST] /api/customers
  app.post("/api/customers", (req, res) => {
    const data = req.body;
    const index = customers.findIndex(c => c.code === data.code);
    if (index > -1) {
      customers[index] = { ...customers[index], ...data };
    } else {
      customers.push({ ...data, id: data.code });
    }
    res.json({ success: true, message: "Cari kart Netsis'e (Sim) kaydedildi." });
  });

  // [DELETE] /api/customers/:code
  app.delete("/api/customers/:code", (req, res) => {
    customers = customers.filter(c => c.code !== req.params.code);
    res.json({ success: true });
  });

  // [GET] /api/warehouses
  app.get("/api/warehouses", (req, res) => {
    res.json([
      { id: '1', code: '01', name: 'Merkez Depo', isLocked: false, isLocationTracking: true },
      { id: '2', code: '02', name: 'Hammadde Depo', isLocked: false, isLocationTracking: true }
    ]);
  });

  // [GET] /api/locations
  app.get("/api/locations", (req, res) => {
    res.json([
      { id: 'L1', warehouseCode: '01', cellCode: 'A-01-01', status: 'Boş', fillRate: 0 },
      { id: 'L2', warehouseCode: '01', cellCode: 'A-01-02', status: 'Dolu', fillRate: 100 }
    ]);
  });

  // [GET] /api/capacities
  app.get("/api/capacities", (req, res) => {
    res.json([
      { id: 'C1', warehouseCode: '01', cellCode: 'A-01-01', capacityQty: 1000, capacityWeight: 500, capacityVolume: 200, cellType: 'RACK' },
      { id: 'C2', warehouseCode: '01', cellCode: 'A-01-02', capacityQty: 500, capacityWeight: 250, capacityVolume: 100, cellType: 'SHELF' }
    ]);
  });

  // [GET] /api/stocks/warehouse-limits
  app.get("/api/stocks/warehouse-limits", (req, res) => {
    res.json([
      { id: '1', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', warehouseCode: 1, minLevel: 100, maxLevel: 5000, reorderPoint: 500 },
      { id: '2', stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', warehouseCode: 1, minLevel: 1000, maxLevel: 50000, reorderPoint: 5000 }
    ]);
  });

  // [GET] /api/warehouses/capacities
  app.get("/api/warehouses/capacities", (req, res) => {
    res.json([
      { id: 'CP1', warehouseCode: '01', stockGroupCode: 'HAMMADDE', maxCapacity: 10000, currentQuantity: 4500, unit: 'ADET', warningThreshold: 80 }
    ]);
  });

  // --- VARIANT API ---

  // [GET] /api/variants
  app.get("/api/variants", (req, res) => {
    res.json(variants);
  });

  // [POST] /api/variants
  app.post("/api/variants", (req, res) => {
    const data = req.body;
    const stock = stocks.find(s => s.code === data.stockCode);
    
    const newVariant = {
      ...data,
      id: Math.random().toString(36).substr(2, 9),
      stockName: stock ? stock.name : 'Bilinmeyen Stok',
      createdAt: new Date().toISOString()
    };
    
    variants.push(newVariant);
    res.json({ success: true, variant: newVariant });
  });

  // [DELETE] /api/variants/:id
  app.delete("/api/variants/:id", (req, res) => {
    variants = variants.filter(v => v.id !== req.params.id);
    res.json({ success: true });
  });

  // --- MATERIAL ORDER TRACKING API ---

  // [GET] /api/material-order-tracking
  app.get("/api/material-order-tracking", (req, res) => {
    res.json(materialOrderTracking);
  });

  // --- CUSTOMER ORDER INTEGRATION API ---

  // [GET] /api/customer-orders/:orderNo
  app.get("/api/customer-orders/:orderNo", (req, res) => {
    const { orderNo } = req.params;
    
    // TBLSIPAMAS & TBLCASAB & TBLCAHAR Simülasyonu
    const orderHeader = {
      id: 'CO1',
      orderNo: orderNo,
      date: '2024-03-12',
      customerCode: 'C001',
      customerName: 'Aksoy Metal Ltd.',
      deliveryDate: '2024-03-20',
      orderType: 'Yurt İçi',
      totalAmount: 150000,
      riskStatus: {
        limit: 500000,
        balance: 125000,
        netRisk: 375000,
        checkRisk: 50000
      },
      extraFields: {
        EKALAN1: 'Özel Not 1',
        EKALAN2: 'Sevkiyat Önceliği: Yüksek',
        // ... 16'ya kadar
      }
    };

    res.json(orderHeader);
  });

  // [GET] /api/customer-orders/:orderNo/items
  app.get("/api/customer-orders/:orderNo/items", (req, res) => {
    // TBLSIPATRA & TBLSTSAB Simülasyonu
    const items = [
      {
        id: 'ITM1',
        stockCode: 'AL-2020',
        stockName: 'Alüminyum Profil 20x20',
        quantity: 500,
        price: 120.50,
        vatRate: 20,
        total: 60250,
        deliveryDate: '2024-03-20'
      },
      {
        id: 'ITM2',
        stockCode: 'SMN-M8',
        stockName: 'Çelik Somun M8',
        quantity: 2000,
        price: 2.50,
        vatRate: 20,
        total: 5000,
        deliveryDate: '2024-03-22'
      }
    ];
    res.json(items);
  });

  // [GET] /api/stocks/:code/analysis
  app.get("/api/stocks/:code/analysis", (req, res) => {
    const { code } = req.params;
    const { customerCode } = req.query;
    
    // TBLSTHAR (HTUR='J') Simülasyonu
    res.json({
      pastPrices: [
        { date: '2024-01-15', price: 115.00 },
        { date: '2024-02-01', price: 118.50 },
        { date: '2024-02-20', price: 120.00 },
        { date: '2024-03-05', price: 120.50 }
      ]
    });
  });

  // [GET] /api/stocks/:code/order-balance
  app.get("/api/stocks/:code/order-balance", (req, res) => {
    // TBLSTOKURS & TBLSIPATRA (KAPAL='A') Simülasyonu
    res.json({
      warehouseBalance: 1500,
      reservedOrders: 850, // FTIP=1
      futureOrders: 300    // FTIP=2
    });
  });

  // [GET] /api/customers/:code/sales-history
  app.get("/api/customers/:code/sales-history", (req, res) => {
    // TBLSTHAR (HTUR='J') Simülasyonu
    res.json([
      { stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', totalQty: 5000, lastPrice: 120.50, lastDate: '2024-03-05' },
      { stockCode: 'SMN-M8', stockName: 'Çelik Somun M8', totalQty: 15000, lastPrice: 2.45, lastDate: '2024-02-28' }
    ]);
  });

  // [GET] /api/customerorders/status-report
  app.get("/api/customerorders/status-report", (req, res) => {
    res.json([
      { siparisNo: 'SIP001', siparisTarihi: '2024-03-01', musteriAdi: 'Aksoy Metal', stokKodu: 'AL-2020', stokAdi: 'Alüminyum Profil', siparisMiktari: 1000, sevkEdilenMiktar: 400, bakiyeMiktar: 600, birimFiyat: 120, kapaliMi: false },
      { siparisNo: 'SIP002', siparisTarihi: '2024-03-05', musteriAdi: 'Global Trading', stokKodu: 'SMN-M8', stokAdi: 'Çelik Somun', siparisMiktari: 5000, sevkEdilenMiktar: 5000, bakiyeMiktar: 0, birimFiyat: 2.5, kapaliMi: true }
    ]);
  });

  // --- PURCHASE INVOICE API ---
  let purchaseInvoices: any[] = [
    {
      id: 'AL-2024001',
      invoiceNo: 'AL-2024001',
      customerCode: 'C001',
      customerName: 'Aksoy Metal Ltd.',
      date: '2024-03-10',
      totalAmount: 12500,
      gibInvoiceNo: 'GIB20240001',
      description: 'Hammadde Alımı',
      items: [
        { id: '1', invoiceNo: 'AL-2024001', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', quantity: 100, unit: 'ADET', price: 125, date: '2024-03-10', warehouseCode: 1 }
      ]
    }
  ];

  app.get("/api/purchaseinvoices", (req, res) => res.json(purchaseInvoices));
  app.get("/api/purchaseinvoices/:invoiceNo", (req, res) => {
    const inv = purchaseInvoices.find(i => i.invoiceNo === req.params.invoiceNo);
    if (inv) res.json(inv);
    else res.status(404).json({ message: "Alış irsaliyesi bulunamadı" });
  });
  app.post("/api/purchaseinvoices", (req, res) => {
    const data = req.body;
    purchaseInvoices.push({ ...data, id: data.invoiceNo || Math.random().toString(36).substr(2, 9) });
    res.json({ success: true, message: "Alış irsaliyesi Netsis'e (Sim) kaydedildi." });
  });
  app.delete("/api/purchaseinvoices/:invoiceNo", (req, res) => {
    purchaseInvoices = purchaseInvoices.filter(i => i.invoiceNo !== req.params.invoiceNo);
    res.json({ success: true });
  });

  // --- SALES INVOICE API ---
  let salesInvoices: any[] = [
    {
      id: 'EIR2024000000001',
      invoiceNo: 'EIR2024000000001',
      customerCode: 'C001',
      customerName: 'Aksoy Lojistik Tic. Ltd. Şti.',
      date: '2024-03-12',
      deliveryDate: '2024-03-12',
      totalAmount: 54600,
      projectCode: 'PRO-2024-X1',
      description: 'EIR Serisi: ABC2024',
      taxOffice: 'Maslak V.D.',
      taxNumber: '1234567890',
      address: 'İkitelli OSB, Metal İş San. Sit. 12. Blok No: 45 Başakşehir/İstanbul',
      items: [
        { id: '1', stockCode: 'AL-2020', stockName: 'Alüminyum Profil 20x20', quantity: 1200, price: 45.5, vat: 20, total: 54600, warehouseCode: '01' }
      ]
    }
  ];

  app.get("/api/salesinvoices", (req, res) => res.json(salesInvoices));
  app.get("/api/salesinvoices/next-no", (req, res) => {
    const prefix = "EIR";
    const year = new Date().getFullYear().toString();
    const fullPrefix = prefix + year; // e.g. EIR2024
    
    const eirInvoices = salesInvoices
      .filter(i => i.invoiceNo && i.invoiceNo.startsWith(fullPrefix))
      .sort((a, b) => b.invoiceNo.localeCompare(a.invoiceNo));

    if (eirInvoices.length === 0) {
      return res.json({ nextNo: fullPrefix + "00000001" });
    }

    const lastNo = eirInvoices[0].invoiceNo;
    const numberPart = lastNo.replace(fullPrefix, "");
    const nextNum = (parseInt(numberPart) || 0) + 1;
    const nextNo = fullPrefix + nextNum.toString().padStart(8, '0');
    
    res.json({ nextNo });
  });
  app.get("/api/salesinvoices/:invoiceNo", (req, res) => {
    const inv = salesInvoices.find(i => i.invoiceNo === req.params.invoiceNo);
    if (inv) res.json(inv);
    else res.status(404).json({ message: "İrsaliye bulunamadı" });
  });

  app.get("/api/salesinvoices/:invoiceNo/ewaybill", (req, res) => {
    // Mock e-waybill data based on the VB.NET code provided by the user
    res.json({
      gibInvoiceNo: 'GIB' + new Date().getFullYear() + '000000123',
      carrierName: 'MNG Kargo',
      licensePlateId: '34 ABC 123',
      driverFirstName: 'Ahmet',
      driverLastName: 'Yılmaz',
      carrierSubCity: 'Şişli',
      carrierCity: 'İstanbul',
      carrierVkn: '1234567890',
      driverNid: '12345678901',
      carrierPostal: '34360'
    });
  });

  app.post("/api/salesinvoices", (req, res) => {
    const data = req.body;
    const docDate = new Date(data.date || new Date());
    
    // Proje koduna göre STHAR_KOD1 (Özel Kod 1) belirleme
    let stharKod1 = "";
    if (data.projectCode) {
      if (data.projectCode.startsWith("3")) stharKod1 = "F";
      else if (data.projectCode.startsWith("2")) stharKod1 = "S";
      else if (data.projectCode.startsWith("1")) stharKod1 = "M";
    }
    
    // Netsis Beklentilerine Göre Veri Zenginleştirme
    const enrichedData = {
      ...data,
      id: data.invoiceNo,
      gibInvoiceNo: "",
      deliveryDate: data.deliveryDate || data.date,
      recordedBy: 'FLEX_WMS',
      createdAt: new Date().toISOString(),
      // NOT: Kullanıcı talebi üzerine TBLCAHAR (Cari Hareket) kaydı yapılmıyor.
      // Sadece TBLFATUIRS ve TBLSTHAR simüle ediliyor.
      items: (data.items || []).map((item: any, index: number) => {
        const lineBrut = (item.quantity || 0) * (item.price || 0);
        return {
          ...item,
          invoiceNo: data.invoiceNo,    // TBLSTHAR.FISNO
          customerCode: data.customerCode, // TBLSTHAR.STHAR_CARIKOD
          date: data.date,              // TBLSTHAR.STHAR_TARIH
          sthar_htur: 'J',              // Netsis Standart: İrsaliye Satırı
          sthar_gckod: 'C',             // Netsis Standart: Çıkış
          sthar_bgtip: 'I',             // Netsis Standart: İrsaliye
          update_kodu: 'F',             // Netsis Standart: Fatura/İrsaliye
          sthar_kod1: stharKod1,        // Özel Kod 1
          sthar_aciklama: data.customerCode, // TBLSTHAR.STHAR_ACIKLAMA (Cari Kodu Yazmalı)
          lineNo: index + 1             // TBLSTHAR.SIRA
        };
      })
    };

    salesInvoices.push(enrichedData);
    res.json({ 
      success: true, 
      message: "Satış irsaliyesi Netsis'e (Sim) kaydedildi.",
      invoiceNo: data.invoiceNo 
    });
  });

  app.delete("/api/salesinvoices/:invoiceNo", (req, res) => {
    const { invoiceNo } = req.params;
    salesInvoices = salesInvoices.filter(i => i.invoiceNo !== invoiceNo);
    res.json({ success: true, message: "İrsaliye silindi." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
