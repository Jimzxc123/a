(() => {
    'use strict';

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const root = document.documentElement;
    const matrixTheme = {
        '--bg-primary': '#0a0a0a',
        '--bg-secondary': '#121212',
        '--text-main': '#e0e0e0',
        '--accent-green': '#00ff66',
        '--accent-dim': '#003b1a'
    };

    const updatePortfolioTheme = (variables = matrixTheme) => {
        window.requestAnimationFrame(() => {
            Object.entries(variables).forEach(([name, value]) => {
                root.style.setProperty(name, value);
            });
        });
    };

    const setupReveals = () => {
        const elements = document.querySelectorAll('.reveal');
        if (reducedMotion || !('IntersectionObserver' in window)) {
            elements.forEach((element) => element.classList.add('is-visible'));
            return;
        }

        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    currentObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });

        elements.forEach((element) => observer.observe(element));
    };

    const setupTyping = () => {
        const target = document.querySelector('.typing-text');
        if (!target || reducedMotion) return;

        const words = target.dataset.words?.split('|').filter(Boolean) ?? [];
        if (!words.length) return;

        if (window.gsap && window.TextPlugin) {
            window.gsap.registerPlugin(window.TextPlugin);
            target.textContent = '';

            const timeline = window.gsap.timeline({ repeat: -1, repeatDelay: 0.3 });
            words.forEach((word) => {
                timeline
                    .fromTo(target, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' })
                    .to(target, { text: word, duration: Math.max(0.9, word.length * 0.022), ease: 'none' })
                    .to(target, { scale: 1.015, duration: 0.3, yoyo: true, repeat: 1, ease: 'sine.inOut' })
                    .to(target, { text: '', duration: 0.35, ease: 'power1.in' })
                    .set(target, { opacity: 0, y: 8, scale: 1 });
            });
            return;
        }

        let wordIndex = 0;
        let characterIndex = 0;
        let deleting = false;

        const type = () => {
            const word = words[wordIndex];
            target.textContent = word.slice(0, characterIndex);

            if (!deleting && characterIndex < word.length) {
                characterIndex += 1;
                window.setTimeout(type, 24);
            } else if (!deleting) {
                deleting = true;
                window.setTimeout(type, 2100);
            } else if (characterIndex > 0) {
                characterIndex -= 1;
                window.setTimeout(type, 16);
            } else {
                deleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                window.setTimeout(type, 280);
            }
        };

        target.textContent = '';
        type();
    };

    const setupProjectFilters = () => {
        const filters = document.querySelectorAll('.filter-btn');
        const cards = document.querySelectorAll('.project-card[data-category]');
        if (!filters.length || !cards.length) return;

        filters.forEach((filter) => {
            filter.addEventListener('click', () => {
                const category = filter.dataset.filter;
                filters.forEach((button) => {
                    const active = button === filter;
                    button.classList.toggle('is-active', active);
                    button.setAttribute('aria-pressed', String(active));
                });
                cards.forEach((card) => {
                    card.hidden = category !== 'all' && !card.dataset.category.split(' ').includes(category);
                });
            });
        });
    };

    const setupNavigation = () => {
        const toggle = document.querySelector('.nav-toggle');
        const links = document.querySelector('.nav-links');
        if (!toggle || !links) return;

        const closeMenu = () => {
            links.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        };

        toggle.addEventListener('click', () => {
            const isOpen = links.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });

        links.addEventListener('click', (event) => {
            if (event.target.closest('a')) closeMenu();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth > 700) closeMenu();
        });
    };

    updatePortfolioTheme();
    window.updatePortfolioTheme = updatePortfolioTheme;
    setupReveals();
    setupTyping();
    setupProjectFilters();
    setupNavigation();
})();
