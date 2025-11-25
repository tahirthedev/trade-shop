// Mock AI Analysis Service (without Anthropic API)
// This generates realistic analysis based on project data

const tradeSkills = {
  'Electrician': ['Electrical wiring', 'Circuit breaker installation', 'Lighting systems', 'Electrical code compliance', 'Safety protocols'],
  'Plumber': ['Pipe installation', 'Leak detection', 'Drain cleaning', 'Water heater repair', 'Plumbing code compliance'],
  'HVAC': ['Air conditioning repair', 'Heating systems', 'Duct work', 'Climate control', 'Energy efficiency'],
  'Carpenter': ['Framing', 'Finish carpentry', 'Cabinet installation', 'Deck building', 'Custom woodwork'],
  'Painter': ['Interior painting', 'Exterior painting', 'Surface preparation', 'Color consultation', 'Finish work'],
  'Mason': ['Brickwork', 'Stone masonry', 'Concrete work', 'Mortar mixing', 'Foundation repair'],
  'Roofer': ['Roof installation', 'Roof repair', 'Shingle work', 'Waterproofing', 'Gutter installation'],
  'General Contractor': ['Project management', 'Multi-trade coordination', 'Permitting', 'Budget management', 'Quality control']
};

const complexityKeywords = {
  high: ['commercial', 'industrial', 'large scale', 'multi-story', 'custom design', 'renovation', 'structural', 'complex'],
  medium: ['residential', 'remodel', 'upgrade', 'installation', 'repair', 'addition'],
  low: ['simple', 'basic', 'small', 'minor', 'patch', 'touch-up', 'maintenance']
};

function calculateComplexityScore(description, budget) {
  let score = 5; // Base score

  const lowerDesc = description.toLowerCase();

  // Check for complexity keywords
  complexityKeywords.high.forEach(keyword => {
    if (lowerDesc.includes(keyword)) score += 0.8;
  });
  
  complexityKeywords.medium.forEach(keyword => {
    if (lowerDesc.includes(keyword)) score += 0.3;
  });
  
  complexityKeywords.low.forEach(keyword => {
    if (lowerDesc.includes(keyword)) score -= 0.5;
  });

  // Budget impact
  const avgBudget = (budget.min + budget.max) / 2;
  if (avgBudget > 10000) score += 1.5;
  else if (avgBudget > 5000) score += 0.5;
  else if (avgBudget < 1000) score -= 1;

  // Word count impact (more detailed = more complex)
  const wordCount = description.split(' ').length;
  if (wordCount > 100) score += 1;
  else if (wordCount < 30) score -= 0.5;

  // Clamp between 1-10
  return Math.max(1, Math.min(10, Math.round(score * 10) / 10));
}

function determineRiskLevel(complexityScore, budget) {
  const avgBudget = (budget.min + budget.max) / 2;
  
  if (complexityScore >= 7 || avgBudget > 15000) return 'high';
  if (complexityScore >= 4 || avgBudget > 3000) return 'medium';
  return 'low';
}

function generateSummary(title, description, budget, tradeTypes) {
  const avgBudget = (budget.min + budget.max) / 2;
  const formattedBudget = `$${avgBudget.toLocaleString()}`;
  
  const summary = `This project involves ${tradeTypes.join(' and ')} work for ${title.toLowerCase()}. ` +
    `The estimated budget range is $${budget.min.toLocaleString()}-$${budget.max.toLocaleString()}, ` +
    `with an average of ${formattedBudget}. ${description.substring(0, 150)}...`;
  
  return summary;
}

function extractSkills(description, tradeTypes) {
  const skills = new Set();
  
  // Add trade-specific skills
  tradeTypes.forEach(trade => {
    if (tradeSkills[trade]) {
      tradeSkills[trade].forEach(skill => skills.add(skill));
    }
  });

  // Extract keywords from description
  const lowerDesc = description.toLowerCase();
  const keywords = ['installation', 'repair', 'replacement', 'upgrade', 'maintenance', 
                    'design', 'planning', 'inspection', 'testing', 'consultation'];
  
  keywords.forEach(keyword => {
    if (lowerDesc.includes(keyword)) {
      skills.add(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    }
  });

  return Array.from(skills).slice(0, 8); // Limit to 8 skills
}

function cleanDescription(description) {
  // Remove excessive whitespace
  let cleaned = description.replace(/\s+/g, ' ').trim();
  
  // Capitalize first letter
  cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  
  // Add professional tone
  if (!cleaned.endsWith('.')) cleaned += '.';
  
  return cleaned;
}

function generateEstimatedTimeline(complexityScore, description) {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('urgent') || lowerDesc.includes('asap')) {
    return '1-2 weeks';
  }
  
  if (complexityScore >= 8) return '2-3 months';
  if (complexityScore >= 6) return '3-6 weeks';
  if (complexityScore >= 4) return '2-4 weeks';
  return '1-2 weeks';
}

async function analyzeProject(projectData) {
  const { title, description, budget, tradeTypes, location } = projectData;

  const complexityScore = calculateComplexityScore(description, budget);
  const riskLevel = determineRiskLevel(complexityScore, budget);
  const summary = generateSummary(title, description, budget, tradeTypes);
  const recommendedSkills = extractSkills(description, tradeTypes);
  const cleanedDescription = cleanDescription(description);
  const estimatedTimeline = generateEstimatedTimeline(complexityScore, description);

  return {
    summary,
    recommendedSkills,
    cleanedDescription,
    complexityScore,
    riskLevel,
    estimatedTimeline,
    budgetRange: `$${budget.min.toLocaleString()}-$${budget.max.toLocaleString()}`,
    materials: [], // Can be enhanced later
    challenges: riskLevel === 'high' ? ['Complex scope', 'Requires expert coordination'] : [],
    recommendations: `Consider hiring ${tradeTypes.join(' and ')} professionals with ${complexityScore >= 6 ? '5+' : '2+'} years of experience.`,
    analyzedAt: new Date()
  };
}

module.exports = { analyzeProject };
