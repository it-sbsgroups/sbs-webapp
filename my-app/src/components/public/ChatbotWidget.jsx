"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, X, ChevronRight, ChevronLeft, RotateCcw, Search, ShoppingCart, ExternalLink } from "lucide-react";
import siteConfigApi from "@/lib/siteConfig/siteConfigApi";
import { fetchGlobalSearch, TYPE_META } from "@/lib/globalSearchApi";
import { useRfqCart } from "@/context/RfqCartContext";
import publicCatalogApi from "@/lib/publicCatalogApi";
import VariantPickerModal from "@/components/shared/VariantPickerModal";

const DEFAULT_FLOW = {
  welcomeMessage: "Hi! How can I help you today? Pick an option below, or search for a product, brand, client or news article.",
  nodes: [],
};

function SearchResultRow({ hit, onNavigate, onNeedsVariantPick }) {
  const { addItem, isInCart } = useRfqCart();
  const [checking, setChecking] = useState(false);
  const meta = TYPE_META[hit.type] || { icon: "🔎", color: "text-slate-600 bg-slate-50" };
  const alreadyInCart = hit.type === "product" && isInCart(hit.id);

  const handleAddToCart = async () => {
    setChecking(true);
    try {
      const product = await publicCatalogApi.getById(hit.id);
      if (product?.variants?.length > 0) {
        onNeedsVariantPick(product);
      } else {
        addItem({ id: hit.id, productId: hit.id, name: hit.title }, 1);
      }
    } catch {
      // Fetch failed — fall back to a plain add so the action still succeeds.
      addItem({ id: hit.id, productId: hit.id, name: hit.title }, 1);
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-3 py-2.5">
      <button onClick={() => onNavigate(hit.href)} className="flex items-center gap-2.5 flex-1 min-w-0 text-left">
        <span className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-sm ${meta.color}`}>{meta.icon}</span>
        <span className="min-w-0">
          <span className="block text-xs font-bold text-slate-800 truncate">{hit.title}</span>
          {hit.subtitle && <span className="block text-[10px] text-slate-400 truncate">{hit.subtitle}</span>}
        </span>
      </button>
      {hit.type === "product" && (
        <button
          onClick={handleAddToCart}
          disabled={alreadyInCart || checking}
          title={alreadyInCart ? "Already in your Quote Bucket" : "Add to Quote Bucket"}
          className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
            alreadyInCart ? "bg-emerald-50 text-emerald-500" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
          }`}
        >
          <ShoppingCart size={13} />
        </button>
      )}
    </div>
  );
}

export default function ChatbotWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [flow, setFlow] = useState(DEFAULT_FLOW);
  const [path, setPath] = useState([]); // array of selected node ids, root → leaf
  const [query, setQuery] = useState("");
  const [variantPickerProduct, setVariantPickerProduct] = useState(null);
  const [searchResults, setSearchResults] = useState(null); // null = not searching
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef(null);

  // Re-fetch every time the chat panel is opened, not just once on page
  // mount. This widget can sit mounted for a long time (someone browsing
  // the site with the tab open), so a mount-only fetch means anyone whose
  // tab was already loaded before an admin edited the flow — renamed an
  // option, added new ones, etc. — would keep seeing the exact snapshot
  // from whenever their tab first loaded, e.g. a freshly-added option
  // still showing its unedited default label ("New option") even though
  // the admin panel (which re-fetches on every page load) already shows
  // the corrected name. Fetching on every `open` keeps it in sync with
  // whatever's actually published, without needing polling/websockets.
  useEffect(() => {
    if (!open) return;
    siteConfigApi.getChatbotFlow()
      .then((data) => {
        if (data && Array.isArray(data.nodes)) setFlow(data);
      })
      .catch(() => {});
  }, [open]);

  // Live search as the visitor types (debounced)
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetchGlobalSearch(query, { type: "all" });
        const { products, news, brands, clients } = res.results || {};
        setSearchResults([
          ...(products?.data || []),
          ...(brands?.data || []),
          ...(clients?.data || []),
          ...(news?.data || []),
        ]);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  // Walk `path` down the tree to find the current list of options + the
  // currently-selected node (whose `answer`, if any, is shown above them).
  const { currentNodes, selectedNode } = useMemo(() => {
    let nodes = flow.nodes || [];
    let selected = null;
    for (const id of path) {
      const found = nodes.find((n) => n.id === id);
      if (!found) break;
      selected = found;
      nodes = found.children || [];
    }
    return { currentNodes: nodes, selectedNode: selected };
  }, [flow, path]);

  const navigate = (href) => {
    if (!href) return;
    setOpen(false);
    if (/^https?:\/\//.test(href)) {
      window.open(href, "_blank", "noopener,noreferrer");
    } else {
      router.push(href);
    }
  };

  const select = (node) => {
    // A node with a link redirects immediately — it's an action, not just a
    // menu — e.g. "Would you like to go to Contact?" → straight to /contact.
    if (node.link) {
      navigate(node.link);
      return;
    }
    setPath((p) => [...p, node.id]);
  };
  const goBack = () => setPath((p) => p.slice(0, -1));
  const restart = () => { setPath([]); setQuery(""); setSearchResults(null); };

  const hasContent = (flow.nodes || []).length > 0;
  const isSearching = query.trim().length > 0;

  return (
    <>
      <style>{`
        .chatbot-toggle {
          position: fixed; bottom: 24px; right: 24px; z-index: 50;
          width: 56px; height: 56px; border-radius: 50%;
          background: #4f46e5; color: #fff;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2); cursor: pointer; border: none;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .chatbot-toggle:hover { transform: scale(1.08); box-shadow: 0 6px 16px rgba(0,0,0,0.25); }
        .chatbot-panel {
          position: fixed; bottom: 92px; right: 24px; z-index: 50;
          width: min(360px, calc(100vw - 32px));
          max-height: min(560px, calc(100vh - 140px));
          background: #fff; border-radius: 16px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
          display: flex; flex-direction: column; overflow: hidden;
        }
      `}</style>

      {!open && (
        <button className="chatbot-toggle" onClick={() => setOpen(true)} aria-label="Open chat assistant">
          <MessageCircle size={24} />
        </button>
      )}

      {open && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <MessageCircle size={18} />
              <span className="text-sm font-black truncate">SBS Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="hover:bg-white/10 rounded-full p-1" aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          {/* Search bar */}
          <div className="px-3 pt-3 pb-2 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, brands, clients, news…"
                className="flex-1 bg-transparent text-xs font-semibold text-slate-700 focus:outline-none min-w-0"
              />
              {query && (
                <button onClick={() => setQuery("")} className="text-slate-400 hover:text-slate-600 shrink-0">
                  <X size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-2.5 bg-slate-50">
            {isSearching ? (
              searching ? (
                <p className="text-xs text-slate-400 font-medium">Searching…</p>
              ) : searchResults?.length ? (
                searchResults.map((hit) => (
                  <SearchResultRow key={`${hit.type}-${hit.id}`} hit={hit} onNavigate={navigate} onNeedsVariantPick={setVariantPickerProduct} />
                ))
              ) : (
                <p className="text-xs text-slate-400 font-medium">No results for &quot;{query}&quot;.</p>
              )
            ) : (
              <>
                {!hasContent && (
                  <p className="text-xs text-slate-500 font-medium">
                    Our assistant isn&apos;t set up yet — try searching above, or reach out via WhatsApp / the contact page.
                  </p>
                )}

                {hasContent && (
                  <>
                    <div className="bg-white rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-xs font-medium text-slate-700 shadow-sm max-w-[90%]">
                      {selectedNode?.answer || flow.welcomeMessage}
                    </div>

                    {currentNodes.length > 0 && (
                      <div className="flex flex-col gap-2 pt-1">
                        {currentNodes.map((node) => (
                          <button
                            key={node.id}
                            onClick={() => select(node)}
                            className="flex items-center justify-between gap-2 bg-white border border-indigo-100 hover:border-indigo-400 hover:bg-indigo-50 rounded-xl px-3.5 py-2.5 text-left text-xs font-bold text-slate-700 transition-colors"
                          >
                            {node.label}
                            {node.link ? <ExternalLink size={13} className="text-indigo-400 shrink-0" /> : <ChevronRight size={14} className="text-indigo-400 shrink-0" />}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedNode && currentNodes.length === 0 && (
                      <p className="text-[11px] text-slate-400 font-medium italic pt-1">
                        That&apos;s everything on this topic — go back for other options, or reach out to our team directly.
                      </p>
                    )}
                  </>
                )}
              </>
            )}
          </div>

          {/* Footer nav */}
          {(path.length > 0 || isSearching) && (
            <div className="border-t border-slate-100 px-3 py-2 flex items-center justify-between bg-white shrink-0">
              {path.length > 0 && !isSearching ? (
                <button onClick={goBack} className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 px-2 py-1.5">
                  <ChevronLeft size={14} /> Back
                </button>
              ) : <span />}
              <button onClick={restart} className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-indigo-600 px-2 py-1.5">
                <RotateCcw size={12} /> Start Over
              </button>
            </div>
          )}
        </div>
      )}

      {variantPickerProduct && (
        <VariantPickerModal product={variantPickerProduct} onClose={() => setVariantPickerProduct(null)} />
      )}
    </>
  );
}
