import React, { useRef, useCallback, useState, useEffect } from 'react';
import { ImageFile } from '../types';
import ImageCropper from './ImageCropper';

interface ImageUploadCardProps {
  title: string;
  isOptional: boolean;
  onImageUpload: (imageFile: ImageFile) => void;
  onImageRemove: () => void;
  imageFile: ImageFile | null;
  className?: string;
  dropzoneClassName?: string;
  enableCropping?: boolean;
}

const ALLOWED_MIME_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ImageUploadCard: React.FC<ImageUploadCardProps> = ({ 
  title, 
  isOptional, 
  onImageUpload, 
  onImageRemove, 
  imageFile,
  className,
  dropzoneClassName,
  enableCropping = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropzoneRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const dragCounter = useRef(0);
  
  // Cropper state
  const [showCropper, setShowCropper] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  
  const validateFile = useCallback((file: File): string | null => {
      if (!file.type || !file.type.startsWith('image/')) {
          return "File must be an image.";
      }
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
          const ext = file.type ? file.type.split('/')[1]?.toUpperCase() : 'Unknown';
          return `Unsupported format: ${ext}. Please use PNG, JPEG, or WEBP.`;
      }
      return null;
  }, []);

  const uploadFile = useCallback((file: File) => {
    console.log("Uploading file:", file.name);
    setIsProcessing(true);
    setUploadProgress(0);
    setError(null);

    let progress = 0;

    // Simulate upload processing for better UX
    const interval = setInterval(() => {
      progress += 15;

      if (progress >= 100) {
        clearInterval(interval);
        setUploadProgress(100);
        console.log("Upload complete");

        // Use setTimeout to defer the parent state update
        // This prevents "Cannot update a component while rendering" error
        setTimeout(() => {
          const newImageFile: ImageFile = {
            id: `${file.name}-${Date.now()}`,
            file: file,
            previewUrl: URL.createObjectURL(file),
          };
          onImageUpload(newImageFile);
          setIsProcessing(false);
        }, 0);
      } else {
        setUploadProgress(progress);
      }
    }, 50);
  }, [onImageUpload]);

  // Wrap processFile in useCallback to prevent stale dependencies
  const processFile = useCallback((file: File | null | undefined) => {
    if (!file) {
      console.log("No file provided");
      return;
    }

    console.log("Processing file:", file.name, file.type, file.size);

    const validationError = validateFile(file);
    if (validationError) {
        console.log("Validation error:", validationError);
        setError(validationError);
        return;
    }

    console.log("File validated, enableCropping:", enableCropping);

    if (enableCropping) {
        setTempFile(file);
        setShowCropper(true);
    } else {
        uploadFile(file);
    }
  }, [validateFile, enableCropping, uploadFile]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("File input changed");
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input to allow selecting same file again
    event.target.value = '';
  }, [processFile]);
  
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current++;
    
    // Only set dragging if we don't already have an image and not processing
    if (!imageFile && !isProcessing) {
      // Check if any of the dragged items are files
      const hasFiles = e.dataTransfer.types.some(type => type === 'Files');
      if (hasFiles) {
        setIsDragging(true);
      }
    }
  }, [imageFile, isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    dragCounter.current--;
    
    // Only stop dragging when we've left the dropzone completely
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Use setTimeout to avoid state updates during render
    setTimeout(() => {
      dragCounter.current = 0;
      setIsDragging(false);
    }, 0);
    
    // Prevent drop when already has image or is processing
    if (imageFile || isProcessing) {
      console.log("Already has image or is processing");
      return;
    }
    
    const files = e.dataTransfer.files;
    console.log("Dropped files:", files.length);
    
    if (files && files.length > 0) {
      const file = files[0];
      console.log("Processing dropped file:", file.name);
      // Use setTimeout to process the file asynchronously
      setTimeout(() => {
        processFile(file);
      }, 0);
    } else {
      console.log("No files in dataTransfer");
    }
  }, [imageFile, isProcessing, processFile]);

  const handleCardClick = useCallback(() => {
    if (!imageFile && !isProcessing) {
      console.log("Opening file dialog");
      inputRef.current?.click();
    }
  }, [imageFile, isProcessing]);

  const handleCropConfirm = useCallback((croppedFile: File) => {
      console.log("Crop confirmed");
      setShowCropper(false);
      setTempFile(null);
      uploadFile(croppedFile);
  }, [uploadFile]);

  const handleCropCancel = useCallback(() => {
      console.log("Crop cancelled");
      setShowCropper(false);
      setTempFile(null);
  }, []);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("Removing image");
    onImageRemove();
    setError(null);
  }, [onImageRemove]);

  // Clean up drag counter on unmount
  useEffect(() => {
    return () => {
      dragCounter.current = 0;
    };
  }, []);

  return (
    <>
      <div className={`bg-white rounded-xl border border-gray-200 p-4 flex flex-col gap-3 transition-all ${className || 'h-full'}`}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between flex-shrink-0">
          <h3 className="text-sm font-semibold text-gray-800">
            {title}
            {!isOptional && <span className="text-red-400 ml-0.5">*</span>}
          </h3>
          {isOptional && (
            <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
              Optional
            </span>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 flex flex-col justify-center">

          {isProcessing ? (
            /* Processing — file row with animated progress bar */
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-10 h-10 rounded-lg bg-gray-200 animate-pulse flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-gray-700 truncate">Processing…</p>
                  <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{uploadProgress}%</span>
                </div>
                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#191919] rounded-full transition-all duration-100 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            </div>

          ) : imageFile ? (
            /* Uploaded — file row with thumbnail + complete progress */
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 group">
              <img
                src={imageFile.previewUrl}
                alt={imageFile.file.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{imageFile.file.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatFileSize(imageFile.file.size)}</p>
                <div className="mt-1.5 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full w-full" />
                </div>
              </div>
              <button
                onClick={handleRemove}
                type="button"
                aria-label="Remove image"
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

          ) : (
            /* Empty / Error — dropzone */
            <div
              ref={dropzoneRef}
              onClick={handleCardClick}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`w-full flex-1 min-h-[108px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 px-4 py-6 cursor-pointer transition-all duration-200 ${
                error
                  ? 'border-red-200 bg-red-50 hover:border-red-300'
                  : isDragging
                    ? 'border-gray-800 bg-gray-100'
                    : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
              } ${dropzoneClassName || ''}`}
            >
              <input
                type="file"
                ref={inputRef}
                onChange={handleFileChange}
                accept={ALLOWED_MIME_TYPES.join(', ')}
                className="hidden"
                disabled={isProcessing}
              />

              {error ? (
                <>
                  <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="text-center pointer-events-none">
                    <p className="text-xs font-medium text-red-600">{error}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Click to try again</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  </div>
                  <div className="text-center pointer-events-none">
                    <p className="text-xs font-medium text-gray-700">
                      {isDragging ? 'Drop to upload' : (
                        <>Drag & drop or <span className="underline text-gray-900">browse</span></>
                      )}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP</p>
                  </div>
                </>
              )}
            </div>
          )}

        </div>
      </div>

      {showCropper && tempFile && (
        <ImageCropper
          imageFile={tempFile}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}
    </>
  );
};

export default ImageUploadCard;