const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../assets/locales');
const languages = ['en', 'es'];

async function verifyI18n() {
    console.log('🔍 Verifying i18n Locale Files...');

    const contents = {};

    for (const lang of languages) {
        const filePath = path.join(localesDir, `${lang}.json`);
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Missing locale file: ${lang}.json`);
            process.exit(1);
        }

        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            contents[lang] = data;
            console.log(`✅ ${lang}.json is valid JSON.`);
        } catch (error) {
            console.error(`❌ Error parsing ${lang}.json:`, error.message);
            process.exit(1);
        }
    }

    // Check key consistency (optional but recommended)
    const enKeys = Object.keys(contents.en);
    const esKeys = Object.keys(contents.es);

    if (JSON.stringify(enKeys) === JSON.stringify(esKeys)) {
        console.log('✅ Top-level key consistency verified across all languages.');
    } else {
        console.warn('⚠️ Top-level keys do not match across all languages.');
        console.log('en keys:', enKeys);
        console.log('es keys:', esKeys);
    }

    console.log('🎉 i18n structure looks good!');
}

verifyI18n();
