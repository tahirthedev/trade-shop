'use client';

import { useState } from 'react';
import { Star, ThumbsUp, MessageSquare, Calendar, CheckCircle } from 'lucide-react';
import { reviewsApi } from '@/lib/api/reviews';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Review, User } from '@/types';

interface ReviewListProps {
  reviews: Review[];
  onReviewAdded?: () => void;
  allowReviews?: boolean;
  professionalId?: string;
  projectId?: string;
  userId?: string;
}

export function ReviewList({ 
  reviews, 
  onReviewAdded, 
  allowReviews = false,
  professionalId,
  projectId,
  userId
}: ReviewListProps) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedReview, setExpandedReview] = useState<string | null>(null);

  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    quality: 5,
    communication: 5,
    timeliness: 5,
    professionalism: 5,
    title: '',
    comment: '',
    wouldRecommend: true,
  });

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!professionalId || !projectId || !userId) return;

    setSubmitting(true);
    try {
      const response: any = await reviewsApi.create({
        project: projectId,
        professional: professionalId,
        client: userId,
        rating: reviewForm.rating,
        detailedRatings: {
          quality: reviewForm.quality,
          communication: reviewForm.communication,
          timeliness: reviewForm.timeliness,
          professionalism: reviewForm.professionalism,
        },
        title: reviewForm.title,
        comment: reviewForm.comment,
        wouldRecommend: reviewForm.wouldRecommend,
      });

      if (response.success) {
        setShowReviewModal(false);
        setReviewForm({
          rating: 5,
          quality: 5,
          communication: 5,
          timeliness: 5,
          professionalism: 5,
          title: '',
          comment: '',
          wouldRecommend: true,
        });
        onReviewAdded?.();
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    try {
      await reviewsApi.markHelpful(reviewId);
      onReviewAdded?.();
    } catch (error) {
      console.error('Error marking helpful:', error);
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5',
    };

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const RatingInput = ({ 
    label, 
    value, 
    onChange 
  }: { 
    label: string; 
    value: number; 
    onChange: (val: number) => void;
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= value 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0 
      ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100 
      : 0,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4">
              <div className="text-6xl font-bold text-blue-600">
                {averageRating.toFixed(1)}
              </div>
              <div>
                {renderStars(Math.round(averageRating), 'lg')}
                <p className="text-gray-600 mt-1">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
            {allowReviews && (
              <Button onClick={() => setShowReviewModal(true)} className="w-full md:w-auto">
                Write a Review
              </Button>
            )}
          </div>

          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Be the first to leave a review!</p>
          </Card>
        ) : (
          reviews.map((review) => {
            const client = typeof review.client === 'object' ? review.client : null;
            const isExpanded = expandedReview === review._id;

            return (
              <Card key={review._id}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-lg">
                      {client?.name.charAt(0) || 'U'}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">{client?.name || 'Anonymous'}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          {renderStars(review.rating)}
                          {review.verified && (
                            <Badge variant="success" className="text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(review.createdAt).toLocaleDateString()}
                      </div>
                    </div>

                    {review.title && (
                      <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                    )}

                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    {review.detailedRatings && (
                      <button
                        onClick={() => setExpandedReview(isExpanded ? null : review._id)}
                        className="text-sm text-blue-600 hover:text-blue-700 mb-3"
                      >
                        {isExpanded ? 'Hide' : 'Show'} detailed ratings
                      </button>
                    )}

                    {isExpanded && review.detailedRatings && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        {Object.entries(review.detailedRatings).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-gray-600 capitalize mb-1">{key}</p>
                            {renderStars(value || 0, 'sm')}
                          </div>
                        ))}
                      </div>
                    )}

                    {review.response && (
                      <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded mt-4">
                        <p className="font-semibold text-blue-900 mb-2">Response from Professional</p>
                        <p className="text-gray-700 text-sm">{review.response.text}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(review.response.respondedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => handleMarkHelpful(review._id)}
                        className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">Helpful ({review.helpful})</span>
                      </button>
                      {review.wouldRecommend && (
                        <Badge variant="success" className="text-xs">
                          Would Recommend
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowReviewModal(false)}
          title="Write a Review"
        >
          <form onSubmit={handleSubmitReview} className="space-y-6">
            <div>
              <RatingInput
                label="Overall Rating"
                value={reviewForm.rating}
                onChange={(val) => setReviewForm({ ...reviewForm, rating: val })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <RatingInput
                label="Quality of Work"
                value={reviewForm.quality}
                onChange={(val) => setReviewForm({ ...reviewForm, quality: val })}
              />
              <RatingInput
                label="Communication"
                value={reviewForm.communication}
                onChange={(val) => setReviewForm({ ...reviewForm, communication: val })}
              />
              <RatingInput
                label="Timeliness"
                value={reviewForm.timeliness}
                onChange={(val) => setReviewForm({ ...reviewForm, timeliness: val })}
              />
              <RatingInput
                label="Professionalism"
                value={reviewForm.professionalism}
                onChange={(val) => setReviewForm({ ...reviewForm, professionalism: val })}
              />
            </div>

            <Input
              label="Review Title (Optional)"
              type="text"
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              placeholder="Sum up your experience..."
            />

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Your Review
              </label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Share your experience working with this professional..."
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="wouldRecommend"
                checked={reviewForm.wouldRecommend}
                onChange={(e) => setReviewForm({ ...reviewForm, wouldRecommend: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <label htmlFor="wouldRecommend" className="text-sm text-gray-700">
                I would recommend this professional to others
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowReviewModal(false)}
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
