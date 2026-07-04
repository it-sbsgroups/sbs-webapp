"use client";

import { useCallback, useRef, useState } from "react";
import ReactCrop, { centerCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { X, Check, Square } from "lucide-react";

export default function EmployeeImageCropper({ file, onCancel, onCropped }) {
  const [imgSrc] = useState(() => URL.createObjectURL(file));
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const [aspect, setAspect] = useState(undefined); // undefined = free rectangle
  const [busy, setBusy] = useState(false);
  const imgRef = useRef(null);

  const initCrop = (width, height, asp) => {
    const w = 80;
    const h = asp ? (width * (w / 100)) / asp / height * 100 : 80;
    return centerCrop(
      { unit: "%", width: w, height: Math.min(h, 80), x: 10, y: 10 },
      width,
      height,
    );
  };

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(initCrop(width, height, aspect));
  };

  const toggleAspect = () => {
    const next = aspect ? undefined : 1;
    setAspect(next);
    const image = imgRef.current;
    if (image) setCrop(initCrop(image.width, image.height, next));
  };

  const applyCrop = useCallback(async () => {
    const image = imgRef.current;
    if (!image || !completedCrop?.width || !completedCrop?.height) return;
    setBusy(true);
    try {
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pxW = Math.max(1, Math.round(completedCrop.width * scaleX));
      const pxH = Math.max(1, Math.round(completedCrop.height * scaleY));

      const canvas = document.createElement("canvas");
      canvas.width = pxW;
      canvas.height = pxH;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        image,
        completedCrop.x * scaleX,
        completedCrop.y * scaleY,
        pxW,
        pxH,
        0,
        0,
        pxW,
        pxH,
      );

      // Prefer WebP; fall back to JPEG if the browser can't encode WebP.
      let blob = await new Promise((res) =>
        canvas.toBlob((b) => res(b), "image/webp", 0.9),
      );
      if (!blob) {
        blob = await new Promise((res) =>
          canvas.toBlob((b) => res(b), "image/jpeg", 0.9),
        );
      }
      if (!blob) throw new Error("Could not process image");

      const ext = blob.type === "image/webp" ? "webp" : "jpg";
      const outFile = new File([blob], `employee-photo.${ext}`, {
        type: blob.type,
      });
      onCropped(outFile);
    } finally {
      setBusy(false);
    }
  }, [completedCrop, onCropped]);

  return (
    <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-900">Crop photo</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[58vh] overflow-auto flex justify-center bg-gray-50">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={imgRef}
              src={imgSrc}
              alt="To crop"
              onLoad={onImageLoad}
              style={{ maxHeight: "52vh" }}
            />
          </ReactCrop>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleAspect}
              className={`text-xs px-3 py-1.5 rounded-lg border flex items-center gap-1 ${
                aspect
                  ? "bg-blue-50 border-blue-300 text-blue-700"
                  : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              {aspect ? "Square: on" : "Square: off"}
            </button>
            <p className="text-xs text-gray-400">
              Drag to select the area to keep · exported as WebP
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={applyCrop}
              disabled={busy || !completedCrop?.width}
              className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 flex items-center gap-1"
            >
              <Check className="w-4 h-4" />
              {busy ? "Processing…" : "Apply & Upload"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
