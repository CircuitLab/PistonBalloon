var gpio = require('gpio')
  , fs = require('fs')
  , EventEmitter = require('events').EventEmitter;

module.exports = PistonBalloon;

var defaultPins = {
    stateSwitch: 17
  , motor: 4
}

function PistonBalloon(pins) {
  this.pins = pins || defaultPins;
  this.counter = 0;
  this.fps = 1000;

  EventEmitter.call(this);

  var self = this
  if (!fs.statSync('/sys/class/gpio').isDirectory()) {
    gpio = {
        export: function(pin, func) { console.log("export " + pin); }
    }

    setInterval(function(){
      if (--self.counter > 0) {
      } else {
        self.counter = 0;
      }
      self.emit('tick');
    }, ~~(1000 / this.fps));

    
  } else {
    this.motor = gpio.export(this.pins['motor'], {
        direction: 'out'
      , ready: function() {
          setInterval(function(){
            if (--self.counter > 0) {
              self.motor.set(1);
            } else {
              self.motor.set(0);
              self.counter = 0;
            }
            self.emit('tick');
            console.log('tick : ' + self.counter);
          }, !!(1000 / self.fps));
      }
    });
    this.stateSwitch = gpio.export(this.pins['stateSwitch'], {
        direction: 'in'
      , ready: function() {
        self.stateSwitch.on('change', function(val) {
          val = +val;
          console.log(val);
          if (val == 1) {
            self.emit('turnOn');
          } else {
            self.emit('turnOff');
          }
        });
      }
    });
  }
}

PistonBalloon.prototype.__proto__ = EventEmitter.prototype;

PistonBalloon.prototype.motorOn = function() {
  this.motor.set(1);
};

PistonBalloon.prototype.motorOff = function() {
  this.motor.set(0);
};

PistonBalloon.prototype.getCounter = function() {
  return this.counter;
};

PistonBalloon.prototype.setCounter = function(count) {
  this.counter = count;
  return this.counter;
};
