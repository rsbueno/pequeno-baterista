import { UserProgress, RecordedBeat } from '../types/drums';

const STORAGE_KEY = 'pequeno_baterista_progress_v1';

const DEFAULT_PROGRESS: UserProgress = {
  kidName: 'Baterista Campeão',
  completedLessons: [1],
  highScores: {},
  starsCount: 3,
  recordedBeats: [],
  currentPadVolume: 0.85,
  metronomeBpm: 80,
};

export function loadUserProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESS,
      ...parsed,
      completedLessons: parsed.completedLessons || [1],
      recordedBeats: parsed.recordedBeats || [],
    };
  } catch (err) {
    console.error('Failed to load user progress:', err);
    return DEFAULT_PROGRESS;
  }
}

export function saveUserProgress(progress: UserProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (err) {
    console.error('Failed to save user progress:', err);
  }
}

export function completeLesson(lessonId: number): UserProgress {
  const current = loadUserProgress();
  const set = new Set(current.completedLessons);
  const isNew = !set.has(lessonId);
  set.add(lessonId);
  // Also unlock next lesson
  set.add(lessonId + 1);

  const updated: UserProgress = {
    ...current,
    completedLessons: Array.from(set),
    starsCount: current.starsCount + (isNew ? 3 : 1),
  };
  saveUserProgress(updated);
  return updated;
}

export function saveSongHighScore(songId: string, score: number): UserProgress {
  const current = loadUserProgress();
  const prevBest = current.highScores[songId] || 0;
  const newBest = Math.max(prevBest, score);

  const addedStars = score > prevBest ? Math.min(5, Math.ceil(score / 500)) : 0;

  const updated: UserProgress = {
    ...current,
    highScores: {
      ...current.highScores,
      [songId]: newBest,
    },
    starsCount: current.starsCount + addedStars,
  };
  saveUserProgress(updated);
  return updated;
}

export function saveRecordedBeat(beat: RecordedBeat): UserProgress {
  const current = loadUserProgress();
  const updated: UserProgress = {
    ...current,
    recordedBeats: [beat, ...current.recordedBeats],
    starsCount: current.starsCount + 2,
  };
  saveUserProgress(updated);
  return updated;
}

export function deleteRecordedBeat(id: string): UserProgress {
  const current = loadUserProgress();
  const updated: UserProgress = {
    ...current,
    recordedBeats: current.recordedBeats.filter((b) => b.id !== id),
  };
  saveUserProgress(updated);
  return updated;
}

export function updateKidName(name: string): UserProgress {
  const current = loadUserProgress();
  const updated: UserProgress = {
    ...current,
    kidName: name.trim() || 'Baterista Campeão',
  };
  saveUserProgress(updated);
  return updated;
}
