'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Clock, DollarSign, TrendingUp, MessageCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { projectsApi } from '@/lib/api/projects';
import { proposalsApi } from '@/lib/api/proposals';
import { messagesApi } from '@/lib/api/messages';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import type { Project } from '@/types';

export default function JobBoardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [proposalText, setProposalText] = useState('');
  const [proposalBudget, setProposalBudget] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [proposalStats, setProposalStats] = useState({
    sent: 0,
    active: 0,
    won: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    tradeType: '',
    minBudget: '',
    maxBudget: '',
    location: '',
    sortBy: 'newest' as 'newest' | 'bestMatch' | 'budget'
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    if (user.userType !== 'tradesperson') {
      router.push('/marketplace');
      return;
    }
    
    loadProjects();
    loadProposalStats();
  }, [user, router]);

  useEffect(() => {
    applyFilters();
  }, [projects, filters]);

  const applyFilters = () => {
    let filtered = [...projects];

    // Trade type filter
    if (filters.tradeType) {
      filtered = filtered.filter(p => p.tradeTypes.includes(filters.tradeType));
    }

    // Budget filter
    if (filters.minBudget) {
      const min = parseFloat(filters.minBudget);
      filtered = filtered.filter(p => p.budget.max >= min);
    }
    if (filters.maxBudget) {
      const max = parseFloat(filters.maxBudget);
      filtered = filtered.filter(p => p.budget.min <= max);
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(p => 
        p.location.city.toLowerCase().includes(filters.location.toLowerCase()) ||
        p.location.state.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'bestMatch':
        filtered.sort((a, b) => {
          const scoreA = (a as any).matchScore?.score || 0;
          const scoreB = (b as any).matchScore?.score || 0;
          return scoreB - scoreA;
        });
        break;
      case 'budget':
        filtered.sort((a, b) => {
          const avgA = (a.budget.min + a.budget.max) / 2;
          const avgB = (b.budget.min + b.budget.max) / 2;
          return avgB - avgA;
        });
        break;
      case 'newest':
      default:
        filtered.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }

    setFilteredProjects(filtered);
  };

  const handleClearFilters = () => {
    setFilters({
      tradeType: '',
      minBudget: '',
      maxBudget: '',
      location: '',
      sortBy: 'newest'
    });
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await projectsApi.getAll();
      
      if (response.success) {
        // Filter to show only "new" status projects
        const openProjects = response.projects.filter(p => p.status === 'new');
        setProjects(openProjects);
      } else {
        setError('Error loading job postings');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading job postings');
    } finally {
      setLoading(false);
    }
  };

  const loadProposalStats = async () => {
    // Get professional ID from user
    if (!user || user.userType !== 'tradesperson') return;
    
    try {
      // Fetch proposals for this professional
      const response = await proposalsApi.getAll({ professionalId: user._id }) as any;
      
      if (response.success && response.proposals) {
        const proposals = response.proposals;
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        
        setProposalStats({
          sent: proposals.length,
          active: proposals.filter((p: any) => p.status === 'pending').length,
          won: proposals.filter((p: any) => {
            if (p.status !== 'accepted') return false;
            const acceptedDate = new Date(p.updatedAt);
            return acceptedDate.getMonth() === thisMonth && acceptedDate.getFullYear() === thisYear;
          }).length
        });
      }
    } catch (err) {
      console.error('Error loading proposal stats:', err);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedProject) return;
    
    if (!user.professionalId) {
      alert('Error: Professional profile not found. Please contact support.');
      return;
    }
    
    setSubmitting(true);
    try {
      // Get client ID from project
      const clientId = typeof selectedProject.client === 'string' 
        ? selectedProject.client 
        : selectedProject.client._id;

      const response: any = await proposalsApi.create({
        project: selectedProject._id,
        professional: user.professionalId, // Use Professional document ID, not User ID
        client: clientId,
        budget: parseFloat(proposalBudget),
        coverLetter: proposalText,
      });

      if (response.success) {
        setShowProposalModal(false);
        setProposalText('');
        setProposalBudget('');
        setSelectedProject(null);
        alert('Proposal submitted successfully!');
        loadProjects();
        loadProposalStats();
      }
    } catch (err: any) {
      alert(err.message || 'Error submitting proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactClient = async (project: Project) => {
    if (!user) return;

    try {
      // Get client ID from project
      const clientId = typeof project.client === 'string' ? project.client : project.client._id;
      
      // Create or get conversation
      const response = await messagesApi.createConversation([user._id, clientId], project._id) as any;
      
      if (response.success) {
        // Navigate to messages with this conversation
        router.push('/messages');
      }
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      alert('Error starting conversation. Please try again.');
    }
  };

  const openProposalModal = (project: Project) => {
    setSelectedProject(project);
    setShowProposalModal(true);
  };

  if (!user || user.userType !== 'tradesperson') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Available Jobs
          </h1>
          <p className="text-gray-600">
            Browse client projects and submit proposals
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{projects.length}</p>
              <p className="text-sm text-gray-600 mt-1">Available Jobs</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{proposalStats.sent}</p>
              <p className="text-sm text-gray-600 mt-1">Proposals Sent</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{proposalStats.active}</p>
              <p className="text-sm text-gray-600 mt-1">Active Bids</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-orange-600">{proposalStats.won}</p>
              <p className="text-sm text-gray-600 mt-1">Won This Month</p>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Trade Type
              </label>
              <select
                value={filters.tradeType}
                onChange={(e) => setFilters({ ...filters, tradeType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="">All Trades</option>
                <option value="Electrician">Electrician</option>
                <option value="Plumber">Plumber</option>
                <option value="HVAC">HVAC</option>
                <option value="Carpenter">Carpenter</option>
                <option value="Painter">Painter</option>
                <option value="Mason">Mason</option>
                <option value="Roofer">Roofer</option>
                <option value="General Contractor">General Contractor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Min Budget ($)
              </label>
              <input
                type="number"
                value={filters.minBudget}
                onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Max Budget ($)
              </label>
              <input
                type="number"
                value={filters.maxBudget}
                onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="5000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                placeholder="City or State"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
              >
                <option value="newest">Newest First</option>
                <option value="bestMatch">Best Match</option>
                <option value="budget">Highest Budget</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={applyFilters} size="sm">
              Apply Filters
            </Button>
            <Button onClick={handleClearFilters} variant="ghost" size="sm">
              Clear All
            </Button>
            <div className="ml-auto text-sm text-gray-600 flex items-center">
              Showing {filteredProjects.length} of {projects.length} jobs
            </div>
          </div>
        </Card>

        {/* Job Listings */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : filteredProjects.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg mb-4">
                {projects.length === 0 
                  ? 'No job postings available at the moment'
                  : 'No jobs match your filters'}
              </p>
              <Button onClick={projects.length === 0 ? loadProjects : handleClearFilters}>
                {projects.length === 0 ? 'Refresh' : 'Clear Filters'}
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project._id} className="hover:shadow-lg transition-shadow flex flex-col">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-xl font-bold text-gray-900">
                          {project.title}
                        </h3>
                        <Badge variant="success">New</Badge>
                        {(project as any).matchScore && (
                          <Badge 
                            variant={
                              (project as any).matchScore.score >= 8 ? 'success' :
                              (project as any).matchScore.score >= 6.5 ? 'info' :
                              (project as any).matchScore.score >= 5 ? 'warning' :
                              'default'
                            }
                          >
                            <TrendingUp className="w-3 h-3 mr-1" />
                            {(project as any).matchScore.percentage}% Match
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-1">Budget</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${project.budget.min}-${project.budget.max}
                    </p>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-3">
                    {project.description}
                  </p>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{project.location.city}, {project.location.state}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Posted {new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>
                        {project.timeline?.deadline 
                          ? `Due ${new Date(project.timeline.deadline).toLocaleDateString()}` 
                          : 'Flexible timeline'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>{(project as any).proposalCount || 0} proposals</span>
                    </div>
                  </div>

                  {project.tradeTypes && project.tradeTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tradeTypes.map((trade, index) => (
                        <Badge key={index} variant="info">
                          {trade}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <Button 
                    onClick={() => openProposalModal(project)}
                    className="w-full"
                  >
                    Submit Proposal
                  </Button>
                  <Button
                    onClick={() => handleContactClient(project)}
                    variant="secondary"
                    className="w-full"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Contact Client
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Proposal Modal */}
      {showProposalModal && selectedProject && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowProposalModal(false);
            setSelectedProject(null);
            setProposalText('');
            setProposalBudget('');
          }}
          title={`Submit Proposal: ${selectedProject.title}`}
        >
          <form onSubmit={handleSubmitProposal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Your Proposed Budget ($)
              </label>
              <input
                type="number"
                value={proposalBudget}
                onChange={(e) => setProposalBudget(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder={`Between $${selectedProject.budget.min} - $${selectedProject.budget.max}`}
                min={selectedProject.budget.min}
                max={selectedProject.budget.max}
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Cover Letter / Proposal
              </label>
              <textarea
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Explain why you're the best fit for this job..."
                required
                disabled={submitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? <Spinner size="sm" /> : 'Submit Proposal'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setShowProposalModal(false);
                  setSelectedProject(null);
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
