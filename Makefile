.PHONY: dev build start lint test test-ui test-headed screenshots install clean

dev:
	bun run dev

build:
	bun run build

start:
	bun run start

lint:
	bun run lint

test:
	bun run test

test-ui:
	bun run test:ui

test-headed:
	bun run test:headed

screenshots:
	bun run screenshots

install:
	bun install

clean:
	rm -rf .next node_modules
