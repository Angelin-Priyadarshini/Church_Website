import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    navHome: 'Home',
    navAbout: 'About AGSTC',
    navServices: 'Sermons',
    navMinistries: 'Ministries',
    navEvents: 'Events',
    navResources: 'Resources',
    navContact: 'Contact Us',
    
    welcomeTitle: 'Welcome to AG Sharjah Tamil Church',
    welcomeSubtitle: 'A place of peace, comfort, and spiritual harmony. We invite you to experience the grace of God Shaddai in our bilingually fellowship.',
    watchSermons: 'Watch Sunday Services',
    viewAllServices: 'View All Services',
    requestPrayer: 'Submit Prayer Request',
    
    pastorMessageTitle: 'Pastoral Message',
    pastorMessageText: 'We welcome you to this website in the most precious name of our Lord and savior Jesus Christ. Our Lord by His amazing grace has established AG Sharjah Tamil Church as a place of peace, comfort and harmony for His children who are residing away from their family and friends. Lord has blessed this Church as an instrument to spread the love of Christ amongst the people here, especially who belong to the Tamil community. AGSTC acts as a ladder through which we could reach greater heights in our spiritual life by growing in the knowledge of Christ, fellowshipping with Him and worshiping Him with an upright heart.',
    pastorName: 'Senior Pastor Immanuel',
    
    featuredSermon: 'Featured Sunday Sermon',
    weeklySchedule: 'Weekly Service Schedule',
    timingTableTitle: 'Service Timings & Assemblies',
    serviceName: 'Service / Assembly',
    serviceHour: 'Time / Hour',
    serviceVenue: 'Location / Venue',
    
    testimoniesHeader: 'Impact Testimonies & Miracles',
    testimoniesSub: 'Read what God has been doing in the lives of Assemblies of God Sharjah Tamil Church members.',
    submitYourStory: 'Share Your Testimony',
    
    ministriesTitle: 'Active Ministry Spheres',
    ministriesSub: 'Explore our 10 distinct operational areas created to serve and grow our families.',
    leaderLabel: 'Leader',
    scheduleLabel: 'Schedule',
    categoryLabel: 'Category',
    
    eventsHeader: 'Upcoming Church Events',
    eventsSub: 'Register to attend our special meetings, seminars, and calendar fellowships.',
    seatsRemaining: 'seats remaining',
    eventRegisterBtn: 'Register For Event',
    eventFull: 'Full Capacity',
    registerSuccess: 'Registration Confirmed!',
    
    resourcesTitle: 'Downloadable Resources',
    resourcesSub: 'Equip yourself for family altars and personal devotionals with outlines and quiz books.',
    downloadBtn: 'Download PDF',
    downloadsCount: 'downloads',
    
    devotionalsTitle: 'Daily Promises & Devotionals',
    readTime: 'min read',
    
    contactHeader: 'Get in Touch with Us',
    contactSub: 'Submit an inquiry or request directions to our worship center in Sharjah.',
    contactFormName: 'Your Full Name',
    contactFormEmail: 'Email Address',
    contactFormPhone: 'Phone Number',
    contactFormSubject: 'Subject / Inquiry',
    contactFormMsg: 'Write your message...',
    contactSubmitBtn: 'Send Message',
    
    floatingCall: 'Call Church',
    floatingPray: 'Prayer Request',
    
    footerHeader: 'Assemblies of God Sharjah Tamil Church',
    footerSub: 'Established by grace as a spiritual home away from home since 1996.',
    branchesTitle: 'Our Branch Networks',
    quickLinks: 'Quick Navigation',
    allRightsReserved: 'AGSTC.ORG - All Rights Reserved. Built with React and SQLite.'
  },
  ta: {
    navHome: 'முகப்பு',
    navAbout: 'எங்களைப் பற்றி',
    navServices: 'பிரசங்கங்கள்',
    navMinistries: 'ஊழியங்கள்',
    navEvents: 'நிகழ்வுகள்',
    navResources: 'வளங்கள்',
    navContact: 'தொடர்பு கொள்ள',
    
    welcomeTitle: 'ஏஜி ஷார்ஜா தமிழ் சபைக்கு உங்களை அன்போடு வரவேறியோமா',
    welcomeSubtitle: 'உங்கள் ஆத்துமாவிற்கு சமாதானமும், ஆறுதலும், ஆவிக்குரிய இணக்கமும் அளிக்கும் இடம். எங்களோடு இணைந்து தேவ பிரசன்னத்தை அனுபவியுங்கள்.',
    watchSermons: 'ஞாயிறு ஆராதனைகள்',
    viewAllServices: 'அனைத்து பிரசங்கங்களையும் காண்க',
    requestPrayer: 'ஜெப விண்ணப்பம்',
    
    pastorMessageTitle: 'போதகரின் செய்தி',
    pastorMessageText: 'நம்முடைய கர்த்தரும் இரட்சகருமாகிய இயேசு கிறிஸ்துவின் மகா பிரசன்னமுள்ள நாமத்தில் உங்களை இந்த இணையதளத்திற்கு அன்போடு வரவேற்கிறோம். நமது கர்த்தர் தமது ஆச்சரியமான கிருபையினால் ஏஜி ஷார்ஜா தமிழ் சபையை குடும்பங்களையும் நண்பர்களையும் பிரிந்து வாழும் தேவ பிள்ளைகளுக்கு ஒரு புகலிடமாகவும் சமாதானத்தின் இடமாகவும் ஏற்படுத்தியுள்ளார். கர்த்தர் இந்த சபையை குறிப்பாக தமிழ் மக்கள் மத்தியில் கிறிஸ்துவின் அன்பை பரப்புவதற்கான ஒரு கருவியாக ஆசீர்வதித்துள்ளார். கிறிஸ்துவின் அறிவிலும், அவரோடு ஐக்கியப்படுவதிலும், உத்தம இருதயத்தோடு அவரை ஆராதிப்பதிலும் நமது ஆவிக்குரிய வாழ்க்கையில் நாம் முன்னேற ஏஜிஎஸ்டிசி ஒரு ஏணியாக செயல்படுகிறது.',
    pastorName: 'தலைமை போதகர் இம்மானுவேல்',
    
    featuredSermon: 'சிறப்பு ஞாயிறு பிரசங்கம்',
    weeklySchedule: 'வாராந்திர ஆராதனை நேரங்கள்',
    timingTableTitle: 'ஆராதனை நேரங்கள் மற்றும் கூடங்கள்',
    serviceName: 'ஆராதனை / கூட்டம்',
    serviceHour: 'நேரம் / மணி',
    serviceVenue: 'இடம் / கூடம்',
    
    testimoniesHeader: 'சாட்சிகள் & அற்புதங்கள்',
    testimoniesSub: 'ஷார்ஜா தமிழ் சபை விசுவாசிகளின் வாழ்க்கையில் தேவன் செய்த மகத்துவங்களைக் கேட்டு மகிழுங்கள்.',
    submitYourStory: 'உங்கள் சாட்சியைப் பகிரவும்',
    
    ministriesTitle: 'சபையின் ஊழியங்கள்',
    ministriesSub: 'சபையின் குடும்பங்களை ஆவிக்குரிய விதத்தில் வளர்க்கும் 10 ஊழியப் பிரிவுகள்.',
    leaderLabel: 'தலைவர்',
    scheduleLabel: 'நேரம்',
    categoryLabel: 'பிரிவு',
    
    eventsHeader: 'சபையின் சிறப்பு நிகழ்வுகள்',
    eventsSub: 'எங்கள் சிறப்பு கூட்டங்கள், கருத்தரங்குகள் மற்றும் ஐக்கிய நிகழ்வுகளில் பங்குபெற பதிவுசெய்யுங்கள்.',
    seatsRemaining: 'இடங்கள் மட்டுமே உள்ளன',
    eventRegisterBtn: 'நிகழ்விற்குப் பதிவுசெய்யவும்',
    eventFull: 'இடங்கள் நிறைவடைந்தன',
    registerSuccess: 'பதிவு வெற்றிகரமாக முடிந்தது!',
    
    resourcesTitle: 'பதிவிறக்கம் செய்ய வளங்கள்',
    resourcesSub: 'குடும்ப ஜெப பீடங்கள் மற்றும் தனிப்பட்ட ஜெபங்களுக்கு உதவும் வேத குறிப்புகள் மற்றும் புதிர் புத்தகங்கள்.',
    downloadBtn: 'பதிவிறக்கம் (PDF)',
    downloadsCount: 'பதிவிறக்கங்கள்',
    
    devotionalsTitle: 'தினசரி வாக்குத்தத்தங்கள்',
    readTime: 'நிமிட வாசிப்பு',
    
    contactHeader: 'எங்களைத் தொடர்பு கொள்ள',
    contactSub: 'ஜெப விண்ணப்பங்களை அனுப்ப அல்லது சபையின் முகவரியை அறிய படிவத்தை நிரப்பவும்.',
    contactFormName: 'உங்கள் முழு பெயர்',
    contactFormEmail: 'மின்னஞ்சல் முகவரி',
    contactFormPhone: 'தொலைபேசி எண்',
    contactFormSubject: 'விஷயம் / கோரிக்கை',
    contactFormMsg: 'உங்கள் செய்தியை எழுதுங்கள்...',
    contactSubmitBtn: 'செய்தியை அனுப்பவும்',
    
    floatingCall: 'அழைக்க',
    floatingPray: 'ஜெப உதவி',
    
    footerHeader: 'Assemblies of God ஷார்ஜா தமிழ் சபை',
    footerSub: '1996 முதல் கிருபையால் தூரதேசத்தில் அமைக்கப்பட்ட ஆவிக்குரிய இல்லம்.',
    branchesTitle: 'எங்கள் கிளை சபைகள்',
    quickLinks: 'விரைவான வழிசெலுத்தல்',
    allRightsReserved: 'AGSTC.ORG - அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. React மற்றும் SQLite கொண்டு உருவாக்கப்பட்டது.'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agstc_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agstc_lang', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'ta' : 'en'));
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export default LanguageContext;
