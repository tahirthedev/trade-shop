const express = require('express');
const router = express.Router();
const Professional = require('../models/Professional');
const Review = require('../models/Review');

// @route   GET /api/professionals/user/:userId
// @desc    Get professional by user ID
// @access  Public
router.get('/user/:userId', async (req, res) => {
  try {
    const professional = await Professional.findOne({ user: req.params.userId })
      .populate('user', 'name email phone avatar location verified');

    if (!professional) {
      return res.status(404).json({
        success: false,
        message: 'Professional profile not found for this user'
      });
    }

    res.json({
      success: true,
      professional
    });
  } catch (error) {
    console.error('Error fetching professional by user ID:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching professional profile'
    });
  }
});

// @route   GET /api/professionals
// @desc    Get all professionals with filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      trade, 
      location, 
      minScore, 
      availability, 
      minRating,
      specialty,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    let query = { verified: true };

    if (trade) {
      query.trade = new RegExp(trade, 'i');
    }

    if (minScore) {
      query['aiScore.total'] = { $gte: parseInt(minScore) };
    }

    if (availability) {
      query.availability = availability;
    }

    if (minRating) {
      query['stats.rating'] = { $gte: parseFloat(minRating) };
    }

    if (specialty) {
      query.specialties = { $in: [new RegExp(specialty, 'i')] };
    }

    // Execute query with pagination
    const professionals = await Professional.find(query)
      .populate('user', 'name email location avatar')
      .sort({ 'aiScore.total': -1, 'stats.rating': -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Professional.countDocuments(query);

    res.json({
      success: true,
      professionals,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Get professionals error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/professionals/:id
// @desc    Get professional by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id)
      .populate('user', 'name email location avatar phone');

    if (!professional) {
      return res.status(404).json({ 
        success: false, 
        message: 'Professional not found' 
      });
    }

    // Get reviews
    const reviews = await Review.find({ professional: professional._id })
      .populate('client', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      professional,
      reviews
    });
  } catch (error) {
    console.error('Get professional error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/professionals/:id
// @desc    Update professional profile
// @access  Private (Professional only)
router.put('/:id', async (req, res) => {
  try {
    // TODO: Add authentication middleware
    const {
      trade,
      specialties,
      yearsExperience,
      hourlyRate,
      availability,
      certifications,
      portfolio,
      insurance,
      serviceArea,
      bio,
      languages,
      website,
      linkedin,
      twitter,
      workExperience
    } = req.body;

    const professional = await Professional.findByIdAndUpdate(
      req.params.id,
      {
        trade,
        specialties,
        yearsExperience,
        hourlyRate,
        availability,
        certifications,
        portfolio,
        insurance,
        serviceArea,
        bio,
        languages,
        website,
        linkedin,
        twitter,
        workExperience
      },
      { new: true, runValidators: true }
    );

    if (!professional) {
      return res.status(404).json({ 
        success: false, 
        message: 'Professional not found' 
      });
    }

    // Recalculate AI score
    professional.calculateAIScore();
    await professional.save();

    res.json({
      success: true,
      professional
    });
  } catch (error) {
    console.error('Update professional error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/professionals/:id/portfolio
// @desc    Add portfolio item
// @access  Private
router.post('/:id/portfolio', async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);
    
    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    professional.portfolio.push(req.body);
    await professional.save();

    res.json({
      success: true,
      portfolio: professional.portfolio
    });
  } catch (error) {
    console.error('Add portfolio error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/professionals/:id/portfolio/:itemId
// @desc    Delete portfolio item
// @access  Private
router.delete('/:id/portfolio/:itemId', async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);
    
    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    professional.portfolio = professional.portfolio.filter(
      item => item._id.toString() !== req.params.itemId
    );
    await professional.save();

    res.json({
      success: true,
      portfolio: professional.portfolio
    });
  } catch (error) {
    console.error('Delete portfolio error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/professionals/:id/certifications
// @desc    Add certification
// @access  Private
router.post('/:id/certifications', async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);
    
    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    professional.certifications.push(req.body);
    professional.calculateAIScore();
    await professional.save();

    res.json({
      success: true,
      certifications: professional.certifications
    });
  } catch (error) {
    console.error('Add certification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/professionals/:id/certifications/:certId
// @desc    Delete certification
// @access  Private
router.delete('/:id/certifications/:certId', async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);
    
    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    professional.certifications = professional.certifications.filter(
      cert => cert._id.toString() !== req.params.certId
    );
    professional.calculateAIScore();
    await professional.save();

    res.json({
      success: true,
      certifications: professional.certifications
    });
  } catch (error) {
    console.error('Delete certification error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/professionals/:id/experience
// @desc    Add work experience
// @access  Private
router.post('/:id/experience', async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);
    
    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    if (!professional.workExperience) {
      professional.workExperience = [];
    }
    
    professional.workExperience.push(req.body);
    await professional.save();

    res.json({
      success: true,
      workExperience: professional.workExperience
    });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/professionals/:id/experience/:expId
// @desc    Delete work experience
// @access  Private
router.delete('/:id/experience/:expId', async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);
    
    if (!professional) {
      return res.status(404).json({ success: false, message: 'Professional not found' });
    }

    professional.workExperience = professional.workExperience.filter(
      exp => exp._id.toString() !== req.params.expId
    );
    await professional.save();

    res.json({
      success: true,
      workExperience: professional.workExperience
    });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/professionals/:id/stats
// @desc    Get professional statistics
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const professional = await Professional.findById(req.params.id);

    if (!professional) {
      return res.status(404).json({ 
        success: false, 
        message: 'Professional not found' 
      });
    }

    // Get detailed stats
    const reviews = await Review.find({ professional: professional._id });
    
    const ratingBreakdown = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    res.json({
      success: true,
      stats: {
        ...professional.stats,
        aiScore: professional.aiScore,
        ratingBreakdown,
        certificationCount: professional.certifications.length,
        portfolioCount: professional.portfolio.length
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
