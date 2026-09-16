import { Language } from '../types';

export interface Translations {
  appName: string;
  tagline: string;
  roles: {
    citizen: string;
    employee: string;
    supervisor: string;
  };
  greeting: {
    morning: string;
    afternoon: string;
    evening: string;
    question: string;
  };
  home: {
    micCta: string;
    micSubtext: string;
    or: string;
    writeCta: string;
    yourLocation: string;
    recentComplaints: string;
    viewAll: string;
  };
  voice: {
    listening: string;
    instruction: string;
    tapToStop: string;
    micPermissionError: string;
    quickPresetsTitle: string;
    presets: {
      pothole: string;
      garbage: string;
      streetlight: string;
      waterleak: string;
    };
  };
  understood: {
    title: string;
    subtitle: string;
    categoryLabel: string;
    departmentLabel: string;
    priorityLabel: string;
    slaLabel: string;
    isCorrect: string;
    confirmBtn: string;
    editBtn: string;
  };
  photo: {
    title: string;
    subtitle: string;
    takePhoto: string;
    uploadGallery: string;
    skip: string;
    samplePresetsTitle: string;
    photoAttached: string;
    removePhoto: string;
  };
  location: {
    title: string;
    mapSubtext: string;
    near: string;
    isCorrect: string;
    confirmBtn: string;
    movePinHint: string;
    duplicateAlertTitle: string;
    duplicateAlertBody: string;
    joinComplaintBtn: string;
    continueNewBtn: string;
  };
  summary: {
    title: string;
    subtitle: string;
    photoAttached: string;
    noPhoto: string;
    deptNotice: string;
    submitBtn: string;
    submitting: string;
    trackNotice: string;
  };
  success: {
    title: string;
    ticketNum: string;
    routedTo: string;
    slaNotice: string;
    trackBtn: string;
    homeBtn: string;
    notifyNote: string;
  };
  tracking: {
    title: string;
    timelineTitle: string;
    reported: string;
    deptAssigned: string;
    empAssigned: string;
    inProgress: string;
    completed: string;
    verified: string;
    resolved: string;
    beforePhoto: string;
    afterPhoto: string;
    proofTitle: string;
    feedbackTitle: string;
    feedbackYes: string;
    feedbackNo: string;
    feedbackThanks: string;
    feedbackReopenNotice: string;
  };
  nav: {
    home: string;
    complaints: string;
    profile: string;
  };
  categories: {
    roads: string;
    sanitation: string;
    water: string;
    lighting: string;
    infrastructure: string;
  };
  priorities: {
    low: string;
    medium: string;
    high: string;
    critical: string;
  };
  statuses: {
    submitted: string;
    classified: string;
    dept_assigned: string;
    employee_assigned: string;
    accepted: string;
    in_progress: string;
    completed: string;
    verified: string;
    resolved: string;
    reopened: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    appName: 'Pragya',
    tagline: 'Tell us. We’ll route it. Track it. Fix it.',
    roles: {
      citizen: 'Citizen Portal',
      employee: 'Field Employee',
      supervisor: 'Supervisor Desk',
    },
    greeting: {
      morning: '☀️ Good morning',
      afternoon: '🌤️ Good afternoon',
      evening: '🌙 Good evening',
      question: 'What happened?',
    },
    home: {
      micCta: 'Tell Pragya what’s wrong',
      micSubtext: 'Tap the microphone and speak in your language',
      or: 'or',
      writeCta: '✍️ Write it instead',
      yourLocation: '📍 Your detected location',
      recentComplaints: 'My Recent Complaints',
      viewAll: 'View all',
    },
    voice: {
      listening: "I'm listening...",
      instruction: 'Tell me what happened in Hindi, Marathi, or English',
      tapToStop: 'Tap to stop',
      micPermissionError: 'Microphone access is unavailable. You can click any sample voice preset below!',
      quickPresetsTitle: 'Or tap a real civic scenario:',
      presets: {
        pothole: 'Road: "Hamare road pe bahut bada pothole hai aur bikes gir rahi hain"',
        garbage: 'Garbage: "Yahan market ke paas kachra 4 din se nahi uthaya gaya hai"',
        streetlight: 'Streetlight: "Street light kharab hai pichle teen din se, andhera rehta hai"',
        waterleak: 'Water: "Main pipeline phat gayi hai aur bohot paani barbad ho raha hai"',
      },
    },
    understood: {
      title: 'I understood',
      subtitle: 'Pragya analyzed your issue and identified the details',
      categoryLabel: 'Category',
      departmentLabel: 'Assigned Department',
      priorityLabel: 'Priority',
      slaLabel: 'Expected SLA',
      isCorrect: 'Is that correct?',
      confirmBtn: 'Yes, continue',
      editBtn: 'Edit description',
    },
    photo: {
      title: 'Show us the problem 📸',
      subtitle: 'A photo helps municipal teams locate and verify the issue faster.',
      takePhoto: 'Take photo',
      uploadGallery: 'Upload from device',
      skip: 'Skip for now',
      samplePresetsTitle: 'Select sample civic evidence:',
      photoAttached: 'Photo attached',
      removePhoto: 'Remove photo',
    },
    location: {
      title: 'Where is the problem? 📍',
      mapSubtext: 'We found your approximate location. You can drag the pin to adjust.',
      near: 'Near',
      isCorrect: 'Is this correct?',
      confirmBtn: 'Yes, confirm location',
      movePinHint: 'Tap anywhere on the map or drag the pin to fine-tune',
      duplicateAlertTitle: 'Similar complaint reported nearby!',
      duplicateAlertBody: 'Another citizen already reported an issue at this spot (#PRG-10187). You can join it to raise its urgency or submit a separate report.',
      joinComplaintBtn: 'Join Existing Complaint (+1)',
      continueNewBtn: 'Submit New Complaint',
    },
    summary: {
      title: 'Almost done ✓',
      subtitle: 'Review before submitting to the municipal corporation',
      photoAttached: '1 photo attached',
      noPhoto: 'No photo attached',
      deptNotice: "We'll route this directly to the responsible municipal team.",
      submitBtn: 'Report Problem',
      submitting: 'Submitting complaint...',
      trackNotice: 'You can track real-time resolution progress anytime.',
    },
    success: {
      title: 'Problem reported!',
      ticketNum: 'Complaint ID',
      routedTo: 'Sent to Department',
      slaNotice: 'Expected response within 48 hours',
      trackBtn: 'Track complaint',
      homeBtn: 'Back to Home',
      notifyNote: "We'll send updates as soon as the team starts work.",
    },
    tracking: {
      title: 'Complaint Tracking',
      timelineTitle: 'Resolution Timeline',
      reported: 'Reported',
      deptAssigned: 'Department assigned',
      empAssigned: 'Employee assigned',
      inProgress: 'Work in progress',
      completed: 'Work completed',
      verified: 'Supervisor verified',
      resolved: 'Resolved',
      beforePhoto: 'Citizen Evidence (Before)',
      afterPhoto: 'Official Proof of Work (After)',
      proofTitle: 'Evidence Comparison',
      feedbackTitle: 'Was your problem resolved?',
      feedbackYes: '👍 Yes, satisfied',
      feedbackNo: '👎 No, still an issue',
      feedbackThanks: 'Thank you for your feedback! It helps keep our civic teams accountable.',
      feedbackReopenNotice: 'Issue has been flagged for supervisor re-inspection.',
    },
    nav: {
      home: 'Home',
      complaints: 'Complaints',
      profile: 'Profile',
    },
    categories: {
      roads: 'Roads & Potholes',
      sanitation: 'Waste & Garbage',
      water: 'Water Supply & Drainage',
      lighting: 'Street Lighting & Power',
      infrastructure: 'Public Infrastructure',
    },
    priorities: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },
    statuses: {
      submitted: 'Submitted',
      classified: 'AI Classified',
      dept_assigned: 'Department Assigned',
      employee_assigned: 'Employee Assigned',
      accepted: 'Accepted by Field Team',
      in_progress: 'In Progress',
      completed: 'Completed (Pending Verification)',
      verified: 'Supervisor Verified',
      resolved: 'Resolved',
      reopened: 'Reopened for Review',
    },
  },
  hi: {
    appName: 'प्रज्ञा',
    tagline: 'समस्या बताएं। हम पहुंचाएंगे, ट्रैक करेंगे और ठीक करेंगे।',
    roles: {
      citizen: 'नागरिक पोर्टल',
      employee: 'फील्ड कर्मचारी',
      supervisor: 'पर्यवेक्षक डैशबोर्ड',
    },
    greeting: {
      morning: '☀️ सुप्रभात',
      afternoon: '🌤️ दोपहर की नमस्ते',
      evening: '🌙 शुभ संध्या',
      question: 'क्या समस्या हुई?',
    },
    home: {
      micCta: 'प्रज्ञा को बताएं क्या हुआ',
      micSubtext: 'माइक दबाएं और अपनी भाषा में बोलें',
      or: 'या',
      writeCta: '✍️ लिखकर बताएं',
      yourLocation: '📍 आपका पता लगाया गया स्थान',
      recentComplaints: 'मेरी हाल की शिकायतें',
      viewAll: 'सभी देखें',
    },
    voice: {
      listening: 'मैं सुन रहा हूँ...',
      instruction: 'हिंदी, मराठी या अंग्रेजी में अपनी समस्या बताएं',
      tapToStop: 'रोकने के लिए दबाएं',
      micPermissionError: 'माइक्रोफ़ोन उपलब्ध नहीं है। आप नीचे दिए गए उदाहरणों पर क्लिक कर सकते हैं!',
      quickPresetsTitle: 'या कोई वास्तविक समस्या चुनें:',
      presets: {
        pothole: 'सड़क: "हमारे रोड पर बहुत बड़ा गड्ढा है और गाड़ियां फिसल रही हैं"',
        garbage: 'कचरा: "यहां बाजार के पास चार दिन से कचरा नहीं उठाया गया है"',
        streetlight: 'स्ट्रीट लाइट: "स्ट्रीट लाइट खराब है, रात को पूरा अंधेरा रहता है"',
        waterleak: 'पानी: "मेन पाइपलाइन टूट गई है और पीने का पानी बह रहा है"',
      },
    },
    understood: {
      title: 'मैंने समझा',
      subtitle: 'प्रज्ञा ने आपकी शिकायत का विश्लेषण कर लिया है',
      categoryLabel: 'श्रेणी',
      departmentLabel: 'जिम्मेदार विभाग',
      priorityLabel: 'प्राथमिकता',
      slaLabel: 'अनुमानित समाधान समय',
      isCorrect: 'क्या यह सही है?',
      confirmBtn: 'हाँ, आगे बढ़ें',
      editBtn: 'विवरण बदलें',
    },
    photo: {
      title: 'समस्या की फोटो दिखाएं 📸',
      subtitle: 'फोटो से नगर निगम टीम को समस्या जल्दी समझने और सुलझाने में मदद मिलती है।',
      takePhoto: 'फोटो खींचें',
      uploadGallery: 'गैलरी से चुनें',
      skip: 'अभी छोड़ें',
      samplePresetsTitle: 'नमूना फोटो चुनें:',
      photoAttached: 'फोटो संलग्न है',
      removePhoto: 'फोटो हटाएं',
    },
    location: {
      title: 'समस्या कहाँ है? 📍',
      mapSubtext: 'हमने आपका स्थान पहचाना है। पिन खिसका कर बदल सकते हैं।',
      near: 'के पास',
      isCorrect: 'क्या यह स्थान सही है?',
      confirmBtn: 'हाँ, स्थान की पुष्टि करें',
      movePinHint: 'सटीक स्थान सेट करने के लिए मानचित्र पर पिन खिसकाएं',
      duplicateAlertTitle: 'पास में ऐसी ही शिकायत पहले से दर्ज है!',
      duplicateAlertBody: 'एक अन्य नागरिक ने यहां समस्या दर्ज कराई है (#PRG-10187)। आप इसमें जुड़ सकते हैं।',
      joinComplaintBtn: 'मौजूदा शिकायत में जुड़ें (+1)',
      continueNewBtn: 'नई शिकायत दर्ज करें',
    },
    summary: {
      title: 'लगभग पूरा हुआ ✓',
      subtitle: 'नगर निगम को भेजने से पहले जांच लें',
      photoAttached: '1 फोटो संलग्न',
      noPhoto: 'कोई फोटो नहीं',
      deptNotice: 'हम इसे सीधे सही नगरपालिका विभाग को भेजेंगे।',
      submitBtn: 'शिकायत दर्ज करें',
      submitting: 'शिकायत भेजी जा रही है...',
      trackNotice: 'आप कभी भी स्थिति ट्रैक कर सकते हैं।',
    },
    success: {
      title: 'शिकायत दर्ज हो गई!',
      ticketNum: 'शिकायत क्रमांक',
      routedTo: 'विभाग को भेजा गया',
      slaNotice: '48 घंटे के भीतर समाधान अपेक्षित',
      trackBtn: 'शिकायत ट्रैक करें',
      homeBtn: 'मुख्य पृष्ठ पर जाएं',
      notifyNote: 'कार्य शुरू होते ही आपको सूचना मिलेगी।',
    },
    tracking: {
      title: 'शिकायत की स्थिति',
      timelineTitle: 'समाधान समयरेखा',
      reported: 'दर्ज की गई',
      deptAssigned: 'विभाग सौंपा गया',
      empAssigned: 'कर्मचारी नियुक्त',
      inProgress: 'कार्य प्रगति पर है',
      completed: 'काम पूरा (सत्यापन प्रतीक्षित)',
      verified: 'पर्यवेक्षक द्वारा सत्यापित',
      resolved: 'समाधान हो गया',
      beforePhoto: 'नागरिक का फोटो (पहले)',
      afterPhoto: 'काम का सरकारी सबूत (बाद में)',
      proofTitle: 'सबूतों की तुलना',
      feedbackTitle: 'क्या आपकी समस्या हल हो गई?',
      feedbackYes: '👍 हाँ, संतुष्ट हूँ',
      feedbackNo: '👎 नहीं, अभी भी समस्या है',
      feedbackThanks: 'आपकी प्रतिक्रिया के लिए धन्यवाद!',
      feedbackReopenNotice: 'पर्यवेक्षक को पुनर्निरीक्षण के लिए सूचित कर दिया गया है।',
    },
    nav: {
      home: 'होम',
      complaints: 'शिकायतें',
      profile: 'प्रोफ़ाइल',
    },
    categories: {
      roads: 'सड़क एवं गड्ढे',
      sanitation: 'सफाई एवं कचरा',
      water: 'जल आपूर्ति एवं नाली',
      lighting: 'मार्ग प्रकाश (स्ट्रीट लाइट)',
      infrastructure: 'सार्वजनिक बुनियादी ढांचा',
    },
    priorities: {
      low: 'सामान्य',
      medium: 'मध्यम',
      high: 'उच्च',
      critical: 'अति आवश्यक',
    },
    statuses: {
      submitted: 'दर्ज हुई',
      classified: 'एआई द्वारा वर्गीकृत',
      dept_assigned: 'विभाग को सौंपी गई',
      employee_assigned: 'कर्मचारी नियुक्त',
      accepted: 'स्वीकार की गई',
      in_progress: 'प्रगति पर है',
      completed: 'कार्य पूर्ण',
      verified: 'सत्यापित',
      resolved: 'समाधान संपन्न',
      reopened: 'पुनः खोली गई',
    },
  },
  mr: {
    appName: 'प्रज्ञा',
    tagline: 'समस्या सांगा. आम्ही योग्य विभागाकडे पोहोचवू, ट्रॅक करू आणि सोडवू.',
    roles: {
      citizen: 'नागरिक पोर्टल',
      employee: 'कर्मचारी डॅशबोर्ड',
      supervisor: 'पर्यवेक्षक नियंत्रण कक्ष',
    },
    greeting: {
      morning: '☀️ शुभ सकाळ',
      afternoon: '🌤️ शुभ दुपार',
      evening: '🌙 शुभ संध्याकाळ',
      question: 'काय अडचण झाली आहे?',
    },
    home: {
      micCta: 'प्रज्ञाला सांगा काय अडचण आहे',
      micSubtext: 'माइक टॅप करा आणि आपल्या भाषेत बोला',
      or: 'किंवा',
      writeCta: '✍️ लिहून सांगा',
      yourLocation: '📍 आपले शोधलेले स्थान',
      recentComplaints: 'माझ्या तक्रारी',
      viewAll: 'सर्व पहा',
    },
    voice: {
      listening: 'मी ऐकत आहे...',
      instruction: 'मराठी, हिंदी किंवा इंग्रजीत बोला',
      tapToStop: 'थांबवण्यासाठी टॅप करा',
      micPermissionError: 'मायक्रोफोन उपलब्ध नाही. आपण खालील उदाहरणे निवडू शकता!',
      quickPresetsTitle: 'किंवा ही उदाहरणे निवडा:',
      presets: {
        pothole: 'रस्ता: "आमच्या रस्त्यावर खूप मोठा खड्डा पडला आहे, गाड्या पडत आहेत"',
        garbage: 'कचरा: "बाजारपेठेत चार दिवसांपासून कचरा उचललेला नाही"',
        streetlight: 'दिवे: "स्ट्रीट लाईट बंद आहे, रात्री पूर्ण अंधार असतो"',
        waterleak: 'पाणी: "मुख्य पाईपलाईन फुटली असून पिण्याचे पाणी वाया जात आहे"',
      },
    },
    understood: {
      title: 'मला समजले',
      subtitle: 'प्रज्ञाने आपल्या समस्येचे वर्गीकरण केले आहे',
      categoryLabel: 'प्रवर्ग',
      departmentLabel: 'संबंधित विभाग',
      priorityLabel: 'प्राधान्य',
      slaLabel: 'अपेक्षित वेळ',
      isCorrect: 'हे बरोबर आहे का?',
      confirmBtn: 'होय, पुढे चला',
      editBtn: 'बदल करा',
    },
    photo: {
      title: 'समस्येचा फोटो दाखवा 📸',
      subtitle: 'फोटोमुळे महानगरपालिकेला काम लवकर समजण्यास व पूर्ण करण्यास मदत होते.',
      takePhoto: 'फोटो काढा',
      uploadGallery: 'गॅलरीतून निवडा',
      skip: 'सध्या वगळा',
      samplePresetsTitle: 'नमुना फोटो निवडा:',
      photoAttached: 'फोटो जोडला आहे',
      removePhoto: 'फोटो काढा',
    },
    location: {
      title: 'समस्या कुठे आहे? 📍',
      mapSubtext: 'आपले स्थान शोधले आहे. नकाशावर पिन हलवून निश्चित करा.',
      near: 'जवळ',
      isCorrect: 'हे स्थान योग्य आहे का?',
      confirmBtn: 'होय, ठिकाण निश्चित करा',
      movePinHint: 'नकाशावर टॅप करून अचूक जागा निवडा',
      duplicateAlertTitle: 'जवळच अशीच तक्रार आधीच नोंदवली आहे!',
      duplicateAlertBody: 'इतर नागरिकांनी येथे तक्रार नोंदवली आहे (#PRG-10187). आपण त्यात सामील होऊ शकता.',
      joinComplaintBtn: 'तक्रारीत सामील व्हा (+1)',
      continueNewBtn: 'नवीन तक्रार नोंदवा',
    },
    summary: {
      title: 'जवळजवळ पूर्ण झाले ✓',
      subtitle: 'महानगरपालिकेकडे सादर करण्यापूर्वी खात्री करा',
      photoAttached: '१ फोटो जोडला',
      noPhoto: 'फोटो नाही',
      deptNotice: 'आम्ही हे परस्पर योग्य महानगरपालिका विभागाकडे पाठवत आहोत.',
      submitBtn: 'तक्रार नोंदवा',
      submitting: 'तक्रार नोंदवली जात आहे...',
      trackNotice: 'आपण प्रगती कधीही ट्रॅक करू शकता.',
    },
    success: {
      title: 'तक्रार यशस्वीरित्या नोंदवली!',
      ticketNum: 'तक्रार क्रमांक',
      routedTo: 'विभागाकडे पाठवले',
      slaNotice: '४८ तासांत निराकरण अपेक्षित',
      trackBtn: 'तक्रार ट्रॅक करा',
      homeBtn: 'मुख्य पृष्ठावर जा',
      notifyNote: 'काम सुरू झाल्यावर आपल्याला सूचना पाठवली जाईल.',
    },
    tracking: {
      title: 'तक्रार ट्रॅकिंग',
      timelineTitle: 'निराकरण कालमर्यादा',
      reported: 'नोंदवली',
      deptAssigned: 'विभाग सोपवला',
      empAssigned: 'कर्मचारी नियुक्त',
      inProgress: 'काम प्रगतीपथावर',
      completed: 'काम पूर्ण (तपासणी बाकी)',
      verified: 'पर्यवेक्षकाकडून पडताळणी',
      resolved: 'निराकरण झाले',
      beforePhoto: 'नागरिकाचा फोटो (आधी)',
      afterPhoto: 'कामाचा पुरावा (नंतर)',
      proofTitle: 'पुराव्यांची तुलना',
      feedbackTitle: 'आपली अडचण दूर झाली का?',
      feedbackYes: '👍 होय, समाधान झाले',
      feedbackNo: '👎 नाही, अजूनही समस्या आहे',
      feedbackThanks: 'आपल्या अभिप्रायाबद्दल धन्यवाद!',
      feedbackReopenNotice: 'पुनर्तपासणीसाठी वरिष्ठांना कळवले आहे.',
    },
    nav: {
      home: 'मुख्य',
      complaints: 'तक्रारी',
      profile: 'प्रोफाइल',
    },
    categories: {
      roads: 'रस्ते व खड्डे',
      sanitation: 'स्वच्छता व कचरा',
      water: 'पाणीपुरवठा व निचरा',
      lighting: 'पथदिवे (स्ट्रीट लाईट्स)',
      infrastructure: 'सार्वजनिक सुविधा',
    },
    priorities: {
      low: 'कमी',
      medium: 'मध्यम',
      high: 'उच्च',
      critical: 'अत्यंत तातडीचे',
    },
    statuses: {
      submitted: 'नोंदवली',
      classified: 'वर्गीकृत',
      dept_assigned: 'विभाग नियुक्त',
      employee_assigned: 'कर्मचारी नियुक्त',
      accepted: 'स्वीकारले',
      in_progress: 'प्रगतीपथावर',
      completed: 'काम पूर्ण',
      verified: 'पडताळणी झाली',
      resolved: 'निराकरण झाले',
      reopened: 'पुन्हा उघडले',
    },
  },
};

