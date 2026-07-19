/**
 * Seed CruiseWord world-geography vocabulary words. Run after migrations:
 *   node --env-file=.env ./node_modules/tsx/dist/cli.mjs scripts/seed-cruiseword-words.ts
 * Idempotent: skips if cruise_word_words already has data.
 *
 * Theme: world geography — countries, capitals, traditional food, music, landmarks, languages.
 * 6 difficulty levels, each with a mix of categories. Maps directly to the Duolingo Learn Path.
 */
import { db } from "../server/db";
import { cruiseWordWords } from "@shared/schema";

const WORDS = [
  // ---------------- Level 1: Very Easy (recognizable countries & icons) ----------------
  { level: 1, category: "geography", word: "France", translationEs: "Francia", promptEs: "País de Europa occidental, famoso por la Torre Eiffel.", promptEn: "Western European country famous for the Eiffel Tower.", hintEs: "🗼 Croissant y la Torre Eiffel", hintEn: "🗼 Croissants and the Eiffel Tower", country: "France", emoji: "🥐" },
  { level: 1, category: "capital", word: "Paris", translationEs: "París", promptEs: "Capital de Francia, cruzada por el río Sena.", promptEn: "Capital of France, crossed by the Seine river.", hintEs: "🗼 La ciudad de la luz", hintEn: "🗼 The city of light", country: "France", emoji: "🗼" },
  { level: 1, category: "food", word: "Sushi", translationEs: "Sushi", promptEs: "Plato tradicional japonés de arroz con pescado crudo.", promptEn: "Traditional Japanese dish of rice with raw fish.", hintEs: "🍣 Arroz y pescado", hintEn: "🍣 Rice and fish", country: "Japan", emoji: "🍣" },
  { level: 1, category: "geography", word: "Japan", translationEs: "Japón", promptEs: "País insular de Asia oriental, conocido por el monte Fuji.", promptEn: "Island nation in East Asia known for Mount Fuji.", hintEs: "🗻 Sakura y Fuji", hintEn: "🗻 Sakura and Fuji", country: "Japan", emoji: "🗻" },
  { level: 1, category: "landmark", word: "Pyramids", translationEs: "Pirámides", promptEs: "Monumentos antiguos de Egipto cerca de El Cairo.", promptEn: "Ancient monuments of Egypt near Cairo.", hintEs: "🔺 Tumbas de faraones", hintEn: "🔺 Pharaohs' tombs", country: "Egypt", emoji: "🔺" },
  { level: 1, category: "geography", word: "Brazil", translationEs: "Brasil", promptEs: "País más grande de Sudamérica, hogar del Amazonas.", promptEn: "Largest country in South America, home of the Amazon.", hintEs: "🇧🇷 Carnaval y fútbol", hintEn: "🇧🇷 Carnival and football", country: "Brazil", emoji: "⚽" },
  { level: 1, category: "capital", word: "Rome", translationEs: "Roma", promptEs: "Capital de Italia, fundada según la leyenda por Rómulo.", promptEn: "Capital of Italy, said to be founded by Romulus.", hintEs: "🏛️ Coliseo", hintEn: "🏛️ The Colosseum", country: "Italy", emoji: "🏛️" },
  { level: 1, category: "food", word: "Tacos", translationEs: "Tacos", promptEs: "Comida callejera mexicana de tortilla con relleno.", promptEn: "Mexican street food: tortilla with filling.", hintEs: "🌮 Maíz y chile", hintEn: "🌮 Corn and chili", country: "Mexico", emoji: "🌮" },

  // ---------------- Level 2: Easy ----------------
  { level: 2, category: "geography", word: "Canada", translationEs: "Canadá", promptEs: "País de América del Norte, famoso por el maple syrup.", promptEn: "North American country famous for maple syrup.", hintEs: "🍁 Hoja de arce", hintEn: "🍁 Maple leaf", country: "Canada", emoji: "🍁" },
  { level: 2, category: "capital", word: "Tokyo", translationEs: "Tokio", promptEs: "Capital de Japón y una de las ciudades más pobladas.", promptEn: "Capital of Japan and one of the most populous cities.", hintEs: "🏙️ Neon y anime", hintEn: "🏙️ Neon and anime", country: "Japan", emoji: "🏙️" },
  { level: 2, category: "music", word: "Samba", translationEs: "Samba", promptEs: "Género musical y baile tradicional de Brasil.", promptEn: "Traditional Brazilian music and dance genre.", hintEs: "💃 Carnaval de Río", hintEn: "💃 Rio Carnival", country: "Brazil", emoji: "💃" },
  { level: 2, category: "food", word: "Paella", translationEs: "Paella", promptEs: "Plato español de arroz con mariscos y azafrán.", promptEn: "Spanish rice dish with seafood and saffron.", hintEs: "🥘 Arroz de Valencia", hintEn: "🥘 Valencian rice", country: "Spain", emoji: "🥘" },
  { level: 2, category: "landmark", word: "Great Wall", translationEs: "Gran Muralla", promptEs: "Muralla antigua que recorre el norte de China.", promptEn: "Ancient wall stretching across northern China.", hintEs: "🧱 Defensa china", hintEn: "🧱 Chinese defense", country: "China", emoji: "🧱" },
  { level: 2, category: "geography", word: "Egypt", translationEs: "Egipto", promptEs: "País del noreste de África con el río Nilo.", promptEn: "Northeast African country with the Nile river.", hintEs: "🌍 Nilo y faraones", hintEn: "🌍 Nile and pharaohs", country: "Egypt", emoji: "🌍" },
  { level: 2, category: "language", word: "Spanish", translationEs: "Español", promptEs: "Idioma hablado en España y la mayor parte de Latinoamérica.", promptEn: "Language spoken in Spain and most of Latin America.", hintEs: "🗣️ Hola y gracias", hintEn: "🗣️ Hola and gracias", country: "Spain", emoji: "🗣️" },
  { level: 2, category: "capital", word: "Cairo", translationEs: "El Cairo", promptEs: "Capital de Egipto, junto a las pirámides de Giza.", promptEn: "Capital of Egypt, next to the Giza pyramids.", hintEs: "🐫 Ciudad de las mil torres", hintEn: "🐫 City of a thousand minarets", country: "Egypt", emoji: "🐫" },

  // ---------------- Level 3: Intermediate ----------------
  { level: 3, category: "geography", word: "India", translationEs: "India", promptEs: "País de Asia meridional, famoso por el Taj Mahal.", promptEn: "South Asian country famous for the Taj Mahal.", hintEs: "🕌 Taj Mahal", hintEn: "🕌 Taj Mahal", country: "India", emoji: "🕌" },
  { level: 3, category: "capital", word: "New Delhi", translationEs: "Nueva Delhi", promptEs: "Capital de India, en el norte del país.", promptEn: "Capital of India, in the north of the country.", hintEs: "🏛️ Poderoso centro", hintEn: "🏛️ Political hub", country: "India", emoji: "🏛️" },
  { level: 3, category: "food", word: "Curry", translationEs: "Curry", promptEs: "Plato condimentado de la cocina de la India y el sudeste asiático.", promptEn: "Spiced dish from Indian and Southeast Asian cuisine.", hintEs: "🌶️ Especias", hintEn: "🌶️ Spices", country: "India", emoji: "🌶️" },
  { level: 3, category: "music", word: "Flamenco", translationEs: "Flamenco", promptEs: "Arte andaluz de cante, baile y guitarra.", promptEn: "Andalusian art of song, dance, and guitar.", hintEs: "🎸 Andalucía", hintEn: "🎸 Andalusia", country: "Spain", emoji: "🎸" },
  { level: 3, category: "geography", word: "Australia", translationEs: "Australia", promptEs: "País y continente rodeado por océano, con kanguros.", promptEn: "Country and continent surrounded by ocean, home to kangaroos.", hintEs: "🦘 Outback", hintEn: "🦘 Outback", country: "Australia", emoji: "🦘" },
  { level: 3, category: "landmark", word: "Sydney Opera", translationEs: "Ópera de Sídney", promptEs: "Edificio icónico con techo de conchas en Australia.", promptEn: "Iconic shell-roofed building in Australia.", hintEs: "🎭 Bahía de Sídney", hintEn: "🎭 Sydney Harbour", country: "Australia", emoji: "🎭" },
  { level: 3, category: "language", word: "Mandarin", translationEs: "Mandarín", promptEs: "Idioma más hablado de China y del mundo.", promptEn: "Most spoken language of China and the world.", hintEs: "🈶 Caracteres", hintEn: "🈶 Characters", country: "China", emoji: "🈶" },
  { level: 3, category: "geography", word: "Kenya", translationEs: "Kenia", promptEs: "País de África oriental famoso por su vida salvaje.", promptEn: "East African country famous for its wildlife.", hintEs: "🦁 Safari", hintEn: "🦁 Safari", country: "Kenya", emoji: "🦁" },

  // ---------------- Level 4: Hard ----------------
  { level: 4, category: "geography", word: "Norway", translationEs: "Noruega", promptEs: "País nórdico conocido por los fiordos y auroras.", promptEn: "Nordic country known for fjords and auroras.", hintEs: "🏔️ Fiordos", hintEn: "🏔️ Fjords", country: "Norway", emoji: "🏔️" },
  { level: 4, category: "capital", word: "Oslo", translationEs: "Oslo", promptEs: "Capital de Noruega, junto al fiordo de Oslo.", promptEn: "Capital of Norway, on the Oslo fjord.", hintEs: "❄️ Invierno", hintEn: "❄️ Winter", country: "Norway", emoji: "❄️" },
  { level: 4, category: "music", word: "Reggae", translationEs: "Reggae", promptEs: "Género musical de Jamaica, popularizado por Bob Marley.", promptEn: "Jamaican music genre popularized by Bob Marley.", hintEs: "🎵 Jamaica", hintEn: "🎵 Jamaica", country: "Jamaica", emoji: "🎵" },
  { level: 4, category: "food", word: "Kimchi", translationEs: "Kimchi", promptEs: "Plato coreano de verduras fermentadas con chile.", promptEn: "Korean dish of fermented vegetables with chili.", hintEs: "🥬 Fermentado", hintEn: "🥬 Fermented", country: "South Korea", emoji: "🥬" },
  { level: 4, category: "landmark", word: "Machu Picchu", translationEs: "Machu Picchu", promptEs: "Ciudad inca en las montañas de Perú.", promptEn: "Inca citadel in the mountains of Peru.", hintEs: "⛰️ Inca", hintEn: "⛰️ Inca", country: "Peru", emoji: "⛰️" },
  { level: 4, category: "geography", word: "Peru", translationEs: "Perú", promptEs: "País de Sudamérica con la cordillera de los Andes.", promptEn: "South American country with the Andes mountains.", hintEs: "🏔️ Andes", hintEn: "🏔️ Andes", country: "Peru", emoji: "🏔️" },
  { level: 4, category: "language", word: "Portuguese", translationEs: "Portugués", promptEs: "Idioma de Brasil y Portugal, derivado del latín.", promptEn: "Language of Brazil and Portugal, from Latin.", hintEs: "🗣️ Brasil", hintEn: "🗣️ Brazil", country: "Portugal", emoji: "🗣️" },
  { level: 4, category: "capital", word: "Lima", translationEs: "Lima", promptEs: "Capital de Perú, en la costa del Pacífico.", promptEn: "Capital of Peru, on the Pacific coast.", hintEs: "🌊 Costa", hintEn: "🌊 Coast", country: "Peru", emoji: "🌊" },

  // ---------------- Level 5: Very Hard ----------------
  { level: 5, category: "geography", word: "Iceland", translationEs: "Islandia", promptEs: "Isla del Atlántico norte con géiseres y volcanes.", promptEn: "North Atlantic island with geysers and volcanoes.", hintEs: "🌋 Hielo y fuego", hintEn: "🌋 Fire and ice", country: "Iceland", emoji: "🌋" },
  { level: 5, category: "capital", word: "Reykjavik", translationEs: "Reikiavik", promptEs: "Capital de Islandia, la más septentrional del mundo.", promptEn: "Capital of Iceland, the world's northernmost capital.", hintEs: "🌨️ Ártico", hintEn: "🌨️ Arctic", country: "Iceland", emoji: "🌨️" },
  { level: 5, category: "food", word: "Couscous", translationEs: "Cuscús", promptEs: "Plato del norte de África de sémola de trigo.", promptEn: "North African dish of wheat semolina.", hintEs: "🍲 Magreb", hintEn: "🍲 Maghreb", country: "Morocco", emoji: "🍲" },
  { level: 5, category: "music", word: "Tango", translationEs: "Tango", promptEs: "Baile y música nacidos en Buenos Aires.", promptEn: "Dance and music born in Buenos Aires.", hintEs: "💞 Argentina", hintEn: "💞 Argentina", country: "Argentina", emoji: "💞" },
  { level: 5, category: "landmark", word: "Petra", translationEs: "Petra", promptEs: "Ciudad arqueológica tallada en roca en Jordania.", promptEn: "Archaeological city carved in rock in Jordan.", hintEs: "🏜️ Roca roja", hintEn: "🏜️ Red rock", country: "Jordan", emoji: "🏜️" },
  { level: 5, category: "geography", word: "Jordan", translationEs: "Jordania", promptEs: "País de Oriente Medio con desiertos y Petra.", promptEn: "Middle Eastern country with deserts and Petra.", hintEs: "🏜️ Medio oriente", hintEn: "🏜️ Middle East", country: "Jordan", emoji: "🏜️" },
  { level: 5, category: "language", word: "Arabic", translationEs: "Árabe", promptEs: "Idioma de Oriente Medio y norte de África, de derecha a izquierda.", promptEn: "Language of the Middle East and North Africa, written right-to-left.", hintEs: "📜 Calligrafía", hintEn: "📜 Calligraphy", country: "Saudi Arabia", emoji: "📜" },
  { level: 5, category: "capital", word: "Buenos Aires", translationEs: "Buenos Aires", promptEs: "Capital de Argentina, conocida como la París de América.", promptEn: "Capital of Argentina, the Paris of the Americas.", hintEs: "🌆 Tango", hintEn: "🌆 Tango", country: "Argentina", emoji: "🌆" },

  // ---------------- Level 6: Extremely Hard ----------------
  { level: 6, category: "geography", word: "Kazakhstan", translationEs: "Kazajistán", promptEs: "País de Asia central, el más grande sin salida al mar.", promptEn: "Central Asian country, largest landlocked nation.", hintEs: "🛰️ Asia central", hintEn: "🛰️ Central Asia", country: "Kazakhstan", emoji: "🛰️" },
  { level: 6, category: "capital", word: "Astana", translationEs: "Astana", promptEs: "Capital de Kazajistán, con arquitectura futurista.", promptEn: "Capital of Kazakhstan, with futuristic architecture.", hintEs: "🏙️ Moderna", hintEn: "🏙️ Modern", country: "Kazakhstan", emoji: "🏙️" },
  { level: 6, category: "food", word: "Pierogi", translationEs: "Pierogi", promptEs: "Dumplings rellenos de Europa central y oriental.", promptEn: "Filled dumplings of Central and Eastern Europe.", hintEs: "🥟 Europa del este", hintEn: "🥟 Eastern Europe", country: "Poland", emoji: "🥟" },
  { level: 6, category: "music", word: "Gamelan", translationEs: "Gamelán", promptEs: "Conjunto musical deIndonesia con metales percutidos.", promptEn: "Indonesian ensemble of struck metal instruments.", hintEs: "🥁 Indonesia", hintEn: "🥁 Indonesia", country: "Indonesia", emoji: "🥁" },
  { level: 6, category: "landmark", word: "Angkor Wat", translationEs: "Angkor Wat", promptEs: "Templo del siglo XII en Camboya, el sitio religioso más grande.", promptEn: "12th-century temple in Cambodia, largest religious site.", hintEs: "🛕 Camboya", hintEn: "🛕 Cambodia", country: "Cambodia", emoji: "🛕" },
  { level: 6, category: "geography", word: "Cambodia", translationEs: "Camboya", promptEs: "País del sudeste asiático con selvas y templos antiguos.", promptEn: "Southeast Asian country with jungles and ancient temples.", hintEs: "🌴 Mekong", hintEn: "🌴 Mekong", country: "Cambodia", emoji: "🌴" },
  { level: 6, category: "language", word: "Swahili", translationEs: "Suajili", promptEs: "Idioma de África oriental, lengua franca de la región.", promptEn: "East African language, regional lingua franca.", hintEs: "🗣️ África oriental", hintEn: "🗣️ East Africa", country: "Tanzania", emoji: "🗣️" },
  { level: 6, category: "capital", word: "Phnom Penh", translationEs: "Phnom Penh", promptEs: "Capital de Camboya, en la confluencia de dos ríos.", promptEn: "Capital of Cambodia, at the confluence of two rivers.", hintEs: "🌅 Mekong", hintEn: "🌅 Mekong", country: "Cambodia", emoji: "🌅" },
];

async function seed() {
  const existing = await db.select().from(cruiseWordWords);
  if (existing.length > 0) {
    console.log(`cruise_word_words already has ${existing.length} rows. Skipping seed.`);
    return;
  }
  console.log(`Seeding ${WORDS.length} cruise_word_words...`);
  await db.insert(cruiseWordWords).values(WORDS);
  const count = await db.select().from(cruiseWordWords);
  console.log(`Done. Total cruise_word_words: ${count.length}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
