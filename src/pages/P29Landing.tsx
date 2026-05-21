import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

export default function P29Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    // Intersection Observer for reveal animations
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    // Smooth scroll for anchor links
    const handleAnchorClick = (e: Event) => {
      const target = e.currentTarget as HTMLAnchorElement;
      const id = target.getAttribute('href');
      if (id && id.length > 1 && id.startsWith('#')) {
        const element = document.querySelector(id);
        if (element) {
          e.preventDefault();
          window.scrollTo({ top: (element as HTMLElement).offsetTop - 60, behavior: 'smooth' });
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', handleAnchorClick);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  return (
    <>
      <style>{`
:root{
  --navy:#0D1B2A;
  --navy-deep:#070F18;
  --gold:#DD5406;
  --gold-bright:#F26A1F;
  --gold-dim:#A03D04;
  --teal:#5E5E5F;
  --teal-deep:#3F3E3E;
  --cream:#E8E2DB;
  --paper:#F5F1EB;
  --rule:rgba(13,27,42,.1);
  --rule-strong:rgba(13,27,42,.16);
  --rule-on-dark:rgba(232,226,219,.14);
  --ink:#0D1B2A;
  --ink-soft:#3D4A5C;
  --ink-light:#6B7689;
}
.p29-landing *{box-sizing:border-box;margin:0;padding:0}
.p29-landing{font-family:'Inter Tight',-apple-system,sans-serif;background:var(--paper);color:var(--ink);font-weight:400;line-height:1.55;-webkit-font-smoothing:antialiased;overflow-x:hidden}
.serif{font-family:'Fraunces',Georgia,serif;font-feature-settings:"ss01","ss02"}

/* NAV */
.p29-nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:18px 56px;display:flex;justify-content:space-between;align-items:center;background:rgba(250,248,243,.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid var(--rule)}
.p29-logo{font-family:'Fraunces',serif;font-size:24px;font-weight:500;letter-spacing:-0.02em;color:var(--navy)}
.p29-logo span{color:var(--gold)}
.p29-nav-links{display:flex;gap:36px;align-items:center}
.p29-nav-links a{font-size:13px;color:var(--ink-soft);text-decoration:none;letter-spacing:.01em;transition:color .2s;cursor:pointer}
.p29-nav-links a:hover{color:var(--navy)}
.p29-nav-cta{background:var(--navy);color:var(--paper);padding:10px 20px;font-size:13px;font-weight:500;text-decoration:none;border-radius:2px;transition:all .25s;cursor:pointer;border:none}
.p29-nav-cta:hover{background:var(--gold);color:var(--navy)}
.p29-login-btn{background:var(--gold);color:var(--navy);padding:10px 24px;font-size:13px;font-weight:600;text-decoration:none;border-radius:2px;transition:all .25s;cursor:pointer;border:none;letter-spacing:.02em}
.p29-login-btn:hover{background:var(--gold-bright);transform:translateY(-1px);box-shadow:0 4px 12px rgba(221,84,6,.25)}

/* HERO */
.p29-hero{min-height:100vh;padding:160px 56px 100px;background:var(--paper);position:relative;display:flex;flex-direction:column;justify-content:center;overflow:hidden}
.p29-hero-grid{position:absolute;inset:0;background-image:linear-gradient(var(--rule) 1px,transparent 1px),linear-gradient(90deg,var(--rule) 1px,transparent 1px);background-size:96px 96px;opacity:.35;mask-image:radial-gradient(ellipse at 75% 50%,black 20%,transparent 70%)}
.p29-hero-inner{max-width:1280px;margin:0 auto;width:100%;position:relative;z-index:2}

.p29-hero-meta{display:inline-flex;align-items:center;gap:12px;margin-bottom:56px;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-soft);font-weight:500;padding:8px 16px;background:rgba(13,27,42,.04);border:1px solid var(--rule);border-radius:24px}
.p29-pulse{width:7px;height:7px;border-radius:50%;background:var(--gold);box-shadow:0 0 0 0 rgba(221,84,6,.6);animation:pulse 2.4s infinite}
@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(221,84,6,.6)}70%{box-shadow:0 0 0 12px rgba(221,84,6,0)}100%{box-shadow:0 0 0 0 rgba(221,84,6,0)}}

h1.p29-hero-title{font-family:'Fraunces',serif;font-size:clamp(54px,7.4vw,118px);line-height:.94;letter-spacing:-0.04em;font-weight:400;color:var(--navy);margin-bottom:48px;max-width:1180px}
h1.p29-hero-title em{font-style:italic;font-weight:300;color:var(--gold-dim)}

.p29-hero-sub{max-width:700px;font-size:20px;line-height:1.55;color:var(--ink-soft);margin-bottom:56px;font-weight:400}
.p29-hero-sub strong{color:var(--navy);font-weight:500}

.p29-hero-cta-row{display:flex;gap:32px;align-items:center;flex-wrap:wrap}
.p29-btn-primary{background:var(--navy);color:var(--paper);padding:18px 36px;font-size:14px;font-weight:500;text-decoration:none;letter-spacing:.02em;border:none;cursor:pointer;border-radius:2px;display:inline-flex;align-items:center;gap:12px;transition:all .3s cubic-bezier(.2,.8,.2,1)}
.p29-btn-primary:hover{background:var(--gold);color:var(--navy);transform:translateY(-2px)}
.p29-btn-primary .arrow{transition:transform .3s;font-size:18px;line-height:1}
.p29-btn-primary:hover .arrow{transform:translateX(4px)}
.p29-btn-secondary{background:transparent;color:var(--ink-soft);font-size:13px;font-weight:500;text-decoration:none;letter-spacing:.06em;text-transform:uppercase;display:inline-flex;align-items:center;gap:10px;transition:color .25s;cursor:pointer}
.p29-btn-secondary:hover{color:var(--navy)}
.p29-btn-secondary::after{content:"→";transition:transform .3s}
.p29-btn-secondary:hover::after{transform:translateX(4px)}

/* SECTION SHELL */
.p29-section{padding:140px 56px;position:relative}
.p29-container{max-width:1280px;margin:0 auto}
.p29-eyebrow{font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:var(--gold-dim);font-weight:600;margin-bottom:28px;display:flex;align-items:center;gap:14px}
.p29-eyebrow::before{content:"";width:36px;height:1px;background:var(--gold-dim)}
h2.p29-section-title{font-family:'Fraunces',serif;font-size:clamp(40px,5vw,72px);line-height:1.02;letter-spacing:-0.032em;font-weight:400;color:var(--navy);max-width:980px;margin-bottom:32px}
h2.p29-section-title em{font-style:italic;font-weight:300;color:var(--gold-dim)}
.p29-section-lead{font-size:19px;line-height:1.6;color:var(--ink-soft);max-width:680px;margin-bottom:0}

/* THE FLOW */
.p29-flow{background:var(--paper);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.p29-flow-header{display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:end;margin-bottom:100px}

.p29-flow-diagram{position:relative;padding:40px 0 20px}
.p29-flow-track{position:absolute;top:88px;left:8%;right:8%;height:1px;background:linear-gradient(90deg,var(--rule-strong) 0%,var(--gold) 50%,var(--teal) 100%);z-index:0}
.p29-flow-steps{display:grid;grid-template-columns:repeat(5,1fr);gap:0;position:relative;z-index:1}
.p29-step{text-align:center;padding:0 20px}
.p29-step-dot{width:96px;height:96px;border-radius:50%;background:var(--paper);border:1.5px solid var(--rule-strong);margin:0 auto 28px;display:flex;align-items:center;justify-content:center;font-family:'Fraunces',serif;font-style:italic;font-weight:400;font-size:24px;letter-spacing:-0.02em;color:var(--ink-soft);transition:all .35s cubic-bezier(.2,.8,.2,1);position:relative}
.p29-step-dot::before{content:"";position:absolute;inset:-8px;border-radius:50%;border:1px dashed transparent;transition:border-color .35s}
.p29-step:hover .p29-step-dot{transform:scale(1.04)}
.p29-step:hover .p29-step-dot::before{border-color:rgba(221,84,6,.3)}
.p29-step.p29 .p29-step-dot{border-color:var(--gold);color:var(--gold-dim);background:var(--cream)}
.p29-step.you .p29-step-dot{border-color:var(--navy);color:var(--navy);background:var(--paper)}
.p29-step.ai .p29-step-dot{border-color:var(--gold);background:var(--navy);color:var(--gold-bright)}
.p29-step.expert .p29-step-dot{border-color:var(--teal);color:var(--teal-deep);border-style:dashed;background:var(--paper)}
.p29-step-num{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.24em;color:var(--ink-light);text-transform:uppercase;font-weight:600;margin-bottom:10px}
.p29-step-title{font-family:'Fraunces',serif;font-size:22px;font-weight:500;letter-spacing:-0.015em;line-height:1.2;color:var(--navy);margin-bottom:12px}
.p29-step-desc{font-size:14px;line-height:1.55;color:var(--ink-soft);max-width:200px;margin:0 auto}

/* WORKFLOWS */
.p29-workflows{background:var(--cream);border-bottom:1px solid var(--rule)}
.p29-workflows-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--rule);border:1px solid var(--rule);margin-top:64px}
.p29-wflow{background:var(--paper);padding:40px 36px;display:flex;flex-direction:column;transition:background .3s}
.p29-wflow:hover{background:#fffefa}
.p29-wflow-num{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.22em;color:var(--gold-dim);font-weight:600;margin-bottom:20px}
.p29-wflow h3{font-family:'Fraunces',serif;font-size:22px;line-height:1.2;letter-spacing:-0.015em;font-weight:500;margin-bottom:14px;color:var(--navy)}
.p29-wflow p{font-size:15px;line-height:1.6;color:var(--ink-soft);margin-bottom:24px;flex:1}
.p29-wflow-flow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding-top:18px;border-top:1px dashed var(--rule)}
.p29-tag{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;font-weight:600;padding:4px 9px;line-height:1.4;border-radius:1px}
.p29-tag.p29{background:rgba(221,84,6,.14);color:var(--gold-dim)}
.p29-tag.you{background:rgba(13,27,42,.08);color:var(--navy)}
.p29-tag.ai{background:var(--navy);color:var(--gold)}
.p29-tag.expert{background:rgba(94,94,95,.14);color:var(--teal-deep)}
.p29-tag-arrow{color:var(--ink-light);font-size:13px;margin:0 2px}

/* COMPARISON BAND */
.p29-comparison{background:var(--navy);color:var(--cream);border-top:1px solid var(--rule);border-bottom:1px solid var(--rule)}
.p29-comparison .p29-eyebrow{color:var(--gold)}
.p29-comparison .p29-eyebrow::before{background:var(--gold)}
.p29-comparison h2.p29-section-title{color:var(--cream)}
.p29-comparison h2.p29-section-title em{color:var(--gold)}
.p29-comparison .p29-section-lead{color:rgba(232,226,219,.7);max-width:760px}
.p29-comp-grid{display:grid;grid-template-columns:1fr 1fr 1.2fr;gap:24px;margin-top:72px;align-items:stretch}
.p29-comp-col{background:rgba(232,226,219,.04);border:1px solid var(--rule-on-dark);padding:36px 32px 32px;display:flex;flex-direction:column;position:relative;transition:transform .3s,border-color .3s}
.p29-comp-col:hover{transform:translateY(-3px);border-color:rgba(232,226,219,.25)}
.p29-comp-col.p29{background:linear-gradient(180deg,rgba(221,84,6,.08) 0%,rgba(221,84,6,.02) 100%);border-color:var(--gold);box-shadow:0 24px 48px -24px rgba(221,84,6,.18)}
.p29-comp-col.p29::before{content:"THE SYNTHESIS";position:absolute;top:-1px;right:-1px;background:var(--gold);color:var(--navy);padding:6px 14px;font-size:10px;font-weight:600;letter-spacing:.2em}

.p29-comp-category{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.22em;color:var(--gold);text-transform:uppercase;font-weight:600;margin-bottom:14px}
.p29-comp-col.p29 .p29-comp-category{color:var(--gold-bright)}
.p29-comp-title{font-family:'Fraunces',serif;font-size:26px;font-weight:500;letter-spacing:-0.02em;line-height:1.15;margin-bottom:8px;color:var(--cream)}
.p29-comp-col.p29 .p29-comp-title{color:var(--gold-bright)}
.p29-comp-tagline{font-size:13px;color:rgba(232,226,219,.55);font-style:italic;margin-bottom:24px;line-height:1.5;padding-bottom:24px;border-bottom:1px solid var(--rule-on-dark)}
.p29-comp-col.p29 .p29-comp-tagline{color:rgba(232,226,219,.75);border-bottom-color:rgba(221,84,6,.25)}

.p29-comp-section{margin-bottom:20px}
.p29-comp-section-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;margin-bottom:10px}
.p29-comp-section-label.good{color:var(--teal)}
.p29-comp-section-label.gap{color:rgba(168,68,58,.85)}
.p29-comp-section-label.both{color:var(--gold)}

.p29-comp-list{list-style:none;display:flex;flex-direction:column;gap:8px}
.p29-comp-list li{font-size:13.5px;line-height:1.55;color:rgba(232,226,219,.75);display:flex;gap:10px;align-items:flex-start;padding-left:0}
.p29-comp-col.p29 .p29-comp-list li{color:rgba(232,226,219,.88)}
.p29-comp-list li::before{content:"";flex-shrink:0;width:14px;height:1px;background:currentColor;margin-top:11px;opacity:.5}

.p29-comp-footer{margin-top:auto;padding-top:24px;border-top:1px dashed var(--rule-on-dark);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(232,226,219,.5);font-weight:600}
.p29-comp-col.p29 .p29-comp-footer{color:var(--gold);border-top-color:rgba(221,84,6,.3)}

.p29-founder{background:var(--navy);color:var(--cream);padding:160px 56px}
.p29-founder-inner{max-width:1080px;margin:0 auto}
.p29-founder-quote{font-family:'Fraunces',serif;font-size:clamp(28px,3.6vw,52px);font-weight:400;font-style:italic;line-height:1.18;letter-spacing:-0.025em;color:var(--cream);margin-bottom:48px;position:relative;padding-top:20px}
.p29-founder-quote::before{content:"\\201C";font-family:'Fraunces',serif;font-size:140px;color:var(--gold);position:absolute;top:-60px;left:-12px;line-height:1;font-style:normal;font-weight:400;opacity:.7}
.p29-founder-quote em{font-style:normal;color:var(--gold);font-weight:400}
.p29-founder-attribution{display:flex;align-items:center;gap:24px;padding-top:32px;border-top:1px solid var(--rule-on-dark)}
.p29-founder-name{font-family:'Fraunces',serif;font-size:22px;font-weight:500;color:var(--cream);letter-spacing:-0.01em;margin-bottom:4px}
.p29-founder-role{font-size:13px;color:rgba(232,226,219,.6);letter-spacing:.04em;line-height:1.6}
.p29-founder-role span{color:var(--gold);margin:0 8px}

/* PRICING */
.p29-pricing{background:var(--paper)}
.p29-pricing-context{font-size:18px;line-height:1.6;color:var(--ink-soft);max-width:680px;margin-bottom:64px}
.p29-pricing-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.p29-pricing-grid-3{grid-template-columns:1fr 1fr 1.15fr;max-width:1100px;margin:0 auto}
.p29-tier{border:1px solid var(--rule);padding:36px 28px;background:var(--paper);display:flex;flex-direction:column;transition:all .3s;position:relative}
.p29-tier:hover{border-color:var(--navy);transform:translateY(-4px);box-shadow:0 16px 32px -16px rgba(13,27,42,.12)}
.p29-tier.featured{background:var(--navy);color:var(--cream);border-color:var(--navy)}
.p29-tier.featured::before{content:"INCLUDES EXPERT";position:absolute;top:-1px;right:-1px;background:var(--gold);color:var(--navy);padding:6px 12px;font-size:10px;font-weight:600;letter-spacing:.18em}
.p29-tier-name{font-family:'Fraunces',serif;font-size:26px;letter-spacing:-0.015em;font-weight:500;margin-bottom:6px}
.p29-tier-tag{font-size:11px;letter-spacing:.08em;color:var(--ink-light);text-transform:uppercase;margin-bottom:28px}
.p29-tier.featured .p29-tier-tag{color:rgba(232,226,219,.55)}
.p29-tier-price{font-family:'Fraunces',serif;font-size:42px;letter-spacing:-0.035em;font-weight:400;margin-bottom:4px;line-height:1}
.p29-tier-price small{font-size:13px;color:var(--ink-light);font-weight:400}
.p29-tier.featured .p29-tier-price small{color:rgba(232,226,219,.55)}
.p29-tier-billing{font-size:11px;color:var(--ink-light);margin-bottom:28px;letter-spacing:.02em}
.p29-tier.featured .p29-tier-billing{color:rgba(232,226,219,.55)}
.p29-tier-features{list-style:none;flex:1;margin-bottom:28px;border-top:1px solid var(--rule);padding-top:22px}
.p29-tier.featured .p29-tier-features{border-top-color:rgba(232,226,219,.2)}
.p29-tier-features li{font-size:13px;line-height:1.55;padding:7px 0;color:var(--ink-soft);display:flex;gap:10px;align-items:flex-start}
.p29-tier.featured .p29-tier-features li{color:rgba(232,226,219,.78)}
.p29-tier-features li::before{content:"·";color:var(--gold);font-weight:700;flex-shrink:0;font-size:18px;line-height:1.2}
.p29-tier-features li.expert-line{color:var(--teal);font-weight:500}
.p29-tier.featured .p29-tier-features li.expert-line{color:var(--gold-bright);font-weight:500}
.p29-tier-features li.expert-line::before{content:"+";color:var(--teal);font-size:14px;font-weight:600}
.p29-tier.featured .p29-tier-features li.expert-line::before{color:var(--gold-bright)}
.p29-tier-cta{padding:14px 20px;text-align:center;text-decoration:none;font-size:13px;font-weight:500;letter-spacing:.02em;border-radius:2px;background:var(--paper);color:var(--navy);border:1px solid var(--navy);transition:all .25s;cursor:pointer}
.p29-tier-cta:hover{background:var(--navy);color:var(--paper)}
.p29-tier.featured .p29-tier-cta{background:var(--gold);color:var(--navy);border-color:var(--gold)}
.p29-tier.featured .p29-tier-cta:hover{background:var(--cream);color:var(--navy)}

.p29-pricing-note{margin-top:40px;padding:24px 28px;background:var(--cream);border:1px solid var(--rule);font-size:14px;color:var(--ink-soft);display:flex;align-items:center;gap:20px;flex-wrap:wrap;line-height:1.6}
.p29-pricing-note strong{color:var(--navy);font-weight:500}
.p29-pricing-note .badge{display:inline-flex;align-items:center;gap:8px;background:var(--paper);padding:6px 14px;border:1px solid var(--rule);font-size:11px;color:var(--teal);font-weight:600;letter-spacing:.06em;text-transform:uppercase;border-radius:24px}
.p29-pricing-note .badge::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--teal)}

/* FINAL CTA */
.p29-final-cta{background:var(--cream);padding:160px 56px;border-top:1px solid var(--rule);position:relative;overflow:hidden}
.p29-final-cta::before{content:"P29";position:absolute;right:-60px;bottom:-140px;font-family:'Fraunces',serif;font-size:420px;font-weight:300;font-style:italic;color:rgba(221,84,6,.08);line-height:1;letter-spacing:-0.05em;pointer-events:none;user-select:none}
.p29-final-cta-inner{max-width:1280px;margin:0 auto;position:relative;z-index:2;display:grid;grid-template-columns:1.1fr 1fr;gap:80px;align-items:center}
.p29-final-cta h2{font-family:'Fraunces',serif;font-size:clamp(40px,5.4vw,80px);line-height:1.02;letter-spacing:-0.035em;font-weight:400;color:var(--navy);margin-bottom:32px}
.p29-final-cta h2 em{font-style:italic;color:var(--gold-dim);font-weight:300}
.p29-final-cta-text{font-size:18px;line-height:1.55;color:var(--ink-soft);max-width:520px}

.p29-signup-form{display:flex;flex-direction:column;gap:14px}
.p29-signup-form input,.p29-signup-form select{padding:18px 20px;border:1px solid var(--rule-strong);background:var(--paper);font-size:15px;font-family:inherit;color:var(--ink);border-radius:2px;transition:border-color .2s}
.p29-signup-form input:focus,.p29-signup-form select:focus{outline:none;border-color:var(--navy)}
.p29-signup-form .row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.p29-signup-form button{margin-top:8px;justify-content:center;padding:20px 32px;font-size:14px;width:100%}
.p29-form-note{font-size:12px;color:var(--ink-light);margin-top:4px;line-height:1.5}

/* FOOTER */
.p29-footer{background:var(--navy-deep);color:rgba(232,226,219,.55);padding:72px 56px 32px;font-size:13px}
.p29-footer-inner{max-width:1280px;margin:0 auto}
.p29-footer-top{display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:56px;padding-bottom:52px;border-bottom:1px solid var(--rule-on-dark)}
.p29-footer-brand{font-family:'Fraunces',serif;font-size:28px;font-weight:500;color:var(--cream);margin-bottom:14px;letter-spacing:-0.02em}
.p29-footer-brand span{color:var(--gold)}
.p29-footer-desc{max-width:340px;line-height:1.65}
.p29-footer-col h4{font-size:11px;letter-spacing:.22em;color:var(--gold);text-transform:uppercase;margin-bottom:20px;font-weight:600}
.p29-footer-col a{display:block;color:rgba(232,226,219,.7);text-decoration:none;padding:6px 0;transition:color .2s;font-size:13px;cursor:pointer}
.p29-footer-col a:hover{color:var(--gold)}
.p29-footer-bottom{padding-top:32px;display:flex;justify-content:space-between;flex-wrap:wrap;gap:20px;font-size:12px;letter-spacing:.04em}

/* ANIMATIONS */
.reveal{opacity:0;transform:translateY(32px);transition:opacity 1s cubic-bezier(.2,.8,.2,1),transform 1s cubic-bezier(.2,.8,.2,1)}
.reveal.visible{opacity:1;transform:translateY(0)}
.reveal[data-d="1"]{transition-delay:.1s}
.reveal[data-d="2"]{transition-delay:.2s}
.reveal[data-d="3"]{transition-delay:.3s}
.reveal[data-d="4"]{transition-delay:.4s}
.reveal[data-d="5"]{transition-delay:.5s}

/* RESPONSIVE */
@media (max-width:1100px){
  .p29-flow-header{grid-template-columns:1fr;gap:32px}
  .p29-flow-steps{grid-template-columns:1fr;gap:48px}
  .p29-flow-track{display:none}
  .p29-step{display:grid;grid-template-columns:96px 1fr;gap:28px;text-align:left;padding:0;align-items:start}
  .p29-step-dot{margin:0}
  .p29-step-desc{max-width:none}
  .p29-workflows-grid{grid-template-columns:repeat(2,1fr)}
  .p29-comp-grid{grid-template-columns:1fr;gap:16px}
  .p29-comp-col.p29{order:-1}
  .p29-final-cta-inner{grid-template-columns:1fr;gap:48px}
}
@media (max-width:900px){
  .p29-nav{padding:14px 24px}
  .p29-nav-links{gap:20px}
  .p29-nav-links a:not(.p29-nav-cta):not(.p29-login-btn){display:none}
  .p29-hero{padding:140px 24px 80px}
  .p29-section{padding:96px 24px}
  .p29-founder{padding:96px 24px}
  .p29-founder-quote::before{font-size:96px;top:-44px;left:-4px}
  .p29-workflows-grid{grid-template-columns:1fr}
  .p29-pricing-grid{grid-template-columns:1fr 1fr;gap:14px}
  .p29-pricing-grid-3{grid-template-columns:1fr;max-width:520px}
  .p29-footer-top{grid-template-columns:1fr 1fr;gap:36px}
  .p29-final-cta{padding:96px 24px}
  .p29-final-cta::before{font-size:240px;bottom:-80px}
}
@media (max-width:560px){
  .p29-pricing-grid{grid-template-columns:1fr}
  .p29-footer-top{grid-template-columns:1fr}
  h1.p29-hero-title{font-size:46px}
  .p29-signup-form .row-2{grid-template-columns:1fr}
}
      `}</style>
      
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT,WONK@9..144,300;9..144,400;9..144,500;9..144,600;9..144,700&family=Inter+Tight:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />

      <div className="p29-landing">
        <nav className="p29-nav">
          <div className="p29-logo">P<span>29</span></div>
          <div className="p29-nav-links">
            <a href="#how">How it works</a>
            <a href="#workflows">Platform</a>
            <a href="#pricing">Pricing</a>
            <button onClick={handleLoginClick} className="p29-login-btn">Login</button>
          </div>
        </nav>

        <section className="p29-hero">
          <div className="p29-hero-grid"></div>
          <div className="p29-hero-inner">
            <div className="p29-hero-meta reveal">
              <span className="p29-pulse"></span>
              <span>Provision 29 · Effective 1 January 2026</span>
            </div>

            <h1 className="p29-hero-title serif reveal" data-d="1">
              The first Provision 29 product that <em>builds the framework</em> and operates it.
            </h1>

            <p className="p29-hero-sub reveal" data-d="2">
              Internal control software stores what you already have. Consultants build the risk-control matrix once and leave. P29 does both — and runs the framework for years. A practitioner's <strong>structure</strong>, <strong>industry-specific questions</strong> answered by your team, <strong>AI</strong> preparing against your context, <strong>you reviewing</strong> what matters, and on the Expert tier, a <strong>practitioner on call</strong>. One annual licence — covering what you currently buy from two providers.
            </p>

            <div className="p29-hero-cta-row reveal" data-d="3">
              <button onClick={() => navigate('/signup')} className="p29-btn-primary">
                Start free trial <span className="arrow">→</span>
              </button>
              <a href="#how" className="p29-btn-secondary">
                How it works
              </a>
            </div>
          </div>
        </section>

        <section className="p29-flow p29-section" id="how">
          <div className="p29-container">
            <div className="p29-flow-header">
              <div>
                <div className="p29-eyebrow reveal">How it works</div>
                <h2 className="p29-section-title reveal" data-d="1">
                  Five steps. <em>Done by the right actor.</em>
                </h2>
              </div>
              <p className="p29-section-lead reveal" data-d="2">
                Each step is handled by whoever does it best. The platform does what consultants used to bill for. You do what only you can decide. The result is a framework that's both built and continually operated — without ever splitting the work across two providers.
              </p>
            </div>

            <div className="p29-flow-diagram">
              <div className="p29-flow-track"></div>
              <div className="p29-flow-steps">
                <div className="p29-step p29 reveal">
                  <div className="p29-step-dot serif">P29</div>
                  <div className="p29-step-num">Step 01 · Provided</div>
                  <h3 className="p29-step-title serif">The Structure</h3>
                  <p className="p29-step-desc">A complete Provision 29 framework, built by a practitioner.</p>
                </div>

                <div className="p29-step you reveal" data-d="1">
                  <div className="p29-step-dot serif">You</div>
                  <div className="p29-step-num">Step 02 · You answer</div>
                  <h3 className="p29-step-title serif">The Context</h3>
                  <p className="p29-step-desc">Industry-specific questions. The AI researches your company in parallel.</p>
                </div>

                <div className="p29-step ai reveal" data-d="2">
                  <div className="p29-step-dot serif">AI</div>
                  <div className="p29-step-num">Step 03 · AI does</div>
                  <h3 className="p29-step-title serif">The Work</h3>
                  <p className="p29-step-desc">Prepares the framework from your answers against the structure.</p>
                </div>

                <div className="p29-step you reveal" data-d="3">
                  <div className="p29-step-dot serif">You</div>
                  <div className="p29-step-num">Step 04 · You do</div>
                  <h3 className="p29-step-title serif">The Review</h3>
                  <p className="p29-step-desc">Read, amend, approve. Apply judgement where it matters.</p>
                </div>

                <div className="p29-step expert reveal" data-d="4">
                  <div className="p29-step-dot serif">+</div>
                  <div className="p29-step-num">Step 05 · Expert tier</div>
                  <h3 className="p29-step-title serif">The Expert</h3>
                  <p className="p29-step-desc">Five hours of calls or ten questions every month — built in.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="p29-workflows p29-section" id="workflows">
          <div className="p29-container">
            <div className="p29-eyebrow reveal">The platform</div>
            <h2 className="p29-section-title reveal" data-d="1">
              Six workflows. <em>One flow.</em>
            </h2>
            <p className="p29-section-lead reveal" data-d="2">
              Every module follows the same five-step pattern. The platform handles assembly. You handle judgement.
            </p>

            <div className="p29-workflows-grid">
              <div className="p29-wflow reveal">
                <div className="p29-wflow-num">01</div>
                <h3>Principal Risk Register</h3>
                <p>Answer the platform's industry-specific questions. The AI researches your company and external environment in parallel — and prepares a Provision 29-aligned register. Your Head of Risk amends it in a single sitting.</p>
                <div className="p29-wflow-flow">
                  <span className="p29-tag p29">P29 asks</span>
                  <span className="p29-tag-arrow">→</span>
                  <span className="p29-tag you">You answer</span>
                  <span className="p29-tag-arrow">→</span>
                  <span className="p29-tag ai">AI prepares</span>
                </div>
              </div>

              <div className="p29-wflow reveal" data-d="1">
                <div className="p29-wflow-num">02</div>
                <h3>Material Control Library</h3>
                <p>Each material control derived from a principal risk and tagged to one of the four declaration categories. Materiality stays with the board.</p>
                <div className="p29-wflow-flow">
                  <span className="p29-tag ai">AI prepares</span>
                  <span className="p29-tag-arrow">→</span>
                  <span className="p29-tag you">You set materiality</span>
                </div>
              </div>

              <div className="p29-wflow reveal" data-d="2">
                <div className="p29-wflow-num">03</div>
                <h3>Quarterly Board Reports</h3>
                <p>Auto-assembled — new risks, criticality changes, control failures, mitigation progress. You add the board commentary. Ready in an hour.</p>
                <div className="p29-wflow-flow">
                  <span className="p29-tag ai">AI assembles</span>
                  <span className="p29-tag-arrow">→</span>
                  <span className="p29-tag you">You add commentary</span>
                </div>
              </div>

              <div className="p29-wflow reveal">
                <div className="p29-wflow-num">04</div>
                <h3>Control Testing</h3>
                <p>Operating effectiveness testing across all four control categories — whether by control owners, internal audit, or external reviewers. P29 routes the work, captures the evidence, and builds the audit trail automatically.</p>
                <div className="p29-wflow-flow">
                  <span className="p29-tag p29">P29 routes</span>
                  <span className="p29-tag-arrow">→</span>
                  <span className="p29-tag you">Testers complete</span>
                </div>
              </div>

              <div className="p29-wflow reveal" data-d="1">
                <div className="p29-wflow-num">05</div>
                <h3>Audit Committee Workspace</h3>
                <p>Year-end review draws on quarterly reports, internal audit findings, control testing results, and external auditor observations — in one place.</p>
                <div className="p29-wflow-flow">
                  <span className="p29-tag ai">AI assembles</span>
                  <span className="p29-tag-arrow">→</span>
                  <span className="p29-tag you">Committee reviews</span>
                </div>
              </div>

              <div className="p29-wflow reveal" data-d="2">
                <div className="p29-wflow-num">06</div>
                <h3>Declaration Builder</h3>
                <p>From governance evidence to annual report disclosure. The AI prepares; the board reviews and signs off. Constructed throughout the year — not written at year end.</p>
                <div className="p29-wflow-flow">
                  <span className="p29-tag ai">AI prepares</span>
                  <span className="p29-tag-arrow">→</span>
                  <span className="p29-tag you">Board approves</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="p29-comparison p29-section">
          <div className="p29-container">
            <div className="p29-eyebrow reveal">The category</div>
            <h2 className="p29-section-title reveal" data-d="1">
              Until now, Provision 29 took <em>two purchases.</em>
            </h2>
            <p className="p29-section-lead reveal" data-d="2">
              Internal control software stores documents and routes workflows. Consultants build the risk-control matrix and walk away. Each solves half the problem. P29 is the first product to solve both — building the framework and operating it for years.
            </p>

            <div className="p29-comp-grid">
              <div className="p29-comp-col reveal" data-d="1">
                <div className="p29-comp-category">Category one</div>
                <h3 className="p29-comp-title serif">GRC Software</h3>
                <p className="p29-comp-tagline">A filing cabinet with workflows.</p>

                <div className="p29-comp-section">
                  <div className="p29-comp-section-label good">What it does well</div>
                  <ul className="p29-comp-list">
                    <li>Stores existing controls and evidence</li>
                    <li>Routes attestations and approvals</li>
                    <li>Holds the audit trail</li>
                  </ul>
                </div>

                <div className="p29-comp-section">
                  <div className="p29-comp-section-label gap">What's missing</div>
                  <ul className="p29-comp-list">
                    <li>Empty on day one — has no structure of its own</li>
                    <li>Cannot build the framework you're storing</li>
                  </ul>
                </div>

                <div className="p29-comp-footer">Operates · doesn't build</div>
              </div>

              <div className="p29-comp-col reveal" data-d="2">
                <div className="p29-comp-category">Category two</div>
                <h3 className="p29-comp-title serif">Consultants</h3>
                <p className="p29-comp-tagline">A matrix delivered, then absent.</p>

                <div className="p29-comp-section">
                  <div className="p29-comp-section-label good">What they do well</div>
                  <ul className="p29-comp-list">
                    <li>Build the risk-control matrix from scratch</li>
                    <li>Bring the structure of a career's experience</li>
                    <li>Apply judgement to material calls</li>
                  </ul>
                </div>

                <div className="p29-comp-section">
                  <div className="p29-comp-section-label gap">What's missing</div>
                  <ul className="p29-comp-list">
                    <li>Engagement ends — no operating discipline</li>
                    <li>Framework decays until the next refresh</li>
                  </ul>
                </div>

                <div className="p29-comp-footer">Builds · doesn't operate</div>
              </div>

              <div className="p29-comp-col p29 reveal" data-d="3">
                <div className="p29-comp-category">P29</div>
                <h3 className="p29-comp-title serif">The First Provision 29 Product</h3>
                <p className="p29-comp-tagline">Builds the framework. And then runs it.</p>

                <div className="p29-comp-section">
                  <div className="p29-comp-section-label both">What it does</div>
                  <ul className="p29-comp-list">
                    <li>Practitioner's structure built into the platform</li>
                    <li>AI prepares the framework from your industry-specific answers</li>
                    <li>Operating discipline applied every quarter, every year</li>
                    <li>Expert tier includes a practitioner on call</li>
                  </ul>
                </div>

                <div className="p29-comp-section">
                  <div className="p29-comp-section-label both">What it replaces</div>
                  <ul className="p29-comp-list">
                    <li>Two procurement lines — software and advisory</li>
                    <li>The annual refresh engagement</li>
                  </ul>
                </div>

                <div className="p29-comp-footer">Builds &middot; Operates &middot; Maintains</div>
              </div>
            </div>
          </div>
        </section>

        <section className="p29-founder">
          <div className="p29-founder-inner">
            <div className="p29-founder-quote serif reveal">
              A consultant's value was never the framework. It was the <em>structure</em> behind it — built over a career, drawn on a whiteboard at the start of every engagement. P29 puts that structure in the platform. The six months disappear because the structure was already there — and the framework keeps running because the platform stays.
            </div>
            <div className="p29-founder-attribution reveal" data-d="1">
              <div>
                <div className="p29-founder-name serif">Faheem Piracha</div>
                <div className="p29-founder-role">
                  Founder, P29
                  <span>·</span>
                  15 years internal control
                  <span>·</span>
                  Ex-BHP Billiton, Ex-Telenor
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="p29-pricing p29-section" id="pricing">
          <div className="p29-container">
            <div className="p29-eyebrow reveal">Pricing</div>
            <h2 className="p29-section-title reveal" data-d="1">
              Three tiers. <em>Annual billing.</em>
            </h2>
            <p className="p29-pricing-context reveal" data-d="2">
              Professional gives you the full platform. Expert adds a practitioner on call — five hours of calls or ten questions every month, built into the licence. Pick by whether you want that second pair of eyes.
            </p>

            <div className="p29-pricing-grid p29-pricing-grid-3">
              <div className="p29-tier reveal">
                <div className="p29-tier-name serif">Trial</div>
                <div className="p29-tier-tag">30 days · Evaluation</div>
                <div className="p29-tier-price serif">Free</div>
                <div className="p29-tier-billing">No card required</div>
                <ul className="p29-tier-features">
                  <li>Single domain</li>
                  <li>Industry-specific questions</li>
                  <li>AI-prepared risk register</li>
                  <li>Sample quarterly report</li>
                  <li>Onboarding session</li>
                </ul>
                <button onClick={() => window.location.href = 'https://risk-tlmk.onrender.com/signup'} className="p29-tier-cta" style={{ cursor: 'pointer' }}>Start free trial</button>
              </div>

              <div className="p29-tier reveal" data-d="1">
                <div className="p29-tier-name serif">Professional</div>
                <div className="p29-tier-tag">The full platform</div>
                <div className="p29-tier-price serif">£399<small>/mo</small></div>
                <div className="p29-tier-billing">Billed annually · £4,788</div>
                <ul className="p29-tier-features">
                  <li>All six AI workflows</li>
                  <li>Principal risk register</li>
                  <li>Material control library</li>
                  <li>Quarterly board reports</li>
                  <li>Audit Committee workspace</li>
                  <li>Declaration builder</li>
                  <li>Standard support</li>
                </ul>
                <button onClick={() => window.location.href = 'https://risk-tlmk.onrender.com/signup'} className="p29-tier-cta" style={{ cursor: 'pointer' }}>Select Professional</button>
              </div>

              <div className="p29-tier featured reveal" data-d="2">
                <div className="p29-tier-name serif">Expert</div>
                <div className="p29-tier-tag">Professional + a practitioner on call</div>
                <div className="p29-tier-price serif">£699<small>/mo</small></div>
                <div className="p29-tier-billing">Billed annually · £8,388</div>
                <ul className="p29-tier-features">
                  <li>Everything in Professional</li>
                  <li className="expert-line">5 hours of expert calls per month</li>
                  <li className="expert-line">or 10 written questions per month</li>
                  <li className="expert-line">Pre-board declaration review</li>
                  <li className="expert-line">Audit Committee preparation</li>
                  <li>Priority support</li>
                </ul>
                <button onClick={() => window.location.href = 'https://risk-tlmk.onrender.com/signup'} className="p29-tier-cta" style={{ cursor: 'pointer' }}>Select Expert</button>
              </div>
            </div>

            <div className="p29-pricing-note reveal" data-d="3">
              <span className="badge">The difference</span>
              <span>Both paid tiers <strong>build the framework and operate it</strong> — the structure, the AI workflows, the quarterly cadence, the year-end review. The only difference is whether a practitioner is on call. <strong>Choose Expert</strong> if your board wants a second pair of eyes on the calls that matter.</span>
            </div>
          </div>
        </section>

        <section className="p29-final-cta" id="signup">
          <div className="p29-final-cta-inner">
            <div>
              <div className="p29-eyebrow reveal">Begin</div>
              <h2 className="reveal" data-d="1">
                Answer the first<br />
                questions. <em>See the framework take shape.</em>
              </h2>
              <p className="p29-final-cta-text reveal" data-d="2">
                The free trial gives you the full structure, the industry-specific question set for one domain, and an AI-prepared risk register against your answers. No card. No discovery call. No partner introductions.
              </p>
            </div>
            <div className="reveal" data-d="3" style={{ display: 'none' }}>
              <button
                onClick={() => window.location.href = 'https://risk-tlmk.onrender.com/signup'}
                className="p29-btn-primary"
                style={{ fontSize: '16px', padding: '20px 48px' }}
              >
                Start free trial <span className="arrow">→</span>
              </button>
            </div>
          </div>
        </section>

        <footer className="p29-footer">
          <div className="p29-footer-inner">
            <div className="p29-footer-top">
              <div>
                <div className="p29-footer-brand">P<span>29</span></div>
                <p className="p29-footer-desc">Provision 29 compliance without consultants. A practitioner's structure. Industry-specific questions. AI does the work. You decide. An expert when you need one.</p>
              </div>
              <div className="p29-footer-col">
                <h4>Platform</h4>
                <a href="#how">How it works</a>
                <a href="#workflows">Workflows</a>
                <a href="#pricing">Pricing</a>
                <a href="#signup">Free trial</a>
              </div>
              <div className="p29-footer-col">
                <h4>Resources</h4>
                <a href="#">Readiness Report</a>
                <a href="#">Provision 29 brief</a>
                <a href="#">For Audit Committees</a>
                <a href="#">Implementation guide</a>
              </div>
              <div className="p29-footer-col">
                <h4>Contact</h4>
                <a href="https://p29.co.uk">p29.co.uk</a>
                <a href="#">LinkedIn</a>
                <a href="#">Book a walkthrough</a>
              </div>
            </div>
            <div className="p29-footer-bottom">
              <div>© 2026 P29. All rights reserved.</div>
              <div><span style={{ color: 'var(--gold)' }}>·</span> &nbsp;Built for FTSE 250 boards. United Kingdom.</div>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
