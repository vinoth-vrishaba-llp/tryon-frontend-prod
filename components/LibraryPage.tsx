import React, { useState, useEffect, useMemo } from 'react';
import { User, Page } from '../types';
import { apiClient } from '../services/apiClient';
import { deleteImageFromHistory } from '../historyManager';

interface LibraryPageProps {
  user: User;
  onNavigate: (page: Page) => void;
}

interface HistoryItem {
  id: string;
  imageUrl: string;
  thumbnailUrl?: string;
  creditsUsed: number;
  quality: string;
  section: string;
  category: string;
  createdAt: string;
}

type SortOption = 'newest' | 'oldest' | 'category_asc' | 'category_desc';

const LibraryPage: React.FC<LibraryPageProps> = ({ user, onNavigate }) => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<HistoryItem | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; ids: string[]; type: 'single' | 'bulk' }>({
    isOpen: false,
    ids: [],
    type: 'single'
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isModalImageLoading, setIsModalImageLoading] = useState(false);
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    // Initialize all images as loading when history changes
    if (history.length > 0) {
      setLoadingImages(new Set(history.map(item => item.id)));
    }
  }, [history.length]);

  const handleImageLoad = (id: string) => {
    setLoadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Add timestamp to prevent any browser caching
      const timestamp = Date.now();
      const data = await apiClient.get<HistoryItem[]>(`/history?_t=${timestamp}`);
      // Filter out items with no image URL
      const validData = (data || []).filter(item => item && item.imageUrl);
      setHistory(validData);
    } catch (err: any) {
      console.error('Failed to fetch history:', err);
      setError(err.message || 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle single item selection
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  // Select all filtered items
  const handleSelectAll = () => {
    if (selectedIds.size === filteredHistory.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredHistory.map(item => item.id)));
    }
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  // Open delete confirmation modal
  const openDeleteModal = (ids: string[], type: 'single' | 'bulk') => {
    setDeleteModal({ isOpen: true, ids, type });
  };

  // Close delete modal
  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, ids: [], type: 'single' });
  };

  // Confirm and execute delete
  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      for (const id of deleteModal.ids) {
        await deleteImageFromHistory(id);
      }
      setHistory(prev => prev.filter(item => !deleteModal.ids.includes(item.id)));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        deleteModal.ids.forEach(id => newSet.delete(id));
        return newSet;
      });
      if (selectedImage && deleteModal.ids.includes(selectedImage.id)) {
        setSelectedImage(null);
      }
      closeDeleteModal();
    } catch (err) {
      console.error('Failed to delete images:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle single delete from modal (with confirmation)
  const handleDeleteFromModal = (id: string) => {
    openDeleteModal([id], 'single');
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedIds.size > 0) {
      openDeleteModal(Array.from(selectedIds), 'bulk');
    }
  };

  const handleDownload = async (imageUrl: string, category: string) => {
    try {
      const filename = `${category || 'try-on'}-${Date.now()}.png`;
      const token = localStorage.getItem('auth_token');
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

      // Use backend proxy to bypass CORS
      const proxyUrl = `${apiBaseUrl}/download-image?url=${encodeURIComponent(imageUrl)}&filename=${encodeURIComponent(filename)}`;

      const response = await fetch(proxyUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank');
    }
  };

  const availableCategories = useMemo(() => {
    const cats = new Set(history.map(item => item.category || 'Uncategorized'));
    return Array.from(cats).sort();
  }, [history]);

  const filteredHistory = useMemo(() => {
    let result = [...history];

    if (filterCategory !== 'all') {
      result = result.filter(item =>
        (item.category?.toLowerCase() || '') === filterCategory.toLowerCase()
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        (item.category?.toLowerCase() || '').includes(query) ||
        (item.section?.toLowerCase() || '').includes(query) ||
        (item.quality?.toLowerCase() || '').includes(query)
      );
    }

    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      switch (sortBy) {
        case 'newest':
          return dateB - dateA;
        case 'oldest':
          return dateA - dateB;
        case 'category_asc':
          return (a.category || '').localeCompare(b.category || '');
        case 'category_desc':
          return (b.category || '').localeCompare(a.category || '');
        default:
          return dateB - dateA;
      }
    });

    return result;
  }, [history, filterCategory, searchQuery, sortBy]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getQualityBadgeColor = (quality: string) => {
    switch (quality?.toLowerCase()) {
      case 'ultra':
      case '4k':
        return 'bg-purple-100 text-purple-700';
      case 'high':
      case '2k':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>
        {/* Filter bar skeleton */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="md:w-48 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="md:w-48 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
        {/* Grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="rounded-xl overflow-hidden bg-gray-100 aspect-square">
              <div className="w-full h-full animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Library</h1>
          <p className="text-gray-600 mt-1">
            {history.length} {history.length === 1 ? 'image' : 'images'} generated
          </p>
        </div>
        <button
          onClick={() => onNavigate('home')}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-medium"
        >
          Back to Studio
        </button>
      </div>

      {/* Disclaimer Banner */}
      <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm font-medium text-amber-900">
            Images are automatically removed after 30 days
          </p>
          <p className="text-xs text-amber-700 mt-1">
            Download your favorite try-ons to keep them permanently.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
          {error}
          <button onClick={fetchHistory} className="ml-4 underline">
            Retry
          </button>
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No images yet</h3>
          <p className="text-gray-600 mb-6">Start generating try-on images to build your library</p>
          <button
            onClick={() => onNavigate('home')}
            className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-800 transition-all"
          >
            Go to Studio
          </button>
        </div>
      ) : (
        <>
          {/* Filters */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Search by category, section..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="md:w-48">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="md:w-48">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="category_asc">Category (A-Z)</option>
                  <option value="category_desc">Category (Z-A)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Selection Bar */}
          <div className="flex items-center justify-between mb-4 bg-white p-3 rounded-lg border border-gray-100">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filteredHistory.length > 0 && selectedIds.size === filteredHistory.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                />
                <span className="text-sm font-medium text-gray-700">
                  {selectedIds.size === filteredHistory.length && filteredHistory.length > 0 ? 'Deselect All' : 'Select All'}
                </span>
              </label>
              {selectedIds.size > 0 && (
                <span className="text-sm text-gray-500">
                  {selectedIds.size} {selectedIds.size === 1 ? 'image' : 'images'} selected
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete ({selectedIds.size})
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Results count */}
          {filteredHistory.length !== history.length && (
            <p className="text-sm text-gray-500 mb-4">
              Showing {filteredHistory.length} of {history.length} images
            </p>
          )}

          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className={`group relative rounded-xl overflow-hidden shadow-md cursor-pointer bg-gray-100 aspect-square ${
                  selectedIds.has(item.id) ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                onClick={() => {
                  setIsModalImageLoading(true);
                  setSelectedImage(item);
                }}
              >
                {/* Skeleton shimmer loader */}
                {loadingImages.has(item.id) && (
                  <div className="absolute inset-0 bg-gray-200 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200"></div>
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
                    {/* Placeholder icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                )}
                <img
                  src={item.thumbnailUrl || item.imageUrl}
                  alt={item.category || 'Generated image'}
                  className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
                    loadingImages.has(item.id) ? 'opacity-0' : 'opacity-100'
                  }`}
                  loading="lazy"
                  decoding="async"
                  fetchPriority="low"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
                  onLoad={() => handleImageLoad(item.id)}
                  onError={(e) => {
                    handleImageLoad(item.id);
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">No Image</text></svg>';
                  }}
                />

                {/* Checkbox */}
                <div
                  className="absolute top-2 left-2 z-10"
                  onClick={(e) => toggleSelect(item.id, e)}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                    selectedIds.has(item.id)
                      ? 'bg-primary border-primary'
                      : 'bg-white/90 border-gray-300 hover:border-primary'
                  }`}>
                    {selectedIds.has(item.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Quality Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getQualityBadgeColor(item.quality)}`}>
                    {item.quality || 'Standard'}
                  </span>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <p className="text-white text-sm font-bold truncate">{item.category || 'Try-On'}</p>
                  <p className="text-gray-300 text-xs">{formatDate(item.createdAt)}</p>
                  <p className="text-gray-400 text-xs">{item.creditsUsed} credits</p>
                </div>
              </div>
            ))}
          </div>

          {filteredHistory.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <p>No images found matching your criteria.</p>
              <button
                onClick={() => {
                  setFilterCategory('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-primary font-medium hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4"
          onClick={() => {
            setSelectedImage(null);
            setIsModalImageLoading(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
              <div className="min-w-0 flex-1 mr-2">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 truncate">{selectedImage.category || 'Virtual Try-On'}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{formatDate(selectedImage.createdAt)}</p>
              </div>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setIsModalImageLoading(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Image */}
            <div className="flex-1 overflow-auto p-2 sm:p-4 bg-gray-50 flex items-center justify-center min-h-0 relative">
              {/* Skeleton loading state */}
              {isModalImageLoading && (
                <div className="relative w-full h-[50vh] sm:h-[60vh] flex items-center justify-center">
                  <div className="w-full h-full max-w-2xl rounded-lg bg-gray-200 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200"></div>
                    <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>
                    {/* Image placeholder icon */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <svg className="w-16 h-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent"></div>
                        <span className="text-sm text-gray-400 font-medium">Loading full image...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {/* Full quality image */}
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.category || 'Generated image'}
                className={`max-w-full max-h-[50vh] sm:max-h-[60vh] object-contain rounded-lg shadow-lg transition-opacity duration-500 ${
                  isModalImageLoading ? 'absolute opacity-0' : 'opacity-100'
                }`}
                decoding="async"
                fetchPriority="high"
                onLoad={() => setIsModalImageLoading(false)}
                onError={() => setIsModalImageLoading(false)}
              />
            </div>

            {/* Modal Footer */}
            <div className="p-3 sm:p-4 border-t border-gray-100">
              {/* Info row */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getQualityBadgeColor(selectedImage.quality)}`}>
                  {selectedImage.quality || 'Standard'} Quality
                </span>
                <span className="text-xs sm:text-sm text-gray-500">
                  {selectedImage.creditsUsed} credits used
                </span>
              </div>
              {/* Buttons row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => handleDownload(selectedImage.imageUrl, selectedImage.category)}
                  className="flex items-center justify-center flex-1 px-4 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-indigo-800 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </button>
                <button
                  onClick={() => handleDeleteFromModal(selectedImage.id)}
                  className="flex items-center justify-center flex-1 sm:flex-none px-4 py-2.5 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 transition-all"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={closeDeleteModal}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {deleteModal.type === 'bulk' ? 'Delete Selected Images?' : 'Delete Image?'}
              </h3>
              <p className="text-gray-600">
                {deleteModal.type === 'bulk'
                  ? `Are you sure you want to delete ${deleteModal.ids.length} ${deleteModal.ids.length === 1 ? 'image' : 'images'}? This action cannot be undone.`
                  : 'Are you sure you want to delete this image? This action cannot be undone.'}
              </p>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </>
                ) : (
                  <>Delete</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;