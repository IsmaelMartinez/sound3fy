var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var oscillator = audioCtx.createOscillator();
var gainNode = audioCtx.createGain();
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);
oscillator.type = 'sine'; // sine wave — other values are 'square', 'sawtooth', 'triangle' and 'custom'
oscillator.frequency.value = 0; // value in hertz
oscillator.start();

function setFrequency(d) {
  oscillator.frequency.value = d.value;
}
function resetFrequency() {
  oscillator.frequency.value = 0;
}

var timeouts = [];
function playBars() {
	d3.selectAll("rect").each(
    function (d, i) {
      timeouts.push(setTimeout(function () { setFrequency(d)}, 500* i));
    });
}

function stopPlayBars() {
  timeouts.forEach(
    function (timeout) {
      clearTimeout(timeout);
      resetFrequency();
    });
}
