const mongoose = require('mongoose');

const proposalSchema = new mongoose.Schema({
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
  
  budget: {
    type: Number,
    required: [true, 'Budget is required'],
    min: 0
  },
  
  timeline: {
    startDate: {
      type: Date
    },
    estimatedDuration: {
      value: Number,
      unit: {
        type: String,
        enum: ['days', 'weeks', 'months']
      }
    },
    completionDate: {
      type: Date
    }
  },
  
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    maxlength: 2000
  },
  
  scope: {
    type: String,
    maxlength: 2000
  },
  
  milestones: [{
    title: String,
    description: String,
    amount: Number,
    dueDate: Date
  }],
  
  attachments: [{
    url: String,
    name: String,
    type: String
  }],
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  
  respondedAt: {
    type: Date
  },
  
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
proposalSchema.index({ project: 1, professional: 1 });
proposalSchema.index({ professional: 1, status: 1 });
proposalSchema.index({ client: 1, status: 1 });

// Update project when proposal is accepted
proposalSchema.post('save', async function() {
  if (this.status === 'accepted') {
    const Project = mongoose.model('Project');
    await Project.findByIdAndUpdate(this.project, {
      status: 'active',
      assignedProfessional: this.professional,
      acceptedProposal: this._id
    });
    
    // Reject all other proposals for this project
    await this.constructor.updateMany(
      { project: this.project, _id: { $ne: this._id }, status: 'pending' },
      { status: 'rejected', rejectionReason: 'Another proposal was accepted' }
    );
  }
});

module.exports = mongoose.model('Proposal', proposalSchema);
