export interface VocabWord {
  id: string;
  word: string;
  category: string; // matches subcategory or general
  meaning: string;
  translations: {
    Spanish?: string;
    French?: string;
    German?: string;
    Hindi?: string;
  };
  funFact?: string;
}

export const VOCABULARY_WORDS: VocabWord[] = [
  // Science & Space
  {
    id: 'v1',
    word: 'Nebula',
    category: 'science-facts',
    meaning: 'An immense cloud of gas and dust in outer space, where new stars are born.',
    translations: {
      Spanish: 'Nebulosa: Una inmensa nube de gas y polvo en el espacio exterior, donde nacen nuevas estrellas.',
      French: 'Nébuleuse: Un nuage géant de gaz et de poussière dans l\'espace, où naissent les étoiles.',
      German: 'Nebel: Eine riesige Wolke aus Gas und Staub im Weltraum, in der neue Sterne geboren werden.'
    },
    funFact: 'Some nebulae look like giant butterflies or crabs!'
  },
  {
    id: 'v2',
    word: 'Gravity',
    category: 'science-facts',
    meaning: 'The invisible force that pulls objects toward each other, like holding us to the ground.',
    translations: {
      Spanish: 'Gravedad: La fuerza invisible que atrae los objetos entre sí, como mantenernos en el suelo.',
      French: 'Gravité: La force invisible qui attire les objets les uns vers les autres, comme nous retenir au sol.',
      German: 'Schwerkraft: Die unsichtbare Kraft, die Objekte anzieht, wie die Erde uns auf dem Boden hält.'
    },
    funFact: 'Without gravity, you would float away into space like a balloon!'
  },
  {
    id: 'v3',
    word: 'Asteroid',
    category: 'science-facts',
    meaning: 'A small rocky object that orbits the Sun, much smaller than a planet.',
    translations: {
      Spanish: 'Asteroide: Un pequeño objeto rocoso que orbita alrededor del Sol, mucho más pequeño que un planeta.',
      French: 'Astéroïde: Un petit objet rocheux en orbitu alour du Soleil, plus petit qu\'une planète.',
      German: 'Asteroid: Ein kleiner Gesteinsbrocken, der um die Sonne kreist, viel kleiner als ein Planet.'
    },
    funFact: 'Most asteroids reside in a giant ring called the Asteroid Belt!'
  },
  // Math & Tricks
  {
    id: 'v4',
    word: 'Fraction',
    category: 'math-puzzles',
    meaning: 'A part of a whole, usually represented by one number over another (like 1/2 of a pizza).',
    translations: {
      Spanish: 'Fracción: Una parte de un todo, generalmente representada por un número sobre otro (como la mitad de una pizza).',
      French: 'Fraction: Une partie d\'un tout, représentée par un chiffre sur un autre (comme 1/2 de pizza).',
      German: 'Bruch: Ein Teil eines Ganzen, dargestellt durch eine Zahl über einer anderen (wie 1/2 einer Pizza).'
    },
    funFact: 'The top number is the numerator, and the bottom is the denominator!'
  },
  {
    id: 'v5',
    word: 'Symmetry',
    category: 'math-puzzles',
    meaning: 'When one half of an object is a perfect mirror image of the other half.',
    translations: {
      Spanish: 'Simetría: Cuando una mitad de un objeto es una imagen de espejo perfecta de la otra mitad.',
      French: 'Symétrie: Lorsqu\'une moitié d\'un objet est le reflet exact de l\'autre moitié.',
      German: 'Symmetrie: Wenn eine Hälfte eines Objekts ein perfektes Spiegelbild der anderen Hälfte ist.'
    },
    funFact: 'Butterflies have almost perfect symmetry on their wings!'
  },
  // Animals & Nature
  {
    id: 'v6',
    word: 'Ecosystem',
    category: 'animals-nature',
    meaning: 'A community of living organisms interacting with their non-living environment (like a forest or pond).',
    translations: {
      Spanish: 'Ecosistema: Comunidad de organismos vivos que interactúan con su entorno no vivo (como un bosque o estanque).',
      French: 'Écosystème: Une communauté d\'organismes vivants qui interagissent avec leur environnement non vivant.',
      German: 'Ökosystem: Eine Gemeinschaft lebender Organismen, die mit ihrer unbelebten Umwelt interagieren.'
    },
    funFact: 'Even a small puddle can be a tiny ecosystem for bugs and bacteria!'
  },
  {
    id: 'v7',
    word: 'Camouflage',
    category: 'animals-nature',
    meaning: 'A defense mechanism that organisms use to disguise their appearance, usually to blend in with their surroundings.',
    translations: {
      Spanish: 'Camuflaje: Mecanismo de defensa que usan los organismos para ocultarse, mezclándose con su entorno.',
      French: 'Camouflage: Un moyen de se déguiser pour se fondre dans le décor environnant.',
      German: 'Tarnung: Eine Methode, sich unsichtbar zu machen, indem man sich seiner Umgebung anpasst.'
    },
    funFact: 'The Mimic Octopus can change shape and color to look like 15 different sea creatures!'
  },
  {
    id: 'v8',
    word: 'Metamorphosis',
    category: 'animals-nature',
    meaning: 'The amazing transformation process of an animal from larva to its adult form (e.g. caterpillar to butterfly).',
    translations: {
      Spanish: 'Metamorfosis: El increíble proceso de transformación de un animal de larva a su forma adulta.',
      French: 'Métamorphose: Le processus impressionnant de transformation d\'un animal (comme la chenille en papillon).',
      German: 'Metamorphose: Der erstaunliche Prozess der Verwandlung eines Tieres von der Larve zum ausgewachsenen Tier.'
    },
    funFact: 'Frog poles go through metamorphosis to lose their tails and grow legs!'
  },
  // Coding / Tech
  {
    id: 'v9',
    word: 'Algorithm',
    category: 'coding-basics',
    meaning: 'A precise, step-by-step set of instructions to solve a problem or complete a task (like a recipe).',
    translations: {
      Spanish: 'Algoritmo: Un conjunto de instrucciones paso a paso para resolver un problema o completar una tarea.',
      French: 'Algorithme: Une série d\'instructions précises étape par étape pour résoudre un problème.',
      German: 'Algorithmus: Eine präzise Anleitung zur Schritt-für-Schritt-Lösung eines Problems.'
    },
    funFact: 'Brushing your teeth is a real-life algorithm: wet brush, apply paste, scrub, rinse!'
  },
  {
    id: 'v10',
    word: 'Recursion',
    category: 'coding-basics',
    meaning: 'A programming concept where a function or rule refers back or calls itself again and again.',
    translations: {
      Spanish: 'Recursión: Un concepto de programación donde una función se llama a sí misma repetidamente.',
      French: 'Récursion: Concept de programmation où une fonction s\'appelle elle-même plusieurs fois.',
      German: 'Rekursion: Ein Konzept beim Programmieren, bei dem sich eine Funktion selbst wieder aufruft.'
    },
    funFact: 'Standing between two mirrors creates an infinite visual recursion!'
  },
  // History
  {
    id: 'v11',
    word: 'Hieroglyph',
    category: 'history-lessons',
    meaning: 'A picture or symbol used in ancient writing, especially during ancient Egyptian times.',
    translations: {
      Spanish: 'Jeroglífico: Un dibujo o símbolo usado en la escritura antigua, especialmente en el antiguo Egipto.',
      French: 'Hiéroglyphe: Un dessin ou symbole utilisé comme écriture, particulièrement par les anciens Égyptiens.',
      German: 'Hieroglyphe: Ein Bild oder Zeichen, das als Schriftzeichen verwendet wird, besonders im alten Ägypten.'
    },
    funFact: 'Egyptians wrote hieroglyphs on papyrus, which was an early form of paper!'
  },
  // Architecture / Monolith
  {
    id: 'v12',
    word: 'Archeology',
    category: 'history-lessons',
    meaning: 'The study of human history and prehistory through the excavation of ancient sites and artifacts.',
    translations: {
      Spanish: 'Arqueología: El estudio de la historia humana a través de la excavación de sitios antiguos y artefactos.',
      French: 'Archéologie: L\'étude de l\'histoire humaine à travers les fouilles de sites anciens et d\'objets.',
      German: 'Archäologie: Das Erforschen der menschlichen Geschichte durch das Ausgraben von alten Siedlungen und Werkzeugen.'
    },
    funFact: 'Archeologists use gentle brushes to sweep sand off fossils so they do not scratch them!'
  },
  // Craft & DIY
  {
    id: 'v13',
    word: 'Origami',
    category: 'craft-diy',
    meaning: 'The traditional Japanese art of folding paper into amazing decorative shapes and animal figures.',
    translations: {
      Spanish: 'Origami: El arte tradicional japonés de doblar papel en increíbles formas decorativas y figuras de animales.',
      French: 'Origami: L\'art traditionnel japonais de plier le papier pour créer des formes décoratives.',
      German: 'Origami: Die traditionelle japanische Kunst des Papierfaltens zu Figuren.'
    },
    funFact: 'The word origami comes from "ori" (folding) and "kami" (paper)!'
  },
  // Riddles / Brain
  {
    id: 'v14',
    word: 'Paradox',
    category: 'jokes',
    meaning: 'A statement or puzzle that seems to contradict itself, but may contain a surprising truth.',
    translations: {
      Spanish: 'Paradoja: Declaración o enigma que parece contradecirse a sí mismo, pero puede encerrar una verdad sorprendente.',
      French: 'Paradoxe: Une phrase ou énigme qui semble se contredire elle-même, mais cache une vérité.',
      German: 'Paradoxon: Widerspruch in sich selbst, der dennoch eine tiefe Wahrheit enthalten kann.'
    },
    funFact: 'The question "Which came first, the chicken or the egg?" is a famous classic paradox!'
  },
  // General Kid Trivia
  {
    id: 'v15',
    word: 'Bioluminescence',
    category: 'amazing-facts',
    meaning: 'The biological production of light by a living organism, like fireflies or deep-sea jellyfish.',
    translations: {
      Spanish: 'Bioluminiscencia: La producción de luz de un organismo vivo, como las luciérnagas o medusas.',
      French: 'Bioluminescence: La production de lumière par un être vivant, comme les lucioles ou les méduses.',
      German: 'Biolumineszenz: Das Erzeugen von Kaltlicht durch Lebewesen wie Glühwürmchen oder Tiefseequallen.'
    },
    funFact: 'Some ocean waves glow brilliant neon blue at night because of tiny plankton!'
  }
];
