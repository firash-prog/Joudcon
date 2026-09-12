"use client";
import { useEffect, useState } from 'react';

export const adminDict = {
  en: {
    dashboard: 'Dashboard', home: 'Home Sections', projects: 'Projects', services: 'Services',
    media: 'Media Library', clients: 'Clients', testimonials: 'Testimonials', statistics: 'Statistics',
    process: 'Process Stages', workshop: 'Workshop', leads: 'Enquiries', branding: 'Branding', settings: 'Site Settings',
    signout: 'Sign out', adminCms: 'Admin CMS', add: '+ Add', edit: 'Edit', del: 'Delete', dup: 'Duplicate',
    save: 'Save Draft', publish: 'Publish', saving: 'Saving…', saved: 'Saved ✓', error: 'Error — retry',
    live: '● LIVE', draft: '○ DRAFT', archived: '○ ARCHIVED', search: 'Search…', selectMedia: 'Select media',
    upl: 'Upload files', copyUrl: 'Copy URL', editFile: 'Edit', noMedia: 'No media yet — upload from device.',
    email: 'Email', password: 'Password', signin: 'Sign In', contentMgmt: 'Content Management',
    invalidCred: 'Invalid credentials. Please try again.', langBtn: 'عربي', remove: 'Remove', replace: 'Replace',
    // dashboard
    draftProjects: 'Draft projects', mediaFiles: 'Media files', newEnq: 'New enquiries', unreadEnq: 'Unread enquiries',
    recentActivity: 'Recent activity', quickProject: '+ Quick add project', quickMedia: '↑ Upload media',
    viewSite: 'View website ↗', noActivity: 'No activity yet.',
    // leads
    all: 'All', exportCsv: 'Export CSV', stNew: 'New', stRead: 'Read', stInProgress: 'In progress',
    stCompleted: 'Completed', stSpam: 'Spam', downloadAtt: 'Download attachment ↓', internalNotes: 'Internal notes',
    notePh: 'Add a note…', addNote: 'Add', noEnq: 'No enquiries in this view.', guests: 'guests',
    // branding
    brandingDesc: 'Upload logos directly from your device — the public website uses these files immediately (within 60s cache).',
    slotPrimary: 'Primary logo (default)', slotDark: 'Dark-background logo', slotLight: 'Light-on-dark / Arabic logo',
    slotFav: 'Favicon', slotOg: 'Social share image (OG)', slotFooter: 'Footer logo (optional)',
    noFile: 'No file', saveBranding: 'Save branding', viewPage: 'View page ↗',
    // settings
    company: 'Company name', address: 'Address', emailsLbl: 'Emails (comma separated)',
    phonesLbl: 'Phones (comma separated)', whatsapp: 'WhatsApp', mapsLbl: 'Google Maps URL',
    hoursEnLbl: 'Working hours EN', hoursArLbl: 'Working hours AR', socialLbl: 'Social links (JSON)',
    saveSettings: 'Save settings',
    // home editor
    homeTitle: 'Home Page Sections', homeDesc: 'Edits go live on the homepage within 60 seconds.',
    hero: 'Hero', kicker: 'Kicker (small line above headline)', headline: 'Headline', supporting: 'Supporting text',
    bgImage: 'Background image', bgVideo: 'Background video path (optional — storage path in media bucket)',
    motion: 'Enable background motion', primaryBtn: 'Primary button', primaryUrl: 'Primary button URL',
    secondaryBtn: 'Secondary button', secondaryUrl: 'Secondary button URL',
    aboutSec: 'About / Timeline', sectionTitle: 'Section title', sectionBody: 'Section body',
    milestones: 'Milestones', addMilestone: '+ Add milestone', year: 'Year', msTitle: 'Milestone title',
    msDesc: 'Milestone description', ctaSec: 'Call-to-Action (contact section)', ctaTitle: 'Title', ctaBody: 'Body',
    ctaButton: 'Button label', ctaUrl: 'Button URL', saveSection: 'Save section',
    changeImage: 'Change image', selectImage: 'Select image',
    // workshop
    wsDesc: 'Single page — edits go live on /workshop and /ar/workshop within 60 seconds.',
    title: 'Title', description: 'Description', capabilities: 'Capabilities', onePerLine: '(one per line)',
    heroImage: 'Hero image', ctaLabel: 'CTA label', status: 'Status',
    optDraft: 'Draft', optPublished: 'Published', optArchived: 'Archived', saveWs: 'Save workshop',
  },
  ar: {
    dashboard: 'لوحة التحكم', home: 'أقسام الرئيسية', projects: 'المشاريع', services: 'الخدمات',
    media: 'مكتبة الوسائط', clients: 'العملاء', testimonials: 'التوصيات', statistics: 'الإحصائيات',
    process: 'مراحل العملية', workshop: 'الورشة', leads: 'الاستفسارات', branding: 'الهوية البصرية', settings: 'إعدادات الموقع',
    signout: 'تسجيل الخروج', adminCms: 'لوحة الإدارة', add: '+ إضافة', edit: 'تحرير', del: 'حذف', dup: 'نسخ',
    save: 'حفظ مسودة', publish: 'نشر', saving: 'جارٍ الحفظ…', saved: 'تم الحفظ ✓', error: 'خطأ — أعد المحاولة',
    live: '● منشور', draft: '○ مسودة', archived: '○ مؤرشف', search: 'بحث…', selectMedia: 'اختر وسائط',
    upl: 'رفع ملفات', copyUrl: 'نسخ الرابط', editFile: 'تحرير', noMedia: 'لا توجد وسائط — ارفع من جهازك.',
    email: 'البريد الإلكتروني', password: 'كلمة المرور', signin: 'تسجيل الدخول', contentMgmt: 'إدارة المحتوى',
    invalidCred: 'بيانات الدخول غير صحيحة. حاول مرة أخرى.', langBtn: 'EN', remove: 'إزالة', replace: 'استبدال',
    // dashboard
    draftProjects: 'مشاريع مسودة', mediaFiles: 'ملفات الوسائط', newEnq: 'استفسارات جديدة', unreadEnq: 'غير مقروءة',
    recentActivity: 'النشاط الأخير', quickProject: '+ مشروع سريع', quickMedia: '↑ رفع وسائط',
    viewSite: 'عرض الموقع ↗', noActivity: 'لا يوجد نشاط بعد.',
    // leads
    all: 'الكل', exportCsv: 'تصدير CSV', stNew: 'جديد', stRead: 'مقروء', stInProgress: 'قيد التنفيذ',
    stCompleted: 'مكتمل', stSpam: 'مزعج', downloadAtt: 'تنزيل المرفق ↓', internalNotes: 'ملاحظات داخلية',
    notePh: 'أضف ملاحظة…', addNote: 'إضافة', noEnq: 'لا استفسارات في هذا العرض.', guests: 'ضيفاً',
    // branding
    brandingDesc: 'ارفع الشعارات مباشرة من جهازك — يستخدم الموقع هذه الملفات فوراً (خلال 60 ثانية).',
    slotPrimary: 'الشعار الأساسي (الافتراضي)', slotDark: 'شعار الخلفيات الداكنة', slotLight: 'شعار الفاتح / العربي',
    slotFav: 'أيقونة الموقع', slotOg: 'صورة المشاركة الاجتماعية (OG)', slotFooter: 'شعار التذييل (اختياري)',
    noFile: 'لا يوجد ملف', saveBranding: 'حفظ الهوية', viewPage: 'عرض الصفحة ↗',
    // settings
    company: 'اسم الشركة', address: 'العنوان', emailsLbl: 'البريد (افصل بفاصلة)',
    phonesLbl: 'الهواتف (افصل بفاصلة)', whatsapp: 'واتساب', mapsLbl: 'رابط خرائط Google',
    hoursEnLbl: 'ساعات العمل EN', hoursArLbl: 'ساعات العمل AR', socialLbl: 'روابط التواصل (JSON)',
    saveSettings: 'حفظ الإعدادات',
    // home editor
    homeTitle: 'أقسام الصفحة الرئيسية', homeDesc: 'تظهر التعديلات في الصفحة الرئيسية خلال 60 ثانية.',
    hero: 'الواجهة الرئيسية', kicker: 'السطر التمهيدي (فوق العنوان)', headline: 'العنوان الرئيسي', supporting: 'النص الداعم',
    bgImage: 'صورة الخلفية', bgVideo: 'مسار فيديو الخلفية (اختياري — مسار التخزين في مكتبة الوسائط)',
    motion: 'تفعيل حركة الخلفية', primaryBtn: 'الزر الأساسي', primaryUrl: 'رابط الزر الأساسي',
    secondaryBtn: 'الزر الثانوي', secondaryUrl: 'رابط الزر الثانوي',
    aboutSec: 'من نحن / الجدول الزمني', sectionTitle: 'عنوان القسم', sectionBody: 'نص القسم',
    milestones: 'المحطات', addMilestone: '+ إضافة محطة', year: 'السنة', msTitle: 'عنوان المحطة',
    msDesc: 'وصف المحطة', ctaSec: 'دعوة لاتخاذ إجراء (قسم التواصل)', ctaTitle: 'العنوان', ctaBody: 'النص',
    ctaButton: 'نص الزر', ctaUrl: 'رابط الزر', saveSection: 'حفظ القسم',
    changeImage: 'تغيير الصورة', selectImage: 'اختيار صورة',
    // workshop
    wsDesc: 'صفحة واحدة — تظهر التعديلات في /workshop و /ar/workshop خلال 60 ثانية.',
    title: 'العنوان', description: 'الوصف', capabilities: 'القدرات', onePerLine: '(واحدة في كل سطر)',
    heroImage: 'صورة البطل', ctaLabel: 'نص الزر', status: 'الحالة',
    optDraft: 'مسودة', optPublished: 'منشور', optArchived: 'مؤرشف', saveWs: 'حفظ الورشة',
  },
} as const;
export type AdminDict = (typeof adminDict)['en'];
export type AdminLang = 'en' | 'ar';

export function useAdminLang() {
  const [lang, setLangState] = useState<AdminLang>('en');
  useEffect(() => {
    const saved = localStorage.getItem('joudcon_admin_lang');
    if (saved === 'ar' || saved === 'en') setLangState(saved);
  }, []);
  const set = (l: AdminLang) => { setLangState(l); localStorage.setItem('joudcon_admin_lang', l); };
  return { lang, set, t: adminDict[lang] };
}
