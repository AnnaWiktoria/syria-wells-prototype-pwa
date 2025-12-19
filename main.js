/* ==========================================================================
   1. GLOBAL CONSTANTS & VARIABLES
   ========================================================================== */

// --- ICONS ---
// Funkcja tworząca obiekt ikony Leaflet
function getPinIcon(colorClass, isOffline) {
    // Jeśli studnia czeka na synchronizację, dodaj klasę CSS z ikonką 🔄
    const offlineClass = isOffline ? 'offline-pending' : '';
    
    return L.divIcon({
        className: `custom-pin-icon ${colorClass} ${offlineClass}`,
        iconSize: [30, 42],
        iconAnchor: [15, 42],
        popupAnchor: [0, 10],
    });
}

// Funkcja zwracająca nazwę koloru na podstawie stanu studni
function chooseColorName(well) {
    const status = well.status ? well.status[0] : "";
    const quality = Array.isArray(well.waterQuality) ? well.waterQuality : [well.waterQuality];

    if (status === "Contaminated" || quality.includes("Contaminated")) {
        return "purple";
    }

    switch (well.waterAvailability) {
        case "Plenty": return "blue";
        case "Moderate": return "light";
        case "Scarce": return "orange";
        case "None": return "red";
        default: return "light";
    }
}

// --- DATA ---
const wells = [
    {
        name: "well_A_name",
        village: "cityAleppo",
        coords: [35.95, 38.99],
        status: ["Functional"],
        waterAvailability: "Plenty",
        waterQuality: ["Clear"],
        wellType: "Hand pump",
        wellDepth: "0-10m",
        additionalNotes: "note_well_A",
        lastUpdate: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
        isOffline: false
    },
    {
        name: "well_B_name",
        village: "cityRaqqa",
        coords: [36.5, 40.75],
        status: ["Needs repair"],
        waterAvailability: "Moderate",
        waterQuality: ["Muddy"],
        wellType: "Borehole",
        wellDepth: "11-30m",
        additionalNotes: "note_well_B",
        lastUpdate: Date.now() - 1000 * 60 * 60 * 24 * 5, // 5 days ago
        isOffline: false
    },
    {
        name: "well_C_name",
        village: "cityDeir",
        coords: [35.33, 40.17],
        status: ["Dry"],
        waterAvailability: "None",
        waterQuality: ["Smelly", "Muddy"],
        wellType: "Open well",
        wellDepth: "31-50m",
        additionalNotes: "note_well_C",
        lastUpdate: Date.now() - 1000 * 60 * 60 * 24 * 40, // 40 days ago
        isOffline: false
    },
    {
        name: "well_D_name",
        village: "cityHama",
        coords: [36.53, 37.95],
        status: ["Contaminated"],
        waterAvailability: "Scarce",
        waterQuality: ["Contaminated", "Smelly"],
        wellType: "Spring",
        wellDepth: "0-10m",
        additionalNotes: "note_well_D",
        lastUpdate: Date.now() - 1000 * 60 * 60 * 24 * 100, // 100 days ago
        isOffline: false
    },
];

// --- APP STATE ---
let currentLanguage = "en";
let currentVillageName = "";
let currentWellName = "";
let currentWellCoords = null;
let modalMap = null;
let tempMarker = null;

// --- DOM ELEMENTS ---
const modalBg = document.getElementById("modalBg");
const modalContent = document.getElementById("modalContent");
const addWellOptions = document.getElementById("addWellOptions");
const searchInput = document.getElementById("searchInput");

/* ==========================================================================
   2. TRANSLATIONS
   ========================================================================== */
const translations = {
    en: {
        headerTitle: "Wells in Syria",
        searchPlaceholder: "Find village...",
        addCurrentLocationBtn: "📍 Add at Current Location",
        addTapMapBtn: "👆 Add by Tapping Map",
        addWellBtn: "Add Well",
        btnCancel: "✕ Cancel",
        reportUpdateBtn: "Report Update",
        modalUpdateReport: "Update Report",
        modalNewWell: "New Well",
        modalDesc: "Please share information about the water well in {villageName}. <br>You can move the pin if it is in the wrong location.",
        modalCondition: "Condition",
        conditionFunctional: "✅ Functional",
        conditionNeedsRepair: "🔧 Needs repair",
        conditionCompletelyBroken: "❌ Completely broken",
        modalAvailability: "Water Availability",
        availabilityPlenty: "💧💧💧 Plenty",
        availabilityModerate: "💧💧 Moderate",
        availabilityScarce: "💧 Scarce",
        availabilityNone: "🚱 None",
        modalWaterQuality: "Water Quality",
        qualityClear: "✨ Clear",
        qualityMuddy: "🟫 Muddy",
        qualitySmelly: "🫢 Smelly",
        qualityContaminated: "🤢 Contaminated",
        modalWellType: "Well Type (optional)",
        typeHandpump: "🖐️ Hand pump",
        typeBorehole: "🛢️ Borehole",
        typeOpenwell: "🕳️ Open well",
        typeSpring: "🏞️ Source",
        typeOther: "❓ Other",
        modalDepth: "Depth (optional)",
        depthUnknown: "Unknown",
        depth010m: "0-10m",
        depth1130m: "11-30m",
        depth3150m: "31-50m",
        depth50m: "50m+",
        modalAdditionalNotes: "Additional Notes (optional)",
        additionalNotesPlaceholder: "Any additional information...",
        modalConsent: "I agree to share this information.",
        submitReportBtn: "Submit Report",
        thankYouMessage: `Thank you. Your report helps improve access to water in your community.<br><br>If you’re offline, your report is saved and will be sent when you’re back online.`,
        offlineMessage: "No Internet? Your report is saved and will be sent when you’re online.",
        popupStatus: "Status:",
        popupAvailability: "Availability:",
        popupQuality: "Quality:",
        popupType: "Type:",
        popupDepth: "Depth:",
        popupNotes: "Notes:",
        popupLastUpdate: "Updated:",
        alertCurrentLocationError: "Could not get your current location.",
        alertGeolocationNotSupported: "Geolocation is not supported by your browser.",
        alertTapMapPrompt: "Tap on the map to place a new well.",
        alertLocationNotFound: "Location not found in Syria",
        installBanner: `<b>Install App to Save Maps</b><br><br>Maps viewed in this browser are NOT saved.<br>Install the app, open it, and <i>then</i> browse the map to save it for offline.`,
        installBtn: "Install App",
        manualInstallBtn: "📲 Install App",
        installSuccessTitle: "App Installed!",
        installSuccessMsg: "The app is installed. <b>Please open the app from your home screen</b> and browse the maps there to save them for offline use.",
        firstRunTitle: "Offline Mode Tips",
        firstRunMsg: "While you are online, browse the areas on the map you want to access later. This will save them for offline use.",
        locTapped: "Selected Location",
        netOnline: "Online",
        netOffline: "Offline (Saved maps only)",
        legendTitle: "Map Legend",
        legPlenty: "Plenty Water",
        legModerate: "Moderate Water",
        legScarce: "Low Water",
        legNone: "Dry / Broken",
        legContaminated: "Contaminated (Unsafe!)",
        btnGotIt: "Got it",
        cityAleppo: "Aleppo",
        cityRaqqa: "Raqqa",
        cityDeir: "Deir ez-Zor",
        cityHama: "Hama",
        note_well_A: "New pump installed last month.",
        note_well_B: "Engine needs servicing, water levels are low.",
        note_well_C: "Has been dry for 3 months now. Urgent need for new source.",
        note_well_D: "Smells bad, villagers are getting sick. Investigation needed.",
        popupStaticTitle: "Well in {village}",
        // TIME FORMATS
        timeJustNow: "Just now",
        timeDaysAgo: "{n} days ago",
        timeWeekAgo: "A week ago",
        timeWeeksAgo: "{n} weeks ago",
        timeMonthAgo: "A month ago",
        timeMonthsAgo: "{n} months ago",
        timeLongAgo: "Long time ago / Not updated"
    },
    ar: {
        headerTitle: "آبار في سوريا",
        searchPlaceholder: "ابحث عن قرية...",
        addCurrentLocationBtn: "📍 إضافة في الموقع الحالي",
        addTapMapBtn: "👆 إضافة بالنقربالضغط على الخريطة",
        addWellBtn: "إضافة بئر",
        btnCancel: "✕ إلغاء",
        reportUpdateBtn: "تحديث التقرير",
        modalUpdateReport: "تحديث التقرير",
        modalNewWell: "بئر جديد",
        modalDesc: "يرجى مشاركة المعلومات حول بئر الماء في {villageName}. <br>يمكنك تحريك الدبوس إذا كان في موقع خاطئ.",
        modalCondition: "الحالة",
        conditionFunctional: "✅ يعملصالح للاستخدام",
        conditionNeedsRepair: "🔧للإصلاح",
        conditionCompletelyBroken: "❌ معطل تمامًا",
        modalAvailability: "توفر المياه",
        availabilityPlenty: "💧💧💧 وفيرة",
        availabilityModerate: "💧💧 متوسطة",
        availabilityScarce: "💧 نادرة",
        availabilityNone: "🚱 لا يوجد",
        modalWaterQuality: "جودة المياه",
        qualityClear: "✨ صافية",
        qualityMuddy: "🟫 موحلة",
        qualitySmelly: "🫢 كريهة الرائحة",
        qualityContaminated: "🤢 ملوثة",
        modalWellType: "نوع البئر (اختياري)",
        typeHandpump: "🖐️ مضخة يدوية",
        typeBorehole: "🛢️ بئر ارتوازي",
        typeOpenwell: "🕳️ بئر مفتوح",
        typeSpring: "🏞️ نبع",
        typeOther: "❓ أخرى",
        modalDepth: "العمق (اختياري)",
        depthUnknown: "غير معروف",
        depth010m: "\u202A0-10\u202C م",
		depth1130m: "\u202A11-30\u202C م",
		depth3150m: "\u202A31-50\u202C م",
		depth50m: "\u202A50\u202C+ م",
        modalAdditionalNotes: "ملاحظات إضافية (اختياري)",
        additionalNotesPlaceholder: "أي معلومات إضافية...",
        modalConsent: "أوافق على مشاركة هذه المعلومات.",
        submitReportBtn: "إرسال التقرير",
        thankYouMessage: `شكراً لك. تقريرك يساعد في تحسين الوصول إلى المياه في مجتمعك.<br><br>إذا كنت غير متصل بالإنترنت، فسيتم حفظ تقريرك وإرساله عندما تعود إلى الاتصال بالإنترنت.`,
     	offlineMessage:
            "لا يوجد اتصال بالإنترنت؟ تم حفظ تقريرك وسيتم إرساله عندما تكون متصلاً بالإنترنت. ما عليك سوى الضغط على زر ”إرسال التقرير“.",
	    popupStatus: ":الحالة",
        popupAvailability: ":التوفر",
        popupQuality: ":الجودة",
        popupType: ":النوع",
        popupDepth: ":العمق",
        popupNotes: ":ملاحظات",
        popupLastUpdate: "آخر تحديث:",
        alertCurrentLocationError: "تعذر الحصول على موقعك الحالي.",
        alertGeolocationNotSupported: "الموقع الجغرافي غير مدعوم من قبل متصفحك.",
        alertTapMapPrompt: "انقراضغط على الخريطة لوضع بئر جديد.",
        alertLocationNotFound: "الموقع غير موجود في سوريا",
        installBanner: `<b>ثبت التطبيق لحفظ الخرائط</b><br><br>الخرائط التي تشاهدها هنا لا يتم حفظها.<br>قم بتثبيت التطبيق وافتحه، و<i>ثم</i> تصفح الخريطة بداخله لتعمل دون إنترنت.`,
        installBtn: "تثبيت",
        manualInstallBtn: "📲 تثبيت التطبيق",
        installSuccessTitle: "تم تثبيت التطبيق!",
        installSuccessMsg: "تم التثبيت. <b>يرجى فتح التطبيق من الشاشة الرئيسية</b> وتصفح الخرائط بداخله لحفظها للاستخدام دون إنترنت.",
        firstRunTitle: "نصائح وضع عدم الاتصال",
        firstRunMsg: "أثناء اتصالك بالإنترنت، تصفح المناطق التي تريد الوصول إليها لاحقاً على الخريطة. سيؤدي هذا إلى حفظها تلقائياً.",
        locTapped: "الموقع المحدد",
        netOnline: "متصل",
        netOffline: "غير متصل (الخرائط المحفوظة فقط)",
        legendTitle: "مفتاح الخريطة",
        legPlenty: "يعمل / مياه وفيرة",
        legModerate: "مياه متوسطة",
        legScarce: "مياه شحيحة",
        legNone: "جاف / معطل",
        legContaminated: "ملوث (غير آمن!)",
        btnGotIt: "حسناً",
        cityAleppo: "حلب",
        cityRaqqa: "الرقة",
        cityDeir: "دير الزور",
        cityHama: "حماة",
        note_well_A: "تم تركيب مضخة جديدة الشهر الماضي.",
        note_well_B: "المحرك يحتاج إلى صيانة، منسوب المياه منخفض.",
        note_well_C: "جف البئر منذ 3 أشهر. حاجة ملحة لمصدر جديد.",
    	note_well_D: "رائحة كريهة، السكان يمرضون. يلزم التحقيق",
        popupStaticTitle: "بئر في {village}",
        // TIME FORMATS
        timeJustNow: "الآن",
        timeDaysAgo: "منذ {n} أيام",
        timeWeekAgo: "منذ أسبوع",
        timeWeeksAgo: "منذ {n} أسابيع",
        timeMonthAgo: "منذ شهر",
        timeMonthsAgo: "منذ {n} أشهر",
        timeLongAgo: "منذ فترة طويلة / لم يتم التحديث"
    },
    ku: {
        headerTitle: "Bîrên li Sûriyê",
        searchPlaceholder: "Gundekî bibîne...",
        addCurrentLocationBtn: "📍 Li Cihê Heyî Zêde bike",
        addTapMapBtn: "👆 Bi Tikandina Nexşeyê Zêde bike",
        addWellBtn: "Bîrek Zêde bike",
        btnCancel: "✕ Betal bike",
        reportUpdateBtn: "Rapora Nû bike",
        modalUpdateReport: "Rapora Nû bike",
        modalNewWell: "Bîra Nû",
        modalDesc: "Ji kerema xwe agahdariya der barê bîra avê ya li {villageName} parve bikin. <br>Hûn dikarin pîneyê biguherînin ger ew li cîhek xelet be.",
        modalCondition: "Rewş",
        conditionFunctional: "✅ Kar dike",
        conditionNeedsRepair: "🔧 Ji bo tamîrê",
        conditionCompletelyBroken: "❌ Nake",
        modalAvailability: "Berdestbûna Avê",
        availabilityPlenty: "💧💧💧 Pir",
        availabilityModerate: "💧💧 Navîn",
        availabilityScarce: "💧 Kêm",
        availabilityNone: "🚱 Tune",
        modalWaterQuality: "Kalîteya Avê",
        qualityClear: "✨ Zelal",
        qualityMuddy: "🟫 Herî",
        qualitySmelly: "🫢 Bêhnxweş",
        qualityContaminated: "🤢 Pîs",
        modalWellType: "Cureya Bîrê (vebijarkî)",
        typeHandpump: "🖐️ Pompa Destan",
        typeBorehole: "🛢️ Bîra Kûr",
        typeOpenwell: "🕳️ Bîra Vekirî",
        typeSpring: "🏞️ Kanî",
        typeOther: "❓ Din",
        modalDepth: "Kûrahî (vebijarkî)",
        depthUnknown: "Nenas",
        depth010m: "0-10m",
        depth1130m: "11-30m",
        depth3150m: "31-50m",
        depth50m: "50m+",
        modalAdditionalNotes: "Têbîniyên Zêde (vebijarkî)",
        additionalNotesPlaceholder: "Her agahdariya din...",
        modalConsent: "Ez razî me ku ez vê agahiyê parve bikim.",
        submitReportBtn: "Raporê Bişîne",
        thankYouMessage: `Spas. Rapora we alîkariyê dide baştirkirina gihîştina avê li civata we.<br><br>Heke hûn ne serhêl bin, rapora we tê tomarkirin û dema ku hûn dîsa serhêl bibin dê were şandin.`,
        offlineMessage: "Înternet tune ye? Rapora we tê tomarkirin û dema ku hûn bikevin ser înternetê dê were şandin.",
        popupStatus: "Rewş:",
        popupAvailability: "Berdestbûn:",
        popupQuality: "Kalîte:",
        popupType: "Cure:",
        popupDepth: "Kûrahî:",
        popupNotes: "Têbînî:",
        popupLastUpdate: "Nûvekirina Dawîn:",
        alertCurrentLocationError: "Nikare cîhê weya heyî bistîne.",
        alertGeolocationNotSupported: "Cîhê erdnîgarî ji hêla geroka we ve nayê piştgirî kirin.",
        alertTapMapPrompt: "Li ser nexşeyê bikirtînin da ku bîrek nû bi cîh bikin.",
        alertLocationNotFound: "Cîh li Sûriyê nehat dîtin",
        installBanner: `<b>Ji bo tomarkirinê saz bike</b><br><br>Nexşeyên ku li vir têne dîtin nayên tomarkirin.<br>Sepanê saz bike, veke û <i>paşê</i> nexşeyê bigerîne da ku offline bixebite.`,
        installBtn: "Sepîyê bike",
        manualInstallBtn: "📲 Sepanê Saz Bike",
        installSuccessTitle: "Sepan hat saz kirin!",
        installSuccessMsg: "Sepan hat saz kirin. <b>Ji kerema xwe sepanê vekin</b> û nexşeyan li wir bigerînin da ku ji bo offline werin tomarkirin.",
        firstRunTitle: "Şîretên Offline",
        firstRunMsg: "Dema ku hûn serhêl in, deverên li ser nexşeyê ku hûn dixwazin paşê bigihîjin wan bigerînin. Ev ê wan ji bo offline tomar bike.",
        locTapped: "Cihê Hilbijartî",
        netOnline: "Serhêl",
        netOffline: "Oflîn (Tenê nexşeyên tomarkirî)",
        legendTitle: "Mifteya Nexşeyê",
        legPlenty: "Kar dike / Av Pir e",
        legModerate: "Av Navîn e",
        legScarce: "Av Kêm e",
        legNone: "Zuwa / Xerabûyî",
        legContaminated: "Pîs (Ne ewle!)",
        btnGotIt: "Fêm kir",
        cityAleppo: "Heleb",
        cityRaqqa: "Reqa",
        cityDeir: "Dêra Zorê",
        cityHama: "Hama",
        note_well_A: "Meha borî pompeyek nû hate saz kirin.",
        note_well_B: "Pêdiviya motorê bi servîsê heye, asta avê kêm e.",
        note_well_C: "Ev 3 meh in zuwa bûye. Pêdivî bi çavkaniyek nû heye.",
        note_well_D: "Bêhna wê nexweş e, gundî nexweş dikevin. Pêdivî bi lêkolînê heye.",
        popupStaticTitle: "Bîra li {village}",
        // TIME FORMATS
        timeJustNow: "Niha",
        timeDaysAgo: "{n} roj berê",
        timeWeekAgo: "Hefteyek berê",
        timeWeeksAgo: "{n} hefte berê",
        timeMonthAgo: "Mehek berê",
        timeMonthsAgo: "{n} meh berê",
        timeLongAgo: "Demek dirêj berê / Nehatiye nûvekirin"
    },
};

/* ==========================================================================
   3. MAIN MAP INIT
   ========================================================================== */
var syriaBounds = [
    [29.0, 33.0], 
    [40.0, 46.0],
];

var map = L.map("map", {
    zoomControl: false,
    maxBounds: syriaBounds,
    maxBoundsViscosity: 0.8,
    minZoom: 7,
}).setView([35.0, 38.9], 7);

map.on("popupopen", function (e) {
    var px = map.project(e.popup._latlng);
    var mapHeight = map.getSize().y;
    var targetCenterY = px.y + mapHeight * 0.3;
    var targetLatLng = map.unproject([px.x, targetCenterY], map.getZoom());
    map.panTo(targetLatLng, { animate: true, duration: 0.5 });
});

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 16,
    attribution: "© OSM",
    updateWhenIdle: true,
    keepBuffer: 1,
}).addTo(map);

/* ==========================================================================
   4. HELPER FUNCTIONS & LOGIC
   ========================================================================== */

// --- RELATIVE TIME HELPER ---
function getRelativeTime(timestamp) {
    if (!timestamp) return "";
    const t = translations[currentLanguage];
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days < 1) return t.timeJustNow;
    if (days === 1) return t.timeDaysAgo.replace("{n}", "1");
    if (days < 7) return t.timeDaysAgo.replace("{n}", days);
    
    if (days < 14) return t.timeWeekAgo;
    if (days < 30) return t.timeWeeksAgo.replace("{n}", Math.floor(days/7));
    
    if (days < 60) return t.timeMonthAgo;
    if (days < 90) return t.timeMonthsAgo.replace("{n}", Math.floor(days/30));
    
    return t.timeLongAgo;
}

function saveWellsToStorage() {
    const dataToSave = wells.map(well => {
        const { marker, ...rest } = well;
        return rest;
    });
    localStorage.setItem("wellsData", JSON.stringify(dataToSave));
}

function loadWellsFromStorage() {
    const stored = localStorage.getItem("wellsData");
    if (stored) {
        const parsed = JSON.parse(stored);
        parsed.forEach(w => (w.marker = null));
        wells.length = 0;
        wells.push(...parsed);
    }
}

function getWellProperty(wellName, property) {
    const well = wells.find(w => w.name === wellName && w.village === currentVillageName);
    return well ? well[property] : null;
}

function updateInstallTexts() {
    const t = translations[currentLanguage];
    const installBanner = document.getElementById("installBanner");
    const installBtn = document.getElementById("installBtn");

    if (!installBanner || !installBtn) return;

    installBanner.querySelector("#installText")?.remove();
    const span = document.createElement("span");
    span.id = "installText";
    span.innerHTML = t.installBanner; 
    installBanner.prepend(span);

    installBtn.textContent = t.installBtn;
}

function setLanguage(lang) {
    currentLanguage = lang;
    const isRtl = lang === "ar";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", isRtl ? "rtl" : "ltr");

    document.querySelectorAll(".lang-button").forEach(btn => {
        btn.classList.remove("active");
    });
    const activeBtn = document.getElementById(`lang${lang.charAt(0).toUpperCase() + lang.slice(1)}`);
    if (activeBtn) activeBtn.classList.add("active");

    document.querySelectorAll("[data-key]").forEach(element => {
        const key = element.dataset.key;
        if (translations[lang][key]) {
            if (element.tagName === "INPUT" && element.type === "text") {
                element.placeholder = translations[lang][key];
            } else {
                element.innerHTML = translations[lang][key];
            }
        }
    });

    if (typeof installBanner !== "undefined" && installBanner !== null) {
        updateInstallTexts();
    }

    const manualBtn = document.getElementById("manualInstallBtn");
    if (manualBtn && translations[lang].manualInstallBtn) {
        manualBtn.textContent = translations[lang].manualInstallBtn;
    }

    updateAllWellPopups();
    if (modalBg && modalBg.style.display === "flex") {
        resetForm();
    }
}

function updateAllWellPopups() {
    wells.forEach(w => {
        if (w.marker) {
            const color = chooseColorName(w);
            const iconObj = getPinIcon(color, w.isOffline);
            w.marker.setIcon(iconObj);
            w.marker.setPopupContent(createWellPopupContent(w));
        }
    });
}

function createWellPopupContent(w) {
    const t = translations[currentLanguage];
    const nameText = t[w.name] || w.name;
    const villageText = t[w.village] || w.village;
    const notesText = t[w.additionalNotes] || w.additionalNotes;

    let headerHTML = "";
    if (w.name.startsWith("well_")) {
        headerHTML = t.popupStaticTitle.replace("{village}", villageText);
    } else {
        headerHTML = `${nameText} (${villageText})`;
    }

    const typeMapping = {
        "Hand pump": "typeHandpump",
        "Hand Pump": "typeHandpump",
        "Borehole": "typeBorehole",
        "Open well": "typeOpenwell",
        "Open Well": "typeOpenwell",
        "Spring": "typeSpring",
        "Source": "typeSpring",
        "Other": "typeOther",
    };
    const typeKey = typeMapping[w.wellType] || "typeOther";
    const typeText = t[typeKey] || w.wellType;

    const statusMapping = {
        "Functional": "conditionFunctional",
        "Needs repair": "conditionNeedsRepair",
        "Completely broken": "conditionCompletelyBroken",
        "Dry": "conditionCompletelyBroken",
        "Contaminated": "conditionCompletelyBroken",
    };
    const statusVal = w.status[0];
    const statusKey = statusMapping[statusVal] || "conditionFunctional";
    const statusText = t[statusKey] || statusVal;

    const availMapping = {
        "Plenty": "availabilityPlenty",
        "Moderate": "availabilityModerate",
        "Scarce": "availabilityScarce",
        "None": "availabilityNone",
    };
    const availKey = availMapping[w.waterAvailability] || "availabilityModerate";
    const availText = t[availKey] || w.waterAvailability;

    // Time text
    const timeText = getRelativeTime(w.lastUpdate);

    let content = `<b>${headerHTML}</b>`;
    content += `<p><strong>${t.popupStatus}</strong> <span>${statusText}</span></p>`;
    content += `<p><strong>${t.popupAvailability}</strong> <span>${availText}</span></p>`;

    const qualityArray = Array.isArray(w.waterQuality) ? w.waterQuality : [w.waterQuality];
    const qualityText = qualityArray.map(q => {
        const k = `quality${q.replace(/\s/g, "")}`;
        return t[k] || q;
    }).join(", ");
    content += `<p><strong>${t.popupQuality}</strong> <span>${qualityText}</span></p>`;
    content += `<p><strong>${t.popupType}</strong> <span>${typeText}</span></p>`;

    if (w.wellDepth) {
        const depthKey = `depth${w.wellDepth.replace(/[^a-zA-Z0-9]/g, "")}`;
        content += `<p><strong>${t.popupDepth}</strong> <span>${t[depthKey] || w.wellDepth} </span></p>`;
    }

    if (w.additionalNotes)
        content += `<div class="popup-notes"><strong>${t.popupNotes}</strong><br>${notesText}</div>`;

    if (timeText) {
        content += `<div style="font-size:11px; color:#888; margin-top:8px; border-top:1px solid #eee; padding-top:4px;">
            ${t.popupLastUpdate} ${timeText}
        </div>`;
    }

    content += `<br><button onclick="window.openModal('${w.village}', '${w.name}', [${w.coords[0]}, ${w.coords[1]}])">${t.reportUpdateBtn}</button>`;
    return content;
}

// --- MAIN FUNCTIONS ---

// 1. Handle Map Tap
function handleMapTapForNewWell(e) {
    if (tempMarker) {
        map.removeLayer(tempMarker);
    }
    tempMarker = L.marker(e.latlng, { icon: getPinIcon("blue", false), draggable: true }).addTo(map);
    tempMarker.on("dragend", function (event) {
        const marker = event.target;
        currentWellCoords = [marker.getLatLng().lat, marker.getLatLng().lng];
    });
    currentWellCoords = [e.latlng.lat, e.latlng.lng];
    setTimeout(() => {
        openModal("locTapped", "", [e.latlng.lat, e.latlng.lng]);
    }, 100);
    map.off("click", handleMapTapForNewWell);
}

// 2. Open Modal
function openModal(villageName = "Unknown Location", wellName = "", coords = null) {
    currentVillageName = villageName;
    currentWellName = wellName;
    currentWellCoords = coords;

    if (addWellOptions) addWellOptions.classList.remove("active");
    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
    if (modalContent) modalContent.scrollTop = 0;
    map.off("click", handleMapTapForNewWell);

    resetForm();
    if (modalBg) modalBg.style.display = "flex";

    if (currentWellCoords) {
        setTimeout(() => {
            if (modalMap) {
                modalMap.remove();
                modalMap = null;
            }
            modalMap = L.map("modalMap", {
                zoomControl: false,
                attributionControl: false,
                dragging: true,
                touchZoom: true,
                scrollWheelZoom: true,
                doubleClickZoom: true,
            }).setView(currentWellCoords, 13);

            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18 }).addTo(modalMap);

            // Dummy object for preview
            const previewWell = { 
                status: [], waterAvailability: "Moderate", waterQuality: [], 
                isOffline: false 
            };
            if (currentWellName) {
                // If editing, try to get real props
                const realWell = wells.find(w => w.name === currentWellName && w.village === currentVillageName);
                if (realWell) Object.assign(previewWell, realWell);
            }

            var modalMarker = L.marker(currentWellCoords, {
                icon: getPinIcon(chooseColorName(previewWell), false),
                draggable: true,
            }).addTo(modalMap);

            modalMarker.on("dragend", function (event) {
                var position = event.target.getLatLng();
                currentWellCoords = [position.lat, position.lng];
                modalMap.panTo(position);
            });
            modalMap.invalidateSize();
        }, 100);
    }
}

// 3. Close Modal
function closeModal() {
    if (modalBg) modalBg.style.display = "none";
    currentVillageName = "";
    currentWellName = "";
    currentWellCoords = null;
    if (modalMap) {
        modalMap.remove();
        modalMap = null;
    }
    if (addWellOptions) addWellOptions.classList.remove("active");
    map.off("click", handleMapTapForNewWell);
    if (tempMarker) {
        map.removeLayer(tempMarker);
        tempMarker = null;
    }
}

// 4. Submit Report
function submitReport() {
    const selectedStatusValue = document.getElementById("conditionSelect").value;
    const waterAvailability = document.getElementById("availabilitySelect").value;
    const selectedWaterQuality = Array.from(document.querySelectorAll(".quality-btn.active")).map(btn => btn.dataset.value);
    const waterQuality = selectedWaterQuality.length ? selectedWaterQuality : ["Clear"];
    const wellType = document.getElementById("typeSelect").value;
    const wellDepth = document.getElementById("depthSelect").value;
    const additionalNotes = document.getElementById("additionalNotesInput").value;
    const consentGiven = document.getElementById("consentCheckbox").checked;

    // Determine offline status
    const isOfflineNow = !navigator.onLine;

    const newWellData = {
        village: currentVillageName,
        name: currentWellName || `New Well ${Date.now()}`,
        coords: currentWellCoords,
        status: [selectedStatusValue],
        waterAvailability,
        waterQuality,
        wellType,
        wellDepth,
        additionalNotes,
        consentGiven,
        lastUpdate: Date.now(), // Always update timestamp
        isOffline: isOfflineNow // Mark as offline if no net
    };

    if (currentWellName && currentWellCoords) {
        const existingWellIndex = wells.findIndex(w => w.name === currentWellName && w.village === currentVillageName);
        if (existingWellIndex !== -1) {
            wells[existingWellIndex] = { ...wells[existingWellIndex], ...newWellData };
            const updatedWell = wells[existingWellIndex];
            if (updatedWell.marker) {
                const color = chooseColorName(updatedWell);
                const iconObj = getPinIcon(color, updatedWell.isOffline);
                updatedWell.marker.setIcon(iconObj);
                updatedWell.marker.setPopupContent(createWellPopupContent(updatedWell));
            }
        } else {
            const newWell = { ...newWellData, marker: null };
            wells.push(newWell);
            const color = chooseColorName(newWell);
            const iconObj = getPinIcon(color, newWell.isOffline);
            const m = L.marker(newWell.coords, { icon: iconObj }).addTo(map);
            m.bindPopup(createWellPopupContent(newWell));
            newWell.marker = m;
        }
    } else if (currentWellCoords) {
         const newWell = { ...newWellData, marker: null };
         wells.push(newWell);
         const color = chooseColorName(newWell);
         const iconObj = getPinIcon(color, newWell.isOffline);
         const m = L.marker(newWell.coords, { icon: iconObj }).addTo(map);
         m.bindPopup(createWellPopupContent(newWell));
         newWell.marker = m;
    }
    
    saveWellsToStorage();
    map.closePopup();

    const t = translations[currentLanguage];
    modalContent.innerHTML = `
        <div class="modal-header-controls" style="border: none;">
            <div class="close-btn" onclick="window.closeModal()">×</div>
        </div>
        <div class="thankyou">${t.thankYouMessage}</div>
    `;
}

// 5. Reset Form
function resetForm() {
    if (!modalContent) return;

    const wellToEdit = wells.find(w => w.name === currentWellName && w.village === currentVillageName);
    const wellCoordsToDisplay = currentWellCoords || (wellToEdit ? wellToEdit.coords : null);
    const t = translations[currentLanguage];
    
    let translatedVillageName = currentVillageName;
    if (translations[currentLanguage][currentVillageName]) {
        translatedVillageName = translations[currentLanguage][currentVillageName];
    } else if (currentVillageName === "locTapped") {
        translatedVillageName = t.locTapped;
    }

    modalContent.innerHTML = `
        <div class="modal-header-controls">
            <h2>${wellToEdit ? t.modalUpdateReport : t.modalNewWell}</h2>
            <p class="desc">${t.modalDesc.replace("{villageName}", translatedVillageName)}</p>
            <div class="close-btn" onclick="window.closeModal()">×</div>
        </div>
        
        ${wellCoordsToDisplay ? `<div class="modal-map-container"><div id="modalMap"></div></div>` : ""}
        
        <div class="modal-content-inner">
            <div class="two-col-grid">
                <div>
                    <label for="conditionSelect">${t.modalCondition}</label>
                    <select id="conditionSelect">
                        <option value="Functional">${t.conditionFunctional}</option>
                        <option value="Needs repair">${t.conditionNeedsRepair}</option>
                        <option value="Completely broken">${t.conditionCompletelyBroken}</option>
                    </select>
                </div>
                <div>
                    <label for="availabilitySelect">${t.modalAvailability}</label>
                    <select id="availabilitySelect">
                        <option value="Plenty">${t.availabilityPlenty}</option>
                        <option value="Moderate">${t.availabilityModerate}</option>
                        <option value="Scarce">${t.availabilityScarce}</option>
                        <option value="None">${t.availabilityNone}</option>
                    </select>
                </div>
            </div>
            <label>${t.modalWaterQuality}</label>
            <div class="quality-grid">
                <div class="quality-btn" data-value="Clear">${t.qualityClear}</div>
                <div class="quality-btn" data-value="Muddy">${t.qualityMuddy}</div>
                <div class="quality-btn" data-value="Smelly">${t.qualitySmelly}</div>
                <div class="quality-btn" data-value="Contaminated">${t.qualityContaminated}</div>
            </div>
            <div class="two-col-grid">
                <div>
                    <label for="typeSelect">${t.modalWellType}</label>
                    <select id="typeSelect">
                        <option value="Hand pump">${t.typeHandpump}</option>
                        <option value="Borehole">${t.typeBorehole}</option>
                        <option value="Open well">${t.typeOpenwell}</option>
                        <option value="Spring">${t.typeSpring}</option>
                        <option value="Other">${t.typeOther}</option>
                    </select>
                </div>
                <div>
                    <label for="depthSelect">${t.modalDepth}</label>
                    <select id="depthSelect">
                        <option value="">${t.depthUnknown}</option>
                        <option value="0-10m">${t.depth010m}</option>
                        <option value="11-30m">${t.depth1130m}</option>
                        <option value="31-50m">${t.depth3150m}</option>
                        <option value="50m+">${t.depth50m}</option>
                    </select>
                </div>
            </div>
            <label>${t.modalAdditionalNotes}</label>
            <textarea id="additionalNotesInput" placeholder="${t.additionalNotesPlaceholder}"></textarea>
            <div class="checkbox-container">
                <input type="checkbox" id="consentCheckbox" checked>
                <label for="consentCheckbox">${t.modalConsent}</label>
            </div>
            <button class="submit-btn" onclick="window.submitReport()">${t.submitReportBtn}</button>
            <p class="modal-no-internet">${t.offlineMessage}</p>
        </div>
    `;

    document.querySelectorAll(".quality-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            btn.classList.toggle("active");
        });
    });

    if (wellToEdit) {
        let statusValue = wellToEdit.status[0] || "";
        if (statusValue === "Dry" || statusValue === "Contaminated") {
            statusValue = "Completely broken";
        }
        document.getElementById("conditionSelect").value = statusValue;
        const qualityValues = Array.isArray(wellToEdit.waterQuality) ? wellToEdit.waterQuality : [wellToEdit.waterQuality];
        qualityValues.forEach(q => {
            const btn = document.querySelector(`.quality-btn[data-value="${q}"]`);
            if (btn) btn.classList.add("active");
        });
        document.getElementById("availabilitySelect").value = wellToEdit.waterAvailability;
        document.getElementById("typeSelect").value = wellToEdit.wellType;
        if (wellToEdit.wellDepth)
            document.getElementById("depthSelect").value = wellToEdit.wellDepth;
    }
}

function performSearch() {
    const term = searchInput.value.toLowerCase();
    if (term.length < 3) return;

    const t = translations[currentLanguage];

    const localWell = wells.find(w => {
        const villageTranslated = (t[w.village] || w.village).toLowerCase();
        const nameTranslated = (t[w.name] || w.name).toLowerCase();
        return villageTranslated.includes(term) || nameTranslated.includes(term);
    });

    if (localWell) {
        map.setView(localWell.coords, 14);
        localWell.marker.openPopup();
    } else {
        fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                term + " Syria"
            )}`
        )
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const lat = data[0].lat;
                    const lon = data[0].lon;
                    map.setView([lat, lon], 12);
                } else {
                    alert(translations[currentLanguage].alertLocationNotFound);
                }
            })
            .catch(err => {
                console.error("Error:", err);
            });
    }
}

// EXPOSE TO WINDOW
window.handleMapTapForNewWell = handleMapTapForNewWell;
window.openModal = openModal;
window.closeModal = closeModal;
window.submitReport = submitReport;
window.closeLegend = function() {
    const overlay = document.getElementById("legendOverlay");
    if (overlay) overlay.remove();
    localStorage.setItem("hasSeenLegend", "true");
}

/* -------------------------
            INIT (DOM READY)
----------------------------*/
document.addEventListener("DOMContentLoaded", () => {
    setLanguage(currentLanguage);
    loadWellsFromStorage();

    wells.forEach(w => {
        if (!w.marker) {
            const color = chooseColorName(w);
            const iconObj = getPinIcon(color, w.isOffline);
            const m = L.marker(w.coords, { icon: iconObj }).addTo(map);
            m.bindPopup(createWellPopupContent(w), {
                closeButton: true,
                autoPan: false,
                autoPanPadding: L.point(10, 80),
            });
            w.marker = m;
        }
    });

    // Event Listeners
    const mainBtn = document.getElementById("mainAddWellBtn");
    const optionsDiv = document.getElementById("addWellOptions");
    const cancelBtn = document.getElementById("cancelAddWellBtn");
    const currentLocationBtn = document.getElementById("addWellCurrentLocationBtn");
    const tapMapBtn = document.getElementById("addWellTapMapBtn");

    if (mainBtn) {
        mainBtn.addEventListener("click", function () {
            optionsDiv.classList.add("active");
            mainBtn.style.display = "none";
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
            optionsDiv.classList.remove("active");
            mainBtn.style.display = "block";
        });
    }

    if (currentLocationBtn) {
        currentLocationBtn.addEventListener("click", function () {
            optionsDiv.classList.remove("active");
            mainBtn.style.display = "block";
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    function (position) {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        map.setView([lat, lng], 14);
                        openModal("Current Location", "", [lat, lng]);
                    },
                    function () {
                        alert(translations[currentLanguage].alertCurrentLocationError);
                    }
                );
            } else {
                alert(translations[currentLanguage].alertGeolocationNotSupported);
            }
        });
    }

    if (tapMapBtn) {
        tapMapBtn.addEventListener("click", function () {
            optionsDiv.classList.remove("active");
            mainBtn.style.display = "block";
            alert(translations[currentLanguage].alertTapMapPrompt);
            map.on("click", handleMapTapForNewWell);
        });
    }

    document.getElementById("langEn").addEventListener("click", () => setLanguage("en"));
    document.getElementById("langAr").addEventListener("click", () => setLanguage("ar"));
    document.getElementById("langKu").addEventListener("click", () => setLanguage("ku"));

    const searchInputEl = document.getElementById("searchInput");
    if (searchInputEl) {
        searchInputEl.addEventListener("keypress", function (e) {
            if (e.key === "Enter") performSearch();
        });
    }

    // LEGEND
    const hasSeenLegend = localStorage.getItem("hasSeenLegend");
    if (!hasSeenLegend) {
        setTimeout(showLegend, 1500);
    }

    function showLegend() {
        const t = translations[currentLanguage];
    const pinSvg = (color) => `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 36'%3E%3Cpath fill='${color}' d='M12 0c-6.6 0-12 5.4-12 12 0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z'/%3E%3C/svg%3E`;
        
        // purple pin with 🦠
        const purpleSvg = `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 36'%3E%3Cpath fill='%239333ea' d='M12 0c-6.6 0-12 5.4-12 12 0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z'/%3E%3Ctext x='12' y='17' font-size='12' text-anchor='middle'%3E🦠%3C/text%3E%3C/svg%3E`;

        const imgBlue = pinSvg('%231D4ED8');
        const imgLight = pinSvg('%2360A5FA');
        const imgOrange = pinSvg('%23F59E0B');
        const imgRed = pinSvg('%23DC2626');
        const imgPurple = purpleSvg;

        const legendHTML = `
            <div class="legend-overlay" id="legendOverlay">
                <div class="legend-card">
                    <h2 style="color:#001d6e; margin-top:0; margin-bottom: 20px;">${t.legendTitle}</h2>
                    <div class="legend-item"><img src="${imgBlue}" class="legend-icon-img"><span>${t.legPlenty}</span></div>
                    <div class="legend-item"><img src="${imgLight}" class="legend-icon-img"><span>${t.legModerate}</span></div>
                    <div class="legend-item"><img src="${imgOrange}" class="legend-icon-img"><span>${t.legScarce}</span></div>
                    <div class="legend-item"><img src="${imgRed}" class="legend-icon-img"><span>${t.legNone}</span></div>
                    <div class="legend-item"><img src="${imgPurple}" class="legend-icon-img"><span style="color:#9333ea; font-weight:bold;">${t.legContaminated}</span></div>
                    <button class="submit-btn" style="margin-top:20px;" onclick="window.closeLegend()">${t.btnGotIt}</button>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', legendHTML);
    }

    // NETWORK STATUS
    const netStatusDiv = document.createElement("div");
    netStatusDiv.className = "network-status";
    document.body.appendChild(netStatusDiv);

    function updateNetworkStatus() {
        const t = translations[currentLanguage];
        const isOnline = navigator.onLine;
        netStatusDiv.className = isOnline ? "network-status online" : "network-status offline";
        netStatusDiv.innerHTML = `
            <div class="status-dot"></div>
            <span>${isOnline ? t.netOnline : t.netOffline}</span>
        `;
    }
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    setTimeout(updateNetworkStatus, 500);

    // Sync Simulation
    window.addEventListener('online', () => {
        let syncedCount = 0;
        wells.forEach(w => {
            if (w.isOffline) {
                w.isOffline = false;
                syncedCount++;
            }
        });
        if (syncedCount > 0) {
            saveWellsToStorage();
            updateAllWellPopups();
        }
    });

    // PWA Logic
    const installBanner = document.getElementById("installBanner");
    const installBtn = document.getElementById("installBtn");
    const manualInstallBtn = document.getElementById("manualInstallBtn");
    const closeBannerBtn = document.getElementById("closeInstallBanner");
    let deferredPrompt;

    function showInfoModal(titleKey, msgKey) {
        const t = translations[currentLanguage];
        if (!modalContent) return;
        modalContent.innerHTML = `
            <div class="modal-header-controls" style="border: none;">
                <div class="close-btn" onclick="window.closeModal()">×</div>
            </div>
            <div style="padding: 0 24px 40px 24px; text-align: center;">
                <h2 style="color: #001d6e; margin-bottom: 16px;">${t[titleKey]}</h2>
                <p style="font-size: 16px; line-height: 1.6; color: #333;">${t[msgKey]}</p>
                <button class="submit-btn" onclick="window.closeModal()">OK</button>
            </div>
        `;
        if (modalBg) modalBg.style.display = "flex";
    }

    window.addEventListener("beforeinstallprompt", e => {
        e.preventDefault();
        deferredPrompt = e;
        if (!localStorage.getItem("installBannerDismissed")) {
            updateInstallTexts();
            if (installBanner) installBanner.style.display = "flex";
        }
        if (manualInstallBtn) {
            manualInstallBtn.style.display = "block";
            manualInstallBtn.textContent = translations[currentLanguage].manualInstallBtn;
        }
    });

    async function triggerInstall() {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        if (installBanner) installBanner.style.display = "none";
        if (manualInstallBtn) manualInstallBtn.style.display = "none";
        if (optionsDiv && mainBtn) {
            optionsDiv.classList.remove("active");
            mainBtn.style.display = "block";
        }
    }

    if (installBtn) installBtn.addEventListener("click", triggerInstall);
    if (manualInstallBtn) manualInstallBtn.addEventListener("click", triggerInstall);
    if (closeBannerBtn) {
        closeBannerBtn.addEventListener("click", () => {
            if (installBanner) installBanner.style.display = "none";
            localStorage.setItem("installBannerDismissed", "true");
        });
    }

    window.addEventListener("appinstalled", () => {
        if (installBanner) installBanner.style.display = "none";
        if (manualInstallBtn) manualInstallBtn.style.display = "none";
        showInfoModal("installSuccessTitle", "installSuccessMsg");
    });

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (isStandalone) {
        const hasSeenTutorial = localStorage.getItem("pwaTutorialSeen");
        if (!hasSeenTutorial) {
            setTimeout(() => {
                showInfoModal("firstRunTitle", "firstRunMsg");
                localStorage.setItem("pwaTutorialSeen", "true");
            }, 1000);
        }
    }
});




