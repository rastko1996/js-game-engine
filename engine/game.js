/*! 
 * _____________________
 * |***	*********** ***|
 * |***	GAME ENGINE ***|
 * |***	*********** ***|
 * ---------------------
 *
 * SimpleCanvas GameEngine JavaScript Library v1.0
 * http://mywebsite.com/
 *
 * Copyright 2016, Rastko Tojagic
 * Released under GNU General Public Licence
 * http://licence.link/licence
 * 
 * Date: 2016-05-16

 *	
 * A JavaScript framework, written by Rastko Tojagic, 2016
 *	
 * Version 1.0.0
 *	
 * This javascript framework provides basic functions needed
 * to create a game with html5 canvas and js.
 *
 */
;
'use strict';

(function (global) {
	var Game = function (w, h) {
		return new Game.init(w, h);
	};

	Game.init = function (w, h) {
		/*
			Initialize DOM
		*/
		// set default parameters if not provided
		w = w || 800;
		h = h || 600;

		// initialize canvas
		var canvas = global.document.createElement('canvas');
		canvas.width = w;
		canvas.height = h;
		canvas.style.border = '5px solid #000';
		global.document.body.appendChild(canvas);

		// add properties to Game object
		this.canvas = canvas;

		/*
			MAIN PROPERTIES
		*/
		this.gui = [];
		this.entities = [];

		// init event emmiter
		this.events = new Emitter();

		// init GUI
		this.cPad = new ControlPad(this, 0.88, 0.83);

		/*
			MAIN EVENTS
		*/
		this.events.on('update', function () {
			// always update background
			canvas.getContext('2d').fillStyle = '#ccc';
			canvas.getContext('2d').fillRect(0, 0, game.canvas.width, game.canvas.height);

			// let's draw entities on top of background
			for (var i = 0; i < this.game.entities.length; i++) {
				this.game.entities[i].drawImage();
			}
		});

		this.events.on('gui', function () {
			for (var i = 0; i < this.game.gui.length; i++) {
				this.game.gui[i].drawImage();
			}
		});

		function callUpdate() {
			this.game.events.emit('update');

			// we want to draw gui last, on top of everything
			this.game.events.emit('gui');
		}

		// now we implement the main game and GUI render loop
		setInterval(callUpdate, 150);
	}

	Game.prototype = {
		createButton: function (id, img, x, y) {
			/*
				This method will add a new GUI element, a Button to the screen
			*/
			var b = new Button(this, id, img, x, y);
			this.gui.push(b);

			return b;
		},

		createEntity: function (id, img, x, y, isPlayer) {
			isPlayer = isPlayer || false;
			var e = new Entity(this, id, img, x, y, isPlayer);
			this.entities.push(e);
			return e;
		},

		/*
			A static entity is an object in the scene, that does not interact
			with any of the objects, nor can be controlled
			
			This function constructor is meant to create static elements in the scene
			such as background elements, decorative elements..
		*/
		createStaticEntity: function () {

		},

		/*
			ERROR LIST
		*/
		err: {
			missing_param: 'Error: missing parameters!'
		}
	}


	/*
	 *----------------------------------------------------------------------------
	 *	| PRIVATE FUNCTION CONSTRUCTORS AND VARIABLES |
	 *----------------------------------------------------------------------------
	 */

	/*
		GAME OBJECTS -------------------------------------------------------------
	*/
	var Entity = function (game, id, img, x, y, isPlayer) {
		this.id = id;
		this.image = new Image();
		this.image.src = img;
		this.game = game;
		this.ctx = game.canvas.getContext('2d');
		this.isPlayer = isPlayer;
		if (isPlayer) {
			this.game.cPad.player = this;
		}
		this.position = {
			x: x,
			y: y
		};

		this.initDrawImage();
		return this;
	};

	Entity.prototype = {
		game: {},

		moveTo: function (x, y) {
			if (this.isPlayer) {
				this.position.x = x;
				this.position.y = y;
				this.drawImage();
			}
		},

		initDrawImage: function () {
			var g = this;
			this.image.onload = function () {
				g.ctx.drawImage(g.image, g.position.x, g.position.y, g.image.width, g.image.height);
			}
		},

		drawImage: function () {
			this.ctx.drawImage(this.image, this.position.x, this.position.y, this.image.width, this.image.height);
		}
	};

	/*
		USER INTERFACE -----------------------------------------------------------
	*/

	var ControlPad = function (game, x, y) {
		// the pad should control player
		this.player = null;

		var w = game.canvas.width;
		var h = game.canvas.height;

		var ctx = game.canvas.getContext('2d');

		var posX = x || 0;
		var posY = y || 0;

		this.btnTop = new Button(game, 'top', 'engine/img/arw_top.png', w * posX, h * posY - 64);
		this.btnBot = new Button(game, 'bot', 'engine/img/arw_bottom.png', w * posX, h * posY + 64);
		this.btnLeft = new Button(game, 'left', 'engine/img/arw_left.png', w * posX - 64, h * posY);
		this.btnRight = new Button(game, 'right', 'engine/img/arw_right.png', w * posX + 64, h * posY);

		game.gui = [];

		game.gui.push(this.btnTop);
		game.gui.push(this.btnBot);
		game.gui.push(this.btnRight);
		game.gui.push(this.btnLeft);



		// handle click events
		game.canvas.addEventListener('mousedown', function (event) {
			var x = event.x;
			var y = event.y;

			var canvas = this;

			x -= canvas.offsetLeft;
			y -= canvas.offsetTop;

			/*
				Now we have to check if the click on canvas
				happend on any of our ControlPad elements
			*/
			for (var i = 0; i < game.gui.length; i++) {
				game.gui[i].inRange(x, y);
			}

		}, false);

		return this;
	};

	var GuiElement = function () {};

	GuiElement.prototype = {
		setPosition: function (x, y) {
			if (!x || !y)
				throw new Error(this.game.err.missing_param);

			this.position.x = x;
			this.position.y = y;
			this.drawImage();
		},

		initDrawImage: function () {
			var g = this;
			this.image.onload = function () {
				g.ctx.drawImage(g.image, g.position.x, g.position.y, g.image.width, g.image.height);
			}
		},

		drawImage: function () {
			this.ctx.drawImage(this.image, this.position.x, this.position.y, this.image.width, this.image.height);
		}
	};

	var Button = function (game, id, img, x, y) {
		if (!id) {
			throw new Error(game.err.missing_param);
			return null;
		}

		this.id = id;

		this.game = game;
		this.ctx = game.canvas.getContext('2d');

		this.image = new Image();
		this.image.src = img;

		this.position = {
			x: x - this.image.width / 2,
			y: y - this.image.height / 2
		};

		this.initDrawImage();
	};

	Button.prototype = GuiElement.prototype;

	Button.prototype.inRange = function (x, y) {
		var lDist = this.position.x,
			rDist = this.position.x + this.image.width,
			tDist = this.position.y,
			bDist = this.position.y + this.image.height;

		if (x > lDist && x < rDist && y > tDist && y < bDist) {
			this.onMouseDown();
		}
	};

	Button.prototype.onMouseDown = function () {
		var player = this.game.cPad.player;
		var dir = this.id;
		if (!player)
			throw new Error('Player not found!');

		if (dir === 'top') {
			player.moveTo(player.position.x, player.position.y - 10);
		} else if (dir === 'bot') {
			player.moveTo(player.position.x, player.position.y + 10);
		} else if (dir === 'right') {
			player.moveTo(player.position.x + 10, player.position.y);
		} else if (dir === 'left') {
			player.moveTo(player.position.x - 10, player.position.y);
		}

		console.log('GUI element: ' + this.id + ' reporting a click!');
	};

	/*
		EVENT EMMITER
	*/
	var Emitter = function () {
		this.events = {};
	};

	Emitter.prototype.on = function (type, listener) {
		this.events[type] = this.events[type] || [];
		this.events[type].push(listener);
	};

	Emitter.prototype.emit = function (type) {
		if (this.events[type]) {
			this.events[type].forEach(function (listener) {
				listener();
			});
		}
	};
	/*
		FINAL SETUP
	*/
	Game.init.prototype = Game.prototype;

	global.Game = Game;
}(this));