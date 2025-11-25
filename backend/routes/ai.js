const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// @route   POST /api/ai/chat
// @desc    Chat with BuildBot AI Assistant
// @access  Public
router.post('/chat', async (req, res) => {
  try {
    const { message, userType, conversationHistory } = req.body;

    const messages = conversationHistory || [];
    
    // Add system context
    const systemMessage = {
      role: 'user',
      content: `You are BuildBot, an AI assistant for Trade Shop, a professional trades marketplace platform. You help ${userType === 'tradesperson' ? 'tradespeople with project estimates, material calculations, scheduling, business advice, and technical questions' : 'clients with finding the right tradespeople, understanding project scope, budgeting, and timeline expectations'}.

User question: ${message}

Provide a helpful, professional, and actionable response. Be specific with numbers when possible. Keep responses concise but informative.`
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [...messages, systemMessage]
      })
    });

    const data = await response.json();
    const assistantMessage = data.content[0].text;

    res.json({
      success: true,
      message: assistantMessage
    });
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error communicating with AI assistant' 
    });
  }
});

// @route   POST /api/ai/analyze-project
// @desc    Analyze a project with AI
// @access  Public
router.post('/analyze-project', async (req, res) => {
  try {
    const { description, images } = req.body;

    if (!description && (!images || images.length === 0)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a description or images' 
      });
    }

    const messages = [];

    if (images && images.length > 0) {
      // Analyze with images
      const content = [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: images[0].split(',')[1] // Remove data URL prefix
          }
        },
        {
          type: 'text',
          text: `Analyze this project site image. ${description ? `Additional context: ${description}` : ''}

Provide a professional assessment including:
1. Project scope and complexity
2. Estimated timeline
3. Budget range (in USD)
4. Required materials (with approximate quantities)
5. Potential challenges
6. Recommended approach

Format the response as structured JSON with these keys: scope, timeline, budgetRange, materials (array), challenges (array), recommendations.`
        }
      ];

      messages.push({ role: 'user', content });
    } else {
      // Text-only analysis
      messages.push({
        role: 'user',
        content: `Analyze this project: ${description}

Provide:
1. Scope assessment
2. Timeline estimate
3. Budget range (in USD)
4. Material list
5. Key considerations
6. Recommendations

Format the response as structured JSON with these keys: scope, timeline, budgetRange, materials (array), considerations (array), recommendations.`
      });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: messages
      })
    });

    const data = await response.json();
    const analysis = data.content[0].text;

    // Try to parse JSON response
    let structuredAnalysis;
    try {
      structuredAnalysis = JSON.parse(analysis);
    } catch (e) {
      // If not JSON, return as text
      structuredAnalysis = { rawAnalysis: analysis };
    }

    res.json({
      success: true,
      analysis: structuredAnalysis
    });
  } catch (error) {
    console.error('AI Analysis error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error analyzing project' 
    });
  }
});

// @route   PUT /api/ai/projects/:id/ai-analysis
// @desc    Save AI analysis to project
// @access  Private
router.put('/projects/:id/ai-analysis', async (req, res) => {
  try {
    const { analysis } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    project.aiAnalysis = {
      scope: analysis.scope,
      estimatedTimeline: analysis.timeline,
      budgetRange: analysis.budgetRange,
      materials: analysis.materials,
      challenges: analysis.challenges,
      recommendations: analysis.recommendations,
      analyzedAt: new Date()
    };

    await project.save();

    res.json({
      success: true,
      project
    });
  } catch (error) {
    console.error('Save AI analysis error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
