import React, { useState } from 'react';
import { Report, ReportStatus, ISSUE_CATEGORIES } from '../../types';
import { updateReportStatus, updateReportNotes } from '../../services/reportService';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';

interface ReportDetailsProps {
  report: Report;
  onClose: () => void;
  onUpdate: (updatedReport: Report) => void;
  readOnly?: boolean;
}

const ReportDetails: React.FC<ReportDetailsProps> = ({ report, onClose, onUpdate, readOnly = false }) => {
  const [status, setStatus] = useState<ReportStatus>(report.status);
  const [adminNotes, setAdminNotes] = useState(report.adminNotes || '');
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const getIssueCategoryLabel = (categoryValue: string): string => {
    const category = ISSUE_CATEGORIES.find(c => c.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  const getStatusColor = (currentStatus: ReportStatus): string => {
    switch (currentStatus) {
      case 'new':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reviewed':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = async (newStatus: ReportStatus) => {
    setError(null);
    setSuccessMessage(null);
    setIsSavingStatus(true);

    try {
      const updatedReport = await updateReportStatus(report.id, newStatus);
      setStatus(newStatus);
      onUpdate(updatedReport);
      setSuccessMessage('Status updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsSavingStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    setError(null);
    setSuccessMessage(null);
    setIsSavingNotes(true);

    try {
      const updatedReport = await updateReportNotes(report.id, adminNotes);
      onUpdate(updatedReport);
      setSuccessMessage('Notes saved successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save notes');
    } finally {
      setIsSavingNotes(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl m-4 max-h-[95vh] overflow-y-auto">
        {/* Header - Sticky */}
        <div className="sticky top-0 bg-white border-b px-4 sm:px-6 py-4 flex justify-between items-start rounded-t-2xl z-10">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 truncate">Report Details</h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">ID: {report.id}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 text-green-700 text-sm">
              {successMessage}
            </div>
          )}

          {/* User Info & Report Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">User Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex flex-col sm:flex-row">
                  <span className="text-gray-600 sm:min-w-[80px]">Name:</span>
                  <span className="font-medium text-gray-900 break-words">{report.userName}</span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="text-gray-600 sm:min-w-[80px]">Email:</span>
                  <span className="font-medium text-gray-900 break-all">{report.userEmail}</span>
                </div>
                <div className="flex flex-col sm:flex-row">
                  <span className="text-gray-600 sm:min-w-[80px]">Date:</span>
                  <span className="font-medium text-gray-900">{formatDate(report.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Report Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">Report Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <span className="text-gray-600 min-w-[80px]">Feedback:</span>
                  {report.feedbackType === 'like'
                    ? <ThumbsUp size={20} className="text-green-600" />
                    : <ThumbsDown size={20} className="text-red-600" />
                  }
                </div>
                <div className="flex">
                  <span className="text-gray-600 min-w-[80px]">Section:</span>
                  <span className="font-medium text-gray-900 capitalize">{report.section}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 min-w-[80px]">Category:</span>
                  <span className="font-medium text-gray-900 capitalize">{report.category}</span>
                </div>
                <div className="flex">
                  <span className="text-gray-600 min-w-[80px]">Quality:</span>
                  <span className="font-medium text-gray-900 uppercase">{report.qualityUsed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Issue Details */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-2 text-sm sm:text-base">Issue Reported</h4>
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-yellow-200 text-yellow-900 rounded-full text-xs sm:text-sm font-medium">
                {getIssueCategoryLabel(report.issueCategory)}
              </span>
            </div>
            {report.customMessage && (
              <div className="mt-3">
                <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-1">Additional Details:</p>
                <p className="text-sm text-gray-800 bg-white rounded-md p-3 border border-yellow-200 break-words">
                  {report.customMessage}
                </p>
              </div>
            )}
          </div>

          {/* Images Comparison */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
            <h4 className="font-semibold text-gray-700 mb-4 text-sm sm:text-base">Image Comparison</h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Product Images */}
              {report.productImageUrls && report.productImageUrls.length > 0 && (
                <div>
                  <h5 className="text-xs sm:text-sm font-medium text-gray-600 mb-3">Uploaded Products</h5>
                  <div className="space-y-3">
                    {report.productImageUrls.map((url, idx) => (
                      <div key={idx} className="relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded font-medium z-10">
                          {report.productImageUrls!.length === 1 ? 'Product' : `Part ${idx + 1}`}
                        </div>
                        <img
                          src={url}
                          alt={`Product ${idx + 1}`}
                          className="w-full h-auto object-contain max-h-96"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generated Image */}
              {report.generatedImageUrl && (
                <div>
                  <h5 className="text-xs sm:text-sm font-medium text-gray-600 mb-3">Generated Result</h5>
                  <div className="relative bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                    <div className="absolute top-2 right-2 bg-accent text-white text-xs px-2 py-1 rounded font-medium z-10">
                      Generated
                    </div>
                    <img
                      src={report.generatedImageUrl}
                      alt="Generated result"
                      className="w-full h-auto object-contain max-h-96"
                    />
                  </div>
                </div>
              )}
            </div>

            {!report.generatedImageUrl && (!report.productImageUrls || report.productImageUrls.length === 0) && (
              <div className="text-center py-8 text-gray-400">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">No images attached to this report</p>
              </div>
            )}
          </div>

          {/* Status - Read-only for users, editable for admins */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">
              {readOnly ? 'Report Status' : 'Status Management'}
            </h4>
            {readOnly ? (
              <div className="flex items-center gap-2">
                <span className={`px-4 py-2 inline-flex text-sm font-semibold rounded-lg border-2 ${getStatusColor(status)}`}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {(['new', 'reviewed', 'resolved'] as ReportStatus[]).map((statusOption) => (
                  <button
                    key={statusOption}
                    onClick={() => handleStatusChange(statusOption)}
                    disabled={isSavingStatus || status === statusOption}
                    className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all disabled:cursor-not-allowed ${
                      status === statusOption
                        ? getStatusColor(statusOption) + ' border-2'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                    {status === statusOption && ' ✓'}
                  </button>
                ))}
                {isSavingStatus && (
                  <div className="flex items-center text-xs sm:text-sm text-gray-500">
                    <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Updating...
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Notes */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-700 mb-3 text-sm sm:text-base">
              {readOnly ? 'Admin Response' : 'Admin Notes'}
            </h4>
            {readOnly ? (
              adminNotes ? (
                <div className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-800 whitespace-pre-wrap">
                  {adminNotes}
                </div>
              ) : (
                <div className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 italic">
                  No admin response yet
                </div>
              )
            ) : (
              <>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this report..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none text-sm"
                  rows={4}
                />
                <button
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes || adminNotes === report.adminNotes}
                  className="mt-3 w-full sm:w-auto px-6 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSavingNotes ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    'Save Notes'
                  )}
                </button>
              </>
            )}
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4 border-t">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white text-sm font-semibold rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportDetails;
