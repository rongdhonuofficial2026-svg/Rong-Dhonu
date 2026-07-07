import { HomeExhibitionContent } from "./HomeExhibitionContent"

const fallbackExhibition = {
  id: 'current-fallback',
  title_en: "Annual Summer Collection 2026",
  title_bn: "বার্ষিক গ্রীষ্মকালীন সংগ্রহ ২০২৬",
  status: "upcoming" as const,
  start_date: new Date('2026-08-01'),
  end_date: new Date('2026-08-15'),
  venue_en: "Silva Tirtha Art Gallery",
  venue_bn: "সিলভা তীর্থ আর্ট গ্যালারি",
  hero_image_url: "/images/placeholders/exhibition.webp"
}

export async function HomeExhibition({ locale, exhibition }: { locale: string, exhibition?: any }) {
  const currentExhibition = exhibition || fallbackExhibition

  const now = new Date()
  const regStart = currentExhibition.registration_start ? new Date(currentExhibition.registration_start) : null
  const subEnd = currentExhibition.submission_end ? new Date(currentExhibition.submission_end) : null
  const exStart = currentExhibition.exhibition_start ? new Date(currentExhibition.exhibition_start) : null

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
      currentExhibition={currentExhibition}
      timelineItems={timelineItems}
    />
  )
}
