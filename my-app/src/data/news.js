export const NEWS_CATEGORIES = [
  { id: "NCAT-01", name: "Compliance", slug: "compliance" },
  { id: "NCAT-02", name: "Logistics", slug: "logistics" },
  { id: "NCAT-03", name: "Corporate", slug: "corporate" },
];

export const NEWS_SUBCATEGORIES = [
  { id: "NSUB-01", categoryId: "NCAT-01", name: "Safety Protocols", slug: "safety-protocols" },
  { id: "NSUB-02", categoryId: "NCAT-01", name: "Regulatory Updates", slug: "regulatory-updates" },
  { id: "NSUB-03", categoryId: "NCAT-02", name: "Warehouse & Dispatch", slug: "warehouse-dispatch" },
  { id: "NSUB-04", categoryId: "NCAT-02", name: "Supply Chain", slug: "supply-chain" },
  { id: "NSUB-05", categoryId: "NCAT-03", name: "Deployments", slug: "deployments" },
  { id: "NSUB-06", categoryId: "NCAT-03", name: "Announcements", slug: "announcements" },
];

// ----------------------------------------------------------------------------
// ADMIN SETTINGS — every UI knob the admin "News Manage → Settings" can change.
// The public pages READ these so changes here re-theme the whole experience.
// ----------------------------------------------------------------------------
export const NEWS_SETTINGS = {
  list: {
    cardsPerRow: 3, // grid columns on the news list page (1–4)
    cardsPerPage: 6, // pagination size on the news list page
    showSearch: true,
    showCategoryFilter: true,
    showSubcategoryFilter: true,
  },
  carousel: {
    // LatestNews.jsx (home / other pages)
    visibleCards: 4, // how many cards visible at once
    totalToPull: 8, // how many recent posts to feed the carousel
    autoPlay: true,
    pauseOnHover: true,
    intervalMs: 3000, // slide step interval
  },
  comments: {
    requireApproval: true, // nothing shows publicly until approved
    allowReplies: true,
    maxDepth: 2, // comment → reply → reply-to-reply
  },
  ads: {
    // "ads" = products shown on news pages, like sponsored boxes on news sites
    enabled: true,
    placement: "sidebar", // "sidebar" | "inline" | "both"
    maxProducts: 3, // how many product cards to show
    heading: "Featured Products",
  },
};

// ----------------------------------------------------------------------------
// AD PRODUCTS — admin picks which product ids appear on news pages, and order.
// (Resolve the real product objects from "@/data/products" at render time.)
// ----------------------------------------------------------------------------
export const NEWS_AD_PRODUCTS = {
  enabled: true,
  productIds: ["PROD-0001", "PROD-0015", "PROD-0030"], // chosen in admin
};

// ----------------------------------------------------------------------------
// POSTS
// ----------------------------------------------------------------------------
export const NEWS_POSTS = [
  {
    id: "cknews000000000000000001",
    tag: "Compliance",
    categoryId: "NCAT-01",
    subcategoryId: "NSUB-01",
    title: "New Safety Equipment Compliance Protocols Issued for Singrauli Site",
    slug: "new-safety-equipment-compliance-protocols-singrauli",
    subtitle: "Updated PPE rules effective from next payroll batch cycle",
    summary:
      "Official regulatory guidelines have been updated for all on-site industrial safety gears, effective from next payroll batch cycle.",
    // Rich dynamic editorial blocks (admin block editor output)
    contentBlocks: [
      {
        type: "text",
        content:
          "Following the exhaustive evaluation audit completed last week at our primary mining node in Singrauli, Madhya Pradesh, the central compliance council has ratified key protective amendments.",
        style: { fontFamily: "serif", color: "#1e293b", fontSize: "16px", fontWeight: "normal" },
      },
      {
        type: "imageRow",
        layout: "grid-cols-2",
        images: [
          {
            src: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600",
            caption: "Mandatory Grade-A industrial boots stock grid",
          },
          {
            src: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=600",
            caption: "Class-3 insulated rubber gloves deployment",
          },
        ],
      },
      {
        type: "text",
        content:
          "CRITICAL DIRECTIVE: All active field sub-contractors failing to provision certified items by the payroll deadline will face dispatch clearance lockdowns.",
        style: { fontFamily: "sans-serif", color: "#be123c", fontSize: "14px", fontWeight: "bold" },
      },
    ],
    coverImage: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600",
    author: { name: "G K Jaiswal", role: "Super Admin", email: "admin@sbsgroups.in" },
    status: "published", // draft | published | archived
    showPreviousVersion: true, // admin transparency toggle
    currentVersion: 2,
    likes: 142,
    seo: {
      metaTitle: "Safety Compliance Protocols — Singrauli | SBS Groups",
      metaDescription: "Updated PPE compliance protocols for the Singrauli site.",
      keywords: ["compliance", "PPE", "safety", "Singrauli"],
    },
    publishedDate: "2026-06-08T03:17:00.000Z",
    audit: {
      createdAt: "2026-06-08T03:17:00.000Z",
      updatedAt: "2026-06-09T09:00:00.000Z",
      createdBy: "admin:admin@sbsgroups.in",
    },
    // Full version history (old vs current). Each entry is a prior snapshot.
    editHistory: [
      {
        versionId: "v1",
        editedAt: "2026-06-08T03:17:00.000Z",
        editedBy: "admin",
        snapshot: {
          title:
            "New Safety Equipment Compliance Protocols Issued for Singrauli Site",
          contentBlocks: [
            {
              type: "text",
              content: "Initial release: Grade-A boots mandatory for all zones.",
              style: { fontFamily: "sans-serif", color: "#334155", fontSize: "14px" },
            },
          ],
        },
      },
    ],
    isDeleted: false,
    deletedMeta: null,
    comments: [
      {
        id: "cknc000000000000000000001",
        parentId: null,
        depth: 0,
        postId: "cknews000000000000000001",
        name: "Ramesh Singh",
        email: "ramesh@nclvendor.example.com",
        body: "Will there be any official subsidy allocation from the depot for Class-3 gloves?",
        geolocation: {
          ip: "203.0.113.42",
          city: "Singrauli",
          region: "Madhya Pradesh",
          country: "IN",
          lat: 24.1997,
          lng: 82.6753,
          capturedAt: "2026-06-08T06:00:00.000Z",
        },
        status: "approved",
        approvedMeta: { approvedAt: "2026-06-08T06:30:00.000Z", approvedBy: "admin:admin@sbsgroups.in" },
        audit: { createdAt: "2026-06-08T06:00:00.000Z", updatedAt: "2026-06-08T06:00:00.000Z" },
        editHistory: [],
        isDeleted: false,
        deletedMeta: null,
        isHardDeleted: false,
        replies: [
          {
            id: "cknc000000000000000000002",
            parentId: "cknc000000000000000000001",
            depth: 1,
            postId: "cknews000000000000000001",
            name: "Admin Support Desk",
            email: "support@sbsgroups.in",
            body: "Yes Ramesh — check vendor guidelines paragraph 4 for credit waivers.",
            geolocation: {
              ip: "203.0.113.7",
              city: "Waidhan",
              region: "Madhya Pradesh",
              country: "IN",
              lat: 24.0833,
              lng: 82.6667,
              capturedAt: "2026-06-08T07:00:00.000Z",
            },
            status: "approved",
            approvedMeta: { approvedAt: "2026-06-08T07:05:00.000Z", approvedBy: "admin:admin@sbsgroups.in" },
            audit: { createdAt: "2026-06-08T07:00:00.000Z", updatedAt: "2026-06-08T07:00:00.000Z" },
            editHistory: [],
            isDeleted: false,
            deletedMeta: null,
            isHardDeleted: false,
            replies: [],
          },
        ],
      },
      {
        id: "cknc000000000000000000003",
        parentId: null,
        depth: 0,
        postId: "cknews000000000000000001",
        name: "Suresh Mehra",
        email: "suresh@example.com",
        body: "Compliance rules are strict but highly required for deep mining layouts.",
        geolocation: {
          ip: "198.51.100.10",
          city: "Rewa",
          region: "Madhya Pradesh",
          country: "IN",
          lat: 24.5333,
          lng: 81.3,
          capturedAt: "2026-06-08T08:00:00.000Z",
        },
        status: "approved",
        approvedMeta: { approvedAt: "2026-06-08T08:10:00.000Z", approvedBy: "admin:admin@sbsgroups.in" },
        audit: { createdAt: "2026-06-08T08:00:00.000Z", updatedAt: "2026-06-08T08:00:00.000Z" },
        editHistory: [],
        isDeleted: false,
        deletedMeta: null,
        isHardDeleted: false,
        replies: [],
      },
    ],
  },
  {
    id: "cknews000000000000000002",
    tag: "Logistics",
    categoryId: "NCAT-02",
    subcategoryId: "NSUB-03",
    title: "Bulk Supply Logistics Hub Expanded at NCL Spares Depot",
    slug: "bulk-supply-logistics-hub-expanded-ncl-spares-depot",
    subtitle: "Warehouse footprint up 40% with automated picking",
    summary:
      "To minimize dispatch timelines, the warehouse square footage has been expanded by 40% with automated picking hooks.",
    contentBlocks: [
      {
        type: "text",
        content:
          "The NCL Spares Depot expansion adds 40% more floor area and automated picking lanes, cutting average dispatch time for bulk orders.",
        style: { fontFamily: "sans-serif", color: "#1e293b", fontSize: "16px", fontWeight: "normal" },
      },
    ],
    coverImage: "https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=600",
    author: { name: "SBS Editorial", role: "Editor", email: "editorial@sbsgroups.in" },
    status: "published",
    showPreviousVersion: false,
    currentVersion: 1,
    likes: 56,
    seo: {
      metaTitle: "NCL Spares Depot Expansion | SBS Groups",
      metaDescription: "Logistics hub expanded 40% with automated picking.",
      keywords: ["logistics", "warehouse", "dispatch"],
    },
    publishedDate: "2026-06-05T10:00:00.000Z",
    audit: {
      createdAt: "2026-06-05T10:00:00.000Z",
      updatedAt: "2026-06-05T10:00:00.000Z",
      createdBy: "admin:editorial@sbsgroups.in",
    },
    editHistory: [],
    isDeleted: false,
    deletedMeta: null,
    comments: [],
  },
  {
    id: "cknews000000000000000003",
    tag: "Corporate",
    categoryId: "NCAT-03",
    subcategoryId: "NSUB-05",
    title: "Hindalco Smart Tool Storage Room Goes Live",
    slug: "hindalco-smart-tool-storage-room-goes-live",
    subtitle: "RFID-enabled asset tracking deployed at a live plant",
    summary:
      "Automated smart tool management framework optimizing asset tracking, delivered and commissioned for Hindalco facilities.",
    contentBlocks: [
      {
        type: "text",
        content:
          "RFID-tagged drawers, real-time dashboards and shortage alerts replaced manual register-based issue/return at the Hindalco facility.",
        style: { fontFamily: "serif", color: "#1e293b", fontSize: "16px", fontWeight: "normal" },
      },
    ],
    coverImage: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=600",
    author: { name: "SBS Project Team", role: "Projects", email: "projects@sbsgroups.in" },
    status: "published",
    showPreviousVersion: false,
    currentVersion: 1,
    likes: 98,
    seo: {
      metaTitle: "Hindalco Smart Tool Storage | SBS Groups",
      metaDescription: "RFID smart tool management delivered for Hindalco.",
      keywords: ["RFID", "asset tracking", "Hindalco", "deployment"],
    },
    publishedDate: "2026-06-12T08:00:00.000Z",
    audit: {
      createdAt: "2026-06-12T08:00:00.000Z",
      updatedAt: "2026-06-12T08:00:00.000Z",
      createdBy: "admin:projects@sbsgroups.in",
    },
    editHistory: [],
    isDeleted: false,
    deletedMeta: null,
    comments: [],
  },
  {
    id: "cknews000000000000000004",
    tag: "Compliance",
    categoryId: "NCAT-01",
    subcategoryId: "NSUB-02",
    title: "Annual Electrical Safety Re-certification Window Opens",
    slug: "annual-electrical-safety-recertification-window-opens",
    subtitle: "All insulated tools must be re-certified this quarter",
    summary:
      "The annual re-certification window for insulated electrical tools and PPE is now open; book site audits early to avoid the rush.",
    contentBlocks: [
      {
        type: "text",
        content:
          "Insulated tools and Class-0/Class-3 PPE require annual dielectric re-certification. Site audit slots are limited each quarter.",
        style: { fontFamily: "sans-serif", color: "#1e293b", fontSize: "16px", fontWeight: "normal" },
      },
    ],
    coverImage: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600",
    author: { name: "G K Jaiswal", role: "Super Admin", email: "admin@sbsgroups.in" },
    status: "published",
    showPreviousVersion: false,
    currentVersion: 1,
    likes: 31,
    seo: {
      metaTitle: "Electrical Safety Re-certification | SBS Groups",
      metaDescription: "Annual insulated tool re-certification window is open.",
      keywords: ["electrical safety", "re-certification", "PPE"],
    },
    publishedDate: "2026-06-14T11:00:00.000Z",
    audit: {
      createdAt: "2026-06-14T11:00:00.000Z",
      updatedAt: "2026-06-14T11:00:00.000Z",
      createdBy: "admin:admin@sbsgroups.in",
    },
    editHistory: [],
    isDeleted: false,
    deletedMeta: null,
    comments: [],
  },
  {
    id: "cknews000000000000000005",
    tag: "Logistics",
    categoryId: "NCAT-02",
    subcategoryId: "NSUB-04",
    title: "Regional Supply Chain Resilience Plan Published",
    slug: "regional-supply-chain-resilience-plan-published",
    subtitle: "Dual-sourcing and buffer stock for critical spares",
    summary:
      "A new resilience plan introduces dual-sourcing and buffer stock thresholds for mission-critical spares across the region.",
    contentBlocks: [
      {
        type: "text",
        content:
          "The resilience plan sets buffer-stock thresholds and qualifies secondary suppliers for critical bearings, seals and fasteners.",
        style: { fontFamily: "sans-serif", color: "#1e293b", fontSize: "16px", fontWeight: "normal" },
      },
    ],
    coverImage: "https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=600",
    author: { name: "SBS Editorial", role: "Editor", email: "editorial@sbsgroups.in" },
    status: "published",
    showPreviousVersion: false,
    currentVersion: 1,
    likes: 24,
    seo: {
      metaTitle: "Supply Chain Resilience Plan | SBS Groups",
      metaDescription: "Dual-sourcing and buffer stock for critical spares.",
      keywords: ["supply chain", "resilience", "spares"],
    },
    publishedDate: "2026-06-13T09:30:00.000Z",
    audit: {
      createdAt: "2026-06-13T09:30:00.000Z",
      updatedAt: "2026-06-13T09:30:00.000Z",
      createdBy: "admin:editorial@sbsgroups.in",
    },
    editHistory: [],
    isDeleted: false,
    deletedMeta: null,
    comments: [],
  },
  {
    id: "cknews000000000000000006",
    tag: "Corporate",
    categoryId: "NCAT-03",
    subcategoryId: "NSUB-06",
    title: "SBS Groups Onboards Three New Distributor Brands",
    slug: "sbs-groups-onboards-three-new-distributor-brands",
    subtitle: "Expanded catalogue across power and hand tools",
    summary:
      "Three new premium distributor brands join the SBS catalogue, broadening coverage across power tools and precision hand tools.",
    contentBlocks: [
      {
        type: "text",
        content:
          "The onboarding expands our authorised range with additional warranty-backed lines across power and precision hand tools.",
        style: { fontFamily: "sans-serif", color: "#1e293b", fontSize: "16px", fontWeight: "normal" },
      },
    ],
    coverImage: "https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=600",
    author: { name: "SBS Editorial", role: "Editor", email: "editorial@sbsgroups.in" },
    status: "published",
    showPreviousVersion: false,
    currentVersion: 1,
    likes: 47,
    seo: {
      metaTitle: "New Distributor Brands Onboarded | SBS Groups",
      metaDescription: "Three new premium distributor brands join the catalogue.",
      keywords: ["distributors", "brands", "catalogue"],
    },
    publishedDate: "2026-06-11T14:00:00.000Z",
    audit: {
      createdAt: "2026-06-11T14:00:00.000Z",
      updatedAt: "2026-06-11T14:00:00.000Z",
      createdBy: "admin:editorial@sbsgroups.in",
    },
    editHistory: [],
    isDeleted: false,
    deletedMeta: null,
    comments: [],
  },
];

// ============================================================================
// HELPERS
// ============================================================================
const MAX_DEPTH = NEWS_SETTINGS.comments.maxDepth;

function walkComments(nodes, fn, chain = []) {
  for (const node of nodes || []) {
    fn(node, chain);
    if (node.replies?.length) walkComments(node.replies, fn, [...chain, node]);
  }
}

// ---- taxonomy lookups ----
export const getNewsCategoryById = (id) =>
  NEWS_CATEGORIES.find((c) => c.id === id) || null;
export const getNewsSubcategoryById = (id) =>
  NEWS_SUBCATEGORIES.find((s) => s.id === id) || null;
export const getSubcategoriesForCategory = (categoryId) =>
  NEWS_SUBCATEGORIES.filter((s) => s.categoryId === categoryId);

// ---- post lookups (public excludes deleted + non-published) ----
export const getAllNews = ({ includeHidden = false } = {}) =>
  NEWS_POSTS.filter(
    (p) => includeHidden || (!p.isDeleted && p.status === "published")
  );

export const getNewsBySlug = (slug, { includeHidden = false } = {}) =>
  NEWS_POSTS.find(
    (p) =>
      p.slug === slug && (includeHidden || (!p.isDeleted && p.status === "published"))
  ) || null;

export const getNewsById = (id, { includeHidden = false } = {}) =>
  NEWS_POSTS.find(
    (p) => p.id === id && (includeHidden || (!p.isDeleted && p.status === "published"))
  ) || null;

// Most recent N published posts (for the carousel)
export const getRecentNews = (n = NEWS_SETTINGS.carousel.totalToPull) =>
  getAllNews()
    .slice()
    .sort((a, b) => new Date(b.publishedDate) - new Date(a.publishedDate))
    .slice(0, n);

// ---- public vs admin comment trees ----
export const getPublicCommentTree = (post) => {
  if (!post) return [];
  const prune = (nodes) =>
    (nodes || [])
      .filter((n) => n.status === "approved" && !n.isDeleted && !n.isHardDeleted)
      .map((n) => ({
        id: n.id,
        parentId: n.parentId,
        depth: n.depth,
        name: n.name,
        body: n.body,
        createdAt: n.audit?.createdAt,
        updatedAt: n.audit?.updatedAt,
        wasEdited: (n.editHistory?.length || 0) > 0,
        canReply: n.depth < MAX_DEPTH,
        replies: prune(n.replies),
      }));
  return prune(post.comments);
};

export const getAdminCommentTree = (post) => {
  if (!post) return [];
  const decorate = (nodes) =>
    (nodes || []).map((n) => ({
      ...n,
      versionsCount: n.editHistory?.length || 0,
      replies: decorate(n.replies),
    }));
  return decorate(post.comments);
};

export const countApprovedComments = (post) => {
  let c = 0;
  walkComments(post?.comments, (n) => {
    if (n.status === "approved" && !n.isDeleted && !n.isHardDeleted) c++;
  });
  return c;
};

export const countPendingComments = (post) => {
  let c = 0;
  walkComments(post?.comments, (n) => {
    if (n.status === "pending" && !n.isHardDeleted) c++;
  });
  return c;
};

export const findCommentById = (post, commentId) => {
  let found = null;
  walkComments(post?.comments, (n) => {
    if (n.id === commentId) found = n;
  });
  return found;
};

// ---- mutation templates (admin/API layer) ----
export const makeComment = ({
  id,
  postId,
  parentId = null,
  parentDepth = -1,
  name,
  email,
  body,
  geolocation = null,
}) => {
  const depth = parentId === null ? 0 : parentDepth + 1;
  if (depth > MAX_DEPTH)
    throw new Error(`Max reply depth is ${MAX_DEPTH}.`);
  const nowISO = new Date().toISOString();
  return {
    id,
    parentId,
    depth,
    postId,
    name,
    email,
    body,
    geolocation,
    status: NEWS_SETTINGS.comments.requireApproval ? "pending" : "approved",
    approvedMeta: NEWS_SETTINGS.comments.requireApproval
      ? null
      : { approvedAt: nowISO, approvedBy: "auto" },
    audit: { createdAt: nowISO, updatedAt: nowISO },
    editHistory: [],
    isDeleted: false,
    deletedMeta: null,
    isHardDeleted: false,
    replies: [],
  };
};

export const makeVersion = (node, editedBy = "user", versionId) => ({
  versionId: versionId || `ver-${(node.editHistory?.length || 0) + 1}`,
  editedAt: new Date().toISOString(),
  editedBy,
  snapshot: { name: node.name, body: node.body },
});

export const applyEdit = (node, patch, editedBy = "user") => {
  const version = makeVersion(node, editedBy);
  return {
    ...node,
    ...patch,
    audit: { ...node.audit, updatedAt: version.editedAt },
    editHistory: [...(node.editHistory || []), version],
  };
};

export const applySoftDelete = (node, by = "user", reason = "") => {
  const nowISO = new Date().toISOString();
  return {
    ...node,
    isDeleted: true,
    deletedMeta: {
      isDeleted: true,
      deletedAt: nowISO,
      deletedBy: by,
      by,
      reason: reason || (by === "user" ? "Deleted by commenter" : "Removed by admin"),
    },
    audit: { ...node.audit, updatedAt: nowISO },
  };
};

export const applyRestore = (node) => ({
  ...node,
  isDeleted: false,
  deletedMeta: null,
  audit: { ...node.audit, updatedAt: new Date().toISOString() },
});

export const applyApproval = (node, approve, adminId) => {
  const nowISO = new Date().toISOString();
  return {
    ...node,
    status: approve ? "approved" : "rejected",
    approvedMeta: approve ? { approvedAt: nowISO, approvedBy: adminId } : null,
    audit: { ...node.audit, updatedAt: nowISO },
  };
};

export const markHardDelete = (node, adminId) => ({
  ...node,
  isHardDeleted: true,
  deletedMeta: {
    ...(node.deletedMeta || {}),
    isDeleted: true,
    by: "admin",
    deletedBy: adminId,
    hardDeletedAt: new Date().toISOString(),
    reason: "Hard delete (permanent) by admin",
  },
});

// ---- slug helper (shared by admin + list) ----
export const slugify = (title) =>
  (title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export default NEWS_POSTS;