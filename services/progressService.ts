import { DrillProgress, DrillSession, UserSkillProfile, SwingReport } from '../types';

const STORAGE_KEYS = {
  DRILL_PROGRESS: 'justswing-drill-progress',
  USER_PROFILE: 'justswing-user-profile'
};

export class ProgressService {
  // Drill Progress Management
  static getDrillProgress(): DrillProgress[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DRILL_PROGRESS);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading drill progress:', error);
      return [];
    }
  }

  static saveDrillProgress(progress: DrillProgress[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.DRILL_PROGRESS, JSON.stringify(progress));
    } catch (error) {
      console.error('Error saving drill progress:', error);
    }
  }

  static completeDrill(drillId: string, rating?: number, notes?: string): void {
    const progress = this.getDrillProgress();
    const existingProgress = progress.find(p => p.drillId === drillId);
    
    const session: DrillSession = {
      date: Date.now(),
      duration: 15, // Default duration
      completed: true,
      rating,
      notes
    };

    if (existingProgress) {
      existingProgress.sessions.push(session);
      existingProgress.rating = rating || existingProgress.rating;
      existingProgress.notes = notes || existingProgress.notes;
    } else {
      progress.push({
        drillId,
        completedAt: Date.now(),
        sessions: [session],
        rating,
        notes
      });
    }

    this.saveDrillProgress(progress);
  }

  static getDrillProgressForDrill(drillId: string): DrillProgress | null {
    const progress = this.getDrillProgress();
    return progress.find(p => p.drillId === drillId) || null;
  }

  static getDrillCompletionCount(): number {
    return this.getDrillProgress().length;
  }

  static getTotalSessionsCount(): number {
    return this.getDrillProgress().reduce((total, progress) => total + progress.sessions.length, 0);
  }

  // User Profile Management
  static getUserProfile(): UserSkillProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  }

  static saveUserProfile(profile: UserSkillProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  }

  // Skill Assessment
  static assessUserSkill(report: SwingReport): UserSkillProfile {
    const scores = Object.values(report.metrics).map(m => m.score);
    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    // Determine overall level
    let overallLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    if (averageScore >= 80) {
      overallLevel = 'Advanced';
    } else if (averageScore >= 60) {
      overallLevel = 'Intermediate';
    } else {
      overallLevel = 'Beginner';
    }

    // Analyze strengths and weaknesses
    const phaseScores = Object.entries(report.metrics);
    const strengths = phaseScores
      .filter(([_, analysis]) => analysis.score >= 75)
      .map(([phase, _]) => phase.charAt(0).toUpperCase() + phase.slice(1));
    
    const weaknesses = phaseScores
      .filter(([_, analysis]) => analysis.score < 60)
      .map(([phase, _]) => phase.charAt(0).toUpperCase() + phase.slice(1));

    // Determine recommended focus areas
    const recommendedFocus = weaknesses.length > 0 ? weaknesses : ['Power', 'Path'];

    const profile: UserSkillProfile = {
      overallLevel,
      strengths,
      weaknesses,
      recommendedFocus,
      lastAssessment: Date.now()
    };

    this.saveUserProfile(profile);
    return profile;
  }

  // Get personalized drill recommendations
  static getRecommendedDrills(allDrills: any[], userProfile: UserSkillProfile | null, recentReport: SwingReport | null): any[] {
    if (!userProfile && !recentReport) return allDrills;

    const recommendations = new Set<string>();
    
    // Based on user profile weaknesses
    if (userProfile) {
      userProfile.weaknesses.forEach(weakness => {
        const categoryDrills = allDrills.filter(drill => 
          drill.category.toLowerCase().includes(weakness.toLowerCase())
        );
        categoryDrills.forEach(drill => recommendations.add(drill.id));
      });
    }

    // Based on recent analysis
    if (recentReport) {
      Object.entries(recentReport.metrics).forEach(([phase, analysis]) => {
        if (analysis.score < 70) {
          const phaseDrills = allDrills.filter(drill => 
            drill.category.toLowerCase().includes(phase.toLowerCase())
          );
          phaseDrills.forEach(drill => recommendations.add(drill.id));
        }
      });
    }

    // Return recommended drills with priority
    return allDrills
      .filter(drill => recommendations.has(drill.id))
      .concat(allDrills.filter(drill => !recommendations.has(drill.id)))
      .slice(0, 6); // Return top 6 recommendations
  }
}
