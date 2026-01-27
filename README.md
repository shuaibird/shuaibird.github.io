# shuaibird

a universe by shuaibird — thinking, making, moving

🌐 https://shuaibird.github.io/

## What this site is

This is a personal homepage, not a product landing page. It is a long-term space for ideas, tech notes, life reflections, and projects. It is a lightweight shell that links out to more complex demos when needed.

It is not about ads, growth hacks, or a content treadmill.

## Tech stack

Astro (HTML-first static site generator), GitHub Pages (hosting), and GitHub Actions (build & deploy). ESLint, Prettier, Stylelint, and Husky with lint-staged. The focus is simplicity and maintainability.

## Branch strategy

`main` is the source code (Astro project, configs, workflows). `gh-pages` is the generated static output. `gh-pages` is fully automated and should not be edited manually.

## Local development

```sh
npm install
npm run dev
```

Local URL: `http://localhost:4321`

## Build & deploy

Automatic via GitHub Actions on push to `main`. Built with Astro, output published to `gh-pages`, served by GitHub Pages.

## Philosophy

Avoid unnecessary complexity. No heavy frontend framework by default. No backend unless a project truly needs it. Interactive demos are deployed separately and linked or embedded here. Guiding principle: “clarity over cleverness”.

## License

Personal project. Content and code are not intended for reuse unless explicitly stated.
