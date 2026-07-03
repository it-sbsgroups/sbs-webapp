"use client";

// DATA SCHEMA FOR ADMIN PANEL CONTROLS
const dummyPrinciplesData = {
  headingPart1: "Quality Product with Prompt",
  headingPart2: "Service is our principle",
  description1: "SBS GROUPS is a trusted name among the leading Industrial Product Suppliers, dealing in a wide range of products including Industrial Safety, Fire Extinguishers, Road Safety, Lubrication Equipment, and Industrial Tools.",
  description2: "Established in 2005 as a family-owned company, we are located in the Power Capital of India – Singrauli, Madhya Pradesh. We began with a mission to serve the growing safety needs of the mining, power, and metal sectors.",
  description3: "Today, we deliver quality industrial products approved by CE, EN, ANSI, BIS, and DGMS. Within a short span, SBS has become synonymous with Quality and Safety.",
  growItems: [
    "Our Customers",
    "Our Principles",
    "Our Service Providers",
    "Our Team"
  ],
  footerText: "We strongly believe business grows not just because we are commercially competitive, but because of the experience we leave behind — respecting commitments, fulfilling promises, and creating value beyond transactions.",
  topBadgeImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=500", // Placeholder for certification banner
  mainWarehouseImage: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=600" // Placeholder for showroom/warehouse graphic
};

export default function PrinciplesSection() {
  return (
    <section className="bg-white py-12 md:py-20 border-t border-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Responsive Layout Matrix */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16 items-start">
          
          {/* LEFT CONTAINER: Visual Graphics Stack (5 Columns) */}
          <div className="lg:col-span-5 flex flex-col space-y-4 w-full">
            {/* Top Small Shield Banner Graphic */}
            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-md">
              <img 
                loading="lazy"
                src={dummyPrinciplesData.topBadgeImage} 
                alt="SBS Principles Shield Certifications" 
                className="w-full h-auto object-cover max-h-[140px]"
              />
            </div>
            {/* Main Warehouse Control Room Smart Graphic */}
            <div className="overflow-hidden rounded-xl border border-gray-100 shadow-xl">
              <img 
                src={dummyPrinciplesData.mainWarehouseImage} 
                alt="Quality product with prompt service warehouse infrastructure" 
                className="w-full h-auto object-cover max-h-[380px]"
                loading="lazy"
              />
            </div>
          </div>

          {/* RIGHT CONTAINER: Content & Value Checkmarks (7 Columns) */}
          <div className="lg:col-span-7 space-y-5 text-gray-700">
            
            {/* Heading Typography */}
            <h2 className="text-2xl font-extrabold tracking-tight text-blue-950 sm:text-3xl leading-tight">
              {dummyPrinciplesData.headingPart1}{" "}
              <span className="block text-lime-500 mt-1 md:inline md:mt-0">
                {dummyPrinciplesData.headingPart2}
              </span>
            </h2>

            {/* Paragraph Text Blocks */}
            <div className="space-y-4 text-xs md:text-sm text-gray-600 leading-relaxed text-justify font-normal">
              <p>{dummyPrinciplesData.description1}</p>
              <p>{dummyPrinciplesData.description2}</p>
              <p>{dummyPrinciplesData.description3}</p>
            </div>

            {/* "We Grow Together With" Section */}
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-extrabold text-blue-950 flex items-center">
                We <span className="text-lime-500 mx-1">Grow</span> Together With:
              </h4>
              
              {/* Checkmarks Sub Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                {dummyPrinciplesData.growItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 border border-emerald-300">
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-blue-950">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Emotional Corporate Footer Text */}
            <p className="text-xs text-gray-500 italic pt-4 border-t border-gray-100 leading-relaxed">
              {dummyPrinciplesData.footerText}
            </p>

          </div>

        </div>

      </div>
    </section>
  );
}