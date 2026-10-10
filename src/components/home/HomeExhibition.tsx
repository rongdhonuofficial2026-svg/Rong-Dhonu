import { HomeExhibitionContent } from "./HomeExhibitionContent"

export async function HomeExhibition({ locale, exhibition }: { locale: string, exhibition?: any }) {
  if (!exhibition) {
    return <HomeExhibitionContent locale={locale} currentExhibition={null} timelineItems={[]} />
  }

  const now = new Date()
  const regStart = exhibition.registration_start ? new Date(exhibition.registration_start) : null
  const subEnd = exhibition.submission_end ? new Date(exhibition.submission_end) : null
  const exStart = exhibition.exhibition_start ? new Date(exhibition.exhibition_start) : null

  // IST-aware date formatter for display labels only.
  // Comparisons use raw Date objects (UTC epoch) which are inherently correct
  // since Supabase stores all TIMESTAMPTZ values as UTC.
  const istFormatter = new Intl.DateTimeFormat(
    locale === 'bn' ? 'bn-BD' : 'en-IN',
    { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' }
  )
  const formatDate = (date: Date | null) =>
    date ? istFormatter.format(date) : 'TBA'

  /**
   * Returns the status of a phase that runs from `openAt` to `closeAt`.
   * - 'upcoming'  : hasn't opened yet
   * - 'current'   : currently in the window
   * - 'completed' : window has closed (or closeAt passed)
   */
  const phaseStatus = (openAt: Date | null, closeAt: Date | null): 'upcoming' | 'current' | 'completed' => {
    if (!openAt) return 'upcoming'
    if (now < openAt) return 'upcoming'
    // Phase has opened. Is it still open?
    if (closeAt && now > closeAt) return 'completed'
    return 'current'
  }

  const timelineItems = [
    {
      id: '1',
      title: locale === 'bn' ? 'নিবন্ধন শুরু' : 'Registration Opens',
      // "current" from registration_start until submission_end (deadline)
      status: phaseStatus(regStart, subEnd),
      date: formatDate(regStart)
    },
    {
      id: '2',
      title: locale === 'bn' ? 'শিল্পকর্ম জমা' : 'Artwork Submissions',
      // Submissions close at submission_end, NOT at exhibition_start.
      // This is the key fix: the old code used exStart as the close boundary,
      // which incorrectly marked submissions as "completed" once the exhibition
      // opened, even though the deadline (submission_end) was still in the future.
      status: phaseStatus(regStart, subEnd),
      date: `${formatDate(regStart)} – ${formatDate(subEnd)}`
    },
    {
      id: '3',
      title: locale === 'bn' ? 'প্রদর্শনী শুরু' : 'Exhibition Starts',
      // Ongoing from exhibition_start with no close boundary in the timeline
      status: phaseStatus(exStart, null),
      date: formatDate(exStart)
    },
  ]

  return (
    <HomeExhibitionContent
      locale={locale}
      currentExhibition={exhibition}
      timelineItems={timelineItems}
    />
  )
}
