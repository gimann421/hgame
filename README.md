# Royal Dance Party

A dress-up and dance game made for iPad (works in any browser). It's for family use only.

- **25 friends** (princesses and princes) with different skin tones and hairstyles. Nine are inspired by old fairy tales: the girl with the longest hair, the snow queen, the girl with the crystal shoe, the sleepy rose princess, the mermaid, the princess with seven tiny friends, the book lover, the frog prince, and the boy with the beanstalk.
- **Rename anyone:** tap the name at the top (✏️) to give a friend a new name.
- **26 outfits** (ball gowns, dresses, shimmer gowns, tunics, royal coats, explorer gear, pajamas), plus 13 hairstyles in 12 colors, 14 hats and crowns, 12 pairs of shoes, 14 things to hold, 9 capes and 11 pets
- **The Dance! button works at any time.** You don't need a matching outfit first.
- **16 dances**, including "Mix It Up!", which switches moves every few bars. The spins turn all the way around, so you see the back of her head halfway through.
- **12 songs**, all made up by the game's own synthesizer, so there are no recordings or licensed music
- **7 places to dance**, a 🎲 surprise outfit button, and sparkles wherever you tap

All of the characters, art and music are original. None of them come from any film or app.

## Playing on an iPad

The game is a website: https://gimann421.github.io/hgame/ (served by GitHub Pages from this repo).

1. Open that link in **Safari**.
2. Tap **Share** (the square with the arrow) → **Add to Home Screen** → **Add**.
3. Open it from the new princess icon. It runs full screen with no Safari bars, and after the first visit it works without internet.

Changes pushed to the Pages branch show up the next time the game is opened while online.

If you don't hear any music, check that the iPad isn't muted and that the volume is turned up.

## Files

- `index.html`, `style.css`: the page layout and the dance moves (CSS animations)
- `js/data.js`: the lists of friends, clothes, dances, songs and places. Add more here.
- `js/draw.js`: draws the characters, pets and backgrounds as SVG
- `js/music.js`: a small Web Audio synthesizer that plays the songs
- `js/app.js`: how the game works
- `manifest.webmanifest`, `sw.js`: make it installable and playable offline
- `icon.png`, `icon-192.png`, `icon-512.png`, `icon-1024.png`: the home-screen icon (`node make-icon.js icon-1024.png` redraws it)

There's no build step. These are plain files.
