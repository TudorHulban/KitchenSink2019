# create folder if it does not exist
mkdir -p dist
find ./dist/ -type f -name *.js  -exec rm {} \;
for f in src/*.js; do (cat "${f}"; echo) >> dist/xxx.js; 
node dist/xxx.js
done

# class files before main.js