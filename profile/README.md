# Profile visuals

The introduction and technology map describe the profile owner's working focus and toolkit. They do not assign proficiency scores.

`data.json` is a dated public-data snapshot of the nine application repositories listed in `refresh.py`. The two charts show:

- Source bytes by extension under `src/`, `server/`, and `public/`. Generated `public/locales/` files are excluded. For TypeScript projects, generated preferences and validation JavaScript are excluded too. This is a file-size measure, not GitHub Linguist output or a skill score.
- Repository commits per UTC day over the 14 days ending on the snapshot date. These are all repository commits, not personal contributions, streaks, or hours worked.

Regenerate the SVGs without network access:

```sh
python3 profile/render.py
```

Fetch a new snapshot and render it (Python standard library only):

```sh
python3 profile/refresh.py
```

`GITHUB_TOKEN` is optional for public API access. A complete snapshot is fetched before replacing the data file. Alternatively, run the **Refresh profile visuals** workflow manually in Actions. It publishes only the snapshot and SVGs. No profile-view trackers or third-party statistics image services are used.
