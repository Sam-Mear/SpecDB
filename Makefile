PATH       := ./node_modules/.bin:${PATH}
# to dl, this followed by output file followed by url
curl       := curl --retry 5 --retry-delay 5 --connect-timeout 30 -fo
node       := node ${NODE_OPTS}

tests      := ./tests/*.js

css_output := ./public/all.css
css_input  := ${wildcard ./src/css/*.css}

js_output  := ./public/bundle.js
js_input   := ${shell find src/js -name '*.js' -type f}
js_entry   := ./src/js/entry.js
js_noparse := mithril

n_sentinel := ./.npm-make-sentinel

# pathnames should be relative to where?
sw_root    := ./public
# where to output, relative to sw_root
sw_basename:= ./sw.js
sw_output  := ${sw_root}/${sw_basename}
# files to cache
# m_input is make-friendly glob, s_input excludes _redirects too	
sw_m_input := ./public/**
sw_s_input := ./public/**/!(_redirects)

# ./ so `browserify` understands it
spec_output:= ./tmp/specs.js

# custom/authoritative specs
athr_output:= ./tmp/authoritative-parse.json
athr_input := ${shell find specs -name '*.yaml' -type f}
athr_folder:= ./specs

map_output := ./public/sitemap.txt

intc_procs := ./tmp/intel-scrape.json
intc_codes := ./tmp/intel-scrape-codenames.json
intc_scrape:= ${intc_procs} ${intc_codes}
intc_parse := ./tmp/intel-parse.json

ubch_cpus  := ./tmp/userbenchmark-scrape-cpus.csv
ubch_gpus  := ./tmp/userbenchmark-scrape-gpus.csv
ubch_scrape:= ${ubch_cpus} ${ubch_gpus}
ubch_parse := ./tmp/userbenchmark-parse.json

3dmk_cpus  := ./tmp/3dmark-scrape-cpus.html
3dmk_gpus  := ./tmp/3dmark-scrape-gpus.html
3dmk_scrape:= ${3dmk_cpus} ${3dmk_gpus}
3dmk_parse := ./tmp/3dmark-parse.json

gbch_scrape:= ./tmp/geekbench-scrape.html
gbch_parse := ./tmp/geekbench-parse.json

prod       := false

development: ${n_sentinel} ${dev_guard} ${css_output} ${js_output}
production: prod := true
production: ${n_sentinel} ${prod_guard} ${css_output} \
	${js_output} ${sw_output} ${map_output}
test:
	tape ${tests} | tap-summary
watch:
	find specs src build | entr ${MAKE}

${css_output} : ${css_input}
	cat ${css_input} > ${css_output}
	if ${prod}; then csso ${css_output} -o ${css_output}; fi

${js_output} : ${js_input} ${spec_output}
	browserify -r ${spec_output}:spec-data \
		--noparse ${js_noparse} --debug ${js_entry} \
		> ${js_output}
	if ${prod}; then babel ${js_output} | \
		uglifyjs -cmo ${js_output}; fi

${sw_output} : ${sw_m_input}
	sw-precache --root=${sw_root} --sw-file=sw.js \
		--static-file-globs='${sw_s_input}'
	uglifyjs -cmo ${sw_output} \
		${sw_output} 2>/dev/null

${spec_output} ${map_output} : ${athr_output} ${intc_parse} ${ubch_parse} ${3dmk_parse} \
	${gbch_parse} build/combine-specs.js build/combine-util.js build/util.js
	${node} build/combine-specs.js ${spec_output} ${map_output} \
		${athr_output} ${ubch_parse} ${3dmk_parse} ${gbch_parse} ${intc_parse}

${athr_output} : ${athr_input} build/gen-specs.js
	${node} build/gen-specs.js ${athr_folder} ${athr_output}

${intc_scrape} :
	${curl} ${intc_procs} 'https://odata.intel.com/API/v1_0/Products/Processors()?$$format=json'
	${curl} ${intc_codes} 'https://odata.intel.com/API/v1_0/Products/CodeNames()?$$format=json'

${intc_parse} : build/intel-parse.js build/intel-config.js ${intc_scrape}
	${node} build/intel-parse.js ${intc_scrape} ${intc_parse}

${ubch_scrape} :
	${curl} ${ubch_cpus} 'http://www.userbenchmark.com/resources/download/csv/CPU_UserBenchmarks.csv'
	${curl} ${ubch_gpus} 'http://www.userbenchmark.com/resources/download/csv/GPU_UserBenchmarks.csv'

${ubch_parse} : ${ubch_scrape} build/userbenchmark-parse.js
	${node} build/userbenchmark-parse.js ${ubch_scrape} ${ubch_parse}

${3dmk_scrape} :
	${curl} ${3dmk_cpus} 'https://benchmarks.ul.com/compare/best-cpus'
	${curl} ${3dmk_gpus} 'https://benchmarks.ul.com/compare/best-gpus'

${3dmk_parse} : ${3dmk_scrape} build/3dmark-parse.js
	${node} build/3dmark-parse.js ${3dmk_scrape} ${3dmk_parse}

${gbch_scrape} :
	${curl} ${gbch_scrape} 'https://browser.geekbench.com/processor-benchmarks'

# MAYBE: an implicit rule for -parse.json
${gbch_parse} : ${gbch_scrape} build/geekbench-parse.js
	${node} build/geekbench-parse.js ${gbch_scrape} ${gbch_parse}

${n_sentinel} : package.json
	npm install
	touch ${n_sentinel}

# clean everything
clean:
	${MAKE} clean-nonet
	rm -f ${n_sentinel} ${intc_scrape} ${3dmk_scrape} ${ubch_scrape} ${gbch_scrape}

# only clean things that can be regenerated without a network connection
clean-nonet:
	rm -f ${css_output} ${js_output} ${sw_output} \
		${spec_output} ${map_output} ${intc_parse} \
		${ubch_parse} ${3dmk_parse} ${gbch_parse} \
		${athr_output}

.PHONY: development production test clean clean-nonet watch
