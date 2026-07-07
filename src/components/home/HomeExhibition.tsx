import { HomeExhibitionContent } from "./HomeExhibitionContent"

export async function HomeExhibition({ locale, exhibition }: { locale: string, exhibition?: any }) {
  if (!exhibition) {
    return <HomeExhibitionContent locale={locale} currentExhibition={null} timelineItems={[]} />
  }

  const now = new Date()
  const regStart = exhibition.registration_start ? new Date(exhibition.registration_start) : null
  const subEnd = exhibition.submission_end ? new Date(exhibition.submission_end) : null
  const exStart = exhibition.exhibition_start ? new Date(exhibition.exhibition_start) : null

  const getStatus = (date: Date | null, nextDate: Date | null) => {
    if (!date) return 'upcoming'
    if (now > date && (!nextDate || now < nextDate)) return 'current'
    if (now > (nextDate || date)) return 'completed'
    return 'upcoming'
  }

  const formatDate = (date: Date | null) => date ? date.toLocaleDateString(locale === 'bn' ? 'bn-BD' : 'en-US', { month: 'short', day: 'numeric' }) : 'TBA'

  const timelineItems = [
    { 
      id: '1', 
      title: locale === 'bn' ? 'নিবন্ধন শুরু' : 'Registration Opens', 
      status: getStatus(regStart, subEnd), 
      date: formatDate(regStart) 
    },
    { 
      id: '2', 
      title: locale === 'bn' ? 'শিল্পকর্ম জমা' : 'Artwork Submissions', 
      status: getStatus(regStart, exStart), 
      date: `${formatDate(regStart)} - ${formatDate(subEnd)}` 
    },
    { 
      id: '3', 
      title: locale === 'bn' ? 'প্রদর্শনী শুরু' : 'Exhibition Starts', 
      status: getStatus(exStart, null), 
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
