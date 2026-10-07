import { useEffect } from 'react'
import type { View } from './App'
import { tracks, allLessons } from './curriculum'
import logoUrl from './assets/logo.png'

const SITE_URL = 'https://vivo6810.github.io'

type Meta = {
  title: string
  description: string
  ogTitle: string
  ogDescription: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  image: string
  alt: string
  ogType?: string
  ogUrl?: string
  ogSiteName?: string
}

function trackForLesson(lessonId: string) {
  const found = tracks.find((t) =>
    t.modules.some((m) => m.lessons.some((l) => l.id === lessonId))
  )
  if (!found) return null
  const lesson = found.modules.flatMap((m) => m.lessons).find((l) => l.id === lessonId)
  return lesson ? { track: found, lesson } : null
}

function pageMeta(view: string): Meta | null {
  const root = view.split(':')[0]
  const id = view.includes(':') ? view.split(':')[1] : null

  if (root === 'landing') {
    return {
      title: 'PyLearn — Master Python',
      description:
        '35 free lessons across 6 tracks, quizzes, hidden-test exercises, XP and certificates — real Python running in your browser.',
      ogTitle: 'PyLearn — Master Python',
      ogDescription:
        '35 lessons across 6 tracks, quizzes, hidden-test exercises, XP and certificates — real Python running in your browser.',
      twitterCard: 'summary',
      twitterTitle: 'PyLearn — Master Python',
      twitterDescription:
        '35 lessons across 6 tracks, quizzes, hidden-test exercises, XP and certificates — real Python running in your browser.',
      image: logoUrl,
      alt: 'PyLearn — Master Python',
    }
  }

  if (root === 'auth') {
    const isSignup = view === 'auth' && location.hash.includes('signup')
    return {
      title: isSignup ? 'Create your account — PyLearn' : 'Sign in — PyLearn',
      description: isSignup
        ? 'Create a free PyLearn account to keep your XP, streaks and certificates across devices.'
        : 'Sign in to your PyLearn account to pick up your Python lessons where you left off.',
      ogTitle: isSignup ? 'Create your account — PyLearn' : 'Sign in — PyLearn',
      ogDescription: isSignup
        ? 'Create a free PyLearn account to keep your XP, streaks and certificates across devices.'
        : 'Sign in to your PyLearn account to pick up your Python lessons where you left off.',
      twitterCard: 'summary',
      twitterTitle: isSignup ? 'Create your account — PyLearn' : 'Sign in — PyLearn',
      twitterDescription: isSignup
        ? 'Create a free PyLearn account to keep your XP, streaks and certificates across devices.'
        : 'Sign in to your PyLearn account to pick up your Python lessons where you left off.',
      image: logoUrl,
      alt: 'PyLearn — Sign in or create an account',
    }
  }

  if (root === 'dashboard') {
    return {
      title: 'My dashboard — PyLearn',
      description:
        `Continue your free Python course — ${allLessons.length} lessons, XP, streaks and certificates, all saved in your browser on this device.`,
      ogTitle: 'My PyLearn dashboard',
      ogDescription:
        `Continue your free Python course — ${allLessons.length} lessons, XP, streaks and certificates.`,
      twitterCard: 'summary',
      twitterTitle: 'My PyLearn dashboard',
      twitterDescription:
        `Continue your free Python course — ${allLessons.length} lessons, XP, streaks and certificates.`,
      image: logoUrl,
      alt: 'PyLearn dashboard',
    }
  }

  if (root === 'playground') {
    return {
      title: 'Python playground — PyLearn',
      description:
        'A free scratchpad where you can run any Python code in your browser. Your code is saved automatically on this device.',
      ogTitle: 'Python playground — PyLearn',
      ogDescription:
        'A free scratchpad where you can run any Python code in your browser. Your code is saved automatically on this device.',
      twitterCard: 'summary',
      twitterTitle: 'Python playground — PyLearn',
      twitterDescription:
        'A free scratchpad where you can run any Python code in your browser. Your code is saved automatically on this device.',
      image: logoUrl,
      alt: 'PyLearn Python playground',
    }
  }

  if (root === 'reference') {
    return {
      title: 'Search & cheat sheets — PyLearn',
      description:
        `Free Python quick-reference: syntax, data structures, NumPy and Pandas — one searchable page for every PyLearn lesson.`,
      ogTitle: 'Python search & cheat sheets — PyLearn',
      ogDescription:
        `Free Python quick-reference: syntax, data structures, NumPy and Pandas — one searchable page for every PyLearn lesson.`,
      twitterCard: 'summary',
      twitterTitle: 'Python search & cheat sheets — PyLearn',
      twitterDescription:
        `Free Python quick-reference: syntax, data structures, NumPy and Pandas — one searchable page for every PyLearn lesson.`,
      image: logoUrl,
      alt: 'PyLearn search and cheat sheets',
    }
  }

  if (root === 'settings') {
    return {
      title: 'Settings — PyLearn',
      description:
        'Manage your PyLearn account: export and import your progress, notes and code drafts, or reset everything on this device.',
      ogTitle: 'PyLearn settings',
      ogDescription:
        'Manage your PyLearn account: export and import your progress, notes and code drafts, or reset everything on this device.',
      twitterCard: 'summary',
      twitterTitle: 'PyLearn settings',
      twitterDescription:
        'Manage your PyLearn account: export and import your progress, notes and code drafts, or reset everything on this device.',
      image: logoUrl,
      alt: 'PyLearn settings',
    }
  }

  if (root === 'track' && id) {
    const track = tracks.find((t) => t.id === id)
    if (!track) return null
    const lessons = track.modules.flatMap((m) => m.lessons)
    return {
      title: `${track.title} — Python course · PyLearn`,
      description:
        `${track.blurb} ${lessons.length} lessons, built from real Python books — Halterman, Sweigart, Klein and more. Free, runs in your browser.`,
      ogTitle: `${track.title} — PyLearn`,
      ogDescription:
        `${track.blurb} ${lessons.length} lessons, built from real Python books. Free, runs in your browser.`,
      twitterCard: 'summary',
      twitterTitle: `${track.title} — PyLearn`,
      twitterDescription:
        `${track.blurb} ${lessons.length} lessons, built from real Python books. Free, runs in your browser.`,
      image: logoUrl,
      alt: `${track.title} — PyLearn track`,
    }
  }

  if (root === 'lesson' && id) {
    const found = trackForLesson(id)
    if (!found) return null
    const { track, lesson } = found
    return {
      title: `${lesson.title} — ${track.title} · PyLearn`,
      description:
        `${lesson.title}: ${lesson.objectives.slice(0, 2).join(' ') || track.blurb} — free lesson from the PyLearn Python course, ${track.title} track.`,
      ogTitle: `${lesson.title} — ${track.title}`,
      ogDescription:
        `${lesson.title}: ${lesson.objectives.slice(0, 2).join(' ') || track.blurb} — free lesson from the PyLearn Python course.`,
      ogType: 'article',
      ogUrl: `${SITE_URL}/#/lesson:${id}`,
      ogSiteName: 'PyLearn',
      twitterCard: 'summary',
      twitterTitle: `${lesson.title} — ${track.title}`,
      twitterDescription:
        `${lesson.title}: ${lesson.objectives.slice(0, 2).join(' ') || track.blurb} — free lesson from the PyLearn Python course.`,
      image: logoUrl,
      alt: `${lesson.title} — ${track.title} lesson — PyLearn`,
    }
  }

  // anything else (unknown view) falls back to the site home
  return {
    title: 'PyLearn — Master Python',
    description: '35 free lessons across 6 tracks, quizzes, hidden-test exercises, XP and certificates — real Python running in your browser.',
    ogTitle: 'PyLearn — Master Python',
    ogDescription: '35 lessons across 6 tracks, quizzes, hidden-test exercises, XP and certificates — real Python running in your browser.',
    twitterCard: 'summary',
    twitterTitle: 'PyLearn — Master Python',
    twitterDescription: '35 lessons across 6 tracks, quizzes, hidden-test exercises, XP and certificates — real Python running in your browser.',
    image: logoUrl,
    alt: 'PyLearn — Master Python',
  }
}

export function useHead(_view: View, _authName: string | null, _navigate: (v: string) => void) {
  const meta = pageMeta(_view)
  useEffect(() => {
    if (!meta) return
    const doc = document

    doc.title = meta.title

    // core description
    let d = doc.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (!d) {
      d = doc.createElement('meta')
      d.name = 'description'
      doc.head.appendChild(d)
    }
    d.setAttribute('content', meta.description)

    // canonical
    let c = doc.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (!c) {
      c = doc.createElement('link')
      c.rel = 'canonical'
      doc.head.appendChild(c)
    }
    c.setAttribute('href', SITE_URL + '/#/' + _view)

    // OG
    const og = (property: string, content: string) => {
      let el = doc.querySelector('meta[property="' + property + '"]') as HTMLElement | null
      if (!el) {
        el = doc.createElement('meta')
        el.setAttribute('property', property)
        doc.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }
    og('og:title', meta.ogTitle)
    og('og:description', meta.ogDescription)
    og('og:image', SITE_URL + logoUrl)
    if (meta.ogType) og('og:type', meta.ogType)
    if (meta.ogUrl) og('og:url', meta.ogUrl)
    if (meta.ogSiteName) og('og:site_name', meta.ogSiteName)

    // Twitter
    const tw = (name: string, content: string) => {
      let el = doc.querySelector('meta[name="' + name + '"]') as HTMLElement | null
      if (!el) {
        el = doc.createElement('meta')
        el.setAttribute('name', name)
        doc.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }
    tw('twitter:card', meta.twitterCard)
    tw('twitter:title', meta.twitterTitle)
    tw('twitter:description', meta.twitterDescription)
    tw('twitter:image', SITE_URL + logoUrl)
    tw('twitter:image:alt', meta.alt)

    // a single shared preview image is fine for now; each page also gets an
    // inline og:image:alt so link previews carry meaningful alt text.
    let ia = doc.querySelector('meta[property="og:image:alt"]') as HTMLElement | null
    if (!ia) {
      ia = doc.createElement('meta')
      ia.setAttribute('property', 'og:image:alt')
      doc.head.appendChild(ia)
    }
    ia.setAttribute('content', meta.alt)

    // clean up duplicates we may have left on re-runs
    const seen = new Set<string>()
    const clean = (sel: string, attr: string) => {
      Array.from(doc.querySelectorAll(sel)).forEach((el) => {
        const key = attr + ':' + (el.getAttribute(attr) ?? '')
        if (seen.has(key)) el.remove()
        else seen.add(key)
      })
    }
    clean('meta[name="description"]', 'content')
    clean('meta[property="og:title"]', 'content')
    clean('meta[property="og:description"]', 'content')
    clean('meta[property="og:image"]', 'content')
    clean('meta[name="twitter:title"]', 'content')
    clean('meta[name="twitter:description"]', 'content')
    clean('meta[name="twitter:image"]', 'content')
  }, [meta, _view])
}
