// ============================================================================
// SBS GROUPS — PRODUCTS DATA  (FK-NORMALIZED, import as "@/data/products")
// ----------------------------------------------------------------------------
// The catalogue is stored as FOUR FLAT TABLES linked by foreign keys:
//
//   PRODUCT_CATEGORIES      (id, name, image, icon)
//   PRODUCT_SUBCATEGORIES   (id, categoryId →category, name, image)
//   PRODUCT_DISTRIBUTORS    (id, slug, name)            // brand registry
//   PRODUCTS                (id, categoryId, subcategoryId, distributorId, …)
//
// This file rebuilds the SAME nested `categories` tree the public UI already
// uses, plus every existing helper — so NO public-UI changes are needed.
// Editing data now means editing flat rows, not a deep nested blob.
// ============================================================================

// ---------------------------------------------------------------------------
// 1. FLAT TABLES (edit these — relations are by id)
// ---------------------------------------------------------------------------
export const PRODUCT_CATEGORIES = [
  {
    "id": "CAT-001",
    "name": "Hand Tools",
    "image": "https://sbsgroups.co.in/assets/safety-3wpGxgY5.webp",
    "icon": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "CAT-002",
    "name": "Power Tools",
    "image": "",
    "icon": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "CAT-003",
    "name": "Safety Equipment",
    "image": "",
    "icon": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "CAT-004",
    "name": "Chemicals & Lubricants",
    "image": "",
    "icon": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "CAT-005",
    "name": "Lifting & Rigging",
    "image": "",
    "icon": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  }
];

export const PRODUCT_SUBCATEGORIES = [
  {
    "id": "SUBCAT-001",
    "categoryId": "CAT-001",
    "name": "Drill & Screw Bit Set",
    "image": "https://images.unsplash.com/photo-1508847154043-be12a62861c1?auto=format&fit=crop&q=80&w=500",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "SUBCAT-002",
    "categoryId": "CAT-001",
    "name": "Sockets & Ratchets",
    "image": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "SUBCAT-003",
    "categoryId": "CAT-002",
    "name": "Drills & Drivers",
    "image": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "SUBCAT-004",
    "categoryId": "CAT-002",
    "name": "Grinders & Saws",
    "image": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "SUBCAT-005",
    "categoryId": "CAT-003",
    "name": "Protective Gear",
    "image": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "SUBCAT-006",
    "categoryId": "CAT-003",
    "name": "Electrical Safety",
    "image": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "SUBCAT-007",
    "categoryId": "CAT-004",
    "name": "Lubricants & Oils",
    "image": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "SUBCAT-008",
    "categoryId": "CAT-004",
    "name": "Cleaning & Maintenance",
    "image": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "SUBCAT-009",
    "categoryId": "CAT-005",
    "name": "Slings & Webbing",
    "image": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "SUBCAT-010",
    "categoryId": "CAT-005",
    "name": "Hoists & Pulleys",
    "image": "",
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  }
];

export const PRODUCT_DISTRIBUTORS = [
  {
    "id": "DIST-001",
    "slug": "makita",
    "name": "Makita"
  },
  {
    "id": "DIST-002",
    "slug": "stahlwille",
    "name": "Stahlwille"
  },
  {
    "id": "DIST-003",
    "slug": "ridgid",
    "name": "Ridgid"
  },
  {
    "id": "DIST-004",
    "slug": "snap-on",
    "name": "Snap-on"
  },
  {
    "id": "DIST-005",
    "slug": "sata",
    "name": "Sata"
  },
  {
    "id": "DIST-006",
    "slug": "wera",
    "name": "Wera"
  },
  {
    "id": "DIST-007",
    "slug": "bosch",
    "name": "Bosch"
  },
  {
    "id": "DIST-008",
    "slug": "dewalt",
    "name": "DeWalt"
  },
  {
    "id": "DIST-009",
    "slug": "irwin",
    "name": "Irwin"
  },
  {
    "id": "DIST-010",
    "slug": "festool",
    "name": "Festool"
  },
  {
    "id": "DIST-011",
    "slug": "3m",
    "name": "3M"
  },
  {
    "id": "DIST-012",
    "slug": "timberland-pro",
    "name": "Timberland PRO"
  },
  {
    "id": "DIST-013",
    "slug": "karam",
    "name": "Karam"
  },
  {
    "id": "DIST-014",
    "slug": "uvex",
    "name": "Uvex"
  },
  {
    "id": "DIST-015",
    "slug": "ansell",
    "name": "Ansell"
  },
  {
    "id": "DIST-016",
    "slug": "wiha",
    "name": "Wiha"
  },
  {
    "id": "DIST-017",
    "slug": "fluke",
    "name": "Fluke"
  },
  {
    "id": "DIST-018",
    "slug": "eaton",
    "name": "Eaton"
  },
  {
    "id": "DIST-019",
    "slug": "shell",
    "name": "Shell"
  },
  {
    "id": "DIST-020",
    "slug": "mobil",
    "name": "Mobil"
  },
  {
    "id": "DIST-021",
    "slug": "wd-40",
    "name": "WD-40"
  },
  {
    "id": "DIST-022",
    "slug": "castrol",
    "name": "Castrol"
  },
  {
    "id": "DIST-023",
    "slug": "cortland",
    "name": "Cortland"
  },
  {
    "id": "DIST-024",
    "slug": "pewag",
    "name": "Pewag"
  },
  {
    "id": "DIST-025",
    "slug": "bridon",
    "name": "Bridon"
  },
  {
    "id": "DIST-026",
    "slug": "kito",
    "name": "Kito"
  },
  {
    "id": "DIST-027",
    "slug": "harrington",
    "name": "Harrington"
  },
  {
    "id": "DIST-028",
    "slug": "coffing",
    "name": "Coffing"
  }
];

export const PRODUCTS = [
  {
    "id": "PROD-0001",
    "categoryId": "CAT-001",
    "subcategoryId": "SUBCAT-001",
    "distributorId": "DIST-001",
    "model": "E-11689",
    "name": "Drill and Screw Bit Set",
    "keyFeatures": "256pcs Bit & hand tool, set C-form & E-form, MZ, mm size",
    "brand": "Makita",
    "manufacturer": "Makita, India",
    "material": "Steel Metal",
    "specifications": {
      "pecies": "200 and UP",
      "packageDesign": "General",
      "salesPackageQuantity": "256",
      "setContents": "45xHSS-R drill bit:4*1mm, 4*1.5mm, 6*2mm, 3*2.5mm, 6*3mm, 2*3.2mm, 4*3.5mm, 6*4mm, 3*4.5mm, 2*5mm, 5.5mm, 6mm, 7mm, 7.5mm, 8mm, 8*brad point drill, bit:3mm, 4mm, 5mm, 6mm, 7mm, 8mm, 9mm, 10mm, 5*flat bit:12mm, 16mm, 20mm, 22mm, 25mm, 9*masonry drill bit: 3mm, 4mm, 5mm, 6mm, 7mm, 2*8mm, 2*10mm, 1*countersink bit, 1*diameter guage, 4*depth guage: 3mm, 5mm, 8mm, 10mm, 4*hole saw:32mm, 38mm, 45mm, 54mm, 1*hole saw adapter, 110*screw bit"
    },
    "certifications": [
      "ISO 6913",
      "BS 4757",
      "BIS",
      "ISI"
    ],
    "images": [
      {
        "title": "",
        "url": "https://makita.in/wp-content/uploads/2024/06/E-11689.jpg",
        "angle": "Front View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://makita.in/wp-content/uploads/2024/06/E-08713.jpg",
        "angle": "Side View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://makita.in/wp-content/uploads/2024/06/D-42313-6.jpg",
        "angle": "Top View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://makita.in/wp-content/uploads/2024/06/E-08458.jpg",
        "angle": "Grip Detail",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0002",
    "categoryId": "CAT-001",
    "subcategoryId": "SUBCAT-001",
    "distributorId": "DIST-002",
    "model": "",
    "name": "Set of Combination Wrenches (6-32mm)",
    "keyFeatures": "SAE & Metric, Mirror polished",
    "brand": "Stahlwille",
    "manufacturer": "Stahlwille Tools, Germany",
    "material": "Chrome Vanadium Steel",
    "specifications": {},
    "certifications": [
      "ISO 691",
      "DIN 3110",
      "BS 4757"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wrench+Set+View",
        "angle": "Full Set View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wrench+Set+Sizes",
        "angle": "Size Range",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wrench+Set+Close",
        "angle": "Close-up",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wrench+Set+Detail",
        "angle": "Polish Detail",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0003",
    "categoryId": "CAT-001",
    "subcategoryId": "SUBCAT-001",
    "distributorId": "DIST-003",
    "model": "",
    "name": "Pipe Wrench Heavy Duty (18-inch)",
    "keyFeatures": "Iron casting, Serrated jaws",
    "brand": "Ridgid",
    "manufacturer": "Ridgid Inc., USA",
    "material": "Iron Casting with Serrated Jaws",
    "specifications": {},
    "certifications": [
      "UL Certified",
      "ANSI B107.14"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Pipe+Wrench+Front",
        "angle": "Front View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Pipe+Wrench+Jaws",
        "angle": "Jaw Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Pipe+Wrench+Open",
        "angle": "Open Position",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Pipe+Wrench+Scale",
        "angle": "Size Reference",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0004",
    "categoryId": "CAT-001",
    "subcategoryId": "SUBCAT-002",
    "distributorId": "DIST-004",
    "model": "",
    "name": "Socket Set 1/2-inch Drive (40 Pieces)",
    "keyFeatures": "Chrome vanadium steel, Metric & SAE",
    "brand": "Snap-on",
    "manufacturer": "Snap-on Inc., USA",
    "material": "Chrome Vanadium Steel",
    "specifications": {},
    "certifications": [
      "ISO 3123",
      "ANSI B107.1"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Socket+Set+Complete",
        "angle": "Complete Set",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Socket+Set+Sizes",
        "angle": "Size Variety",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Socket+Set+Case",
        "angle": "Storage Case",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Socket+Individual",
        "angle": "Individual Socket",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0005",
    "categoryId": "CAT-001",
    "subcategoryId": "SUBCAT-002",
    "distributorId": "DIST-005",
    "model": "",
    "name": "Torque Wrench Click Type 1/2-inch",
    "keyFeatures": "Range 42-210 N·m, Calibrated",
    "brand": "Sata",
    "manufacturer": "Sata Tools, Taiwan",
    "material": "Alloy Steel",
    "specifications": {},
    "certifications": [
      "ISO 6789",
      "DIN 912"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Torque+Wrench+Full",
        "angle": "Full Length",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Torque+Wrench+Head",
        "angle": "Head Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Torque+Wrench+Scale",
        "angle": "Scale View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Torque+Wrench+Handle",
        "angle": "Handle Detail",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0006",
    "categoryId": "CAT-001",
    "subcategoryId": "SUBCAT-002",
    "distributorId": "DIST-006",
    "model": "",
    "name": "Ratchet Handle 3/8-inch 72-Tooth",
    "keyFeatures": "Quick release, Polished finish",
    "brand": "Wera",
    "manufacturer": "Wera Werkzeuge, Germany",
    "material": "Chrome Plated Alloy Steel",
    "specifications": {},
    "certifications": [
      "ISO 3315",
      "DIN 3122"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Ratchet+Complete",
        "angle": "Full View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Ratchet+Head",
        "angle": "Head View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Ratchet+Release",
        "angle": "Quick Release",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Ratchet+Finish",
        "angle": "Polish Detail",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0007",
    "categoryId": "CAT-002",
    "subcategoryId": "SUBCAT-003",
    "distributorId": "DIST-007",
    "model": "",
    "name": "Corded Impact Drill 850W",
    "keyFeatures": "Variable speed, Metal chuck",
    "brand": "Bosch",
    "manufacturer": "Bosch Tools, Germany",
    "material": "Metal Body with Rubber Grip",
    "specifications": {},
    "certifications": [
      "CE Mark",
      "GS Certified",
      "IS 5194"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Drill+Front+View",
        "angle": "Front View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Drill+Side+View",
        "angle": "Side View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Drill+Chuck+Detail",
        "angle": "Chuck Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Drill+In+Use",
        "angle": "Action View",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0008",
    "categoryId": "CAT-002",
    "subcategoryId": "SUBCAT-003",
    "distributorId": "DIST-008",
    "model": "",
    "name": "Cordless Drill-Driver 20V Li-ion",
    "keyFeatures": "2-speed transmission, Compact design",
    "brand": "DeWalt",
    "manufacturer": "DeWalt, USA",
    "material": "Polymer Composite Housing",
    "specifications": {},
    "certifications": [
      "CE Mark",
      "UL Listed"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Cordless+Drill+Front",
        "angle": "Front View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Cordless+Drill+Battery",
        "angle": "Battery View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Cordless+Drill+Chuck",
        "angle": "Chuck Close-up",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Cordless+Drill+Controls",
        "angle": "Control Panel",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0009",
    "categoryId": "CAT-002",
    "subcategoryId": "SUBCAT-003",
    "distributorId": "DIST-009",
    "model": "",
    "name": "Drill Bit Set HSS 1-10mm (50pcs)",
    "keyFeatures": "Titanium coated, Precision ground",
    "brand": "Irwin",
    "manufacturer": "Irwin Industrial Tools, USA",
    "material": "High Speed Steel (HSS) Titanium Coated",
    "specifications": {},
    "certifications": [
      "ISO 1412",
      "DIN 338"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Drill+Bits+Set+Full",
        "angle": "Complete Set",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Drill+Bits+Organized",
        "angle": "Organized View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Drill+Bits+Individual",
        "angle": "Individual Bit",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Drill+Bits+Coating",
        "angle": "Titanium Coating",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0010",
    "categoryId": "CAT-002",
    "subcategoryId": "SUBCAT-004",
    "distributorId": "DIST-001",
    "model": "",
    "name": "Angle Grinder 4.5-inch 950W",
    "keyFeatures": "Guard included, Soft start",
    "brand": "Makita",
    "manufacturer": "Makita Corporation, Japan",
    "material": "Metal Body with Soft Grip",
    "specifications": {},
    "certifications": [
      "CE Mark",
      "IS 5194",
      "GS Certified"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Angle+Grinder+Front",
        "angle": "Front View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Angle+Grinder+Guard",
        "angle": "Guard Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Angle+Grinder+Side",
        "angle": "Side View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Angle+Grinder+Disc",
        "angle": "Disc Area",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0011",
    "categoryId": "CAT-002",
    "subcategoryId": "SUBCAT-004",
    "distributorId": "DIST-010",
    "model": "",
    "name": "Circular Saw 7.25-inch 1500W",
    "keyFeatures": "Laser guide, Dust blower",
    "brand": "Festool",
    "manufacturer": "Festool GmbH, Germany",
    "material": "Magnesium Alloy Housing",
    "specifications": {},
    "certifications": [
      "CE Mark",
      "GS Certified"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Circular+Saw+Front",
        "angle": "Front View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Circular+Saw+Blade",
        "angle": "Blade View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Circular+Saw+Laser",
        "angle": "Laser Guide",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Circular+Saw+Handle",
        "angle": "Handle Detail",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0012",
    "categoryId": "CAT-002",
    "subcategoryId": "SUBCAT-004",
    "distributorId": "DIST-011",
    "model": "",
    "name": "Grinding Disc 4.5x6mm (10pcs)",
    "keyFeatures": "For metal, Stone & Steel",
    "brand": "3M",
    "manufacturer": "3M Abrasive Systems, USA",
    "material": "Aluminum Oxide Abrasive",
    "specifications": {},
    "certifications": [
      "ISO 12413",
      "ANSI B24.1"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Grinding+Disc+Pack",
        "angle": "Pack View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Grinding+Disc+Stack",
        "angle": "Stacked View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Grinding+Disc+Surface",
        "angle": "Surface Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Grinding+Disc+Edge",
        "angle": "Edge View",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0013",
    "categoryId": "CAT-003",
    "subcategoryId": "SUBCAT-005",
    "distributorId": "DIST-012",
    "model": "",
    "name": "Industrial Safety Leather Boots (Grade A)",
    "keyFeatures": "Steel toe, Anti-slip sole",
    "brand": "Timberland PRO",
    "manufacturer": "Timberland Company, USA",
    "material": "Premium Leather with Steel Toe Cap",
    "specifications": {},
    "certifications": [
      "IS 1035",
      "CE 344:2004"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Boots+Pair",
        "angle": "Full Pair",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Boots+Side",
        "angle": "Side View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Boots+Toe",
        "angle": "Steel Toe Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Boots+Sole",
        "angle": "Anti-slip Sole",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0014",
    "categoryId": "CAT-003",
    "subcategoryId": "SUBCAT-005",
    "distributorId": "DIST-013",
    "model": "",
    "name": "Safety Helmet ABS Yellow",
    "keyFeatures": "Impact resistant, Adjustable headband",
    "brand": "Karam",
    "manufacturer": "Karam Industries, India",
    "material": "ABS Plastic Shell with EPS Liner",
    "specifications": {},
    "certifications": [
      "IS 2925",
      "CE 397"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Helmet+Front",
        "angle": "Front View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Helmet+Side",
        "angle": "Side View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Helmet+Interior",
        "angle": "Interior Padding",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Helmet+Headband",
        "angle": "Adjustable Band",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0015",
    "categoryId": "CAT-003",
    "subcategoryId": "SUBCAT-005",
    "distributorId": "DIST-014",
    "model": "",
    "name": "Safety Goggles Anti-fog Clear Lens",
    "keyFeatures": "Polycarbonate, UV protection",
    "brand": "Uvex",
    "manufacturer": "Uvex Group, Germany",
    "material": "Polycarbonate Lens with Soft Frame",
    "specifications": {},
    "certifications": [
      "IS 1835",
      "CE 166"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Goggles+Front",
        "angle": "Front View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Goggles+Lens",
        "angle": "Lens Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Goggles+Side",
        "angle": "Side Profile",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Goggles+Coated",
        "angle": "Anti-fog Coating",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0016",
    "categoryId": "CAT-003",
    "subcategoryId": "SUBCAT-006",
    "distributorId": "DIST-015",
    "model": "",
    "name": "Insulated Electrical Rubber Gloves (Class 3)",
    "keyFeatures": "Working voltage 26,500V AC, Proof tested",
    "brand": "Ansell",
    "manufacturer": "Ansell Limited, Australia",
    "material": "Natural Rubber with Canvas Backing",
    "specifications": {},
    "certifications": [
      "IS 6050",
      "IEC 60903",
      "EN 60903"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Gloves+Pair",
        "angle": "Full Pair",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Gloves+Single",
        "angle": "Single Glove",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Gloves+Texture",
        "angle": "Grip Texture",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Safety+Gloves+Detail",
        "angle": "Material Detail",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0017",
    "categoryId": "CAT-003",
    "subcategoryId": "SUBCAT-006",
    "distributorId": "DIST-016",
    "model": "",
    "name": "Insulated Screwdriver Set (6pcs)",
    "keyFeatures": "1000V rated, Cushioned grip",
    "brand": "Wiha",
    "manufacturer": "Wiha Tools, Germany",
    "material": "Chrome Vanadium with Insulation",
    "specifications": {},
    "certifications": [
      "IS 2848",
      "CE 1010",
      "IEC 60900"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Screwdriver+Set+Full",
        "angle": "Complete Set",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Screwdriver+Set+Individual",
        "angle": "Individual Tool",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Screwdriver+Set+Grip",
        "angle": "Grip Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Screwdriver+Set+Tips",
        "angle": "Tip Variety",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0018",
    "categoryId": "CAT-003",
    "subcategoryId": "SUBCAT-006",
    "distributorId": "DIST-017",
    "model": "",
    "name": "Live Wire Detector Non-contact",
    "keyFeatures": "12-1000V detection range, LED indicator",
    "brand": "Fluke",
    "manufacturer": "Fluke Corporation, USA",
    "material": "ABS Plastic with Metal Tip",
    "specifications": {},
    "certifications": [
      "CE Mark",
      "UL Listed"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wire+Detector+Full",
        "angle": "Full View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wire+Detector+Tip",
        "angle": "Detection Tip",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wire+Detector+LED",
        "angle": "LED Indicator",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wire+Detector+Controls",
        "angle": "Control Button",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0019",
    "categoryId": "CAT-004",
    "subcategoryId": "SUBCAT-007",
    "distributorId": "DIST-018",
    "model": "",
    "name": "High-Pressure Hydraulic Lubrication Pump 10L",
    "keyFeatures": "Max pressure 400 Bar, 3-Phase motor",
    "brand": "Eaton",
    "manufacturer": "Eaton Hydraulics, USA",
    "material": "Cast Iron Pump Body",
    "specifications": {},
    "certifications": [
      "ISO 4414",
      "CE Mark"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Hydraulic+Pump+Full",
        "angle": "Full Assembly",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Hydraulic+Pump+Top",
        "angle": "Top View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Hydraulic+Pump+Valve",
        "angle": "Valve Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Hydraulic+Pump+Motor",
        "angle": "Motor View",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0020",
    "categoryId": "CAT-004",
    "subcategoryId": "SUBCAT-007",
    "distributorId": "DIST-019",
    "model": "",
    "name": "Machine Oil Premium Grade 20L",
    "keyFeatures": "ISO VG 46, Anti-oxidant",
    "brand": "Shell",
    "manufacturer": "Shell Global, Netherlands",
    "material": "Mineral Oil Blend",
    "specifications": {},
    "certifications": [
      "ISO 6743",
      "ASTM D4378"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Machine+Oil+Canister",
        "angle": "Product Canister",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Machine+Oil+Label",
        "angle": "Label Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Machine+Oil+Pour",
        "angle": "Pouring View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Machine+Oil+Clarity",
        "angle": "Oil Clarity",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0021",
    "categoryId": "CAT-004",
    "subcategoryId": "SUBCAT-007",
    "distributorId": "DIST-020",
    "model": "",
    "name": "Grease Multi-purpose NLGI 2 (400g)",
    "keyFeatures": "EP additives, Water resistant",
    "brand": "Mobil",
    "manufacturer": "Mobil Corporation, USA",
    "material": "Lithium Complex Soap Grease",
    "specifications": {},
    "certifications": [
      "NLGI Grade 2",
      "ISO 6743"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Grease+Container",
        "angle": "Product Container",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Grease+Texture",
        "angle": "Grease Texture",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Grease+Dispense",
        "angle": "Dispensing",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Grease+Application",
        "angle": "Application View",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0022",
    "categoryId": "CAT-004",
    "subcategoryId": "SUBCAT-008",
    "distributorId": "DIST-021",
    "model": "",
    "name": "Aerosol Anti-Rust Spray Premium (Case of 24)",
    "keyFeatures": "Moisture displacement, 400ml cans",
    "brand": "WD-40",
    "manufacturer": "WD-40 Company, USA",
    "material": "Aerosol Spray Formulation",
    "specifications": {},
    "certifications": [
      "ISO 6743",
      "ASTM D1003"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Anti+Rust+Spray+Case",
        "angle": "Case View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Anti+Rust+Spray+Can",
        "angle": "Single Can",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Anti+Rust+Spray+Nozzle",
        "angle": "Spray Nozzle",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Anti+Rust+Spray+Label",
        "angle": "Label Detail",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0023",
    "categoryId": "CAT-004",
    "subcategoryId": "SUBCAT-008",
    "distributorId": "DIST-022",
    "model": "",
    "name": "Degreaser Industrial Strength 5L",
    "keyFeatures": "Biodegradable, Fast acting",
    "brand": "Castrol",
    "manufacturer": "Castrol Limited, UK",
    "material": "Alkaline Degreasing Concentrate",
    "specifications": {},
    "certifications": [
      "ISO 6743",
      "REACH Compliant"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Degreaser+Container",
        "angle": "Container View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Degreaser+Label",
        "angle": "Label Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Degreaser+Dilution",
        "angle": "Dilution Chart",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Degreaser+Action",
        "angle": "Cleaning Action",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0024",
    "categoryId": "CAT-004",
    "subcategoryId": "SUBCAT-008",
    "distributorId": "DIST-011",
    "model": "",
    "name": "Metal Cleaner Polish 500ml",
    "keyFeatures": "Stainless steel safe, Streak-free",
    "brand": "3M",
    "manufacturer": "3M Company, USA",
    "material": "Abrasive Cleaning Compound",
    "specifications": {},
    "certifications": [
      "ISO 6743",
      "ASTM D2240"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Metal+Polish+Bottle",
        "angle": "Bottle View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Metal+Polish+Polish",
        "angle": "Polish Texture",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Metal+Polish+Before",
        "angle": "Before Cleaning",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Metal+Polish+After",
        "angle": "After Polishing",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0025",
    "categoryId": "CAT-005",
    "subcategoryId": "SUBCAT-009",
    "distributorId": "DIST-023",
    "model": "",
    "name": "Heavy Duty Lifting Textile Webbing Sling 5T",
    "keyFeatures": "Duplex factor 7:1, Polyester material",
    "brand": "Cortland",
    "manufacturer": "Cortland Limited, USA",
    "material": "High-Strength Polyester Webbing",
    "specifications": {},
    "certifications": [
      "ISO 7189",
      "EN 1492"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Webbing+Sling+Full",
        "angle": "Full Length",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Webbing+Sling+Weave",
        "angle": "Weave Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Webbing+Sling+Eye",
        "angle": "Eye Loop",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Webbing+Sling+Stitching",
        "angle": "Stitching Detail",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0026",
    "categoryId": "CAT-005",
    "subcategoryId": "SUBCAT-009",
    "distributorId": "DIST-024",
    "model": "",
    "name": "Chain Sling Grade 100 5T",
    "keyFeatures": "Alloy steel, Calibrated links",
    "brand": "Pewag",
    "manufacturer": "Pewag Group, Austria",
    "material": "Alloy Steel Grade 100",
    "specifications": {},
    "certifications": [
      "EN 818",
      "ISO 3077"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Chain+Sling+Full",
        "angle": "Full Chain",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Chain+Sling+Link",
        "angle": "Link Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Chain+Sling+Hook",
        "angle": "Hook Assembly",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Chain+Sling+Marks",
        "angle": "Grade Markings",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0027",
    "categoryId": "CAT-005",
    "subcategoryId": "SUBCAT-009",
    "distributorId": "DIST-025",
    "model": "",
    "name": "Wire Rope Sling 6x19 8mm 10T",
    "keyFeatures": "IWRC core, Certified safe working load",
    "brand": "Bridon",
    "manufacturer": "Bridon International, UK",
    "material": "Steel Wire Rope 6×19 IWRC",
    "specifications": {},
    "certifications": [
      "ISO 2061",
      "EN 10017"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wire+Rope+Full",
        "angle": "Full Length",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wire+Rope+Strands",
        "angle": "Strand Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wire+Rope+Termination",
        "angle": "Termination",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Wire+Rope+Close",
        "angle": "Close-up View",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0028",
    "categoryId": "CAT-005",
    "subcategoryId": "SUBCAT-010",
    "distributorId": "DIST-026",
    "model": "",
    "name": "Manual Chain Block 2T",
    "keyFeatures": "Load chain Grade 80, Swivel hook",
    "brand": "Kito",
    "manufacturer": "Kito Corporation, Japan",
    "material": "Ductile Iron Body",
    "specifications": {},
    "certifications": [
      "ISO 4488",
      "EN 14491"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Chain+Block+Full",
        "angle": "Full Unit",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Chain+Block+Hook",
        "angle": "Hook Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Chain+Block+Chain",
        "angle": "Load Chain",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Chain+Block+Handle",
        "angle": "Handle View",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0029",
    "categoryId": "CAT-005",
    "subcategoryId": "SUBCAT-010",
    "distributorId": "DIST-027",
    "model": "",
    "name": "Pulley Steel 4-inch Fixed Eye",
    "keyFeatures": "Ball bearing, Powder coated",
    "brand": "Harrington",
    "manufacturer": "Harrington Hoists, USA",
    "material": "Steel Body with Ball Bearing",
    "specifications": {},
    "certifications": [
      "ASME B29.1",
      "EN 14491"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Pulley+Front",
        "angle": "Front View",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Pulley+Side",
        "angle": "Side Profile",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Pulley+Eye",
        "angle": "Eye Loop",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Pulley+Bearing",
        "angle": "Ball Bearing",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  },
  {
    "id": "PROD-0030",
    "categoryId": "CAT-005",
    "subcategoryId": "SUBCAT-010",
    "distributorId": "DIST-028",
    "model": "",
    "name": "Come-Along Tool 2T Mechanical",
    "keyFeatures": "Dual pawl, Ratchet operation",
    "brand": "Coffing",
    "manufacturer": "Coffing Hoists, USA",
    "material": "Cast Iron with Steel Pawls",
    "specifications": {},
    "certifications": [
      "ASME B30.20",
      "EN 14491"
    ],
    "images": [
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Come+Along+Full",
        "angle": "Full Assembly",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Come+Along+Lever",
        "angle": "Lever Detail",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Come+Along+Pawl",
        "angle": "Pawl Mechanism",
        "alternateText": ""
      },
      {
        "title": "",
        "url": "https://via.placeholder.com/500x500?text=Come+Along+Hook",
        "angle": "Hook Assembly",
        "alternateText": ""
      }
    ],
    "createdAt": "2026-06-15T00:00:00.000Z",
    "updatedAt": "2026-06-15T00:00:00.000Z"
  }
];

// ---------------------------------------------------------------------------
// 2. DERIVED NESTED TREE  (built from the flat tables at module load)
//    Shape is identical to the previous `categories` export, so existing
//    imports (OurSolutionsGrid, etc.) keep working unchanged.
// ---------------------------------------------------------------------------
export const categories = PRODUCT_CATEGORIES.map((cat) => {
  const subs = PRODUCT_SUBCATEGORIES.filter((s) => s.categoryId === cat.id).map(
    (sub) => {
      const subProducts = PRODUCTS.filter((p) => p.subcategoryId === sub.id);
      const distIds = [...new Set(subProducts.map((p) => p.distributorId))];
      const distributors = distIds.map((did) => {
        const d = PRODUCT_DISTRIBUTORS.find((x) => x.id === did) || {};
        const products = subProducts.filter((p) => p.distributorId === did);
        return {
          id: did,
          slug: d.slug,
          name: d.name,
          categoryId: cat.id,
          subcategoryId: sub.id,
          productCount: products.length,
          products,
        };
      });
      return {
        id: sub.id,
        categoryId: cat.id,
        name: sub.name,
        image: sub.image,
        distributorIds: distIds,
        distributorCount: distributors.length,
        productCount: subProducts.length,
        distributors,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      };
    }
  );
  const allDistIds = [...new Set(subs.flatMap((s) => s.distributorIds))];
  return {
    id: cat.id,
    name: cat.name,
    image: cat.image,
    icon: cat.icon,
    distributorIds: allDistIds,
    subcategoriesCount: subs.length,
    subcategories: subs,
    createdAt: cat.createdAt,
    updatedAt: cat.updatedAt,
  };
});

// ---------------------------------------------------------------------------
// BRAND REGISTRY  (Makita, Ridgid, Stahlwille, …) with product rollups.
//
// ⚠️ NAMING: In THIS file a "distributor" means a BRAND (the manufacturer of a
// product), NOT a channel/logistics partner. The real channel-partner company
// list lives in `@/data/distributors`. To stop the two `DISTRIBUTORS` exports
// from clashing, this one is now called PRODUCT_BRANDS.
//
// `DISTRIBUTORS` is kept below as a DEPRECATED ALIAS so nothing breaks — but
// new code should import PRODUCT_BRANDS.
// ---------------------------------------------------------------------------
export const PRODUCT_BRANDS = PRODUCT_DISTRIBUTORS.map((d) => {
  const prods = PRODUCTS.filter((p) => p.distributorId === d.id);
  return {
    ...d,
    productCount: prods.length,
    categoryIds: [...new Set(prods.map((p) => p.categoryId))],
    subcategoryIds: [...new Set(prods.map((p) => p.subcategoryId))],
  };
});

/** @deprecated Use PRODUCT_BRANDS. Kept only for backward compatibility. */
export const DISTRIBUTORS = PRODUCT_BRANDS;

// ---------------------------------------------------------------------------
// 3. HELPERS  (same signatures as before — public UI untouched)
// ---------------------------------------------------------------------------
export const getAllFlattenedProducts = () => PRODUCTS.map((p) => ({ ...p }));

export const getProductById = (productId) =>
  PRODUCTS.find((p) => p.id === productId) || null;

export const getCategoryById = (categoryId) =>
  categories.find((c) => c.id === categoryId) || null;

export const getSubcategoryById = (subcategoryId) => {
  for (const cat of categories) {
    const sub = cat.subcategories.find((s) => s.id === subcategoryId);
    if (sub) return sub;
  }
  return null;
};

export const getBrandById = (idOrSlug) =>
  PRODUCT_BRANDS.find((d) => d.id === idOrSlug || d.slug === idOrSlug) || null;

export const getBrandsForSubcategory = (subcategoryId) => {
  const sub = getSubcategoryById(subcategoryId);
  return sub ? sub.distributors : [];
};

export const getProductsForBrand = (brandId) =>
  PRODUCTS.filter((p) => p.distributorId === brandId);

/** @deprecated Use getBrandById. */
export const getDistributorById = getBrandById;
/** @deprecated Use getBrandsForSubcategory. */
export const getDistributorsForSubcategory = getBrandsForSubcategory;
/** @deprecated Use getProductsForBrand. */
export const getProductsForDistributor = getProductsForBrand;

export const PRODUCTS_SETTINGS = {
  // ---- LIST PAGE: layout & grid -------------------------------------------
  layout: {
    cardsPerRow: 3, // 1–6 — columns on large screens
    gap: "md", // "sm" | "md" | "lg" — spacing between cards
    pageBackground: "#f8fafc", // page bg color (slate-50)
    maxWidth: "max-w-6xl", // grid container width
    productsPerPage: 12, // pagination size
  },

  card: {
    style: "elevated", // "elevated" | "outlined" | "flat"
    cardBackground: "#ffffff",
    accentColor: "#1e3a8a", // hover/title accent (blue-900)
    cornerRadius: "rounded-2xl",
    imageFit: "contain", // "contain" | "cover" — image fit inside the square
    imageRatio: "square", // "square" | "video" | "auto"
    imageBackground: "#f8fafc",
    showBrandBadge: true,
    showModel: true,
    showKeyFeatures: true,
    showSkuId: true,
    priceLabel: "Price On Request", // text in the price pill
    showPricePill: true,
  },

  toggles: {
    showSearch: true,
    showBrandFilter: true,
    showSidebar: true,
    showPagination: true,
    showQuoteBucketButton: true,
    autoRefreshSeconds: 0, // 0 = off; >0 silently re-pulls data every N sec
  },

  rfq: {
    enabled: true,
    buttonText: "Quote Bucket",
    buttonColor: "#172554", // blue-950
    submitText: "🚀 Dispatch Quotation Slip",
    // Each field is rendered dynamically; admin can hide or require any of them,
    // and add custom fields. `key` must be unique.
    fields: [
      { key: "fullName", label: "Contact Full Name", type: "text", show: true, required: true },
      { key: "companyName", label: "Company/Enterprise Entity", type: "text", show: true, required: true },
      { key: "email", label: "Official Email Address", type: "email", show: true, required: true },
      { key: "mobile", label: "Mobile Coordinate Number", type: "tel", show: true, required: true },
      { key: "remarks", label: "Provide warehouse preferences...", type: "textarea", show: true, required: false },
    ],
    // ⚠️ BACKEND-DEPENDENT (NestJS). UI configures it; sending needs an API.
    autoReply: {
      enabled: false,
      replySubject: "We received your quotation request — SBS Groups",
      replyBody:
        "Dear {fullName},\n\nThank you for your RFQ. Our team has received your request for {itemCount} item(s) and will revert within 24 hours.\n\n— SBS Groups",
      forwardToHrEmail: "hr@sbsgroups.co.in", // RFQ + product list + user details forwarded here
      includeProductList: true,
      includeUserDetails: true,
    },
  },

  // ---- DETAIL PAGE: recommendations & ads ---------------------------------
  detail: {
    // What the "Related / Recommended" rail shows:
    //  "all"      → any products (most recent / same category fallback)
    //  "category" → same category + subcategory (current behavior)
    //  "selected" → only the explicit recommendedProductIds below
    recommendMode: "category",
    recommendCount: 4,
    recommendedProductIds: [], // used when recommendMode === "selected"
    // On-product ads: show a promo for specific products on detail/list pages.
    ads: {
      enabled: false,
      // Each ad targets either specific product ids OR a whole category.
      placements: [
        // { id: "AD-001", title: "Monsoon Safety Combo", productIds: ["PROD-0001"], categoryId: "", image: "", ctaText: "Grab Offer", ctaLink: "/products", active: true },
      ],
    },
  },

  // ---- SUBSCRIBER NOTIFICATIONS -------------------------------------------
  // ⚠️ BACKEND-DEPENDENT (NestJS + mail/WhatsApp provider + scheduler/cron).
  // UI configures it here; actual sending happens server-side.
  notifications: {
    email: { enabled: false, fromName: "SBS Groups" },
    whatsapp: { enabled: false, businessNumber: "" },
    // Manual one-off blast composed by admin:
    custom: {
      subject: "",
      message: "",
      productIds: [], // products to feature in the blast
      channels: { email: true, whatsapp: false },
    },
    // "Daily digest": every product ADDED that day is collected and a single
    // notification goes out at the configured time. Needs a server cron.
    dailyDigest: {
      enabled: false,
      sendAt: "18:00", // 24h HH:mm, server local time
      channels: { email: true, whatsapp: false },
      onlyIfNewProducts: true, // skip the blast on days with no additions
    },
  },

  meta: {
    settingsVersion: 1, // bump when schema changes so loaders can migrate
    updatedAt: "2026-06-17T00:00:00.000Z",
  },
};

export default categories;