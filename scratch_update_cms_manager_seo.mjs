import fs from 'fs';

const filePath = 'src/components/admin/cms/CMSEngineManager.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove the useState for seoConfig
content = content.replace(
  /const \[seoConfig, setSeoConfig\] = useState<Record<string, any>>\(\{\s*title: 'Rongdhonu Artists\\' Collective',\s*description: 'The official digital museum and gallery of Rongdhonu Artists\\' Collective. Discover curated catalogs, visual exhibitions, and talented local fine artists.',\s*keywords: 'fine arts, exhibitions, digital museum, artists collective, West Bengal',\s*canonical: 'https:\/\/rongdhonu.art',\s*og_image: 'https:\/\/images.unsplash.com\/photo-1547826039-bfc35e0f1ea8\?w=1200'\s*\}\)/,
  `const seoSection = sections.find(s => s.section_key === 'seo');
  const getSeoValue = (key: string) => {
    const field = seoSection?.cms_content?.find(c => c.field_key === key);
    return field?.value_en || '';
  };
  
  const seoConfig = {
    title: getSeoValue('seo_title') || "Rongdhonu Artists' Collective",
    description: getSeoValue('meta_description') || "The official digital museum and gallery of Rongdhonu Artists' Collective.",
    keywords: getSeoValue('keywords') || 'fine arts, exhibitions, digital museum, artists collective, West Bengal',
    canonical: 'https://rongdhonu.art',
    og_image: getSeoValue('og_image') || 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200'
  };`
);

// 2. Replace the onChange handlers
content = content.replace(
  /onChange=\{\(e\) => setSeoConfig\(\{ \.\.\.seoConfig, title: e\.target\.value \}\)\}/,
  `onChange={(e) => {
    if (seoSection) {
      handleFieldChange(seoSection.id, 'seo_title', 'value_en', e.target.value);
    }
  }}`
);

content = content.replace(
  /onChange=\{\(e\) => setSeoConfig\(\{ \.\.\.seoConfig, description: e\.target\.value \}\)\}/,
  `onChange={(e) => {
    if (seoSection) {
      handleFieldChange(seoSection.id, 'meta_description', 'value_en', e.target.value);
    }
  }}`
);

fs.writeFileSync(filePath, content);
console.log('Successfully updated CMSEngineManager.tsx SEO data binding.');
