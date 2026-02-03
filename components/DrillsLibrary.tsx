import React, { useState, useMemo } from 'react';
import { Drill, SwingReport, DrillProgress, UserSkillProfile, SwingPhaseAnalysis } from '../types';
import { ProgressService } from '../services/progressService';

interface DrillsLibraryProps {
  report: SwingReport | null;
  onDrillSelect: (drill: Drill) => void;
  drillProgress: DrillProgress[];
  userProfile: UserSkillProfile | null;
}

export const ALL_DRILLS: Drill[] = [
  {
    id: 'tee-height',
    title: 'High/Low Tee Work',
    description: 'Work on maintaining a consistent swing plane across different strike zone heights.',
    steps: [
      'Set the tee to the top of your strike zone (letters).',
      'Focus on a slight downward or level path to the ball to prevent popping up.',
      'Take 10 swings at the high location.',
      'Lower the tee to the bottom of the zone (knees).',
      'Focus on "staying through" the ball and using your legs to stay low.',
      'Take 10 swings at the low location.'
    ],
    category: 'Path',
    difficulty: 'Beginner',
    duration: '15 mins'
  },
  {
    id: 'stop-at-contact',
    title: 'Stop at Contact',
    description: 'Swing and freeze at the point of impact to check your palm-up/palm-down position.',
    steps: [
      'Take a normal setup and load.',
      'Swing at 75% speed and abruptly stop the bat at the point of impact.',
      'Check that your lead arm is firm and your top hand palm is facing up.',
      'Ensure your head is steady and eyes are on the contact point.',
      'Repeat 15 times to build muscle memory of the contact position.'
    ],
    category: 'Path',
    difficulty: 'Intermediate',
    duration: '10 mins'
  },
  {
    id: 'walking-start',
    title: 'Walking Happy Gilmore',
    description: 'Develop momentum and rhythmic weight transfer from your load to your stride.',
    steps: [
      'Stand 3 feet behind your normal hitting position.',
      'Step forward with your rear foot, then your lead foot in a rhythmic motion.',
      'As your lead foot plants, begin your load and fire the swing.',
      'Focus on the feeling of weight transferring from your back hip to your front side.',
      'Perform 10 reps focusing on fluidity, not max power.'
    ],
    category: 'Load',
    difficulty: 'Advanced',
    duration: '20 mins'
  },
  {
    id: 'narrow-stance',
    title: 'Narrow Stance Drill',
    description: 'Forces better balance and core engagement by starting with feet close together.',
    steps: [
      'Stand with your feet nearly touching in the box.',
      'Take a small, controlled stride forward.',
      'Keep your head center-mass and do not let it drift forward with the stride.',
      'Focus on your core rotating around a central pillar.',
      'Perform 20 swings focusing on maintaining perfect balance after the follow-through.'
    ],
    category: 'Stance',
    difficulty: 'Intermediate',
    duration: '15 mins'
  },
  {
    id: 'med-ball-toss',
    title: 'Med Ball Side Toss',
    description: 'Develop explosive rotational power by tossing a medicine ball against a wall.',
    steps: [
      'Hold a 4-8lb med ball with both hands at your waist.',
      'Assume your hitting stance.',
      'Load back into your rear hip, then explosively rotate and throw the ball against a wall.',
      'Ensure your rear foot "squishes the bug" and hips clear completely.',
      'Perform 3 sets of 8 reps per side.'
    ],
    category: 'Power',
    difficulty: 'Intermediate',
    duration: '15 mins'
  },
  {
    id: 'one-hand',
    title: 'Top Hand Isolation',
    description: 'Use a short bat to practice keeping your top hand tight to your body during the turn.',
    steps: [
      'Hold a short training bat (or grip your normal bat at the barrel) with only your top hand.',
      'Assume your stance and load.',
      'Focus on leading with your elbow and keeping the bat "in the slot" near your shoulder.',
      'Swing through contact focusing on a strong palm-up finish.',
      'Perform 10 controlled swings.'
    ],
    category: 'Path',
    difficulty: 'Advanced',
    duration: '10 mins'
  },
  {
    id: 'balance-beam',
    title: 'Balance Beam Hitting',
    description: 'Improve balance and posture by hitting while standing on a 2x4 or balance beam.',
    steps: [
      'Place a 2x4 on the ground or use a balance beam.',
      'Take your stance on the beam, feet shoulder-width apart.',
      'Perform slow-motion swings first to get your balance.',
      'Progress to full swings focusing on staying on the beam throughout.',
      'Complete 15 successful swings without stepping off.'
    ],
    category: 'Balance',
    difficulty: 'Intermediate',
    duration: '20 mins'
  },
  {
    id: 'knee-down-tee',
    title: 'Knee Down Tee Work',
    description: 'Forces proper upper body mechanics by eliminating lower body movement.',
    steps: [
      'Kneel on both knees with the tee positioned at waist height.',
      'Focus on rotating your upper body while keeping your lower body stable.',
      'Maintain a tall posture and avoid lunging at the ball.',
      'Drive your hands through the ball with a strong finish.',
      'Take 20 swings focusing on pure upper body rotation.'
    ],
    category: 'Path',
    difficulty: 'Beginner',
    duration: '15 mins'
  },
  {
    id: 'stride-freeze',
    title: 'Stride Freeze Drill',
    description: 'Practice landing in a powerful, balanced position after your stride.',
    steps: [
      'Take your normal stance and begin your load.',
      'Stride forward and freeze in your landing position.',
      'Check that your weight is 50/50 and your head is centered.',
      'Hold the position for 3 seconds before completing the swing.',
      'Repeat 12 times focusing on a stable landing.'
    ],
    category: 'Load',
    difficulty: 'Beginner',
    duration: '10 mins'
  },
  {
    id: 'closed-eyes',
    title: 'Closed Eyes Swing',
    description: 'Develop feel and muscle memory by swinging with eyes closed after load.',
    steps: [
      'Take your normal stance and load with eyes open.',
      'Close your eyes just before starting your swing.',
      'Focus on feeling your body movements and balance.',
      'Complete the swing based on muscle memory alone.',
      'Open your eyes and check your finish position. Repeat 10 times.'
    ],
    category: 'Balance',
    difficulty: 'Advanced',
    duration: '15 mins'
  },
  {
    id: 'weighted-bat',
    title: 'Weighted Bat Swings',
    description: 'Build bat speed and strength using a slightly heavier training bat.',
    steps: [
      'Use a bat that is 2-4 ounces heavier than your game bat.',
      'Take 5 slow practice swings to get used to the weight.',
      'Perform 10 full-speed swings focusing on good mechanics.',
      'Switch back to your regular bat (it will feel lighter).',
      'Take 5 more swings with your game bat to reinforce speed.'
    ],
    category: 'Power',
    difficulty: 'Intermediate',
    duration: '12 mins'
  },
  {
    id: 'two-ball-toss',
    title: 'Two-Ball Color Recognition',
    description: 'Improve pitch recognition and decision-making skills.',
    steps: [
      'Have a partner toss two balls of different colors.',
      'Partner calls out which color to hit mid-flight.',
      'Focus on tracking the correct ball and ignoring the other.',
      'Make contact only with the designated color ball.',
      'Complete 20 successful recognitions and hits.'
    ],
    category: 'Stance',
    difficulty: 'Advanced',
    duration: '20 mins'
  },
  {
    id: 'back-hand',
    title: 'Bottom Hand Only',
    description: 'Strengthen your lead arm and improve bat control with bottom hand swings.',
    steps: [
      'Hold the bat with only your bottom hand (lead hand).',
      'Use a lighter bat or choke up for better control.',
      'Focus on a smooth, level swing path.',
      'Keep your elbow slightly bent but firm through contact.',
      'Perform 15 controlled swings per hand.'
    ],
    category: 'Path',
    difficulty: 'Intermediate',
    duration: '12 mins'
  },
  {
    id: 'quick-hands',
    title: 'Quick Hands Drill',
    description: 'Develop bat speed and quick hands through rapid short swings.',
    steps: [
      'Stand closer to the tee than normal (reduced distance).',
      'Focus on minimal load and explosive hand action.',
      'Take short, compact swings with maximum hand speed.',
      'Don\'t try to kill the ball - focus on quickness.',
      'Perform 3 sets of 8 rapid-fire swings.'
    ],
    category: 'Power',
    difficulty: 'Intermediate',
    duration: '10 mins'
  },
  {
    id: 'towel-drill',
    title: 'Towel Under Arm',
    description: 'Keep your front elbow connected to your body for proper swing mechanics.',
    steps: [
      'Tuck a small towel under your front elbow.',
      'Take your stance and load normally.',
      'Swing without letting the towel fall until after contact.',
      'Focus on keeping your elbow connected to your body.',
      'Complete 15 successful swings with the towel in place.'
    ],
    category: 'Path',
    difficulty: 'Beginner',
    duration: '10 mins'
  },
  {
    id: 'mirror-work',
    title: 'Mirror Swing Analysis',
    description: 'Use a mirror for real-time visual feedback on your mechanics.',
    steps: [
      'Set up a mirror where you can see your full swing.',
      'Perform 5 slow-motion swings watching your posture.',
      'Check that your spine angle stays consistent.',
      'Verify your hands stay inside the ball path.',
      'Take 10 full-speed swings while monitoring key positions.'
    ],
    category: 'Stance',
    difficulty: 'Beginner',
    duration: '15 mins'
  },
  {
    id: 'band-resistance',
    title: 'Resistance Band Swings',
    description: 'Add resistance to build strength and improve swing path.',
    steps: [
      'Attach a resistance band to a sturdy object at chest height.',
      'Hold the band handle like you would hold a bat.',
      'Perform slow swings against the resistance.',
      'Focus on maintaining proper mechanics despite the resistance.',
      'Complete 3 sets of 12 swings per direction.'
    ],
    category: 'Power',
    difficulty: 'Intermediate',
    duration: '15 mins'
  },
  {
    id: 'timing-drill',
    title: 'Variable Timing Drill',
    description: 'Improve your ability to adjust to different pitch speeds.',
    steps: [
      'Have a partner vary the timing of their tosses.',
      'Some tosses should be quick, others with a pause.',
      'Focus on loading and timing based on the pitcher\'s motion.',
      'Don\'t commit to your swing until you recognize the release.',
      'Complete 20 varied timing attempts.'
    ],
    category: 'Load',
    difficulty: 'Advanced',
    duration: '20 mins'
  },
  {
    id: 'follow-through',
    title: 'Perfect Follow-Through',
    description: 'Focus specifically on finishing your swing with proper extension and balance.',
    steps: [
      'Take normal swings but exaggerate your follow-through.',
      'Focus on full extension past the contact point.',
      'Ensure your back shoulder finishes lower than your front.',
      'Hold your finish position for 2 seconds after each swing.',
      'Complete 15 swings focusing on the finish.'
    ],
    category: 'Path',
    difficulty: 'Beginner',
    duration: '10 mins'
  },
  {
    id: 'chair-drill',
    title: 'Seat Belt Chair Drill',
    description: 'Prevent lunging by keeping your back against a chair during swing.',
    steps: [
      'Place a chair directly behind your rear hip.',
      'Take your stance with your back lightly touching the chair.',
      'Swing without losing contact with the chair until after contact.',
      'This prevents you from lunging forward at the ball.',
      'Complete 20 swings staying connected to the chair.'
    ],
    category: 'Stance',
    difficulty: 'Intermediate',
    duration: '15 mins'
  }
];

// Enhanced drill matching system
const DRILL_KEYWORD_MAP: Record<string, string[]> = {
  'stride': ['stride freeze', 'walking happy gilmore'],
  'balance': ['balance beam', 'closed eyes', 'narrow stance'],
  'load': ['stride freeze', 'walking happy gilmore', 'variable timing'],
  'timing': ['variable timing', 'quick hands'],
  'path': ['stop at contact', 'knee down tee', 'top hand', 'bottom hand', 'towel drill', 'follow through'],
  'power': ['med ball toss', 'weighted bat', 'quick hands', 'resistance band'],
  'hand': ['top hand', 'bottom hand', 'quick hands'],
  'stance': ['narrow stance', 'mirror work', 'two-ball toss', 'chair drill'],
  'extension': ['follow through', 'stop at contact'],
  'mechanics': ['mirror work', 'stop at contact', 'towel drill'],
  'rhythm': ['walking happy gilmore', 'variable timing'],
  'speed': ['quick hands', 'weighted bat'],
  'strength': ['med ball toss', 'resistance band', 'weighted bat'],
  'posture': ['balance beam', 'mirror work', 'narrow stance'],
  'sequence': ['stride freeze', 'walking happy gilmore'],
  'recognition': ['two-ball toss'],
  'feel': ['closed eyes', 'mirror work'],
  'connection': ['towel drill', 'chair drill']
};

const findMatchingDrills = (suggestedDrillNames: string[]): typeof ALL_DRILLS => {
  const matchedDrills: typeof ALL_DRILLS = [];
  const processedDrills = new Set<string>();

  for (const suggestion of suggestedDrillNames) {
    const suggestionLower = suggestion.toLowerCase();
    
    // Direct string matching (existing logic)
    for (const drill of ALL_DRILLS) {
      if (!processedDrills.has(drill.id) &&
          (drill.title.toLowerCase().includes(suggestionLower) || 
           suggestionLower.includes(drill.title.toLowerCase()))) {
        matchedDrills.push(drill);
        processedDrills.add(drill.id);
        break;
      }
    }

    // If no direct match, try keyword matching
    if (matchedDrills.length < suggestedDrillNames.length) {
      for (const [keyword, relatedDrills] of Object.entries(DRILL_KEYWORD_MAP)) {
        if (suggestionLower.includes(keyword)) {
          for (const drillTitle of relatedDrills) {
            const drill = ALL_DRILLS.find(d => 
              d.title.toLowerCase().includes(drillTitle) && 
              !processedDrills.has(d.id)
            );
            if (drill) {
              matchedDrills.push(drill);
              processedDrills.add(drill.id);
              break;
            }
          }
        }
      }
    }
  }

  return matchedDrills;
};

const DrillsLibrary: React.FC<DrillsLibraryProps> = ({ report, onDrillSelect, drillProgress, userProfile }) => {
  const suggestedDrillNames = report 
    ? (Object.values(report.metrics) as SwingPhaseAnalysis[]).flatMap(m => m.drills)
    : [];

  const prescribedDrills = findMatchingDrills(suggestedDrillNames);
  const otherDrills = ALL_DRILLS.filter(d => !prescribedDrills.includes(d));

  // Get recommended drills based on user profile
  const recommendedDrills = useMemo(() => {
    if (userProfile || report) {
      return ProgressService.getRecommendedDrills(ALL_DRILLS, userProfile, report);
    }
    return [];
  }, [userProfile, report]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fadeIn">
      <header className="mb-12">
        <h2 className="text-3xl font-oswald font-bold text-white mb-2 uppercase italic tracking-tight">DRILL LIBRARY</h2>
        <p className="text-slate-400">Professional training routines to refine your mechanics.</p>
        
        {/* Progress summary */}
        {drillProgress.length > 0 && (
          <div className="mt-4 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="text-emerald-400">
                  <span className="text-2xl font-bold">{drillProgress.length}</span>
                  <span className="text-sm ml-2">drills completed</span>
                </div>
                <div className="text-slate-400">
                  <span className="text-lg font-medium">{ProgressService.getTotalSessionsCount()}</span>
                  <span className="text-sm ml-1">total sessions</span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {userProfile && (
                  <div className="text-right">
                    <span className="text-xs text-slate-500 uppercase tracking-wider">Skill Level</span>
                    <div className="text-lg font-bold text-white">{userProfile.overallLevel}</div>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (confirm('Clear ALL app data? This will reset everything including history, progress, and profiles.')) {
                      // Clear all possible storage keys
                      localStorage.removeItem('justswing-drill-progress');
                      localStorage.removeItem('justswing-user-profile');
                      localStorage.removeItem('justswing_history_v1');
                      // Clear any other possible keys
                      Object.keys(localStorage).forEach(key => {
                        if (key.includes('justswing') || key.includes('drill') || key.includes('progress') || key.includes('history')) {
                          localStorage.removeItem(key);
                        }
                      });
                      // Also clear sessionStorage just in case
                      sessionStorage.clear();
                      console.log('All storage cleared, reloading...');
                      window.location.reload();
                    }
                  }}
                  className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium hover:bg-red-500/30 transition-colors"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Recommended drills */}
      {recommendedDrills.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <span className="flex h-3 w-3 rounded-full bg-yellow-500 mr-3 animate-pulse"></span>
            <h3 className="text-xl font-bold text-yellow-400 uppercase tracking-wider">Recommended for You</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedDrills.map(drill => {
              const progress = drillProgress.find(p => p.drillId === drill.id);
              return (
                <DrillCard 
                  key={drill.id} 
                  drill={drill} 
                  onClick={() => onDrillSelect(drill)}
                  progress={progress}
                />
              );
            })}
          </div>
        </section>
      )}

      {report && prescribedDrills.length > 0 && (
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <span className="flex h-3 w-3 rounded-full bg-emerald-500 mr-3 animate-pulse"></span>
            <h3 className="text-xl font-bold text-emerald-400 uppercase tracking-wider">Your Prescribed Plan</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {prescribedDrills.map(drill => {
              const progress = drillProgress.find(p => p.drillId === drill.id);
              return (
                <DrillCard 
                  key={drill.id} 
                  drill={drill} 
                  highlighted 
                  onClick={() => onDrillSelect(drill)}
                  progress={progress}
                />
              );
            })}
          </div>
        </section>
      )}

      <section>
        <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">All Training Drills</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedDrills.map(drill => {
            const progress = drillProgress.find(p => p.drillId === drill.id);
            return (
              <DrillCard 
                key={drill.id} 
                drill={drill} 
                onClick={() => onDrillSelect(drill)}
                progress={progress}
              />
            );
          })}
        </div>
      </section>
    </div>
  );
};

const DrillCard: React.FC<{ 
  drill: Drill; 
  highlighted?: boolean; 
  onClick: () => void;
  progress?: DrillProgress;
}> = ({ drill, highlighted, onClick, progress }) => {
  return (
    <>
      <div 
        onClick={onClick}
        className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 text-left w-full cursor-pointer
        ${highlighted 
          ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
          : 'bg-slate-800/40 border-slate-700 hover:border-slate-500'}`}
      >
        {/* Progress indicator */}
        {progress && progress.sessions && progress.sessions.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-col items-end space-y-1">
            <div className="bg-emerald-500 text-emerald-900 px-2 py-1 rounded text-xs font-bold">
              COMPLETED
            </div>
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-emerald-500 font-medium">
                {progress.sessions.length} session{progress.sessions.length !== 1 ? 's' : ''}
              </span>
            </div>
            {progress.rating && (
              <div className="flex mt-1">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className={`w-3 h-3 ${i < progress.rating ? 'text-yellow-500' : 'text-slate-600'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-between items-start mb-4">
          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest
            ${drill.difficulty === 'Beginner' ? 'bg-blue-500/20 text-blue-400' : 
              drill.difficulty === 'Intermediate' ? 'bg-orange-500/20 text-orange-400' : 
              'bg-red-500/20 text-red-400'}`}>
            {drill.difficulty}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-slate-500 text-xs font-medium">{drill.duration}</span>
          </div>
        </div>
        <h4 className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">{drill.title}</h4>
        <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">{drill.description}</p>
        <div className="flex items-center text-xs font-semibold text-slate-500 uppercase tracking-tighter">
          <svg className="w-4 h-4 mr-1 text-emerald-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Focus: {drill.category}
        </div>
      </div>
    </>
  );
};

export default DrillsLibrary;
