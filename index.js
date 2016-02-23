var assert = require('assert')
var bitcoin = require('bitcoin')
var debug = require('debug')('burn-stream-writer')

// Workaround for https://github.com/bitpay/bitcore-lib/issues/21
global._bitcore = undefined
var Script = require('bitcore-lib').Script
var Transaction = require('bitcore-lib').Transaction
global._bitcore = undefined

// This should be higher than the dust amount.
var MIN_AMOUNT = 10000

function Writer (clientConfig, appConfig) {
  if (!(this instanceof Writer)) return new Writer(clientConfig, appConfig)

  this.client = new bitcoin.Client(clientConfig)
  this.appConfig = appConfig

  debug('new writer', clientConfig, appConfig)
}

Writer.prototype.getUtxos = function (cb) {
  this.client.listUnspent(cb)
}

Writer.prototype.createTx = function (opts, cb) {
  var self = this

  debug('# of utxos', opts.utxos.length)

  var messageBuffer = Buffer(self.appConfig.opReturnPrefix + opts.message, 'hex')
  assert(messageBuffer.length <= 80)

  var opReturnScript = Script.buildDataOut(messageBuffer)
  debug('script', opReturnScript)

  var output = new Transaction.Output({
    satoshis: 0,
    script: opReturnScript
  })

  var amount = opts.amount === 'min' ? MIN_AMOUNT : opts.amount

  var transaction = new Transaction()
    .from(opts.utxos)
    .to(self.appConfig.burnAddress, amount)
    .addOutput(output)

  if (opts.fee) {
    transaction.fee(opts.fee)
  }

  self.client.getRawChangeAddress(function (err, changeAddress) {
    assert.ifError(err)

    if (opts.changeAddress) {
      changeAddress = opts.changeAddress
    }

    debug('change address', changeAddress)
    transaction.change(changeAddress)

    debug('fee', transaction.getFee())
    debug('tx unsigned', transaction)

    self.client.signRawTransaction(transaction.toBuffer().toString('hex'), function (err, signed) {
      assert.ifError(err)
      cb(null, signed)
    })
  })
}

Writer.prototype.send = function (signed, cb) {
  this.client.sendRawTransaction(signed, cb)
}

module.exports = Writer
