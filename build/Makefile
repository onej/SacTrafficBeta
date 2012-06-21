
DATE=`date +%s1`
CLOSURE=java -jar tools/closure/compiler.jar
YUICOMP=java -jar tools/yuicompressor/yuicompressor-2.4.7.jar
JSDOC=java -jar tools/jsdoc-toolkit/jsrun.jar tools/jsdoc-toolkit/app/run.js -a -p -t=tools/jsdoc-toolkit/templates/jsdoc

JSFILES= \
	../html/scripts/array.js \
	../html/scripts/date.js \
	../html/scripts/string.js \
	../html/scripts/incident.js \
	../html/scripts/incidentlist.js \
	../html/scripts/trafficmap.js \
	../html/scripts/main.js

CSSFILES= \
	../html/styles/button.css \
	../html/styles/main.css

all: ../html/sactraffic-min.js ../html/sactraffic-min.css ../html/index.html .do-jsdocs

../html/sactraffic-min.js: $(JSFILES)
	$(CLOSURE) --js $^ --js_output_file $@

../html/sactraffic-min.css: $(CSSFILES)
	cat $^ > tmp.css && $(YUICOMP) -o $@ tmp.css && rm -f tmp.css

../html/index.html: ../html/dev/index.html $(JSFILES) $(CSSFILES)
	perl -00 -e 's/<!--\s*dev\s*.*?<!--\s*live\s*(.*?)\s*-->/$$1/gs' -p < $< > $@ && perl -e 's/v=####/v='$(DATE)'/g' -p -i $@

.do-jsdocs: $(JSFILES)
	$(JSDOC) -d=../html/jsdoc ../html/scripts
	touch .do-jsdocs
