import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
async function main() {
  console.log('--- CMS Health Migration Started ---');
  
  // Helper to upsert a page safely
  async function ensurePage(slug, title) {
    let { data: page } = await supabase.from('cms_pages').select('id').eq('slug', slug).single();
    if (!page) {
      console.log(`Inserting missing page: ${slug}`);
      const res = await supabase.from('cms_pages').insert({ slug, title, status: 'published' }).select('id').single();
      page = res.data;
    }
    return page.id;
  }

  // Helper to upsert a section safely
  async function ensureSection(pageId, sectionKey, componentType, order) {
    let { data: section } = await supabase.from('cms_sections')
      .select('id').eq('page_id', pageId).eq('section_key', sectionKey).single();
    if (!section) {
      console.log(`Inserting missing section: ${sectionKey}`);
      const res = await supabase.from('cms_sections').insert({
        page_id: pageId, section_key: sectionKey, component_type: componentType, display_order: order, enabled: true
      }).select('id').single();
      section = res.data;
    }
    return section.id;
  }

  // Helper to upsert content fields safely
  async function ensureContent(sectionId, fieldKey, fieldType, valEn, valBn, meta = {}) {
    let { data: content } = await supabase.from('cms_content')
      .select('id').eq('section_id', sectionId).eq('field_key', fieldKey).single();
    if (!content) {
      await supabase.from('cms_content').insert({
        section_id: sectionId, field_key: fieldKey, field_type: fieldType, value_en: valEn, value_bn: valBn, metadata: meta
      });
      console.log(`Seeded field: ${fieldKey}`);
    }
  }

  try {
    // 1. Ensure Homepage
    const homeId = await ensurePage('home', 'Homepage Content');
    
    const heroId = await ensureSection(homeId, 'hero', 'Hero', 0);
    await ensureContent(heroId, 'badge', 'text', 'Where Art Meets Soul', 'যেখানে শিল্পের সাথে আত্মার মিলন ঘটে');
    await ensureContent(heroId, 'title', 'text', 'Where Creativity Meets Legacy', 'যেখানে সৃজনশীলতা ঐতিহ্যকে স্পর্শ করে');
    await ensureContent(heroId, 'subtitle', 'text', 'Experience the vibrant annual exhibition of the Rongdhonu artists collective.', 'রংধনু শিল্পী সংঘের বার্ষিক আন্তর্জাতিক প্রদর্শনী');
    await ensureContent(heroId, 'imageUrl', 'media', 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2000', 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2000');
    // Clean up Legacy Dual Fields: Merge into a single ctaPrimary and ctaSecondary
    await ensureContent(heroId, 'ctaPrimary', 'text', 'View Gallery', 'গ্যালারি দেখুন');
    await ensureContent(heroId, 'ctaSecondary', 'text', 'Learn More', 'আরও জানুন');

    const aboutId = await ensureSection(homeId, 'about', 'About', 1);
    await ensureContent(aboutId, 'title', 'text', 'About Rongdhonu', 'রংধনু সম্পর্কে');
    await ensureContent(aboutId, 'mission', 'textarea', 'To foster a thriving community of artists and provide a platform for creative expression.', 'শিল্পীদের একটি সমৃদ্ধ সম্প্রদায় গড়ে তোলা এবং সৃজনশীল প্রকাশের জন্য একটি প্ল্যাটফর্ম প্রদান করা।');
    await ensureContent(aboutId, 'vision', 'textarea', 'To become the premier destination for contemporary art in West Bengal.', 'পশ্চিমবঙ্গের সমসাময়িক শিল্পের প্রধান গন্তব্য হয়ে ওঠা।');
    await ensureContent(aboutId, 'history', 'textarea', 'Founded with a passion for arts, Rongdhonu has grown into a prestigious collective.', 'শিল্পকলার প্রতি অনুরাগের সাথে প্রতিষ্ঠিত, রংধনু একটি মর্যাদাপূর্ণ কালেক্টিভ হিসেবে বেড়ে উঠেছে।');

    // 2. Ensure other pages
    const exId = await ensurePage('exhibitions', 'Exhibitions Directory');
    const exHero = await ensureSection(exId, 'hero', 'Hero', 0);
    await ensureContent(exHero, 'title', 'text', 'Exhibitions', 'প্রদর্শনী আর্কাইভ');
    await ensureContent(exHero, 'subtitle', 'textarea', 'Explore the legacy of our annual fine art exhibitions.', 'আমাদের বর্তমান এবং অতীতের সমস্ত প্রদর্শনীর একটি আর্কাইভ।');
    await ensureContent(exHero, 'imageUrl', 'media', 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2400&auto=format&fit=crop');

    const galId = await ensurePage('gallery', 'Public Gallery');
    const galHero = await ensureSection(galId, 'hero', 'Hero', 0);
    await ensureContent(galHero, 'title', 'text', 'Exhibition Albums', 'প্রদর্শনী অ্যালবাম');
    await ensureContent(galHero, 'subtitle', 'textarea', 'A curated visual journey through our exhibitions.', 'আমাদের প্রদর্শনী ও ইভেন্টের স্মৃতিগুলো অন্বেষণ করুন।');
    await ensureContent(galHero, 'imageUrl', 'media', 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=2400&auto=format&fit=crop', 'https://images.unsplash.com/photo-1580136579312-94651dfd596d?q=80&w=2400&auto=format&fit=crop');

    const catId = await ensurePage('catalogs', 'Catalogs Downloads');
    const catHero = await ensureSection(catId, 'hero', 'Hero', 0);
    await ensureContent(catHero, 'title', 'text', 'Exhibition Catalog Archive', 'প্রদর্শনী ক্যাটালগ আর্কাইভ');
    await ensureContent(catHero, 'subtitle', 'textarea', 'Browse every official exhibition catalog.', 'প্রতিটি অফিসিয়াল প্রদর্শনী ক্যাটালগ ব্রাউজ করুন।');
    await ensureContent(catHero, 'imageUrl', 'media', '/images/hero-bg-catalogs.png', '/images/hero-bg-catalogs.png');

    // 2.5 Ensure SEO Sections for all pages
    const pages = [
      { id: homeId, title: "Rongdhonu Artists' Collective", desc: "The official digital museum and gallery of Rongdhonu Artists' Collective.", bnDesc: "রংধনু শিল্পী সংঘের অফিসিয়াল ওয়েবসাইট এবং ডিজিটাল মিউজিয়াম।" },
      { id: exId, title: "Exhibitions - Rongdhonu", desc: "Explore the legacy of our annual fine art exhibitions.", bnDesc: "আমাদের বর্তমান এবং অতীতের সমস্ত প্রদর্শনীর একটি আর্কাইভ।" },
      { id: galId, title: "Gallery - Rongdhonu", desc: "A curated visual journey through our exhibitions.", bnDesc: "আমাদের প্রদর্শনী ও ইভেন্টের স্মৃতিগুলো অন্বেষণ করুন।" },
      { id: catId, title: "Catalogs - Rongdhonu", desc: "Browse every official exhibition catalog.", bnDesc: "প্রতিটি অফিসিয়াল প্রদর্শনী ক্যাটালগ ব্রাউজ করুন।" }
    ];

    for (const page of pages) {
      const seoId = await ensureSection(page.id, 'seo', 'SEO', 99);
      await ensureContent(seoId, 'seo_title', 'text', page.title, page.title);
      await ensureContent(seoId, 'meta_description', 'textarea', page.desc, page.bnDesc);
      await ensureContent(seoId, 'keywords', 'textarea', 'fine arts, exhibitions, digital museum, artists collective, West Bengal', 'fine arts, exhibitions, digital museum, artists collective, West Bengal');
      await ensureContent(seoId, 'og_image', 'media', 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200', 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=1200');
    }

    // 3. Remove Legacy fields
    console.log('Cleaning up legacy bilingual keys...');
    await supabase.from('cms_content').delete().like('field_key', '%_en');
    await supabase.from('cms_content').delete().like('field_key', '%_bn');

    console.log('--- Migration Complete ---');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}
main();
