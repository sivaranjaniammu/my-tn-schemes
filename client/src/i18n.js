import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            // App
            "app_title": "TN Scheme",
            "app_subtitle": "Tamil Nadu Government Schemes Assistant",
            "govt_badge": "Government of Tamil Nadu",

            // Auth - Features
            "feature_1": "Discover 50+ government schemes",
            "feature_2": "Know required documents instantly",
            "feature_3": "Available in Tamil & English",
            "feature_4": "Chat-based, simple interface",

            // Auth - Login
            "welcome_back": "Welcome Back",
            "sign_in_to_continue": "Sign in to explore government schemes",
            "email": "Email Address",
            "email_placeholder": "Enter your email",
            "password": "Password",
            "password_placeholder": "Enter your password",
            "confirm_password": "Confirm Password",
            "confirm_password_placeholder": "Re-enter your password",
            "login": "Sign In",
            "or": "or continue with",
            "google_login": "Continue with Google",
            "no_account": "Don't have an account?",
            "login_failed": "Login failed. Please check your credentials.",
            "google_login_failed": "Google sign-in failed. Please try again or use email/password.",
            "google_cancelled": "Google sign-in was cancelled. Please try again.",

            // Auth - Register
            "create_account": "Create Account",
            "register_subtitle": "Join to access all Tamil Nadu schemes",
            "join_subtitle": "Join thousands using Tamil Nadu schemes",
            "register": "Create Account",
            "have_account": "Already have an account?",
            "name": "Full Name",
            "name_placeholder": "Enter your full name",
            "register_failed": "Registration failed. Please try again.",
            "password_mismatch": "Passwords do not match",
            "password_too_short": "Password must be at least 8 characters",

            // Password strength
            "strength_weak": "Weak",
            "strength_fair": "Fair",
            "strength_good": "Good",
            "strength_strong": "Strong",

            // Dashboard
            "chatbot_title": "TN Scheme Assistant",
            "logout": "Logout",
            "categories": "Categories",
            "others": "Others",
            "main_categories": "Main Categories",
            "back": "← Back",
            "schemes_found": "schemes available",
            "filter_schemes": "Filter schemes...",
            "loading_schemes": "Loading schemes",
            "no_schemes_found": "No schemes match your filter",
            "no_requirements": "No specific requirements listed.",
            "no_eligibility": "No specific eligibility criteria listed.",

            // Bot messages
            "bot_greeting": "👋 Hello! I'm your TN Scheme Assistant. Type \"Hi\" or click a category to explore Tamil Nadu government schemes.",
            "select_category": "Here are the government scheme categories. Click any to explore:",
            "found_results": "🔍 Here are schemes related to",
            "no_results": "😕 No schemes found for that query. Type 'Hi' to see all categories.",
            "search_error": "❌ Search failed. Please try again.",

            // Scheme card
            "required_docs": "Requirements",
            "eligibility": "Eligibility",
            "apply_now": "Apply Now",

            // Input
            "search_placeholder": "Type 'Hi' to start, or search for a scheme...",

            // Quick chips
            "chip_hi": "👋 Hi",
            "chip_education": "🎓 Education",
            "chip_health": "🏥 Health",
            "chip_farmers": "🌾 Farmers",
            "chip_pension": "👴 Pension",

            // Voice
            "voice_listening": "Listening...",
            "voice_speak": "Speak response",
            "voice_input_idle": "Click to speak",
            "voice_unsupported": "Speech recognition not supported in this browser."
        }
    },
    ta: {
        translation: {
            // App
            "app_title": "TN திட்டம்",
            "app_subtitle": "தமிழ்நாடு அரசு திட்டங்கள் உதவியாளர்",
            "govt_badge": "தமிழ்நாடு அரசு",

            // Auth - Features
            "feature_1": "50+ அரசு திட்டங்களை கண்டறியுங்கள்",
            "feature_2": "தேவையான ஆவணங்களை உடனே அறியுங்கள்",
            "feature_3": "தமிழ் & ஆங்கிலத்தில் கிடைக்கும்",
            "feature_4": "எளிய அரட்டை அடிப்படை இடைமுகம்",

            // Auth - Login
            "welcome_back": "மீண்டும் வரவேற்கிறோம்",
            "sign_in_to_continue": "அரசு திட்டங்களை ஆராய உள்நுழையவும்",
            "email": "மின்னஞ்சல் முகவரி",
            "email_placeholder": "உங்கள் மின்னஞ்சலை உள்ளிடவும்",
            "password": "கடவுச்சொல்",
            "password_placeholder": "உங்கள் கடவுச்சொல்லை உள்ளிடவும்",
            "confirm_password": "கடவுச்சொல்லை உறுதிப்படுத்தவும்",
            "confirm_password_placeholder": "கடவுச்சொல்லை மீண்டும் உள்ளிடவும்",
            "login": "உள்நுழை",
            "or": "அல்லது தொடரவும்",
            "google_login": "Google மூலம் தொடரவும்",
            "no_account": "கணக்கு இல்லையா?",
            "login_failed": "உள்நுழைவு தோல்வியடைந்தது. உங்கள் தகவல்களை சரிபார்க்கவும்.",
            "google_login_failed": "Google உள்நுழைவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
            "google_cancelled": "Google உள்நுழைவு ரத்து செய்யப்பட்டது. மீண்டும் முயற்சிக்கவும்.",

            // Auth - Register
            "create_account": "கணக்கை உருவாக்கு",
            "register_subtitle": "அனைத்து தமிழ்நாடு திட்டங்களையும் அணுக சேரவும்",
            "join_subtitle": "தமிழ்நாடு திட்டங்களை பயன்படுத்தும் ஆயிரக்கணக்கானோரோடு சேரவும்",
            "register": "கணக்கை உருவாக்கு",
            "have_account": "ஏற்கனவே கணக்கு உள்ளதா?",
            "name": "முழு பெயர்",
            "name_placeholder": "உங்கள் முழு பெயரை உள்ளிடவும்",
            "register_failed": "பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
            "password_mismatch": "கடவுச்சொற்கள் பொருந்தவில்லை",
            "password_too_short": "கடவுச்சொல் குறைந்தது 8 எழுத்துகள் இருக்க வேண்டும்",

            // Password strength
            "strength_weak": "பலவீனம்",
            "strength_fair": "சாதாரணம்",
            "strength_good": "நல்லது",
            "strength_strong": "வலிமையானது",

            // Dashboard
            "chatbot_title": "TN திட்ட உதவியாளர்",
            "logout": "வெளியேறு",
            "categories": "பிரிவுகள்",
            "others": "மற்றவை",
            "main_categories": "முக்கிய பிரிவுகள்",
            "back": "← பின்செல்",
            "schemes_found": "திட்டங்கள் கிடைக்கின்றன",
            "filter_schemes": "திட்டங்களை வடிகட்டு...",
            "loading_schemes": "திட்டங்களை ஏற்றுகிறது",
            "no_schemes_found": "உங்கள் வடிகட்டலுக்கு திட்டங்கள் இல்லை",
            "no_requirements": "குறிப்பிட்ட தேவைகள் எதுவும் இல்லை",
            "no_eligibility": "குறிப்பிட்ட தகுதிகள் எதுவும் இல்லை",

            // Bot messages
            "bot_greeting": "👋 வணக்கம்! நான் உங்கள் TN திட்ட உதவியாளர். தமிழ்நாடு அரசு திட்டங்களை ஆராய \"வணக்கம்\" என்று தட்டச்சு செய்யவும் அல்லது ஒரு பிரிவைக் கிளிக் செய்யவும்.",
            "select_category": "இங்கே அரசு திட்ட பிரிவுகள் உள்ளன. ஆராய ஏதேனும் கிளிக் செய்யவும்:",
            "found_results": "🔍 இதோ தொடர்புடைய திட்டங்கள்",
            "no_results": "😕 அந்த தேடலுக்கு திட்டங்கள் இல்லை. அனைத்து பிரிவுகளையும் காண 'வணக்கம்' என்று தட்டச்சு செய்யவும்.",
            "search_error": "❌ தேடல் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",

            // Scheme card
            "required_docs": "தேவைகள்",
            "eligibility": "தகுதிகள்",
            "apply_now": "விண்ணப்பிக்க",

            // Input
            "search_placeholder": "தொடங்க 'வணக்கம்' என்று தட்டச்சு செய்யவும் அல்லது திட்டத்தை தேடவும்...",

            // Quick chips
            "chip_hi": "👋 வணக்கம்",
            "chip_education": "🎓 கல்வி",
            "chip_health": "🏥 சுகாதாரம்",
            "chip_farmers": "🌾 விவசாயிகள்",
            "chip_pension": "👴 ஓய்வூதியம்",

            // Voice
            "voice_listening": "கவனித்துக் கொண்டிருக்கிறேன்...",
            "voice_speak": "பதிலை ஒலிக்கச் செய்",
            "voice_input_idle": "பேச கிளிக் செய்யவும்",
            "voice_unsupported": "உங்கள் உலாவியில் குரல் அங்கீகாரம் ஆதரிக்கப்படவில்லை."
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

export default i18n;
