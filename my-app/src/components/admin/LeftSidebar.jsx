// src/components/admin/LeftSidebar.jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { LuLogOut } from "react-icons/lu";
import { ChevronDown, ChevronRight } from "lucide-react";

// ============================================
// TREE NODE COMPONENT (Recursive)
// ============================================
function TreeNode({ node, isCollapsed, currentPath, theme, depth = 0 }) {
  const [isOpen, setIsOpen] = useState(node.defaultOpen || false);
  const IconComponent = node.icon;
  const isActive = node.href ? currentPath === node.href || currentPath?.startsWith(node.href + "/") : false;

  // ============================================
  // CHECK IF ANY CHILD IS ACTIVE
  // ============================================
  const hasActiveChild = node.type === "group" && node.children?.some(
    (child) => currentPath === child.href || currentPath?.startsWith(child.href + "/")
  );

  // Auto-open group if child is active
  const shouldBeOpen = isOpen || hasActiveChild;

  // ============================================
  // THEME-BASED STYLES
  // ============================================
  const isDark = theme === "dark";

  const linkBaseClasses = `
    flex items-center rounded-xl p-2.5 text-xs font-bold transition-all duration-200
    ${isCollapsed ? "justify-center" : "space-x-3"}
  `;

  const activeClasses = isDark
    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-sm"
    : "bg-blue-50 text-blue-700 border border-blue-200/60 shadow-sm";

  const inactiveClasses = isDark
    ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950";

  const groupActiveClasses = isDark
    ? "text-slate-300 bg-slate-800/50"
    : "text-slate-700 bg-slate-50";

  // ============================================
  // GROUP NODE (with children)
  // ============================================
  if (node.type === "group") {
    return (
      <div>
        {/* Group Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full ${linkBaseClasses} ${
            hasActiveChild ? groupActiveClasses : inactiveClasses
          } ${depth > 0 ? "pl-" + (depth * 12 + 12) : ""}`}
          title={isCollapsed ? node.name : ""}
        >
          <span className={`text-lg flex-shrink-0 transition-transform ${
            hasActiveChild ? "scale-110" : ""
          } ${isDark && hasActiveChild ? "text-blue-400" : ""}`}>
            <IconComponent />
          </span>
          
          {!isCollapsed && (
            <>
              <span className="flex-1 text-left opacity-90">{node.name}</span>
              <span className="flex-shrink-0">
                {shouldBeOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            </>
          )}
        </button>

        {/* Children */}
        {!isCollapsed && shouldBeOpen && (
          <div className={`ml-3 mt-0.5 space-y-0.5 border-l-2 pl-2 ${
            isDark ? "border-slate-700" : "border-slate-200"
          }`}>
            {node.children?.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                isCollapsed={isCollapsed}
                currentPath={currentPath}
                theme={theme}
                depth={depth + 1}
              />
            ))}
          </div>
        )}

        {/* Collapsed Indicator */}
        {isCollapsed && (
          <div className={`absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 ${
            isDark ? "bg-slate-700 text-slate-200" : "bg-slate-800 text-white"
          }`}>
            {node.name} ({node.children?.length || 0})
          </div>
        )}
      </div>
    );
  }

  // ============================================
  // LINK NODE (leaf)
  // ============================================
  return (
    <Link
      href={node.href || "#"}
      className={`${linkBaseClasses} ${isActive ? activeClasses : inactiveClasses} ${
        depth > 0 ? "pl-" + (depth * 10 + 8) : ""
      }`}
      title={isCollapsed ? node.name : ""}
    >
      <span className={`text-base flex-shrink-0 transition-transform ${
        isActive ? "scale-110" : "group-hover:scale-110"
      } ${isDark && isActive ? "text-blue-400" : ""}`}>
        <IconComponent />
      </span>
      
      {!isCollapsed && (
        <span className="opacity-90 truncate">{node.name}</span>
      )}

      {/* Active Indicator Dot */}
      {isActive && isCollapsed && (
        <span className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full ${
          isDark ? "bg-blue-400" : "bg-blue-600"
        }`} />
      )}
    </Link>
  );
}

// ============================================
// MAIN LEFTSIDEBAR COMPONENT
// ============================================
export default function LeftSidebar({ isLeftCollapsed, navTree, onLogout, currentPath, theme }) {
  const isDark = theme === "dark";

  return (
    <aside
      className={`border-r flex flex-col justify-between transition-all duration-300 shrink-0 z-30 shadow-sm h-full ${
        isLeftCollapsed ? "w-[5%] min-w-[70px]" : "w-[20%] min-w-[240px]"
      } ${
        isDark
          ? "bg-slate-900 border-slate-700/50"
          : "bg-white border-slate-200/80"
      }`}
    >
      {/* ============================================ */}
      {/* SCROLLABLE NAV TREE */}
      {/* ============================================ */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 custom-scrollbar">
        {!isLeftCollapsed && (
          <p className={`text-[9px] font-black tracking-widest uppercase px-3 mb-3 ${
            isDark ? "text-slate-500" : "text-slate-400"
          }`}>
            Navigation Tree
          </p>
        )}

        <div className="space-y-0.5">
          {navTree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              isCollapsed={isLeftCollapsed}
              currentPath={currentPath}
              theme={theme}
            />
          ))}
        </div>
      </div>

      {/* ============================================ */}
      {/* STICKY BOTTOM: LOGOUT + THEME TOGGLE */}
      {/* ============================================ */}
      <div className={`p-4 border-t shrink-0 ${
        isDark ? "border-slate-700/50 bg-slate-900" : "border-slate-100 bg-white"
      }`}>
        {/* Collapse Toggle */}
        {/* {!isLeftCollapsed && (
          <div className="mb-2">
            <div className={`text-[9px] font-bold uppercase tracking-wider mb-1 px-3 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}>
              Quick Info
            </div>
            <div className={`rounded-xl p-3 text-[10px] ${
              isDark ? "bg-slate-800 text-slate-400" : "bg-slate-50 text-slate-500"
            }`}>
              <div className="flex justify-between">
                <span>Theme</span>
                <span className={`font-bold ${isDark ? "text-yellow-400" : "text-blue-600"}`}>
                  {isDark ? "Dark" : "Light"}
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span>Active Path</span>
                <span className="font-mono text-[9px] truncate max-w-[80px]">
                  {currentPath || "/"}
                </span>
              </div>
            </div>
          </div>
        )} */}

        {/* Logout Button */}
        <button
          onClick={() => {
            if (confirm("Are you sure you want to log out?")) {
              onLogout?.();
            }
          }}
          className={`w-full flex items-center rounded-xl p-2.5 text-xs font-bold transition-all duration-200 ${
            isLeftCollapsed ? "justify-center" : "space-x-3"
          } ${
            isDark
              ? "bg-red-900/30 text-red-400 hover:bg-red-600 hover:text-white"
              : "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
          }`}
        >
          <span className="text-base flex-shrink-0">
            <LuLogOut />
          </span>
          <span className={isLeftCollapsed ? "hidden" : "block"}>Log Out</span>
        </button>
      </div>
    </aside>
  );
}