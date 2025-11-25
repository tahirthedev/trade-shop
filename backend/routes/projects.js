const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Professional = require('../models/Professional');
const Proposal = require('../models/Proposal');
const { analyzeProject } = require('../utils/mockAI');
const { calculateMatchScore } = require('../utils/matchScore');

// @route   GET /api/projects
// @desc    Get all projects
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { status, tradeType, city, clientId, professionalId, includeMatchScore } = req.query;

    let query = {};

    if (status) {
      query.status = status;
    }

    if (tradeType) {
      query.tradeTypes = { $in: [tradeType] };
    }

    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }

    if (clientId) {
      query.client = clientId;
    }

    if (professionalId) {
      query.professional = professionalId;
    }

    const projects = await Project.find(query)
      .populate('client', 'name email avatar')
      .populate({
        path: 'professional',
        select: 'trade hourlyRate yearsExperience user',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .sort({ createdAt: -1 })
      .lean();

    // Add proposal counts to each project
    const projectsWithCounts = await Promise.all(
      projects.map(async (project) => {
        const proposalCount = await Proposal.countDocuments({ 
          project: project._id,
          status: { $ne: 'withdrawn' }
        });
        return {
          ...project,
          proposalCount
        };
      })
    );

    // Calculate match scores if professionalId provided
    let projectsWithScores = projectsWithCounts;
    if (includeMatchScore && professionalId) {
      const professional = await Professional.findById(professionalId)
        .populate('user', 'name email')
        .lean();
      
      if (professional) {
        projectsWithScores = projectsWithCounts.map(project => ({
          ...project,
          matchScore: calculateMatchScore(professional, project)
        }));
      }
    }

    res.json({
      success: true,
      projects: projectsWithScores
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/projects/:id
// @desc    Get project by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('client', 'name email avatar phone')
      .populate({
        path: 'professional',
        select: 'trade hourlyRate yearsExperience user',
        populate: {
          path: 'user',
          select: 'name email phone'
        }
      })
      .populate('quotes.professional')
      .lean();

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Add proposal count
    const proposalCount = await Proposal.countDocuments({ 
      project: project._id,
      status: { $ne: 'withdrawn' }
    });

    res.json({
      success: true,
      project: {
        ...project,
        proposalCount
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/projects
// @desc    Create a new project
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      client,
      location,
      budget,
      tradeTypes,
      timeline,
      images,
      urgency
    } = req.body;

    // Generate AI analysis
    const aiAnalysis = await analyzeProject({
      title,
      description,
      budget,
      tradeTypes,
      location
    });

    const project = await Project.create({
      title,
      description,
      client,
      location,
      budget,
      tradeTypes,
      timeline,
      images,
      urgency,
      aiAnalysis,
      status: 'new'
    });

    res.status(201).json({
      success: true,
      project,
      aiAnalysis // Return AI analysis to frontend
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id
// @desc    Update project
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/quotes
// @desc    Submit a quote for a project
// @access  Private (Professional only)
router.post('/:id/quotes', async (req, res) => {
  try {
    const { professional, amount, timeline, materials, notes } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    // Check if professional already submitted a quote
    const existingQuote = project.quotes.find(
      q => q.professional.toString() === professional
    );

    if (existingQuote) {
      return res.status(400).json({ 
        success: false, 
        message: 'Quote already submitted for this project' 
      });
    }

    project.quotes.push({
      professional,
      amount,
      timeline,
      materials,
      notes
    });

    await project.save();

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Submit quote error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/projects/:id/quotes/:quoteId/accept
// @desc    Accept a quote
// @access  Private (Client only)
router.put('/:id/quotes/:quoteId/accept', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    const quote = project.quotes.id(req.params.quoteId);

    if (!quote) {
      return res.status(404).json({ 
        success: false, 
        message: 'Quote not found' 
      });
    }

    // Mark quote as accepted
    quote.status = 'accepted';
    
    // Assign professional to project
    project.professional = quote.professional;
    project.status = 'active';
    project.payment.total = quote.amount;

    // Reject other quotes
    project.quotes.forEach(q => {
      if (q._id.toString() !== req.params.quoteId) {
        q.status = 'rejected';
      }
    });

    await project.save();

    // Update professional stats
    const professional = await Professional.findById(quote.professional);
    if (professional) {
      professional.stats.projectsCompleted += 1;
      await professional.save();
    }

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Accept quote error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/projects/:id/messages
// @desc    Add a message to project
// @access  Private
router.post('/:id/messages', async (req, res) => {
  try {
    const { from, message } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    project.communication.push({
      from,
      message
    });

    await project.save();

    res.status(201).json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
