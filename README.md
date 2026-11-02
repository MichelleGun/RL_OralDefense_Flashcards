# RL Oral Defense Flashcards

Interactive oral defense prep for 42028 / 43008 Reinforcement Learning (UTS), built from RL Weekly Notes Weeks 1 to 11.

- `index.html`: the whole deck in one file. Open it in a browser, or publish it with GitHub Pages. Needs internet only for fonts and MathJax.
- `source/`: the content files (`glossary.txt`, `cards*.txt`, `deriv.txt`, `mcq.txt`, `weak.txt`), the page code (`head.html`, `body.html`, `app.js`) and `build.sh` to rebuild `index.html` after editing content.

Progress (Know it, Review again, MCQ answers) is saved in each visitor's own browser.

## Publish on GitHub Pages
1. In `MichelleGun/RL_OralDefense_Flashcards`, open Settings, then Pages.
2. Under Build and deployment, choose Deploy from a branch.
3. Select branch `main` and folder `/ (root)`.
4. The site appears at `https://michellegun.github.io/RL_OralDefense_Flashcards/`.

Before sharing publicly, consider deleting the `@weak` entries in `source/weak.txt` (they quote personal quiz feedback) and rebuilding.
