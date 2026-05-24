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
    allRightsReserved: 'AGSTC.ORG - All Rights Reserved. Built with React and SQLite.',

    headerBrandSub: 'Sharjah Tamil Church',
    learnHistory: 'Learn History',
    joinUsTitle: 'Join Us in Word & Spirit',
    verifiedMember: 'Verified Member',
    
    // Core Values
    valGospelTitle: 'Full Gospel Message',
    valGospelDesc: 'We preach the complete work of Christ—salvation, baptism of the Holy Spirit, healing, and His imminent return.',
    valSanctuaryTitle: 'Spiritual Sanctuary',
    valSanctuaryDesc: 'Serving as a spiritual shelter for the expatriate Tamil workforce, reinforcing their faith away from home.',
    valOutreachTitle: 'Outreach & Transport',
    valOutreachDesc: 'Extending love through active weekly shuttles across neighboring northern emirates Ajman and Umm Al Quwain.',
    
    // Faith & History timeline in About Us
    faithTitle1: 'The Scriptures Inspired',
    faithDesc1: 'The Bible is the inspired, infallible Word of God, a divine revelation and the authoritative rule of faith and conduct.',
    faithTitle2: 'The One True God',
    faithDesc2: 'The one true God has revealed Himself as the eternally self-existent "I AM," the Creator of heaven and earth, manifested as Father, Son, and Holy Spirit.',
    faithTitle3: 'Salvation of Man',
    faithDesc3: "Man's only hope of redemption is through the shed blood of Jesus Christ the Son of God, received by faith and repentance.",
    faithTitle4: 'Baptism in the Holy Spirit',
    faithDesc4: 'All believers are entitled to and should ardently expect the promise of the Father, the baptism in the Holy Spirit, which gives power for life and service.',
    
    milestoneTitle1: 'Humble Beginnings',
    milestoneDesc1: 'Started as a weekly bilingually home fellowship in Sharjah, with a focus on supporting regional expatriate workers.',
    milestoneTitle2: 'Transport fleet launched',
    milestoneDesc2: 'Purchased our first shuttle bus to fetch Tamil laborers completely free of charge from far-flung industrial camps.',
    milestoneTitle3: 'Regional Branch Network',
    milestoneDesc3: 'Formally established satellite cell fellowships in Ajman and Umm Al Quwain, expanding weekly ministries.',

    // Hero Banner
    heroTitle1: 'Experience Spiritual Sanctuary',
    heroSub1: 'A Tamil Assembly dedicated to deep spiritual grounding, active local cell fellowship, and sincere praise in Sharjah.',
    heroTitle2: 'We Stand in Prayer With You',
    heroSub2: 'The Jeremiah Ministry and Sister circles are interceding daily. Submit your prayer points anonymously or publicly.',
    heroTitle3: 'Weekly Fellowship Assemblies',
    heroSub3: 'Join our regional prayer groups and weekly services in Sharjah, Ajman, and Umm Al Quwain. Safe transport shuttles are provided.',

    aboutHeaderSub: 'Established by grace as a spiritual refuge for Tamil families in the UAE since 1996.',
    aboutTitle: 'Our Spiritual History',
    aboutPara1: 'Assemblies of God Sharjah Tamil Church (AGSTC) was founded with a divine burden to minister to the spiritual and social welfare of the Tamil expatriate workforce residing in Sharjah, Ajman, and nearby emirates.',
    aboutPara2: 'What started as a small home cell meeting has blossomed under the dedicated pastoral leadership of Pastor Immanuel into a thriving sanctuary where hundreds of brothers and sisters gather weekly. The church acts as a priestly bridge, providing active transport cells to bring remote labor camp residents into fellowship.',
    aboutMission: 'Our core mission is to establish peace, counsel, and gospel restoration for everyone walking through our doors.',
    'Sharjah Main Assembly': 'Sharjah Main Assembly',
    'Ajman Worship Fellowship': 'Ajman Worship Fellowship',
    'Umm Al Quwain Assembly': 'Umm Al Quwain Assembly',
    'Sundays': 'Sundays',
    'Saturdays': 'Saturdays',
    'Wednesdays': 'Wednesdays',
    'Sunday Service': 'Sunday Service',
    'Midweek Prayer': 'Midweek Service',
    'New Year Service': 'New Year Service',
    'Christmas Service': 'Christmas Service',
    'Fasting Prayer': 'Saturday Fasting Prayer',
    'Youth & Children': 'Youth & Children',
    'Sisters Fellowship': 'Sisters Fellowship',
    'Retreats & Special': 'Retreats & Special Meetings',
    'Pastor Immanuel': 'Pastor Immanuel',
    'Pastor Andrew': 'Pastor Andrew',
    'Rev. Andrew': 'Rev. Andrew',
    'Bro. Durai': 'Bro. Durai',
    'Bro. William': 'Bro. William',
    'Asst. Past. Paulsamy': 'Asst. Past. Paulsamy',
    'Bro. Ruskin': 'Bro. Ruskin',
    'Br. Jeyaraj': 'Br. Jeyaraj',
    'Pastor Regilin': 'Pastor Regilin',
    'Sis. Mary Immanuel': 'Sis. Mary Immanuel',
    'Bro. Gunaseelan': 'Bro. Gunaseelan',

    // Additional Page Translations
    whatWeBelieve: 'What We Believe',
    statementsOfFaith: 'Our Statements of Faith',
    digitalWorshipArchives: 'Digital Worship Archives',
    sermonsBroadcasts: 'Sermons & Broadcasts',
    watchRecentBroadcasts: 'Watch recent broadcasts and explore the entire historic sermons catalog of ',
    searchSermonsPlaceholder: 'Search sermons by topic, keyword, title...',
    allCategories: 'All Categories',
    showingSermonsCount: 'Showing {showing} of {total} sermons',
    allPreachers: 'All Preachers',
    newestUploads: 'Newest Uploads',
    oldestUploads: 'Oldest Uploads',
    mostPopular: 'Most Popular',
    resetFilters: 'Reset Filters',
    noSermonsFound: 'No Sermons Found',
    noSermonsDesc: 'We could not find any broadcasts matching your search queries.',
    clearAllFilters: 'Clear All Filters',
    latestFirst: 'Latest first',
    chronologicalOldest: 'Chronological (Oldest first)',
    sortByPopularity: 'Sort by popularity',
    loadMoreSermons: 'Load More Sermons',
    
    specialAssemblies: 'Special Assemblies',
    loadingSpecialCalendar: 'Loading special calendar schedules...',
    noSpecialEvents: 'No special events are currently listed for the coming month. Check back weekly!',
    evtTime: 'Time',
    evtVenue: 'Venue',
    evtLimit: 'Limit',
    evtCapacity: 'Capacity',
    seatReservationRegister: 'Seat Reservation / Register',
    closeModal: 'Close Modal',
    phoneNumberPlaceholder: 'Phone Number',
    confirmTicketBooking: 'Confirm Ticket Booking',
    registeringSeat: 'Registering seat...',
    
    fellowshipIntercessions: 'Fellowship Intercessions',
    sendInquiry: 'Send an Inquiry',
    haveQuestionsContact: 'Have questions about timings, free transport routing or counseling services? Drop us a line.',
    messageContent: 'Message Content',
    sendingMessage: 'Sending message...',
    worshipSanctuaryDetails: 'Worship Sanctuary Details',
    physicalLocation: 'Physical Location',
    agWorshipHallAddress: "St. Martin's Anglican Church, Sharjah, United Arab Emirates",
    counselingOfficeDials: 'Counseling Office / Dials',
    emailQueries: 'Email Queries',
    northernEmiratesBranches: 'Northern Emirates Branches',
    ajmanFellowshipBranch: 'Ajman Fellowship Branch',
    ajmanFellowshipDesc: 'Weekly cells gathering in Al Nuaimia center at Saturdays, 7:30 PM. Active transport shuttles operated.',
    uaqCellBranch: 'Umm Al Quwain Cell Branch',
    uaqCellDesc: 'Weekly fellowships at UAQ Industrial District on Thursdays, 8:00 PM. Pastoral care covered.',
    
    digitalAltarOutlines: 'Digital Altar Outlines',
    libraryDevotionals: 'Library & Devotionals',
    equipFamilyAltar: 'Equip your family altar fellowships and children bible studies with standard scripture devotionals and workbook guides.',
    downloadGuides: 'Download Guides',
    fetchingResources: 'Fetching resources library...',
    writtenBy: 'Written by',
    published: 'Published',
    
    fellowshipCircles: 'Fellowship Circles',
    fetchingActiveMinistries: 'Fetching active ministries lists...',
    adminPortal: 'Admin Portal',
    adminDashboard: 'Dashboard',
    adminDashboardTitle: 'Admin Dashboard',
    adminPortalLogin: 'Admin Portal Login'
  },
  ta: {
    navHome: 'முதற்பக்கம்',
    navAbout: 'ஆலயத்தைப்பற்றி',
    navServices: 'ஒளிபடம்',
    navMinistries: 'ஊழியங்கள்',
    navEvents: 'நிகழ்வுகள்',
    navResources: 'வரைபடம்',
    navContact: 'தொடர்புக்கு',
    
    welcomeTitle: 'ஆலயத்தைப்பற்றி - ஏஜி ஷார்ஜா தமிழ் சபை',
    welcomeSubtitle: 'குடும்பங்களையும் நண்பர்களையும் பிரிந்து வாழும் தேவ பிள்ளைகளுக்கு ஒரு புகலிடமாகவும் சமாதானத்தின் இடமாகவும் ஏற்படுத்தப்பட்டுள்ளது.',
    watchSermons: 'ஞாயிறு ஆராதனைகள்',
    viewAllServices: 'நேரடிபெட்டகம் காண்க',
    requestPrayer: 'ஜெபங்கள்',
    
    pastorMessageTitle: 'போதகரின் செய்தி',
    pastorMessageText: 'நம்முடைய கர்த்தரும் இரட்சகருமாகிய இயேசு கிறிஸ்துவின் மகா பிரசன்னமுள்ள நாமத்தில் உங்களை இந்த இணையதளத்திற்கு அன்போடு வரவேற்கிறோம். நமது கர்த்தர் தமது ஆச்சரியமான கிருபையினால் ஏஜி ஷார்ஜா தமிழ் சபையை குடும்பங்களையும் நண்பர்களையும் பிரிந்து வாழும் தேவ பிள்ளைகளுக்கு ஒரு புகலிடமாகவும் சமாதானத்தின் இடமாகவும் ஏற்படுத்தியுள்ளார். கர்த்தர் இந்த சபையை குறிப்பாக தமிழ் மக்கள் மத்தியில் கிறிஸ்துவின் அன்பை பரப்புவதற்கான ஒரு கருவியாக ஆசீர்வதித்துள்ளார். கிறிஸ்துவின் அறிவிலும், அவரோடு ஐக்கியப்படுவதிலும், உத்தம இருதயத்தோடு அவரை ஆராதிப்பதிலும் நமது ஆவிக்குரிய வாழ்க்கையில் நாம் முன்னேற ஏஜிஎஸ்டிசி ஒரு ஏணியாக செயல்படுகிறது.',
    pastorName: 'தலைமை போதகர் இம்மானுவேல்',
    
    aboutHeaderSub: '1996 முதல் ஐக்கிய அரபு அமீரகத்தில் வாழும் தமிழ் குடும்பங்களின் ஆவிக்குரிய புகலிடமாக தேவ கிருபையால் நிறுவப்பட்டது.',
    aboutTitle: 'எமது ஆவிக்குரிய சரித்திரம்',
    aboutPara1: 'ஏஜி ஷார்ஜா தமிழ் சபையானது (AGSTC) ஷார்ஜா, அஜ்மான் மற்றும் அருகில் உள்ள எமிரேட்களில் வசிக்கும் தமிழ் உழைப்பாளர் மக்களின் ஆவிக்குரிய மற்றும் சமூக நலனுக்காக ஊழியங்களைச் செய்ய வேண்டும் என்ற தாளாத பாரத்தோடு துவங்கப்பட்டது.',
    aboutPara2: 'ஒரு எளிய இல்ல ஜெபக் கூட்டமாகத் துவங்கப்பட்ட இந்த ஐக்கியம், தலைமை போதகர் இம்மானுவேல் அவர்களின் அர்ப்பணிப்புள்ள போதக பராமரிப்பின் கீழ், நூற்றுக்கணக்கான சகோதர சகோதரிகள் கூடி ஆராதிக்கும் ஒரு ஆசீர்வாதமான ஆலயமாக வளர்ந்துள்ளது. தூர முகாம்களில் வசிக்கும் தமிழ் தொழிலாளர்களை ஆராதனைக்கு அழைத்து வர பேருந்து ஊழியத்தின் மூலம் சபை ஒரு பாலமாக செயல்படுகிறது.',
    aboutMission: 'எங்கள் ஆலயத்தின் பிரதான நோக்கம் எமது கதவுகளைத் தட்டும் ஒவ்வொரு ஆத்துமாவிற்கும் சமாதானம், ஆவிக்குரிய ஆலோசனை மற்றும் கிறிஸ்துவின் அன்பினால் உண்டாகும் மறுவாழ்வை அளிப்பதே ஆகும்.',
    
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
    
    contactHeader: 'தொடர்புக்கு',
    contactSub: 'ஜெப விண்ணப்பங்களை அனுப்ப அல்லது சபையின் முகவரியை அறிய படிவத்தை நிரப்பவும்.',
    contactFormName: 'உங்கள் முழு பெயர்',
    contactFormEmail: 'மின்னஞ்சல் முகவரி',
    contactFormPhone: 'தொலைபேசி எண்',
    contactFormSubject: 'விஷயம் / கோரிக்கை',
    contactFormMsg: 'உங்கள் செய்தியை எழுதுங்கள்...',
    contactSubmitBtn: 'செய்தியை அனுப்பவும்',
    
    floatingCall: 'அழைக்க',
    floatingPray: 'ஜெபங்கள்',
    
    footerHeader: 'Assemblies of God ஷார்ஜா தமிழ் சபை',
    footerSub: '1996 முதல் கிருபையால் தூரதேசத்தில் அமைக்கப்பட்ட ஆவிக்குரிய இல்லம்.',
    branchesTitle: 'எங்கள் கிளை சபைகள்',
    quickLinks: 'வரைபடம்',
    allRightsReserved: 'AGSTC.ORG - அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. React மற்றும் SQLite கொண்டு உருவாக்கப்பட்டது.',

    headerBrandSub: 'ஷார்ஜா தமிழ் சபை',
    learnHistory: 'சரித்திரம் அறிய',
    joinUsTitle: 'வார்த்தையிலும் ஆவியிலும் எங்களோடு இணையுங்கள்',
    verifiedMember: 'உறுதிசெய்யப்பட்ட விசுவாசி',
    
    // Core Values
    valGospelTitle: 'முழு சுவிசேஷ செய்தி',
    valGospelDesc: 'கிறிஸ்துவின் முழுமையான கிரியைகளை நாங்கள் பிரசங்கிக்கிறோம்—இரட்சிப்பு, பரிசுத்த ஆவியின் அபிஷேகம், சுகமளித்தல் மற்றும் அவரது விரைவான வருகை.',
    valSanctuaryTitle: 'ஆவிக்குரிய புகலிடம்',
    valSanctuaryDesc: 'தூரதேசத்தில் வாழும் தமிழ் உழைப்பாளர்களுக்கு ஒரு ஆவிக்குரிய புகலிடமாக இருந்து, அவர்களின் விசுவாசத்தை பலப்படுத்துகிறது.',
    valOutreachTitle: 'வெளிப்புற ஊழியம் & போக்குவரத்து',
    valOutreachDesc: 'அண்டை எமிரேட்களான அஜ்மான் மற்றும் உம் அல் குவைன் முழுவதும் இலவச பேருந்து சேவைகள் மூலம் கிறிஸ்துவின் அன்பை பகிர்ந்து கொள்கிறோம்.',
    
    // Faith & History timeline in About Us
    faithTitle1: 'வேதவசனங்களின் தெய்வீக உத்வேகம்',
    faithDesc1: 'சத்திய வேதாகமம் தேவ ஆவியினால் அருளப்பட்டதும், தவறுகளற்றதும், விசுவாசத்திற்கும் ஜீவியத்திற்கும் அதிகாரம் கொண்ட தேவ வெளிப்பாடாகும்.',
    faithTitle2: 'ஒரே மெய்யான தேவன்',
    faithDesc2: 'ஒரே மெய்யான தேவன் தம்மை நித்திய சுயம்புவாகிய "நான் இருக்கிறவராக இருக்கிறேன்" என்றும், வானத்தையும் பூமியையும் படைத்த சிருஷ்டிகராகவும், பிதா, குமாரன், பரிசுத்த ஆவியாக வெளிப்படுத்தியுள்ளார்.',
    faithTitle3: 'மனிதனின் இரட்சிப்பு',
    faithDesc3: 'தேவ குமாரனாகிய இயேசு கிறிஸ்துவின் சிந்தப்பட்ட இரத்தத்தின் மூலமே மனிதனுக்கு மீட்பு உண்டு, இது விசுவாசத்தாலும் மனந்திரும்புதலாலும் பெறப்படுகிறது.',
    faithTitle4: 'பரிசுத்த ஆவியின் அபிஷேகம்',
    faithDesc4: 'விசுவாசிகள் அனைவரும் பிதாவின் வாக்குத்தத்தமாகிய பரிசுத்த ஆவியின் அபிஷேகத்தை ஆவலோடு எதிர்பார்க்க வேண்டும், இது கிறிஸ்தவ ஜீவியத்திற்கும் ஊழியத்திற்கும் வல்லமையளிக்கிறது.',
    
    milestoneTitle1: 'எளிய ஆரம்பம்',
    milestoneDesc1: 'ஷார்ஜாவில் ஒரு எளிய இல்ல ஜெபக் கூட்டமாகத் தொடங்கப்பட்டு, தூரதேசத்தில் வாழும் உழைப்பாளர்களை ஆவிக்குரிய ரீதியில் ஆதரிப்பதை நோக்கமாகக் கொண்டு ஆரம்பிக்கப்பட்டது.',
    milestoneTitle2: 'போக்குவரத்து சேவை துவக்கம்',
    milestoneDesc2: 'தொழிலாளர்கள் எவ்வித சிரமமுமின்றி ஆராதனையில் கலந்து கொள்ள தூர முகாம்களில் இருந்து முற்றிலும் இலவசமாக அழைத்து வர முதல் பேருந்து வாங்கப்பட்டது.',
    milestoneTitle3: 'கிளை சபைகள் விரிவாக்கம்',
    milestoneDesc3: 'அண்டை எமிரேட்களான அஜ்மான் மற்றும் உம் அல் குவைனில் முறையான கிளை சபை ஐக்கியங்கள் ஏற்படுத்தப்பட்டு வாராந்திர ஊழியங்கள் விரிவுபடுத்தப்பட்டன.',

    // Hero Banner
    heroTitle1: 'ஆவிக்குரிய புகலிடத்தை அனுபவியுங்கள்',
    heroSub1: 'ஷார்ஜாவில் ஆழமான ஆவிக்குரிய வளர்ச்சி, வாராந்திர ஜெபக்குழு ஐக்கியம் மற்றும் உத்தம ஆராதனைக்கு அர்ப்பணிக்கப்பட்ட தமிழ் சபை.',
    heroTitle2: 'நாங்கள் உங்களுக்காக ஜெபிக்கிறோம்',
    heroSub2: 'எரேமியா ஜெபக்குழுவும் சகோதரிகள் ஐக்கியமும் உங்களுக்காக தினசரி ஜெபிக்கிறது. உங்கள் ஜெப விண்ணப்பங்களை பகிர்ந்து கொள்ளுங்கள்.',
    heroTitle3: 'வாராந்திர ஆராதனை கூட்டங்கள்',
    heroSub3: 'ஷார்ஜா, அஜ்மான் மற்றும் உம் அல் குவைனில் நடைபெறும் எங்களது வாராந்திர ஆராதனைகளில் இணையுங்கள். இலவச போக்குவரத்து வசதி உள்ளது.',

    // Database seeded schedules translation mappings
    'Sunday First Service': 'ஞாயிறு முதலாம் ஆராதனை',
    'Sunday Second Service': 'ஞாயிறு இரண்டாம் ஆராதனை',
    'Sunday School': 'ஞாயிறு பள்ளி',
    'Sunday Youth Service': 'ஞாயிறு வாலிபர் ஆராதனை',
    'Brothers & Sisters Meeting': 'சகோதரர்கள் மற்றும் சகோதரிகள் கூட்டம்',
    'Thursday Midweek Service': 'வியாழக்கிழமை வாராந்திர ஆராதனை',
    'Saturday Fasting Prayer': 'சனிக்கிழமை உபவாச ஜெபம்',
    'Umm Al Quwain Service': 'உம்-அல்-குவைன் கிளை ஆராதனை',
    '06:00 AM - 08:30 AM': 'காலை 06:00 - 08:30 மணி',
    '09:00 AM - 10:45 AM': 'காலை 09:00 - 10:45 மணி',
    '11:15 AM - 12:45 PM': 'மதியம் 11:15 - 12:45 மணி',
    '08:30 PM - 09:55 PM': 'இரவு 08:30 - 09:55 மணி',
    '10:00 AM - 12:45 PM': 'காலை 10:00 - மதியம் 12:45 மணி',
    '08:30 PM - 10:00 PM': 'இரவு 08:30 - 10:00 மணி',
    'St. Martin\'s Anglican Church, Sharjah': 'செயிண்ட் மார்ட்டின் ஆங்கிலிகன் சர்ச், ஷார்ஜா',
    'Umm Al Quwain Industrial District': 'உம்-அல்-குவைன் தொழில்துறை பகுதி',
    'Main Worship': 'ஆராதனை',
    'Youth': 'வாலிபர்',
    'Women': 'சகோதரிகள்',
    'Prayer Meeting': 'ஜெபக் கூட்டம்',
    'Fellowship': 'ஐக்கியம்',
    'Sunday Service': 'ஞாயிறு ஆராதனை',
    'Thursday Service': 'வியாழக்கிழமை ஆராதனை',
    'New Year Service': 'புத்தாண்டு ஆராதனை',
    'Christmas Service': 'கிறிஸ்துமஸ் ஆராதனை',
    'Fasting Prayer': 'சனிக்கிழமை உபவாச ஜெபம்',
    'Midweek Prayer': 'வாராந்திர ஆராதனை',
    'Youth & Children': 'வாலிபர் & சிறுவர் ஊழியம்',
    'Sisters Fellowship': 'சகோதரிகள் ஐக்கியம்',
    'Retreats & Special': 'விசேஷ கூட்டங்கள்',
    'Pastor Immanuel': 'போதகர் இம்மானுவேல்',
    'Pastor Andrew': 'போதகர் ஆண்ட்ரூ',
    'Rev. Andrew': 'ரெவ். ஆண்ட்ரூ',
    'Bro. Durai': 'சகோ. துரை',
    'Bro. William': 'சகோ. வில்லியம்',
    'Asst. Past. Paulsamy': 'உதவி போதகர் பால்சாமி',
    'Bro. Ruskin': 'சகோ. ரஸ்கின்',
    'Br. Jeyaraj': 'சகோ. ஜெயராஜ்',
    'Pastor Regilin': 'போதகர் ரெஜிலின்',
    'Sis. Mary Immanuel': 'சகோதரி. மேரி இம்மானுவேல்',
    'Bro. Gunaseelan': 'சகோ. குணசீலன்',
    'Sharjah Main Assembly': 'ஷார்ஜா முதன்மை சபை',
    'Ajman Worship Fellowship': 'அஜ்மான் ஆராதனை ஐக்கியம்',
    'Umm Al Quwain Assembly': 'உம்-அல்-குவைன் சபை',
    'Sundays': 'ஞாயிற்றுக்கிழமைகள்',
    'Saturdays': 'சனிக்கிழமைகள்',
    'Wednesdays': 'புதன்கிழமைகள்',

    // Database seeded ministries translation mappings
    'Ajman Ministry': 'அஜ்மான் ஊழியம்',
    'A thriving satellite cell fellowship and prayer network in the emirate of Ajman, supporting regional families with targeted pastoral care and regular home fellowships.': 'அஜ்மான் எமிரேட்டில் ஆவிக்குரிய வளர்ச்சியைத் தூண்டும் கிளை சபை மற்றும் ஜெபக் குழுக்கள், இப்பகுதி குடும்பங்களுக்கு ஆவிக்குரிய ஆலோசனைகளையும் வாராந்திர ஜெபக் கூட்டங்களையும் வழங்குகிறது.',
    'Bro. Selvakumar': 'சகோ. செல்வகுமார்',
    'Saturdays at 7:30 PM': 'சனிக்கிழமை மாலை 7:30 மணி',
    'Regional': 'பிராந்தியம்',
    
    'Audio & Video Ministry': 'ஒலி மற்றும் ஒளி ஊழியம்',
    'Technical stewards orchestrating live streaming broadcasts, acoustics, video recording, and post-production logic to publish sermons on the YouTube channel.': 'ஞாயிறு மற்றும் வாராந்திர ஆராதனைகளை நேரடி ஒளிபரப்பு செய்தல், ஒலி அமைப்புகள், வீடியோ பதிவு மற்றும் போஸ்ட் புரொடக்ஷன் பணிகளை வழிநடத்தும் தொழில்நுட்பக் குழு.',
    'Bro. David Raj': 'சகோ. டேவிட் ராஜ்',
    'Every service': 'அனைத்து ஆராதனை நேரங்களிலும்',
    'Technical Support': 'தொழில்நுட்ப உதவி',
    
    'Children Ministry': 'சிறுவர் ஊழியம்',
    'Nurturing the youngest children of the AGSTC church through structured Tamil Sunday School, scripture memorisation, and interactive bible lesson workshops.': 'சபையின் சிறு பிள்ளைகளுக்கு வேத வசனங்களைக் கற்றுக் கொடுத்து, ஞாயிறு பள்ளி, வேத வசன மனப்பாடம் மற்றும் ஆவிக்குரிய கதைகள் மூலம் அவர்களை ஆவிக்குரிய விசுவாசத்தில் வளர்க்கும் ஊழியம்.',
    'Sis. Rachel Grace': 'சகோதரி. ரேச்சல் கிரேஸ்',
    'Sundays at 9:30 AM': 'ஞாயிற்றுக்கிழமை காலை 9:30 மணி',
    'Youth & Education': 'சிறுவர் மற்றும் கல்வி',
    
    'Choir Ministry': 'பாடல் குழு ஊழியம்',
    'Elevating congregational worship through spiritually rich and musically precise Tamil devotional hymns, regular choir practices, and leading Sunday praise.': 'ஆவிக்குரிய மற்றும் இசை நயமிக்க தமிழ் பக்திப் பாடல்கள், வாராந்திர பாடல் பயிற்சிகள் மூலம் ஞாயிறு ஆராதனையின் தூய ஆராதனைப் பலியை வழிநடத்தும் துதி ஆராதனை குழு.',
    'Sis. Kiruba Immanuel': 'சகோதரி. கிருபா இம்மானுவேல்',
    'Fridays at 6:30 PM (Practice)': 'வெள்ளிக்கிழமை மாலை 6:30 மணி (பயிற்சி)',
    'Worship Arts': 'துதி மற்றும் ஆராதனை',
    
    'Counselling Ministry': 'ஆலோசனை ஊழியம்',
    'Providing confidential, biblically sound advice and psychological encouragement for individuals, couples, and youths walking through various life storms.': 'வாழ்க்கைப் புயல்களை கடந்து செல்லும் தனிநபர்கள், தம்பதியர் மற்றும் இளைஞர்களுக்கு வேத வசனங்களின் அடிப்படையில் ரகசியமான, ஆவிக்குரிய ஆலோசனைகளையும் ஜெபங்களையும் வழங்குதல்.',
    'Pastor Immanuel': 'போதகர் இம்மானுவேல்',
    'By Appointment': 'முன்பதிவு மூலம்',
    'Pastoral Care': 'போதக பராமரிப்பு',
    
    'Jeremiah Ministry': 'எரேமியா ஜெபக்குழு',
    'A devoted group of intercessors acting as prayer walls, committing to constant fasts and prayer chains to intercede for the church, global needs, and families.': 'சபைக்காகவும், தேசத்திற்காகவும், குடும்பங்களின் தேவைகளுக்காகவும் உபவாசத்துடனும் தொடர் சங்கிலி ஜெபங்கள் மூலமும் திறப்பில் நின்று மன்றாடும் அர்ப்பணிக்கப்பட்ட ஜெபவீரர்கள் குழு.',
    'Bro. Gunaseelan': 'சகோ. குணசீலன்',
    'Daily chains': 'தினசரி தொடர் ஜெபங்கள்',
    'Prayer Core': 'ஜெபக் குழு',
    
    'Mens Ministry': 'ஆண்கள் ஐக்கியம்',
    'Uniting brothers to grow as spiritual leaders in their homes, businesses, and the wider Sharjah community, featuring regular breakfasts and study workshops.': 'ஆண்கள் தங்கள் வீடுகளிலும், தொழிலிலும், சமுதாயத்திலும் ஆவிக்குரிய தலைவர்களாக வளர அவர்களை ஒன்றிணைக்கும் ஐக்கியம், இதில் மாதாந்திர வேத ஆராய்ச்சிக் கூட்டங்கள் அடங்கும்.',
    'Bro. Paul Durai': 'சகோ. பால்துரை',
    'Last Saturday at 8:00 AM': 'கடைசி சனிக்கிழமை காலை 8:00 மணி',
    
    'Transport Ministry': 'போக்குவரத்து ஊழியம்',
    'Providing dedicated bus shuttle routes completely free of cost across Sharjah, Ajman, and nearby centers, ensuring every member has safe, reliable transit to services.': 'ஷார்ஜா, அஜ்மான் மற்றும் அருகில் உள்ள தொழிலாளர் முகாம்களில் இருந்து விசுவாசிகள் ஆராதனையில் கலந்து கொள்ள முற்றிலும் இலவச பேருந்து வசதிகளை ஒழுங்கு செய்யும் போக்குவரத்து ஊழியம்.',
    'Bro. Stephen Raj': 'சகோ. ஸ்டீபன் ராஜ்',
    'Every service transit': 'அனைத்து ஆராதனை நேரங்களிலும்',
    'Logistics': 'போக்குவரத்து ஒழுங்கு',
    
    'UMM-AL-QUWAIN Ministry': 'உம்-அல்-குவைன் ஊழியம்',
    'Active outreach prayer groups and weekly fellowships serving the Tamil community residing in the emirate of Umm Al Quwain, ensuring they are plugged in.': 'உம்-அல்-குவைன் எமிரேட்டில் வாழும் தமிழ் விசுவாசிகள் சபையோடு இணைந்து ஆராதிக்கவும் ஆவிக்குரிய ரீதியில் வளரவும் வழிவகை செய்யும் வெளிப்புறக் கிளை சபை ஊழியம்.',
    'Bro. Joshua George': 'சகோ. ஜோஷுவா ஜார்ஜ்',
    'Thursdays at 8:00 PM': 'வியாழக்கிழமை இரவு 8:00 மணி',
    
    'Women’s Ministry': 'பெண்கள் ஐக்கியம்',
    'Empowering sisters through intense prayer circles, home-to-home visitations, charitable outreach, and the weekly Tuesday Sisters Fellowship.': 'சகோதரிகளை ஆவிக்குரிய ஜீவியத்தில் பலப்படுத்த ஜெபக் குழுக்கள், இல்ல சந்திப்புகள், நற்பணிகள் மற்றும் வாராந்திர செவ்வாய்க்கிழமை சகோதரிகள் கூட்டங்களை நடத்தும் ஊழியம்.',
    'Sis. Mary Immanuel': 'சகோதரி. மேரி இம்மானுவேல்',
    'Tuesdays at 10:00 AM': 'செவ்வாய்க்கிழமை காலை 10:00 மணி',

    // Additional Page Translations
    whatWeBelieve: 'நாங்கள் விசுவாசிப்பது',
    statementsOfFaith: 'எங்கள் விசுவாச அறிக்கைகள்',
    digitalWorshipArchives: 'டிஜிட்டல் ஆராதனை பெட்டகம்',
    sermonsBroadcasts: 'பிரசங்கங்கள் மற்றும் நேரடி ஒளிபரப்புகள்',
    watchRecentBroadcasts: 'சமீபத்திய ஆராதனைகளை கண்டு களிக்கவும் மற்றும் சபையின் கடந்த கால பிரசங்கங்களை ஆராயவும்: ',
    searchSermonsPlaceholder: 'தலைப்பு, முக்கிய சொல் அல்லது பிரசங்கம் மூலம் தேடவும்...',
    allCategories: 'அனைத்து பிரிவுகளும்',
    allPreachers: 'அனைத்து போதகர்களும்',
    newestUploads: 'சமீபத்திய பிரசங்கங்கள்',
    oldestUploads: 'ஆரம்ப கால பிரசங்கங்கள்',
    mostPopular: 'பிரபலமான பிரசங்கங்கள்',
    resetFilters: 'வடிகட்டிகளை மீட்டமை',
    noSermonsFound: 'பிரசங்கங்கள் எதுவும் கிடைக்கவில்லை',
    noSermonsDesc: 'நீங்கள் தேடிய முக்கிய சொல் அல்லது பிரிவுகளுக்கு ஏற்ற பிரசங்கங்கள் எதுவும் சபை பெட்டகத்தில் கிடைக்கவில்லை.',
    clearAllFilters: 'வடிகட்டிகளை நீக்கவும்',
    latestFirst: 'சமீபத்தியவை முதலில்',
    chronologicalOldest: 'வரிசைப்படி (முந்தையவை முதலில்)',
    sortByPopularity: 'பிரபல்யத்தின் அடிப்படையில்',
    loadMoreSermons: 'மேலும் பிரசங்கங்களை ஏற்றுக',
    showingSermonsCount: '{total} பிரசங்கங்களில் {showing} பிரசங்கங்கள் காண்பிக்கப்படுகின்றன',
    
    specialAssemblies: 'சிறப்பு ஆராதனைகள்',
    loadingSpecialCalendar: 'சிறப்பு நிகழ்வுகள் விபரங்களை ஏற்றுகிறது...',
    noSpecialEvents: 'அடுத்த சில வாரங்களுக்கு சிறப்பு நிகழ்வுகள் எதுவும் திட்டமிடப்படவில்லை. தொடர்ந்து அவதானியுங்கள்!',
    evtTime: 'நேரம்',
    evtVenue: 'இடம்',
    evtLimit: 'வரம்பு',
    evtCapacity: 'நபர்கள் வரை',
    seatReservationRegister: 'இடம் பதிவு / முன்பதிவு',
    closeModal: 'மூடவும்',
    phoneNumberPlaceholder: 'தொலைபேசி எண்',
    confirmTicketBooking: 'பதிவை உறுதிசெய்',
    registeringSeat: 'பதிவு செய்யப்படுகிறது...',
    
    fellowshipIntercessions: 'உபவாச மன்றாட்டு ஜெபங்கள்',
    sendInquiry: 'தொடர்புகொள்ள படிவம்',
    haveQuestionsContact: 'ஆராதனை நேரங்கள், இலவச பேருந்து வழித்தடங்கள் அல்லது போதக ஆலோசனை தேவையா? எங்களைத் தொடர்பு கொள்ளுங்கள்.',
    messageContent: 'செய்தியின் விவரம்',
    sendingMessage: 'செய்தி அனுப்பப்படுகிறது...',
    worshipSanctuaryDetails: 'ஆராதனை முகவரி விவரங்கள்',
    physicalLocation: 'சபையின் அமைவிடம்',
    agWorshipHallAddress: 'செயிண்ட் மார்ட்டின் ஆங்கிலிகன் சர்ச், ஷார்ஜா, ஐக்கிய அரபு அமீரகம்',
    counselingOfficeDials: 'போதக ஆலோசனை / தொடர்புக்கு',
    emailQueries: 'மின்னஞ்சல் முகவரி',
    northernEmiratesBranches: 'அண்டை மாநில கிளை ஊழியங்கள்',
    ajmanFellowshipBranch: 'அஜ்மான் கிளை சபை ஊழியம்',
    ajmanFellowshipDesc: 'அல் நுஐமியா பகுதியில் சனிக்கிழமை மாலை 7:30 மணிக்கு நடைபெறும் கிளை சபை கூடம். இலவச போக்குவரத்து வசதியுண்டு.',
    uaqCellBranch: 'உம்-அல்-குவைன் கிளை சபை ஊழியம்',
    uaqCellDesc: 'உம்-அல்-குவைன் தொழில்துறை பகுதியில் வியாழக்கிழமை இரவு 8:00 மணிக்கு நடைபெறும் வீட்டு ஐக்கியம். போதக பராமரிப்பு உண்டு.',
    
    digitalAltarOutlines: 'குடும்ப ஜெப பீட குறிப்புகள்',
    libraryDevotionals: 'வேத புத்தகங்கள் மற்றும் வாக்குத்தத்தங்கள்',
    equipFamilyAltar: 'உங்கள் குடும்ப ஜெபங்கள் மற்றும் சிறுவர் ஞாயிறு பள்ளிகளுக்குத் தேவையான வேத குறிப்புகள் மற்றும் புதிர் புத்தகங்கள்.',
    downloadGuides: 'வளங்களைப் பதிவிறக்கு',
    fetchingResources: 'வளங்கள் விவரங்களை ஏற்றுகிறது...',
    writtenBy: 'எழுதியவர்',
    published: 'வெளியிடப்பட்டது',
    
    fellowshipCircles: 'சபையின் ஐக்கியங்கள்',
    fetchingActiveMinistries: 'ஊழியங்கள் பட்டியலை ஏற்றுகிறது...',
    adminPortal: 'நிர்வாகி நுழைவு',
    adminDashboard: 'நிர்வாகி பகுதி',
    adminDashboardTitle: 'நிர்வாகி பலகை',
    adminPortalLogin: 'நிர்வாகி உள்நுழைவு'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('agstc_lang') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('agstc_lang', language);
    // Apply lang and class to document element for global styling overrides
    document.documentElement.lang = language;
    document.documentElement.className = language === 'ta' ? 'lang-ta' : 'lang-en';
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
