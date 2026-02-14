import React, { useState } from 'react';
import { AdminUserImage, AdminUserImagesFilters, AdminUserImagesFilterOptions } from '../../types';

interface UserImageGalleryProps {
    images: AdminUserImage[];
    isLoading: boolean;
    pagination: {
        page: number;
        totalPages: number;
        total: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
    filterOptions?: AdminUserImagesFilterOptions;
    filters: AdminUserImagesFilters;
    onPageChange: (page: number) => void;
    onFilterChange: (filters: AdminUserImagesFilters) => void;
    onImageClick: (image: AdminUserImage) => void;
}

const UserImageGallery: React.FC<UserImageGalleryProps> = ({
    images,
    isLoading,
    pagination,
    filterOptions,
    filters,
    onPageChange,
    onFilterChange,
    onImageClick
}) => {
    const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
    const [showFilters, setShowFilters] = useState(false);

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

    const handleImageLoad = (id: string) => {
        setLoadingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
    };

    const handleFilterChange = (key: keyof AdminUserImagesFilters, value: string) => {
        const newFilters = { ...filters, [key]: value || undefined };
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        onFilterChange({});
    };

    const hasActiveFilters = filters.section || filters.category || filters.quality || filters.dateFrom || filters.dateTo;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading images...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                                showFilters ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Filters
                            {hasActiveFilters && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            )}
                        </button>
                        {hasActiveFilters && (
                            <button
                                onClick={clearFilters}
                                className="text-sm text-gray-500 hover:text-gray-700 underline"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                    <p className="text-sm text-gray-600">
                        {pagination.total} image{pagination.total !== 1 ? 's' : ''} found
                    </p>
                </div>

                {/* Filter Options */}
                {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                        {/* Section Filter */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Section</label>
                            <select
                                value={filters.section || 'all'}
                                onChange={(e) => handleFilterChange('section', e.target.value === 'all' ? '' : e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            >
                                <option value="all">All Sections</option>
                                {filterOptions?.sections.map(section => (
                                    <option key={section} value={section}>{section}</option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Category</label>
                            <select
                                value={filters.category || 'all'}
                                onChange={(e) => handleFilterChange('category', e.target.value === 'all' ? '' : e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            >
                                <option value="all">All Categories</option>
                                {filterOptions?.categories.map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>
                        </div>

                        {/* Quality Filter */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Quality</label>
                            <select
                                value={filters.quality || 'all'}
                                onChange={(e) => handleFilterChange('quality', e.target.value === 'all' ? '' : e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            >
                                <option value="all">All Qualities</option>
                                {filterOptions?.qualities.map(quality => (
                                    <option key={quality} value={quality}>{quality}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date From */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">From Date</label>
                            <input
                                type="date"
                                value={filters.dateFrom || ''}
                                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                        </div>

                        {/* Date To */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">To Date</label>
                            <input
                                type="date"
                                value={filters.dateTo || ''}
                                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Empty State */}
            {images.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {hasActiveFilters ? 'No images match your filters' : 'No images generated'}
                    </h3>
                    <p className="text-gray-600">
                        {hasActiveFilters
                            ? 'Try adjusting your filters to see more results.'
                            : "This user hasn't generated any images yet."
                        }
                    </p>
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-all"
                        >
                            Clear Filters
                        </button>
                    )}
                </div>
            ) : (
                <>
                    {/* Image Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {images.map((item) => (
                            <div
                                key={item.id}
                                className="group relative rounded-xl overflow-hidden shadow-md cursor-pointer bg-gray-100 aspect-square"
                                onClick={() => onImageClick(item)}
                            >
                                {/* Skeleton loader */}
                                {loadingImages.has(item.id) && (
                                    <div className="absolute inset-0 animate-pulse bg-gray-200 flex items-center justify-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent"></div>
                                    </div>
                                )}
                                <img
                                    src={item.thumbnailUrl || item.imageUrl}
                                    alt={item.category || 'Generated image'}
                                    className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                                        loadingImages.has(item.id) ? 'opacity-0' : 'opacity-100'
                                    }`}
                                    loading="lazy"
                                    onLoad={() => handleImageLoad(item.id)}
                                    onError={(e) => {
                                        handleImageLoad(item.id);
                                        (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect fill="%23f3f4f6" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12">No Image</text></svg>';
                                    }}
                                />

                                {/* Quality Badge */}
                                <div className="absolute top-2 right-2">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getQualityBadgeColor(item.quality)}`}>
                                        {item.quality || 'Standard'}
                                    </span>
                                </div>

                                {/* Overlay on hover */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                                    <p className="text-white text-sm font-bold truncate">{item.category || 'Try-On'}</p>
                                    <p className="text-gray-300 text-xs">{formatDate(item.createdAt)}</p>
                                    <p className="text-gray-400 text-xs">{item.creditsUsed} credits</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button
                                onClick={() => onPageChange(pagination.page - 1)}
                                disabled={!pagination.hasPrev}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <span className="text-sm text-gray-600">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => onPageChange(pagination.page + 1)}
                                disabled={!pagination.hasNext}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default UserImageGallery;
