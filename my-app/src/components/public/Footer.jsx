"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#0d5fd3] to-[#103b87] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company */}
          <div>
            <Image
              src="https://res.cloudinary.com/dhrnoojwo/image/upload/v1784274775/jgm8l0jdx16odc40tmin-removebg-preview_fjxfvm.png"
              alt="Logo"
              width={160}
              height={160}
              className="mb-4"
            />
            <div className="space-y-3 text-sm leading-relaxed">
              <div className="flex gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <p>
                  SUPERB BEARING STORES, Main Road, Tali Waidhan, Near Honda Showroom,
                  Singrauli, M.P. 486886 (India)
                </p>
              </div>
              <div className="flex gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p>G K Jaiswal (Aman)</p>
                  <p>Mobile: 9826808412 / 8827559826</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p>info@sbsgroups.co.in</p>
                  <p>admin@sbsgroups.co.in</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/products">Products</Link></li>
              <li><Link href="/clients">Our Clients</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>Authorised Distributor</li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li>Support</li>
              <li>Partnerships</li>
            </ul>
          </div>

          {/* Newsletter / Connect */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Connect With Us</h3>
            <div className="flex gap-3 mb-6">
              <a href="#" className="w-10 h-10 rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition">
                <FaFacebookF className="text-sm" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition">
                <FaLinkedinIn className="text-sm" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition">
                <FaInstagram className="text-sm" />
              </a>
              <a href="#" className="w-10 h-10 rounded-lg bg-blue-700 hover:bg-blue-600 flex items-center justify-center transition">
                <FaYoutube className="text-sm" />
              </a>
            </div>
            <p className="text-sm mb-2">Subscribe to our newsletter</p>
            <form className="flex overflow-hidden rounded-lg">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-3 py-2 text-sm bg-white text-black outline-none"
              />
              <button className="bg-blue-500 hover:bg-blue-600 px-4 text-sm">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-4 text-sm text-white/90">
          © 2025 SBS Group. All rights reserved.
        </div>
      </div>
    </footer>
  );
}