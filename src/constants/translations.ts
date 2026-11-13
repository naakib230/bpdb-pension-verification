// Comprehensive Bilingual Dictionary (English & Bangla) for BPDB Pensioners
export const TRANSLATIONS = {
  en: {
    // General & Branding
    appTitle: 'BPDB Pension Verification',
    orgName: 'Bangladesh Power Development Board',
    orgNameShort: 'BPDB',
    govtTag: 'Government of the People\'s Republic of Bangladesh',
    languageToggle: 'বাংলা',
    currentLanguageName: 'English',
    loading: 'Loading, please wait...',
    cancel: 'Cancel',
    retry: 'Retry Again',
    continue: 'Continue',
    close: 'Close',
    error: 'Error',
    success: 'Success',
    back: 'Back',

    // Authentication / Login Screen
    loginTitle: 'Pensioner Login',
    loginSubtitle: 'Enter your BPDB Pension ID and National Identity (NID) number to continue.',
    pensionIdLabel: 'BPDB Pension ID',
    pensionIdPlaceholder: 'e.g. BPDB-100452',
    nidLabel: 'National Identity (NID) Number',
    nidPlaceholder: '10 or 17 digit NID number',
    loginButton: 'Login to Pension Portal',
    quickFillTitle: 'Demo Pensioner Profiles (One-Tap Test):',
    loginErrorEmpty: 'Please enter both Pension ID and NID number.',
    loginErrorNotFound: 'No matching BPDB Pensioner record found. Please verify your ID.',

    // Dashboard Screen
    welcomeGreeting: 'Welcome,',
    pensionerIdBadge: 'Pension ID:',
    nidBadge: 'NID:',
    designationBadge: 'Designation:',
    deptBadge: 'Division:',
    monthlyAmount: 'Monthly Pension:',
    statusVerified: 'Verified for Current Month',
    statusDue: 'Monthly Verification Pending',
    statusSuspended: 'Disbursement Paused',
    verificationNoticeTitle: 'Monthly Verification Required',
    verificationNoticeDesc: 'Please complete your biometrics or face verification by the 25th of this month to ensure uninterrupted pension disbursement.',
    verifiedNoticeTitle: 'All Set for This Month',
    verifiedNoticeDesc: 'Your monthly verification has been officially approved. Next verification due next month.',
    
    // Action Cards
    actionFingerprintTitle: 'Verify via Fingerprint',
    actionFingerprintBn: 'ফিঙ্গারপ্রিন্ট যাচাই',
    actionFingerprintDesc: 'Touch your device fingerprint sensor for immediate server-side validation.',
    actionFaceTitle: 'Verify via Face',
    actionFaceBn: 'মুখমণ্ডল যাচাই',
    actionFaceDesc: 'Scan your face with live anti-spoofing check against BPDB registered records.',
    
    // History & Navigation
    recentVerificationsTitle: 'Recent Verification Logs',
    viewFullHistory: 'View Complete Audit History',
    logout: 'Log Out',
    emptyHistory: 'No recent verifications found on record.',

    // Fingerprint Verification Screen
    fingerprintScreenTitle: 'Fingerprint Verification',
    fingerprintScreenSubtitle: 'Touch your phone sensor to verify your identity securely.',
    enrollmentNotice: 'First-time setup: This will bind your device cryptographically to your BPDB pension account.',
    promptTouchSensor: 'Place your registered finger on the sensor',
    promptEnrolling: 'Registering device cryptographic key...',
    promptVerifying: 'Verifying with BPDB secure server...',
    promptGpsAcquiring: 'Acquiring GPS location coordinates...',
    fingerprintSuccess: 'Fingerprint successfully verified!',
    fingerprintFailed: 'Biometric scan could not be authenticated. Please retry.',
    btnStartFingerprint: 'Scan Fingerprint Now',
    btnEnrollFingerprint: 'Enroll Device & Verify',

    // Face Verification Screen
    faceScreenTitle: 'Face Verification & Liveness',
    faceScreenSubtitle: 'Align your face inside the green oval guide and follow the prompts.',
    cameraPermissionNeeded: 'Camera permission is required to perform face verification.',
    btnGrantPermission: 'Grant Camera Permission',
    
    // Liveness Prompts
    livenessLookStraight: 'Step 1: Look straight into the camera',
    livenessBlink: 'Step 2: Please blink your eyes naturally',
    livenessSmile: 'Step 3: Please smile gently for the camera',
    livenessComplete: 'Liveness confirmed! Capturing photo...',
    
    // Face Processing
    faceProcessingServer: 'Comparing face with BPDB reference records...',
    faceSimilarityLabel: 'Face Similarity Score:',
    faceThresholdLabel: 'Required Passing Threshold: 85.0%',
    faceSuccessTitle: 'Face Match Confirmed!',
    faceSuccessDesc: 'Your face matches your official BPDB record with high confidence.',
    faceFailTitle: 'Face Verification Failed',
    faceFailDesc: 'The face match score was below the required 85% threshold. Please ensure bright lighting without glare or head coverings.',
    btnCaptureManually: 'Capture & Verify',

    // Verification Result Screen
    resultApprovedTitle: 'Verification Approved!',
    resultApprovedSubtitle: 'Your pension verification for this month is complete and recorded.',
    certificateHeader: 'OFFICIAL BPDB VERIFICATION CERTIFICATE',
    refTransactionId: 'Verification Receipt No:',
    receiptPensionerName: 'Pensioner Name:',
    receiptPensionId: 'BPDB Pension ID:',
    receiptMethod: 'Verification Method:',
    receiptTimestamp: 'Verified Timestamp:',
    receiptLocation: 'GPS Verified Location:',
    receiptScore: 'Confidence / Match Score:',
    receiptStatus: 'Disbursement Status:',
    receiptStatusActive: 'ACTIVE & DISBURSED',
    btnDownloadReceipt: 'Share / Save Digital Receipt',
    btnReturnHome: 'Return to Dashboard',

    // Audit History Screen
    historyTitle: 'Verification Audit Trail',
    historySubtitle: 'Official record of all monthly biometric and facial verifications.',
    methodFingerprint: 'Fingerprint (বায়োমেট্রিক)',
    methodFace: 'Face Match (মুখমণ্ডল)',
    statusApprovedBadge: 'APPROVED',
    statusRejectedBadge: 'REJECTED',
  },

  bn: {
    // General & Branding
    appTitle: 'বিপিডিবি পেনশন যাচাইকরণ',
    orgName: 'বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড',
    orgNameShort: 'বিপিডিবি',
    govtTag: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার',
    languageToggle: 'English',
    currentLanguageName: 'বাংলা',
    loading: 'অনুগ্রহ করে অপেক্ষা করুন...',
    cancel: 'বাতিল',
    retry: 'পুনরায় চেষ্টা করুন',
    continue: 'এগিয়ে যান',
    close: 'বন্ধ করুন',
    error: 'ত্রুটি',
    success: 'সফল',
    back: 'ফিরে যান',

    // Authentication / Login Screen
    loginTitle: 'পেনশনভোগী প্রবেশ',
    loginSubtitle: 'আপনার বিপিডিবি পেনশন আইডি এবং জাতীয় পরিচয়পত্র (এনআইডি) নম্বর প্রদান করুন।',
    pensionIdLabel: 'বিপিডিবি পেনশন আইডি',
    pensionIdPlaceholder: 'যেমন: BPDB-100452',
    nidLabel: 'জাতীয় পরিচয়পত্র (এনআইডি) নম্বর',
    nidPlaceholder: '১০ বা ১৭ সংখ্যার এনআইডি নম্বর',
    loginButton: 'পেনশন পোর্টালে প্রবেশ করুন',
    quickFillTitle: 'নমুনা পেনশনভোগী প্রোফাইল (এক ক্লিকে পরীক্ষা):',
    loginErrorEmpty: 'অনুগ্রহ করে পেনশন আইডি ও এনআইডি নম্বর উভয়ই লিখুন।',
    loginErrorNotFound: 'প্রদত্ত তথ্যের সাথে কোনো পেনশনভোগী রেকর্ড মেলেনি। সঠিক আইডি দিন।',

    // Dashboard Screen
    welcomeGreeting: 'স্বাগতম,',
    pensionerIdBadge: 'পেনশন আইডি:',
    nidBadge: 'এনআইডি:',
    designationBadge: 'পদবী:',
    deptBadge: 'বিভাগ/দপ্তর:',
    monthlyAmount: 'মাসিক পেনশন:',
    statusVerified: 'চলতি মাসের যাচাই সম্পন্ন',
    statusDue: 'মাসিক যাচাই অপেক্ষমান',
    statusSuspended: 'পেনশন স্থগিত আছে',
    verificationNoticeTitle: 'মাসিক যাচাইকরণ প্রয়োজন',
    verificationNoticeDesc: 'পেনশনের অর্থ নিরবচ্ছিন্নভাবে পেতে চলতি মাসের ২৫ তারিখের মধ্যে ফিঙ্গারপ্রিন্ট বা মুখমণ্ডল যাচাই সম্পন্ন করুন।',
    verifiedNoticeTitle: 'চলতি মাসের জন্য অনুমোদিত',
    verifiedNoticeDesc: 'আপনার চলতি মাসের পেনশন যাচাই সফলভাবে সম্পন্ন হয়েছে। পরবর্তী যাচাই আগামী মাসে।',

    // Action Cards
    actionFingerprintTitle: 'ফিঙ্গারপ্রিন্ট দ্বারা যাচাই',
    actionFingerprintBn: 'ফিঙ্গারপ্রিন্ট যাচাই',
    actionFingerprintDesc: 'আপনার মোবাইলের ফিঙ্গারপ্রিন্ট সেন্সরে স্পর্শ করে তাৎক্ষণিক যাচাই করুন।',
    actionFaceTitle: 'মুখমণ্ডল দ্বারা যাচাই',
    actionFaceBn: 'মুখমণ্ডল যাচাই',
    actionFaceDesc: 'লাইভনেস এবং মুখমণ্ডল মেলানোর মাধ্যমে বিপিডিবি রেকর্ডের সাথে যাচাই করুন।',

    // History & Navigation
    recentVerificationsTitle: 'সাম্প্রতিক যাচাইকরণের ইতিহাস',
    viewFullHistory: 'সম্পূর্ণ ইতিহাস দেখুন',
    logout: 'লগআউট',
    emptyHistory: 'পূর্বে কোনো যাচাইকরণ তথ্য পাওয়া যায়নি।',

    // Fingerprint Verification Screen
    fingerprintScreenTitle: 'ফিঙ্গারপ্রিন্ট যাচাইকরণ',
    fingerprintScreenSubtitle: 'নিরাপদে নিজের পরিচয় নিশ্চিত করতে ফোনের সেন্সরে আঙুল রাখুন।',
    enrollmentNotice: 'প্রথমবারের নিবন্ধন: এটি আপনার বিপিডিবি অ্যাকাউন্টের সাথে এই ফোনটিকে নিরাপদে সংযুক্ত করবে।',
    promptTouchSensor: 'নিবন্ধিত আঙুল সেন্সরে স্পর্শ করুন',
    promptEnrolling: 'ডিভাইস নিরাপত্তা কি তৈরি ও নিবন্ধন করা হচ্ছে...',
    promptVerifying: 'বিপিডিবি সার্ভারের সাথে যাচাই করা হচ্ছে...',
    promptGpsAcquiring: 'জিপিএস লোকেশন সংগ্রহ করা হচ্ছে...',
    fingerprintSuccess: 'ফিঙ্গারপ্রিন্ট সফলভাবে যাচাই করা হয়েছে!',
    fingerprintFailed: 'বায়োমেট্রিক স্ক্যান সফল হয়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    btnStartFingerprint: 'এখনই ফিঙ্গারপ্রিন্ট দিন',
    btnEnrollFingerprint: 'ডিভাইস নিবন্ধন ও যাচাই করুন',

    // Face Verification Screen
    faceScreenTitle: 'মুখমণ্ডল ও লাইভনেস যাচাই',
    faceScreenSubtitle: 'সবুজ গোল চিহ্নের মধ্যে মুখ রাখুন এবং পর্দায় প্রদর্শিত নির্দেশনা অনুসরণ করুন।',
    cameraPermissionNeeded: 'মুখমণ্ডল যাচাই করার জন্য ক্যামেরা ব্যবহারের অনুমতি প্রয়োজন।',
    btnGrantPermission: 'ক্যামেরা অনুমতি প্রদান করুন',

    // Liveness Prompts
    livenessLookStraight: 'ধাপ ১: সরাসরি ক্যামেরার দিকে তাকান',
    livenessBlink: 'ধাপ ২: অনুগ্রহ করে চোখের পলক ফেলুন',
    livenessSmile: 'ধাপ ৩: ক্যামেরার দিকে মৃদু হাসুন',
    livenessComplete: 'লাইভনেস নিশ্চিত হয়েছে! ছবি তোলা হচ্ছে...',

    // Face Processing
    faceProcessingServer: 'বিপিডিবি সংরক্ষিত ছবির সাথে তুলনা করা হচ্ছে...',
    faceSimilarityLabel: 'মুখমণ্ডলের মিলের হার:',
    faceThresholdLabel: 'ন্যূনতম আবশ্যক মিল: ৮৫.০%',
    faceSuccessTitle: 'মুখমণ্ডল সফলভাবে মিলেছে!',
    faceSuccessDesc: 'বিপিডিবি সংরক্ষিত রেকর্ডের সাথে আপনার মুখমণ্ডল নির্ভুলভাবে মিলেছে।',
    faceFailTitle: 'মুখমণ্ডল যাচাইকরণ ব্যর্থ',
    faceFailDesc: 'মুখমণ্ডলের মিল ন্যূনতম ৮৫% এর কম হয়েছে। পর্যাপ্ত আলোতে কোনো টুপি বা চশমা ছাড়া পুনরায় চেষ্টা করুন।',
    btnCaptureManually: 'ছবি তুলুন ও যাচাই করুন',

    // Verification Result Screen
    resultApprovedTitle: 'যাচাইকরণ অনুমোদিত!',
    resultApprovedSubtitle: 'চলতি মাসের জন্য আপনার পেনশন যাচাই সফলভাবে নিবন্ধিত হয়েছে।',
    certificateHeader: 'বাংলাদেশ বিদ্যুৎ উন্নয়ন বোর্ড - যাচাইপত্র',
    refTransactionId: 'যাচাইকরণ ট্রানজ্যাকশন নং:',
    receiptPensionerName: 'পেনশনভোগীর নাম:',
    receiptPensionId: 'বিপিডিবি পেনশন আইডি:',
    receiptMethod: 'যাচাইয়ের মাধ্যম:',
    receiptTimestamp: 'যাচাইয়ের সময়:',
    receiptLocation: 'যাচাইকৃত জিপিএস স্থান:',
    receiptScore: 'নির্ভুলতার স্কোর:',
    receiptStatus: 'বিতরণ অবস্থা:',
    receiptStatusActive: 'সক্রিয় ও অর্থ প্রেরণ যোগ্য',
    btnDownloadReceipt: 'ডিজিটাল রসিদ সংরক্ষণ / শেয়ার করুন',
    btnReturnHome: 'ড্যাশবোর্ডে ফিরে যান',

    // Audit History Screen
    historyTitle: 'যাচাইকরণ অডিট হিস্টোরি',
    historySubtitle: 'আপনার সকল মাসিক বায়োমেট্রিক ও ফেস যাচাইকরণের সরকারি রেকর্ড।',
    methodFingerprint: 'ফিঙ্গারপ্রিন্ট (বায়োমেট্রিক)',
    methodFace: 'ফেস ম্যাচ (মুখমণ্ডল)',
    statusApprovedBadge: 'অনুমোদিত',
    statusRejectedBadge: 'প্রত্যাখ্যাত',
  },
};
