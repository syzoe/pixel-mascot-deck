#!/bin/zsh
# Render a .pptx through Keynote (PingFang/CJK safe) to PDF + page JPGs + 6-up contact sheets.
#   keynote_qa.sh deck.pptx [outdir=qa]
# LibreOffice drops CJK text on macOS and PowerPoint may be absent, so Keynote is the QA renderer.
set -e
deck="${1:?usage: keynote_qa.sh deck.pptx [outdir]}"
out="${2:-qa}"
mkdir -p "$out"
abs_deck="$(cd "$(dirname "$deck")" && pwd)/$(basename "$deck")"
abs_out="$(cd "$out" && pwd)"
cp "$abs_deck" "$abs_out/_render.pptx"      # Keynote chokes on some long CJK file names
open -ga Keynote && sleep 5                    # AppleScript fails with -600 if Keynote isn't running
osascript <<OSA
tell application "Keynote"
  set d to open POSIX file "$abs_out/_render.pptx"
  delay 3
  export d to POSIX file "$abs_out/render.pdf" as PDF
  close d saving no
end tell
OSA
find "$abs_out" -name 'p-*.jpg' -delete
pdftoppm -jpeg -r 110 "$abs_out/render.pdf" "$abs_out/p"
python3 - "$abs_out" <<'PY' || echo "(contact sheets skipped: needs python3 + Pillow)"
import sys, glob
from PIL import Image
d = sys.argv[1]
fs = sorted(glob.glob(f"{d}/p-*.jpg"))
ims = [Image.open(f) for f in fs]
w, h = ims[0].size
for g in range(0, len(ims), 6):
    sheet = Image.new("RGB", (w * 2 + 10, h * 3 + 20), "white")
    for k, im in enumerate(ims[g:g + 6]):
        sheet.paste(im, ((k % 2) * (w + 10), (k // 2) * (h + 10)))
    sheet.save(f"{d}/sheet{g // 6 + 1}.jpg", quality=85)
print(f"{len(fs)} pages -> {d}/sheet*.jpg")
PY
echo "PDF: $abs_out/render.pdf"
