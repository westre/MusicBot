// Constructor
function Track(id, name) {
	this.id = id;
	this.name = name;
}

// class methods
Track.prototype.toString = function() {
	return "Name: " + this.name + ", id: " + this.id;
};

Track.prototype.getName = function() {
	return this.name;
};

// export the class
module.exports = Track;