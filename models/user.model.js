const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
	name: {
		type: String,
		required: true,
		minlength: 1,
		maxlength: 20,
	},
	id: {
		type: String,
		required: true,
		unique: true,
		minlength: 3,
		maxlength: 20
	},
	password: {
		type: String,
		required: true,
	},
	role: {
		type: String,
		enum: ['student', 'business','admin'],
		default: 'student',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
});

userSchema.pre('save', function (next) {
	this.updatedAt = Date.now();
	next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('user', userSchema);
