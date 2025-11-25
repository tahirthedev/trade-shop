/**
 * Fix individual AI score components that were percentages (0-100)
 * Convert them properly to 0-10 scale
 */

const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tradeshop');
    console.log('✅ MongoDB connected for score fix');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

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

const fixScores = async () => {
  try {
    console.log('🔄 Fixing AI Score components...\n');

    const professionals = await Professional.find({});
    console.log(`📊 Found ${professionals.length} professionals\n`);

    let updated = 0;

    for (const prof of professionals) {
      let needsUpdate = false;
      const oldScores = { ...prof.aiScore };

      // If any component score is less than 2 (likely was a percentage/10)
      // multiply by 10 to get proper scale
      if (prof.aiScore.skillVerification < 2 && prof.aiScore.skillVerification > 0) {
        prof.aiScore.skillVerification = Math.min(10, prof.aiScore.skillVerification * 10);
        needsUpdate = true;
      }
      if (prof.aiScore.reliability < 2 && prof.aiScore.reliability > 0) {
        prof.aiScore.reliability = Math.min(10, prof.aiScore.reliability * 10);
        needsUpdate = true;
      }
      if (prof.aiScore.quality < 2 && prof.aiScore.quality > 0) {
        prof.aiScore.quality = Math.min(10, prof.aiScore.quality * 10);
        needsUpdate = true;
      }
      if (prof.aiScore.safety < 2 && prof.aiScore.safety > 0) {
        prof.aiScore.safety = Math.min(10, prof.aiScore.safety * 10);
        needsUpdate = true;
      }

      if (needsUpdate) {
        await prof.save();
        updated++;
        console.log(`✅ Fixed professional ${prof._id} (${prof.trade})`);
        console.log(`   Before: Skills=${oldScores.skillVerification}, Reliability=${oldScores.reliability}, Quality=${oldScores.quality}, Safety=${oldScores.safety}`);
        console.log(`   After:  Skills=${prof.aiScore.skillVerification}, Reliability=${prof.aiScore.reliability}, Quality=${prof.aiScore.quality}, Safety=${prof.aiScore.safety}\n`);
      }
    }

    console.log(`\n✅ Fixed ${updated} professionals`);

  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  }
};

const run = async () => {
  await connectDB();
  try {
    await fixScores();
    console.log('\n✅ Fix completed!');
  } catch (error) {
    console.error('\n❌ Fix failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

run();
