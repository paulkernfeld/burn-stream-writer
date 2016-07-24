Burn-stream-writer lets you write to a [burn-stream](https://github.com/paulkernfeld/burn-stream).

[![Build Status](https://travis-ci.org/paulkernfeld/burn-stream-writer.svg)](https://travis-ci.org/paulkernfeld/burn-stream-writer) [![npm](https://img.shields.io/npm/dt/burn-stream-writer.svg)](https://www.npmjs.com/package/burn-stream-writer)

Burn-stream-writer writes to a burn-stream by connecting to a Bitcoin client over [RPC](https://en.bitcoin.it/wiki/API_reference_(JSON-RPC)).

Usage
-----
1. Set up a Bitcoin client with RPC enabled.
2. Get a burn-stream JSON app config file (see [burn-stream](https://github.com/paulkernfeld/burn-stream) for more info).
3. Make a JSON file that matches the configuration of your Bitcoin client. Take care not to accidentally share the password for your Bitcoin client! An example:

```
{
    "host": "localhost",
    "port": "18332",
    "user": "user",
    "pass": "real secure"
}
```

To write from the command line, run `bin/write.js`. It will ask for confirmation before writing. An example command:

```
node bin/write.js --amount 100000 --message sup
```

About the args:

* `--clientConfig` defaults to `client-config.json`
* `--appConfig` defaults to `app-config.json`
* You can set `--fee` to specify a fee
* You can set `--changeAddress` to specify a change address
* You can set `--amount min` to send the minimum allowed amount

To write from Javascript code, you can require burn-stream-writer (see `bin/write.js` for an example).