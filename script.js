(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── SCROLL PROGRESS ─────────────────────────── */
  const progressBar = $('#progressBar');
  const updateProgress = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progressBar) progressBar.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  /* Birthday age is computed from the profile date, so it stays current without a backend. */
  const profileAge = $('#profileAge');
  if (profileAge) {
    const today = new Date();
    let age = today.getFullYear() - 2006;
    if (today.getMonth() < 8 || (today.getMonth() === 8 && today.getDate() < 15)) age--;
    profileAge.textContent = String(age);
  }

  /* ── YEAR ────────────────────────────────────── */
  const yr = $('#year'); if (yr) yr.textContent = new Date().getFullYear();

  /* ── INTERSECTION REVEALS ────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* Section transitions: softly wake each section as it enters the viewport. */
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('section-in-view');
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('main > section[id]').forEach(section => sectionObserver.observe(section));

  /* Profile reactions are intentionally client-side only; nothing is sent or stored. */
  const likeButton = $('#profileLike');
  likeButton?.addEventListener('click', () => {
    const liked = likeButton.getAttribute('aria-pressed') !== 'true';
    likeButton.setAttribute('aria-pressed', String(liked));
    likeButton.classList.toggle('is-active', liked);
    likeButton.setAttribute('aria-label', liked ? 'Unlike profile' : 'Like profile');
  });
  const repostButton = $('#profileRepost');
  repostButton?.addEventListener('click', () => {
    const reposted = repostButton.getAttribute('aria-pressed') !== 'true';
    repostButton.setAttribute('aria-pressed', String(reposted));
    repostButton.classList.toggle('is-active', reposted);
    repostButton.setAttribute('aria-label', reposted ? 'Remove profile boost' : 'Repost profile');
  });
  const commentButton = $('#profileComment'), profileNote = $('#profileNote');
  commentButton?.addEventListener('click', () => {
    const expanded = commentButton.getAttribute('aria-expanded') !== 'true';
    commentButton.setAttribute('aria-expanded', String(expanded));
    profileNote.hidden = !expanded;
    if (expanded) profileNote.querySelector('a')?.focus();
  });
  profileNote?.querySelector('a')?.addEventListener('click', () => {
    profileNote.hidden = true;
    commentButton?.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && profileNote && !profileNote.hidden) {
      profileNote.hidden = true;
      commentButton?.setAttribute('aria-expanded', 'false');
      commentButton?.focus();
    }
  });

  /* ── MOBILE NAVIGATION ───────────────────────── */
  const menu = $('#mobileMenu'), nav = $('#navLinks');
  menu?.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  $$('#navLinks a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    menu?.setAttribute('aria-expanded', 'false');
  }));

  /* ── CUSTOM CURSOR ───────────────────────────── */
  const dot = $('.cursor-dot'), ring = $('.cursor-ring');
  if (window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
    });
    const follow = () => {
      rx += (mx - rx) * .15; ry += (my - ry) * .15;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(follow);
    };
    follow();
    $$('a,button,[data-tilt]').forEach(el => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });

    /* Magnetic buttons */
    $$('.magnetic').forEach(el => {
      el.addEventListener('mousemove', e => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .14;
        const y = (e.clientY - r.top - r.height / 2) * .14;
        el.style.transform = `translate(${x}px,${y}px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
  }

  /* ── CANVAS CONSTELLATION ────────────────────── */
  const canvas = $('#constellation'), ctx = canvas?.getContext('2d');
  if (ctx && !reduceMotion) {
    let w, h, dpr, points = [];
    const setup = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(70, Math.max(28, Math.floor(w * h / 22000)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - .5) * .12, vy: (Math.random() - .5) * .12,
        r: Math.random() * 1.4 + .3,
        hue: Math.random() > .5 ? 255 : 175  // violet or mint
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const col = p.hue === 255 ? 'rgba(148,66,40,.25)' : 'rgba(42,114,88,.20)';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = col; ctx.fill();
        for (let j = i + 1; j < points.length; j++) {
          const q = points[j], dx = p.x - q.x, dy = p.y - q.y, dist = Math.hypot(dx, dy);
          if (dist < 110) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            const alpha = (1 - dist / 110) * .04;
            ctx.strokeStyle = `rgba(148,66,40,${alpha})`;
            ctx.lineWidth = .7; ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    setup(); draw();
    window.addEventListener('resize', setup);
  }

  /* ── PERSPECTIVE TILT ────────────────────────── */
  if (window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
    $$('[data-tilt]').forEach(card => {
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - .5;
        const y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(1000px) rotateY(${x * 4}deg) rotateX(${-y * 4}deg)`;
      });
      card.addEventListener('mouseleave', () => card.style.transform = '');
    });
  }

  /* ── TEXT SCRAMBLE EFFECT ────────────────────── */
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
  function scrambleText(el, finalText, duration = 900) {
    if (reduceMotion) { el.textContent = finalText; return; }
    let start = null;
    const frame = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const revealedChars = Math.floor(progress * finalText.length);
      let result = '';
      for (let i = 0; i < finalText.length; i++) {
        if (i < revealedChars) {
          result += finalText[i];
        } else if (finalText[i] === ' ' || finalText[i] === '\n') {
          result += finalText[i];
        } else {
          result += chars[Math.floor(Math.random() * chars.length)];
        }
      }
      el.textContent = result;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = finalText;
    };
    requestAnimationFrame(frame);
  }

  /* Keep the hero eyebrow markup intact; scrambling textContent removed its decorative line. */
  /* The heading and surrounding motion provide the entrance animation without damaging the DOM. */

  /* Scramble on hover for section headings */
  if (!reduceMotion) {
    $$('.manifesto-label, .modal-kicker').forEach(el => {
      const orig = el.textContent;
      el.addEventListener('mouseenter', () => scrambleText(el, orig, 600));
    });
  }

  /* ── HERO WORD STAGGER REVEAL ────────────────── */
  if (!reduceMotion) {
    const h1 = $('h1.hero-h1') || $('.hero h1');
    if (h1) {
      h1.style.opacity = '0';
      setTimeout(() => {
        h1.style.opacity = '';
        h1.style.animation = 'heroReveal .9s var(--ease) forwards';
      }, 200);
    }
  }

  /* ── COUNTER ANIMATION ───────────────────────── */
  function animateCounter(el, target, duration = 1800) {
    if (reduceMotion) { el.textContent = target; return; }
    let start = null;
    const isPlus = String(target).includes('+');
    const num = parseInt(String(target).replace(/\D/g, ''));
    const suffix = String(target).replace(/[\d]/g, '');
    const frame = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * num) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
      else el.textContent = target;
    };
    requestAnimationFrame(frame);
  }

  // Observe number elements for counter animation
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const val = el.dataset.count;
        if (val) animateCounter(el, val);
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  $$('[data-count]').forEach(el => counterObs.observe(el));

  /* ── PROJECT FILTERS ─────────────────────────── */
  $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter-btn').forEach(b => b.classList.toggle('active', b === btn));
    const filter = btn.dataset.filter;
    $$('.project-row').forEach(row => {
      const show = filter === 'all' || row.dataset.category.split(' ').includes(filter);
      row.classList.toggle('is-hidden', !show);
    });
  }));

  /* ── PARALLAX ON SCROLL ──────────────────────── */
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    const parallaxEls = $$('[data-parallax]');
    const handleParallax = () => {
      parallaxEls.forEach(el => {
        const rate = parseFloat(el.dataset.parallax) || .1;
        const rect = el.getBoundingClientRect();
        const center = rect.top + rect.height / 2 - window.innerHeight / 2;
        el.style.transform = `translateY(${center * rate}px)`;
      });
    };
    window.addEventListener('scroll', handleParallax, { passive: true });
    handleParallax();
  }

  /* ── GRADIENT MESH MOUSE FOLLOW ──────────────── */
  if (!reduceMotion && window.matchMedia('(pointer:fine)').matches) {
    let gx = 50, gy = 50, tx = 50, ty = 50;
    document.addEventListener('mousemove', e => {
      tx = (e.clientX / innerWidth) * 100;
      ty = (e.clientY / innerHeight) * 100;
    });
    const lerp = (a, b, t) => a + (b - a) * t;
    const animMesh = () => {
      gx = lerp(gx, tx, .04); gy = lerp(gy, ty, .04);
      document.body.style.setProperty('--mx', gx.toFixed(1) + '%');
      document.body.style.setProperty('--my', gy.toFixed(1) + '%');
      requestAnimationFrame(animMesh);
    };
    animMesh();
  }

  /* ── CASE STUDIES ────────────────────────────── */
  const cases = {
    mypskd: {
      kicker: 'CASE STUDY / 01 · EDTECH',
      title: 'MyPSKD — Learning Management System',
      summary: 'An MVP LMS built around the real needs of administrators, teachers, and students. The emphasis is on connecting a mobile application to backend services and managed authentication/data.',
      columns: [
        ['THE PROBLEM SPACE', 'School workflows involve several distinct roles — admins, teachers, and students each interact with the same system in completely different ways. The project explores how a unified mobile system can bridge that gap.'],
        ['MY ROLE & APPROACH', 'Led full-stack development: Flutter/Dart for Android, Node.js/Express for the backend, Firebase Firestore and Authentication for data and user management.'],
        ['IMPLEMENTATION NOTES', 'The system includes role-based access (admin, teacher, student), attendance tracking, and course management — built as an MVP to test core workflows.'],
        ['WHAT I LEARNED', 'Connecting interface decisions to backend structure, thinking across user roles, and treating an MVP as a tool for learning rather than a finished product.']
      ],
      tech: ['Flutter', 'Dart', 'Node.js', 'Express', 'Firebase Firestore', 'Firebase Auth']
    },
    uccd: {
      kicker: 'CASE STUDY / 02 · WEB PLATFORM',
      title: 'UCCD — Student Hub Platform',
      summary: 'A web-based information system to centralize student organization activities, programs, and membership info in one cohesive platform.',
      columns: [
        ['THE PROBLEM SPACE', 'Campus opportunities are scattered across channels. This project gives students a single, well-designed front door to discover programs and student-organization info.'],
        ['MY ROLE & APPROACH', 'Lead developer in a team project. Coordinated both frontend (Next.js) and backend architecture, managed PR reviews, and kept the team aligned on technical decisions.'],
        ['TECHNICAL CONTEXT', 'Next.js, Bootstrap, Node.js, Express, Prisma, MongoDB, Figma for design, Cloudflare R2 for media storage.'],
        ['WHAT I LEARNED', 'Building within a team means balancing implementation, communication, and consistency. A useful platform depends on both its interface and the reliability of its content flows.']
      ],
      tech: ['Next.js', 'Bootstrap', 'Node.js', 'Express', 'Prisma', 'MongoDB', 'Figma', 'Cloudflare R2'],
      repo: 'https://github.com/aryaravapradana/UAS-Front-End-Kelompok-8'
    },
    tokoclone: {
      kicker: 'CASE STUDY / 03 · E-COMMERCE',
      title: 'Tokoclone',
      summary: 'A coursework e-commerce website exploring the structure and interaction patterns of a shopping platform — from product discovery to checkout flows.',
      columns: [
        ['THE PRODUCT SPACE', 'Online marketplaces combine discovery, product information, and purchase flows. This project explores those patterns at a manageable scope without overengineering.'],
        ['MY ROLE & APPROACH', 'Full-stack developer and lead. Used Laravel with Blade templating for the frontend, MySQL for persistence, and Git for team version control.'],
        ['TECHNICAL CONTEXT', 'The implementation includes product listing, cart management, and basic user authentication — all built with Laravel\'s MVC structure.'],
        ['WHAT I LEARNED', 'Decomposing a broad product category into smaller application flows, and why accurate scope documentation matters when presenting software.']
      ],
      tech: ['Laravel', 'PHP', 'MySQL', 'Blade', 'Git'],
      repo: 'https://github.com/aryaravapradana/uasbackend'
    },
    loyalty: {
      kicker: 'CASE STUDY / 04 · CUSTOMER EXPERIENCE',
      title: 'Mall Loyalty Member App',
      summary: 'A digital membership app concept for a mall environment — exploring how a mobile interface can make loyalty experiences more accessible to everyday customers.',
      columns: [
        ['THE PRODUCT SPACE', 'Mall loyalty programs often feel disconnected. This concept explores how a mobile app can surface relevant membership information and make everyday visits feel more rewarding.'],
        ['MY ROLE & APPROACH', 'Product thinking, UI concept design, and full-stack development. Framed around the member journey with attention to information architecture.'],
        ['SCOPE & DESIGN', 'The concept focuses on membership card access, activity discovery, and a clean navigation structure. Visual design emphasizes clarity and brand consistency.'],
        ['NEXT STEP', 'The project is being expanded with actual implementation details, repository access, and interaction prototypes to turn this concept into a fully evidenced case study.']
      ],
      tech: ['Mobile UI', 'Product design', 'Member experience', 'Digital loyalty']
    }
  };

  const modal = $('#caseModal'), modalContent = $('#modalContent');

  $$('.case-link').forEach(btn => btn.addEventListener('click', () => {
    const item = cases[btn.dataset.project];
    if (!item) return;
    modalContent.innerHTML = `
      <p class="modal-kicker">${item.kicker}</p>
      <h2 class="modal-title">${item.title}</h2>
      <p class="modal-summary">${item.summary}</p>
      <div class="modal-columns">
        ${item.columns.map(([h, b]) => `<div><h4>${h}</h4><p>${b}</p></div>`).join('')}
      </div>
      <div class="modal-tech">${item.tech.map(t => `<span>${t}</span>`).join('')}</div>
      ${item.repo ? `<p style="margin-top:26px"><a class="case-link" href="${item.repo}" target="_blank" rel="noreferrer">Open repository ↗</a></p>` : ''}
    `;
    modal.showModal();
    if (!reduceMotion) {
      modalContent.style.opacity = '0';
      modalContent.style.transform = 'translateY(16px)';
      requestAnimationFrame(() => {
        modalContent.style.transition = 'opacity .4s var(--ease), transform .4s var(--ease)';
        modalContent.style.opacity = '1';
        modalContent.style.transform = 'translateY(0)';
      });
    }
  }));

  $('#modalClose')?.addEventListener('click', () => modal.close());
  modal?.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && modal?.open) modal.close(); });

  /* ── EMAIL COPY & TOAST ──────────────────────── */
  const toast = $('#toast');
  let toastTimer;
  $('#copyEmail')?.addEventListener('click', async () => {
    const email = $('#copyEmail').dataset.email;
    if (!email || email.includes('example.com')) {
      toast.textContent = 'UPDATE YOUR EMAIL IN index.html FIRST';
      toast.classList.add('show');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
      return;
    }
    try { await navigator.clipboard.writeText(email); }
    catch {
      const el = document.createElement('textarea');
      el.value = email; document.body.appendChild(el);
      el.select(); document.execCommand('copy'); el.remove();
    }
    toast.textContent = 'EMAIL COPIED ✓';
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
  });

  /* ── ACTIVE NAV HIGHLIGHT ON SCROLL ──────────── */
  const sections = $$('section[id]');
  const navLinks = $$('.nav-links a');
  const activeObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(a => {
          a.style.color = a.getAttribute('href') === `#${id}` ? 'var(--ink)' : '';
        });
      }
    });
  }, { threshold: 0.3 });
  sections.forEach(s => activeObs.observe(s));

  /* ── CAPABILITY CARD ICON GLOW ON HOVER ──────── */
  $$('.capability-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const icon = card.querySelector('.cap-icon');
      if (icon) icon.style.boxShadow = '0 0 28px currentColor';
    });
    card.addEventListener('mouseleave', () => {
      const icon = card.querySelector('.cap-icon');
      if (icon) icon.style.boxShadow = '';
    });
  });

  /* ── SCROLL-TRIGGERED HEADER SHRINK ──────────── */
  const header = $('.site-header');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 80) {
      header?.classList.add('shrunk');
    } else {
      header?.classList.remove('shrunk');
    }
    lastScroll = y;
  }, { passive: true });


  /* ── PERSONAL ROLE TYPING ROTATION ─────────────────────── */
  const roleTarget = $('#typingRole');
  if (roleTarget) {
    const roles = [
      'Informatics student',
      'developer',
      'technical mentor',
      'full-stack builder',
      'mobile app developer',
      'product-minded engineer'
    ];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      roleTarget.textContent = roles[0];
    } else {
      let roleIndex = 0;
      let charIndex = roles[0].length;
      let deleting = true;
      roleTarget.textContent = roles[0];
      const typeNextRole = () => {
        const word = roles[roleIndex];
        if (deleting) {
          charIndex = Math.max(0, charIndex - 1);
          roleTarget.textContent = word.slice(0, charIndex);
          if (charIndex === 0) {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            window.setTimeout(typeNextRole, 280);
            return;
          }
          window.setTimeout(typeNextRole, 42);
        } else {
          const nextWord = roles[roleIndex];
          charIndex = Math.min(nextWord.length, charIndex + 1);
          roleTarget.textContent = nextWord.slice(0, charIndex);
          if (charIndex === nextWord.length) {
            deleting = true;
            window.setTimeout(typeNextRole, 1450);
            return;
          }
          window.setTimeout(typeNextRole, 68);
        }
      };
      window.setTimeout(typeNextRole, 1700);
    }
  }

})();
