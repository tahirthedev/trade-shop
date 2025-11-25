// Mock Match Score Calculator
// Calculates how well a professional matches a specific job

function calculateMatchScore(professional, project) {
  let matchScore = 0;
  let factors = [];

  // 1. Trade Type Match (30% weight)
  const tradeMatch = project.tradeTypes.some(trade => 
    professional.trade === trade || professional.specialties?.includes(trade)
  );
  
  if (tradeMatch) {
    matchScore += 3;
    factors.push({ name: 'Trade Match', score: 3, max: 3 });
  } else {
    factors.push({ name: 'Trade Match', score: 0, max: 3 });
  }

  // 2. Experience Level (20% weight)
  const avgBudget = (project.budget.min + project.budget.max) / 2;
  const projectComplexity = project.aiAnalysis?.complexityScore || 5;
  
  let experienceScore = 0;
  if (professional.yearsExperience >= 10) {
    experienceScore = 2;
  } else if (professional.yearsExperience >= 5) {
    experienceScore = 1.5;
  } else if (professional.yearsExperience >= 2) {
    experienceScore = 1;
  } else {
    experienceScore = 0.5;
  }

  // Adjust for project complexity
  if (projectComplexity >= 7 && professional.yearsExperience < 5) {
    experienceScore *= 0.5; // Reduce score for complex projects
  }
  
  matchScore += experienceScore;
  factors.push({ name: 'Experience', score: experienceScore, max: 2 });

  // 3. Budget Alignment (15% weight)
  const professionalAvgRate = (professional.hourlyRate.min + professional.hourlyRate.max) / 2;
  const estimatedHours = avgBudget / professionalAvgRate;
  
  let budgetScore = 0;
  if (professionalAvgRate <= avgBudget / 20) { // Within reasonable hourly budget
    budgetScore = 1.5;
  } else if (professionalAvgRate <= avgBudget / 10) {
    budgetScore = 1;
  } else {
    budgetScore = 0.5;
  }
  
  matchScore += budgetScore;
  factors.push({ name: 'Budget Fit', score: budgetScore, max: 1.5 });

  // 4. Rating & Quality (20% weight)
  const professionalRating = professional.rating || 0;
  const ratingScore = (professionalRating / 5) * 2; // Convert 0-5 rating to 0-2 score
  
  matchScore += ratingScore;
  factors.push({ name: 'Rating', score: ratingScore, max: 2 });

  // 5. Availability (10% weight)
  let availabilityScore = 0;
  if (professional.availability === 'Available') {
    availabilityScore = 1;
  } else if (professional.availability === 'Busy') {
    availabilityScore = 0.5;
  }
  
  matchScore += availabilityScore;
  factors.push({ name: 'Availability', score: availabilityScore, max: 1 });

  // 6. Location Proximity (5% weight) - Simple check
  const locationMatch = professional.location?.city?.toLowerCase() === project.location.city?.toLowerCase();
  const locationScore = locationMatch ? 0.5 : 0;
  
  matchScore += locationScore;
  factors.push({ name: 'Location', score: locationScore, max: 0.5 });

  // Normalize to 0-10 scale (total max is 10)
  const finalScore = Math.min(10, Math.max(0, matchScore));
  
  // Calculate percentage
  const matchPercentage = Math.round((finalScore / 10) * 100);

  return {
    score: Math.round(finalScore * 10) / 10, // Round to 1 decimal
    percentage: matchPercentage,
    factors,
    recommendation: getRecommendation(finalScore)
  };
}

function getRecommendation(score) {
  if (score >= 8) return 'Excellent Match';
  if (score >= 6.5) return 'Good Match';
  if (score >= 5) return 'Fair Match';
  return 'Low Match';
}

// Batch calculate matches for multiple professionals
function calculateMatches(professionals, project) {
  return professionals.map(professional => ({
    ...professional,
    matchScore: calculateMatchScore(professional, project)
  })).sort((a, b) => b.matchScore.score - a.matchScore.score);
}

module.exports = {
  calculateMatchScore,
  calculateMatches,
  getRecommendation
};
