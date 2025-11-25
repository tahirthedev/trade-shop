const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },
  
  lastMessage: {
    type: String
  },
  
  lastMessageAt: {
    type: Date,
    default: Date.now
  },
  
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
  }
}, {
  timestamps: true
});

// Ensure only 2 participants
conversationSchema.pre('validate', function(next) {
  if (this.participants.length !== 2) {
    next(new Error('A conversation must have exactly 2 participants'));
  } else {
    next();
  }
});

// Create compound index for unique conversations between two users
// Note: We can't use unique index on array field, so we handle uniqueness in code

module.exports = mongoose.model('Conversation', conversationSchema);
