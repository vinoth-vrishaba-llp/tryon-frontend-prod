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

    // Simulate upload processing for better UX
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          console.log("Upload complete");
          const newImageFile: ImageFile = {
            id: `${file.name}-${Date.now()}`,
            file: file,
            previewUrl: URL.createObjectURL(file),
          };
          onImageUpload(newImageFile);
          setIsProcessing(false);
          return 100;
        }
        return prev + 15;
      });
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
        <div 
          className={`bg-white rounded-lg shadow-md p-4 flex flex-col items-center justify-center transition-all ${className || 'h-full'}`}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
              {title} {!isOptional && <span className="text-red-500">*</span>}
          </h3>
          <p className="text-xs text-gray-500 mb-3">{isOptional ? 'Optional' : 'Required'}</p>
          
          <div 
            ref={dropzoneRef}
            onClick={handleCardClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`w-full ${dropzoneClassName || 'h-48'} border-2 border-dashed rounded-lg flex items-center justify-center relative transition-all duration-200 group overflow-hidden ${
              isDragging ? 'border-primary scale-105 bg-indigo-50 shadow-lg' : 'border-gray-300'
            } ${error ? 'border-red-300 bg-red-50' : ''} ${!imageFile && !isProcessing ? 'cursor-pointer hover:border-primary hover:bg-gray-50' : 'cursor-default'}`}
            style={{
              transform: isDragging ? 'scale(1.02)' : 'scale(1)',
              transition: 'all 0.2s ease'
            }}
          >
            <input
              type="file"
              ref={inputRef}
              onChange={handleFileChange}
              accept={ALLOWED_MIME_TYPES.join(', ')}
              className="hidden"
              disabled={isProcessing}
            />
            
            {isProcessing ? (
              <div className="w-full px-6 flex flex-col items-center">
                  <p className="text-sm font-semibold text-primary mb-2">Processing...</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                      className="bg-primary h-2.5 rounded-full transition-all duration-100 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                  ></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">{uploadProgress}%</p>
              </div>
            ) : imageFile ? (
              <>
                  <img src={imageFile.previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg p-1" />
                  <button
                  onClick={handleRemove}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove image"
                  type="button"
                  >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  </button>
              </>
            ) : (
              <div className="text-center text-gray-500 pointer-events-none px-2">
                  {error ? (
                      <div className="flex flex-col items-center text-red-500">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-xs font-medium">{error}</p>
                          <p className="text-xs mt-2 text-gray-400">Click to try again</p>
                      </div>
                  ) : (
                      <>
                          <div className={`transition-transform duration-200 ${isDragging ? 'scale-110' : ''}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <p className="mt-1 text-sm font-medium">
                            {isDragging ? 'Drop image here' : 'Click or drag to upload'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
                          {isDragging && (
                            <div className="mt-2 text-xs text-primary font-medium animate-pulse">
                              Release to upload
                            </div>
                          )}
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