// src/app/(admin)/admin/products/page.js

"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Package, FolderTree, MessageSquare, Settings, BarChart3, Download, RefreshCw, Plus, Grid3X3, List, MoreVertical, ChevronDown, Layers } from "lucide-react";
import ProductsTable from "@/components/admin/products/ProductsTable";
import ProductFormModal from "@/components/admin/products/ProductFormModal";
import ProductImportExport from "@/components/admin/products/ProductImportExport";
import CategoriesManager from "@/components/admin/products/CategoriesManager";
import VariantsBrowser from "@/components/admin/products/VariantsBrowser";
import RfqManager from "@/components/admin/products/RfqManager";
import RfqIntegrationSettings from "@/components/admin/products/RfqIntegrationSettings";
import productsApi from "@/lib/productsApi";
import categoriesApi from "@/lib/categoriesApi";
import brandsApi from "@/lib/brands/Api";
import rfqApi from "@/lib/rfqApi";
import { Suspense } from "react";

const STORAGE_KEY_TAB = "sbs_admin_products_tab";
const STORAGE_KEY_FORM = "sbs_admin_product_form_state";

const tabs = [
  { id: "products", label: "Products", icon: Package },
  { id: "categories", label: "Categories & Subcategories", icon: FolderTree },
  { id: "variants", label: "Variants", icon: Layers },
  { id: "importexport", label: "Import / Export", icon: Download },
  { id: "rfq", label: "RFQ Manager", icon: MessageSquare },
  { id: "rfqintegrations", label: "RFQ Integrations", icon: Settings },
];

const moreViews = tabs.filter((t) => t.id !== "products");

function ProductsAdminContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem(STORAGE_KEY_TAB);
      if (saved && tabs.some((t) => t.id === saved)) return saved;
    }
    return "products";
  });
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY_TAB, activeTab);
  }, [activeTab]);

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // RFQ summary state
  const [rfqStats, setRfqStats] = useState({
    total: 0,
    replied: 0,
    notReplied: 0,
    recent: []
  });

  const [pagination, setPagination] = useState({
    total: 0, page: 1, pageSize: 100, totalPages: 1,
    hasNextPage: false, hasPreviousPage: false
  });

  // Deep link edit handling
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (!editId) return;
    productsApi
      .getById(editId)
      .then((product) => {
        if (product) {
          setEditingProduct(product);
          setShowProductModal(true);
          setActiveTab("products");
        }
      })
      .catch((err) => console.error("Failed to load product for edit link:", err))
      .finally(() => {
        router.replace("/admin/products");
      });
  }, [searchParams]);

  // Restore form state
  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = sessionStorage.getItem(STORAGE_KEY_FORM);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.editingProduct) {
          setEditingProduct(parsed.editingProduct);
          setShowProductModal(true);
        }
      } catch (e) {
        sessionStorage.removeItem(STORAGE_KEY_FORM);
      }
    }
  }, []);

  const saveFormState = (editing, modalOpen) => {
    if (typeof window === "undefined") return;
    if (modalOpen && editing) {
      sessionStorage.setItem(STORAGE_KEY_FORM, JSON.stringify({ editingProduct: editing }));
    } else {
      sessionStorage.removeItem(STORAGE_KEY_FORM);
    }
  };

  useEffect(() => {
    saveFormState(editingProduct, showProductModal);
  }, [editingProduct, showProductModal]);

  // ---- Data fetching ----
  const extractData = (response) => {
    if (!response) return [];
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    return [];
  };

  const fetchProducts = async () => {
    try {
      const allProducts = [];
      const pageSize = 100;
      let page = 1;
      let totalPages = 1;

      while (true) {
        const response = await productsApi.getAll({
          page,
          pageSize,
          search: searchQuery || undefined,
        });
        const data = extractData(response);
        allProducts.push(...data);

        if (response?.meta?.totalPages) {
          totalPages = response.meta.totalPages;
        } else if (response?.meta?.total) {
          totalPages = Math.ceil(response.meta.total / pageSize);
        } else {
          totalPages = page;
        }

        if (page >= totalPages) break;
        page++;
      }

      setProducts(allProducts);
      setPagination({
        total: allProducts.length,
        page: 1,
        pageSize: pageSize,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProducts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.getAll();
      setCategories(extractData(response));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      setCategories([]);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const response = await categoriesApi.getAllSubcategories();
      setSubcategories(extractData(response));
    } catch (error) {
      console.error("Failed to fetch subcategories:", error);
      setSubcategories([]);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await brandsApi.getAll();
      setBrands(extractData(response));
    } catch (error) {
      console.error("Failed to fetch brands:", error);
      setBrands([]);
    }
  };

  // Fetch RFQ summary
  const fetchRfqSummary = async () => {
    try {
      const response = await rfqApi.getAll({ page: 1, pageSize: 500 });
      const data = response?.data || response;
      const rfqs = Array.isArray(data) ? data : [];
      const total = rfqs.length;
      const replied = rfqs.filter((r) => ["REPLIED", "PROCESSING", "COMPLETED"].includes(r.status)).length;
      const notReplied = total - replied;
      const recent = [...rfqs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
      setRfqStats({ total, replied, notReplied, recent });
    } catch (error) {
      console.error("Failed to fetch RFQ summary:", error);
      setRfqStats({ total: 0, replied: 0, notReplied: 0, recent: [] });
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchProducts(),
      fetchCategories(),
      fetchSubcategories(),
      fetchBrands(),
      fetchRfqSummary(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh > 0) {
      const interval = setInterval(() => {
        fetchProducts();
        fetchRfqSummary();
        setLastRefresh(new Date());
      }, autoRefresh * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  // Modal handlers
  const handleCreateProduct = () => {
    setEditingProduct(null);
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (productData, pendingBrochure, pendingDesignFile) => {
    try {
      if (editingProduct) {
        await productsApi.update(editingProduct.id, productData);
      } else {
        const created = await productsApi.create(productData);
        if (pendingBrochure && created?.id) {
          try {
            await productsApi.uploadBrochure(created.id, pendingBrochure);
          } catch (e) {
            alert("Product created, but brochure upload failed: " + e.message);
          }
        }
        if (pendingDesignFile && created?.id) {
          try {
            await productsApi.uploadDesignFile(created.id, pendingDesignFile);
          } catch (e) {
            alert("Product created, but design file upload failed: " + e.message);
          }
        }
      }
      setShowProductModal(false);
      setEditingProduct(null);
      sessionStorage.removeItem(STORAGE_KEY_FORM);
      await fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
      alert("Failed to save product: " + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!confirm("Delete this product permanently?")) return;
    try {
      await productsApi.delete(productId);
      await fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product: " + error.message);
    }
  };

  const handleBulkDeleteProducts = async (productIds) => {
    if (!productIds?.length) return;
    if (!confirm(`Delete ${productIds.length} selected product${productIds.length > 1 ? "s" : ""} permanently?`)) return;
    try {
      for (const id of productIds) {
        await productsApi.delete(id);
      }
      await fetchProducts();
    } catch (error) {
      console.error("Failed to bulk delete products:", error);
      alert("Some products may not have been deleted: " + error.message);
    }
  };

  const handleDuplicateProduct = async (product) => {
    try {
      const newProduct = {
        name: `${product.name} (Copy)`,
        model: product.model,
        description: product.description,
        keyFeatures: product.keyFeatures,
        material: product.material,
        manufacturer: product.manufacturer,
        categoryId: product.categoryId,
        subcategoryId: product.subcategoryId,
        brandId: product.brandId,
        isActive: true,
        isFeatured: false,
        images: (product.images || []).map(img => ({
          url: img.url,
          title: img.title || '',
          angle: img.angle || '',
          altText: img.altText || '',
        })),
        specifications: (product.specifications || []).reduce((acc, spec) => {
          acc[spec.key] = spec.value;
          return acc;
        }, {}),
        certifications: (product.certifications || []).map(c => c.name || c),
      };
      await productsApi.create(newProduct);
      await fetchProducts();
    } catch (error) {
      console.error("Failed to duplicate product:", error);
      alert("Failed to duplicate product: " + error.message);
    }
  };

  const handlePageChange = () => {
    // No server-side pagination needed – table handles it locally.
  };

  // ---- Compute stats for hover tooltips ----
  const productStats = useMemo(() => {
    const active = products.filter((p) => p.isActive !== false).length;
    const inactive = products.length - active;
    return { active, inactive };
  }, [products]);

  const categoryStats = useMemo(() => {
    return categories
      .map((c) => ({
        name: c.name,
        count: subcategories.filter((s) => s.categoryId === c.id).length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [categories, subcategories]);

  const subcategoryStats = useMemo(() => {
    // Show top 5 subcategories (by name) or count per category?
    return subcategories.slice(0, 5).map((s) => s.name);
  }, [subcategories]);

  const brandStats = useMemo(() => {
    return brands
      .map((b) => ({
        name: b.name,
        count: products.filter((p) => p.brandId === b.id || (p.brand?.id === b.id)).length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [brands, products]);

  const renderContent = () => {
    if (loading && activeTab === "products") {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        </div>
      );
    }

    switch (activeTab) {
      case "products":
        return (
          <ProductsTable
            products={products}
            categories={categories}
            subcategories={subcategories}
            brands={brands}
            onEdit={handleEditProduct}
            onDelete={handleDeleteProduct}
            onBulkDelete={handleBulkDeleteProducts}
            onDuplicate={handleDuplicateProduct}
            onCreate={handleCreateProduct}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        );
      case "categories":
        return <CategoriesManager />;
      case "variants":
        return <VariantsBrowser onEditProduct={handleEditProduct} />;
      case "importexport":
        return <ProductImportExport products={products} setProducts={setProducts} />;
      case "rfq":
        return <RfqManager />;
      case "rfqintegrations":
        return <RfqIntegrationSettings />;
      default:
        return null;
    }
  };

  // Build stats array with click and hover for all 5
  const stats = [
    {
      label: "Total Products",
      value: pagination.total,
      color: "text-blue-600",
      bg: "bg-blue-50",
      icon: Package,
      onClick: () => setActiveTab("products"),
      hoverContent: (
        <div>
          <p className="text-xs font-bold">Active: {productStats.active}</p>
          <p className="text-xs font-bold">Inactive: {productStats.inactive}</p>
        </div>
      )
    },
    {
      label: "Categories",
      value: categories.length,
      color: "text-green-600",
      bg: "bg-green-50",
      icon: FolderTree,
      onClick: () => setActiveTab("categories"),
      hoverContent: (
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Top by Subcats</p>
          {categoryStats.length === 0 && <p className="text-xs text-slate-500">No categories</p>}
          {categoryStats.map((c) => (
            <div key={c.name} className="flex justify-between text-xs py-0.5">
              <span className="truncate">{c.name}</span>
              <span className="ml-2 font-bold">{c.count}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      label: "Subcategories",
      value: subcategories.length,
      color: "text-purple-600",
      bg: "bg-purple-50",
      icon: FolderTree,
      onClick: () => setActiveTab("categories"),
      hoverContent: (
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Recent</p>
          {subcategoryStats.length === 0 && <p className="text-xs text-slate-500">No subcategories</p>}
          {subcategoryStats.map((name, idx) => (
            <div key={idx} className="text-xs truncate py-0.5">{name}</div>
          ))}
        </div>
      )
    },
    {
      label: "Brands",
      value: brands.length,
      color: "text-orange-600",
      bg: "bg-orange-50",
      icon: Package,
      onClick: () => setActiveTab("products"),  // No dedicated brands tab, go to products
      hoverContent: (
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Top by Products</p>
          {brandStats.length === 0 && <p className="text-xs text-slate-500">No brands</p>}
          {brandStats.map((b) => (
            <div key={b.name} className="flex justify-between text-xs py-0.5">
              <span className="truncate">{b.name}</span>
              <span className="ml-2 font-bold">{b.count}</span>
            </div>
          ))}
        </div>
      )
    },
    {
      label: "RFQs",
      value: rfqStats.total,
      color: "text-red-600",
      bg: "bg-red-50",
      icon: MessageSquare,
      onClick: () => setActiveTab("rfq"),
      hoverContent: (
        <div>
          <p className="text-xs font-bold">Replied: {rfqStats.replied}</p>
          <p className="text-xs font-bold">Not Replied: {rfqStats.notReplied}</p>
          {rfqStats.recent.length > 0 && (
            <div className="mt-2 border-t pt-2">
              <p className="text-[10px] font-black uppercase text-slate-400">Last 5</p>
              {rfqStats.recent.map((rfq) => (
                <div key={rfq.id} className="truncate text-[10px] text-slate-600">
                  {rfq.fullName || rfq.clientName} - {rfq.reference || rfq.id}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Products Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            {pagination.total} products · {categories.length} categories · {brands.length} brands
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-2xl border bg-white p-3 md:p-4 shadow-sm flex items-center gap-2 md:gap-3 hover:shadow-md transition-shadow relative group"
              onClick={stat.onClick}
              style={{ cursor: stat.onClick ? "pointer" : "default" }}
            >
              <div className={`flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg md:rounded-xl shrink-0 ${stat.bg}`}>
                <Icon size={16} className={`md:size-[18px] ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{stat.label}</p>
                <h3 className={`text-lg md:text-xl font-bold ${stat.color}`}>{stat.value}</h3>
              </div>

              {/* Hover tooltip */}
              {stat.hoverContent && (
                <div className="absolute z-50 right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-3 shadow-lg hidden group-hover:block">
                  {stat.hoverContent}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2.5">
          <div className="flex items-center gap-2">
            {(() => {
              const current = tabs.find((t) => t.id === activeTab) || tabs[0];
              const Icon = current.icon;
              return (
                <span className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <Icon size={16} className="text-blue-600" /> {current.label}
                </span>
              );
            })()}
            {activeTab !== "products" && (
              <button onClick={() => setActiveTab("products")} className="ml-2 text-xs font-semibold text-blue-600 hover:underline">
                ← Back to Products
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {activeTab === "products" && (
              <button onClick={handleCreateProduct} title="Add new product"
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                <Plus size={17} />
              </button>
            )}
            <div className="relative">
              <button onClick={() => setShowMoreMenu((v) => !v)} title="More views"
                className="flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100">
                <MoreVertical size={16} />
              </button>
              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute right-0 top-full mt-1.5 z-20 w-56 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg">
                    {moreViews.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => { setActiveTab(tab.id); setShowMoreMenu(false); }}
                          className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-left transition-colors ${
                            activeTab === tab.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <Icon size={15} /> {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="p-6">{renderContent()}</div>
      </div>

      {showProductModal && (
        <ProductFormModal
          open={showProductModal}
          initialData={editingProduct}
          categories={categories}
          subcategories={subcategories}
          brands={brands}
          onClose={() => { 
            setShowProductModal(false); 
            setEditingProduct(null);
            sessionStorage.removeItem(STORAGE_KEY_FORM);
          }}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

export default function ProductsAdminPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    }>
      <ProductsAdminContent />
    </Suspense>
  );
}