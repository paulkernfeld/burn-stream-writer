var fs = require('fs')
var assert = require('assert')
var prompt = require('prompt')
var argv = require('minimist')(process.argv.slice(2))
var Writer = require('..')

// Deep copy
var opts = JSON.parse(JSON.stringify(argv))

// Load configuration from files
var appConfig = JSON.parse(fs.readFileSync(argv.appConfig || 'app-config.json'))
var clientConfig = JSON.parse(fs.readFileSync(argv.clientConfig || 'client-config.json'))
prompt.start()

// Convert the message for binary reading
var message = Buffer(opts.message.toString(), 'utf8')
opts.message = message.toString('hex')

// Print info about the options
console.log('amount', opts.amount)
console.log('message hex', message.toString('hex'))
console.log('message ascii', message.toString('ascii'))
console.log('message utf8', message.toString('utf8'))

console.log('burn address', appConfig.burnAddress)
console.log('OP_RETURN prefix hex', appConfig.opReturnPrefix)

// Write
var writer = Writer(clientConfig, appConfig)

writer.getUtxos(function (err, utxos) {
  assert.ifError(err)

  opts.utxos = utxos
  writer.createTx(opts, function (err, tx) {
    assert.ifError(err)

    console.log('send tx? y/n')
    prompt.get(['write'], function (err, result) {
      assert.ifError(err)

      if (result.write === 'y') {
        writer.send(tx.hex, function (err) {
          assert.ifError(err)
          console.log('write submitted successfully')
        })
      } else {
        console.log('not sending')
      }
    })
  })
})
