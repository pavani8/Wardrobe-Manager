import React, { useState, useRef, useCallback } from 'react';
import { FiRotateCw, FiCheck, FiX, FiZoomIn, FiZoomOut } from 'react-icons/fi';

const ImageEditor = ({ imageSrc, onSave, onCancel }) => {
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 10, y: 10, w: 80, h: 80 });
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null);

  const rotate = () => setRotation((r) => (r + 90) % 360);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragging || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setCrop((prev) => ({
        ...prev,
        x: Math.max(0, Math.min(100 - prev.w, x - prev.w / 2)),
        y: Math.max(0, Math.min(100 - prev.h, y - prev.h / 2))
      }));
    },
    [dragging]
  );

  const handleMouseUp = () => setDragging(false);

  const applyEdit = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const rad = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(rad));
      const cos = Math.abs(Math.cos(rad));
      const fullW = img.width * cos + img.height * sin;
      const fullH = img.width * sin + img.height * cos;

      canvas.width = fullW;
      canvas.height = fullH;
      ctx.translate(fullW / 2, fullH / 2);
      ctx.rotate(rad);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const cropX = (crop.x / 100) * fullW;
      const cropY = (crop.y / 100) * fullH;
      const cropW = (crop.w / 100) * fullW;
      const cropH = (crop.h / 100) * fullH;

      const cropCanvas = document.createElement('canvas');
      cropCanvas.width = cropW;
      cropCanvas.height = cropH;
      cropCanvas.getContext('2d').drawImage(
        canvas,
        cropX, cropY, cropW, cropH,
        0, 0, cropW, cropH
      );

      cropCanvas.toBlob(
        (blob) => {
          const file = new File([blob], `edited-${Date.now()}.jpg`, { type: 'image/jpeg' });
          onSave(file, cropCanvas.toDataURL('image/jpeg'));
        },
        'image/jpeg',
        0.92
      );
    };
    img.src = imageSrc;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Edit Photo</h3>
          <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full">
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div
          ref={containerRef}
          className="relative mx-4 mt-4 aspect-square bg-gray-900 rounded-lg overflow-hidden select-none"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={(e) => {
            if (dragging && e.touches[0]) {
              handleMouseMove({ clientX: e.touches[0].clientX, clientY: e.touches[0].clientY });
            }
          }}
          onTouchEnd={handleMouseUp}
        >
          <img
            src={imageSrc}
            alt="Edit"
            className="w-full h-full object-contain pointer-events-none"
            style={{
              transform: `rotate(${rotation}deg) scale(${zoom})`,
              transition: dragging ? 'none' : 'transform 0.2s'
            }}
          />
          <div
            className="absolute border-2 border-white border-dashed cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]"
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.w}%`,
              height: `${crop.h}%`
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
          />
        </div>

        <div className="p-4 flex flex-wrap gap-2 justify-center">
          <button
            type="button"
            onClick={rotate}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            <FiRotateCw /> Rotate
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            <FiZoomIn /> Zoom
          </button>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm font-medium"
          >
            <FiZoomOut /> Out
          </button>
        </div>

        <div className="p-4 border-t flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={applyEdit}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium flex items-center justify-center gap-2"
          >
            <FiCheck /> Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
