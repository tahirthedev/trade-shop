const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Project description is required']
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  professional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional',
    default: null
  },
  
  location: {
    address: String,
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  
  budget: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  tradeTypes: [{
    type: String,
    required: true
  }],
  
  timeline: {
    startDate: Date,
    endDate: Date,
    deadline: Date
  },
  
  status: {
    type: String,
    enum: ['new', 'active', 'in_progress', 'completed', 'cancelled'],
    default: 'new'
  },
  
  proposalCount: {
    type: Number,
    default: 0
  },
  
  assignedProfessional: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professional'
  },
  
  acceptedProposal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proposal'
  },
  
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  images: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // AI Analysis
  aiAnalysis: {
    summary: String,
    recommendedSkills: [String],
    cleanedDescription: String,
    complexityScore: {
      type: Number,
      min: 0,
      max: 10
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high']
    },
    estimatedTimeline: String,
    budgetRange: String,
    materials: [String],
    challenges: [String],
    recommendations: String,
    analyzedAt: Date
  },
  
  milestones: [{
    title: String,
    description: String,
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: Date,
    payment: Number
  }],
  
  quotes: [{
    professional: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Professional'
    },
    amount: Number,
    timeline: String,
    materials: [String],
    notes: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    submittedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  payment: {
    total: Number,
    paid: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['pending', 'partial', 'paid'],
      default: 'pending'
    },
    method: String
  },
  
  communication: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Index for search and filtering
projectSchema.index({ status: 1, createdAt: -1 });
projectSchema.index({ 'location.city': 1, 'location.state': 1 });
projectSchema.index({ tradeTypes: 1 });

module.exports = mongoose.model('Project', projectSchema);
