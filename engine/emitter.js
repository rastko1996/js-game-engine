(function(global) {
	var Emitter = function() {
		this.events = {};
	}

	Emitter.prototype.on = function(type, listener) {
		this.events[type] = this.events[type] || [];
		this.events[type].push(listener);
	}

	Emitter.prototype.emit = function(type) {
		if(this.events[type]) {
			this.events[type].forEach(function(listener) {
				listener();
			});
		}
	}
	
	global.Emitter = Emitter;
}(this));