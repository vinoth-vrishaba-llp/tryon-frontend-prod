
import React, { useState } from 'react';
import FeedbackModal from './FeedbackModal';
import { Section } from '../types';

interface TryOnResultProps {
  imageUrl: string;
  originalImage?: string; // URL for the comparison image (custom model)
  productImages?: string[]; // URLs for uploaded product images
  section: Section;
  category: string;
  qualityUsed: string;
  historyId?: string;
  onReset: () => void;
  onRetry: () => void;
  isLoading: boolean;
}

type ViewMode = 'single' | 'model-comparison' | 'product-comparison';

const TryOnResult: React.FC<TryOnResultProps> = ({
  imageUrl,
  originalImage,
  productImages,
  section,
  category,
  qualityUsed,
  historyId,
  onReset,
  onRetry,
  isLoading
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `virtual-try-on-result-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const shareImage = async () => {
      try {
          // Convert base64/url to blob for sharing
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], "try-on-result.png", { type: "image/png" });

          if (navigator.share) {
              await navigator.share({
                  title: 'My Virtual Try-On',
                  text: 'Check out my AI-generated style!',
                  files: [file]
              });
          } else {
              alert("Sharing is not supported on this browser/device. You can download the image instead.");
          }
      } catch (error) {
          console.error("Error sharing:", error);
      }
  };

  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold text-primary mb-4">Your Virtual Try-On Result!</h2>
      
      {/* View Toggle */}
      {(originalImage || (productImages && productImages.length > 0)) && (
          <div className="flex justify-center mb-4">
              <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                  <button
                      onClick={() => setViewMode('single')}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'single' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      Single View
                  </button>
                  {originalImage && (
                      <button
                          onClick={() => setViewMode('model-comparison')}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'model-comparison' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          Model Comparison
                      </button>
                  )}
                  {productImages && productImages.length > 0 && (
                      <button
                          onClick={() => setViewMode('product-comparison')}
                          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${viewMode === 'product-comparison' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                          Product Check
                      </button>
                  )}
              </div>
          </div>
      )}

      <div className={`mx-auto bg-white rounded-lg shadow-xl overflow-hidden p-4 relative transition-all duration-300 ${viewMode !== 'single' ? 'max-w-6xl' : 'max-w-2xl'}`}>
         {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-10 rounded-lg">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 font-medium animate-pulse">Refining image...</p>
          </div>
        )}

        {viewMode === 'model-comparison' && originalImage ? (
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Original Model</span>
                    <img src={originalImage} alt="Original" className="w-full h-auto object-contain rounded-md" />
                </div>
                <div className="relative">
                    <span className="absolute top-2 right-2 bg-accent/80 text-white text-xs px-2 py-1 rounded">Generated</span>
                    <img
                        src={imageUrl}
                        alt="Generated"
                        className="w-full h-auto object-contain rounded-md"
                    />
                </div>
            </div>
        ) : viewMode === 'product-comparison' && productImages && productImages.length > 0 ? (
            <div className={`grid gap-4 ${productImages.length === 1 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                {/* Product Images */}
                <div className={`${productImages.length > 1 ? 'col-span-1' : 'col-span-1'} space-y-3`}>
                    <h3 className="text-sm font-bold text-gray-700 mb-2 text-center">Uploaded Products</h3>
                    {productImages.map((imgUrl, idx) => (
                        <div key={idx} className="relative bg-gray-50 rounded-md p-2">
                            <span className="absolute top-3 left-3 bg-blue-500/80 text-white text-xs px-2 py-0.5 rounded font-medium">
                                {productImages.length === 1 ? 'Product' : `Part ${idx + 1}`}
                            </span>
                            <img
                                src={imgUrl}
                                alt={`Product ${idx + 1}`}
                                className="w-full h-auto object-contain rounded-md"
                            />
                        </div>
                    ))}
                </div>
                {/* Generated Image */}
                <div className={`${productImages.length > 1 ? 'col-span-2' : 'col-span-1'} relative`}>
                    <h3 className="text-sm font-bold text-gray-700 mb-2 text-center">Generated Result</h3>
                    <div className="relative bg-gray-50 rounded-md p-2">
                        <span className="absolute top-3 right-3 bg-accent/80 text-white text-xs px-2 py-0.5 rounded font-medium">Generated</span>
                        <img
                            src={imageUrl}
                            alt="Generated"
                            className="w-full h-auto object-contain rounded-md"
                        />
                    </div>
                </div>
            </div>
        ) : (
            <img
                src={imageUrl}
                alt="Generated try-on"
                className={`w-full h-auto object-contain rounded-md transition-all duration-500`}
            />
        )}
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button
          onClick={shareImage}
          className="flex items-center justify-center px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 transition-colors duration-300 w-full sm:w-auto"
        >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
        </button>

        <button
          onClick={downloadImage}
          disabled={isLoading}
          className="flex items-center justify-center px-6 py-3 bg-secondary text-white font-semibold rounded-lg shadow-md hover:bg-primary transition-colors duration-300 w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download
        </button>
        <button
          onClick={onRetry}
          disabled={isLoading}
          className="flex items-center justify-center px-6 py-3 bg-accent text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 transition-colors duration-300 w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.65 6.35A7.958 7.958 0 0012 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
          </svg>
          {isLoading ? 'Retrying...' : 'Retry Generation'}
        </button>
        <button
          onClick={() => setShowFeedbackModal(true)}
          disabled={isLoading}
          className="flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg shadow-md hover:bg-orange-600 transition-colors duration-300 w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Report Issue
        </button>
        <button
          onClick={onReset}
          disabled={isLoading}
          className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition-colors duration-300 w-full sm:w-auto disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          Back to Edit
        </button>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        generatedImageUrl={imageUrl}
        productImageUrls={productImages}
        section={section}
        category={category}
        qualityUsed={qualityUsed}
        historyId={historyId}
      />
    </div>
  );
};

export default TryOnResult;
