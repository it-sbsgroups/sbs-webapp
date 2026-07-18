"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import publicNewsApi from "@/lib/news/publicNewsApi";

export default function LatestNews() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [postsRes, catData] = await Promise.all([
          publicNewsApi.getPublishedPosts({ pageSize: 20 }),
          publicNewsApi.getCategories(),
        ]);
        setPosts(postsRes?.data || []);
        setCategories(Array.isArray(catData) ? catData : []);
      } catch (error) {
        console.error("Failed to load latest news:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const getCategoryName = (catId) =>
    categories.find((c) => c.id === catId)?.name || "";

  const getCoverImage = (post) =>
    post?.blocks?.find((b) => b.type === "imageRow")?.images?.[0]?.src ||
    "";

  const latestThree = posts.slice(0, 3);

  // ---- Character‑by‑character typing animation ----
  const fullText = "Latest News";
  const [displayedText, setDisplayedText] = useState("");
  const charIndexRef = useRef(0);
  const timeoutRef = useRef(null);

  const startTyping = useCallback(() => {
    setDisplayedText("");
    charIndexRef.current = 0;

    const typeChar = () => {
      if (charIndexRef.current < fullText.length) {
        setDisplayedText(fullText.slice(0, charIndexRef.current + 1));
        charIndexRef.current++;
        timeoutRef.current = setTimeout(typeChar, 100);
      } else {
        timeoutRef.current = setTimeout(() => {
          startTyping();
        }, 2000);
      }
    };

    typeChar();
  }, [fullText]);

  useEffect(() => {
    startTyping();
    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [startTyping]);

  // Split the currently typed text into words for separate coloring
  const words = displayedText.split(" ");

  if (loading) return null;
  if (latestThree.length === 0) return null;

  return (
    <section className="bg-white py-16 md:py-24 border-t border-gray-100">
      {/* Custom animations */}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .animate-cursor-blink {
          animation: blink 0.7s infinite;
        }

        @keyframes cardPulse {
          0%, 100% { box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
          50% { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        }
        .animate-card {
          animation: cardPulse 3s ease-in-out infinite;
        }
        .animate-card:hover {
          animation: none;
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Centered heading with typing effect – bigger, two‑tone */}
        <div className="text-center border-b border-gray-100 pb-6">
          <h1 className="mt-2 text-4xl sm:text-5xl font-black tracking-tight capitalize leading-tight">
            {words.length > 0 && (
              <span className="text-blue-950">{words[0]}</span>
            )}
            {words.length > 1 && (
              <>
                {" "}
                <span className="text-[#557b01]">{words.slice(1).join(" ")}</span>
              </>
            )}
            <span className="animate-cursor-blink inline-block border-l-2 border-black align-middle" style={{ height: "1em", marginLeft: "2px" }} />
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {latestThree.map((item) => {
            const catName = getCategoryName(item.categoryId);
            const subCatName = item.subCategoryId
              ? getCategoryName(item.subCategoryId)
              : "";
            const coverImage = getCoverImage(item);

            return (
              <Link key={item.id} href={`/news/${item.slug}`} className="group block" >
                <article className="animate-card flex flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white transition-all duration-300 hover:-translate-y-2 hover:shadow-lg hover:border-blue-900/30">
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                    <img src={coverImage} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                      {catName && (
                        <span className="rounded bg-blue-900 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow">
                          {catName}
                        </span>
                      )}
                      {subCatName && (
                        <span className="rounded bg-red-600 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow">
                          {subCatName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-center p-6">
                    <h6 className="text-lg font-black text-gray-900 group-hover:text-blue-900 transition-colors line-clamp-2 capitalize tracking-tight">
                      {item.title}
                    </h6>
                  </div>
                </article>
              </Link>
            );
          })}
        </div>

        <div className="flex justify-center pt-4">
          <Link href="/news" className="inline-flex items-center space-x-2 rounded-full bg-blue-900 px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition hover:bg-red-600" >
            <span>See All News</span>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}