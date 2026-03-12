const Sound = function(file, base, cb) { if(cb) cb(null); };
Sound.prototype.play = function(cb) { if(cb) cb(true); };
Sound.prototype.stop = function() {};
Sound.prototype.release = function() {};
Sound.MAIN_BUNDLE = '';
export default Sound;
