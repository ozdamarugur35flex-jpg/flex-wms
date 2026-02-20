import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- MOCK DATABASE (Netsis Simülasyonu) ---
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
      purchaseVat: 20,
      salesVat: 20,
      quantity: 1500,
      minStockLevel: 500,
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
      lastPurchasePrice: 120.50
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

  // [GET] /api/stocks/min-levels
  app.get("/api/stocks/min-levels", (req, res) => {
    const minStocks = stocks.filter(s => s.quantity < s.minStockLevel);
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
    res.json([
      { id: 'C001', code: 'C001', name: 'Aksoy Metal Ltd.', type: 'Satıcı', locationType: 'Yurt İçi' },
      { id: 'C002', code: 'C002', name: 'Global Trading Co.', type: 'Satıcı', locationType: 'Yurt Dışı' }
    ]);
  });

  // [GET] /api/warehouses
  app.get("/api/warehouses", (req, res) => {
    res.json([
      { id: '1', code: '01', name: 'Merkez Depo', isLocked: false, isLocationTracking: true },
      { id: '2', code: '02', name: 'Hammadde Depo', isLocked: false, isLocationTracking: true }
    ]);
  });

  // [GET] /api/warehouses/locations
  app.get("/api/warehouses/locations", (req, res) => {
    res.json([
      { id: 'L1', warehouseCode: '01', cellCode: 'A-01-01', status: 'Boş', fillRate: 0 },
      { id: 'L2', warehouseCode: '01', cellCode: 'A-01-02', status: 'Dolu', fillRate: 100 }
    ]);
  });

  // [GET] /api/warehouses/capacities
  app.get("/api/warehouses/capacities", (req, res) => {
    res.json([
      { id: 'CP1', warehouseCode: '01', stockGroupCode: 'HAMMADDE', maxCapacity: 10000, currentQuantity: 4500, unit: 'ADET', warningThreshold: 80 }
    ]);
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
