// src/app/admin/layout.jsx
"use client";

import { useState, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/admin/Header";
import LeftSidebar from "@/components/admin/LeftSidebar";
import RightSidebar from "@/components/admin/RightSidebar";
import Footer from "@/components/admin/Footer";
import { AuthProvider, useAuth } from "@/context/AuthContext";

// React Icons Imports - Full Tree Structure
import { 
  LayoutDashboard, 
  Contact, 
  CircleQuestionMark, 
  MessageSquareText, 
  Users, 
  Images, 
  Trophy, 
  Building2,
  Newspaper,
  TableProperties,
  AlignVerticalSpaceBetween,
  BookUser,
  Footprints,
  Package,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  Globe,
  ShoppingCart,
  Truck,
  Star,
  PenTool,
  Mail,
} from "lucide-react";

// ============================================
// THEME CONTEXT
// ============================================
export const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

// ============================================
// TREE-STRUCTURED NAVIGATION MENUS
// ============================================
const navTree = [
  // ---- STANDALONE LINKS ----
  {
    id: "dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin/dashboard",
    type: "link",
  },

  // ---- CRM GROUP ----
  {
    id: "crm",
    name: "CRM Hub",
    icon: Users,
    type: "group",
    defaultOpen: true,
    children: [
      {
        id: "crm-products",
        name: "Products",
        icon: TableProperties,
        href: "/admin/products",
        type: "link",
      },
      {
        id: "crm-distributors",
        name: "Distributors",
        icon: AlignVerticalSpaceBetween,
        href: "/admin/distributors",
        type: "link",
      },
      {
        id: "crm-clients",
        name: "Clients",
        icon: Building2,
        href: "/admin/clients",
        type: "link",
      },
      {
        id: "crm-employees",
        name: "Employees",
        icon: Users,
        href: "/admin/employees",
        type: "link",
      },
      {
        id: "crm-testimonials",
        name: "Testimonials",
        icon: BookUser,
        href: "/admin/testimonials",
        type: "link",
      },
      {
        id: "crm-news",
        name: "News & Media",
        icon: Newspaper,
        href: "/admin/news",
        type: "link",
      },
      {
        id: "crm-faqs",
        name: "FAQs",
        icon: MessageSquareText,
        href: "/admin/faq-manager",
        type: "link",
      },
    ],
  },

  // ---- COMPONENTS GROUP ----
  {
    id: "components",
    name: "Components",
    icon: Package,
    type: "group",
    defaultOpen: true,
    children: [
      {
        id: "comp-site-config",
        name: "Site Configuration",
        icon: AlignVerticalSpaceBetween,
        href: "/admin/site-config",
        type: "link",
      },
      {
        // Phase 2: Newsletter subscriber management
        id: "comp-subscribers",
        name: "Subscribers",
        icon: Building2,
        href: "/admin/subscribers",
        type: "link",
      },
      {
        id: "comp-carousel",
        name: "Hero Carousel",
        icon: Images,
        href: "/admin/carousel",
        type: "link",
      },
      {
        id: "comp-whychooseus",
        name: "Why Choose Us",
        icon: Star,
        href: "/admin/whychooseus",
        type: "link",
      },
      {
        id: "comp-contact",
        name: "Contact Page",
        icon: Contact,
        href: "/admin/contacts",
        type: "link",
      },
      {
        id: "comp-newsletter",
        name: "Newsletter",
        icon: Mail,
        href: "/admin/subscribers",
        type: "link",
      },
    ],
  },

];

function AdminLayoutInner({ children }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // MASTER STATES
  const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // THEME STATE
  const [theme, setTheme] = useState("light"); // "light" | "dark"
  const [isGradient, setIsGradient] = useState(true);
  const [solidColor, setSolidColor] = useState("#0f172a");
  const [gradientStart, setGradientStart] = useState("#0f172a");
  const [gradientEnd, setGradientEnd] = useState("#1e3a8a");

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const presetThemes = [
    { name: "Deep Ocean (Default)", start: "#0f172a", end: "#1e3a8a", type: "gradient" },
    { name: "Midnight Emerald", start: "#022c22", end: "#065f46", type: "gradient" },
    { name: "Cyber Sunset", start: "#1e1b4b", end: "#4c1d95", type: "gradient" },
    { name: "Slate Minimalist", color: "#1e293b", type: "solid" },
    { name: "Coal Professional", color: "#111827", type: "solid" },
  ];

  const notifications = [
    { id: 1, text: "New procurement request received from Singrauli Zone", time: "5m ago" },
    { id: 2, text: "Product 'Safety Harness Grade A' SKU low on inventory", time: "1h ago" },
    { id: 3, text: "NCL Compliance update certificate uploaded successfully", time: "4h ago" },
  ];

  const headerThemeStyle = isGradient
    ? { backgroundImage: `linear-gradient(to right, ${gradientStart}, ${gradientEnd})` }
    : { backgroundColor: solidColor };

  // ============================================
  // DARK/LIGHT THEME CLASSES
  // ============================================
  const themeClasses = theme === "dark"
    ? "bg-slate-900 text-slate-200"
    : "bg-white text-slate-800";

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`h-screen w-full flex flex-col font-sans select-none antialiased overflow-hidden transition-colors duration-300 ${themeClasses}`}>
        
        {/* 1. Header */}
        <Header
          headerThemeStyle={headerThemeStyle}
          setIsLeftCollapsed={setIsLeftCollapsed}
          isLeftCollapsed={isLeftCollapsed}
          setIsRightOpen={setIsRightOpen}
          showThemeModal={showThemeModal}
          setShowThemeModal={setShowThemeModal}
          showNotificationModal={showNotificationModal}
          setShowNotificationModal={setShowNotificationModal}
          showProfileModal={showProfileModal}
          setShowProfileModal={setShowProfileModal}
          presetThemes={presetThemes}
          isGradient={isGradient}
          setIsGradient={setIsGradient}
          gradientStart={gradientStart}
          setGradientStart={setGradientStart}
          gradientEnd={gradientEnd}
          setGradientEnd={setGradientEnd}
          solidColor={solidColor}
          setSolidColor={setSolidColor}
          notifications={notifications}
          user={user}
          onLogout={logout}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          setSearchResults={setSearchResults}
          theme={theme}
          toggleTheme={toggleTheme}
        />

        {/* 2. Content Row */}
        <div className="flex-1 flex w-full items-stretch overflow-hidden relative">
          
          {/* Left Sidebar */}
          <LeftSidebar
            isLeftCollapsed={isLeftCollapsed}
            navTree={navTree}
            onLogout={logout}
            currentPath={pathname}
            theme={theme}
          />

          {/* Main Content */}
          <main className={`flex-1 p-6 md:p-8 overflow-y-auto space-y-6 custom-scrollbar transition-colors duration-300 ${
            theme === "dark" ? "bg-slate-900/50" : "bg-white"
          }`}>
            {children}
          </main>

          {/* Right Sidebar */}
          <RightSidebar
            isRightOpen={isRightOpen}
            setIsRightOpen={setIsRightOpen}
            searchResults={searchResults}
            theme={theme}
          />
        </div>

        {/* 3. Footer */}
        <Footer theme={theme} />
      </div>
    </ThemeContext.Provider>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AuthProvider>
  );
}