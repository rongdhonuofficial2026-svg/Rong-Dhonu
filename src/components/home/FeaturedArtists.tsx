import { FeaturedArtistsContent } from "./FeaturedArtistsContent"

const fallbackArtists = [
  { id: '1', full_name_en: "Satyajit Ray", full_name_bn: "সত্যজিৎ রায়", role: "member", avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400" },
  { id: '2', full_name_en: "Amrita Sher-Gil", full_name_bn: "অমৃতা শের-গিল", role: "committee", avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400" },
  { id: '3', full_name_en: "MF Husain", full_name_bn: "এম এফ হুসেন", role: "member", avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400" },
  { id: '4', full_name_en: "Zainul Abedin", full_name_bn: "জয়নুল আবেদিন", role: "member", avatar_url: "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&q=80&w=400" },
]

export async function HomeFeaturedArtists({ locale, artists }: { locale: string, artists?: any[] }) {
  const displayData = artists && artists.length > 0 ? artists : fallbackArtists
  return <FeaturedArtistsContent locale={locale} artists={displayData} />
}
