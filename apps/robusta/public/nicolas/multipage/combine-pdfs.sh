#!/usr/bin/env bash
# Concatenate PDFs into one.
#
# Usage:
#   ./combine-pdfs.sh                                          # uses defaults below
#   ./combine-pdfs.sh out.pdf in1.pdf in2.pdf [in3.pdf ...]
#   ./combine-pdfs.sh --first-only [out.pdf] [in1.pdf ...]     # keep page 1 only
#   ./combine-pdfs.sh -1 ...                                   # short form of --first-only
#   ./combine-pdfs.sh --fr [...]                               # work in ./fr/ subdir
#
# Defaults: page-1.pdf + page-2.pdf + page-3.pdf  ->  NicolasZozolResume.pdf
#
# --first-only / -1: trim each input to its first page before merging.
#                    Useful when the browser print produced a stray blank
#                    second page from minor content overflow.
# --fr             : run inside ./fr/ — reads page-X.pdf from fr/ and writes
#                    the output there too. Combinable with --first-only.
#
# Requires either:
#   - pdfunite + pdfseparate (brew install poppler)   <- preferred, lossless
#   - gs                     (brew install ghostscript) <- fallback, re-encodes

set -euo pipefail

cd "$(dirname "$0")"

TRIM_FIRST=0
USE_FR=0
ARGS=()
for arg in "$@"; do
  case "$arg" in
    -1|--first-only) TRIM_FIRST=1 ;;
    --fr) USE_FR=1 ;;
    *) ARGS+=("$arg") ;;
  esac
done

if [ "$USE_FR" = "1" ]; then
  if [ ! -d "fr" ]; then
    echo "Missing ./fr directory" >&2
    exit 1
  fi
  cd fr
fi

if [ ${#ARGS[@]} -eq 0 ]; then
  OUT="NicolasZozolResume.pdf"
  INPUTS=(page-1.pdf page-2.pdf page-3.pdf)
else
  OUT="${ARGS[0]}"
  INPUTS=("${ARGS[@]:1}")
fi

for f in "${INPUTS[@]}"; do
  if [ ! -f "$f" ]; then
    echo "Missing input: $f (cwd: $(pwd))" >&2
    exit 1
  fi
done

# Optionally trim each input to its first page only.
if [ "$TRIM_FIRST" = "1" ]; then
  TMPDIR=$(mktemp -d)
  trap 'rm -rf "$TMPDIR"' EXIT
  TRIMMED=()
  i=0
  for src in "${INPUTS[@]}"; do
    if command -v pdfseparate >/dev/null 2>&1; then
      pdfseparate -f 1 -l 1 "$src" "$TMPDIR/p${i}_%d.pdf"
      TRIMMED+=("$TMPDIR/p${i}_1.pdf")
    elif command -v gs >/dev/null 2>&1; then
      out="$TMPDIR/p${i}.pdf"
      gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite \
         -dFirstPage=1 -dLastPage=1 \
         -sOutputFile="$out" "$src"
      TRIMMED+=("$out")
    else
      echo "Need pdfseparate (poppler) or gs to trim pages" >&2
      exit 1
    fi
    i=$((i + 1))
  done
  INPUTS=("${TRIMMED[@]}")
fi

# Merge.
if command -v pdfunite >/dev/null 2>&1; then
  pdfunite "${INPUTS[@]}" "$OUT"
  echo "[pdfunite] wrote $(pwd)/$OUT"
elif command -v gs >/dev/null 2>&1; then
  gs -dBATCH -dNOPAUSE -q -sDEVICE=pdfwrite -sOutputFile="$OUT" "${INPUTS[@]}"
  echo "[gs] wrote $(pwd)/$OUT"
else
  cat >&2 <<EOF
Need either pdfunite or gs.
  brew install poppler      # for pdfunite (recommended)
  brew install ghostscript  # for gs (fallback)
EOF
  exit 1
fi
