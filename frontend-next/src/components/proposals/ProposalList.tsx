'use client';

import { useState } from 'react';
import { DollarSign, Calendar, FileText, Check, X, Clock, AlertCircle } from 'lucide-react';
import { proposalsApi } from '@/lib/api/proposals';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Spinner } from '@/components/ui/Spinner';
import { useTranslation } from '@/context/LanguageContext';
import type { Proposal, User, Professional } from '@/types';

interface ProposalListProps {
  proposals: Proposal[];
  onProposalUpdated?: () => void;
  userType: 'client' | 'tradesperson';
}

export function ProposalList({ proposals, onProposalUpdated, userType }: ProposalListProps) {
  const { t } = useTranslation();
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleAcceptProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to accept this proposal? This will reject all other proposals for this project.')) {
      return;
    }

    setActionLoading(true);
    try {
      const response: any = await proposalsApi.accept(proposalId);
      if (response.success) {
        alert('Proposal accepted successfully!');
        setShowDetailsModal(false);
        onProposalUpdated?.();
      }
    } catch (error) {
      console.error('Error accepting proposal:', error);
      alert('Failed to accept proposal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    const reason = prompt('Please provide a reason for rejection (optional):');
    
    setActionLoading(true);
    try {
      const response: any = await proposalsApi.reject(proposalId, reason || undefined);
      if (response.success) {
        alert('Proposal rejected');
        setShowDetailsModal(false);
        onProposalUpdated?.();
      }
    } catch (error) {
      console.error('Error rejecting proposal:', error);
      alert('Failed to reject proposal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawProposal = async (proposalId: string) => {
    if (!confirm('Are you sure you want to withdraw this proposal?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response: any = await proposalsApi.withdraw(proposalId);
      if (response.success) {
        alert('Proposal withdrawn');
        setShowDetailsModal(false);
        onProposalUpdated?.();
      }
    } catch (error) {
      console.error('Error withdrawing proposal:', error);
      alert('Failed to withdraw proposal');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      pending: 'warning',
      accepted: 'success',
      rejected: 'danger',
      withdrawn: 'default',
    };

    const labels: Record<string, string> = {
      pending: t('proposals.pending'),
      accepted: t('proposals.accepted'),
      rejected: t('proposals.rejected'),
      withdrawn: t('proposals.withdrawn'),
    };

    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getProfessionalInfo = (proposal: Proposal) => {
    if (typeof proposal.professional === 'object') {
      const professional = proposal.professional as Professional;
      const user = typeof professional.user === 'object' ? professional.user as User : null;
      return {
        name: user?.name || 'Unknown Professional',
        trade: professional.trade,
        rating: professional.stats?.rating || 0,
        reviewCount: professional.stats?.reviewCount || 0,
      };
    }
    return { name: 'Unknown Professional', trade: '', rating: 0, reviewCount: 0 };
  };

  const viewProposalDetails = (proposal: Proposal) => {
    setSelectedProposal(proposal);
    setShowDetailsModal(true);
  };

  return (
    <div className="space-y-4">
      {proposals.length === 0 ? (
        <Card className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('proposals.noProposals')}</h3>
          <p className="text-gray-600">
            {userType === 'client' 
              ? t('proposals.noProposalsClient')
              : t('proposals.noProposalsPro')}
          </p>
        </Card>
      ) : (
        proposals.map((proposal) => {
          const professionalInfo = getProfessionalInfo(proposal);
          
          return (
            <Card key={proposal._id} className="hover:shadow-lg transition-shadow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-lg">
                        {professionalInfo.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">
                        {professionalInfo.name}
                      </h3>
                      <p className="text-sm text-gray-600">{professionalInfo.trade}</p>
                    </div>
                    {getStatusBadge(proposal.status)}
                  </div>

                  <p className="text-gray-700 mb-3 line-clamp-2">{proposal.coverLetter}</p>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-green-600">${proposal.budget}</span>
                    </div>
                    {proposal.timeline?.estimatedDuration && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          {proposal.timeline.estimatedDuration.value}{' '}
                          {proposal.timeline.estimatedDuration.unit}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button onClick={() => viewProposalDetails(proposal)} variant="secondary">
                    {t('proposals.viewDetails')}
                  </Button>
                  
                  {userType === 'client' && proposal.status === 'pending' && (
                    <>
                      <Button
                        onClick={() => handleAcceptProposal(proposal._id)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        {t('proposals.accept')}
                      </Button>
                      <Button
                        onClick={() => handleRejectProposal(proposal._id)}
                        disabled={actionLoading}
                        variant="danger"
                      >
                        <X className="w-4 h-4 mr-1" />
                        {t('proposals.reject')}
                      </Button>
                    </>
                  )}

                  {userType === 'tradesperson' && proposal.status === 'pending' && (
                    <Button
                      onClick={() => handleWithdrawProposal(proposal._id)}
                      disabled={actionLoading}
                      variant="secondary"
                    >
                      {t('proposals.withdraw')}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })
      )}

      {/* Proposal Details Modal */}
      {showDetailsModal && selectedProposal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedProposal(null);
          }}
          title={t('proposals.proposalDetails')}
        >
          <div className="space-y-6">
            {/* Professional Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('proposals.professional')}</h3>
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">
                    {getProfessionalInfo(selectedProposal).name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {getProfessionalInfo(selectedProposal).name}
                  </p>
                  <p className="text-gray-600">{getProfessionalInfo(selectedProposal).trade}</p>
                </div>
              </div>
            </div>

            {/* Budget */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('proposals.proposedBudget')}</h3>
              <div className="text-3xl font-bold text-green-600">${selectedProposal.budget}</div>
            </div>

            {/* Timeline */}
            {selectedProposal.timeline && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('proposals.timeline')}</h3>
                {selectedProposal.timeline.estimatedDuration && (
                  <p className="text-gray-700">
                    {t('proposals.duration')}: {selectedProposal.timeline.estimatedDuration.value}{' '}
                    {selectedProposal.timeline.estimatedDuration.unit}
                  </p>
                )}
                {selectedProposal.timeline.startDate && (
                  <p className="text-gray-700">
                    {t('proposals.startDate')}: {new Date(selectedProposal.timeline.startDate).toLocaleDateString()}
                  </p>
                )}
                {selectedProposal.timeline.completionDate && (
                  <p className="text-gray-700">
                    {t('proposals.completion')}: {new Date(selectedProposal.timeline.completionDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {/* Cover Letter */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('proposals.coverLetter')}</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedProposal.coverLetter}</p>
            </div>

            {/* Scope */}
            {selectedProposal.scope && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('proposals.scopeOfWork')}</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedProposal.scope}</p>
              </div>
            )}

            {/* Milestones */}
            {selectedProposal.milestones && selectedProposal.milestones.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">{t('proposals.milestones')}</h3>
                <div className="space-y-3">
                  {selectedProposal.milestones.map((milestone, index) => (
                    <div key={index} className="border-l-4 border-blue-600 pl-4">
                      <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                      <p className="text-gray-700 text-sm">{milestone.description}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span>${milestone.amount}</span>
                        {milestone.dueDate && (
                          <span>{t('proposals.due')}: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Status */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('proposals.status')}</h3>
              {getStatusBadge(selectedProposal.status)}
              {selectedProposal.rejectionReason && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800">
                    <AlertCircle className="w-4 h-4 inline mr-1" />
                    {t('proposals.rejectionReason')}: {selectedProposal.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedProposal.status === 'pending' && (
              <div className="flex gap-3 pt-4 border-t">
                {userType === 'client' ? (
                  <>
                    <Button
                      onClick={() => handleAcceptProposal(selectedProposal._id)}
                      disabled={actionLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {actionLoading ? <Spinner size="sm" /> : <><Check className="w-4 h-4 mr-1" /> {t('proposals.accept')}</>}
                    </Button>
                    <Button
                      onClick={() => handleRejectProposal(selectedProposal._id)}
                      disabled={actionLoading}
                      variant="danger"
                      className="flex-1"
                    >
                      {actionLoading ? <Spinner size="sm" /> : <><X className="w-4 h-4 mr-1" /> {t('proposals.reject')}</>}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => handleWithdrawProposal(selectedProposal._id)}
                    disabled={actionLoading}
                    variant="secondary"
                    className="w-full"
                  >
                    {actionLoading ? <Spinner size="sm" /> : t('proposals.withdrawProposal')}
                  </Button>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
