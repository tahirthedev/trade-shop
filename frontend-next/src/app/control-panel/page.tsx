'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Plus, Briefcase, MessageSquare, Star, Bot, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { projectsApi } from '@/lib/api/projects';
import { proposalsApi } from '@/lib/api/proposals';
import { messagesApi } from '@/lib/api/messages';
import { aiApi } from '@/lib/api/ai';
import { AIAssistant } from '@/components/ai/AIAssistant';
import { PostJobWizard } from '@/components/marketplace/PostJobWizard';
import { ProposalCard } from '@/components/proposals/ProposalCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import type { Project, Proposal } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<Record<string, Proposal[]>>({});
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [loadingProposals, setLoadingProposals] = useState<Record<string, boolean>>({});
  const [processingProposal, setProcessingProposal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJobWizard, setShowJobWizard] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showAnalyzerModal, setShowAnalyzerModal] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    budget: '',
    location: '',
  });

  const [analyzerData, setAnalyzerData] = useState({
    description: '',
    imageFile: null as File | null,
    imagePreview: '',
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadProjects();
  }, [user, router]);

  const loadProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Filter projects based on user type
      const filters = user.userType === 'client' 
        ? { clientId: user._id } 
        : { professionalId: user._id };
      
      const response = await projectsApi.getAll(undefined, filters);
      
      if (response.success) {
        setProjects(response.projects);
      } else {
        setError('Error loading projects');
      }
    } catch (err: any) {
      setError(err.message || 'Error loading projects');
    } finally {
      setLoading(false);
    }
  };

  const loadProposalsForProject = async (projectId: string) => {
    if (loadingProposals[projectId]) return;
    
    try {
      setLoadingProposals(prev => ({ ...prev, [projectId]: true }));
      const response = await proposalsApi.getAll({ projectId }) as any;
      
      console.log('Loaded proposals for project:', projectId, response);
      
      if (response.success) {
        // Log the structure of the first proposal to debug
        if (response.proposals && response.proposals.length > 0) {
          console.log('First proposal structure:', response.proposals[0]);
          console.log('Professional data:', response.proposals[0].professional);
        }
        setProposals(prev => ({ ...prev, [projectId]: response.proposals || [] }));
      }
    } catch (err) {
      console.error('Error loading proposals:', err);
    } finally {
      setLoadingProposals(prev => ({ ...prev, [projectId]: false }));
    }
  };

  const toggleProjectProposals = (projectId: string) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
      if (!proposals[projectId]) {
        loadProposalsForProject(projectId);
      }
    }
    setExpandedProjects(newExpanded);
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      setProcessingProposal(proposalId);
      const response = await proposalsApi.accept(proposalId) as any;
      
      if (response.success) {
        // Reload proposals and projects
        loadProjects();
        Object.keys(proposals).forEach(projectId => {
          loadProposalsForProject(projectId);
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error accepting proposal');
    } finally {
      setProcessingProposal(null);
    }
  };

  const handleRejectProposal = async (proposalId: string) => {
    try {
      setProcessingProposal(proposalId);
      const response = await proposalsApi.reject(proposalId) as any;
      
      if (response.success) {
        // Reload proposals
        Object.keys(proposals).forEach(projectId => {
          loadProposalsForProject(projectId);
        });
      }
    } catch (err: any) {
      setError(err.message || 'Error rejecting proposal');
    } finally {
      setProcessingProposal(null);
    }
  };

  const handleMessageProfessional = async (professionalUserId: string) => {
    if (!user) return;

    try {
      console.log('Creating conversation between:', user._id, 'and', professionalUserId);
      
      // Create or get conversation with the professional's user
      const response = await messagesApi.createConversation([user._id, professionalUserId]) as any;
      
      console.log('Conversation response:', response);
      
      if (response.success && response.conversation) {
        // Navigate to messages with conversation ID to auto-select it
        router.push(`/messages?conversationId=${response.conversation._id}`);
      } else {
        console.error('No conversation in response:', response);
        setError('Error creating conversation. Please try again.');
      }
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      setError('Error starting conversation. Please try again.');
    }
  };

  const handleMarkAsFilled = async (projectId: string) => {
    try {
      const response = await projectsApi.update(projectId, { status: 'completed' }) as any;
      if (response.success) {
        loadProjects();
      }
    } catch (err: any) {
      setError(err.message || 'Error updating project status');
    }
  };

  const handleCloseJob = async (projectId: string) => {
    if (!confirm('Are you sure you want to close this job? This action cannot be undone.')) {
      return;
    }
    
    try {
      const response = await projectsApi.update(projectId, { status: 'cancelled' }) as any;
      if (response.success) {
        loadProjects();
      }
    } catch (err: any) {
      setError(err.message || 'Error closing job');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnalyzerData(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setAnalyzerData(prev => ({ ...prev, imagePreview: e.target?.result as string || '' }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!analyzerData.description && !analyzerData.imagePreview) return;
    
    setAnalyzing(true);
    setAnalysisResult('');

    try {
      const images = analyzerData.imagePreview ? [analyzerData.imagePreview] : [];
      const response = await aiApi.analyzeProject(analyzerData.description, images) as any;
      
      if (response.success && response.analysis) {
        setAnalysisResult(typeof response.analysis === 'string' ? response.analysis : JSON.stringify(response.analysis, null, 2));
      } else {
        setAnalysisResult('Error analyzing project. Please try again.');
      }
    } catch (err: any) {
      setAnalysisResult('Error analyzing project. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
      
      const response = await projectsApi.create({
        ...newProject,
        budget: { min: parseFloat(newProject.budget), max: parseFloat(newProject.budget) },
        location: { city: newProject.location, state: 'Unknown', zipCode: '' },
        tradeTypes: [],
      }, token) as any;

      if (response?.success) {
        setShowCreateModal(false);
        setNewProject({ title: '', description: '', budget: '', location: '' });
        loadProjects();
      } else {
        setError('Error al crear proyecto');
      }
    } catch (err: any) {
      setError(err.message || 'Error al crear proyecto');
    } finally {
      setCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'success' | 'warning' | 'danger'> = {
      new: 'default',
      active: 'warning',
      completed: 'success',
      cancelled: 'danger',
    };
    
    const labels: Record<string, string> = {
      new: 'Nuevo',
      active: 'Activo',
      completed: 'Completado',
      cancelled: 'Cancelado',
    };

    return (
      <Badge variant={variants[status] || 'default'}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Control Panel
          </h1>
          <p className="text-gray-600">
            Bienvenido, {user.name} 👋
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-blue-400 to-blue-600 p-3 rounded-lg"
              >
                <Briefcase className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-600">Proyectos Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'new' || p.status === 'active').length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-green-400 to-green-600 p-3 rounded-lg"
              >
                <Star className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-600">Completados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.filter(p => p.status === 'completed').length}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-purple-400 to-purple-600 p-3 rounded-lg"
              >
                <MessageSquare className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <p className="text-sm text-gray-600">Propuestas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((total, p) => total + (p.proposalCount || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex justify-between items-center mb-6"
        >
          <h2 className="text-2xl font-bold text-gray-900">Mis Proyectos</h2>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowAnalyzerModal(true)}>
              <Sparkles className="w-4 h-4 mr-2" />
              Project Analysis with AI
            </Button>
            {user.userType === 'client' && (
              <Button onClick={() => setShowJobWizard(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proyecto
              </Button>
            )}
          </div>
        </motion.div>

        {/* Projects List */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No hay proyectos
              </h3>
              <p className="text-gray-600 mb-4">
                {user.userType === 'client'
                  ? 'Crea tu primer proyecto para comenzar'
                  : 'No tienes proyectos asignados aún'}
              </p>
              {user.userType === 'client' && (
                <Button onClick={() => setShowJobWizard(true)}>
                  Crear Proyecto
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.05
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.3 }}
                onClick={() => setSelectedProject(project)}
                className="cursor-pointer"
              >
                <Card className="hover:shadow-xl transition-all duration-300 h-full flex flex-col relative">
                  {/* New Proposals Notification Badge */}
                  {project.proposalCount > 0 && (
                    <div className="absolute -top-2 -right-2 z-10">
                      <div className="bg-purple-600 text-white text-xs font-bold rounded-full w-8 h-8 flex items-center justify-center shadow-lg animate-pulse">
                        {project.proposalCount}
                      </div>
                    </div>
                  )}
                  
                  {/* Header with Status */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1 pr-2">
                      {project.title}
                    </h3>
                    {getStatusBadge(project.status)}
                  </div>

                  {/* Budget - Prominent */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-600 mb-1">Budget</p>
                    <p className="text-xl font-bold text-green-700">
                      ${project.budget.min.toLocaleString()}-${project.budget.max.toLocaleString()}
                    </p>
                  </div>

                  {/* Description - Truncated */}
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {project.description}
                  </p>

                  {/* AI Analysis Chips */}
                  {project.aiAnalysis && (
                    <div className="flex gap-1.5 mb-3 flex-wrap">
                      {project.aiAnalysis.complexityScore && (
                        <Badge className="text-xs bg-purple-100 text-purple-800">
                          {project.aiAnalysis.complexityScore}/10
                        </Badge>
                      )}
                      {project.aiAnalysis.riskLevel && (
                        <Badge className={`text-xs ${
                          project.aiAnalysis.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                          project.aiAnalysis.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {project.aiAnalysis.riskLevel}
                        </Badge>
                      )}
                      {project.aiAnalysis.estimatedTimeline && (
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                          {project.aiAnalysis.estimatedTimeline}
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Footer Info */}
                  <div className="mt-auto pt-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-center text-xs text-gray-500">
                      <span className="mr-1">📍</span>
                      <span className="truncate">{project.location.city}, {project.location.state}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-purple-600">
                        {project.proposalCount || 0} proposals
                      </span>
                      <span className="text-gray-400">
                        {new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* AI Project Analyzer Modal */}
      {showAnalyzerModal && (
        <Modal
          isOpen={true}
          onClose={() => {
            setShowAnalyzerModal(false);
            setAnalyzerData({ description: '', imageFile: null, imagePreview: '' });
            setAnalysisResult('');
          }}
          title="AI Project Analyzer"
        >
          <form onSubmit={handleAnalyzeProject} className="space-y-4">
            <p className="text-gray-600 text-sm">
              Upload a photo of the project site and/or provide a description for AI analysis
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Upload Project Photo (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                disabled={analyzing}
              />
              {analyzerData.imagePreview && (
                <div className="mt-3">
                  <img
                    src={analyzerData.imagePreview}
                    alt="Project preview"
                    className="max-w-full h-auto rounded-lg border border-gray-200"
                    style={{ maxHeight: '300px' }}
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Project Description
              </label>
              <textarea
                value={analyzerData.description}
                onChange={(e) => setAnalyzerData({ ...analyzerData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 bg-white"
                placeholder="Describe the project: type of work, dimensions, special requirements, etc."
                disabled={analyzing}
              />
            </div>

            <Button 
              type="submit" 
              disabled={analyzing || (!analyzerData.description && !analyzerData.imagePreview)}
              className="w-full"
            >
              {analyzing ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Analyzing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>

            {analysisResult && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-600 mb-3">
                  📊 AI Analysis Results
                </h3>
                <div className="text-gray-900 whitespace-pre-wrap text-sm">
                  {analysisResult}
                </div>
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* Project Detail Modal */}
      {selectedProject && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedProject(null)}
          title={selectedProject.title}
        >
          <div className="space-y-6">
            {/* Status & Budget */}
            <div className="flex items-center justify-between">
              {getStatusBadge(selectedProject.status)}
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Budget</p>
                <p className="text-2xl font-bold text-green-600">
                  ${selectedProject.budget.min.toLocaleString()}-${selectedProject.budget.max.toLocaleString()}
                </p>
              </div>
            </div>

            {/* AI Analysis */}
            {selectedProject.aiAnalysis && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  AI Analysis
                </h4>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Complexity</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {selectedProject.aiAnalysis.complexityScore}/10
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Risk Level</p>
                    <p className={`text-lg font-bold ${
                      selectedProject.aiAnalysis.riskLevel === 'high' ? 'text-red-600' :
                      selectedProject.aiAnalysis.riskLevel === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {selectedProject.aiAnalysis.riskLevel}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 mb-1">Timeline</p>
                    <p className="text-sm font-semibold text-blue-600">
                      {selectedProject.aiAnalysis.estimatedTimeline}
                    </p>
                  </div>
                </div>
                {selectedProject.aiAnalysis.summary && (
                  <p className="text-sm text-gray-700 italic">
                    "{selectedProject.aiAnalysis.summary}"
                  </p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
              <p className="text-gray-700 whitespace-pre-wrap">{selectedProject.description}</p>
            </div>

            {/* Location & Date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Location</p>
                <p className="font-medium text-gray-900">
                  📍 {selectedProject.location.city}, {selectedProject.location.state}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Posted</p>
                <p className="font-medium text-gray-900">
                  {new Date(selectedProject.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            {user.userType === 'client' && (selectedProject.status === 'new' || selectedProject.status === 'active') && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                {selectedProject.status === 'active' && (
                  <Button
                    onClick={() => {
                      handleMarkAsFilled(selectedProject._id);
                      setSelectedProject(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Mark as Filled
                  </Button>
                )}
                <Button
                  onClick={() => {
                    handleCloseJob(selectedProject._id);
                    setSelectedProject(null);
                  }}
                  variant="secondary"
                  className="flex-1 border-red-300 text-red-700 hover:bg-red-50"
                >
                  Close Job
                </Button>
              </div>
            )}

            {/* View Proposals */}
            {user.userType === 'client' && selectedProject.proposalCount > 0 && !expandedProjects.has(selectedProject._id) && (
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleProjectProposals(selectedProject._id);
                  }}
                  className="w-full"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  View {selectedProject.proposalCount} Proposal{selectedProject.proposalCount !== 1 ? 's' : ''}
                </Button>
              </div>
            )}

            {/* Proposals in Modal */}
            {expandedProjects.has(selectedProject._id) && (
              <div className="pt-4 border-t border-gray-200">
                {loadingProposals[selectedProject._id] ? (
                  <div className="flex justify-center py-8">
                    <Spinner size="md" />
                  </div>
                ) : proposals[selectedProject._id] && proposals[selectedProject._id].length > 0 ? (
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">
                      Received Proposals ({proposals[selectedProject._id].length})
                    </h4>
                    {proposals[selectedProject._id].map((proposal) => (
                      <ProposalCard
                        key={proposal._id}
                        proposal={proposal}
                        onAccept={handleAcceptProposal}
                        onReject={handleRejectProposal}
                        onMessage={handleMessageProfessional}
                        loading={processingProposal === proposal._id}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No proposals yet</p>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Job Wizard */}
      {showJobWizard && (
        <PostJobWizard
          onClose={() => setShowJobWizard(false)}
          onSuccess={() => {
            setShowJobWizard(false);
            loadProjects();
          }}
        />
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <Modal
          isOpen={true}
          onClose={() => setShowCreateModal(false)}
          title="Crear Nuevo Proyecto"
        >
          <form onSubmit={handleCreateProject} className="space-y-4">
            <Input
              label="Título del proyecto"
              type="text"
              value={newProject.title}
              onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
              required
              disabled={creating}
            />

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Descripción
              </label>
              <textarea
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
                disabled={creating}
              />
            </div>

            <Input
              label="Presupuesto ($)"
              type="number"
              value={newProject.budget}
              onChange={(e) => setNewProject({ ...newProject, budget: e.target.value })}
              required
              disabled={creating}
            />

            <Input
              label="Ubicación"
              type="text"
              value={newProject.location}
              onChange={(e) => setNewProject({ ...newProject, location: e.target.value })}
              required
              disabled={creating}
            />

            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={creating} className="flex-1">
                {creating ? <Spinner size="sm" /> : 'Crear Proyecto'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowCreateModal(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* AI Assistant Section - Always visible at bottom */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <AIAssistant />
        </div>
      </div>
    </div>
  );
}
