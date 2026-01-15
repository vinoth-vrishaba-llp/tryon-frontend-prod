
import React, { useState } from 'react';

interface TryOnResultProps {
  imageUrl: string;
  originalImage?: string; // URL for the comparison image (custom model)
  onReset: () => void;
  onRetry: () => void;
  isLoading: boolean;
}

const TryOnResult: React.FC<TryOnResultProps> = ({ imageUrl, originalImage, onReset, onRetry, isLoading }) => {
  const [showComparison, setShowComparison] = useState(false);

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
      {originalImage && (
          <div className="flex justify-center mb-4">
              <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                  <button
                      onClick={() => setShowComparison(false)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${!showComparison ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      Single View
                  </button>
                  <button
                      onClick={() => setShowComparison(true)}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${showComparison ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                  >
                      Split Comparison
                  </button>
              </div>
          </div>
      )}

      <div className={`mx-auto bg-white rounded-lg shadow-xl overflow-hidden p-4 relative transition-all duration-300 ${showComparison ? 'max-w-5xl' : 'max-w-2xl'}`}>
         {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-10 rounded-lg">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-gray-600 font-medium animate-pulse">Refining image...</p>
          </div>
        )}
        
        {showComparison && originalImage ? (
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                    <span className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">Original</span>
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
    </div>
  );
};

export default TryOnResult;
