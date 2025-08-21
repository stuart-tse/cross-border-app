'use client';

import { useEffect, useRef } from 'react';
import { PostStats } from '@/lib/editor/types';
import { 
  calculateContentStats, 
  calculateContentStructureScore, 
  calculateKeywordDensity 
} from '@/lib/editor/utils';

interface UseContentAnalysisProps {
  content: string;
  setStats: (stats: PostStats) => void;
  setContentStructureScore: (score: number) => void;
  setKeywordDensity: (density: {[key: string]: number}) => void;
}

export const useContentAnalysis = ({
  content,
  setStats,
  setContentStructureScore,
  setKeywordDensity
}: UseContentAnalysisProps) => {
  // Store setter functions in refs to avoid them being dependencies
  const setStatsRef = useRef(setStats);
  const setContentStructureScoreRef = useRef(setContentStructureScore);
  const setKeywordDensityRef = useRef(setKeywordDensity);
  
  // Update refs when props change
  setStatsRef.current = setStats;
  setContentStructureScoreRef.current = setContentStructureScore;
  setKeywordDensityRef.current = setKeywordDensity;
  
  useEffect(() => {
    const stats = calculateContentStats(content);
    setStatsRef.current(stats);
    
    const structureScore = calculateContentStructureScore(stats);
    setContentStructureScoreRef.current(structureScore);
    
    const density = calculateKeywordDensity(content);
    setKeywordDensityRef.current(density);
  }, [content]);
};