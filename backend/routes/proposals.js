const express = require('express');
const router = express.Router();
const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const Professional = require('../models/Professional');

// @route   GET /api/proposals
// @desc    Get proposals (filtered by query params)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { projectId, professionalId, clientId, status } = req.query;

    let query = {};

    if (projectId) query.project = projectId;
    if (professionalId) query.professional = professionalId;
    if (clientId) query.client = clientId;
    if (status) query.status = status;

    const proposals = await Proposal.find(query)
      .populate('project', 'title description budget location')
      .populate({
        path: 'professional',
        populate: {
          path: 'user',
          select: 'name email avatar phone'
        }
      })
      .populate('client', 'name email avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      proposals
    });
  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/proposals/:id
// @desc    Get proposal by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id)
      .populate('project')
      .populate({
        path: 'professional',
        populate: {
          path: 'user',
          select: 'name email avatar phone'
        }
      })
      .populate('client', 'name email avatar');

    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }

    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/proposals
// @desc    Create a new proposal
// @access  Private (Professional only)
router.post('/', async (req, res) => {
  try {
    const {
      project,
      professional,
      client,
      budget,
      timeline,
      coverLetter,
      scope,
      milestones,
      attachments
    } = req.body;

    // Check if professional already submitted a proposal for this project
    const existingProposal = await Proposal.findOne({ 
      project, 
      professional 
    });

    if (existingProposal) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already submitted a proposal for this project' 
      });
    }

    // Check if project exists and is accepting proposals
    const projectDoc = await Project.findById(project);
    if (!projectDoc) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    if (projectDoc.status !== 'new') {
      return res.status(400).json({ 
        success: false, 
        message: 'This project is no longer accepting proposals' 
      });
    }

    const proposal = await Proposal.create({
      project,
      professional,
      client,
      budget,
      timeline,
      coverLetter,
      scope,
      milestones,
      attachments
    });

    // Update project proposal count
    await Project.findByIdAndUpdate(project, {
      $inc: { proposalCount: 1 }
    });

    const populatedProposal = await Proposal.findById(proposal._id)
      .populate('project')
      .populate({
        path: 'professional',
        populate: {
          path: 'user',
          select: 'name email avatar phone'
        }
      })
      .populate('client', 'name email avatar');

    res.status(201).json({
      success: true,
      proposal: populatedProposal
    });
  } catch (error) {
    console.error('Create proposal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/proposals/:id/accept
// @desc    Accept a proposal
// @access  Private (Client only)
router.put('/:id/accept', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'This proposal has already been responded to' 
      });
    }

    proposal.status = 'accepted';
    proposal.respondedAt = new Date();
    await proposal.save();

    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error('Accept proposal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/proposals/:id/reject
// @desc    Reject a proposal
// @access  Private (Client only)
router.put('/:id/reject', async (req, res) => {
  try {
    const { reason } = req.body;
    
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'This proposal has already been responded to' 
      });
    }

    proposal.status = 'rejected';
    proposal.respondedAt = new Date();
    proposal.rejectionReason = reason;
    await proposal.save();

    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error('Reject proposal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/proposals/:id/withdraw
// @desc    Withdraw a proposal
// @access  Private (Professional only)
router.put('/:id/withdraw', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending proposals can be withdrawn' 
      });
    }

    proposal.status = 'withdrawn';
    await proposal.save();

    // Decrease project proposal count
    await Project.findByIdAndUpdate(proposal.project, {
      $inc: { proposalCount: -1 }
    });

    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error('Withdraw proposal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/proposals/:id
// @desc    Update a proposal
// @access  Private (Professional only)
router.put('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending proposals can be edited' 
      });
    }

    const {
      budget,
      timeline,
      coverLetter,
      scope,
      milestones,
      attachments
    } = req.body;

    if (budget !== undefined) proposal.budget = budget;
    if (timeline) proposal.timeline = timeline;
    if (coverLetter) proposal.coverLetter = coverLetter;
    if (scope) proposal.scope = scope;
    if (milestones) proposal.milestones = milestones;
    if (attachments) proposal.attachments = attachments;

    await proposal.save();

    const updatedProposal = await Proposal.findById(proposal._id)
      .populate('project')
      .populate({
        path: 'professional',
        populate: {
          path: 'user',
          select: 'name email avatar phone'
        }
      })
      .populate('client', 'name email avatar');

    res.json({
      success: true,
      proposal: updatedProposal
    });
  } catch (error) {
    console.error('Update proposal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/proposals/:id
// @desc    Delete a proposal
// @access  Private (Professional only)
router.delete('/:id', async (req, res) => {
  try {
    const proposal = await Proposal.findById(req.params.id);

    if (!proposal) {
      return res.status(404).json({ 
        success: false, 
        message: 'Proposal not found' 
      });
    }

    if (proposal.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'Only pending proposals can be deleted' 
      });
    }

    await proposal.deleteOne();

    // Decrease project proposal count
    await Project.findByIdAndUpdate(proposal.project, {
      $inc: { proposalCount: -1 }
    });

    res.json({
      success: true,
      message: 'Proposal deleted successfully'
    });
  } catch (error) {
    console.error('Delete proposal error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
