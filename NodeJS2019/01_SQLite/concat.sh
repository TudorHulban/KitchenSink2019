# create folder if it does not exist
mkdir -p dist
rm dist/xxx.js
for f in src/*.js; do (cat "${f}"; echo) >> dist/xxx.js; 
node dist/xxx.js
done

# class files before main.js