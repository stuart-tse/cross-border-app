import { PostStats } from './types';

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
};

export const getSeoScoreColor = (score: number): string => {
  if (score >= 80) return 'text-success-green';
  if (score >= 60) return 'text-warning-amber';
  return 'text-error-red';
};

export const getSeoScoreLabel = (score: number): string => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Needs Improvement';
  return 'Poor';
};

export const calculateContentStats = (content: string): PostStats => {
  if (!content) {
    return {
      wordCount: 0,
      readTime: 0,
      characterCount: 0,
      headingCount: 0,
      imageCount: 0,
      linkCount: 0,
      paragraphCount: 0
    };
  }

  const words = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const chars = content.length;
  const readTime = Math.ceil(words / 200);
  
  // Enhanced content analysis
  const paragraphs = content.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;
  const headings = (content.match(/#{1,6}\s/g) || []).length;
  const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
  const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
  
  return {
    wordCount: words,
    readTime,
    characterCount: chars,
    headingCount: headings,
    imageCount: images,
    linkCount: links,
    paragraphCount: paragraphs
  };
};

export const calculateContentStructureScore = (stats: PostStats): number => {
  let structureScore = 0;
  if (stats.headingCount >= 2) structureScore += 25;
  if (stats.paragraphCount >= 3) structureScore += 25;
  if (stats.imageCount >= 1) structureScore += 25;
  if (stats.linkCount >= 1) structureScore += 25;
  return structureScore;
};

export const calculateKeywordDensity = (content: string): {[key: string]: number} => {
  if (!content) return {};
  
  const commonWords = [
    'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 
    'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 
    'has', 'had'
  ];
  
  const contentWords = content.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const wordFreq: {[key: string]: number} = {};
  
  contentWords.forEach(word => {
    if (word.length > 3 && !commonWords.includes(word)) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
  });
  
  const totalWords = contentWords.length;
  const density: {[key: string]: number} = {};
  Object.entries(wordFreq).forEach(([word, count]) => {
    density[word] = Math.round((count / totalWords) * 100 * 100) / 100;
  });
  
  return density;
};

// AI-powered alt text generation (mock implementation)
export const generateAiAltText = async (filename: string, url: string): Promise<string> => {
  // In production, this would use an AI service like OpenAI Vision or Google Cloud Vision
  const suggestions = [
    `Professional photo related to ${filename.split('.')[0]}`,
    `High-quality image showing ${filename.split('.')[0].replace(/-|_/g, ' ')}`,
    `Detailed view of ${filename.split('.')[0].replace(/-|_/g, ' ')}`,
  ];
  return suggestions[Math.floor(Math.random() * suggestions.length)];
};

// Get image dimensions
export const getImageDimensions = (url: string): Promise<{width: number, height: number}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = url;
  });
};

export const getTabBadgeCount = (tabKey: string, data: {
  seoAnalysis: any;
  mediaLibrary: any[];
  collaborators: any[];
}): number | null => {
  switch (tabKey) {
    case 'seo':
      return data.seoAnalysis ? Math.round(data.seoAnalysis.score) : null;
    case 'media':
      return data.mediaLibrary.length || null;
    case 'collaboration':
      return data.collaborators.filter(c => c.status === 'online').length || null;
    default:
      return null;
  }
};