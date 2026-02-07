var assert = require('assert')
var inf = require('./inflight.js')

function req (key, cb) {
  cb = inf(key, cb)
  if (cb) setTimeout(function () {
    cb(key)
    cb(key)
  })
  return cb
}

describe('inflight', function() {
  it('basic', function (done) {
    var calleda = false
    var a = req('key', function (k) {
      assert.ok(!calleda)
      calleda = true
      assert.equal(k, 'key')
      if (calledb) done()
    })
    assert.ok(a, 'first returned cb function')

    var calledb = false
    var b = req('key', function (k) {
      assert.ok(!calledb)
      calledb = true
      assert.equal(k, 'key')
      if (calleda) done()
    })

    assert.ok(!b, 'second should get falsey inflight response')
  })

  it('timing', function (done) {
    var expect = [
      'method one',
      'start one',
      'end one',
      'two',
      'tick',
      'three'
    ]
    var i = 0

    function log (m) {
      assert.equal(m, expect[i], m + ' === ' + expect[i])
      ++i
      if (i === expect.length)
        done()
    }

    function method (name, cb) {
      log('method ' + name)
      process.nextTick(cb)
    }

    var one = inf('foo', function () {
      log('start one')
      var three = inf('foo', function () {
        log('three')
      })
      if (three) method('three', three)
      log('end one')
    })

    method('one', one)

    var two = inf('foo', function () {
      log('two')
    })
    if (two) method('one', two)

    process.nextTick(log.bind(null, 'tick'))
  })

  it('parameters', function (done) {
    var count = 0
    
    var a = inf('key', function (first, second, third) {
      assert.equal(first, 1)
      assert.equal(second, 2)
      assert.equal(third, 3)
      if (++count === 2) done()
    })
    assert.ok(a, 'first returned cb function')

    var b = inf('key', function (first, second, third) {
      assert.equal(first, 1)
      assert.equal(second, 2)
      assert.equal(third, 3)
      if (++count === 2) done()
    })
    assert.ok(!b, 'second should get falsey inflight response')

    setTimeout(function () {
      a(1, 2, 3)
    })
  })

  it('throw (a)', function (done) {
    var calleda = false
    var a = inf('throw', function () {
      assert.ok(!calleda)
      calleda = true
      throw new Error('throw from a')
    })
    assert.ok(a, 'first returned cb function')

    var calledb = false
    var b = inf('throw', function () {
      assert.ok(!calledb)
      calledb = true
    })
    assert.ok(!b, 'second should get falsey inflight response')

    setTimeout(function () {
      assert.throws(function() { a() }, /throw from a/)
      assert.ok(calleda)
      assert.ok(!calledb)
      var calledc = false
      var c = inf('throw', function () {
        calledc = true
      })
      assert.ok(c, 'third returned cb function because it cleaned up')
      c()
      assert.ok(calledc)
      done()
    })
  })

  it('throw (b)', function (done) {
    var calleda = false
    var a = inf('throw', function () {
      assert.ok(!calleda)
      calleda = true
    })
    assert.ok(a, 'first returned cb function')

    var calledb = false
    var b = inf('throw', function () {
      assert.ok(!calledb)
      calledb = true
      throw new Error('throw from b')
    })
    assert.ok(!b, 'second should get falsey inflight response')

    setTimeout(function () {
      assert.throws(function() { a() }, /throw from b/)
      assert.ok(calleda)
      assert.ok(calledb)
      var calledc = false
      var c = inf('throw', function () {
        calledc = true
      })
      assert.ok(c, 'third returned cb function because it cleaned up')
      c()
      assert.ok(calledc)
      done()
    })
  })

  it('throw (zalgo)', function (done) {
    var calleda = false
    var calledZalgo = false
    var a = inf('throw', function () {
      assert.ok(!calleda)
      calleda = true

      var zalgo = inf('throw', function () {
        assert.ok(!calledZalgo)
        calledZalgo = true
      })
      assert.ok(!zalgo, 'zalgo should get falsey inflight response')
      throw new Error('throw from a')
    })
    assert.ok(a, 'first returned cb function')

    var calledb = false
    var b = inf('throw', function () {
      assert.ok(!calledb)
      calledb = true
    })
    assert.ok(!b, 'second should get falsey inflight response')

    setTimeout(function () {
      assert.throws(function() { a() }, /throw from a/)
      assert.ok(calleda)
      assert.ok(!calledb)
      assert.ok(!calledZalgo)
      process.nextTick(function () {
        assert.ok(calledZalgo)
        var calledc = false
        var c = inf('throw', function () {
          calledc = true
        })
        assert.ok(c, 'third returned cb function because it cleaned up')
        c()
        assert.ok(calledc)
        done()
      })
    })
  })
})