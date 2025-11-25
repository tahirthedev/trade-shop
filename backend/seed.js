require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Professional = require('./models/Professional');
const Project = require('./models/Project');
const Review = require('./models/Review');
const Proposal = require('./models/Proposal');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

const sampleData = {
  professionals: [
    {
      name: 'Miguel Rodríguez',
      email: 'miguel@tradeshop.com',
      password: 'password123',
      trade: 'Electrician',
      specialties: ['Residential', 'Commercial', 'Solar', 'Smart Home'],
      yearsExperience: 15,
      hourlyRateMin: 85,
      hourlyRateMax: 120,
      location: { city: 'Dallas', state: 'TX', zipCode: '75201' },
      certifications: [
        { name: 'Master Electrician License', issuer: 'Texas Board', dateObtained: new Date('2015-01-01') },
        { name: 'Solar PV Installation', issuer: 'NABCEP', dateObtained: new Date('2020-06-01') }
      ]
    },
    {
      name: 'James Chen',
      email: 'james@tradeshop.com',
      password: 'password123',
      trade: 'Plumber',
      specialties: ['Emergency Service', 'Repiping', 'Water Heaters', 'Drain Cleaning'],
      yearsExperience: 12,
      hourlyRateMin: 75,
      hourlyRateMax: 110,
      location: { city: 'Plano', state: 'TX', zipCode: '75074' },
      certifications: [
        { name: 'Master Plumber License', issuer: 'Texas Board', dateObtained: new Date('2016-01-01') }
      ]
    },
    {
      name: 'David Thompson',
      email: 'david@tradeshop.com',
      password: 'password123',
      trade: 'HVAC',
      specialties: ['Installation', 'Repair', 'Maintenance', 'Energy Efficiency'],
      yearsExperience: 10,
      hourlyRateMin: 80,
      hourlyRateMax: 115,
      location: { city: 'Frisco', state: 'TX', zipCode: '75034' },
      certifications: [
        { name: 'EPA Universal Certification', issuer: 'EPA', dateObtained: new Date('2014-01-01') }
      ]
    }
  ],
  clients: [
    {
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      password: 'password123',
      location: { city: 'Dallas', state: 'TX', zipCode: '75201' }
    },
    {
      name: 'John Anderson',
      email: 'john@example.com',
      password: 'password123',
      location: { city: 'Plano', state: 'TX', zipCode: '75074' }
    }
  ]
};

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seed...');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Professional.deleteMany({});
    await Project.deleteMany({});
    await Review.deleteMany({});
    await Proposal.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    // Create clients
    console.log('👥 Creating clients...');
    const clients = [];
    for (const clientData of sampleData.clients) {
      const user = await User.create({
        name: clientData.name,
        email: clientData.email,
        password: clientData.password,
        userType: 'client',
        location: clientData.location,
        verified: true
      });
      clients.push(user);
      console.log(`   Created client: ${user.name}`);
    }

    // Create professionals
    console.log('🔧 Creating professionals...');
    const professionals = [];
    for (const profData of sampleData.professionals) {
      // Create user account
      const user = await User.create({
        name: profData.name,
        email: profData.email,
        password: profData.password,
        userType: 'tradesperson',
        location: profData.location,
        verified: true
      });

      // Create professional profile
      const professional = await Professional.create({
        user: user._id,
        trade: profData.trade,
        specialties: profData.specialties,
        yearsExperience: profData.yearsExperience,
        hourlyRate: {
          min: profData.hourlyRateMin,
          max: profData.hourlyRateMax
        },
        certifications: profData.certifications,
        availability: 'Available',
        verified: true,
        topRated: true,
        aiScore: {
          skillVerification: 9.0 + (Math.random() * 1.0), // 9.0-10.0
          reliability: 9.0 + (Math.random() * 1.0), // 9.0-10.0
          quality: 8.5 + (Math.random() * 1.5), // 8.5-10.0
          safety: 9.5 + (Math.random() * 0.5) // 9.5-10.0
        },
        stats: {
          projectsCompleted: 50 + Math.floor(Math.random() * 300),
          averageResponseTime: 1 + Math.floor(Math.random() * 3),
          rating: 4.5 + (Math.random() * 0.5),
          reviewCount: 20 + Math.floor(Math.random() * 80)
        }
      });

      // Calculate AI score
      professional.calculateAIScore();
      await professional.save();

      professionals.push(professional);
      console.log(`   Created professional: ${user.name} (${profData.trade}) - AI Score: ${professional.aiScore.total}`);
    }

    // Create sample projects
    console.log('📋 Creating projects...');
    const projects = [
      {
        title: 'Kitchen Renovation - Full Rewire',
        description: 'Complete electrical rewiring for kitchen renovation including new outlets, lighting, and appliances.',
        client: clients[0]._id,
        location: {
          address: '123 Main St',
          city: 'Dallas',
          state: 'TX',
          zipCode: '75201'
        },
        budget: { min: 7000, max: 9000 },
        tradeTypes: ['Electrician'],
        timeline: {
          startDate: new Date('2024-12-01'),
          deadline: new Date('2024-12-15')
        },
        status: 'active',
        professional: professionals[0]._id,
        progress: 65
      },
      {
        title: 'Emergency Water Heater Replacement',
        description: 'Old water heater failed, need immediate replacement with new 50-gallon electric unit.',
        client: clients[1]._id,
        location: {
          address: '456 Oak Ave',
          city: 'Plano',
          state: 'TX',
          zipCode: '75074'
        },
        budget: { min: 1500, max: 2500 },
        tradeTypes: ['Plumber'],
        timeline: {
          deadline: new Date('2024-11-25')
        },
        status: 'new'
      },
      {
        title: 'AC Installation for New Home',
        description: 'Installing central air conditioning system in newly built 2000 sq ft home.',
        client: clients[0]._id,
        location: {
          address: '789 Elm St',
          city: 'Frisco',
          state: 'TX',
          zipCode: '75034'
        },
        budget: { min: 5000, max: 7000 },
        tradeTypes: ['HVAC'],
        timeline: {
          startDate: new Date('2025-01-05'),
          deadline: new Date('2025-01-10')
        },
        status: 'new'
      }
    ];

    for (const projectData of projects) {
      const project = await Project.create(projectData);
      console.log(`   Created project: ${project.title}`);
    }

    // Create sample reviews
    console.log('⭐ Creating reviews...');
    const completedProject = await Project.create({
      title: 'Solar Panel Installation',
      description: 'Install 20 solar panels on residential roof',
      client: clients[1]._id,
      professional: professionals[0]._id,
      location: {
        city: 'Dallas',
        state: 'TX'
      },
      budget: { min: 15000, max: 18000 },
      tradeTypes: ['Electrician'],
      status: 'completed',
      progress: 100
    });

    await Review.create({
      project: completedProject._id,
      professional: professionals[0]._id,
      client: clients[1]._id,
      rating: 5,
      detailedRatings: {
        quality: 5,
        communication: 5,
        timeliness: 5,
        professionalism: 5
      },
      title: 'Excellent work!',
      comment: 'Miguel did an outstanding job installing our solar panels. Very professional and knowledgeable.',
      wouldRecommend: true,
      verified: true
    });

    console.log('   Created sample review');

    // Create sample proposals
    console.log('📝 Creating proposals...');
    const newProjects = await Project.find({ status: 'new' });
    let proposalCount = 0;
    
    for (const project of newProjects) {
      // Create 2-3 proposals for each new project
      const numProposals = 2 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < numProposals && i < professionals.length; i++) {
        const proposal = await Proposal.create({
          project: project._id,
          professional: professionals[i]._id,
          client: project.client,
          budget: project.budget.min + Math.floor(Math.random() * (project.budget.max - project.budget.min)),
          timeline: {
            estimatedDuration: {
              value: 1 + Math.floor(Math.random() * 3),
              unit: 'weeks'
            }
          },
          coverLetter: `I am very interested in your "${project.title}" project. With ${professionals[i].yearsExperience} years of experience in ${professionals[i].trade}, I am confident I can deliver exceptional results. My approach includes thorough planning, quality workmanship, and clear communication throughout the project.`,
          status: 'pending'
        });
        proposalCount++;
        console.log(`   Created proposal from ${professionals[i].trade} for "${project.title}"`);
      }
    }

    // Create sample conversations and messages
    console.log('💬 Creating conversations and messages...');
    let conversationCount = 0;
    let messageCount = 0;
    
    // Create conversation between first client and first professional
    const conversation1 = await Conversation.create({
      participants: [clients[0]._id, professionals[0].user],
      project: newProjects[0]?._id,
      lastMessage: 'Looking forward to working with you!',
      lastMessageAt: new Date(),
      unreadCount: {
        [clients[0]._id]: 0,
        [professionals[0].user]: 0
      }
    });
    conversationCount++;

    // Add messages to conversation
    await Message.create({
      conversation: conversation1._id,
      sender: clients[0]._id,
      recipient: professionals[0].user,
      content: 'Hi! I saw your proposal for my kitchen rewiring project. When would you be available to start?',
      read: true,
      readAt: new Date()
    });
    messageCount++;

    await Message.create({
      conversation: conversation1._id,
      sender: professionals[0].user,
      recipient: clients[0]._id,
      content: 'Hello! I can start next Monday. I will need about 2 weeks to complete the work.',
      read: true,
      readAt: new Date()
    });
    messageCount++;

    await Message.create({
      conversation: conversation1._id,
      sender: clients[0]._id,
      recipient: professionals[0].user,
      content: 'That sounds perfect! Looking forward to working with you!',
      read: false
    });
    messageCount++;

    console.log(`   Created ${conversationCount} conversations with ${messageCount} messages`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${clients.length} clients created`);
    console.log(`   - ${professionals.length} professionals created`);
    console.log(`   - ${projects.length + 1} projects created`);
    console.log(`   - ${proposalCount} proposals created`);
    console.log(`   - ${conversationCount} conversations created`);
    console.log(`   - ${messageCount} messages created`);
    console.log(`   - 1 review created`);
    console.log('\n🎉 You can now login with:');
    console.log('   Client: sarah@example.com / password123');
    console.log('   Professional: miguel@tradeshop.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seed
seedDatabase();
