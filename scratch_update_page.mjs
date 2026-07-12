import fs from 'fs';
import path from 'path';

const file = path.resolve('src/app/[locale]/(public)/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Import getCmsSectionLayout
content = content.replace(
  /const \{ getCmsContent \} = await import\('@\/lib\/cms\/content'\)/g,
  `const { getCmsContent, getCmsSectionLayout } = await import('@/lib/cms/content')`
);

// 2. Fetch layout
content = content.replace(
  /const supabase = await createClient\(\)\r?\n\r?\n\s*\/\/ 1\. Determine which exhibition to show based on priority rules/g,
  `const supabase = await createClient()
  
  const layout = await getCmsSectionLayout('home')

  // 1. Determine which exhibition to show based on priority rules`
);

// 3. Replace component stack
const oldStackRegex = /<HomeHero locale=\{locale\} exhibition=\{exhibition\} stats=\{stats\} \/>[\s\S]*?<HomeNewsletter locale=\{locale\} \/>/;

const newStack = `{/* 1. Pre-DB CMS Sections */}
        {layout.filter((s) => s.enabled && s.display_order < 2).map((s) => {
          switch (s.section_key) {
            case 'hero': return <HomeHero key="hero" locale={locale} exhibition={exhibition} stats={stats} />
            case 'about': return <HomeAbout key="about" locale={locale} stats={stats} />
            case 'sponsors': return <HomeSponsors key="sponsors" locale={locale} />
            case 'testimonials': return <HomeTestimonials key="testimonials" locale={locale} />
            case 'contactCTA': return <HomeNewsletter key="contactCTA" locale={locale} />
            default: return null
          }
        })}

        {/* 2. Fixed Database Sections */}
        <HomeExhibition locale={locale} exhibition={exhibition} />
        <HomeFeaturedArtists locale={locale} artists={artists} />
        <HomeFeaturedArtworks locale={locale} artworks={artworks} />

        {/* 3. Post-DB CMS Sections */}
        {layout.filter((s) => s.enabled && s.display_order >= 2).map((s) => {
          switch (s.section_key) {
            case 'hero': return <HomeHero key="hero" locale={locale} exhibition={exhibition} stats={stats} />
            case 'about': return <HomeAbout key="about" locale={locale} stats={stats} />
            case 'sponsors': return <HomeSponsors key="sponsors" locale={locale} />
            case 'testimonials': return <HomeTestimonials key="testimonials" locale={locale} />
            case 'contactCTA': return <HomeNewsletter key="contactCTA" locale={locale} />
            default: return null
          }
        })}`;

if (oldStackRegex.test(content)) {
  content = content.replace(oldStackRegex, newStack);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated page.tsx');
} else {
  console.error('Failed to find old stack in page.tsx');
}
