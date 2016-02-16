var assert = require('assert')
var bitcoin = require('bitcoin')
var debug = require('debug')('burn-stream-writer')
var Script = require('bitcore-lib').Script
var Transaction = require('bitcore-lib').Transaction

function Writer (clientConfig, appConfig) {
  if (!(this instanceof Writer)) return new Writer(clientConfig, appConfig)

  this.client = new bitcoin.Client(clientConfig)
  this.appConfig = appConfig

  debug('new writer', clientConfig, appConfig)
}

Writer.prototype.make = function (opts, cb) {
  var self = this

  self.client.listUnspent(function (err, utxos) {
    assert.ifError(err)
    debug('# of utxos', utxos.length)

    var messageBuffer = Buffer(self.appConfig.opReturnPrefix + opts.message, 'hex')
    assert(messageBuffer.length <= 80)

    var opReturnScript = Script.buildDataOut(messageBuffer)
    debug('script', opReturnScript)

    var output = new Transaction.Output({
      satoshis: 0,
      script: opReturnScript
    })

    var transaction = new Transaction()
      .from(utxos)
      .to(self.appConfig.burnAddress, opts.amount)
      .addOutput(output)

    if (opts.fee) {
      transaction.fee(opts.fee)
    }

    self.client.getRawChangeAddress(function (err, changeAddress) {
      assert.ifError(err)
      transaction.change(changeAddress)

      debug('change address', changeAddress)

      debug('fee', transaction.getFee())
      debug('tx unsigned', transaction)

      self.client.signRawTransaction(transaction.toBuffer().toString('hex'), function (err, signed) {
        assert.ifError(err)
        cb(null, signed)
      })
    })
  })
}

Writer.prototype.send = function (signed, cb) {
  this.client.sendRawTransaction(signed, cb)
}

module.exports = Writer
