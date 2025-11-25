'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { projectsApi } from '@/lib/api/projects';

interface PostJobWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

export function PostJobWizard({ onClose, onSuccess }: PostJobWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [showingAnalysis, setShowingAnalysis] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tradeTypes: [] as string[],
    budget: { min: 0, max: 0 },
    location: { city: '', state: '', zipCode: '' },
    timeline: { start: '', deadline: '' },
    urgency: 'medium' as 'low' | 'medium' | 'high',
  });

  const totalSteps = 5;

  const tradeOptions = [
    'Electrician',
    'Plumber',
    'HVAC',
    'Carpenter',
    'Painter',
    'Mason',
    'Roofer',
    'General Contractor',
  ];

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');

      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        setError('Please login to post a job');
        return;
      }

      const user = JSON.parse(userStr);
      
      const response = await projectsApi.create({
        ...formData,
        client: user._id,
        status: 'new',
      }, token) as any;

      if (response.success) {
        // Show AI analysis if available
        if (response.aiAnalysis) {
          setAiAnalysis(response.aiAnalysis);
          setShowingAnalysis(true);
        } else {
          onSuccess();
          onClose();
        }
      } else {
        setError(response.message || 'Error creating job posting');
      }
    } catch (err: any) {
      setError(err.message || 'Error creating job posting');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseAnalysis = () => {
    setShowingAnalysis(false);
    onSuccess();
    onClose();
  };

  const toggleTrade = (trade: string) => {
    if (formData.tradeTypes.includes(trade)) {
      setFormData({
        ...formData,
        tradeTypes: formData.tradeTypes.filter((t) => t !== trade),
      });
    } else {
      setFormData({
        ...formData,
        tradeTypes: [...formData.tradeTypes, trade],
      });
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() !== '' && formData.description.trim() !== '';
      case 2:
        return formData.tradeTypes.length > 0;
      case 3:
        return formData.budget.min > 0 && formData.budget.max > 0 && formData.budget.max >= formData.budget.min;
      case 4:
        return formData.location.city !== '' && formData.location.state !== '';
      case 5:
        return true;
      default:
        return false;
    }
  };

  if (!mounted) return null;

  // Show AI Analysis Results Screen
  if (showingAnalysis && aiAnalysis) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold text-green-600">✅ Job Posted Successfully!</h2>
            <p className="text-gray-600 mt-1">AI Analysis of Your Project</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">📋 Project Summary</h3>
              <p className="text-gray-700">{aiAnalysis.summary}</p>
            </div>

            {/* Complexity & Risk */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-purple-900 mb-2">Complexity Score</h4>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-purple-600">{aiAnalysis.complexityScore}</span>
                  <span className="text-gray-600">/ 10</span>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-900 mb-2">Risk Level</h4>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  aiAnalysis.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                  aiAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {aiAnalysis.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Recommended Skills */}
            {aiAnalysis.recommendedSkills && aiAnalysis.recommendedSkills.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-3">🎯 Recommended Skills</h4>
                <div className="flex flex-wrap gap-2">
                  {aiAnalysis.recommendedSkills.map((skill: string, index: number) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Timeline & Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">⏱️ Estimated Timeline</h4>
                <p className="text-gray-700">{aiAnalysis.estimatedTimeline}</p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">💰 Budget Range</h4>
                <p className="text-gray-700">{aiAnalysis.budgetRange}</p>
              </div>
            </div>

            {/* Cleaned Description */}
            {aiAnalysis.cleanedDescription && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-2">✨ Professional Description</h4>
                <p className="text-gray-700 italic">{aiAnalysis.cleanedDescription}</p>
              </div>
            )}

            {/* Recommendations */}
            {aiAnalysis.recommendations && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-900 mb-2">💡 Recommendations</h4>
                <p className="text-gray-700">{aiAnalysis.recommendations}</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-gray-50">
            <Button onClick={handleCloseAnalysis} className="w-full">
              Continue to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Post a Job</h2>
            <p className="text-sm text-gray-600 mt-1">
              Step {currentStep} of {totalSteps}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 rounded-full transition-all ${
                  index + 1 <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="p-6">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Tell us about your project
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="e.g., Install new electrical panel"
                  maxLength={100}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Project Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Describe your project in detail. Include what work needs to be done, any specific requirements, and timeline expectations..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Be as detailed as possible to get accurate proposals
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Trade Types */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What type of professional do you need?
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Select one or more trade types (you can select multiple if the job requires different skills)
              </p>

              <div className="grid grid-cols-2 gap-3">
                {tradeOptions.map((trade) => (
                  <button
                    key={trade}
                    type="button"
                    onClick={() => toggleTrade(trade)}
                    className={`px-4 py-3 rounded-lg border-2 transition-all text-left ${
                      formData.tradeTypes.includes(trade)
                        ? 'border-blue-600 bg-blue-50 text-blue-900'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                    }`}
                  >
                    <span className="font-medium">{trade}</span>
                  </button>
                ))}
              </div>

              {formData.tradeTypes.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Selected: {formData.tradeTypes.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Budget */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What's your budget range?
              </h3>
              
              <p className="text-sm text-gray-600 mb-4">
                Provide a budget range to help professionals understand your expectations
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Minimum Budget ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.budget.min || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: { ...formData.budget, min: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Maximum Budget ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.budget.max || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        budget: { ...formData.budget, max: parseFloat(e.target.value) || 0 },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="2000"
                    min="0"
                  />
                </div>
              </div>

              {formData.budget.min > 0 && formData.budget.max > 0 && (
                <div className="mt-4 p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-900">
                    Budget Range: <span className="font-bold">${formData.budget.min} - ${formData.budget.max}</span>
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Location */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Where is the job located?
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, city: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="Los Angeles"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, state: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="CA"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  ZIP Code (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location.zipCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, zipCode: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  placeholder="90001"
                />
              </div>
            </div>
          )}

          {/* Step 5: Timeline & Urgency */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project timeline and urgency
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Preferred Start Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.timeline.start}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeline: { ...formData.timeline, start: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Deadline (Optional)
                </label>
                <input
                  type="date"
                  value={formData.timeline.deadline}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeline: { ...formData.timeline, deadline: e.target.value },
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Project Urgency
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as const).map((urgency) => (
                    <button
                      key={urgency}
                      type="button"
                      onClick={() => setFormData({ ...formData, urgency })}
                      className={`px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.urgency === urgency
                          ? 'border-blue-600 bg-blue-50 text-blue-900'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <span className="font-medium capitalize">{urgency}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">Review Your Job Posting</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <p><strong>Title:</strong> {formData.title}</p>
                  <p><strong>Trade Types:</strong> {formData.tradeTypes.join(', ')}</p>
                  <p><strong>Budget:</strong> ${formData.budget.min} - ${formData.budget.max}</p>
                  <p><strong>Location:</strong> {formData.location.city}, {formData.location.state}</p>
                  <p><strong>Urgency:</strong> {formData.urgency}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 1 || submitting}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting || !canProceed()}>
              {submitting ? 'Posting...' : 'Post Job'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
