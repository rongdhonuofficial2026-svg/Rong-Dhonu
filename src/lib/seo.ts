 
 
 
 
import { Metadata } from 'next'

interface SEOMetadataProps {
  title: string
  description: string
  url: string
  imageUrl?: string
  locale?: string
  siteName?: string
  faviconUrl?: string
}

export function generateDynamicMetadata({
  title,
  description,
  url,
  imageUrl = 'https://images.unsplash.com/photo-1518998053401-878c735c908c?auto=format&fit=crop&q=80&w=1200',
  locale = 'en',
  siteName,
  faviconUrl
}: SEOMetadataProps): Metadata {
  const brandName = siteName || 'Rongdhonu'
  const suffix = siteName ? siteName : "Rongdhonu Artists' Collective"
  return {
    title: {
      default: `${title} | ${suffix}`,
      template: `%s | ${brandName}`
    },
    description,
    icons: {
      icon: faviconUrl || '/favicon.ico',
      shortcut: faviconUrl || '/favicon.ico',
    },
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_BASE_URL || 'https://rong-dhonu.vercel.app'),
    alternates: {
      canonical: url,
      languages: {
        'en': `/en${url}`,
        'bn': `/bn${url}`,
      }
    },
    openGraph: {
      title,
      description,
      url,
      siteName: suffix,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
      locale: locale === 'bn' ? 'bn_BD' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  }
}

// JSON-LD Generators
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Rongdhonu Artists' Collective",
    "url": "https://rongdhonu.art",
    "logo": "https://rongdhonu.art/logo.png",
    "description": "A thriving community of artists and an annual art exhibition at Silva Tirtha Art Gallery.",
    "location": {
      "@type": "Place",
      "name": "Silva Tirtha Art Gallery",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Opposite Rabindra Bhavan (Southern Auditorium)",
        "addressLocality": "Berhampore",
        "addressRegion": "West Bengal",
        "addressCountry": "IN"
      }
    }
  }
}

export function generateArtworkSchema(artwork: any) {
  return {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    "name": artwork.title_en,
    "image": artwork.main_image_url,
    "creator": {
      "@type": "Person",
      "name": artwork.artist_name
    },
    "artMedium": artwork.medium_en,
    "artform": "Painting",
    "material": artwork.materials_en,
    "size": artwork.dimensions,
    "offers": {
      "@type": "Offer",
      "price": artwork.price || "Contact for price",
      "availability": artwork.status === 'available' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  }
}
