// src/components/admin/carousel/CarouselSlidesManager.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import carouselApi from "@/lib/carouselApi";
import SlideEditorModal from "./SlideEditorModal";
import { Plus, Trash2, Edit, GripVertical, Image, Video, Palette, Layers, MoveUp, MoveDown } from "lucide-react";
import toast from "react-hot-toast";

export default function CarouselSlidesManager() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);

  const dispatchUpdate = (updatedSlides) => {
    window.dispatchEvent(new CustomEvent("carousel-admin-update", {
      detail: { slides: updatedSlides }
    }));
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await carouselApi.getSlides();
      setSlides(data);
      dispatchUpdate(data);
    } catch (e) {
      toast.error(e.message || "Failed to load slides");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAddNew = () => {
    setEditingSlide(null);
    setIsModalOpen(true);
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this slide?")) return;
    try {
      await carouselApi.deleteSlide(id);
      const updated = slides.filter((s) => s.id !== id);
      setSlides(updated);
      dispatchUpdate(updated);
      toast.success("Slide deleted");
    } catch (e) {
      toast.error(e.message || "Delete failed");
    }
  };

  const handleSaveSlide = async (slideData) => {
    try {
      if (editingSlide) {
        await carouselApi.updateSlide(editingSlide.id, slideData);
      } else {
        await carouselApi.createSlide(slideData);
      }
      setIsModalOpen(false);
      setEditingSlide(null);
      await load();
      toast.success("Slide saved");
    } catch (e) {
      toast.error(e.message || "Save failed");
    }
  };

  const moveSlide = async (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= slides.length) return;
    const updated = [...slides];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSlides(updated);
    dispatchUpdate(updated);
    try {
      await carouselApi.reorder(updated.map((s, i) => ({ id: s.id, order: i })));
    } catch (e) {
      toast.error(e.message || "Reorder failed");
      load();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Slides Manager</h2>
          <p className="mt-1 text-sm text-slate-500">{slides.length} slide(s) configured</p>
        </div>
        <button onClick={handleAddNew}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700">
          <Plus size={18} /> Add Slide
        </button>
      </div>

      <div className="space-y-3">
        {slides.map((slide, index) => (
          <div key={slide.id}
            className="rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg bg-slate-200">
                {slide.mediaType === "IMAGE" && slide.mediaUrl ? (
                  <img src={slide.mediaUrl} alt="" className="h-full w-full object-cover" />
                ) : slide.mediaType === "VIDEO" ? (
                  <div className="flex h-full items-center justify-center bg-slate-700">
                    <Video className="h-6 w-6 text-white" />
                  </div>
                ) : slide.mediaType === "SOLID" ? (
                  <div className="h-full w-full" style={{ backgroundColor: slide.solidColor }} />
                ) : (
                  <div className="h-full w-full" style={{
                    background: `linear-gradient(${slide.gradientColor?.gradientDirection || "to right"}, ${slide.gradientColor?.gradientColorStarts}, ${slide.gradientColor?.gradientColorEnds})`
                  }} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                    slide.mediaType === "IMAGE" ? "bg-green-100 text-green-700" :
                    slide.mediaType === "VIDEO" ? "bg-purple-100 text-purple-700" :
                    slide.mediaType === "SOLID" ? "bg-gray-100 text-gray-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>{slide.mediaType}</span>
                  <span className="text-xs text-slate-400">{slide.layoutType}</span>
                  {slide.videoLoop && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">Loop</span>}
                </div>
                <h4 className="mt-1 font-semibold text-slate-800 truncate">{slide.title || "Untitled Slide"}</h4>
                <p className="text-xs text-slate-500 truncate">{slide.description || "No description"}</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => moveSlide(index, -1)} disabled={index === 0}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30">
                  <MoveUp size={16} />
                </button>
                <button onClick={() => moveSlide(index, 1)} disabled={index === slides.length - 1}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 disabled:opacity-30">
                  <MoveDown size={16} />
                </button>
                <button onClick={() => handleEdit(slide)}
                  className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100">
                  <Edit size={16} />
                </button>
                <button onClick={() => handleDelete(slide.id)}
                  className="rounded-lg bg-red-50 p-2 text-red-600 hover:bg-red-100">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {slides.length === 0 && (
          <div className="py-12 text-center text-slate-400">
            <Image className="mx-auto h-12 w-12 mb-3 opacity-30" />
            <p className="font-semibold">No slides added yet</p>
            <p className="text-sm mt-1">Click "Add Slide" to create your first carousel slide.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <SlideEditorModal
          open={isModalOpen}
          initialData={editingSlide}
          onClose={() => { setIsModalOpen(false); setEditingSlide(null); }}
          onSave={handleSaveSlide}
        />
      )}
    </div>
  );
}