### NodeJS2019
##### Concatenate files
```bash
for f in *.js; do (cat "${f}"; echo) >> ../dist/xxx.js; done
```
