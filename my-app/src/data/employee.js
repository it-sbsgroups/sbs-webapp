import { Phone, Mail } from "lucide-react";
import { FaXTwitter, FaThreads, FaInstagram, FaLinkedinIn } from "react-icons/fa6";

export const SOCIAL_PLATFORMS = [
  { key: "phone", label: "Phone", Icon: Phone },
  { key: "email", label: "Email", Icon: Mail },
  { key: "twitter", label: "Twitter / X", Icon: FaXTwitter },
  { key: "threads", label: "Threads", Icon: FaThreads },
  { key: "instagram", label: "Instagram", Icon: FaInstagram },
  { key: "linkedin", label: "LinkedIn", Icon: FaLinkedinIn },
];

// A link counts as "available" only if it's a real URL — not "", "#", or null
export const isValidLink = (url) =>
  typeof url === "string" && url.trim() !== "" && url.trim() !== "#";

export const generateEmployeeSlug = (name, role) =>
  `${name} ${role}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const employees = [
    {
    id: "EMP-101", // cuid
    name: "Saroj Jaiswal", // name
    role: "Founder & Managing Director", // role
    tag: "SBS Groups", // department
    avatar: "https://sbsgroups.co.in/assets/founder-gU9kDhlP.webp",
    bgGradient: "from-blue-600 to-indigo-950",
    description: "Driving global sales strategies and corporate accounts orchestration. Specialized in scale operations and dynamic business development infrastructure.", // description is from text editor which is not required
    phone: "tel:+91",
    email: "jaiswal.sales@sbsgroups.com",
    twitter: "",
    threads: "",
    instagram: "",
    linkedin: "https://linkedin.com/in/example",
  },
  {
    id: "EMP-102", // cuid
    name: "G K Jaiswal", // name
    role: "co-founder", // role
    tag: "sbs groups", // department
    avatar: "https://sbsgroups.co.in/assets/AmanSir2-DKf2uBi1.png",
    bgGradient: "from-blue-600 to-indigo-950",
    description: "Driving global sales strategies and corporate accounts orchestration. Specialized in scale operations and dynamic business development infrastructure.", // description is from text editor which is not required
    phone: "tel:+91",
    email: "jaiswal.sales@sbsgroups.com",
    twitter: "",
    threads: "",
    instagram: "",
    linkedin: "https://linkedin.com/in/example",
  },
  {
    id: "EMP-103", // cuid
    name: "Binit Jaiswal", // name
    role: "HOD(Head Of Department)", // role
    tag: "Sales & Service", // department
    avatar: "https://sbsgroups.co.in/assets/HOD1-C6gHoXwa.webp",
    bgGradient: "from-blue-600 to-indigo-950",
    phone: "tel:+91",
    email: "binit@sbsrgroups.co.in",
    twitter: "",
    threads: "",
    instagram: "",
    linkedin: "https://linkedin.com/in/example",
  },
  {
    id: "EMP-104", // cuid
    name: "Rohit Sen", // name
    role: "DGM", // role
    tag: "Sales", // department
    avatar: "https://sbsgroups.co.in/assets/Rohit%20Sen1-DXQ4-x2G.webp",
    bgGradient: "from-blue-600 to-indigo-950",
    phone: "tel:+91",
    email: "binit@sbsrgroups.co.in",
    twitter: "",
    threads: "",
    instagram: "",
    linkedin: "rohit@sbsrgroups.co.in",
  },
  {
    id: "EMP-105", // cuid
    name: "Brijesh Dubey", // name
    role: "DGM", // role
    tag: "Service", // department
    avatar: "https://sbsgroups.co.in/assets/Brijesh%20Dubey-BfPu7PJ4.webp",
    bgGradient: "from-blue-600 to-indigo-950",
    phone: "tel:+91",
    email: "brijesh@sbsrgroups.co.in",
    twitter: "",
    threads: "",
    instagram: "",
    linkedin: "https://linkedin.com/in/example",
  },
  {
    id: "EMP-106", // cuid
    name: "Umesh Verma", // name
    role: "Manager", // role
    tag: "Sales", // department
    avatar: "https://sbsgroups.co.in/assets/Brijesh%20Dubey-BfPu7PJ4.webp",
    bgGradient: "from-blue-600 to-indigo-950",
    phone: "tel:+91",
    email: "brijesh@sbsrgroups.co.in",
    twitter: "",
    threads: "",
    instagram: "",
    linkedin: "https://linkedin.com/in/example",
  },
];

// Lookup helper used by /employees/[slug]
export const getEmployeeBySlug = (slug) =>
  employees.find(
    (emp) => generateEmployeeSlug(emp.name, emp.role) === slug
  ) || null;