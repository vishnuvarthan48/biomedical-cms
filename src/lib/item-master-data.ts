// Shared Item Master data – single source of truth used by Item Master, GRN, and other modules.

export interface ItemMaster {
  id: string;
  hospital: string;
  department: string;
  storeId: string;
  itemType: string;
  itemName: string;
  partNumber: string;
  compatibleDevices: string[];
  description: string;
  itemCode: string;
  catalogueNumber: string;
  manufacturer: string;
  stockUom: string;
  purchaseUom: string;
  rackNumber: string;
  shelfNumber: string;
  reorderLevel: number;
  minOrderQty: number;
  reorderTime: string;
  batchRequired: boolean;
  expiryRequired: boolean;
  serialTracking: boolean;
  status: "Active" | "Inactive";
  currentStock: number;
  createdAt: string;
}

export const mockItems: ItemMaster[] = [
  {
    id: "ITM-001",
    hospital: "Apollo Hospital - Chennai",
    department: "Biomedical",
    storeId: "STR-001",
    itemType: "Spare",
    itemName: "SpO2 Sensor Cable",
    partNumber: "PHI-SPO2-M1191B",
    compatibleDevices: ["Patient Monitor"],
    description: "Reusable SpO2 sensor cable for Philips IntelliVue monitors",
    itemCode: "BIO-SPR-001",
    catalogueNumber: "M1191B",
    manufacturer: "Philips Medical",
    stockUom: "Piece",
    purchaseUom: "Piece",
    rackNumber: "R-01",
    shelfNumber: "S-03",
    reorderLevel: 5,
    minOrderQty: 2,
    reorderTime: "14 days",
    batchRequired: false,
    expiryRequired: false,
    serialTracking: true,
    status: "Active",
    currentStock: 12,
    createdAt: "2025-01-15",
  },
  {
    id: "ITM-002",
    hospital: "Apollo Hospital - Chennai",
    department: "Biomedical",
    storeId: "STR-001",
    itemType: "Consumable",
    itemName: "ECG Electrode Pads",
    partNumber: "3M-2560-ECG",
    compatibleDevices: ["Patient Monitor", "Defibrillator"],
    description: "Disposable ECG monitoring electrode pads",
    itemCode: "BIO-CON-001",
    catalogueNumber: "2560",
    manufacturer: "3M Healthcare",
    stockUom: "Box (50)",
    purchaseUom: "Box (50)",
    rackNumber: "R-02",
    shelfNumber: "S-01",
    reorderLevel: 20,
    minOrderQty: 10,
    reorderTime: "7 days",
    batchRequired: true,
    expiryRequired: true,
    serialTracking: false,
    status: "Active",
    currentStock: 8,
    createdAt: "2025-01-15",
  },
  {
    id: "ITM-003",
    hospital: "Apollo Hospital - Chennai",
    department: "Biomedical",
    storeId: "STR-001",
    itemType: "Spare",
    itemName: "Ventilator Flow Sensor",
    partNumber: "DRG-FS-8412960",
    compatibleDevices: ["Ventilator"],
    description: "Flow sensor for Draeger Evita ventilator series",
    itemCode: "BIO-SPR-002",
    catalogueNumber: "8412960",
    manufacturer: "Draeger",
    stockUom: "Piece",
    purchaseUom: "Piece",
    rackNumber: "R-01",
    shelfNumber: "S-05",
    reorderLevel: 3,
    minOrderQty: 1,
    reorderTime: "21 days",
    batchRequired: false,
    expiryRequired: false,
    serialTracking: true,
    status: "Active",
    currentStock: 4,
    createdAt: "2025-02-01",
  },
  {
    id: "ITM-004",
    hospital: "Apollo Hospital - Chennai",
    department: "Biomedical",
    storeId: "STR-001",
    itemType: "Accessory",
    itemName: "NIBP Cuff (Adult)",
    partNumber: "PHI-NIBP-M1574A",
    compatibleDevices: ["Patient Monitor"],
    description: "Reusable adult NIBP cuff for Philips monitors",
    itemCode: "BIO-ACC-001",
    catalogueNumber: "M1574A",
    manufacturer: "Philips Medical",
    stockUom: "Piece",
    purchaseUom: "Piece",
    rackNumber: "R-03",
    shelfNumber: "S-02",
    reorderLevel: 4,
    minOrderQty: 2,
    reorderTime: "10 days",
    batchRequired: false,
    expiryRequired: false,
    serialTracking: false,
    status: "Active",
    currentStock: 2,
    createdAt: "2025-02-10",
  },
  {
    id: "ITM-005",
    hospital: "Apollo Hospital - Delhi",
    department: "Biomedical",
    storeId: "STR-003",
    itemType: "Consumable",
    itemName: "Defibrillator Pads (Adult)",
    partNumber: "PHI-DEF-M3713A",
    compatibleDevices: ["Defibrillator"],
    description: "Disposable defibrillator electrode pads",
    itemCode: "BIO-CON-002",
    catalogueNumber: "M3713A",
    manufacturer: "Philips Medical",
    stockUom: "Pair",
    purchaseUom: "Pair",
    rackNumber: "R-01",
    shelfNumber: "S-01",
    reorderLevel: 10,
    minOrderQty: 5,
    reorderTime: "7 days",
    batchRequired: true,
    expiryRequired: true,
    serialTracking: false,
    status: "Active",
    currentStock: 15,
    createdAt: "2025-03-05",
  },
  {
    id: "ITM-006",
    hospital: "Apollo Hospital - Chennai",
    department: "Biomedical",
    storeId: "STR-001",
    itemType: "Spare",
    itemName: "Infusion Pump Battery",
    partNumber: "BD-BAT-INF-320",
    compatibleDevices: ["Infusion Pump"],
    description: "Rechargeable battery pack for BD Alaris infusion pumps",
    itemCode: "BIO-SPR-003",
    catalogueNumber: "INF-320",
    manufacturer: "BD (Becton Dickinson)",
    stockUom: "Piece",
    purchaseUom: "Piece",
    rackNumber: "R-02",
    shelfNumber: "S-04",
    reorderLevel: 6,
    minOrderQty: 3,
    reorderTime: "14 days",
    batchRequired: false,
    expiryRequired: false,
    serialTracking: true,
    status: "Inactive",
    currentStock: 0,
    createdAt: "2025-03-15",
  },
];
