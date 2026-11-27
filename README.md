# Royal Dance Party

A dress-up and dance game made for iPad (works in any browser). It's for family use only.

- **16 friends** (princesses and princes) with different skin tones and hairstyles
- **24 outfits** (ball gowns, dresses, shimmer gowns, tunics, royal coats, explorer gear, pajamas), plus 12 hairstyles in 12 colors, 14 hats and crowns, 12 pairs of shoes, 14 things to hold, 9 capes and 9 pets
- **The Dance! button works at any time.** You don't need a matching outfit first.
- **16 dances**, including "Mix It Up!", which switches moves every few bars
- **12 songs**, all made up by the game's own synthesizer, so there are no recordings or licensed music
- **7 places to dance**, a 🎲 surprise outfit button, and sparkles wherever you tap

All of the characters, art and music are original. None of them come from any film or app.

## Playing on an iPad

Open `index.html` in Safari. To make it work like an app, tap **Share → Add to Home Screen**. It then opens full screen with its own icon.

If you don't hear any music, check that the iPad isn't muted and that the volume is turned up.

## Files

- `index.html`, `style.css`: the page layout and the dance moves (CSS animations)
- `js/data.js`: the lists of friends, clothes, dances, songs and places. Add more here.
- `js/draw.js`: draws the characters, pets and backgrounds as SVG
- `js/music.js`: a small Web Audio synthesizer that plays the songs
- `js/app.js`: how the game works

There's no build step. These are plain files.
