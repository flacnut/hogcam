var fs    = require('fs');
var cpp   = require('child-process-promise');
var gpio  = require('rpi-gpio');
var shell = require('shelljs');

var STORAGE_DESTINATION = '/mnt/nas',
    TEMP_STORAGE_DESTINATION = './temp_vid/',
    DURATION = 10 * 60 * 1000,
    BITRATE = 2 * 1000 * 1000,
    DATE_SETTINGS = {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    };

var motionDetected = false;

// Setup the GPIO pins for motion detection
gpio.setup(7, gpio.DIR_IN, gpio.EDGE_BOTH);
gpio.on('change', (chanel, value) => {
  console.log(`[${new Date()}] Motion ${value ? 'detected.' : 'timed out.'}.`);
  motionDetected = value;
});

// Find out how many ticks we are from the next 10 minute interval
var offset = DURATION - (Date.now() % (DURATION));
console.log(`Offset of ${offset / 1000} seconds detected, waiting...`);

// Start!
setTimeout(captureLoop, offset);

/*
 * Helper Functions
 */

function captureSingleVideo() {
  var TIMESTAMP = new Date()
    .toLocaleString('en-US', DATE_SETTINGS)
    .replace(/\:|\s|\//g, '')
    .replace(',', '_');

  var FILE = `video_${TIMESTAMP}.h264`,
      COMMAND = `raspivid -o ${TEMP_STORAGE_DESTINATION}/${FILE} -t ${DURATION - 5000} -n -vs -st -b ${BITRATE} -ex night`;

  console.log('Executing: ' + COMMAND);
  return cpp
    .exec(COMMAND)
    .then((result) => {
      if (result.stdout) {
        console.log(`Process out: ${result.stdout}`);
      }

      if (result.stderr) {
        console.log(`Process err: ${result.stderr}`);
      }

      if (motionDetected) {
        copyFileToNas(FILE);
      }
    })
    .catch((error) => {
      console.log(`Javascript error: ${error}`);
    })
    .progress((cp) => {
      console.log('PID: ', cp.pid);
    });
}

function captureLoop() {
  captureSingleVideo();
  setInterval(captureSingleVideo, DURATION);
}

function copyFileToNas(fileName) {
  var copyFrom = `${TEMP_STORAGE_DESTINATION}/${fileName}`;
  var copyTo = `${STORAGE_DESTINATION}/${filename}`;

  try {
    var stats = fs.statSync(copyFrom);

    if (!stats.isFile()) {
      throw new Error(`Not a valid file: ${copyFrom}`);
    }

    var start = Date.now();
    shell.exec(`cp ${copyFrom} ${copyTo} && rm ${copyFrom}`, () => {
      var duration = (Date.now() - start) / 1000;
      console.log(`File ${fileName} copied to ${STORAGE_DESTINATION}, took ${duration} seconds (${stats.size / 1024 / duration} KB/s).`)
    });

  } catch (err) {
    console.error('Error copying file.', err);
  }
}
