"use client";

import { useState } from "react";
import Link from "next/link";
import CategoriesManager from "@/components/admin/products/CategoriesManager";
import SubcategoriesManager from "@/components/admin/products/SubcategoriesManager";
import { ArrowLeft, FolderTree, FolderOpen } from "lucide-react";

export default function CategoriesManagementPage() {
  const [activeTab, setActiveTab] = useState("categories"); // categories | subcategories

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/products" className="rounded-xl border p-2.5 hover:bg-slate-50 transition-colors" >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Categories & Subcategories</h1>
          <p className="mt-1 text-sm text-slate-500">Manage product categories and their subcategories.</p>
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-all ${
            activeTab === "categories"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white border text-slate-600 hover:bg-slate-50"
          }`} >
          <FolderTree size={18} /> Categories
        </button>
        <button onClick={() => setActiveTab("subcategories")}
          className={`flex items-center gap-2 rounded-xl px-5 py-3 font-medium transition-all ${
            activeTab === "subcategories"
              ? "bg-blue-600 text-white shadow-md"
              : "bg-white border text-slate-600 hover:bg-slate-50"
          }`} >
          <FolderOpen size={18} /> Subcategories
        </button>
      </div>
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        {activeTab === "categories" ? (
          <CategoriesManager
            categories={require("@/data/products").PRODUCT_CATEGORIES}
            subcategories={require("@/data/products").PRODUCT_SUBCATEGORIES}
          />
        ) : (
          <SubcategoriesManager />
        )}
      </div>
    </div>
  );
}