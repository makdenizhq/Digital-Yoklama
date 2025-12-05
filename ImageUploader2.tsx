import React, { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  image: string | undefined;
  onImageChange: (base64: string) => void;
  onRemove: () => void;
  className?: string;
  isCircular?: boolean; // Profil resmi için yuvarlak, logo için kare/dikdörtgen
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  label, 
  image, 
  onImageChange, 
  onRemove,
  className = "",
  isCircular = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Base64 string'i döner
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">
            {label}
        </label>
      )}
      
      <div className="relative inline-block group">
        {/* Preview Area */}
        <div 
          onClick={triggerFileSelect}
          className={`
            relative cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-500 transition-all bg-slate-50 flex items-center justify-center
            ${isCircular ? 'w-32 h-32 rounded-full' : 'w-40 h-40 rounded-xl'}
          `}
        >
          {image ? (
            <>
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <Upload size={24} />
              </div>
            </>
          ) : (
            <div className="text-slate-400 flex flex-col items-center gap-2 text-center p-2">
              <ImageIcon size={32} />
              <span className="text-xs font-medium">Upload</span>
            </div>
          )}
        </div>

        {/* Remove Button (Only visible if image exists) */}
        {image && (
            <button
                type="button"
                onClick={(e) => {
                    e.stopPropagation();
                    onRemove();
                }}
                className={`
                    absolute bg-red-500 text-white p-1.5 rounded-full shadow-md hover:bg-red-600 transition z-20 border-2 border-white
                    ${isCircular ? 'top-0 right-0' : '-top-2 -right-2'}
                `}
                title="Resmi Kaldır"
            >
                <X size={14} />
            </button>
        )}
      </div>

      <p className="text-xs text-slate-400">
        PNG, JPG veya GIF (Max. 2MB)
      </p>

      {/* Hidden Native Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        className="hidden" 
      />
    </div>
  );
};

export default ImageUploader;