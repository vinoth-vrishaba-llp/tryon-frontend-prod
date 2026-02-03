import React, { useState } from 'react';
import { IssueCategory, ISSUE_CATEGORIES, Section, CreateReportData } from '../types';
import { submitReport } from '../services/reportService';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedImageUrl: string;
  productImageUrls?: string[];
  section: Section;
  category: string;
  qualityUsed: string;
  historyId?: string;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  generatedImageUrl,
  productImageUrls,
  section,
  category,
  qualityUsed,
  historyId,
}) => {
  const [step, setStep] = useState<'feedback' | 'report'>('feedback');
  const [selectedCategory, setSelectedCategory] = useState<IssueCategory | ''>('');
  const [customMessage, setCustomMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Helper to convert data URL to Blob
  const dataURLtoBlob = async (dataURL: string): Promise<Blob> => {
    const response = await fetch(dataURL);
    return await response.blob();
  };

  const handleLike = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert generated image to blob
      const generatedBlob = await dataURLtoBlob(generatedImageUrl);

      // Create simple like feedback
      const reportData: CreateReportData = {
        feedbackType: 'like',
        issueCategory: 'other',
        customMessage: 'User liked the result',
        section,
        category,
        qualityUsed,
        historyId,
      };

      await submitReport(reportData, generatedBlob);
      setSuccess(true);

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
      setIsSubmitting(false);
    }
  };

  const handleDislike = () => {
    setStep('report');
  };

  const handleSubmitReport = async () => {
    if (!selectedCategory) {
      setError('Please select an issue category');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Convert generated image to blob
      const generatedBlob = await dataURLtoBlob(generatedImageUrl);

      // Convert product images to blobs if provided
      let productBlobs: Blob[] | undefined;
      if (productImageUrls && productImageUrls.length > 0) {
        productBlobs = await Promise.all(
          productImageUrls.map(url => dataURLtoBlob(url))
        );
      }

      const reportData: CreateReportData = {
        feedbackType: 'dislike',
        issueCategory: selectedCategory as IssueCategory,
        customMessage: customMessage.trim() || undefined,
        section,
        category,
        qualityUsed,
        historyId,
      };

      await submitReport(reportData, generatedBlob, productBlobs);
      setSuccess(true);

      // Close modal after showing success
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
      setIsSubmitting(false);
    }
  };

  const resetModal = () => {
    setStep('feedback');
    setSelectedCategory('');
    setCustomMessage('');
    setIsSubmitting(false);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      setTimeout(resetModal, 300);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h3 className="text-xl font-bold text-gray-800">
            {step === 'feedback' ? 'How was your result?' : 'Report an Issue'}
          </h3>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {success ? (
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Thank you!</h4>
              <p className="text-gray-600">
                {step === 'feedback' ? 'Your feedback has been recorded.' : 'Your report has been submitted.'}
              </p>
            </div>
          ) : step === 'feedback' ? (
            <>
              <p className="text-gray-600 text-center mb-6">
                We'd love to hear your feedback about the generated image.
              </p>

              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleLike}
                  disabled={isSubmitting}
                  className="flex-1 py-6 px-8 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">👍</div>
                  <div className="text-lg font-semibold text-green-700">Love it!</div>
                </button>

                <button
                  onClick={handleDislike}
                  disabled={isSubmitting}
                  className="flex-1 py-6 px-8 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
                >
                  <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">👎</div>
                  <div className="text-lg font-semibold text-red-700">Not quite</div>
                </button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Issue Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  What went wrong? <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  {ISSUE_CATEGORIES.map((issue) => (
                    <button
                      key={issue.value}
                      onClick={() => setSelectedCategory(issue.value)}
                      disabled={isSubmitting}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                        selectedCategory === issue.value
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="font-medium text-gray-800">{issue.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{issue.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Additional details (optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  disabled={isSubmitting}
                  placeholder="Tell us more about the issue..."
                  className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none transition-colors resize-none disabled:opacity-50 disabled:bg-gray-50"
                  rows={4}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('feedback')}
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitReport}
                  disabled={isSubmitting || !selectedCategory}
                  className="flex-1 py-3 px-4 bg-primary hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>

              {/* Info Note */}
              <p className="mt-4 text-xs text-gray-500 text-center">
                Your report will include the generated image and uploaded products for our review.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
