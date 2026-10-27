# Interactive profile site

`docs/` contains a complete static portfolio. It uses relative asset paths and works at a domain root or a GitHub Pages project subpath. No backend, dependencies, build step, remote fonts, analytics, or external image services are needed.

For a local preview:

```sh
python3 -m http.server 8080 --directory docs
```

Open http://localhost:8080. The site includes English, Spanish, and Russian; browser language detection; light/dark/system themes; project filters; focus tabs; and a visual Rust ownership explorer. Preferences persist locally. Rust examples are illustrations, not a browser compiler.

To host with GitHub Pages, configure this repository’s Pages source to **Deploy from a branch → main → /docs**. Hosting is not enabled by the source commit itself. No third-party deployment account is required. A custom domain can be added separately when available.

`experiments/motion-playground/` is the independent tenth application. Its own README explains how to serve its `public/` directory at a domain root.

Technology logos come from [Devicon](https://github.com/devicons/devicon); the license is retained in `assets/DEVICON-LICENSE` and `docs/assets/DEVICON-LICENSE`. The visual reference was the organization of [d9911’s profile](https://github.com/d9911), not its biography or contact details.
