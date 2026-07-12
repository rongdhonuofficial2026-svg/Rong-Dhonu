import fs from 'fs';

function replaceMetadata(route, slug) {
  const filePath = `src/app/[locale]/(public)/${route}/page.tsx`;
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${filePath} (not found)`);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Match the entire generateMetadata block down to the end of its block
  const metadataBlockRegex = /export async function generateMetadata\(\{[\s\S]*?\}\n/m;

  // Let's use a more robust regex that grabs from 'export async function generateMetadata' to the next 'export default async function'
  const chunkRegex = /export async function generateMetadata[\s\S]*?(?=export default async function)/;

  if (!chunkRegex.test(content)) {
    console.log(`No metadata block found in ${filePath}`);
    return;
  }

  const newMetadataBlock = `export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const { getCmsContent } = await import('@/lib/cms/content')
  
  const settingsData = await getCmsContent('global', 'settings', locale)
  const siteName = settingsData?.site_name || 'Rongdhonu'
  const faviconUrl = settingsData?.favicon_url
  
  const seoData = await getCmsContent('${slug}', 'seo', locale)
  const seoTitle = seoData?.seo_title || siteName
  const seoDescription = seoData?.meta_description || settingsData?.site_description || ''
  const ogImage = seoData?.og_image || settingsData?.default_og_image || 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200'

  return generateDynamicMetadata({
    title: seoTitle,
    description: seoDescription,
    url: '/${slug === 'home' ? '' : slug}',
    imageUrl: ogImage,
    locale,
    siteName,
    faviconUrl,
  })
}

`;

  content = content.replace(chunkRegex, newMetadataBlock);
  fs.writeFileSync(filePath, content);
  console.log(`Updated metadata in ${filePath}`);
}

replaceMetadata('exhibitions', 'exhibitions');
replaceMetadata('gallery', 'gallery');
replaceMetadata('catalogs', 'catalogs');
