/**
 * Nagpur Municipal Corporation Locality & Geocoding Service
 * Provides locality search (local catalog of all famous places, malls, theaters, chowks + live Nominatim & Photon OSM),
 * device GPS detection, and reverse geocoding.
 */

export type PlaceCategory =
  | 'mall'
  | 'theater'
  | 'landmark'
  | 'hospital'
  | 'college'
  | 'transit'
  | 'chowk'
  | 'shop'
  | 'locality';

export interface NagpurLocality {
  name: string;
  hindiName: string;
  marathiName: string;
  zone: string;
  wardId: string;
  wardName: string;
  lat: number;
  lng: number;
  category?: PlaceCategory;
  aliases?: string[];
  isLiveResult?: boolean;
}

export function getCategoryBadge(cat?: PlaceCategory): { icon: string; label: string; color: string } {
  switch (cat) {
    case 'mall':
      return { icon: '🏬', label: 'Mall & Shopping', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    case 'theater':
      return { icon: '🎬', label: 'Cinema / Theater', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    case 'landmark':
      return { icon: '🏛️', label: 'Famous Landmark', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'hospital':
      return { icon: '🏥', label: 'Hospital', color: 'bg-red-100 text-red-800 border-red-200' };
    case 'college':
      return { icon: '🎓', label: 'University / College', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'transit':
      return { icon: '🚆', label: 'Transit / Station', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' };
    case 'shop':
      return { icon: '🛍️', label: 'Retail / Brand', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'chowk':
      return { icon: '📍', label: 'Chowk / Square', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    default:
      return { icon: '📍', label: 'Locality', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  }
}

export const NAGPUR_LOCALITIES: NagpurLocality[] = [
  // ========================================================
  // MALLS & SHOPPING CENTERS (Google Maps Top Spots)
  // ========================================================
  {
    name: 'VR Mall (Trillium Mall)',
    hindiName: 'वीआर मॉल (ट्रिलियम)',
    marathiName: 'व्हीआर मॉल (ट्रिलियम)',
    zone: 'South-Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Medical Square / Rambagh',
    lat: 21.1330,
    lng: 79.0963,
    category: 'mall',
    aliases: ['vr mall', 'vr nagpur', 'trillium mall', 'trillium', 'virtuous retail', 'medical square mall', 'rambagh mall', 'cinepolis vr mall'],
  },
  {
    name: 'Eternity Mall',
    hindiName: 'इटर्निटी मॉल',
    marathiName: 'इटर्निटी मॉल',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi / Variety Square',
    lat: 21.1431,
    lng: 79.0802,
    category: 'mall',
    aliases: ['eternity mall', 'variety square mall', 'sitabuldi mall', 'amravati road mall', 'cinemax eternity'],
  },
  {
    name: 'Empress Mall',
    hindiName: 'एम्प्रेस मॉल',
    marathiName: 'एम्प्रेस मॉल',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Empress City / Santra Bazaar',
    lat: 21.1481,
    lng: 79.0932,
    category: 'mall',
    aliases: ['empress mall', 'empress city', 'gandhi sagar mall', 'pvr empress', 'santra bazaar mall'],
  },
  {
    name: 'Poonam Mall (Wardhaman Nagar)',
    hindiName: 'पूनम मॉल',
    marathiName: 'पूनम मॉल',
    zone: 'East Zone',
    wardId: 'ward-22',
    wardName: 'Ward 22, Wardhaman Nagar',
    lat: 21.1475,
    lng: 79.1350,
    category: 'mall',
    aliases: ['poonam mall', 'inox poonam', 'ca road mall', 'wardhaman nagar mall', 'inox cinema nagpur'],
  },
  {
    name: 'Fortune Mall',
    hindiName: 'फॉर्च्यून मॉल',
    marathiName: 'फॉर्च्यून मॉल',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi',
    lat: 21.1425,
    lng: 79.0835,
    category: 'mall',
    aliases: ['fortune mall', 'munje square mall', 'sitabuldi shopping center'],
  },
  {
    name: 'Milestone Mall',
    hindiName: 'माइलस्टोन मॉल',
    marathiName: 'माईलस्टोन मॉल',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Ramdaspeth',
    lat: 21.1375,
    lng: 79.0750,
    category: 'mall',
    aliases: ['milestone mall', 'ramdaspeth mall', 'wardha road milestone'],
  },
  {
    name: 'Jaswant Tawa Mall',
    hindiName: 'जसवंत तवा मॉल',
    marathiName: 'जसवंत तवा मॉल',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Indora',
    lat: 21.1730,
    lng: 79.0915,
    category: 'mall',
    aliases: ['jaswant tawa', 'jaswant mall', 'cinemax jaswant', 'moviemax indora', 'kamptee road mall'],
  },
  {
    name: 'Glocal Square',
    hindiName: 'ग्लोकल स्क्वायर',
    marathiName: 'ग्लोकल स्क्वेअर',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi',
    lat: 21.1438,
    lng: 79.0850,
    category: 'mall',
    aliases: ['glocal square', 'buty mall', 'sitabuldi main road mall'],
  },

  // ========================================================
  // THEATERS & CINEMAS (Google Maps Favorites)
  // ========================================================
  {
    name: 'Cinepolis (VR Mall)',
    hindiName: 'सिनेपोलिस (वीआर मॉल)',
    marathiName: 'सिनेपोलिस (व्हीआर मॉल)',
    zone: 'South-Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Medical Square',
    lat: 21.1330,
    lng: 79.0963,
    category: 'theater',
    aliases: ['cinepolis', 'cinepolis vr mall', 'cinepolis nagpur', 'vr cinema', 'vr movies', 'theater', 'cinema'],
  },
  {
    name: 'PVR Empress City',
    hindiName: 'पीवीआर एम्प्रेस सिटी',
    marathiName: 'पीव्हीआर एम्प्रेस सिटी',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Empress City',
    lat: 21.1481,
    lng: 79.0932,
    category: 'theater',
    aliases: ['pvr', 'pvr nagpur', 'pvr cinemas', 'pvr empress', 'empress cinema', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'Cinemax Movie Theater (Eternity Mall)',
    hindiName: 'सिनेमैक्स मूवी थिएटर',
    marathiName: 'सिनेमॅक्स मुव्ही थिएटर',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi',
    lat: 21.1429,
    lng: 79.0802,
    category: 'theater',
    aliases: ['cinemax', 'cinemax eternity', 'cinemax nagpur', 'eternity cinema', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'INOX Cinema (Poonam Mall)',
    hindiName: 'आईनॉक्स सिनेमा (पूनम मॉल)',
    marathiName: 'आयनॉक्स सिनेमा (पूनम मॉल)',
    zone: 'East Zone',
    wardId: 'ward-22',
    wardName: 'Ward 22, Wardhaman Nagar',
    lat: 21.1475,
    lng: 79.1350,
    category: 'theater',
    aliases: ['inox', 'inox nagpur', 'inox poonam', 'inox cinema', 'inox movies', 'wardhaman nagar inox', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'MovieMax Cinema (Jaswant Tawa Mall)',
    hindiName: 'मूवीमैक्स सिनेमा',
    marathiName: 'मुव्हीमॅक्स सिनेमा',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Indora',
    lat: 21.1730,
    lng: 79.0915,
    category: 'theater',
    aliases: ['moviemax', 'moviemax nagpur', 'inox jaswant', 'cinemax indora', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'Alankar Movie Theatre',
    hindiName: 'अलंकार टॉकीज',
    marathiName: 'अलंकार टॉकीज',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Dharampeth',
    lat: 21.1380,
    lng: 79.0687,
    category: 'theater',
    aliases: ['alankar cinema', 'alankar talkies', 'alankar theater', 'alankar square', 'dharampeth cinema', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'Liberty Cinema',
    hindiName: 'लिबर्टी सिनेमा',
    marathiName: 'लिबर्टी सिनेमा',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Sadar',
    lat: 21.1595,
    lng: 79.0825,
    category: 'theater',
    aliases: ['liberty cinema', 'liberty theater', 'liberty talkies', 'sadar cinema', 'residency road cinema', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'Smruti Cinema',
    hindiName: 'स्मृति सिनेमा',
    marathiName: 'स्मृती सिनेमा',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Sadar',
    lat: 21.1578,
    lng: 79.0820,
    category: 'theater',
    aliases: ['smruti cinema', 'smruti talkies', 'smruti theater', 'mount road cinema', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'Sudama Talkies',
    hindiName: 'सुदामा टॉकीज',
    marathiName: 'सुदामा टॉकीज',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Dharampeth',
    lat: 21.1420,
    lng: 79.0665,
    category: 'theater',
    aliases: ['sudama talkies', 'sudama cinema', 'sudama theater', 'west high court road cinema', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'Panchsheel Cinema',
    hindiName: 'पंचशील टॉकीज',
    marathiName: 'पंचशील टॉकीज',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Dhantoli',
    lat: 21.1390,
    lng: 79.0815,
    category: 'theater',
    aliases: ['panchsheel cinema', 'panchsheel talkies', 'panchsheel theater', 'panchsheel square cinema', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'Rajvilas Cinema',
    hindiName: 'राजविलास टॉकीज',
    marathiName: 'राजविलास टॉकीज',
    zone: 'Central Zone',
    wardId: 'ward-09',
    wardName: 'Ward 09, Mahal',
    lat: 21.1440,
    lng: 79.1020,
    category: 'theater',
    aliases: ['rajvilas cinema', 'rajvilas talkies', 'mahal cinema', 'badkas chowk cinema', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'Jaishree Cinema',
    hindiName: 'जयश्री टॉकीज',
    marathiName: 'जयश्री टॉकीज',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Cotton Market',
    lat: 21.1462,
    lng: 79.0920,
    category: 'theater',
    aliases: ['jaishree cinema', 'jaishree talkies', 'cotton market cinema', 'theater', 'theatre', 'cinema'],
  },
  {
    name: 'Anand Cinema',
    hindiName: 'आनंद टॉकीज',
    marathiName: 'आनंद टॉकीज',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi',
    lat: 21.1445,
    lng: 79.0855,
    category: 'theater',
    aliases: ['anand cinema', 'anand talkies', 'sitabuldi talkies', 'theater', 'theatre', 'cinema'],
  },

  // ========================================================
  // FAMOUS LANDMARKS, LAKES & TOURIST SPOTS
  // ========================================================
  {
    name: 'Deekshabhoomi',
    hindiName: 'दीक्षाभूमि',
    marathiName: 'दीक्षाभूमी',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Laxmi Nagar / Bajaj Nagar',
    lat: 21.1282,
    lng: 79.0669,
    category: 'landmark',
    aliases: ['deekshabhoomi', 'dikshabhumi', 'dr ambedkar stupa', 'laxmi nagar stupa', 'buddhist stupa'],
  },
  {
    name: 'Futala Lake & Chowpatty',
    hindiName: 'फुटाळा तलाव',
    marathiName: 'फुटाळा तलाव',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Bharat Nagar / Telangkhedi',
    lat: 21.1543,
    lng: 79.0408,
    category: 'landmark',
    aliases: ['futala lake', 'futala chowpatty', 'futala fountain', 'telangkhedi lake', 'futala lakefront'],
  },
  {
    name: 'Ambazari Lake & Garden',
    hindiName: 'अंबाजारी तलाव',
    marathiName: 'अंबाजारी तलाव',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Ambazari',
    lat: 21.1305,
    lng: 79.0425,
    category: 'landmark',
    aliases: ['ambazari lake', 'ambazari garden', 'ambazari dam', 'ambazari overflow'],
  },
  {
    name: 'Seminary Hills & Japanese Garden',
    hindiName: 'सेमिनरी हिल्स',
    marathiName: 'सेमिनरी हिल्स',
    zone: 'West Zone',
    wardId: 'ward-02',
    wardName: 'Ward 02, Seminary Hills',
    lat: 21.1620,
    lng: 79.0550,
    category: 'landmark',
    aliases: ['seminary hills', 'japanese garden', 'tv tower nagpur', 'air force station seminary hills'],
  },
  {
    name: 'Zero Mile Stone',
    hindiName: 'जीरो माइल',
    marathiName: 'झिरो माइल',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Zero Mile / Civil Lines',
    lat: 21.1492,
    lng: 79.0825,
    category: 'landmark',
    aliases: ['zero mile', 'zero mile stone', 'center of india', 'civil lines zero mile', 'zero mile metro'],
  },
  {
    name: 'Maharajbagh Zoo & Garden',
    hindiName: 'महाराजबैग चिड़ियाघर',
    marathiName: 'महाराजबैग प्राणीसंग्रहालय',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Ramdaspeth / Sitabuldi',
    lat: 21.1415,
    lng: 79.0755,
    category: 'landmark',
    aliases: ['maharajbagh zoo', 'maharajbagh', 'nagpur zoo', 'botanical garden nagpur'],
  },
  {
    name: 'Gorewada International Zoo & Safari',
    hindiName: 'गोरेवाड़ा चिड़ियाघर',
    marathiName: 'गोरेवाडा प्राणीसंग्रहालय',
    zone: 'North Zone',
    wardId: 'ward-02',
    wardName: 'Ward 02, Gorewada',
    lat: 21.1960,
    lng: 79.0350,
    category: 'landmark',
    aliases: ['gorewada zoo', 'gorewada safari', 'balasaheb thackeray zoo', 'gorewada lake'],
  },
  {
    name: 'Tekdi Ganesh Mandir',
    hindiName: 'टेकड़ी गणेश मंदिर',
    marathiName: 'टेकडी गणेश मंदिर',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi / Railway Station',
    lat: 21.1510,
    lng: 79.0880,
    category: 'landmark',
    aliases: ['tekdi ganesh', 'tekdi ganpati', 'railway station temple', 'ganesh mandir nagpur'],
  },
  {
    name: 'Koradi Temple (Mahalaxmi Jagdamba)',
    hindiName: 'कोराडी मंदिर',
    marathiName: 'कोराडी मंदिर',
    zone: 'North Zone',
    wardId: 'ward-01',
    wardName: 'Ward 01, Koradi',
    lat: 21.2425,
    lng: 79.0950,
    category: 'landmark',
    aliases: ['koradi temple', 'koradi mandir', 'mahalaxmi jagdamba', 'koradi thermal power'],
  },
  {
    name: 'Dragon Palace Temple (Kamptee)',
    hindiName: 'ड्रैगन पैलेस मंदिर',
    marathiName: 'ड्रॅगन पॅलेस मंदिर',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Kamptee',
    lat: 21.2220,
    lng: 79.1920,
    category: 'landmark',
    aliases: ['dragon palace', 'dragon palace temple', 'lotus temple kamptee', 'buddhist temple kamptee'],
  },
  {
    name: 'Raman Science Centre & Planetarium',
    hindiName: 'रमन साइंस सेंटर',
    marathiName: 'रमण सायन्स सेंटर',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Gandhi Sagar',
    lat: 21.1450,
    lng: 79.0940,
    category: 'landmark',
    aliases: ['raman science centre', 'science park nagpur', 'planetarium nagpur', 'gandhi sagar planetarium'],
  },
  {
    name: 'Children Traffic Park',
    hindiName: 'चिल्ड्रन ट्रैफिक पार्क',
    marathiName: 'चिल्ड्रन ट्रॅफिक पार्क',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Dharampeth',
    lat: 21.1420,
    lng: 79.0645,
    category: 'landmark',
    aliases: ['traffic park', 'children traffic park', 'dharampeth traffic park'],
  },
  {
    name: 'Kasturchand Park',
    hindiName: 'कस्तूरचंद पार्क',
    marathiName: 'कस्तूरचंद पार्क',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Sadar',
    lat: 21.1530,
    lng: 79.0835,
    category: 'landmark',
    aliases: ['kasturchand park', 'kp ground', 'sadar kp ground', 'kp nagpur'],
  },
  {
    name: 'Yashwant Stadium',
    hindiName: 'यशवंत स्टेडियम',
    marathiName: 'यशवंत स्टेडियम',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Dhantoli',
    lat: 21.1380,
    lng: 79.0855,
    category: 'landmark',
    aliases: ['yashwant stadium', 'dhantoli stadium', 'sports complex dhantoli'],
  },
  {
    name: 'Krazy Castle Aqua Park',
    hindiName: 'क्रेजी कैसल',
    marathiName: 'क्रेझी कॅसल',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Ambazari',
    lat: 21.1310,
    lng: 79.0405,
    category: 'landmark',
    aliases: ['krazy castle', 'water park nagpur', 'ambazari amusement park'],
  },
  {
    name: 'Vidhan Bhavan (Council Hall)',
    hindiName: 'विधान भवन',
    marathiName: 'विधान भवन',
    zone: 'West Zone',
    wardId: 'ward-02',
    wardName: 'Ward 02, Civil Lines',
    lat: 21.1510,
    lng: 79.0735,
    category: 'landmark',
    aliases: ['vidhan bhavan', 'council hall', 'winter assembly hall', 'civil lines vidhan bhavan'],
  },
  {
    name: 'High Court of Bombay at Nagpur',
    hindiName: 'उच्च न्यायालय नागपुर',
    marathiName: 'उच्च न्यायालय नागपूर',
    zone: 'West Zone',
    wardId: 'ward-02',
    wardName: 'Ward 02, Civil Lines',
    lat: 21.1545,
    lng: 79.0720,
    category: 'landmark',
    aliases: ['high court', 'nagpur high court', 'bombay high court nagpur bench', 'high court civil lines'],
  },
  {
    name: 'Reserve Bank of India (RBI)',
    hindiName: 'भारतीय रिज़र्व बैंक',
    marathiName: 'रिझर्व्ह बँक ऑफ इंडिया',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Station Road / Civil Lines',
    lat: 21.1510,
    lng: 79.0805,
    category: 'landmark',
    aliases: ['rbi', 'reserve bank of india', 'rbi nagpur', 'rbi square'],
  },

  // ========================================================
  // MAJOR HOSPITALS (Instant Grievance & Emergency)
  // ========================================================
  {
    name: 'Government Medical College & Hospital (GMC)',
    hindiName: 'मेडिकल कॉलेज व अस्पताल (GMC)',
    marathiName: 'शासकीय वैद्यकीय महाविद्यालय (GMC)',
    zone: 'South-Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Medical Square',
    lat: 21.1275,
    lng: 79.0970,
    category: 'hospital',
    aliases: ['gmc', 'gmc nagpur', 'medical college hospital', 'medical hospital nagpur', 'medical square hospital'],
  },
  {
    name: 'Indira Gandhi Govt Medical College (Mayo Hospital)',
    hindiName: 'मेयो अस्पताल (IGGMC)',
    marathiName: 'मेयो रुग्णालय (IGGMC)',
    zone: 'Central-East Zone',
    wardId: 'ward-07',
    wardName: 'Ward 07, Mominpura / CA Road',
    lat: 21.1530,
    lng: 79.0935,
    category: 'hospital',
    aliases: ['mayo hospital', 'mayo', 'iggmc', 'indira gandhi hospital', 'mominpura hospital', 'central avenue hospital'],
  },
  {
    name: 'AIIMS Nagpur (MIHAN)',
    hindiName: 'एम्स नागपुर',
    marathiName: 'एम्स नागपूर',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, MIHAN',
    lat: 21.0370,
    lng: 79.0380,
    category: 'hospital',
    aliases: ['aiims', 'aiims nagpur', 'aiims mihan', 'all india institute of medical sciences'],
  },
  {
    name: 'Kingsway Hospital',
    hindiName: 'किंग्सवे हॉस्पिटल',
    marathiName: 'किंग्सवे हॉस्पिटल',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Station Road',
    lat: 21.1520,
    lng: 79.0865,
    category: 'hospital',
    aliases: ['kingsway hospital', 'kingsway', 'railway station hospital'],
  },
  {
    name: 'Orange City Hospital (OCHRI)',
    hindiName: 'ऑरेंज सिटी हॉस्पिटल',
    marathiName: 'ऑरेंज सिटी हॉस्पिटल',
    zone: 'South-West Zone',
    wardId: 'ward-15',
    wardName: 'Ward 15, Khamla',
    lat: 21.1155,
    lng: 79.0620,
    category: 'hospital',
    aliases: ['orange city hospital', 'ochri', 'khamla hospital', 'khamla square hospital'],
  },
  {
    name: 'Care Hospital',
    hindiName: 'केयर हॉस्पिटल',
    marathiName: 'केअर हॉस्पिटल',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Ramdaspeth',
    lat: 21.1385,
    lng: 79.0810,
    category: 'hospital',
    aliases: ['care hospital', 'panchsheel square hospital', 'ramdaspeth hospital'],
  },
  {
    name: 'Alexis / Max Multi-Speciality Hospital',
    hindiName: 'मैक्स / एलेक्सिस हॉस्पिटल',
    marathiName: 'मॅक्स / अलेक्सिस हॉस्पिटल',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Mankapur',
    lat: 21.1890,
    lng: 79.0790,
    category: 'hospital',
    aliases: ['alexis hospital', 'max hospital nagpur', 'mankapur hospital'],
  },
  {
    name: 'Wockhardt Hospital',
    hindiName: 'वॉकहार्ट हॉस्पिटल',
    marathiName: 'वॉकहार्ट हॉस्पिटल',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Shankar Nagar',
    lat: 21.1370,
    lng: 79.0570,
    category: 'hospital',
    aliases: ['wockhardt hospital', 'wockhardt', 'shankar nagar hospital'],
  },

  // ========================================================
  // COLLEGES & UNIVERSITIES
  // ========================================================
  {
    name: 'VNIT Nagpur (Visvesvaraya National Institute)',
    hindiName: 'वीएनआईटी नागपुर',
    marathiName: 'व्हीएनआयटी नागपूर',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, South Ambazari Road',
    lat: 21.1261,
    lng: 79.0498,
    category: 'college',
    aliases: ['vnit', 'vnit nagpur', 'visvesvaraya national institute of technology', 'engineering college nagpur', 'south ambazari road college'],
  },
  {
    name: 'RCOEM / Ramdeobaba University',
    hindiName: 'रामदेवबाबा कॉलेज / यूनिवर्सिटी',
    marathiName: 'रामदेवबाबा कॉलेज / विद्यापीठ',
    zone: 'West Zone',
    wardId: 'ward-02',
    wardName: 'Ward 02, Gittikhadan',
    lat: 21.1765,
    lng: 79.0615,
    category: 'college',
    aliases: ['rcoem', 'ramdeobaba college', 'ramdeobaba university', 'gittikhadan college', 'katol road college'],
  },
  {
    name: 'GHRCE / Raisoni College of Engineering',
    hindiName: 'रायसोनी इंजीनियरिंग कॉलेज',
    marathiName: 'रायसोनी अभियांत्रिकी महाविद्यालय',
    zone: 'South-West Zone',
    wardId: 'ward-15',
    wardName: 'Ward 15, Hingna Road',
    lat: 21.1030,
    lng: 79.0020,
    category: 'college',
    aliases: ['ghrce', 'raisoni college', 'raisoni engineering', 'hingna road college'],
  },
  {
    name: 'LAD College (Shankar Nagar)',
    hindiName: 'एलएडी कॉलेज',
    marathiName: 'एलएडी कॉलेज',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Shankar Nagar',
    lat: 21.1385,
    lng: 79.0595,
    category: 'college',
    aliases: ['lad college', 'lad college shankar nagar', 'women college nagpur'],
  },
  {
    name: 'Hislop College',
    hindiName: 'हिसलॉप कॉलेज',
    marathiName: 'हिसलॉप कॉलेज',
    zone: 'West Zone',
    wardId: 'ward-02',
    wardName: 'Ward 02, Civil Lines',
    lat: 21.1475,
    lng: 79.0740,
    category: 'college',
    aliases: ['hislop college', 'civil lines college'],
  },
  {
    name: 'IIM Nagpur (MIHAN)',
    hindiName: 'आईआईएम नागपुर',
    marathiName: 'आयआयएम नागपूर',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, MIHAN',
    lat: 21.0420,
    lng: 79.0350,
    category: 'college',
    aliases: ['iim', 'iim nagpur', 'indian institute of management nagpur', 'mihan iim'],
  },

  // ========================================================
  // TRANSIT HUBS & AIRPORT
  // ========================================================
  {
    name: 'Dr. Babasaheb Ambedkar International Airport',
    hindiName: 'नागपुर अंतरराष्ट्रीय हवाई अड्डा',
    marathiName: 'नागपूर आंतरराष्ट्रीय विमानतळ',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Sonegaon / Airport',
    lat: 21.0922,
    lng: 79.0472,
    category: 'transit',
    aliases: ['nagpur airport', 'airport', 'nagpur international airport', 'sonegaon airport', 'aerodrome nagpur', 'flight'],
  },
  {
    name: 'Nagpur Junction Railway Station',
    hindiName: 'नागपुर जंक्शन रेलवे स्टेशन',
    marathiName: 'नागपूर जंक्शन रेल्वे स्टेशन',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Station Road / Sitabuldi',
    lat: 21.1528,
    lng: 79.0878,
    category: 'transit',
    aliases: ['railway station', 'nagpur railway station', 'nagpur junction', 'central railway station', 'main station', 'train'],
  },
  {
    name: 'Ajni Railway Station',
    hindiName: 'अजनी रेलवे स्टेशन',
    marathiName: 'अजनी रेल्वे स्टेशन',
    zone: 'South-Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Ajni',
    lat: 21.1235,
    lng: 79.0895,
    category: 'transit',
    aliases: ['ajni railway station', 'ajni station', 'ajni square station', 'train'],
  },
  {
    name: 'Sitabuldi Interchange Metro Station',
    hindiName: 'सीताबर्डी मेट्रो स्टेशन',
    marathiName: 'सीताबर्डी मेट्रो स्टेशन',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi',
    lat: 21.1445,
    lng: 79.0845,
    category: 'transit',
    aliases: ['sitabuldi metro', 'metro station', 'sitabuldi interchange', 'nagpur metro interchange'],
  },
  {
    name: 'Ganeshpeth Central Bus Stand (ST)',
    hindiName: 'गणेशपेठ बस स्टैंड (ST)',
    marathiName: 'गणेशपेठ बस स्थानक (ST)',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Ganeshpeth',
    lat: 21.1415,
    lng: 79.0950,
    category: 'transit',
    aliases: ['ganeshpeth bus stand', 'st bus stand', 'nagpur bus stand', 'central bus stand', 'st depot'],
  },
  {
    name: 'Mor Bhavan City Bus Terminal',
    hindiName: 'मोर भवन बस टर्मिनल',
    marathiName: 'मोर भवन बस टर्मिनल',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi',
    lat: 21.1420,
    lng: 79.0825,
    category: 'transit',
    aliases: ['mor bhavan', 'sitabuldi bus stand', 'city bus terminal nagpur'],
  },

  // ========================================================
  // FAMOUS BRANDS & RETAIL SHOWROOMS
  // ========================================================
  {
    name: 'Radisson Blu Hotel Nagpur',
    hindiName: 'रेडिसन ब्लू होटल',
    marathiName: 'रॅडिसन ब्लू हॉटेल',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Wardha Road',
    lat: 21.1115,
    lng: 79.0685,
    category: 'shop',
    aliases: ['radisson', 'radisson blu', 'hotel radisson', 'wardha road 5 star hotel', 'radisson hotel'],
  },
  {
    name: "Haldiram's Planet Food (Sadar)",
    hindiName: 'हल्दीराम प्लैनेट फूड (सदर)',
    marathiName: 'हल्दीराम प्लॅनेट फूड (सदर)',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Sadar',
    lat: 21.1635,
    lng: 79.0802,
    category: 'shop',
    aliases: ['haldiram', 'haldirams sadar', 'haldirams planet food', 'mangalwari haldiram'],
  },
  {
    name: "Haldiram's (Dharampeth WHC Road)",
    hindiName: 'हल्दीराम धरमपेठ',
    marathiName: 'हल्दीराम धरमपेठ',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Dharampeth',
    lat: 21.1415,
    lng: 79.0609,
    category: 'shop',
    aliases: ['haldiram', 'haldirams dharampeth', 'haldirams whc road'],
  },
  {
    name: "Haldiram's (Medical Square)",
    hindiName: 'हल्दीराम मेडिकल स्क्वायर',
    marathiName: 'हल्दीराम मेडिकल स्क्वेअर',
    zone: 'South-Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Medical Square',
    lat: 21.1270,
    lng: 79.0960,
    category: 'shop',
    aliases: ['haldiram', 'haldirams medical square', 'haldirams rambagh'],
  },
  {
    name: 'Zudio (Dhantoli / Wardha Road)',
    hindiName: 'जूडियो (धंतोली)',
    marathiName: 'झुडिओ (धंतोली)',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Dhantoli',
    lat: 21.1395,
    lng: 79.0810,
    category: 'shop',
    aliases: ['zudio', 'zudio nagpur', 'zudio dhantoli', 'zudio wardha road', 'tata zudio'],
  },
  {
    name: 'Croma (Wardha Road / Dhantoli)',
    hindiName: 'क्रोमा (वर्धा रोड)',
    marathiName: 'क्रोमा (वर्धा रोड)',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Dhantoli',
    lat: 21.1392,
    lng: 79.0808,
    category: 'shop',
    aliases: ['croma', 'croma nagpur', 'croma wardha road', 'croma electronics'],
  },
  {
    name: 'D-Mart (Hingna Road / Jaitala)',
    hindiName: 'डी-मार्ट (हिंगणा रोड)',
    marathiName: 'डी-मार्ट (हिंगणा रोड)',
    zone: 'South-West Zone',
    wardId: 'ward-15',
    wardName: 'Ward 15, Hingna Road',
    lat: 21.1080,
    lng: 79.0220,
    category: 'shop',
    aliases: ['dmart', 'd mart', 'dmart hingna', 'dmart jaitala', 'dmart supermarket'],
  },
  {
    name: 'D-Mart (Besa-Pipla Road)',
    hindiName: 'डी-मार्ट (बेसा)',
    marathiName: 'डी-मार्ट (बेसा)',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Besa',
    lat: 21.0830,
    lng: 79.0950,
    category: 'shop',
    aliases: ['dmart', 'd mart', 'dmart besa', 'd mart besa', 'dmart manewada'],
  },

  // ========================================================
  // MAJOR NAGPUR CHOWKS & SQUARES
  // ========================================================
  {
    name: 'Kamal Chowk',
    hindiName: 'कमल चौक',
    marathiName: 'कमल चौक',
    zone: 'North-Central Zone',
    wardId: 'ward-07',
    wardName: 'Ward 07, Kamal Chowk / Lashkaribagh',
    lat: 21.1685,
    lng: 79.1022,
    category: 'chowk',
    aliases: ['kamal chowk', 'kamal square', 'lashkaribagh chowk', 'pachpaoli road'],
  },
  {
    name: 'Medical Square (GMC Chowk)',
    hindiName: 'मेडिकल चौक',
    marathiName: 'मेडिकल चौक',
    zone: 'South-Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Medical Chowk / Ajni',
    lat: 21.1268,
    lng: 79.0965,
    category: 'chowk',
    aliases: ['medical chowk', 'medical square', 'gmc chowk', 'rambagh square'],
  },
  {
    name: 'Variety Square (Sitabuldi)',
    hindiName: 'वैरायटी चौक',
    marathiName: 'व्हरायटी चौक',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi',
    lat: 21.1435,
    lng: 79.0815,
    category: 'chowk',
    aliases: ['variety square', 'variety chowk', 'sitabuldi chowk', 'eternity chowk'],
  },
  {
    name: 'Jhansi Rani Chowk',
    hindiName: 'झांसी रानी चौक',
    marathiName: 'झाशी राणी चौक',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi',
    lat: 21.1410,
    lng: 79.0820,
    category: 'chowk',
    aliases: ['jhansi rani chowk', 'jhansi rani square', 'sitabuldi metro chowk'],
  },
  {
    name: 'Shankar Nagar Square',
    hindiName: 'शंकर नगर चौक',
    marathiName: 'शंकर नगर चौक',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Shankar Nagar',
    lat: 21.1398,
    lng: 79.0588,
    category: 'chowk',
    aliases: ['shankar nagar chowk', 'shankar nagar square', 'whc road shankar nagar'],
  },
  {
    name: 'Law College Square',
    hindiName: 'लॉ कॉलेज चौक',
    marathiName: 'लॉ कॉलेज चौक',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Dharampeth',
    lat: 21.1455,
    lng: 79.0625,
    category: 'chowk',
    aliases: ['law college chowk', 'law college square', 'amravati road law college'],
  },
  {
    name: 'Bhole Petrol Pump Chowk',
    hindiName: 'भोले पेट्रोल पंप चौक',
    marathiName: 'भोले पेट्रोल पंप चौक',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, VIP Road / Dharampeth',
    lat: 21.1450,
    lng: 79.0710,
    category: 'chowk',
    aliases: ['bhole petrol pump', 'bhole chowk', 'vip road chowk'],
  },
  {
    name: 'Rahate Colony Square',
    hindiName: 'रहाटे कॉलोनी चौक',
    marathiName: 'रहाटे कॉलनी चौक',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Wardha Road',
    lat: 21.1315,
    lng: 79.0760,
    category: 'chowk',
    aliases: ['rahate colony chowk', 'rahate colony square', 'wardha road rahate'],
  },
  {
    name: 'Chhatrapati Square',
    hindiName: 'छत्रपति चौक',
    marathiName: 'छत्रपती चौक',
    zone: 'South-West Zone',
    wardId: 'ward-15',
    wardName: 'Ward 15, Pratap Nagar / Khamla',
    lat: 21.1110,
    lng: 79.0670,
    category: 'chowk',
    aliases: ['chhatrapati square', 'chhatrapati chowk', 'chatrapati square', 'ring road chowk'],
  },
  {
    name: 'Pratap Nagar Square',
    hindiName: 'प्रताप नगर चौक',
    marathiName: 'प्रताप नगर चौक',
    zone: 'South-West Zone',
    wardId: 'ward-15',
    wardName: 'Ward 15, Pratap Nagar',
    lat: 21.1192,
    lng: 79.0556,
    category: 'chowk',
    aliases: ['pratap nagar chowk', 'pratap nagar square', 'mate chowk road'],
  },
  {
    name: 'Mate Square',
    hindiName: 'माटे चौक',
    marathiName: 'माटे चौक',
    zone: 'South-West Zone',
    wardId: 'ward-15',
    wardName: 'Ward 15, Pratap Nagar',
    lat: 21.1215,
    lng: 79.0520,
    category: 'chowk',
    aliases: ['mate square', 'mate chowk', 'vnit mate chowk'],
  },
  {
    name: 'Bajaj Nagar Square',
    hindiName: 'बजाज नगर चौक',
    marathiName: 'बजाज नगर चौक',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Bajaj Nagar',
    lat: 21.1298,
    lng: 79.0605,
    category: 'chowk',
    aliases: ['bajaj nagar chowk', 'bajaj nagar square'],
  },
  {
    name: 'Lokmat Square',
    hindiName: 'लोकमत चौक',
    marathiName: 'लोकमत चौक',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Wardha Road / Ramdaspeth',
    lat: 21.1355,
    lng: 79.0785,
    category: 'chowk',
    aliases: ['lokmat square', 'lokmat chowk', 'lokmat bhavan chowk', 'wardha road lokmat'],
  },
  {
    name: 'Kadbi Chowk',
    hindiName: 'कड़बी चौक',
    marathiName: 'कडबी चौक',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Kadbi Chowk',
    lat: 21.1668,
    lng: 79.0845,
    category: 'chowk',
    aliases: ['kadbi chowk', 'kadbi square', 'kamptee road kadbi'],
  },
  {
    name: 'Indora Chowk',
    hindiName: 'इंदोरा चौक',
    marathiName: 'इंदोरा चौक',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Indora',
    lat: 21.1735,
    lng: 79.0910,
    category: 'chowk',
    aliases: ['indora chowk', 'indora square', 'dr ambedkar chowk indora'],
  },
  {
    name: 'Pachpaoli Chowk',
    hindiName: 'पाचपावली चौक',
    marathiName: 'पाचपावली चौक',
    zone: 'North-Central Zone',
    wardId: 'ward-07',
    wardName: 'Ward 07, Pachpaoli',
    lat: 21.1645,
    lng: 79.1120,
    category: 'chowk',
    aliases: ['pachpaoli chowk', 'pachpaoli bridge', 'pachpaoli square'],
  },
  {
    name: 'Agrasen Chowk',
    hindiName: 'अग्रसेन चौक',
    marathiName: 'अग्रसेन चौक',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Gandhibagh',
    lat: 21.1510,
    lng: 79.1025,
    category: 'chowk',
    aliases: ['agrasen chowk', 'agrasen square', 'gandhibagh agrasen'],
  },
  {
    name: 'Gandhibagh Chowk',
    hindiName: 'गांधीबाग चौक',
    marathiName: 'गांधीबाग चौक',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Gandhibagh',
    lat: 21.1495,
    lng: 79.1030,
    category: 'chowk',
    aliases: ['gandhibagh chowk', 'central avenue gandhibagh'],
  },
  {
    name: 'Dosar Bhavan Chowk',
    hindiName: 'दोसर भवन चौक',
    marathiName: 'दोसर भवन चौक',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Central Avenue',
    lat: 21.1515,
    lng: 79.0965,
    category: 'chowk',
    aliases: ['dosar bhavan', 'dosar bhavan chowk', 'ca road dosar bhavan'],
  },
  {
    name: 'Ganjakhet Chowk',
    hindiName: 'गंजखेत चौक',
    marathiName: 'गंजखेत चौक',
    zone: 'Central-East Zone',
    wardId: 'ward-07',
    wardName: 'Ward 07, Itwari',
    lat: 21.1530,
    lng: 79.1105,
    category: 'chowk',
    aliases: ['ganjakhet chowk', 'ganjakhet square', 'itwari ganjakhet'],
  },
  {
    name: 'Golibar Chowk',
    hindiName: 'गोलीबार चौक',
    marathiName: 'गोळीबार चौक',
    zone: 'Central-East Zone',
    wardId: 'ward-07',
    wardName: 'Ward 07, Timki / Itwari',
    lat: 21.1575,
    lng: 79.1070,
    category: 'chowk',
    aliases: ['golibar chowk', 'golibar square', 'timki chowk'],
  },
  {
    name: 'Telephone Exchange Square',
    hindiName: 'टेलीफोन एक्सचेंज चौक',
    marathiName: 'टेलिफोन एक्सचेंज चौक',
    zone: 'East Zone',
    wardId: 'ward-22',
    wardName: 'Ward 22, CA Road',
    lat: 21.1470,
    lng: 79.1235,
    category: 'chowk',
    aliases: ['telephone exchange square', 'telephone exchange chowk', 'ca road telephone exchange'],
  },
  {
    name: 'Baidyanath Square',
    hindiName: 'बैद्यनाथ चौक',
    marathiName: 'बैद्यनाथ चौक',
    zone: 'South-East Zone',
    wardId: 'ward-18',
    wardName: 'Ward 18, Great Nag Road',
    lat: 21.1350,
    lng: 79.1010,
    category: 'chowk',
    aliases: ['baidyanath square', 'baidyanath chowk', 'great nag road chowk'],
  },
  {
    name: 'Ashok Square',
    hindiName: 'अशोक चौक',
    marathiName: 'अशोक चौक',
    zone: 'South-East Zone',
    wardId: 'ward-18',
    wardName: 'Ward 18, Reshimbagh Road',
    lat: 21.1430,
    lng: 79.1120,
    category: 'chowk',
    aliases: ['ashok square', 'ashok chowk', 'bhandara road ashok chowk'],
  },
  {
    name: 'Tukdoji Putla Square',
    hindiName: 'तुकड़ोजी पुतला चौक',
    marathiName: 'तुकडोजी पुतळा चौक',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Manewada Road',
    lat: 21.1180,
    lng: 79.0970,
    category: 'chowk',
    aliases: ['tukdoji putla', 'tukdoji chowk', 'tukdoji putla square', 'manewada road chowk'],
  },
  {
    name: 'Omkar Nagar Square',
    hindiName: 'ओमकार नगर चौक',
    marathiName: 'ओमकार नगर चौक',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Manewada Road',
    lat: 21.1090,
    lng: 79.0980,
    category: 'chowk',
    aliases: ['omkar nagar square', 'omkar nagar chowk', 'manewada omkar nagar'],
  },
  {
    name: 'Shatabdi Square',
    hindiName: 'शताब्दी चौक',
    marathiName: 'शताब्दी चौक',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Ring Road / Manish Nagar',
    lat: 21.0960,
    lng: 79.0820,
    category: 'chowk',
    aliases: ['shatabdi square', 'shatabdi chowk', 'manish nagar shatabdi square'],
  },
  {
    name: 'Narendra Nagar Square',
    hindiName: 'नरेंद्र नगर चौक',
    marathiName: 'नरेंद्र नगर चौक',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Narendra Nagar',
    lat: 21.1042,
    lng: 79.0798,
    category: 'chowk',
    aliases: ['narendra nagar square', 'narendra nagar chowk', 'ring road flyover narendra nagar'],
  },
  {
    name: 'Manewada Ring Road Square',
    hindiName: 'मानेवाड़ा चौक',
    marathiName: 'मानेवाडा चौक',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Manewada',
    lat: 21.1015,
    lng: 79.0985,
    category: 'chowk',
    aliases: ['manewada chowk', 'manewada square', 'manewada ring road'],
  },
  {
    name: 'Besa Square',
    hindiName: 'बेसा चौक',
    marathiName: 'बेसा चौक',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Besa Road',
    lat: 21.0825,
    lng: 79.0945,
    category: 'chowk',
    aliases: ['besa square', 'besa chowk', 'besa pipla square'],
  },
  {
    name: 'Jaiprakash Nagar Square',
    hindiName: 'जयप्रकाश नगर चौक',
    marathiName: 'जयप्रकाश नगर चौक',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Wardha Road',
    lat: 21.1010,
    lng: 79.0660,
    category: 'chowk',
    aliases: ['jaiprakash nagar square', 'jp nagar chowk', 'wardha road metro chowk'],
  },
  {
    name: 'Hingna T-Point',
    hindiName: 'हिंगणा टी-पॉइंट',
    marathiName: 'हिंगणा टी-पॉइंट',
    zone: 'South-West Zone',
    wardId: 'ward-15',
    wardName: 'Ward 15, Hingna Road',
    lat: 21.1170,
    lng: 79.0310,
    category: 'chowk',
    aliases: ['hingna t point', 'hingna naka', 'hingna road square'],
  },
  {
    name: 'Trimurti Nagar Square',
    hindiName: 'त्रिमूर्ति नगर चौक',
    marathiName: 'त्रिमूर्ती नगर चौक',
    zone: 'South-West Zone',
    wardId: 'ward-15',
    wardName: 'Ward 15, Trimurti Nagar',
    lat: 21.1162,
    lng: 79.0435,
    category: 'chowk',
    aliases: ['trimurti nagar square', 'trimurti nagar chowk', 'ring road trimurti nagar'],
  },

  // ========================================================
  // MAJOR LOCALITIES & NEIGHBORHOODS
  // ========================================================
  {
    name: 'Dharampeth',
    hindiName: 'धरमपेठ',
    marathiName: 'धरमपेठ',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Dharampeth',
    lat: 21.1448,
    lng: 79.0688,
    category: 'locality',
    aliases: ['dharampeth', 'whc road', 'coffee house square'],
  },
  {
    name: 'Laxmi Nagar',
    hindiName: 'लक्ष्मी नगर',
    marathiName: 'लक्ष्मी नगर',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Laxmi Nagar',
    lat: 21.1275,
    lng: 79.0682,
    category: 'locality',
    aliases: ['laxmi nagar', 'laxmi nagar square', 'water tank laxmi nagar'],
  },
  {
    name: 'Sitabuldi',
    hindiName: 'सीताबर्डी',
    marathiName: 'सीताबर्डी',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Sitabuldi',
    lat: 21.1442,
    lng: 79.0849,
    category: 'locality',
    aliases: ['sitabuldi', 'burdi market', 'main road sitabuldi'],
  },
  {
    name: 'Sadar',
    hindiName: 'सदर',
    marathiName: 'सदर',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Sadar',
    lat: 21.1612,
    lng: 79.0818,
    category: 'locality',
    aliases: ['sadar', 'sadar bazaar', 'residency road', 'mount road'],
  },
  {
    name: 'Civil Lines',
    hindiName: 'सिविल लाइन्स',
    marathiName: 'सिव्हिल लाइन्स',
    zone: 'West Zone',
    wardId: 'ward-02',
    wardName: 'Ward 02, Civil Lines',
    lat: 21.1539,
    lng: 79.0694,
    category: 'locality',
    aliases: ['civil lines', 'vca stadium civil lines', 'collector office'],
  },
  {
    name: 'Ramdaspeth',
    hindiName: 'रामदासपेठ',
    marathiName: 'रामदासपेठ',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Ramdaspeth',
    lat: 21.1378,
    lng: 79.0762,
    category: 'locality',
    aliases: ['ramdaspeth', 'canal road ramdaspeth'],
  },
  {
    name: 'Dhantoli',
    hindiName: 'धंतोली',
    marathiName: 'धंतोली',
    zone: 'Central Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Dhantoli',
    lat: 21.1345,
    lng: 79.0838,
    category: 'locality',
    aliases: ['dhantoli', 'dhantoli park', 'hospital road dhantoli'],
  },
  {
    name: 'Khamla',
    hindiName: 'खामला',
    marathiName: 'खामला',
    zone: 'South-West Zone',
    wardId: 'ward-15',
    wardName: 'Ward 15, Khamla',
    lat: 21.1165,
    lng: 79.0628,
    category: 'locality',
    aliases: ['khamla', 'khamla market', 'sindhi colony khamla'],
  },
  {
    name: 'Manish Nagar',
    hindiName: 'मनीष नगर',
    marathiName: 'मनीष नगर',
    zone: 'South Zone',
    wardId: 'ward-16',
    wardName: 'Ward 16, Somalwada / Manish Nagar',
    lat: 21.0895,
    lng: 79.0772,
    category: 'locality',
    aliases: ['manish nagar', 'manish nagar railway crossing', 'somalwada'],
  },
  {
    name: 'Gokulpeth Market',
    hindiName: 'गोकुलपेठ बाजार',
    marathiName: 'गोकुळपेठ बाजार',
    zone: 'West Zone',
    wardId: 'ward-12',
    wardName: 'Ward 12, Gokulpeth',
    lat: 21.1402,
    lng: 79.0625,
    category: 'locality',
    aliases: ['gokulpeth', 'gokulpeth market', 'whc road market'],
  },
  {
    name: 'Jaripatka',
    hindiName: 'जरीपटका',
    marathiName: 'जरीपटका',
    zone: 'North Zone',
    wardId: 'ward-04',
    wardName: 'Ward 04, Jaripatka',
    lat: 21.1820,
    lng: 79.0880,
    category: 'locality',
    aliases: ['jaripatka', 'jaripatka main road', 'sindhi market jaripatka'],
  },
  {
    name: 'Itwari',
    hindiName: 'इतवारी',
    marathiName: 'इतवारी',
    zone: 'Central-East Zone',
    wardId: 'ward-07',
    wardName: 'Ward 07, Itwari',
    lat: 21.1558,
    lng: 79.1082,
    category: 'locality',
    aliases: ['itwari', 'sarafa bazaar itwari', 'kirana market itwari'],
  },
  {
    name: 'Mahal',
    hindiName: 'महाल',
    marathiName: 'महाल',
    zone: 'Central Zone',
    wardId: 'ward-09',
    wardName: 'Ward 09, Mahal',
    lat: 21.1448,
    lng: 79.1035,
    category: 'locality',
    aliases: ['mahal', 'tilak putla mahal', 'kalyaneswar mandir mahal'],
  },
  {
    name: 'Cotton Market',
    hindiName: 'कॉटन मार्केट',
    marathiName: 'कॉटन मार्केट',
    zone: 'Central-East Zone',
    wardId: 'ward-08',
    wardName: 'Ward 08, Cotton Market',
    lat: 21.1465,
    lng: 79.0915,
    category: 'locality',
    aliases: ['cotton market', 'subhash road', 'vegetable market nagpur'],
  },
  {
    name: 'Reshimbagh Ground',
    hindiName: 'रेशीमबाग',
    marathiName: 'रेशीमबाग',
    zone: 'South-East Zone',
    wardId: 'ward-18',
    wardName: 'Ward 18, Reshimbagh / Great Nag Road',
    lat: 21.1235,
    lng: 79.1085,
    category: 'locality',
    aliases: ['reshimbagh', 'reshimbagh ground', 'smruti mandir reshimbagh'],
  },
  {
    name: 'Nandanvan',
    hindiName: 'नंदनवन',
    marathiName: 'नंदनवन',
    zone: 'East Zone',
    wardId: 'ward-24',
    wardName: 'Ward 24, Nandanvan',
    lat: 21.1315,
    lng: 79.1302,
    category: 'locality',
    aliases: ['nandanvan', 'nandanvan layout', 'kdk college road'],
  },
];

/**
 * Filter localities and famous places matching query from curated catalog
 */
export function searchNagpurLocalities(query: string): NagpurLocality[] {
  const q = query.trim().toLowerCase();
  if (!q) return NAGPUR_LOCALITIES.slice(0, 10);

  // Score matches: exact/starts with higher priority
  const matches = NAGPUR_LOCALITIES.filter((loc) => {
    if (loc.name.toLowerCase().includes(q)) return true;
    if (loc.hindiName.includes(q)) return true;
    if (loc.marathiName.includes(q)) return true;
    if (loc.zone.toLowerCase().includes(q)) return true;
    if (loc.wardName.toLowerCase().includes(q)) return true;
    if (loc.category && loc.category.toLowerCase().includes(q)) return true;
    if (loc.aliases && loc.aliases.some((alias) => alias.toLowerCase().includes(q) || q.includes(alias.toLowerCase()))) {
      return true;
    }
    return false;
  });

  // Sort: prioritize items whose name or alias begins with query
  matches.sort((a, b) => {
    const aStartsWith = a.name.toLowerCase().startsWith(q) || (a.aliases && a.aliases.some(al => al.startsWith(q)));
    const bStartsWith = b.name.toLowerCase().startsWith(q) || (b.aliases && b.aliases.some(al => al.startsWith(q)));
    if (aStartsWith && !bStartsWith) return -1;
    if (!aStartsWith && bStartsWith) return 1;
    return 0;
  });

  return matches;
}

/**
 * Live multi-engine search:
 * 1. Curated Nagpur Catalog (Malls, Theaters, Hospitals, Chowks, Landmarks)
 * 2. Live OpenStreetMap Nominatim with Nagpur viewbox bias
 * 3. Live Komoot Photon (fuzzy typo-tolerant OSM geocoder) centered on Nagpur
 * Returns ANY place that shows up on Google Maps!
 */
export async function searchNagpurLocationsLive(query: string): Promise<NagpurLocality[]> {
  const trimmed = query.trim();
  if (!trimmed) return NAGPUR_LOCALITIES.slice(0, 8);

  const localMatches = searchNagpurLocalities(trimmed);

  const liveResults: NagpurLocality[] = [];

  const cleanSearch = trimmed.toLowerCase().includes('nagpur')
    ? trimmed
    : `${trimmed}, Nagpur`;

  // Fetch from Nominatim (OSM)
  const nominatimPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2800);

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanSearch)}&viewbox=78.85,21.32,79.28,20.98&countrycodes=in&limit=6&addressdetails=1`,
        {
          signal: controller.signal,
          headers: { 'Accept-Language': 'en' },
        }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          for (const item of data) {
            const lat = parseFloat(item.lat);
            const lng = parseFloat(item.lon);
            const closest = getClosestNagpurLocality(lat, lng);
            const title = item.name || item.display_name.split(',')[0].trim();

            // Infer category
            let cat: PlaceCategory = 'locality';
            const typeLower = (item.type || '').toLowerCase();
            const classLower = (item.class || '').toLowerCase();
            if (typeLower.includes('mall') || classLower.includes('mall') || title.toLowerCase().includes('mall')) {
              cat = 'mall';
            } else if (typeLower.includes('cinema') || typeLower.includes('theatre') || title.toLowerCase().includes('cinema')) {
              cat = 'theater';
            } else if (typeLower.includes('hospital') || classLower.includes('hospital')) {
              cat = 'hospital';
            } else if (typeLower.includes('college') || typeLower.includes('university') || typeLower.includes('school')) {
              cat = 'college';
            }

            liveResults.push({
              name: title,
              hindiName: title,
              marathiName: title,
              zone: closest.zone,
              wardId: closest.wardId,
              wardName: closest.wardName,
              lat,
              lng,
              category: cat,
              isLiveResult: true,
            });
          }
        }
      }
    } catch {
      // ignore timeout
    }
  })();

  // Fetch from Photon (Komoot fuzzy geocoder)
  const photonPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500);

      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&lat=21.1458&lon=79.0882&limit=6`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.features)) {
          for (const f of data.features) {
            const lat = f.geometry.coordinates[1];
            const lng = f.geometry.coordinates[0];

            // Ensure within Nagpur metropolitan boundary (approx 35km radius)
            const dLat = Math.abs(lat - 21.1458);
            const dLon = Math.abs(lng - 79.0882);
            if (dLat < 0.35 && dLon < 0.35) {
              const closest = getClosestNagpurLocality(lat, lng);
              const name = f.properties.name || f.properties.street || trimmed;
              const osmValue = (f.properties.osm_value || '').toLowerCase();

              let cat: PlaceCategory = 'locality';
              if (osmValue.includes('mall') || name.toLowerCase().includes('mall')) cat = 'mall';
              else if (osmValue.includes('cinema') || osmValue.includes('theatre') || name.toLowerCase().includes('cinema')) cat = 'theater';
              else if (osmValue.includes('hospital')) cat = 'hospital';
              else if (osmValue.includes('college') || osmValue.includes('university')) cat = 'college';

              liveResults.push({
                name,
                hindiName: name,
                marathiName: name,
                zone: closest.zone,
                wardId: closest.wardId,
                wardName: closest.wardName,
                lat,
                lng,
                category: cat,
                isLiveResult: true,
              });
            }
          }
        }
      }
    } catch {
      // ignore
    }
  })();

  await Promise.allSettled([nominatimPromise, photonPromise]);

  // Merge and deduplicate by normalized name
  const combined = [...localMatches];
  const seen = new Set(localMatches.map((m) => m.name.toLowerCase().replace(/[^a-z0-9]/g, '')));

  for (const item of liveResults) {
    const key = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (key && !seen.has(key)) {
      seen.add(key);
      combined.push(item);
    }
  }

  return combined;
}

/**
 * Request real device GPS location with high accuracy
 */
export async function detectDeviceLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Find closest locality from catalog based on coordinates
 */
export function getClosestNagpurLocality(lat: number, lng: number): NagpurLocality {
  let closest = NAGPUR_LOCALITIES[0];
  let minDistance = Infinity;

  for (const loc of NAGPUR_LOCALITIES) {
    const dist = Math.hypot(loc.lat - lat, loc.lng - lng);
    if (dist < minDistance) {
      minDistance = dist;
      closest = loc;
    }
  }
  return closest;
}

/**
 * Reverse geocode coordinates to street address
 */
export async function reverseGeocodeCoords(
  lat: number,
  lng: number
): Promise<{ address: string; ward: string; wardId: string }> {
  const closest = getClosestNagpurLocality(lat, lng);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        signal: controller.signal,
        headers: { 'Accept-Language': 'en' },
      }
    );
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        const addr = data.address || {};
        const road = addr.road || addr.pedestrian || addr.suburb || closest.name;
        const neighbourhood = addr.neighbourhood || addr.suburb || closest.name;
        return {
          address: `${road}, Near ${neighbourhood}`,
          ward: closest.wardName,
          wardId: closest.wardId,
        };
      }
    }
  } catch {
    // Fallback to local catalog
  }

  return {
    address: `Near ${closest.name}, Nagpur`,
    ward: closest.wardName,
    wardId: closest.wardId,
  };
}
