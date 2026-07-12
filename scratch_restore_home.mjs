import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// We need the service role key to insert records
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('Restoring home page...');

  // 1. Insert Home Page
  const { data: pageData, error: pageErr } = await supabase
    .from('cms_pages')
    .insert([
      { slug: 'home', title: 'Homepage Content', status: 'published' }
    ])
    .select('id')
    .single();

  if (pageErr) {
    console.error('Error inserting page:', pageErr);
    // If it already exists, let's just get the ID
    if (pageErr.code === '23505') { // Unique violation
        console.log('Home page already exists, fetching ID...');
        const { data: existingPage } = await supabase.from('cms_pages').select('id').eq('slug', 'home').single();
        if (existingPage) {
            await insertSections(existingPage.id);
        }
    }
    return;
  }

  console.log('Inserted home page, ID:', pageData.id);
  await insertSections(pageData.id);
}

async function insertSections(pageId) {
  // Clear existing sections just in case
  await supabase.from('cms_sections').delete().eq('page_id', pageId);

  // Helper to insert section
  async function insertSection(key, type, order) {
    const { data, error } = await supabase
      .from('cms_sections')
      .insert([
        { page_id: pageId, section_key: key, component_type: type, display_order: order }
      ])
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  }

  try {
    // 1. Hero (order 0)
    const heroId = await insertSection('hero', 'Hero', 0);
    await supabase.from('cms_content').insert([
      { section_id: heroId, field_key: 'badge', field_type: 'text', value_en: 'Where Art Meets Soul', value_bn: 'যেখানে শিল্পের সাথে আত্মার মিলন ঘটে' },
      { section_id: heroId, field_key: 'title', field_type: 'text', value_en: 'Where Creativity Meets Legacy', value_bn: 'যেখানে সৃজনশীলতা ঐতিহ্যকে স্পর্শ করে' },
      { section_id: heroId, field_key: 'subtitle', field_type: 'text', value_en: 'Experience the vibrant annual exhibition of the Rongdhono artists\' collective.', value_bn: 'রংধনু শিল্পী সংঘের বার্ষিক আন্তর্জাতিক প্রদর্শনী' },
      { section_id: heroId, field_key: 'imageUrl', field_type: 'media', value_en: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2000', value_bn: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=2000' },
      { section_id: heroId, field_key: 'ctaPrimary_en', field_type: 'text', value_en: 'View Gallery', value_bn: 'গ্যালারি দেখুন' },
      { section_id: heroId, field_key: 'ctaPrimary_bn', field_type: 'text', value_en: 'গ্যালারি দেখুন', value_bn: 'গ্যালারি দেখুন' },
      { section_id: heroId, field_key: 'ctaSecondary_en', field_type: 'text', value_en: 'Learn More', value_bn: 'আরও জানুন' },
      { section_id: heroId, field_key: 'ctaSecondary_bn', field_type: 'text', value_en: 'আরও জানুন', value_bn: 'আরও জানুন' }
    ]);

    // 2. About (order 1)
    const aboutId = await insertSection('about', 'About', 1);
    await supabase.from('cms_content').insert([
      { section_id: aboutId, field_key: 'title', field_type: 'text', value_en: 'About Rongdhono', value_bn: 'রংধনু সম্পর্কে' },
      { section_id: aboutId, field_key: 'mission', field_type: 'textarea', value_en: 'To foster a thriving community of artists and provide a platform for creative expression.', value_bn: 'শিল্পীদের একটি সমৃদ্ধ সম্প্রদায় গড়ে তোলা এবং সৃজনশীল প্রকাশের জন্য একটি প্ল্যাটফর্ম প্রদান করা।' },
      { section_id: aboutId, field_key: 'vision', field_type: 'textarea', value_en: 'To become the premier destination for contemporary art in West Bengal.', value_bn: 'পশ্চিমবঙ্গের সমসাময়িক শিল্পের প্রধান গন্তব্য হয়ে ওঠা।' },
      { section_id: aboutId, field_key: 'history', field_type: 'textarea', value_en: 'Founded with a passion for arts, Rongdhono has grown into a prestigious collective.', value_bn: 'শিল্পকলার প্রতি অনুরাগের সাথে প্রতিষ্ঠিত, রংধনু একটি মর্যাদাপূর্ণ কালেক্টিভ হিসেবে বেড়ে উঠেছে।' }
    ]);

    // 3. Testimonials (order 2)
    const testId = await insertSection('testimonials', 'Testimonials', 2);
    await supabase.from('cms_content').insert([
      { section_id: testId, field_key: 'title', field_type: 'text', value_en: 'What They Say', value_bn: 'তারা যা বলে' },
      { section_id: testId, field_key: 'items', field_type: 'json', value_en: '[{"quote_en": "Beacon of light for the community", "author": "Anindita Ray", "role_en": "Art Critic"}]', value_bn: '[{"quote_bn": "শৈল্পিক সম্প্রদায়ের জন্য আলো", "author": "Anindita Ray", "role_bn": "শিল্প সমালোচক"}]' }
    ]);

    // 4. Sponsors (order 3)
    const sponsorsId = await insertSection('sponsors', 'Sponsors', 3);
    await supabase.from('cms_content').insert([
      { section_id: sponsorsId, field_key: 'title', field_type: 'text', value_en: 'Supported By', value_bn: 'পৃষ্ঠপোষকতায়' },
      { section_id: sponsorsId, field_key: 'logos', field_type: 'json', value_en: '[{"name": "Cultural Ministry", "url": "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop"}]', value_bn: '[{"name": "Cultural Ministry", "url": "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200&h=100&fit=crop"}]' }
    ]);

    // 5. ContactCTA (order 4)
    const ctaId = await insertSection('contactCTA', 'CTA', 4);
    await supabase.from('cms_content').insert([
      { section_id: ctaId, field_key: 'title', field_type: 'text', value_en: 'Join Our Artistic Journey', value_bn: 'আমাদের শৈল্পিক যাত্রায় যোগ দিন' },
      { section_id: ctaId, field_key: 'description', field_type: 'textarea', value_en: 'Subscribe to our newsletter to receive updates on upcoming exhibitions.', value_bn: 'আসন্ন প্রদর্শনী এবং স্পটলাইট সম্পর্কে আপডেট পেতে আমাদের নিউজলেটার সাবস্ক্রাইব করুন।' }
    ]);

    console.log('Successfully inserted all sections and content!');
  } catch (err) {
    console.error('Error inserting sections:', err);
  }
}

main();
