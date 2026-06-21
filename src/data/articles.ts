export interface Article {
  id: string;
  title: string;
  icon: string;
  category: string;
  difficulty: "Easy Peasy" | "Super Scholar" | "Brainiac";
  readTime: string;
  paragraphs: string[];
  funFact: string;
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
}

export const EDUCATIONAL_ARTICLES: Article[] = [
  {
    id: "art-1",
    title: "How Rainbows Form in the Sky",
    icon: "🌈",
    category: "Science & Weather",
    difficulty: "Easy Peasy",
    readTime: "2 min read",
    paragraphs: [
      "Have you ever wondered how a beautiful, colorful rainbow appears in the sky after a rainy day? It is not magic—it is actually science and light working together!",
      "When sunlight shines through the air, it looks white, but it is actually made of all the colors of the rainbow mixed together: Red, Orange, Yellow, Green, Blue, Indigo, and Violet.",
      "When rain falls, the air is filled with millions of tiny, round raindrops. When a ray of sunlight hits a raindrop, three things happen: first, the light enters the raindrop and bends (this is called Refraction). This bending splits the white light into all its individual colors.",
      "Second, the colors hit the back of the raindrop and bounce back inside (this is called Reflection). Finally, as the colors leave the raindrop, they bend one more time (Dispersion) and spread out into the beautiful colorful arch we see in the sky!"
    ],
    funFact: "You can never actually touch or reach the end of a rainbow, because a rainbow is an optical illusion that moves as you move!",
    quiz: {
      question: "What is the science word for when light enters a raindrop and bends?",
      options: [
        "Absorption",
        "Refraction (Bending of light)",
        "Gravitation",
        "Freezing"
      ],
      correctIndex: 1,
      explanation: "Refraction is when light passes from air into water and bends, separation of colors is then clearly visible!"
    }
  },
  {
    id: "art-2",
    title: "Do Trees Secretly Talk to Each Other?",
    icon: "🌲",
    category: "Nature & Biology",
    difficulty: "Super Scholar",
    readTime: "3 min read",
    paragraphs: [
      "When you walk in a forest, the trees look like they are standing alone, quiet and still. But underneath the soil, there is an amazing, secret network that connects them all!",
      "Scientists call this network the 'Wood Wide Web'. Tiny threads of fungi (mushrooms) called mycorrhizae grow around and inside the roots of all the different trees in the forest.",
      "Through these fungus threads, trees can share resources! If a baby tree is growing in the dark shade and cannot get enough sunlight, older trees can send sugar and nutrients through the underground network to help it grow.",
      "Even cooler, trees use this network as an alarm system! If a tree gets attacked by bugs, it sends a chemical warning message through the mycelium network to neighboring trees. When the other trees get the message, they start producing bad-tasting chemicals to defend themselves!"
    ],
    funFact: "Mother trees can recognize their own offspring trees underground and send them extra food to survive!",
    quiz: {
      question: "What do scientists call the underground network that trees use to share food and warnings?",
      options: [
        "The Tree Phone",
        "The Wood Wide Web",
        "The Forest Pipeline",
        "The Root Route"
      ],
      correctIndex: 1,
      explanation: "The 'Wood Wide Web' refers to mycorrhizal networks that connect plants and share nutrients/signals."
    }
  },
  {
    id: "art-3",
    title: "The Super Flight of Honeybees",
    icon: "🐝",
    category: "Insects & Ecosystems",
    difficulty: "Easy Peasy",
    readTime: "2 min read",
    paragraphs: [
      "Honeybees are tiny insects, but they carry one of the biggest responsibilities on Earth! They are key pollinators, which means they help crops, trees, and flowers multiply.",
      "As a bee flies from flower to flower to drink sweet nectar, yellow dust called pollen sticks to its fuzzy legs. When the bee landing on the next flower, it drops some of that pollen, which allows the plant to grow seeds and fruits!",
      "But how do bees find the best flowers? When a scout bee finds a garden filled with sweet syrup, she flies back to the honeycomb hive and does an amazing dance called the 'Waggle Dance'!",
      "By shaking her body and walking in a figure-eight shape, she tells other bees exactly which direction to fly and how far to go relative to the position of the sun. It is a highly advanced mathematical language without any words!"
    ],
    funFact: "To make just one pound of honey, bees in a hive must fly over 55,000 miles and visit two million flowers!",
    quiz: {
      question: "How do honeybees tell other hive-mates where to find a delicious flower sweet-spot?",
      options: [
        "They carry maps made of leaves",
        "They make high-pitched buzzing songs",
        "They perform the Waggle Dance",
        "They point their antennas"
      ],
      correctIndex: 2,
      explanation: "The Waggle Dance is a complex choreography used by bees to share coordinates of rich flower patches."
    }
  },
  {
    id: "art-4",
    title: "Why Does the Moon Look Different Every Night?",
    icon: "🌙",
    category: "Astronomy",
    difficulty: "Brainiac",
    readTime: "3 min read",
    paragraphs: [
      "Some nights the Moon is a round silver ball, other nights it is a thin crescent sliver, and sometimes it disappears completely! Does the Moon actually change size or shape?",
      "The answer is no! The Moon is always a solid round sphere. It does not produce its own light; instead, it shines because it is reflecting light from our Sun like a big space mirror.",
      "As the Moon orbits (circles around) planet Earth once every 29 days, we see the Sun lighting up different parts of its surface. This causes the 'Lunar Phases' we notice from our bedroom windows.",
      "A 'New Moon' is when the Moon is directly between our Earth and the Sun, so the dark side is facing us. As it moves, we see more of its lit side (Waxing), eventually reaching the glorious 'Full Moon'. Then, it slowly shrinks back down to dark (Waning) in a continuous cycle!"
    ],
    funFact: "We only ever see the exact same side of the moon from Earth, because the moon spins on its axis at the exact same speed as it circles the Earth!",
    quiz: {
      question: "Why does the Moon look like it is changing shapes throughout the month?",
      options: [
        "Space monsters are eating it and it grows back",
        "It is passing through thick cosmic clouds",
        "We see different amounts of its sunlit side as it orbits Earth",
        "It gains and loses water oceans"
      ],
      correctIndex: 2,
      explanation: "Lunar phases depend on the relative positions of the sun, earth, and moon as the moon revolves around us."
    }
  }
];
