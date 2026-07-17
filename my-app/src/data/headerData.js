// ============================================
// DUMMY DATA CONFIGURATION FOR HEADER
// ============================================
// Store this in your admin context/localStorage
// or use as initial state until backend is ready

const headerDummyData = {
  
  // ---------- LOGO & BRANDING ----------
  // From: LogoManager.jsx
  branding: {
    companyName: "SBS GROUPS",
    tagline: "Industrial Solutions",
    logoUrl: "https://sbsgroups.co.in/assets/sbs_logo-C7_xX5GN.png",
    faviconUrl: "https://sbsgroups.co.in/favicon.ico", // Add your favicon
  },

  // ---------- NAVIGATION ----------
  // From: NavigationManager.jsx
  // Primary navigation links (visible on desktop)
  primaryNavigation: [
    {
      id: 1,
      name: "Home",
      link: "/",
      order: 1,
      status: true,
      fontSize: 12, // text-xs
      fontWeight: "900", // font-black
      fontColor: "#4B5563", // text-gray-600
      hoverFontColor: "#1E3A8A", // text-blue-900
      hoverBgColor: "#F9FAFB", // bg-gray-50
      activeFontColor: "#FFFFFF",
      activeBgColor: "#1E3A8A",
      hasDropdown: false,
      dropdownItems: [],
    },
    {
      id: 2,
      name: "About Us",
      link: "/about",
      order: 2,
      status: true,
      fontSize: 12,
      fontWeight: "900",
      fontColor: "#4B5563",
      hoverFontColor: "#1E3A8A",
      hoverBgColor: "#F9FAFB",
      activeFontColor: "#FFFFFF",
      activeBgColor: "#1E3A8A",
      hasDropdown: false,
      dropdownItems: [],
    },
    {
      id: 4,
      name: "Contact",
      link: "/contact",
      order: 4,
      status: true,
      fontSize: 12,
      fontWeight: "900",
      fontColor: "#4B5563",
      hoverFontColor: "#1E3A8A",
      hoverBgColor: "#F9FAFB",
      activeFontColor: "#FFFFFF",
      activeBgColor: "#1E3A8A",
      hasDropdown: false,
      dropdownItems: [],
    },
  ],

  // Dropdown "Other Services" navigation
  // From: DropdownItemsManager.jsx (part of NavFormModal)
  dropdownNavigation: {
    id: 3,
    name: "Our Offerings",
    link: "#",
    order: 3,
    status: true,
    fontSize: 12,
    fontWeight: "900",
    fontColor: "#4B5563",
    hoverFontColor: "#1E3A8A",
    hoverBgColor: "#F9FAFB",
    activeFontColor: "#1E3A8A",
    activeBgColor: "#F9FAFB",
    hasDropdown: true,
    dropdownWidth: 192, // w-48 = 12rem = 192px
    dropdownPosition: "right",
    dropdownBgColor: "#FFFFFF",
    dropdownTextColor: "#4B5563",
    dropdownBorderRadius: 12,
    dropdownShadow: true,
    dropdownItems: [
      {
        id: 101,
        name: "Authorised Distributorship",
        link: "/brands",
        icon: "",
        order: 1,
      },
      {
        id: 102,
        name: "Own Brands",
        link: "/own-brands",
        icon: "",
        order: 2,
      },
    ],
  },

  // ---------- LOGIN BUTTON ----------
  // From: LoginManager.jsx
  loginSettings: {
    // Logged OUT state
    buttonText: "Login",
    buttonLink: "/login",
    fontSize: 12, // text-xs
    fontWeight: "900", // font-black
    fontColor: "#FFFFFF", // text-white
    backgroundColor: "#172554", // bg-blue-950
    hoverFontColor: "#FFFFFF",
    hoverBackgroundColor: "#1E3A8A", // hover:bg-blue-900
    borderRadius: 12, // rounded-xl
    paddingX: 16, // px-4
    paddingY: 10, // py-2.5

    // Logged IN state (user dropdown)
    showDropdownAfterLogin: true,
    userDropdownItems: [
      {
        id: 201,
        name: "Admin Panel",
        link: "/admin/dashboard",
        icon: "Shield",
        order: 1,
      },
      {
        id: 202,
        name: "Logout",
        link: "/logout",
        icon: "LogOut",
        order: 2,
      },
    ],
  },

  // ---------- MOBILE MENU ----------
  // Combined list for mobile (primary + dropdown items)
  // This is auto-generated from primaryNavigation + dropdownNavigation
  mobileMenuSettings: {
    showLoginInMobile: true,
    showAdminInMobile: true,
  },
};

export default headerDummyData;