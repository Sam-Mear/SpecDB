const m = require('mithril');

module.exports = {
  oncreate: () =>
    require('./seo').innerUpdate({
      title: 'SpecDB — API: specdb-query',
      description: 'Documentation for the SpecDB Query service (api.specdb.info): JSON and Protobuf endpoints, quickstart, and configuration.',
    }),
  view: () => m('#about-wrapper', [
    m('h1', 'SpecDB Query (api.specdb.info)'),
    m('p', 'SpecDB Query exposes a searchable database of CPU, GPU, and APU specifications. It provides both JSON and Protobuf endpoints for fast programmatic access.'),

    m('h2', 'JSON Endpoints'),
    m('ul', [
      m('li', m('code', 'GET /v1/search/{query}'), ' — Search specs (JSON).'),
      m('li', m('code', 'GET /v1/spec/{name}'), ' — Full spec for a named component (JSON).'),
    ]),

    m('h2', 'Protobuf Endpoints'),
    m('ul', [
      m('li', m('code', 'GET /v1/protobuf/search/{query}'), ' — Protobuf search response.'),
      m('li', m('code', 'GET /v1/protobuf/search_full_specs/{query}'), ' — Full specs in Protobuf.'),
      m('li', m('code', 'GET /v1/protobuf/cpu/{query}'), ' — CPU Protobuf resource.'),
      m('li', m('code', 'GET /v1/protobuf/graphics_card/{query}'), ' — Graphics card Protobuf resource.'),
      m('li', m('code', 'GET /v1/protobuf/apu/{query}'), ' — APU Protobuf resource.'),
    ]),

    m('h2', 'Extras (local use)'),
    m('p', 'The service also supports transient "extras" endpoints for importing/exporting per-spec additional data. These are disabled on the public API and intended for local use only.'),

    m('h2', 'Quickstart — Build & Run (Rust)'),
    m('p', 'Prerequisites: Rust toolchain. The server reads a `config.yaml` from the OS project config directory.'),
    m('pre', 'cargo build\ncargo run --release'),
    m('p', 'Example search:'),
    m('pre', 'curl "http://localhost:8082/v1/search/ryzen"'),

    m('h2', 'Configuration'),
    m('p', '`config.yaml` must contain at least `spec_db_path`. Optional: `allow_extras: true` to enable extras endpoints.'),

    m('h2', 'Protobufs'),
    m('p', 'Protobuf definitions are included with the project. Use `protoc` to generate bindings for your language; client requests should set `Accept: application/x-protobuf` when using Protobuf endpoints.'),

    m('p', [ m('a[href=https://api.specdb.info]','Visit api.specdb.info'), ' — public service (read-only).' ]),
    m('p', [ m('a[href=https://github.com/Sam-Mear/specdb-query]','GitHub repository'), ' — source code and documentation.' ]),

    m('a[href=/]', {oncreate: m.route.link}, 'Back to SpecDB Home'),
  ]),
}
