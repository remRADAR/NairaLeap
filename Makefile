.PHONY: portal-typecheck portal-build portal-lint wordpress-test wordpress-dry-run

portal-typecheck:
	bunx tsc --noEmit

portal-build:
	bun run build

portal-lint:
	bun run lint

wordpress-test:
	python3 -m unittest discover -s wordpress/tests -v

wordpress-dry-run:
	python3 wordpress/importer.py wordpress/fixtures/sample-blogsy-export.xml --output wordpress/output
