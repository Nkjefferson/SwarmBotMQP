// Part of the code below is based on the Adafruit SI1145 library (https://github.com/adafruit/Adafruit_SI1145_Library)
// This is a small library for getting data from sensors on the BBB
// Declare this file as an object and create an instance from it.
// Invoke the getData() function from the instance, which will take in a callback function and return a data packet in JSON format.
// Nam Tran
var b = require('bonescript');
var async = require('async');
var i2c = require('i2c-bus'),
i2c2 = i2c.openSync('2'),
i2c1;

var tempDataC, tempDataF, humidData;

var BUFFER_LENGTH = 6,
SHT31_ADDR = 0x44,
SHT31_MEAS = 0x2C,
SHT31_READ = 0x00;

// Commands
var SI1145_PARAM_SET = 0xA0,
SI1145_PSALS_AUTO = 0x0F;

// Parameters
var SI1145_PARAM_I2CADDR = 0x00,
SI1145_PARAM_CHLIST = 0x01,
SI1145_PARAM_CHLIST_ENUV = 0x80,
SI1145_PARAM_CHLIST_ENALSIR = 0x20,
SI1145_PARAM_CHLIST_ENALSVIS = 0x10,
SI1145_PARAM_CHLIST_ENPS1 = 0x01,
SI1145_PARAM_PSLED12SEL = 0x02,
SI1145_PARAM_PSLED12SEL_PS1LED1 = 0x01,
SI1145_PARAM_PS1ADCMUX = 0x07,
SI1145_PARAM_PSADCOUNTER = 0x0A,
SI1145_PARAM_PSADCGAIN = 0x0B,
SI1145_PARAM_PSADCMISC = 0x0C,
SI1145_PARAM_PSADCMISC_RANGE = 0x20,
SI1145_PARAM_PSADCMISC_PSMODE = 0x04,
SI1145_PARAM_ALSIRADCMUX = 0x0E,
SI1145_PARAM_ALSVISADCOUNTER = 0x10,
SI1145_PARAM_ALSVISADCGAIN = 0x11,
SI1145_PARAM_ALSVISADCMISC = 0x12,
SI1145_PARAM_ALSVISADCMISC_VISRANGE = 0x20,
SI1145_PARAM_ALSIRADCOUNTER = 0x1D,
SI1145_PARAM_ALSIRADCGAIN = 0x1E,
SI1145_PARAM_ALSIRADCMISC = 0x1F,
SI1145_PARAM_ALSIRADCMISC_RANGE = 0x20,
SI1145_PARAM_ADCCOUNTER_511CLK = 0x70,
SI1145_PARAM_ADCMUX_SMALLIR = 0x00,
SI1145_PARAM_ADCMUX_LARGEIR = 0x03;

// Registers
var SI1145_REG_PARTID = 0x00,
SI1145_REG_INTCFG = 0x03,
SI1145_REG_INTCFG_INTOE = 0x01,
SI1145_REG_IRQEN = 0x04,
SI1145_REG_IRQEN_ALSEVERYSAMPLE = 0x01,
SI1145_REG_MEASRATE0 = 0x08,
SI1145_REG_PSLED21 = 0x0F,
SI1145_REG_UCOEFF0 = 0x13,
SI1145_REG_UCOEFF1 = 0x14,
SI1145_REG_UCOEFF2 = 0x15,
SI1145_REG_UCOEFF3 = 0x16,
SI1145_REG_PARAMWR = 0x17,
SI1145_REG_COMMAND = 0x18,
SI1145_REG_UVINDEX0 = 0x2C,
SI1145_REG_VISIR = 0x22;
SI1145_REG_IR = 0x24;
SI1145_REG_PROX = 0x26;
SI1145_REG_PARAMRD = 0x2E,
SI1145_ADDR = 0x60;


function writeParam(p, v) {
  var BUFFER_SIZE = 2;
  const buffer = new Buffer(BUFFER_SIZE);
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_PARAMWR, v]));
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_COMMAND, p | SI1145_PARAM_SET]));
  i2c2.readI2cBlockSync(SI1145_ADDR, SI1145_REG_PARAMRD, BUFFER_SIZE, buffer);
}

function begin() {
  var BUFFER_SIZE = 2;
  const buffer = new Buffer(BUFFER_SIZE);

  i2c2.readI2cBlockSync(SI1145_ADDR, SI1145_REG_PARTID, BUFFER_SIZE, buffer);
  if (buffer[0] != 0x45) {
    return false; // look for SI1145
  }

  // enable UVindex measurement coefficients!
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_UCOEFF0, 0x29]));
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_UCOEFF1, 0x89]));
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_UCOEFF2, 0x02]));
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_UCOEFF3, 0x00]));
  
  // enable UV sensor
  writeParam(SI1145_PARAM_CHLIST, SI1145_PARAM_CHLIST_ENUV |
    SI1145_PARAM_CHLIST_ENALSIR | SI1145_PARAM_CHLIST_ENALSVIS |
    SI1145_PARAM_CHLIST_ENPS1);

  // enable interrupt on every sample
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_INTCFG, SI1145_REG_INTCFG_INTOE]));
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_IRQEN, SI1145_REG_IRQEN_ALSEVERYSAMPLE]));

  // program LED current
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_PSLED21, 0x03])); // 20mA for LED 1 only
  writeParam(SI1145_PARAM_PS1ADCMUX, SI1145_PARAM_ADCMUX_LARGEIR);
  // prox sensor #1 uses LED #1
  writeParam(SI1145_PARAM_PSLED12SEL, SI1145_PARAM_PSLED12SEL_PS1LED1);
  // fastest clocks, clock div 1
  writeParam(SI1145_PARAM_PSADCGAIN, 0);
  // take 511 clocks to measure
  writeParam(SI1145_PARAM_PSADCOUNTER, SI1145_PARAM_ADCCOUNTER_511CLK);
  // in prox mode, high range
  writeParam(SI1145_PARAM_PSADCMISC, SI1145_PARAM_PSADCMISC_RANGE|
    SI1145_PARAM_PSADCMISC_PSMODE);

  writeParam(SI1145_PARAM_ALSIRADCMUX, SI1145_PARAM_ADCMUX_SMALLIR);  
  // fastest clocks, clock div 1
  writeParam(SI1145_PARAM_ALSIRADCGAIN, 0);
  // take 511 clocks to measure
  writeParam(SI1145_PARAM_ALSIRADCOUNTER, SI1145_PARAM_ADCCOUNTER_511CLK);
  // in high range mode
  writeParam(SI1145_PARAM_ALSIRADCMISC, SI1145_PARAM_ALSIRADCMISC_RANGE);

  // fastest clocks, clock div 1
  writeParam(SI1145_PARAM_ALSVISADCGAIN, 0);
  // take 511 clocks to measure
  writeParam(SI1145_PARAM_ALSVISADCOUNTER, SI1145_PARAM_ADCCOUNTER_511CLK);
  // in high range mode (not normal signal)
  writeParam(SI1145_PARAM_ALSVISADCMISC, SI1145_PARAM_ALSVISADCMISC_VISRANGE);

  // measurement rate for auto
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_MEASRATE0, 0xFF])); // 255 * 31.25uS = 8ms
  
  // auto run
  i2c2.i2cWriteSync(SI1145_ADDR, 2, new Buffer([SI1145_REG_COMMAND, SI1145_PSALS_AUTO]));

  return true;
}

function readUV() {
  var BUFFER_SIZE = 2;
  const buffer = new Buffer(BUFFER_SIZE);
  i2c2.readI2cBlockSync(SI1145_ADDR, SI1145_REG_UVINDEX0, BUFFER_SIZE, buffer);
  return buffer[0];;
}

function readIR() {
  var BUFFER_SIZE = 2;
  const buffer = new Buffer(BUFFER_SIZE);
  i2c2.readI2cBlockSync(SI1145_ADDR, SI1145_REG_IR, BUFFER_SIZE, buffer);
  return buffer[0];;
}

function readVis() {
  var BUFFER_SIZE = 2;
  const buffer = new Buffer(BUFFER_SIZE);
  i2c2.readI2cBlockSync(SI1145_ADDR, SI1145_REG_VISIR, BUFFER_SIZE, buffer);
  return buffer[0];;
}

function readProx() {
  var BUFFER_SIZE = 2;
  const buffer = new Buffer(BUFFER_SIZE);
  i2c2.readI2cBlockSync(SI1145_ADDR, SI1145_REG_PROX, BUFFER_SIZE, buffer);
  return buffer[0];;
}

module.exports = function () {
  var self = this; 
  self.getData = function(callback) {
    async.series([
      function (cb) {
        b.analogRead('P9_39', function(rawData){
          cb(null, rawData.value);
        })
      },
      function (cb) {
        cb(null, readUV()/100.0);
      },
      function (cb) {
        cb(null, readIR());
      },
      function (cb) {
        cb(null, readVis());
      },
      function (cb) {
        cb(null, readProx());
      },
      function (cb) {
        i2c1 = i2c.open(1, cb);
      },
      function (cb) {
        i2c1.writeByte(SHT31_ADDR, 0x2C, 0x06, cb);
      },
      function (cb) {
        i2c1.readI2cBlock(SHT31_ADDR, 0x00, 6, new Buffer(6), function(err, bytesRead, buffer) {
          if (err) throw err;
           var temp = buffer[0] * 256 + buffer[1];
           var tempDataC = -45 + (175 * temp / 65535.0); // in Celsius
           var tempDataF = -49 + (315 * temp / 65535.0); // in Fareinheit
           var humidData = 100 * (buffer[3] * 256 + buffer[4]) / 65535.0
           cb(null, tempDataC, tempDataF, humidData);
         })
      },
      function (cb) {
        i2c1.close(cb);
      }
      ], function (err, results) {
        if (err) throw err;
          // Filter out the results.
          results = results.filter(function(n) { return n!= undefined});
          callback({
            "id": 1,
            "temp": results[5][1],
            "tempC": results[5][0], 
            "humidity": results[5][2],
            "uv": results[1],
            "ir": results[2],
            "visibility": results[3],
            "proximity": results[4],
            "airQuality": results[0],
          });
        });
  } 
}
