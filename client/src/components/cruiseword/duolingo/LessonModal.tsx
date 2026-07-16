import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 transition-opacity duration-300"
        onClick={onClose}
        aria-label="Close lesson"
        role="button"
      />
      {/* Modal */}
      <div
        ref={modalRef}
        className="relative flex w-full max-w-4xl flex-col rounded-2xl border-2 border-gray-200 bg-white shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-3">
          {title && <h2 className="text-lg font-bold text-gray-800">{title}</h2>}
          <button
            className="ml-auto rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

export default LessonModal;
