// All characters, clothes, dances, music and stages in the game.
// Everything here is original: fairy-tale archetypes, not any studio's characters.

const SKIN = ['#fbe1cc', '#f3c9a6', '#e3a97f', '#c98a57', '#9c643b', '#6f442a'];

const HAIR_COLORS = [
  '#2b1d16', '#4a2c1a', '#7a4a26', '#a2442a', '#d9692b', '#f2c75c',
  '#f6ecd2', '#d9d4ee', '#f59ac0', '#6cb6f0', '#9b6cd8', '#5fcfa8'
];

const HAIR_STYLES = [
  { id: 'long', name: 'Long' },
  { id: 'longbraid', name: 'Super Long Braid' },
  { id: 'wavy', name: 'Wavy' },
  { id: 'braids', name: 'Braids' },
  { id: 'bun', name: 'Bun' },
  { id: 'ponytail', name: 'Ponytail' },
  { id: 'puffs', name: 'Puffs' },
  { id: 'afro', name: 'Big Curls' },
  { id: 'bob', name: 'Bob' },
  { id: 'curly', name: 'Short Curls' },
  { id: 'short', name: 'Short' },
  { id: 'spiky', name: 'Spiky' },
  { id: 'pixie', name: 'Swoosh' }
];

// type: gown | dress | mermaid | tunic | coat | explorer | pajamas
const OUTFITS = [
  { id: 'rose', name: 'Rose Ball Gown', type: 'gown', main: '#f48fb1', top: '#ec5f95', trim: '#ffe0ec', sleeve: 'puff', pattern: 'sparkle' },
  { id: 'sun', name: 'Sunshine Gown', type: 'gown', main: '#ffd54f', top: '#ffb300', trim: '#fff8e1', sleeve: 'cap', pattern: 'sparkle', panel: '#fff3c4' },
  { id: 'frost', name: 'Frost Crystal Gown', type: 'gown', main: '#b3e5fc', top: '#4fc3f7', trim: '#ffffff', sleeve: 'long', pattern: 'snow' },
  { id: 'lavender', name: 'Lavender Dream', type: 'gown', main: '#ce93d8', top: '#9c4dcc', trim: '#f3e5f5', sleeve: 'puff', pattern: 'stars' },
  { id: 'forest', name: 'Forest Gown', type: 'gown', main: '#81c784', top: '#388e3c', trim: '#f1f8e9', sleeve: 'long', pattern: 'leaves', panel: '#c5e1a5' },
  { id: 'ruby', name: 'Ruby Gown', type: 'gown', main: '#e53950', top: '#b71c3c', trim: '#ffd54f', sleeve: 'cap', pattern: 'none', panel: '#ff8a9a' },
  { id: 'midnight', name: 'Midnight Star Gown', type: 'gown', main: '#283593', top: '#1a237e', trim: '#ffd54f', sleeve: 'long', pattern: 'stars' },
  { id: 'rainbow', name: 'Rainbow Gown', type: 'gown', main: '#ff8a80', top: '#ff80ab', trim: '#ffffff', sleeve: 'puff', pattern: 'rainbow' },
  { id: 'peach', name: 'Peach Blossom Gown', type: 'gown', main: '#ffccbc', top: '#ff8a65', trim: '#ffffff', sleeve: 'puff', pattern: 'dots', panel: '#ffe0d6' },
  { id: 'picnic', name: 'Picnic Dress', type: 'dress', main: '#ffe082', top: '#ffca28', trim: '#ffffff', sleeve: 'puff', pattern: 'dots', legs: '#ffffff' },
  { id: 'garden', name: 'Garden Party Dress', type: 'dress', main: '#a5d6a7', top: '#66bb6a', trim: '#fff59d', sleeve: 'short', pattern: 'flowers', legs: 'skin' },
  { id: 'party', name: 'Sparkle Party Dress', type: 'dress', main: '#b388ff', top: '#7c4dff', trim: '#e1f5fe', sleeve: 'none', pattern: 'sparkle', legs: '#e1bee7' },
  { id: 'ocean', name: 'Ocean Shimmer', type: 'mermaid', main: '#26c6da', top: '#7e57c2', trim: '#b2ebf2', sleeve: 'none', pattern: 'scales' },
  { id: 'sunset', name: 'Sunset Shimmer', type: 'mermaid', main: '#ff7043', top: '#ec407a', trim: '#ffe0b2', sleeve: 'none', pattern: 'scales' },
  { id: 'bluetunic', name: 'Blue Prince Tunic', type: 'tunic', main: '#1e88e5', top: '#1e88e5', trim: '#ffd54f', sleeve: 'long', pants: '#eceff1', pattern: 'none' },
  { id: 'archer', name: 'Green Archer Tunic', type: 'tunic', main: '#43a047', top: '#43a047', trim: '#8d6e63', sleeve: 'long', pants: '#6d4c41', pattern: 'none' },
  { id: 'knight', name: 'Red Knight Tunic', type: 'tunic', main: '#c62828', top: '#c62828', trim: '#cfd8dc', sleeve: 'long', pants: '#37474f', pattern: 'none' },
  { id: 'royalcoat', name: 'Royal Red Coat', type: 'coat', main: '#d32f2f', top: '#d32f2f', trim: '#ffd54f', sleeve: 'epaulette', pants: '#fafafa', pattern: 'none' },
  { id: 'nightcoat', name: 'Midnight Coat', type: 'coat', main: '#1a237e', top: '#1a237e', trim: '#e0e0e0', sleeve: 'epaulette', pants: '#90a4ae', pattern: 'none' },
  { id: 'goldcoat', name: 'Golden Coat', type: 'coat', main: '#fff3e0', top: '#fff3e0', trim: '#ffb300', sleeve: 'epaulette', pants: '#5d4037', pattern: 'none' },
  { id: 'explorer', name: 'Explorer Vest', type: 'explorer', main: '#8d6e63', top: '#fff8e1', trim: '#ffb74d', sleeve: 'short', pants: '#455a64', pattern: 'none' },
  { id: 'captain', name: 'Sea Captain', type: 'explorer', main: '#1565c0', top: '#ffffff', trim: '#ffd54f', sleeve: 'long', pants: '#ffffff', pattern: 'stripes' },
  { id: 'starball', name: 'Starlight Ball Gown', type: 'gown', main: '#e8f1ff', top: '#bcd4ff', trim: '#9ec5ff', sleeve: 'cap', pattern: 'sparkle', panel: '#ffffff' },
  { id: 'meadow', name: 'Meadow Gown', type: 'gown', main: '#fff59d', top: '#f48fb1', trim: '#ffffff', sleeve: 'puff', pattern: 'flowers' },
  { id: 'pjstars', name: 'Cozy Star Pajamas', type: 'pajamas', main: '#b39ddb', top: '#b39ddb', trim: '#fff59d', sleeve: 'long', pants: '#b39ddb', pattern: 'stars' },
  { id: 'pjhearts', name: 'Cozy Heart Pajamas', type: 'pajamas', main: '#f8bbd0', top: '#f8bbd0', trim: '#ffffff', sleeve: 'long', pants: '#f8bbd0', pattern: 'hearts' }
];

const HATS = [
  { id: 'none', name: 'Nothing' },
  { id: 'tiara', name: 'Sparkle Tiara' },
  { id: 'crown', name: 'Gold Crown' },
  { id: 'princecrown', name: 'Prince Crown' },
  { id: 'flowers', name: 'Flower Crown' },
  { id: 'snow', name: 'Snowflake Tiara' },
  { id: 'star', name: 'Star Headband' },
  { id: 'bow', name: 'Big Bow' },
  { id: 'cone', name: 'Fairy Hat' },
  { id: 'beret', name: 'Feather Cap' },
  { id: 'wizard', name: 'Wizard Hat' },
  { id: 'bunny', name: 'Bunny Ears' },
  { id: 'cat', name: 'Kitty Ears' },
  { id: 'shell', name: 'Seashell Clip' }
];

const SHOES = [
  { id: 'pink', name: 'Pink Slippers', kind: 'slipper', color: '#f06292', accent: '#fce4ec' },
  { id: 'crystal', name: 'Crystal Shoes', kind: 'crystal', color: '#b3e5fc', accent: '#ffffff' },
  { id: 'gold', name: 'Gold Shoes', kind: 'slipper', color: '#ffb300', accent: '#fff8e1' },
  { id: 'reddance', name: 'Red Dancing Shoes', kind: 'slipper', color: '#e53935', accent: '#ffcdd2' },
  { id: 'ballet', name: 'Ballet Slippers', kind: 'ballet', color: '#f8bbd0', accent: '#f48fb1' },
  { id: 'boots', name: 'Riding Boots', kind: 'boot', color: '#6d4c41', accent: '#ffd54f' },
  { id: 'blackboots', name: 'Knight Boots', kind: 'boot', color: '#263238', accent: '#b0bec5' },
  { id: 'snowboots', name: 'Fluffy Snow Boots', kind: 'fluffy', color: '#e3f2fd', accent: '#ffffff' },
  { id: 'buckle', name: 'Royal Buckle Shoes', kind: 'slipper', color: '#212121', accent: '#ffd54f' },
  { id: 'sneakers', name: 'Rainbow Sneakers', kind: 'sneaker', color: '#7c4dff', accent: '#ffffff' },
  { id: 'sandals', name: 'Beach Sandals', kind: 'sandal', color: '#26c6da', accent: '#ffffff' },
  { id: 'barefoot', name: 'Bare Feet', kind: 'bare', color: '#000', accent: '#000' }
];

const ITEMS = [
  { id: 'none', name: 'Nothing' },
  { id: 'wand', name: 'Star Wand' },
  { id: 'bouquet', name: 'Flowers' },
  { id: 'fan', name: 'Pretty Fan' },
  { id: 'mic', name: 'Microphone' },
  { id: 'ribbon', name: 'Dance Ribbon' },
  { id: 'balloon', name: 'Balloon' },
  { id: 'teddy', name: 'Teddy Bear' },
  { id: 'lantern', name: 'Lantern' },
  { id: 'parasol', name: 'Parasol' },
  { id: 'sword', name: 'Toy Sword' },
  { id: 'book', name: 'Story Book' },
  { id: 'cupcake', name: 'Cupcake' },
  { id: 'mirror', name: 'Hand Mirror' }
];

const CAPES = [
  { id: 'none', name: 'No Cape' },
  { id: 'royal', name: 'Royal Cape', color: '#c62828', trim: '#ffffff', ermine: true },
  { id: 'sky', name: 'Sky Cape', color: '#64b5f6', trim: '#e3f2fd' },
  { id: 'starry', name: 'Starry Cloak', color: '#311b92', trim: '#ffd54f', stars: true },
  { id: 'rosecape', name: 'Rose Cape', color: '#f48fb1', trim: '#fff' },
  { id: 'leaf', name: 'Leaf Cloak', color: '#2e7d32', trim: '#a5d6a7' },
  { id: 'rainbowcape', name: 'Rainbow Cape', color: '#ff8a80', trim: '#fff', rainbow: true },
  { id: 'snowcape', name: 'Snow Cape', color: '#e1f5fe', trim: '#81d4fa', stars: true },
  { id: 'goldcape', name: 'Golden Cape', color: '#ffb300', trim: '#fff8e1' }
];

const PETS = [
  { id: 'none', name: 'No Pet' },
  { id: 'kitty', name: 'Kitty' },
  { id: 'puppy', name: 'Puppy' },
  { id: 'bunny', name: 'Bunny' },
  { id: 'fox', name: 'Fox' },
  { id: 'unicorn', name: 'Unicorn' },
  { id: 'dragon', name: 'Baby Dragon' },
  { id: 'owl', name: 'Owl' },
  { id: 'penguin', name: 'Penguin' },
  { id: 'frog', name: 'Froggy' },
  { id: 'mouse', name: 'Little Mouse' }
];

const STAGES = [
  { id: 'ballroom', name: 'Ballroom' },
  { id: 'ice', name: 'Ice Palace' },
  { id: 'sea', name: 'Under the Sea' },
  { id: 'forest', name: 'Enchanted Forest' },
  { id: 'night', name: 'Starry Night' },
  { id: 'garden', name: 'Rainbow Garden' },
  { id: 'beach', name: 'Sunset Beach' }
];

const DANCES = [
  { id: 'twirl', name: 'Twirl', emoji: '🌀' },
  { id: 'hop', name: 'Happy Hop', emoji: '🐰' },
  { id: 'sway', name: 'Sway', emoji: '🌊' },
  { id: 'wave', name: 'Wave Hello', emoji: '👋' },
  { id: 'ballet', name: 'Ballerina', emoji: '🩰' },
  { id: 'jacks', name: 'Jumping Jacks', emoji: '⭐' },
  { id: 'disco', name: 'Disco Point', emoji: '🕺' },
  { id: 'curtsy', name: 'Curtsy & Bow', emoji: '🎀' },
  { id: 'wiggle', name: 'Wiggle', emoji: '🐛' },
  { id: 'robot', name: 'Robot', emoji: '🤖' },
  { id: 'clap', name: 'Clap Clap', emoji: '👏' },
  { id: 'chicken', name: 'Chicken Dance', emoji: '🐔' },
  { id: 'swim', name: 'Swim', emoji: '🐟' },
  { id: 'kick', name: 'High Kicks', emoji: '🦵' },
  { id: 'shimmy', name: 'Shimmy Spin', emoji: '✨' },
  { id: 'party', name: 'Mix It Up!', emoji: '🎉' }
];

// Each friend has a starting look. Every piece can be changed afterwards.
const FRIENDS = [
  // Friends inspired by old fairy tales (all original designs)
  { id: 'goldie', name: 'Princess Goldie', tale: 'The girl with the longest hair', skin: 0, hair: 'longbraid', hairColor: '#f2c75c', eyes: '#43a047', lashes: true,
    look: { outfit: 'meadow', hat: 'flowers', shoes: 'barefoot', item: 'lantern', cape: 'none', pet: 'frog' } },
  { id: 'astrid', name: 'Snow Queen Astrid', tale: 'The queen of ice and snow', skin: 0, hair: 'long', hairColor: '#f6ecd2', eyes: '#4fc3f7', lashes: true,
    look: { outfit: 'frost', hat: 'snow', shoes: 'crystal', item: 'wand', cape: 'snowcape', pet: 'penguin' } },
  { id: 'ella', name: 'Princess Ella', tale: 'The girl who lost a crystal shoe at the ball', skin: 1, hair: 'bun', hairColor: '#f2c75c', eyes: '#1e88e5', lashes: true,
    look: { outfit: 'starball', hat: 'tiara', shoes: 'crystal', item: 'none', cape: 'none', pet: 'mouse' } },
  { id: 'briar', name: 'Princess Briar', tale: 'The sleepy princess of the rose castle', skin: 0, hair: 'wavy', hairColor: '#d9a441', eyes: '#7e57c2', lashes: true,
    look: { outfit: 'rose', hat: 'crown', shoes: 'pink', item: 'bouquet', cape: 'rosecape', pet: 'owl' } },
  { id: 'marina', name: 'Princess Marina', tale: 'The mermaid who loved to sing', skin: 2, hair: 'wavy', hairColor: '#6cb6f0', eyes: '#00897b', lashes: true,
    look: { outfit: 'ocean', hat: 'shell', shoes: 'barefoot', item: 'mirror', cape: 'none', pet: 'penguin' } },
  { id: 'blanca', name: 'Princess Blanca', tale: 'The princess with seven tiny friends', skin: 0, hair: 'bob', hairColor: '#2b1d16', eyes: '#5d4037', lashes: true,
    look: { outfit: 'ruby', hat: 'bow', shoes: 'gold', item: 'bouquet', cape: 'none', pet: 'bunny' } },
  { id: 'bella', name: 'Princess Bella', tale: 'The book lover in the enchanted castle', skin: 2, hair: 'ponytail', hairColor: '#7a4a26', eyes: '#6d4c41', lashes: true,
    look: { outfit: 'garden', hat: 'none', shoes: 'boots', item: 'book', cape: 'none', pet: 'mouse' } },
  { id: 'finn', name: 'Prince Finn', tale: 'The prince who was once a frog', skin: 1, hair: 'curly', hairColor: '#7a4a26', eyes: '#43a047', lashes: false,
    look: { outfit: 'archer', hat: 'princecrown', shoes: 'boots', item: 'none', cape: 'leaf', pet: 'frog' } },
  { id: 'jack', name: 'Prince Jack', tale: 'The boy who climbed the giant beanstalk', skin: 3, hair: 'spiky', hairColor: '#4a2c1a', eyes: '#4e342e', lashes: false,
    look: { outfit: 'explorer', hat: 'beret', shoes: 'boots', item: 'lantern', cape: 'none', pet: 'puppy' } },
  { id: 'rosalind', name: 'Princess Rosalind', skin: 0, hair: 'wavy', hairColor: '#a2442a', eyes: '#3b7a57', lashes: true,
    look: { outfit: 'rose', hat: 'tiara', shoes: 'pink', item: 'bouquet', cape: 'none', pet: 'kitty' } },
  { id: 'amara', name: 'Princess Amara', skin: 4, hair: 'puffs', hairColor: '#2b1d16', eyes: '#5d3a1a', lashes: true,
    look: { outfit: 'sun', hat: 'crown', shoes: 'gold', item: 'wand', cape: 'none', pet: 'unicorn' } },
  { id: 'mei', name: 'Princess Mei', skin: 1, hair: 'long', hairColor: '#2b1d16', eyes: '#3e2723', lashes: true,
    look: { outfit: 'ruby', hat: 'flowers', shoes: 'reddance', item: 'fan', cape: 'none', pet: 'dragon' } },
  { id: 'isla', name: 'Princess Isla', skin: 0, hair: 'ponytail', hairColor: '#f2c75c', eyes: '#1e88e5', lashes: true,
    look: { outfit: 'ocean', hat: 'shell', shoes: 'sandals', item: 'mirror', cape: 'none', pet: 'penguin' } },
  { id: 'lumi', name: 'Princess Lumi', skin: 0, hair: 'bun', hairColor: '#d9d4ee', eyes: '#7e57c2', lashes: true,
    look: { outfit: 'lavender', hat: 'snow', shoes: 'crystal', item: 'wand', cape: 'snowcape', pet: 'owl' } },
  { id: 'zuri', name: 'Princess Zuri', skin: 5, hair: 'afro', hairColor: '#2b1d16', eyes: '#4e342e', lashes: true,
    look: { outfit: 'midnight', hat: 'star', shoes: 'gold', item: 'ribbon', cape: 'none', pet: 'fox' } },
  { id: 'priya', name: 'Princess Priya', skin: 3, hair: 'braids', hairColor: '#2b1d16', eyes: '#4e342e', lashes: true,
    look: { outfit: 'peach', hat: 'tiara', shoes: 'ballet', item: 'lantern', cape: 'none', pet: 'bunny' } },
  { id: 'willow', name: 'Princess Willow', skin: 1, hair: 'wavy', hairColor: '#7a4a26', eyes: '#558b2f', lashes: true,
    look: { outfit: 'forest', hat: 'flowers', shoes: 'boots', item: 'book', cape: 'leaf', pet: 'fox' } },
  { id: 'coco', name: 'Princess Coco', skin: 2, hair: 'bob', hairColor: '#f59ac0', eyes: '#6d4c41', lashes: true,
    look: { outfit: 'party', hat: 'bow', shoes: 'sneakers', item: 'cupcake', cape: 'none', pet: 'puppy' } },
  { id: 'felix', name: 'Prince Felix', skin: 0, hair: 'short', hairColor: '#f2c75c', eyes: '#1e88e5', lashes: false,
    look: { outfit: 'bluetunic', hat: 'princecrown', shoes: 'buckle', item: 'sword', cape: 'royal', pet: 'puppy' } },
  { id: 'kai', name: 'Prince Kai', skin: 2, hair: 'spiky', hairColor: '#2b1d16', eyes: '#4e342e', lashes: false,
    look: { outfit: 'captain', hat: 'none', shoes: 'boots', item: 'lantern', cape: 'none', pet: 'penguin' } },
  { id: 'theo', name: 'Prince Theo', skin: 5, hair: 'curly', hairColor: '#2b1d16', eyes: '#4e342e', lashes: false,
    look: { outfit: 'royalcoat', hat: 'crown', shoes: 'blackboots', item: 'none', cape: 'goldcape', pet: 'dragon' } },
  { id: 'rafael', name: 'Prince Rafael', skin: 2, hair: 'pixie', hairColor: '#4a2c1a', eyes: '#5d4037', lashes: false,
    look: { outfit: 'archer', hat: 'beret', shoes: 'boots', item: 'none', cape: 'leaf', pet: 'owl' } },
  { id: 'arjun', name: 'Prince Arjun', skin: 3, hair: 'short', hairColor: '#2b1d16', eyes: '#3e2723', lashes: false,
    look: { outfit: 'goldcoat', hat: 'princecrown', shoes: 'buckle', item: 'mic', cape: 'none', pet: 'unicorn' } },
  { id: 'leo', name: 'Prince Leo', skin: 1, hair: 'spiky', hairColor: '#d9692b', eyes: '#2e7d32', lashes: false,
    look: { outfit: 'explorer', hat: 'none', shoes: 'sneakers', item: 'balloon', cape: 'none', pet: 'kitty' } },
  { id: 'nico', name: 'Prince Nico', skin: 4, hair: 'pixie', hairColor: '#2b1d16', eyes: '#4e342e', lashes: false,
    look: { outfit: 'nightcoat', hat: 'wizard', shoes: 'blackboots', item: 'wand', cape: 'starry', pet: 'owl' } }
];

// Original tunes, generated by the game itself (no recordings).
const TRACKS = [
  { id: 'waltz', name: 'Castle Waltz', emoji: '🏰', bpm: 156, meter: 3, key: 67, scale: 'major', prog: [0, 3, 4, 0, 5, 1, 4, 0], seed: 11,
    rhythm: [0, 2, 4], lead: { wave: 'triangle', gain: 0.2, decay: 0.6 }, bass: { wave: 'sine', steps: [0] }, chords: { wave: 'triangle', steps: [2, 4], gain: 0.05 },
    drums: { k: [0], h: [2, 4] } },
  { id: 'pop', name: 'Sparkle Pop', emoji: '✨', bpm: 118, meter: 4, key: 64, scale: 'major', prog: [0, 4, 5, 3], seed: 21,
    rhythm: [0, 2, 3, 4, 6], lead: { wave: 'square', gain: 0.08, decay: 0.3, filter: 2400 }, bass: { wave: 'triangle', steps: [0, 3, 4] }, chords: { wave: 'triangle', steps: [2, 6], gain: 0.04 },
    drums: { k: [0, 4], s: [2, 6], h: [0, 1, 2, 3, 4, 5, 6, 7] } },
  { id: 'disco', name: 'Rainbow Disco', emoji: '🪩', bpm: 124, meter: 4, key: 62, scale: 'minor', prog: [0, 5, 2, 6], seed: 33,
    rhythm: [0, 1, 3, 4, 6], lead: { wave: 'sawtooth', gain: 0.07, decay: 0.25, filter: 1800 }, bass: { wave: 'sawtooth', steps: [0, 1, 2, 3, 4, 5, 6, 7], octaves: true, filter: 700 },
    arp: true, drums: { k: [0, 2, 4, 6], c: [2, 6], h: [1, 3, 5, 7] } },
  { id: 'lullaby', name: 'Moonlight Lullaby', emoji: '🌙', bpm: 80, meter: 4, key: 72, scale: 'major', prog: [0, 5, 3, 4], seed: 44,
    rhythm: [0, 2, 4, 6], lead: { wave: 'sine', gain: 0.22, decay: 1.2, bell: true }, bass: { wave: 'sine', steps: [0] }, chords: { wave: 'sine', steps: [0], gain: 0.05, pad: true },
    drums: {} },
  { id: 'dragon', name: 'Dragon Dance', emoji: '🐉', bpm: 128, meter: 4, key: 57, scale: 'minor', prog: [0, 0, 5, 4], seed: 55,
    rhythm: [0, 2, 3, 5, 6], lead: { wave: 'square', gain: 0.08, decay: 0.25, filter: 2000 }, bass: { wave: 'triangle', steps: [0, 3, 6] }, chords: { wave: 'triangle', steps: [4], gain: 0.04 },
    drums: { k: [0, 3, 6], t: [2, 5, 7], h: [0, 2, 4, 6] } },
  { id: 'island', name: 'Island Breeze', emoji: '🏝️', bpm: 108, meter: 4, key: 65, scale: 'major', prog: [0, 3, 4, 0], seed: 66,
    rhythm: [0, 1, 3, 4, 5, 7], lead: { wave: 'sine', gain: 0.22, decay: 0.35, bell: true }, bass: { wave: 'sine', steps: [0, 3, 4, 7] }, chords: { wave: 'triangle', steps: [1, 3, 5, 7], gain: 0.035 },
    drums: { k: [0, 4], sh: [0, 1, 2, 3, 4, 5, 6, 7], s: [3, 6] } },
  { id: 'snowflake', name: 'Snowflake Ballet', emoji: '❄️', bpm: 96, meter: 4, key: 69, scale: 'minor', prog: [0, 3, 6, 2, 5, 3, 4, 4], seed: 77,
    rhythm: [0, 2, 3, 4, 6], lead: { wave: 'sine', gain: 0.2, decay: 0.8, bell: true }, bass: { wave: 'sine', steps: [0, 4] },
    arp: true, drums: { h: [2, 6] } },
  { id: 'march', name: 'Royal March', emoji: '🎺', bpm: 112, meter: 4, key: 60, scale: 'major', prog: [0, 4, 0, 4, 3, 0, 4, 0], seed: 88,
    rhythm: [0, 2, 3, 4, 6], lead: { wave: 'sawtooth', gain: 0.08, decay: 0.35, filter: 1500 }, bass: { wave: 'triangle', steps: [0, 2, 4, 6] }, chords: { wave: 'triangle', steps: [1, 3, 5, 7], gain: 0.03 },
    drums: { k: [0, 4], s: [2, 6, 7], h: [] } },
  { id: 'bubble', name: 'Bubble Hop', emoji: '🫧', bpm: 132, meter: 4, key: 67, scale: 'penta', prog: [0, 3, 0, 4], seed: 99,
    rhythm: [0, 1, 2, 4, 6, 7], lead: { wave: 'triangle', gain: 0.18, decay: 0.2 }, bass: { wave: 'sine', steps: [0, 2, 4, 6] },
    drums: { k: [0, 4], c: [2, 6], h: [1, 3, 5, 7] } },
  { id: 'starlight', name: 'Starlight Slow Dance', emoji: '⭐', bpm: 84, meter: 4, key: 65, scale: 'major', prog: [0, 2, 3, 4], seed: 101,
    rhythm: [0, 3, 4, 6], lead: { wave: 'triangle', gain: 0.18, decay: 0.9 }, bass: { wave: 'sine', steps: [0, 4] }, chords: { wave: 'sine', steps: [0], gain: 0.05, pad: true },
    drums: { k: [0], s: [4], h: [2, 6] } },
  { id: 'jig', name: 'Fairy Jig', emoji: '🧚', bpm: 150, meter: 3, key: 62, scale: 'major', prog: [0, 0, 4, 4, 0, 3, 4, 0], seed: 112,
    rhythm: [0, 1, 2, 3, 4, 5], lead: { wave: 'square', gain: 0.07, decay: 0.15, filter: 3000 }, bass: { wave: 'triangle', steps: [0, 3] },
    drums: { k: [0], h: [2, 4], sh: [1, 3, 5] } },
  { id: 'robotfunk', name: 'Robot Boogie', emoji: '🤖', bpm: 116, meter: 4, key: 60, scale: 'minor', prog: [0, 0, 3, 4], seed: 123,
    rhythm: [0, 3, 4, 6, 7], lead: { wave: 'square', gain: 0.07, decay: 0.12, filter: 2200 }, bass: { wave: 'square', steps: [0, 3, 5, 6], filter: 500 },
    drums: { k: [0, 3, 4], c: [2, 6], h: [0, 1, 2, 3, 4, 5, 6, 7] } }
];
