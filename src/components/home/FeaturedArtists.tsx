import { FeaturedArtistsContent } from "./FeaturedArtistsContent"

const fallbackArtists = [
  { id: '1', full_name_en: "Satyajit Ray", full_name_bn: "সত্যজিৎ রায়", role: "member", avatar_url: "/images/placeholders/artist-1.webp" },
  { id: '2', full_name_en: "Amrita Sher-Gil", full_name_bn: "অমৃতা শের-গিল", role: "committee", avatar_url: "/images/placeholders/artist-2.webp" },
  { id: '3', full_name_en: "MF Husain", full_name_bn: "এম এফ হুসেন", role: "member", avatar_url: "/images/placeholders/artist-3.webp" },
  { id: '4', full_name_en: "Zainul Abedin", full_name_bn: "জয়নুল আবেদিন", role: "member", avatar_url: "/images/placeholders/artist-4.webp" },
]

export async function HomeFeaturedArtists({ locale, artists }: { locale: string, artists?: any[] }) {
  const displayData = artists && artists.length > 0 ? artists : fallbackArtists
  return <FeaturedArtistsContent locale={locale} artists={displayData} />
}
