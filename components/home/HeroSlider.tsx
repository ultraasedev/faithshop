import Link from 'next/link'

interface SlideData {
  id: string
  image: string
  subtitle: string
  title: string
  description: string
  cta: string
  link: string
  isVideo: boolean
}

interface HeroSliderProps {
  slides: SlideData[]
}

/**
 * Hero slider rendered as pure HTML + inline script.
 * No 'use client', no React hooks — works even if React hydration fails.
 * The inline script self-initializes as soon as the DOM is parsed.
 */
export default function HeroSlider({ slides }: HeroSliderProps) {
  const sliderScript = `
(function() {
  var container = document.getElementById('hero-slider');
  if (!container) return;
  var slideCount = ${slides.length};
  if (slideCount <= 1) return;
  var current = 0;
  var timer = null;

  function goTo(index) {
    var slideDivs = container.querySelectorAll('[data-slide]');
    var dotBtns = container.querySelectorAll('[data-dot]');
    for (var i = 0; i < slideDivs.length; i++) {
      if (i === index) {
        slideDivs[i].style.opacity = '1';
        slideDivs[i].style.zIndex = '10';
        slideDivs[i].style.pointerEvents = 'auto';
      } else {
        slideDivs[i].style.opacity = '0';
        slideDivs[i].style.zIndex = '0';
        slideDivs[i].style.pointerEvents = 'none';
      }
    }
    for (var j = 0; j < dotBtns.length; j++) {
      dotBtns[j].style.backgroundColor = j === index ? 'white' : 'rgba(255,255,255,0.4)';
      dotBtns[j].style.width = j === index ? '48px' : '32px';
    }
    current = index;
  }

  function nextSlide() { goTo((current + 1) % slideCount); }

  function resetTimer() {
    if (timer) clearInterval(timer);
    timer = setInterval(nextSlide, 6000);
  }

  // Use event delegation on container - survives React re-renders
  container.addEventListener('click', function(e) {
    var dot = e.target.closest('[data-dot]');
    if (dot) {
      var idx = parseInt(dot.getAttribute('data-dot'), 10);
      if (!isNaN(idx)) { goTo(idx); resetTimer(); }
      return;
    }
    var nav = e.target.closest('[data-nav]');
    if (nav) {
      var dir = nav.getAttribute('data-nav');
      if (dir === 'prev') {
        goTo(current === 0 ? slideCount - 1 : current - 1);
      } else {
        nextSlide();
      }
      resetTimer();
    }
  });

  // Touch swipe support for mobile
  var touchStartX = 0;
  container.addEventListener('touchstart', function(e) {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });
  container.addEventListener('touchend', function(e) {
    var diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) { nextSlide(); } else { goTo(current === 0 ? slideCount - 1 : current - 1); }
      resetTimer();
    }
  }, { passive: true });

  timer = setInterval(nextSlide, 6000);
})();
`

  return (
    <>
      <section
        id="hero-slider"
        style={{ position: 'relative', height: '95vh', width: '100%', overflow: 'hidden', backgroundColor: 'black' }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            data-slide={index}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: index === 0 ? 1 : 0,
              zIndex: index === 0 ? 10 : 0,
              pointerEvents: index === 0 ? 'auto' : 'none',
              transition: 'opacity 1s ease-in-out',
            }}
          >
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {slide.isVideo ? (
                <video
                  src={slide.image}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.6)' }}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={slide.image}
                  alt={slide.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', filter: 'brightness(0.85)' }}
                  loading={index === 0 ? 'eager' : 'lazy'}
                />
              )}
            </div>

            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              padding: '80px 24px 48px',
              pointerEvents: 'none',
            }}>
              <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <span style={{
                  display: 'inline-block',
                  color: 'rgba(255,255,255,0.8)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.2em',
                  marginBottom: '16px',
                }}>
                  {slide.subtitle}
                </span>
                <h1 style={{
                  fontFamily: 'var(--font-serif, Georgia, serif)',
                  fontSize: 'clamp(2rem, 7vw, 5rem)',
                  color: 'white',
                  lineHeight: 1.1,
                  marginBottom: '16px',
                }}>
                  {slide.title}
                </h1>
                <p style={{
                  fontSize: 'clamp(1rem, 2vw, 1.25rem)',
                  color: 'rgba(255,255,255,0.9)',
                  maxWidth: '560px',
                  margin: '0 auto 32px',
                  fontWeight: 300,
                  lineHeight: 1.6,
                }}>
                  {slide.description}
                </p>
                <div style={{ pointerEvents: 'auto' }}>
                  <Link
                    href={slide.link}
                    style={{
                      display: 'inline-block',
                      padding: '14px 32px',
                      backgroundColor: 'white',
                      color: 'black',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      textDecoration: 'none',
                    }}
                  >
                    {slide.cta}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {slides.length > 1 && (
          <>
            <div style={{
              position: 'absolute',
              bottom: '32px',
              left: 0,
              right: 0,
              zIndex: 30,
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
            }}>
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  data-dot={index}
                  aria-label={`Aller à la slide ${index + 1}`}
                  style={{
                    height: '8px',
                    borderRadius: '9999px',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    backgroundColor: index === 0 ? 'white' : 'rgba(255,255,255,0.4)',
                    width: index === 0 ? '48px' : '32px',
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              data-nav="prev"
              aria-label="Slide précédente"
              style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>

            <button
              type="button"
              data-nav="next"
              aria-label="Slide suivante"
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 30,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.3)',
                backgroundColor: 'rgba(0,0,0,0.2)',
                color: 'white',
                cursor: 'pointer',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </>
        )}
      </section>
      <script dangerouslySetInnerHTML={{ __html: sliderScript }} />
    </>
  )
}
