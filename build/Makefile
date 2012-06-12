
CLOSURE=java -jar tools/closure/compiler.jar
YUICOMP=java -jar tools/yuicompressor/yuicompressor-2.4.7.jar

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

all: ../html/sactraffic-min.js ../html/sactraffic-min.css

../html/sactraffic-min.js: $(JSFILES)
	$(CLOSURE) --js $^ --js_output_file $@

../html/sactraffic-min.css: $(CSSFILES)
	cat $^ > tmp.css && $(YUICOMP) -o $@ tmp.css && rm -f tmp.css
