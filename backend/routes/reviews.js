const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Professional = require('../models/Professional');

// @route   GET /api/reviews
// @desc    Get reviews
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { professionalId, clientId, projectId } = req.query;

    let query = {};

    if (professionalId) {
      query.professional = professionalId;
    }

    if (clientId) {
      query.client = clientId;
    }

    if (projectId) {
      query.project = projectId;
    }

    const reviews = await Review.find(query)
      .populate('client', 'name avatar')
      .populate('professional')
      .populate('project', 'title')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      project,
      professional,
      client,
      rating,
      detailedRatings,
      title,
      comment,
      images,
      wouldRecommend
    } = req.body;

    // Check if review already exists for this project
    const existingReview = await Review.findOne({ project, client });
    if (existingReview) {
      return res.status(400).json({ 
        success: false, 
        message: 'Review already submitted for this project' 
      });
    }

    const review = await Review.create({
      project,
      professional,
      client,
      rating,
      detailedRatings,
      title,
      comment,
      images,
      wouldRecommend
    });

    res.status(201).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id/response
// @desc    Add professional response to review
// @access  Private (Professional only)
router.put('/:id/response', async (req, res) => {
  try {
    const { text } = req.body;

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    review.response = {
      text,
      respondedAt: new Date()
    };

    await review.save();

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Add response error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/reviews/:id/helpful
// @desc    Mark review as helpful
// @access  Public
router.put('/:id/helpful', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ 
        success: false, 
        message: 'Review not found' 
      });
    }

    review.helpful += 1;
    await review.save();

    res.json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Mark helpful error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
