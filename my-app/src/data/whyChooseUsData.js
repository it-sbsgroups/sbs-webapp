// src/data/whyChooseUsData.js

const whyChooseUsData = {
  title: "Why choose <span className='text-lime-500'>SBS Groups</span> ?",
  mainDescription: "With over two decades of technical expertise and a state-of-the-art logistical base in Singrauli, we deliver unparalleled engineering supplies and compliance-driven safety components.",

  // ---------- CARDS / FEATURES ----------
  stats: [
    {
      id: 1,
      iconName: "Shield",
      title: "DGMS & ISO Certified Quality",
      description: "Every mechanical gear, lifting tool, and safety wear element strictly complies with core government and regulatory protocols.",
      show: true,
    },
    {
      id: 2,
      iconName: "Building2",
      title: "Authorized Network & Sourcing",
      description: "Direct tie-ups with original manufacturers guarantee 100% genuine products, mitigating any equipment failure risks.",
      show: true,
    },
    {
      id: 3,
      iconName: "Zap",
      title: "Integrated Logistics (NCL ICOMS)",
      description: "Our warehouses are synced digitally for immediate processing, reducing the turnaround time for mining and power infrastructure.",
      show: true,
    },
    {
      id: 4,
      iconName: "Users",
      title: "Dedicated Technical Support",
      description: "Our engineering and support team remains on standby round-the-clock to manage critical industrial supply emergencies.",
      show: true,
    },
  ],

  // ---------- AVAILABLE ICONS (for admin dropdown) ----------
  availableIcons: [
    "Shield", "Building2", "Zap", "Users", "Truck", "Award", 
    "Cog", "Wrench", "Package", "Globe", "Clock", "Headphones",
    "Star", "ThumbsUp", "CheckCircle", "Lightbulb", "Target",
    "BarChart3", "Megaphone", "Rocket", "Heart", "ShieldCheck",
  ],
};

export default whyChooseUsData;