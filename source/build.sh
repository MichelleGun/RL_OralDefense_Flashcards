#!/usr/bin/env bash
# Rebuilds index.html from the content files. Run from this source folder.
set -e
cat glossary.txt cards1.txt cards2.txt cards3.txt cards4.txt cards5.txt deriv.txt mcq.txt weak.txt > data.txt
{ echo '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"></head><body>'
  cat head.html body.html
  echo '<script type="text/plain" id="src">'; cat data.txt; echo '</script>'
  echo '<script>'; cat diagrams.js coursemap.js; echo '</script>'
  echo '<script>'; cat app.js; echo '</script>'
  echo '<script src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/3.2.2/es5/tex-svg.min.js" async></script>'
  echo '</body></html>'; } > ../index.html
rm data.txt
echo "Built ../index.html"
