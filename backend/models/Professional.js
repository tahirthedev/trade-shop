const mongoose = require('mongoose');

const professionalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  trade: {
    type: String,
    required: [true, 'Trade type is required'],
    enum: ['Electrician', 'Plumber', 'HVAC', 'Carpenter', 'Painter', 'Landscaper', 'Roofer', 'Mason', 'Other']
  },
  specialties: [{
    type: String
  }],
  yearsExperience: {
    type: Number,
    required: true,
    min: 0
  },
  hourlyRate: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  availability: {
    type: String,
    enum: ['Available', 'Busy', 'Unavailable'],
    default: 'Available'
  },
  
  // AI Trade Score components (Scale: 0-10)
  aiScore: {
    total: {
      type: Number,
      default: 5,
      min: 0,
      max: 10
    },
    skillVerification: {
      type: Number,
      default: 5,
      min: 0,
      max: 10
    },
    reliability: {
      type: Number,
      default: 5,
      min: 0,
      max: 10
    },
    quality: {
      type: Number,
      default: 5,
      min: 0,
      max: 10
    },
    safety: {
      type: Number,
      default: 5,
      min: 0,
      max: 10
    }
  },
  
  // Statistics
  stats: {
    projectsCompleted: {
      type: Number,
      default: 0
    },
    averageResponseTime: {
      type: Number, // in hours
      default: 0
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewCount: {
      type: Number,
      default: 0
    }
  },
  
  certifications: [{
    name: {
      type: String,
      required: true
    },
    issuer: String,
    dateObtained: Date,
    expiryDate: Date,
    verificationUrl: String
  }],
  
  portfolio: [{
    title: String,
    description: String,
    images: [String],
    imageUrl: String,
    completedDate: Date,
    projectType: String,
    clientName: String,
    budget: Number
  }],
  
  workExperience: [{
    title: String,
    company: String,
    location: String,
    startDate: String,
    endDate: String,
    currentlyWorking: Boolean,
    description: String
  }],
  
  bio: {
    type: String,
    maxlength: 500
  },
  
  languages: [{
    type: String
  }],
  
  website: String,
  linkedin: String,
  twitter: String,
  
  insurance: {
    provider: String,
    policyNumber: String,
    coverage: Number,
    expiryDate: Date,
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  serviceArea: {
    radius: {
      type: Number, // in miles
      default: 25
    },
    cities: [String]
  },
  
  subscriptionTier: {
    type: String,
    enum: ['Apprentice', 'Journeyman', 'Master', 'Enterprise'],
    default: 'Apprentice'
  },
  
  subscriptionStatus: {
    type: String,
    enum: ['active', 'cancelled', 'past_due', 'trialing'],
    default: 'active'
  },
  
  stripeCustomerId: {
    type: String,
    default: null
  },
  
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  
  verified: {
    type: Boolean,
    default: false
  },
  
  topRated: {
    type: Boolean,
    default: false
  },
  
  contactPreferences: {
    phoneVisible: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Calculate total AI Score
professionalSchema.methods.calculateAIScore = function() {
  const weights = {
    skillVerification: 0.30,
    reliability: 0.25,
    quality: 0.25,
    safety: 0.10,
    growth: 0.10
  };
  
  // Growth score based on certifications and experience (0-10 scale)
  const growthScore = Math.min(10, (this.certifications.length * 1.0) + (this.yearsExperience * 0.2));
  
  // Calculate weighted average (all scores are now 0-10)
  this.aiScore.total = parseFloat((
    (this.aiScore.skillVerification * weights.skillVerification) +
    (this.aiScore.reliability * weights.reliability) +
    (this.aiScore.quality * weights.quality) +
    (this.aiScore.safety * weights.safety) +
    (growthScore * weights.growth)
  ).toFixed(1));
  
  return this.aiScore.total;
};

// Update stats after project completion
professionalSchema.methods.updateStats = async function() {
  const Review = mongoose.model('Review');
  
  // Get all reviews for this professional
  const reviews = await Review.find({ professional: this._id });
  
  if (reviews.length > 0) {
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    this.stats.rating = totalRating / reviews.length;
    this.stats.reviewCount = reviews.length;
    
    // Update quality score based on ratings (0-10 scale)
    this.aiScore.quality = Math.min(10, this.stats.rating * 2);
  }
  
  await this.save();
};

module.exports = mongoose.model('Professional', professionalSchema);
