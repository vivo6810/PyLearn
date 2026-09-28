import type { Lesson, Track } from '../types'
import { foundations } from './foundations'
import { core } from './core'
import { advanced } from './advanced'
import { tkinter } from './tkinter'
import { data } from './data'
import { automation } from './automation'

/**
 * Track registry. PyTorch/AI track joins when its source PDF arrives.
 */
export const tracks: Track[] = [foundations, core, advanced, tkinter, data, automation]

/** Coming soon (structure ready, awaiting source PDF): AI & PyTorch */
export const upcomingTracks = [
  { id: 'ai', title: 'AI & PyTorch', icon: 'robot', note: 'starts when your PyTorch book is added to source/' },
]

export const allLessons: Lesson[] = tracks.flatMap((t) => t.modules.flatMap((m) => m.lessons))

export function findLesson(id: string): { track: Track; lesson: Lesson } | null {
  for (const track of tracks) {
    for (const mod of track.modules) {
      const lesson = mod.lessons.find((l) => l.id === id)
      if (lesson) return { track, lesson }
    }
  }
  return null
}

export function lessonNeighbors(id: string): { prev: Lesson | null; next: Lesson | null } {
  const flat = allLessons
  const i = flat.findIndex((l) => l.id === id)
  if (i === -1) return { prev: null, next: null }
  return { prev: flat[i - 1] ?? null, next: flat[i + 1] ?? null }
}

export const totalMinutes = allLessons.reduce((a, l) => a + l.minutes, 0)
