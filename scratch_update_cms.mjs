import fs from 'fs';
import path from 'path';

const file = path.resolve('src/components/admin/cms/CMSEngineManager.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Imports
const imports = `import { HomeHeroContent } from '@/components/home/HomeHeroContent'
import { HomeAboutContent } from '@/components/home/HomeAboutContent'
import { HomeSponsorsContent, HomeTestimonialsContent } from '@/components/home/HomeSponsorsContent'
import { HomeExtrasContent } from '@/components/home/HomeExtrasContent'
`;

if (!content.includes('HomeHeroContent')) {
  content = content.replace(
    `import { Input } from '@/components/ui/input'`,
    `${imports}\nimport { Input } from '@/components/ui/input'`
  );
}

// 2. Replace the simulated rendering loop
const oldLoopRegex = /\{sections\.filter\(s => s\.enabled !== false\)\.map\(\(sec: any\) => \{[\s\S]*?\/\/ Render fallback card view for other sections[\s\S]*?return \([\s\S]*?\} \/\* end map \*\/\s*\n?\s*\}\)/;

const newLoop = `{sections.filter(s => s.enabled !== false).map((sec: any) => {
                    const mappedContent = (sec.cms_content || []).reduce((acc: any, c: any) => {
                      acc[c.field_key] = previewLocale === 'bn' ? (c.value_bn || c.value_en) : c.value_en;
                      // Handle button links
                      if (c.field_type === 'button' && c.metadata) {
                         acc[\`\${c.field_key}_url\`] = c.metadata.url;
                      }
                      return acc;
                    }, { enabled: true });

                    switch (sec.component_type) {
                      case 'Hero':
                        return <div key={sec.id} className="relative w-full overflow-hidden zoom-[0.6] origin-top"><HomeHeroContent locale={previewLocale} content={mappedContent} exhibition={{} as any} stats={{ totalExhibitions: 12, totalArtists: 200, totalArtworks: 1400 }} /></div>;
                      case 'About':
                        return <div key={sec.id} className="relative w-full overflow-hidden zoom-[0.6] origin-top"><HomeAboutContent locale={previewLocale} content={mappedContent} stats={{ totalExhibitions: 12, totalArtists: 200, totalArtworks: 1400 }} /></div>;
                      case 'Sponsors':
                        return <div key={sec.id} className="relative w-full overflow-hidden zoom-[0.6] origin-top"><HomeSponsorsContent locale={previewLocale} content={mappedContent} /></div>;
                      case 'Testimonials':
                        return <div key={sec.id} className="relative w-full overflow-hidden zoom-[0.6] origin-top"><HomeTestimonialsContent locale={previewLocale} content={mappedContent} /></div>;
                      case 'Newsletter':
                      case 'Contact CTA':
                        return <div key={sec.id} className="relative w-full overflow-hidden zoom-[0.6] origin-top"><HomeExtrasContent locale={previewLocale} content={mappedContent} /></div>;
                      default:
                        return (
                          <div key={sec.id} className="p-5 bg-white/[0.01] border border-dashed border-white/[0.08] rounded-xl text-center space-y-1.5">
                            <span className="text-xs uppercase font-bold tracking-widest text-[#C9A227] block">{sec.section_key} Section</span>
                            <p className="text-[10px] text-white/52 font-light font-mono">Bilingual Component: {sec.component_type} Active</p>
                          </div>
                        );
                    }
                  })}`;

// We will use substring and index of to be absolutely safe
const startIndex = content.indexOf('{sections.filter(s => s.enabled !== false).map((sec: any) => {');
const endIndexStr = '                  })}';
let endIndex = content.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const before = content.substring(0, startIndex);
  const after = content.substring(endIndex + endIndexStr.length);
  content = before + newLoop + after;
  fs.writeFileSync(file, content, 'utf8');
  console.log('Successfully updated CMSEngineManager.tsx loop');
} else {
  console.error('Failed to find loop boundaries in CMSEngineManager.tsx');
  console.log('startIndex', startIndex, 'endIndex', endIndex);
}
