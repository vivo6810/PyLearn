import { marked } from 'marked'

marked.setOptions({ breaks: true, gfm: true })

/**
 * Render lesson markdown to HTML. Fenced code blocks become .code-example
 * divs; the LessonView upgrades the ones flagged runnable into CodeRunners.
 */
export function renderMd(md: string): string {
  const html = marked.parse(md) as string
  return html
}

export interface MdCodeBlock {
  code: string
  index: number
}

/** Extract code blocks in order (to pair with rendered HTML indexes). */
export function extractCodeBlocks(md: string): string[] {
  const blocks: string[] = []
  const re = /```(?:[a-z]*)\n([\s\S]*?)```/g
  let m: RegExpExecArray | null
  while ((m = re.exec(md))) blocks.push(m[1].replace(/\n$/, ''))
  return blocks
}
