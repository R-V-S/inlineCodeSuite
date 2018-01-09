// black hole
const document = new Proxy(() => {}, { get: () => document, apply: () => document })