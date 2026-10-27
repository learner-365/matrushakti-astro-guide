export type Locale = "en" | "hi" | "or";

export const messages = {
  en: {
    generate: "Generate my Kundli", birthDetails: "Birth details", rashi: "Rashi", lagna: "Lagna",
    nakshatra: "Nakshatra", pada: "Pada", house: "House", planetaryDetails: "Planetary details",
    planets: { Sun: "Sun", Moon: "Moon", Mars: "Mars", Mercury: "Mercury", Jupiter: "Jupiter", Venus: "Venus", Saturn: "Saturn", Rahu: "Rahu", Ketu: "Ketu" },
    rashis: ["Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya", "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena"],
  },
  hi: {
    generate: "कुंडली बनाएँ", birthDetails: "जन्म विवरण", rashi: "राशि", lagna: "लग्न",
    nakshatra: "नक्षत्र", pada: "पाद", house: "भाव", planetaryDetails: "ग्रहों की स्थिति",
    planets: { Sun: "सूर्य", Moon: "चंद्र", Mars: "मंगल", Mercury: "बुध", Jupiter: "गुरु", Venus: "शुक्र", Saturn: "शनि", Rahu: "राहु", Ketu: "केतु" },
    rashis: ["मेष", "वृषभ", "मिथुन", "कर्क", "सिंह", "कन्या", "तुला", "वृश्चिक", "धनु", "मकर", "कुंभ", "मीन"],
  },
  or: {
    generate: "ମୋର କୁଣ୍ଡଳୀ ତିଆରି କରନ୍ତୁ", birthDetails: "ଜନ୍ମ ବିବରଣୀ", rashi: "ରାଶି", lagna: "ଲଗ୍ନ",
    nakshatra: "ନକ୍ଷତ୍ର", pada: "ପାଦ", house: "ଭାବ", planetaryDetails: "ଗ୍ରହମାନଙ୍କ ସ୍ଥିତି",
    planets: { Sun: "ସୂର୍ଯ୍ୟ", Moon: "ଚନ୍ଦ୍ର", Mars: "ମଙ୍ଗଳ", Mercury: "ବୁଧ", Jupiter: "ଗୁରୁ", Venus: "ଶୁକ୍ର", Saturn: "ଶନି", Rahu: "ରାହୁ", Ketu: "କେତୁ" },
    rashis: ["ମେଷ", "ବୃଷ", "ମିଥୁନ", "କର୍କଟ", "ସିଂହ", "କନ୍ୟା", "ତୁଳା", "ବିଛା", "ଧନୁ", "ମକର", "କୁମ୍ଭ", "ମୀନ"],
  },
} as const;

