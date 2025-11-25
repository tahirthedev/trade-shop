/**
 * Migration Script: Convert AI Scores from 0-1000 scale to 0-10 scale
 * 
 * This script updates all existing professional records to use the new 0-10 scale
 * instead of the old 0-1000 scale.
 * 
 * Run this script once: node migrations/migrateAIScores.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tradeshop');
    console.log('✅ MongoDB connected for migration');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Professional Schema (simplified for migration)
const professionalSchema = new mongoose.Schema({
  aiScore: {
    total: Number,
    skillVerification: Number,
    reliability: Number,
    quality: Number,
    safety: Number
  },
  trade: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { collection: 'professionals' });

const Professional = mongoose.model('Professional', professionalSchema);

const migrateScores = async () => {
  try {
    console.log('🔄 Starting AI Score migration...\n');

    // Find all professionals with scores > 10 (old scale)
    const professionals = await Professional.find({
      $or: [
        { 'aiScore.total': { $gt: 10 } },
        { 'aiScore.skillVerification': { $gt: 10 } },
        { 'aiScore.reliability': { $gt: 10 } },
        { 'aiScore.quality': { $gt: 10 } },
        { 'aiScore.safety': { $gt: 10 } }
      ]
    });

    console.log(`📊 Found ${professionals.length} professionals with old-scale scores\n`);

    if (professionals.length === 0) {
      console.log('✅ No professionals need migration. All scores are already on 0-10 scale.');
      return;
    }

    let updated = 0;
    let errors = 0;

    for (const prof of professionals) {
      try {
        const oldScores = {
          total: prof.aiScore.total,
          skillVerification: prof.aiScore.skillVerification,
          reliability: prof.aiScore.reliability,
          quality: prof.aiScore.quality,
          safety: prof.aiScore.safety
        };

        // Convert from 0-1000 to 0-10 scale
        prof.aiScore.total = Math.min(10, Math.max(0, (prof.aiScore.total / 100)));
        prof.aiScore.skillVerification = Math.min(10, Math.max(0, (prof.aiScore.skillVerification / 100)));
        prof.aiScore.reliability = Math.min(10, Math.max(0, (prof.aiScore.reliability / 100)));
        prof.aiScore.quality = Math.min(10, Math.max(0, (prof.aiScore.quality / 100)));
        prof.aiScore.safety = Math.min(10, Math.max(0, (prof.aiScore.safety / 100)));

        await prof.save();
        updated++;

        console.log(`✅ Updated professional ${prof._id} (${prof.trade || 'Unknown'})`);
        console.log(`   Old: Total=${oldScores.total}, Skills=${oldScores.skillVerification}, Reliability=${oldScores.reliability}, Quality=${oldScores.quality}, Safety=${oldScores.safety}`);
        console.log(`   New: Total=${prof.aiScore.total.toFixed(1)}, Skills=${prof.aiScore.skillVerification.toFixed(1)}, Reliability=${prof.aiScore.reliability.toFixed(1)}, Quality=${prof.aiScore.quality.toFixed(1)}, Safety=${prof.aiScore.safety.toFixed(1)}\n`);
      } catch (err) {
        errors++;
        console.error(`❌ Error updating professional ${prof._id}:`, err.message);
      }
    }

    console.log('\n📊 Migration Summary:');
    console.log(`   ✅ Successfully updated: ${updated}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📈 Total processed: ${professionals.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  
  try {
    await migrateScores();
    console.log('\n✅ Migration completed successfully!');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Execute
runMigration();
