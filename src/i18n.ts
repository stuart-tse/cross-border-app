import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'zh-tw', 'zh-cn', 'ja', 'ko'] as const;
export const defaultLocale = 'en' as const;
export type Locale = typeof locales[number];

function isLocale(value: unknown): value is Locale {
    return typeof value === 'string' && (locales as readonly string[]).includes(value as Locale);
}

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!isLocale(locale)) {
      if (!isLocale(locale)) {
          notFound();
      }
  }


  try {
    const messages = (await import(`@/locales/${locale}.json`)).default;
    return {
      locale,
      messages,
      timeZone: 'Asia/Hong_Kong',
      now: new Date(),
      // Enable Next.js 15 optimizations
      formats: {
        dateTime: {
          short: {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }
        },
        number: {
          precise: {
            maximumFractionDigits: 2
          }
        }
      }
    };
  } catch (error) {
    console.error(`Failed to load messages for locale: ${locale}`, error);
    notFound();
  }
});