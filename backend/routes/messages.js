const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// @route   GET /api/messages/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get('/conversations', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const conversations = await Conversation.find({
      participants: userId
    })
      .populate('participants', 'name email avatar userType')
      .populate('project', 'title')
      .sort({ lastMessageAt: -1 });

    res.json({
      success: true,
      conversations
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/messages/conversations/:id
// @desc    Get messages in a conversation
// @access  Private
router.get('/conversations/:id', async (req, res) => {
  try {
    const { limit = 50, before } = req.query;

    let query = { conversation: req.params.id };
    
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      messages: messages.reverse()
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/messages/conversations
// @desc    Create or get existing conversation
// @access  Private
router.post('/conversations', async (req, res) => {
  try {
    const { participants, project } = req.body;

    console.log('Creating conversation with participants:', participants);

    if (!participants || participants.length !== 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Exactly 2 participants are required' 
      });
    }

    // Sort participants to ensure consistent ordering
    const sortedParticipants = participants.sort();

    console.log('Sorted participants:', sortedParticipants);

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: sortedParticipants }
    })
      .populate('participants', 'name email avatar userType')
      .populate('project', 'title');

    console.log('Existing conversation found:', !!conversation);

    if (!conversation) {
      console.log('Creating new conversation...');
      conversation = await Conversation.create({
        participants: sortedParticipants,
        project,
        unreadCount: {
          [sortedParticipants[0]]: 0,
          [sortedParticipants[1]]: 0
        }
      });

      console.log('Conversation created, fetching with populate...');
      conversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name email avatar userType')
        .populate('project', 'title');
    }

    console.log('Returning conversation:', conversation._id);

    res.status(201).json({
      success: true,
      conversation
    });
  } catch (error) {
    console.error('Create conversation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      conversation,
      sender,
      recipient,
      content,
      attachments
    } = req.body;

    const message = await Message.create({
      conversation,
      sender,
      recipient,
      content,
      attachments
    });

    // Update conversation
    await Conversation.findByIdAndUpdate(conversation, {
      lastMessage: content.substring(0, 100),
      lastMessageAt: new Date(),
      $inc: { [`unreadCount.${recipient}`]: 1 }
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('recipient', 'name email avatar');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/messages/:id/read
// @desc    Mark message as read
// @access  Private
router.put('/:id/read', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    if (!message.read) {
      message.read = true;
      message.readAt = new Date();
      await message.save();

      // Decrease unread count
      await Conversation.findByIdAndUpdate(message.conversation, {
        $inc: { [`unreadCount.${message.recipient}`]: -1 }
      });
    }

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/messages/conversations/:id/mark-all-read
// @desc    Mark all messages in conversation as read
// @access  Private
router.put('/conversations/:id/mark-all-read', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    // Mark all unread messages as read
    await Message.updateMany(
      { 
        conversation: req.params.id, 
        recipient: userId, 
        read: false 
      },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    // Reset unread count
    await Conversation.findByIdAndUpdate(req.params.id, {
      [`unreadCount.${userId}`]: 0
    });

    res.json({
      success: true,
      message: 'All messages marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }

    message.deleted = true;
    await message.save();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/messages/unread-count
// @desc    Get unread message count for user
// @access  Private
router.get('/unread-count', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'User ID is required' 
      });
    }

    const count = await Message.countDocuments({
      recipient: userId,
      read: false,
      deleted: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
