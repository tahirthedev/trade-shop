'use client';

import { useTranslation } from '@/context/LanguageContext';

export function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">🔧 Trade Shop</h3>
            <p className="text-gray-400">
              {t('footer.tagline')}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.company')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/marketplace" className="hover:text-white transition-colors">{t('nav.marketplace')}</a></li>
              <li><a href="/subscription" className="hover:text-white transition-colors">{t('nav.subscription')}</a></li>
              <li><a href="/login" className="hover:text-white transition-colors">{t('home.hero.getStarted')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.support')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.helpCenter')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.safety')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.contact')}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.about')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Trade Shop. {t('footer.rights')}</p>
        </div>
      </div>
    </footer>
  );
}
