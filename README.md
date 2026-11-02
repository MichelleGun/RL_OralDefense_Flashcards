# RL Defense Deck

Interactive oral defense prep for 42028 / 43008 Reinforcement Learning (UTS), built from RL Weekly Notes Weeks 1 to 11.

- `index.html`: the whole deck in one file. Open it in a browser, or publish it with GitHub Pages. Needs internet only for fonts and MathJax.
- `source/`: the content files (`glossary.txt`, `cards*.txt`, `deriv.txt`, `mcq.txt`, `weak.txt`), the page code (`head.html`, `body.html`, `app.js`) and `build.sh` to rebuild `index.html` after editing content.

Progress (Know it, Review again, MCQ answers) is saved in each visitor's own browser. On the Account tab anyone can create a username and password, with no email and no Claude sign-in, and their progress then follows them to any device.

## Accounts (Supabase)
- Backend: Supabase project `rl-defense-deck` in Michelle's Playground, Sydney region, free plan. Details in `source/supabase.sql`.
- The key inside the page is the public "publishable" key. It is safe to ship, because the tables are closed and only the account functions can be called.
- Free Supabase projects pause after about a week with no activity. If logins stop working, open the Supabase dashboard and press Restore on the project.
- There is no password reset. A forgotten password means a new account.

## Publish on GitHub Pages
1. Create a repo on GitHub, for example `rl-defense-deck`.
2. Upload `index.html` to the repo root.
3. Settings, Pages, Source: Deploy from a branch, branch `main`, folder `/ (root)`.
4. The site appears at `https://<your-username>.github.io/rl-defense-deck/`.

Before sharing publicly, consider deleting the `@weak` entries in `source/weak.txt` (they quote personal quiz feedback) and rebuilding.

## Diagrams
All diagrams are inline SVG in `source/diagrams.js`, so the page needs no image files. To attach one to a card, derivation or MCQ, add a line `I: name` (for example `I: cliff`) anywhere in that block of the content file, then run `build.sh` again.
