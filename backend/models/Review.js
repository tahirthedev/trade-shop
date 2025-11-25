const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  
  // Detailed ratings
  detailedRatings: {
    quality: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    timeliness: {
      type: Number,
      min: 1,
      max: 5
    },
    professionalism: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  title: {
    type: String,
    trim: true
  },
  
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    maxlength: 1000
  },
  
  images: [{
    url: String,
    description: String
  }],
  
  wouldRecommend: {
    type: Boolean,
    default: true
  },
  
  response: {
    text: String,
    respondedAt: Date
  },
  
  verified: {
    type: Boolean,
    default: true
  },
  
  helpful: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Only allow one review per project
reviewSchema.index({ project: 1, client: 1 }, { unique: true });

// Update professional stats after review
reviewSchema.post('save', async function() {
  const Professional = mongoose.model('Professional');
  const professional = await Professional.findById(this.professional);
  
  if (professional) {
    await professional.updateStats();
    
    // Update reliability score based on timeliness (0-10 scale)
    if (this.detailedRatings.timeliness) {
      professional.aiScore.reliability = Math.min(10, 
        (professional.aiScore.reliability + (this.detailedRatings.timeliness * 2)) / 2
      );
    }
    
    professional.calculateAIScore();
    await professional.save();
  }
});

module.exports = mongoose.model('Review', reviewSchema);
