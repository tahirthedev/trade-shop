'use client';

import { useState } from 'react';
import { CheckCircle, XCircle, MessageSquare, DollarSign, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import type { Proposal } from '@/types';

interface ProposalCardProps {
  proposal: Proposal;
  onAccept: (proposalId: string) => void;
  onReject: (proposalId: string) => void;
  onMessage: (professionalId: string) => void;
  loading?: boolean;
}

export function ProposalCard({ proposal, onAccept, onReject, onMessage, loading = false }: ProposalCardProps) {
  const getProfessionalName = () => {
    if (typeof proposal.professional === 'object' && proposal.professional?.user) {
      if (typeof proposal.professional.user === 'object') {
        return proposal.professional.user.name || 'Unknown';
      }
    }
    return 'Professional';
  };

  const getProfessionalUserId = () => {
    console.log('Getting professional user ID from proposal:', proposal);
    console.log('proposal.professional:', proposal.professional);
    
    if (typeof proposal.professional === 'object' && proposal.professional?.user) {
      console.log('proposal.professional.user:', proposal.professional.user);
      
      if (typeof proposal.professional.user === 'object') {
        console.log('User ID:', proposal.professional.user._id);
        return proposal.professional.user._id;
      }
      console.log('User is string ID:', proposal.professional.user);
      return proposal.professional.user; // If it's a string ID
    }
    console.warn('Could not extract user ID from proposal');
    return null;
  };

  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'accepted':
        return <Badge variant="success">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="danger">Rejected</Badge>;
      case 'withdrawn':
        return <Badge variant="default">Withdrawn</Badge>;
      default:
        return <Badge variant="default">{proposal.status}</Badge>;
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{getProfessionalName()}</h3>
            <p className="text-sm text-gray-500">
              Submitted {new Date(proposal.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Proposal Details */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-gray-700">
          <DollarSign className="w-4 h-4 text-green-600" />
          <span className="font-semibold">${proposal.budget}</span>
        </div>

        {proposal.timeline && typeof proposal.timeline === 'string' && (
          <div className="flex items-center gap-2 text-gray-700">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{proposal.timeline}</span>
          </div>
        )}
      </div>

      {/* Cover Letter */}
      <div className="mb-4">
        <p className="text-sm font-medium text-gray-900 mb-2">Cover Letter:</p>
        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded border border-gray-200">
          {proposal.coverLetter}
        </p>
      </div>

      {/* Milestones */}
      {proposal.milestones && proposal.milestones.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-900 mb-2">Milestones:</p>
          <div className="space-y-2">
            {proposal.milestones.map((milestone, index) => (
              <div key={index} className="bg-gray-50 p-2 rounded border border-gray-200 text-sm">
                <span className="font-medium">{milestone.title}</span>
                {milestone.amount && (
                  <span className="text-green-600 ml-2">${milestone.amount}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      {proposal.status === 'pending' && (
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <Button
            onClick={() => onAccept(proposal._id)}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? <Spinner size="sm" /> : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Accept
              </>
            )}
          </Button>
          <Button
            onClick={() => onReject(proposal._id)}
            disabled={loading}
            variant="secondary"
            className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
          >
            <XCircle className="w-4 h-4 mr-2" />
            Reject
          </Button>
          <Button
            onClick={() => {
              const userId = getProfessionalUserId();
              if (userId) {
                onMessage(userId);
              }
            }}
            variant="ghost"
            disabled={loading}
          >
            <MessageSquare className="w-4 h-4" />
          </Button>
        </div>
      )}

      {proposal.status === 'accepted' && (
        <div className="pt-4 border-t border-gray-200">
          <Button
            onClick={() => {
              const userId = getProfessionalUserId();
              if (userId) {
                onMessage(userId);
              } else {
                console.error('Could not get professional user ID from proposal:', proposal);
                alert('Error: Could not find professional user ID');
              }
            }}
            className="w-full"
            variant="secondary"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Message Professional
          </Button>
        </div>
      )}
    </div>
  );
}
