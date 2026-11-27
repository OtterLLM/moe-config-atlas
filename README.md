# MoE Config Atlas

**English** | [简体中文](README.zh-CN.md)

Sparsity and shape statistics for open-weight MoE LLMs released since 2025. Site: <https://otterllm.github.io/moe-config-atlas/>

For each model, the expert count E, top-k, number of shared experts, hidden size, expert width, layer count and attention layout are parsed directly from its `config.json` on Hugging Face. From these we derive routing sparsity E/k, expert activation ratio, parameter activation ratio and expert granularity G, and aggregate by vendor and by three size tiers (small / medium / large). Each row is one architecture: versions that differ only in post-training, context length, MTP layers or weight format are merged into one row, and the model name shows the newest of them; any difference in attention, MoE, layers and dimensions, modality or vocabulary makes a separate row.

The site has four parts:

- **Sparsity**: E/k, expert activation ratio, parameter activation ratio, expert granularity.
- **Shape and attention**: width-to-depth ratio d/L, attention width ratio (query heads × per-head QK dim / d_model), Q/KV, RoPE dimension share, share of global-attention layers, long-context KV cache per token, max context.
- **Structural features**: 33 items in five groups. Attention (linear / sliding-window / sparse attention, MLA, output gate, sink, QK-norm, K=V, cross-layer KV, index reuse, QKV short convolution), positional encoding (partial RoPE, NoPE, length-scaling SSMax), residual and normalization (hyper-connections HC / mHC / iHC, AttnRes, residual gate, GatedNorm, post-norm, parallel blocks), MoE and FFN (shared expert and its gate, LatentMoE, zero-compute experts, routing score function, expert bias, group routing, hash routing, FFN activation, activation clamp), output and memory (MTP, softcap, N-gram memory). There are three views: a per-model structural fingerprint matrix (groupable by tier, sorted within each tier, with a summary row per tier; or aggregated by vendor), a side-by-side comparison of up to 4 models (the selection is stored in the URL), and adoption rate by quarter.
- **Leaderboard ranking**: the fingerprint, per-layer structure, full table and side-by-side comparison can all be ranked by scores from two public leaderboards: Epoch AI's Capabilities Index ECI (a single number fitted from dozens of benchmarks) and the Arena text leaderboard (arena.ai, formerly LMArena), or by their normalized average (each leaderboard converted to standard scores, then averaged; the site maximum is 100). Scores are read at build time; when one architecture has several versions, the highest score is used and the version is noted. The matching rules are in `scripts/bench.py`; names that do not match go in `bench.yaml`, and after a build you can run `python scripts/bench.py` to see which name each config matched. Both leaderboards are CC BY 4.0 and need no key. Artificial Analysis's terms do not allow publishing its scores as tables or data files, so it is not included.
- **Frontier technique tracker**: the architecture and training changes since 2024 listed in `techniques.yaml`, each with its earliest source, the effect measured by independent experiments (mainly Pavlichenko 2026's 1,129 ablations and Marin's training logs) and its adoption among the listed models.

## Updating

- **Data refresh**: `pages.yml` re-fetches all `config.json` files and both leaderboards every Monday and on every push to `main`, commits `site/data/` if anything changed, and redeploys. If a leaderboard cannot be read that day, the previous scores are kept.
- **Discovering new models**: `discover.yml` scans the vendor organizations listed in `discover.yaml` every Monday. A repo with the same architecture as an existing entry is first added to that entry's `derived` (for a new mainline version, change that entry's `repo` and model name in the PR); a new architecture is added to `models.yaml` as a new entry; then a PR is opened. Merging means including it; entries you do not want can simply be deleted in the PR (`discover_state.json` remembers them so they are not proposed again).

## Adding a model manually

Add an entry to `models.yaml`:

```yaml
- vendor: Qwen
  name: Qwen3-30B-A3B-2507          # newest mainline version of this architecture; the site shows this name
  repo: Qwen/Qwen3-30B-A3B-Instruct-2507   # the repo whose config.json is parsed
  variants: [Qwen/Qwen3-30B-A3B, Qwen/Qwen3-30B-A3B-Thinking-2507]   # optional: other mainline versions with the same architecture
  derived: [Qwen/Qwen3-Coder-30B-A3B-Instruct]   # optional: specialized models built on it, or copies in another precision or format
  released: 2025-04                 # year-month this architecture was first uploaded
  total: 30.5                       # total params (B), from the model card
  active: 3.3                       # active params (B)
  override: {E: 128}                # optional: fill in by hand when config.json cannot be read
  notes: optional footnote
```

`build.py` reads the `config.json` of every repo in `variants` and `derived`, and reports an error if the architecture (`hfconfig.arch_signature`: all parsed fields except context length, RoPE base and extrapolation, and MTP layer count) differs from `repo`'s; it also reports an error if a version in `variants` was uploaded more than a month after `repo`, or if two entries from the same vendor have the same architecture.

The parser is in `scripts/hfconfig.py`; when a new field spelling turns up, just add an alias in `ALIASES`. Structural features that the config does not state and that only show up in modeling code (for example Qwen3's QK-norm or gpt-oss's attention sink) are recorded in `ARCH` by `model_type`; when a new architecture ships, add a row after checking transformers or the `modeling_*.py` in the repo.

When a repo requires requesting access and Actions cannot read its `config.json`, you can save the config as `configs/<org>__<repo>.json` (for example taken from the defaults of the matching `*Config` in transformers, or from a public copy) and state the source in `_source`; for one taken from a copy, also give the copy's repo name in `_mirror`, and the MTP layer count is read from the copy's weight index. The build prefers the files here, and the page's details note the source.

## Tracking a new technique

Add an entry to `techniques.yaml`; the fields are described at the top of the file. If it can be recognized from the config, write `feature` (and optionally `match`) and the adoption count is computed automatically; for things the config cannot show (optimizers, loss functions), list the adopting models and source links one by one under `models`. `build.py` checks the category, date format, sources and model names.

## Translations

The site defaults to English, with a language switch on the page (or append `?lang=zh` to the URL to get Chinese directly). Values in the data files (`site/data/*.json`) stay in Chinese, because `details.yaml` matches on them; the English view translates them at display time through `site/i18n/en.json`, where `strings` is an exact-match table and `patterns` holds regexes for values with numbers in them (such as `7（2 层）`).

- When you add Chinese notes, text in `details.yaml` / `techniques.yaml`, or new feature values produced by `hfconfig.py` / `build.py`, add their English to `site/i18n/en.json`.
- Run `python scripts/i18n_check.py` to list the strings that still lack English (`--strict` exits non-zero if any are missing; `--unused` lists entries nothing uses any more). The PR build check runs it too, as information only; it does not block.

## Running locally

```bash
pip install -r requirements.txt
python scripts/build.py          # generates models.json, models.csv and techniques.json under site/data/
python -m http.server -d site    # open http://localhost:8000
```

To read repos that require requesting access, set the `HF_TOKEN` environment variable (also configure a secret of the same name under the repo's Settings → Secrets, which Actions will use).
