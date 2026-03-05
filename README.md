# inflight-stable

A maintained version of the `inflight` module.

## Installation

```bash
npm install inflight-stable
```

## Usage

```javascript
var inflight = require('inflight-stable')

function fetchData(key, callback) {
  var makeRequest = inflight(key, callback)
  
  if (makeRequest) {
    // First call - make the actual request
    doAsyncOperation(function(err, data) {
      makeRequest(err, data)
    })
  }
  // Subsequent calls return null and queue the callback
}
```

## What it does

Ensures multiple calls with the same key will queue up and all receive the same result, rather than executing the same operation multiple times.

## API

**`inflight(key, callback)`**

Returns a callback function on first call, `null` on subsequent calls. Call the returned function to trigger all queued callbacks.

## Migration

```javascript
// Before
var inflight = require('inflight')

// After
var inflight = require('inflight-stable')
```

## Why?
isaacs deprecated `inflight` because of an apparent memory leak, though it's only really a memory leak if the user never calls the callback, so there's no bug in the code. He suggests using `lru-cache`, but that module isn't as backwards-compatible. So this is a maintained version of `inflight` that isn't completely deprecated.

## License

MIT