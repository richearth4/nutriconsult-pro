/**
 * Internationalization (i18n) Controller
 */
const I18nManager = {
    currentLang: localStorage.getItem('nutri_lang') || 'en',

    async init() {
        try {
            // Initialize i18next
            // Note: In a production app, we'd use i18next-http-backend. 
            // Here we fetch manually for simplicity in vanilla setup.
            const enRes = await fetch('assets/locales/en.json');
            const esRes = await fetch('assets/locales/es.json');

            const resources = {
                en: { translation: await enRes.json() },
                es: { translation: await esRes.json() }
            };

            await i18next.init({
                lng: this.currentLang,
                debug: false,
                resources
            });

            this.translatePage();
            this.updateLanguageSwitcher();
            console.log(`🌍 I18n Initialized: ${this.currentLang}`);
        } catch (error) {
            console.error('❌ I18n Initialization failed:', error);
        }
    },

    /**
     * Update all elements with data-i18n attribute
     */
    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            const options = el.getAttribute('data-i18n-options');

            let translation = i18next.t(key, options ? JSON.parse(options) : {});

            if (el.tagName === 'INPUT' && (el.type === 'text' || el.type === 'password' || el.type === 'email')) {
                el.placeholder = translation;
            } else {
                el.textContent = translation;
            }
        });
    },

    async changeLanguage(lang) {
        this.currentLang = lang;
        localStorage.setItem('nutri_lang', lang);
        await i18next.changeLanguage(lang);
        this.translatePage();
        this.updateLanguageSwitcher();
    },

    updateLanguageSwitcher() {
        const btns = document.querySelectorAll('.lang-btn');
        btns.forEach(btn => {
            if (btn.getAttribute('data-lang') === this.currentLang) {
                btn.style.fontWeight = 'bold';
                btn.style.textDecoration = 'underline';
            } else {
                btn.style.fontWeight = 'normal';
                btn.style.textDecoration = 'none';
            }
        });
    }
};

// Export for global use
window.I18nManager = I18nManager;
