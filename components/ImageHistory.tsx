
import React, { useState, useMemo } from 'react';
import { ImageHistoryItem } from '../types';

interface ImageHistoryProps {
  history: ImageHistoryItem[];
  onDelete: (id: string) => void;
}

type SortOption = 'newest' | 'oldest' | 'category_asc' | 'category_desc';

const ImageHistory: React.FC<ImageHistoryProps> = ({ history, onDelete }) => {
  const [selectedImage, setSelectedImage] = useState<ImageHistoryItem | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchTag, setSearchTag] = useState('');

  const availableCategories = useMemo(() => {
      const cats = new Set(history.map(item => item.category || 'Uncategorized'));
      return Array.from(cats).sort();
  }, [history]);

  const filteredHistory = useMemo(() => {
    let result = [...history];

    // Filter by category
    if (filterCategory !== 'all') {
        result = result.filter(item => 
            (item.category?.toLowerCase() || '') === filterCategory.toLowerCase()
        );
    }

    // Filter by text (tags logic placeholder)
    if (searchTag.trim()) {
        const lowerTag = searchTag.toLowerCase();
        result = result.filter(item => 
             (item.category?.toLowerCase() || '').includes(lowerTag)
        );
    }

    // Sort
    result.sort((a, b) => {
        switch (sortBy) {
            case 'newest':
                return b.timestamp - a.timestamp;
            case 'oldest':
                return a.timestamp - b.timestamp;
            case 'category_asc':
                return (a.category || '').localeCompare(b.category || '');
            case 'category_desc':
                return (b.category || '').localeCompare(a.category || '');
            default:
                return b.timestamp - a.timestamp;
        }
    });

    return result;
  }, [history, filterCategory, searchTag, sortBy]);


  if (history.length === 0) {
    return null;
  }

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  };

  const handleDownload = (e: React.MouseEvent, imageUrl: string) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `try-on-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="mt-16">
      <h3 className="text-3xl font-bold text-primary text-center mb-6">Your Recent Creations</h3>
      
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-lg shadow-sm mb-6 gap-4">
          <div className="flex gap-4 w-full md:w-auto flex-wrap">
              <div className="flex-1 md:flex-none">
                  <label className="block text-xs text-gray-500 mb-1">Sort By</label>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="w-full md:w-40 text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="category_asc">Category (A-Z)</option>
                      <option value="category_desc">Category (Z-A)</option>
                  </select>
              </div>
              <div className="flex-1 md:flex-none">
                  <label className="block text-xs text-gray-500 mb-1">Filter Category</label>
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full md:w-48 text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                  >
                      <option value="all">All Categories</option>
                      {availableCategories.map(c => (
                          <option key={c} value={c}>{c}</option>
                      ))}
                  </select>
              </div>
          </div>
          
          <div className="w-full md:w-64">
               <label className="block text-xs text-gray-500 mb-1">Search</label>
               <input 
                 type="text" 
                 placeholder="Search by name..." 
                 value={searchTag}
                 onChange={(e) => setSearchTag(e.target.value)}
                 className="w-full text-sm border-gray-300 rounded-md focus:ring-primary focus:border-primary"
               />
          </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredHistory.map((item) => (
          <div
            key={item.id}
            className="group relative rounded-lg overflow-hidden shadow-md cursor-pointer aspect-w-1 aspect-h-1 bg-gray-200"
            onClick={() => setSelectedImage(item)}
          >
            <img src={item.imageDataUrl} alt="Generated try-on" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-300 flex flex-col justify-end p-3">
                 <p className="text-white text-sm font-semibold truncate">{item.category || 'Virtual Try-On'}</p>
                 <p className="text-gray-300 text-xs">{formatDate(item.timestamp)}</p>
            </div>

            <button
                onClick={(e) => handleDelete(e, item.id)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100 z-10"
                aria-label="Delete image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        ))}
      </div>
      
      {filteredHistory.length === 0 && (
          <div className="text-center py-10 text-gray-500">
              <p>No images found matching your criteria.</p>
          </div>
      )}

      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" 
          aria-modal="true" 
          role="dialog"
          onClick={() => setSelectedImage(null)}
        >
          <div className="bg-white rounded-lg shadow-2xl p-4 max-w-3xl w-full relative flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={selectedImage.imageDataUrl} alt="Selected try-on" className="w-full h-auto object-contain rounded-md" style={{ maxHeight: '75vh' }} />
            <div className="mt-4 w-full flex justify-between items-center px-2">
                <div>
                     <p className="text-lg font-bold text-gray-800">{selectedImage.category || 'Virtual Try-On'}</p>
                     <p className="text-sm text-gray-500">{formatDate(selectedImage.timestamp)}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={(e) => handleDownload(e, selectedImage.imageDataUrl)}
                    className="flex items-center px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                  <button 
                  onClick={() => setSelectedImage(null)} 
                  className="bg-gray-200 text-gray-800 rounded-lg px-4 py-2 hover:bg-gray-300 transition-colors"
                  >
                  Close
                  </button>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageHistory;
