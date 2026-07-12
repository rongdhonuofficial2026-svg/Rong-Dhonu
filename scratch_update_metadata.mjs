import fs from 'fs';

const filePath = 'src/app/[locale]/(public)/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace generateMetadata in page.tsx
const metadataBlockRegex = /export async function generateMetadata\(\{[\s\S]*?return \{[\s\S]*?\}\n\}/;

const newMetadataBlock = `export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const { getCmsContent } = await import('@/lib/cms/content')
  
  // Fetch global settings
  const settingsData = await getCmsContent('global', 'settings', locale)
  const siteName = settingsData?.site_name || 'Rongdhonu'
  const faviconUrl = settingsData?.favicon_url
  
  // Fetch page-level SEO data
  const seoData = await getCmsContent('home', 'seo', locale)
  const seoTitle = seoData?.seo_title || siteName
  const seoDescription = seoData?.meta_description || settingsData?.site_description || (
    locale === 'bn'
      ? "রংধনু শিল্পী সংঘের অফিসিয়াল ওয়েবসাইট এবং ডিজিটাল মিউজিয়াম।"
      : "The official website and digital museum of the Rongdhonu artists' collective."
  )
  const ogImage = seoData?.og_image || settingsData?.default_og_image || 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200'

  return {
    title: {
      default: seoTitle,
      template: \`%s | \${siteName}\`,
    },
    description: seoDescription,
    icons: faviconUrl ? {
      icon: faviconUrl,
      apple: faviconUrl,
    } : undefined,
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: [{ url: ogImage }],
    }
  }
}`;

content = content.replace(metadataBlockRegex, newMetadataBlock);

fs.writeFileSync(filePath, content);
console.log('Successfully updated page.tsx metadata.');
