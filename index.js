var cpp = require('child-process-promise');

var STORAGE_DESTINATION = '/mnt/hhvideos',
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

function captureVideo() {
  var TIMESTAMP = new Date()
    .toLocaleString('en-US', DATE_SETTINGS)
    .replace(/\:|\s|\//g, '')
    .replace(',', '_');

  var FILE = `video_${TIMESTAMP}.h264`,
      COMMAND = `raspivid -o ${STORAGE_DESTINATION}/${FILE} -t ${DURATION - 10000} -n -vs -st -b ${BITRATE} -ex night`;

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
    })
    .catch((error) => {
      console.log(`Javascript error: ${error}`);
    })
    .progress((cp) => {
      console.log('PID: ', cp.pid);
    });
}

function captureLoop() {
  captureVideo();
  
  setInterval(captureVideo, DURATION);
}

// Find out how many ticks we are from the next 10 minute interval
var offset = DURATION - (Date.now() % (DURATION));
console.log(`Offset of ${offset / 1000} seconds detected, waiting...`);

setTimeout(captureLoop, offset);

