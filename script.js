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
  if (dot && ring && window.matchMedia('(pointer:fine)').matches && !reduceMotion) {
    document.body.classList.add('has-custom-cursor');
    const portrait = $('.hero-portrait');
    portrait?.addEventListener('mouseenter', () => ring.classList.add('quiet'));
    portrait?.addEventListener('mouseleave', () => ring.classList.remove('quiet'));
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
  const counterFrames = new WeakMap();
  function animateCounter(el, target, duration = 2200) {
    const previousFrame = counterFrames.get(el);
    if (previousFrame) cancelAnimationFrame(previousFrame);
    if (reduceMotion) { el.textContent = target; return; }
    let start = null;
    const num = parseInt(String(target).replace(/\D/g, ''));
    const suffix = String(target).replace(/[\d]/g, '');
    const compactThousands = el.dataset.countCompact === 'true';
    const formatCount = current => {
      if (!compactThousands) return `${current}${suffix}`;
      return `${current < 1000 ? '0' : Math.floor(current / 1000)}${current < 1000 ? '' : 'k'}${suffix}`;
    };
    el.textContent = formatCount(0);
    const frame = ts => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * num);
      el.textContent = formatCount(current);
      if (progress < 1) counterFrames.set(el, requestAnimationFrame(frame));
      else {
        counterFrames.delete(el);
        el.textContent = formatCount(num);
      }
    };
    counterFrames.set(el, requestAnimationFrame(frame));
  }

  // Replay the counters every time the About chapter re-enters the viewport.
  const aboutSection = document.querySelector('#about');
  const aboutCounters = $$('[data-count]', aboutSection || document);
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        aboutCounters.forEach(el => {
          const val = el.dataset.count;
          if (val) animateCounter(el, val);
        });
      }
    });
  }, { threshold: 0.25 });
  if (aboutSection) counterObs.observe(aboutSection);

  // Experience image tours autoplay every three seconds and support arrows.
  $$('[data-gallery-images]').forEach(stage => {
    const first = stage.querySelector('img');
    if (!first) return;
    const sources = [first.getAttribute('src'), ...stage.dataset.galleryImages.split('|')].filter(Boolean);
    if (sources.length < 2) return;
    sources.forEach(src => { const preload = new Image(); preload.src = src; });

    let front = first;
    let back = first.cloneNode(false);
    back.alt = '';
    back.setAttribute('aria-hidden', 'true');
    back.className = 'experience-slide experience-slide-back';
    front.classList.add('experience-slide', 'is-visible');
    stage.append(back);

    let index = 0;
    let timer = 0;
    let busy = false;
    let progressFrame = 0;
    let swapTimer = 0;
    let generation = 0;
    let touchStartX = 0;
    const intervalMs = 3000;
    const counter = $('.experience-gallery-count', stage);
    const timerBar = $('.experience-gallery-timer i', stage);
    const resetProgress = () => {
      cancelAnimationFrame(progressFrame);
      timerBar.style.transition = 'none';
      timerBar.style.width = '0%';
      void timerBar.offsetWidth;
      progressFrame = requestAnimationFrame(() => {
        timerBar.style.transition = `width ${intervalMs}ms linear`;
        timerBar.style.width = '100%';
      });
    };
    const changeSlide = (delta, manual = false) => {
      if (busy) return;
      busy = true;
      const thisGeneration = ++generation;
      index = (index + delta + sources.length) % sources.length;
      if (counter) counter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(sources.length).padStart(2, '0')}`;
      resetProgress();
      if (manual && timer) {
        window.clearInterval(timer);
        timer = window.setInterval(() => changeSlide(1), intervalMs);
      }
      clearTimeout(swapTimer);
      let imageReady = false;
      const onReady = () => {
        if (thisGeneration !== generation || imageReady) return;
        imageReady = true;
        back.classList.add('is-visible');
        front.classList.remove('is-visible');
        swapTimer = window.setTimeout(() => {
          const previous = front;
          front = back;
          back = previous;
          back.onload = null;
          back.classList.remove('is-visible');
          busy = false;
        }, 560);
      };
      back.onload = onReady;
      back.onerror = () => { if (thisGeneration === generation) busy = false; };
      back.src = sources[index];
      if (back.complete && back.naturalWidth) onReady();
    };
    const startTimer = () => {
      if (timer) return;
      resetProgress();
      timer = window.setInterval(() => changeSlide(1), intervalMs);
    };
    const stopTimer = () => {
      window.clearInterval(timer);
      timer = 0;
      cancelAnimationFrame(progressFrame);
      timerBar.style.transition = 'none';
    };
    $$('[data-gallery-step]', stage).forEach(button => button.addEventListener('click', () => {
      changeSlide(Number(button.dataset.galleryStep), true);
    }));
    stage.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        changeSlide(event.key === 'ArrowRight' ? 1 : -1, true);
      }
    });
    stage.addEventListener('touchstart', event => { touchStartX = event.changedTouches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', event => {
      if (!touchStartX) return;
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) changeSlide(delta < 0 ? 1 : -1, true);
      touchStartX = 0;
    }, { passive: true });
    if ('IntersectionObserver' in window && !reduceMotion) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => entry.isIntersecting ? startTimer() : stopTimer());
      }, { threshold: 0.2 });
      observer.observe(stage);
    }
  });

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
      videoId: 'QHAEuwrLLTM',
      kicker: 'CASE STUDY / 01 · EDTECH',
      title: 'MyPSKD — Learning Management System',
      summary: 'An MVP LMS built around the real needs of administrators, teachers, and students. The emphasis is on connecting a mobile application to backend services and managed authentication/data.',
      columns: [
        ['THE CHALLENGE', 'School tasks were spread across three roles. MyPSKD brings admin, teacher, and student workflows into one learning platform.'],
        ['MY CONTRIBUTION', 'Led the full-stack build, from Flutter screens to Node.js APIs, Firebase data, and authentication.'],
        ['BUILT FOR REAL WORKFLOWS', 'Role-based access connects attendance, classes, and course management in one mobile experience.'],
        ['PROJECT HIGHLIGHT', 'Selected as the best project in the Software Development cohort.']
      ],
      tech: ['Flutter', 'Dart', 'Node.js', 'Express', 'Firebase Firestore', 'Firebase Auth']
    },
    uccd: {
      videoId: 'RsVeplNy_OA',
      kicker: 'CASE STUDY / 02 · WEB PLATFORM',
      title: 'UCCD — Student Hub Platform',
      summary: 'A web-based information system to centralize student organization activities, programs, and membership info in one cohesive platform.',
      columns: [
        ['THE CHALLENGE', 'Student programs and opportunities were scattered. UCCD gives them one place to discover what’s happening.'],
        ['MY CONTRIBUTION', 'Led development across the Next.js frontend and backend, while coordinating implementation with the team.'],
        ['THE EXPERIENCE', 'A student hub for exploring programs, community stories, bootcamps, and achievements.'],
        ['THE BUILD', 'Next.js, Express, Prisma, and MongoDB power the platform; Cloudflare R2 stores media.']
      ],
      tech: ['Next.js', 'Bootstrap', 'Node.js', 'Express', 'Prisma', 'MongoDB', 'Figma', 'Cloudflare R2'],
      repo: 'https://github.com/aryaravapradana/UAS-Front-End-Kelompok-8'
    },
    tokoclone: {
      videoId: 'OYcbU3299VQ',
      kicker: 'CASE STUDY / 03 · E-COMMERCE',
      title: 'Tokoclone',
      summary: 'A coursework e-commerce website exploring the structure and interaction patterns of a shopping platform — from product discovery to checkout flows.',
      columns: [
        ['THE IDEA', 'A marketplace-style shop that takes a customer from browsing products to checkout.'],
        ['MY CONTRIBUTION', 'Built the full-stack coursework project with Laravel, Blade, and MySQL.'],
        ['SHOPPING FLOW', 'Product discovery, cart management, and account sign-in form the core experience.'],
        ['UNDER THE HOOD', 'Laravel’s MVC structure keeps the storefront and its data flows organized.']
      ],
      tech: ['Laravel', 'PHP', 'MySQL', 'Blade', 'Git'],
      repo: 'https://github.com/aryaravapradana/uasbackend'
    },
    loyalty: {
      videoId: 'fFXGi2G_Evs',
      kicker: 'CASE STUDY / 04 · CUSTOMER EXPERIENCE',
      title: 'Mall Loyalty Member App',
      summary: 'A digital membership app concept for a mall environment — exploring how a mobile interface can make loyalty experiences more accessible to everyday customers.',
      columns: [
        ['THE OPPORTUNITY', 'Make mall membership feel useful beyond the checkout counter, right from a customer’s phone.'],
        ['MY CONTRIBUTION', 'Shaped the product concept, member journey, and mobile interface.'],
        ['MEMBER ESSENTIALS', 'Digital membership, points, offers, and activities sit within one simple app concept.'],
        ['DESIGN DIRECTION', 'A clear, tier-based experience makes benefits easier to find and understand.']
      ],
      tech: ['Flutter', 'Dart', 'Mobile UI', 'Product design', 'Member experience', 'Digital loyalty'],
      repo: 'https://github.com/aryaravapradana/mobproguts'
    }
  };

  const makeProjectSlides = (base, prefix, ext, total, name, features, platform = '', descriptions = []) =>
    Array.from({ length: total }, (_, index) => {
      const number = index + 1;
      const feature = features[index] || 'another step in the product experience';
      const title = typeof feature === 'string' ? feature : feature.title;
      const description = typeof feature === 'string' ? descriptions[index] : feature.description;
      const device = platform ? ` ${platform}` : '';
      return {
        src: `${base}/${prefix}${number}.${ext}`,
        alt: `${name}${device}: ${title}${description ? `. ${description}` : ''}`,
        caption: platform ? `${platform === 'web' ? 'Web' : 'Mobile'} · ${title}` : title,
        description: description || `A closer look at ${title.toLowerCase()} and the information or actions available in this part of ${name}.`,
        platform
      };
    });
  const promoteCoverSlide = (slides, coverPath, coverCaption) => {
    const index = slides.findIndex(slide => slide.src === coverPath);
    if (index < 0) return slides;
    const cover = {
      ...slides[index],
      alt: coverCaption || slides[index].alt,
      caption: coverCaption || slides[index].caption
    };
    return [cover, ...slides.slice(0, index), ...slides.slice(index + 1)];
  };

  const mypskdFeatures = [
    { title: 'School account sign-in', description: 'The entry screen for school accounts, with credential fields and a direct path into MyPSKD.' },
    { title: 'Admin profile', description: 'A profile view for checking the administrator identity, contact details, and account information.' },
    { title: 'Admin home dashboard', description: 'At-a-glance cards and a chart summarize school activity for the administrator.' },
    { title: 'Admin user directory', description: 'Search the user list and narrow it by role to find teacher and student accounts.' },
    { title: 'Add a user', description: 'The account form collects the details an admin needs to add a teacher or student.' },
    { title: 'Edit user details', description: 'Update account information from a structured form before saving the user record.' },
    { title: 'Review account changes', description: 'A confirmation dialog keeps account-management actions clear before they are applied.' },
    { title: 'Classroom chat', description: 'A shared class conversation gives teachers and students one place to exchange messages.' },
    { title: 'Chat and channel options', description: 'A focused dialog exposes the available controls for organizing a class conversation.' },
    { title: 'Class members', description: 'Review the people connected to a class before continuing with classroom coordination.' },
    { title: 'Create a class channel', description: 'Set up a separate discussion space so messages stay grouped by class topic.' },
    { title: 'Channel conversation', description: 'Topic-based messages stay together instead of getting mixed into the main class chat.' },
    { title: 'School announcements', description: 'An admin-facing list keeps school notices together and provides a route to create a new update.' },
    { title: 'Student account profile', description: 'A student can review personal account details and return to the main learning areas.' },
    { title: 'Teacher home dashboard', description: 'The teacher landing page brings class activity and teaching shortcuts into one overview.' },
    { title: 'Announcement management', description: 'Browse published notices and use the available controls to filter or prepare an update.' },
    { title: 'My classes', description: 'Students see their joined classes and the subject and teacher information for each one.' },
    { title: 'Join a class', description: 'Enter a class access code and submit a request to join a learning group.' },
    { title: 'Class dashboard', description: 'A selected class gathers its subject details and the next learning actions in one view.' },
    { title: 'Class activity state', description: 'This screen shows the current state of a class area before the student opens its content.' },
    { title: 'Class learning materials', description: 'Open resources shared for the selected subject and continue to the relevant lesson content.' },
    { title: 'Attendance history', description: 'A dated attendance record makes it easier to review presence status over time.' },
    { title: 'Assignment list', description: 'Assignments are grouped by class with status cues to help students find what needs attention.' },
    { title: 'Assignment response', description: 'The submission view gives students a place to review task instructions and prepare their response.' },
    { title: 'Submit work and attachments', description: 'Attach a response to the assigned task and review it before submitting to the teacher.' },
    { title: 'Student grades', description: 'A student-facing grade view groups scores with the relevant subject and teacher context.' },
    { title: 'Student profile and class status', description: 'Personal details and current class information are presented together for a quick account check.' },
    { title: 'Create a class', description: 'Admins can enter class details and generate a new learning space from this form.' },
    { title: 'Class workspace', description: 'The class view brings members, class details, and teaching actions into a single workspace.' },
    { title: 'Class content management', description: 'Review and organize the materials or activities assigned to a selected class.' },
    { title: 'Join requests', description: 'Teachers review student requests and control who can enter their class.' },
    { title: 'Task list', description: 'A structured task list helps students track assigned work and its current completion state.' },
    { title: 'Daily attendance', description: 'Teachers mark student attendance by status, replacing a separate manual class roll.' },
    { title: 'Attendance recap', description: 'A summary turns daily attendance records into an overview of class participation.' },
    { title: 'Attendance details', description: 'Inspect student attendance entries and update a record from the class register.' },
    { title: 'Class roster', description: 'A teacher can review the students connected to a class before managing class activities.' },
    { title: 'Payment and account records', description: 'This screen organizes individual records into a list that can be reviewed by the account holder.' },
    { title: 'Join a live meeting', description: 'Open the meeting service from MyPSKD and continue into a live class session.' },
    { title: 'Create learning material', description: 'Prepare a resource with a title and supporting information before sharing it with a class.' },
    { title: 'Material settings', description: 'Set up the details and options attached to a learning resource.' },
    { title: 'Question or task editor', description: 'The form gives teachers a structured way to prepare learning content for students.' },
    { title: 'Assessment form', description: 'Review the assessment fields and question structure before publishing the activity.' },
    { title: 'Lesson with embedded media', description: 'A lesson page combines written context with an embedded learning video.' },
    { title: 'Student assessment', description: 'Students can read the prompt, choose or enter a response, and prepare it for submission.' },
    { title: 'Review a class task', description: 'The teacher view gathers task information and student work for review.' },
    { title: 'Embedded lesson video', description: 'A classroom page combines lesson context and a video player so students can follow the learning material in one place.' },
    { title: 'Lesson media and resources', description: 'The lesson view keeps learning media beside the related course information and supporting resources.' },
    { title: 'Account registration', description: 'New users enter their details to create a MyPSKD school account.' },
    { title: 'Class and assignment details', description: 'A detail view presents the selected activity and the next action available to the student.' },
    { title: 'Assessment submitted', description: 'A completion state confirms that the student has finished the assessment flow.' },
    { title: 'Notifications', description: 'Recent school and class updates are collected in one place for the student.' },
    { title: 'Class discussion', description: 'Messages and replies stay attached to the selected class topic for easier follow-up.' },
    { title: 'Learning progress summary', description: 'A visual summary helps students review scores and progress across learning activities.' },
    { title: 'Resource details', description: 'Open a shared learning resource and review its supporting description or media.' },
    { title: 'Video resource', description: 'A course resource page pairs lesson media with the related learning information.' },
    { title: 'Live meeting room', description: 'Participants appear together in the active MyPSKD meeting session.' }
  ];
  const mypskdWebSlides = makeProjectSlides('assets/project/MyPSKD/Web', 'wps', 'jpeg', 56, 'MyPSKD', mypskdFeatures, 'web');
  const mypskdMobileSlides = makeProjectSlides('assets/project/MyPSKD/Mobile', 'mps', 'jpeg', 56, 'MyPSKD', mypskdFeatures, 'mobile');
  const mypskdSlideGroups = {
    all: mypskdWebSlides.flatMap((webSlide, index) => [webSlide, mypskdMobileSlides[index]]),
    web: mypskdWebSlides,
    mobile: mypskdMobileSlides
  };
  const projectSlideGroups = { mypskd: mypskdSlideGroups };
  const projectSlides = {
    mypskd: mypskdSlideGroups.all,
    uccd: promoteCoverSlide(makeProjectSlides('assets/project/UCCD', 'uccd', 'png', 25, 'UCCD', [
      'Member sign-in and account access', 'Create a UCCD account', 'Student hub and program overview',
      'UCCD landing page: where ideas meet inspiration', 'UCCD Talks and speaker feature', 'Community stories and collaboration',
      'Reasons to join the UCCD community', 'UCCD × Nexa AI collaboration feature', 'Explore programs and student opportunities',
      'Bootcamps, talks, and achievement categories', 'About UCCD and its community', 'Why students should join',
      'Opportunity list and program cards', 'Scholarship opportunity detail', 'Achievement and event highlights',
      'UCCD Glory feature story', 'Hall of achievements', 'Learning experience and skill development',
      'Bootcamp information and learning path', 'Bootcamp benefits and student support', 'Choose a learning track',
      'Track selection and program details', 'Admin dashboard and member management',
      'Achievement showcase and recognition', 'Member profile and personal dashboard'
    ], '', [
      'Members sign in with their campus account to reach UCCD programs and their personal dashboard.',
      'New members submit their details to create an account and join the UCCD platform.',
      'A single hub introduces UCCD and points members toward its programs and community.',
      'The landing page gives students a clear starting point for exploring UCCD activities.',
      'Talks highlights upcoming seminars and speakers, with details for students deciding what to attend.',
      'Community stories show the people and activities behind the student organization.',
      'This section explains what UCCD offers and how its programs support student development.',
      'A collaboration feature introduces a joint program and links it to UCCD’s broader student community.',
      'Browse available programs and opportunities without searching across separate announcement channels.',
      'Program categories group bootcamps, talks, and achievements so members can find the right activity.',
      'An introduction to UCCD explains the organization and its role at FTI UNTAR.',
      'A concise overview helps prospective members understand why they might join UCCD.',
      'The opportunity list gathers competition and scholarship information in one browsable view.',
      'A scholarship detail view presents the opportunity information students need before applying.',
      'Selected activities and achievements give visitors a quick look at UCCD member outcomes.',
      'A Glory story documents a member achievement and gives it a dedicated place in the platform.',
      'The Glory section collects member achievements into a browsable hall of recognition.',
      'Learning content introduces development activities available to FTI students.',
      'Bootcamp details outline the learning path and information for students considering registration.',
      'This view explains what a bootcamp includes and the support available to participants.',
      'Students can compare and choose a learning track that matches their interests.',
      'Track details expand on the selected program so students can review it before registering.',
      'The admin dashboard summarizes organization data and links to member and program management.',
      'A recognition view presents member accomplishments and competition results.',
      'The member dashboard keeps profile information and program registration status together.'
    ]), 'assets/project/UCCD/uccd4.png'),
    tokoclone: promoteCoverSlide(makeProjectSlides('assets/project/Tokoclone', 'Toko', 'png', 25, 'Tokoclone', [
      'Welcome screen and return to shopping', 'Customer sign-in form', 'Product catalogue and featured items',
      'Checkout form and order summary', 'Successful payment confirmation', 'Product detail and purchase options',
      'Browse products by category', 'Order history and purchase status', 'Unavailable page and recovery path',
      'Online shop home and product grid', 'Food and grocery category', 'Electronics and device category',
      'Search results and product discovery', 'Home and kitchen product listings', 'Fashion and clothing products',
      'Health product detail and information', 'Personal care catalogue', 'Clothing product catalogue',
      'Apparel products and prices', 'Footwear catalogue', 'Accessories and daily essentials',
      'Jewellery product listings', 'Home appliance catalogue', 'Grocery and pantry products',
      'Beauty and personal care catalogue'
    ], '', [
      'The welcome view gives shoppers a route back into the store and its product catalogue.',
      'Existing customers enter their account credentials to continue to the shopping experience.',
      'Featured products give shoppers a quick starting point before browsing the full catalogue.',
      'Review delivery and order information before continuing through the checkout flow.',
      'A confirmation state shows that the checkout flow has completed successfully.',
      'Product details bring item information and purchase actions together on one page.',
      'Category navigation narrows the catalogue to the type of products the shopper wants.',
      'The order history lets customers review earlier purchases and their current status.',
      'An unavailable page explains that the requested destination cannot be opened and offers a way back.',
      'The store homepage combines navigation, search, and product cards for browsing.',
      'Browse food and grocery items grouped into a dedicated product category.',
      'An electronics category makes devices easier to scan and compare.',
      'Search results surface products matching the shopper’s query.',
      'Home and kitchen listings group household products in one catalogue view.',
      'Fashion listings let shoppers scan clothing items and product prices.',
      'A health product page presents item details before the shopper adds it to an order.',
      'Personal care items are grouped into a focused product catalogue.',
      'Clothing products appear in a category view for quick browsing.',
      'Compare apparel options and prices from the product listing.',
      'A footwear category organizes available shoes for browsing.',
      'Everyday accessories are grouped together for easier product discovery.',
      'Jewellery listings provide a dedicated view of the available items.',
      'Browse home appliances from a category-specific product list.',
      'Grocery and pantry products appear together in their own category.',
      'Beauty and personal care items are organized into a dedicated catalogue.'
    ]), 'assets/project/Tokoclone/Toko10.png'),
    loyalty: promoteCoverSlide(makeProjectSlides('assets/project/LoyaltyMember', 'Loyalty', 'png', 23, 'Mall Loyalty Member App', [
      'Membership tier details and benefits', 'Discover member vouchers and promotions', 'Voucher details and redemption offer',
      'Membership status and account benefits', 'Member home dashboard and offers', 'Explore membership features',
      'Create a member account', 'Welcome to the membership app', 'Scan a store QR code',
      'Points successfully added to the account', 'Digital member card and tier status', 'Account menu and membership options',
      'Personal membership QR code', 'Successful voucher redemption', 'Membership terms and conditions',
      'Member notifications and updates', 'Bronze tier benefits', 'Silver tier benefits', 'Gold tier benefits',
      'Platinum tier benefits', 'Points balance and activity summary', 'Available vouchers and QR redemption',
      'Voucher wallet and saved offers'
    ], '', [
      'Compare the benefits attached to each membership tier and see what unlocks at the next level.',
      'Browse current vouchers and promotions available to members.',
      'Review a voucher’s offer and redemption details before using points to claim it.',
      'The account view shows a member’s current status and loyalty benefits.',
      'The home dashboard summarizes points, tier status, and featured rewards.',
      'A guided overview introduces the main membership features and available actions.',
      'New members enter account details to create a loyalty profile.',
      'A welcome screen introduces the member app before sign-in or registration.',
      'Scan a store QR code as part of a member transaction or points activity.',
      'A success state confirms that points have been added to the member account.',
      'The digital member card presents the customer’s identity and current tier.',
      'Account navigation provides access to personal settings and membership pages.',
      'Show a personal membership QR code for identification in participating stores.',
      'A confirmation screen closes the voucher redemption flow.',
      'Review the conditions that apply to the membership program.',
      'Recent account notices and loyalty updates are collected in one view.',
      'Bronze tier details explain its benefits and progress requirements.',
      'Silver tier details show the benefits available at this membership level.',
      'Gold tier information presents the rewards attached to the level.',
      'Platinum tier details show the benefits available to higher-tier members.',
      'The points page combines the current balance with recent point activity.',
      'Available rewards can be reviewed and redeemed through the voucher flow.',
      'The voucher wallet keeps claimed offers available with their redemption information.'
    ]), 'assets/project/LoyaltyMember/Loyalty5.png')
  };

  const projectPage = $('#projectPage');
  let galleryTimer = null;
  let activeSlides = [];
  let activeSlide = 0;
  let activeProject = '';
  let activeGalleryFilter = 'all';
  const clearGalleryTimer = () => {
    if (galleryTimer !== null) window.clearTimeout(galleryTimer);
    galleryTimer = null;
  };

  const routeProject = new URLSearchParams(location.search).get('project');
  const activeItem = cases[routeProject];
  if (activeItem && projectPage) {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    document.documentElement.style.scrollBehavior = 'auto';
    activeProject = routeProject;
    activeSlides = projectSlideGroups[activeProject]?.all || projectSlides[activeProject] || [];
    activeSlide = 0;
    document.body.classList.add('project-view');
    projectPage.hidden = false;
    document.title = `${activeItem.title} — Francesco Alexander`;
    projectPage.innerHTML = `
      <div class="project-page-shell">
        <a class="project-page-back" href="index.html#work"><span aria-hidden="true">←</span> All projects</a>
        <header class="project-page-heading"><p class="mono project-page-kicker">${activeItem.kicker}</p><h1>${activeItem.title}</h1><p>${activeItem.summary}</p></header>
        <section class="project-page-gallery" aria-label="Project screenshots">
          <div class="gallery-heading"><span class="mono">SCREEN TOUR</span><span class="gallery-counter mono" id="galleryCounter"></span></div>
          ${projectSlideGroups[activeProject] ? `<div class="gallery-filters" role="group" aria-label="Filter MyPSKD screenshots"><button class="gallery-filter-btn active" type="button" data-gallery-filter="all" aria-pressed="true">All views <span>112</span></button><button class="gallery-filter-btn" type="button" data-gallery-filter="web" aria-pressed="false">Web <span>56</span></button><button class="gallery-filter-btn" type="button" data-gallery-filter="mobile" aria-pressed="false">HP <span>56</span></button></div>` : ''}
          <div class="gallery-stage" id="galleryStage"><img class="gallery-image" id="galleryImage" alt=""></div>
          <div class="gallery-controls"><button class="gallery-arrow" id="galleryPrevious" type="button" aria-label="Previous screenshot">←</button><div class="gallery-caption" id="galleryCaption" aria-live="polite"><span class="gallery-caption-title"></span><span class="gallery-caption-detail"></span></div><button class="gallery-arrow" id="galleryNext" type="button" aria-label="Next screenshot">→</button></div>
          <div class="gallery-timer" aria-hidden="true"><span id="galleryTimerBar"></span></div><p class="gallery-hint mono">AUTO-ADVANCES EVERY 5 SECONDS · USE ← → TO BROWSE</p>
        </section>
        <div class="project-page-lower">
          <section class="case-video"><div class="case-video-heading"><span class="mono">PROJECT DEMO</span><span class="video-live-dot" aria-hidden="true"></span></div><div class="video-frame"><iframe src="https://www.youtube-nocookie.com/embed/${activeItem.videoId}?rel=0" title="${activeItem.title} project demo" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div></section>
          <section class="project-page-story"><div class="project-page-columns">${activeItem.columns.map(([h, b]) => `<article><h2>${h}</h2><p>${b}</p></article>`).join('')}</div><div class="modal-tech">${activeItem.tech.map(t => `<span>${t}</span>`).join('')}</div>${activeItem.repo ? `<a class="project-page-repo" href="${activeItem.repo}" target="_blank" rel="noreferrer">View source code <span>↗</span></a>` : ''}</section>
        </div>
      </div>`;
    requestAnimationFrame(() => {
      window.scrollTo(0, 0);
      requestAnimationFrame(() => window.scrollTo(0, 0));
    });
    const galleryImage = $('#galleryImage', projectPage);
    const galleryCaption = $('#galleryCaption', projectPage);
    const galleryCaptionTitle = $('.gallery-caption-title', projectPage);
    const galleryCaptionDetail = $('.gallery-caption-detail', projectPage);
    const galleryCounter = $('#galleryCounter', projectPage);
    const timerBar = $('#galleryTimerBar', projectPage);
    const galleryStage = $('#galleryStage', projectPage);
    let fadeTimer;
    const renderSlide = () => {
      const slide = activeSlides[activeSlide];
      if (!slide) return;
      clearTimeout(fadeTimer);
      galleryImage.classList.remove('is-changing');
      galleryImage.src = slide.src;
      galleryImage.alt = slide.alt;
      galleryCaptionTitle.textContent = slide.caption;
      galleryCaptionDetail.textContent = slide.description;
      galleryStage.dataset.platform = slide.platform || 'desktop';
      galleryCounter.textContent = `${String(activeSlide + 1).padStart(2, '0')} / ${String(activeSlides.length).padStart(2, '0')}`;
      requestAnimationFrame(() => galleryImage.classList.add('is-changing'));
      fadeTimer = window.setTimeout(() => galleryImage.classList.remove('is-changing'), 420);
    };
    const restartGalleryTimer = () => {
      clearGalleryTimer(); timerBar.style.transition = 'none'; timerBar.style.width = '0%'; void timerBar.offsetWidth;
      requestAnimationFrame(() => { timerBar.style.transition = 'width 5s linear'; timerBar.style.width = '100%'; });
      galleryTimer = window.setTimeout(() => { activeSlide = (activeSlide + 1) % activeSlides.length; renderSlide(); restartGalleryTimer(); }, 5000);
    };
    const changeSlide = direction => { activeSlide = (activeSlide + direction + activeSlides.length) % activeSlides.length; renderSlide(); restartGalleryTimer(); };
    renderSlide(); restartGalleryTimer();
    $('#galleryPrevious', projectPage).addEventListener('click', () => changeSlide(-1));
    $('#galleryNext', projectPage).addEventListener('click', () => changeSlide(1));
    $$('.gallery-filter-btn', projectPage).forEach(button => button.addEventListener('click', () => {
      const filter = button.dataset.galleryFilter, slides = projectSlideGroups[activeProject]?.[filter];
      if (!slides || filter === activeGalleryFilter) return;
      activeGalleryFilter = filter; activeSlides = slides; activeSlide = 0;
      $$('.gallery-filter-btn', projectPage).forEach(candidate => { const selected = candidate === button; candidate.classList.toggle('active', selected); candidate.setAttribute('aria-pressed', String(selected)); });
      renderSlide(); restartGalleryTimer();
    }));
    let touchStartX = 0;
    galleryStage.addEventListener('pointerdown', event => { if (event.pointerType === 'touch') touchStartX = event.clientX; });
    galleryStage.addEventListener('pointerup', event => { if (event.pointerType !== 'touch' || !touchStartX) return; const delta = event.clientX - touchStartX; if (Math.abs(delta) > 45) changeSlide(delta < 0 ? 1 : -1); touchStartX = 0; });
    $$('.case-link[data-project]').forEach(button => button.addEventListener('click', () => { window.location.href = `index.html?project=${encodeURIComponent(button.dataset.project)}`; }));
    document.addEventListener('keydown', event => {
      if (event.target instanceof HTMLElement && /INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) return;
      if (event.key === 'ArrowRight') { event.preventDefault(); changeSlide(1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); changeSlide(-1); }
    });
  } else {
    $$('.case-link[data-project]').forEach(button => button.addEventListener('click', () => { window.location.href = `index.html?project=${encodeURIComponent(button.dataset.project)}`; }));
  }

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
