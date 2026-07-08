'use client'

import { useRef, useEffect } from 'react'
import { Link } from "@/lib/i18n/routing"

interface AboutContentProps {
  content: any
  locale: string
}

export function AboutContent({ content, locale }: AboutContentProps) {
  const heroArtRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Parallax mouse effect on page hero image
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroArtRef.current) return
      const x = (e.clientX / window.innerWidth - 0.5) * 14
      const y = (e.clientY / window.innerHeight - 0.5) * 14
      heroArtRef.current.style.setProperty('--px', `${x}px`)
      heroArtRef.current.style.setProperty('--py', `${y}px`)
    };

    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    };
  }, [])

  // Dynamic layout animation trigger
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          io.unobserve(e.target)
        }
      })
    }, { threshold: 0.12 })

    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])

  const committee = [
    {
      name: locale === 'bn' ? 'রনিতা বসু' : 'Ronita Basu',
      role: locale === 'bn' ? 'প্রতিষ্ঠাতা ও সভাপতি' : 'Founder & Chair',
      image: 'https://images.unsplash.com/photo-1622542796254-5b9c46ab0d2f?q=80&w=900&auto=format&fit=crop',
      index: 'No. 01'
    },
    {
      name: locale === 'bn' ? 'অরিন্দম সেন' : 'Arindam Sen',
      role: locale === 'bn' ? 'বোর্ড সদস্য' : 'Board Member',
      image: 'https://images.unsplash.com/photo-1578059457717-721408f0758e?q=80&w=900&auto=format&fit=crop',
      index: 'No. 02'
    },
    {
      name: locale === 'bn' ? 'প্রিয়াঙ্কা দত্ত' : 'Priyanka Dutta',
      role: locale === 'bn' ? 'বোর্ড সদস্য' : 'Board Member',
      image: 'https://images.unsplash.com/photo-1531056416665-266c4099c928?q=80&w=900&auto=format&fit=crop',
      index: 'No. 03'
    },
    {
      name: locale === 'bn' ? 'দেবজ্যোতি রায়' : 'Debojyoti Roy',
      role: locale === 'bn' ? 'বোর্ড সদস্য' : 'Board Member',
      image: 'https://images.unsplash.com/photo-1681235014294-588fea095706?q=80&w=900&auto=format&fit=crop',
      index: 'No. 04'
    }
  ]

  return (
    <div style={{ background: 'var(--color-void)' }}>
      {/* Decorative Textures */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.35] mix-blend-overlay canvas-texture" />

      {/* ============ PAGE HERO ============ */}
      <header className="page-hero artwork" id="pageHeroArt" ref={heroArtRef}>
        <img 
          src="https://images.unsplash.com/photo-1541961017774-22349e4a1262?q=80&w=2400&auto=format&fit=crop" 
          alt="Deep abstract painting texture" 
          loading="eager"
        />
        <div className="scrim"></div>
        <div className="page-hero-inner reveal">
          <div className="eyebrow center">{locale === 'bn' ? 'রঙধনু শিল্পী সংঘ' : "Rongdhono Artists' Collective"}</div>
          <h1>{content.title || (locale === 'bn' ? 'রঙধনু সম্পর্কে' : 'About Rongdhono')}</h1>
          <div className="hero-rule"></div>
          <p>
            {locale === 'bn' 
              ? '২০১০ সাল থেকে সৃজনশীলতা লালন এবং ঐতিহ্য সংরক্ষণে ললিতকলার একটি উত্তরাধিকার।' 
              : 'A legacy of fine arts, nurturing creativity and preserving heritage since 2010.'}
          </p>
        </div>
      </header>

      {/* ============ MISSION ============ */}
      <section className="about" id="mission">
        <div className="about-grid">
          <div className="about-copy reveal">
            <div className="eyebrow on-paper">{locale === 'bn' ? 'আমাদের লক্ষ্য' : 'Our Mission'}</div>
            <h2>
              {locale === 'bn' ? (
                <>শিল্পীদের একটি সমৃদ্ধ সম্প্রদায় গড়ে তোলা এবং সৃজনশীল অভিব্যক্তির জন্য এমন একটি প্ল্যাটফর্ম প্রদান করা যা <b>সীমানা অতিক্রম করে।</b></>
              ) : (
                <>To foster a thriving community of artists and provide a platform for creative expression that <b>transcends boundaries.</b></>
              )}
            </h2>
            <p className="mission-body">
              {content.mission || (locale === 'bn'
                ? 'শিল্পকলা সমাজকে রূপান্তর করার ক্ষমতা রাখে - এই বিশ্বাসের ভিত্তিতে প্রতিষ্ঠিত রঙধনু দূরদর্শী নির্মাতা এবং অনুরাগী সংগ্রাহকদের মধ্যে সেতু হিসাবে কাজ করে। আমরা এমন অভিজ্ঞতা তৈরি করি যা দৃষ্টিভঙ্গিকে চ্যালেঞ্জ করে এবং সমসাময়িক শিল্পচর্চাকে উন্নত করে।'
                : 'Founded on the belief that art has the power to transform society, Rongdhono serves as a bridge between visionary creators and passionate collectors. We curate experiences that challenge perspectives and elevate the contemporary art discourse.')}
            </p>
          </div>
          <div className="about-visual reveal">
            <div className="mission-img-main artwork">
              <img 
                src="https://images.unsplash.com/photo-1615184697985-c9bde1b07da7?q=80&w=1200&auto=format&fit=crop" 
                alt="Blue, yellow and red abstract painting" 
                loading="lazy"
              />
              <div className="scrim soft"></div>
              <div className="frame-edge"></div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ VISION ============ */}
      <section className="about about-flip">
        <div className="about-grid">
          <div className="about-visual reveal">
            <div className="mission-img-main artwork">
              <img 
                src="https://images.unsplash.com/photo-1602464729960-f95937746b68?q=80&w=1200&auto=format&fit=crop" 
                alt="Yellow, red and white abstract painting" 
                loading="lazy"
              />
              <div className="scrim soft"></div>
              <div className="frame-edge"></div>
            </div>
          </div>
          <div className="about-copy reveal">
            <div className="eyebrow on-paper">{locale === 'bn' ? 'আমাদের রূপকল্প' : 'Our Vision'}</div>
            <h2>
              {locale === 'bn' ? (
                <>পশ্চিমবঙ্গের সমসাময়িক শিল্পের শীর্ষস্থানীয় গন্তব্য হয়ে ওঠা, আধুনিক শৈল্পিক ধারাকে আলিঙ্গন করার পাশাপাশি আমাদের <b>সাংস্কৃতিক ঐতিহ্যকে সংরক্ষণ করা।</b></>
              ) : (
                <>To become the premier destination for contemporary art in <b>West Bengal,</b> preserving our cultural heritage while embracing modern artistic narratives.</>
              )}
            </h2>
            <p className="mission-body">
              {content.vision || (locale === 'bn'
                ? 'আমরা এমন একটি ভবিষ্যতের স্বপ্ন দেখি যেখানে সাংস্কৃতিক ঐতিহ্য এবং সমসাময়িক শৈল্পিক অভিব্যক্তি নির্বিঘ্নে মিশে যাবে। কঠোর কিউরেশন, বৈশ্বিক অংশীদারিত্ব এবং শৈল্পিক সততার প্রতি গভীর প্রতিশ্রুতির মাধ্যমে আমরা ললিতকলার একটি স্থায়ী অভয়ারণ্য গড়ে তুলছি।'
                : 'We envision a future where cultural heritage and contemporary expression seamlessly intertwine. Through rigorous curation, global partnerships, and a deep commitment to artistic integrity, we are building a lasting sanctuary for fine arts.')}
            </p>
          </div>
        </div>
      </section>

      {/* ============ COMMITTEE ============ */}
      <section className="artists" id="committee">
        <div className="section-head reveal" style={{ justifyContent: 'center', textAlign: 'center', flexDirection: 'column', alignItems: 'center' }}>
          <div className="eyebrow center">{locale === 'bn' ? 'আমাদের কমিটি' : 'Our Committee'}</div>
          <h2>{locale === 'bn' ? 'রঙধনুর নেপথ্যের রূপকারগণ' : 'The Visionaries Behind Rongdhono'}</h2>
        </div>
        <div className="artist-row">
          {committee.map((member, idx) => (
            <div key={idx} className="artist-card artwork reveal">
              <img 
                src={member.image} 
                alt={`Signature work representing ${member.name}`} 
                loading="lazy"
              />
              <div className="scrim"></div>
              <div className="frame-edge"></div>
              <span className="artist-index">{member.index}</span>
              <div className="artist-info">
                <b>{member.name}</b>
                <span>{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ============ HISTORY & LEGACY ============ */}
      <section className="legacy-wrap">
        <div className="legacy-card reveal">
          <div className="eyebrow center on-dark-card">{locale === 'bn' ? 'ইতিহাস ও ঐতিহ্য' : 'History & Legacy'}</div>
          <p className="legacy-quote">
            {content.history || (locale === 'bn'
              ? 'শিল্পের প্রতি গভীর অনুরাগে প্রতিষ্ঠিত রঙধনু আজ ক্ষুদ্র পরিসর পেরিয়ে সিলভার থ্রেড আর্ট গ্যালারিতে বার্ষিক প্রদর্শনীর আয়োজনকারী এক মর্যাদাপূর্ণ শিল্পী সংঘে পরিণত হয়েছে।'
              : 'Founded with a passion for the arts, Rongdhono has grown from a small group of local artists to a prestigious collective hosting an annual exhibition at the Silver Thread Art Gallery.')}
          </p>
          <div className="legacy-stats">
            <div>
              <b>2010</b>
              <span>{locale === 'bn' ? 'প্রতিষ্ঠা' : 'Foundation'}</span>
            </div>
            <div>
              <b>50+</b>
              <span>{locale === 'bn' ? 'প্রধান প্রদর্শনীসমূহ' : 'Major Exhibitions'}</span>
            </div>
            <div>
              <b>2K+</b>
              <span>{locale === 'bn' ? 'আন্তর্জাতিক শিল্পী' : 'Global Artists'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CLOSING CTA ============ */}
      <section className="closing-cta">
        <h2 className="reveal">
          {locale === 'bn' ? (
            <>আমাদের শৈল্পিক আবিষ্কারের যৌথ যাত্রায়<br />যোগ দিন।</>
          ) : (
            <>Join our collective journey of<br />artistic discovery.</>
          )}
        </h2>
        <Link href="/contact" className="btn btn-paper magnetic reveal">
          {locale === 'bn' ? 'যোগাযোগ করুন' : 'Get in Touch'}{' '}
          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" style={{ marginLeft: '2px' }}>
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </section>
    </div>
  )
}
