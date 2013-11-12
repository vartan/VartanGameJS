/* 
 * Game
 * Created by Michael Vartan
 * 26 November 2012
 *
 * Done:
 * Keyboard Controls
 * iPhone Support
 * -- Retina Support
 * Resizing Browser
 * Actual-Time game engine, rather than frame-by-frame time-estimation.
 * Touchscreen Support
 * Mouse Support
 * 
 * Todo/Ideas:
 * Test Mouse Controls
 * -- Movement by holding left click, hold keyboard buttons to perform actions?
 *
 */

var canvas;
var ctx;
var charDown= new Array();
var screenObjects= new Array();
var me;
var gameWidth=0;
var gameHeight=0;
var lastExecution;
var fpsCounter = 0;
var fpsTimer = 0;
var fps = 0;
var mouseLocation = new Point(-1,-1);
var timeFix = 1;
var MAX_FPS = 60;
var marginTop=0;
var marginLeft=0;
var scale=1;
var touches=new Array();
var touchScreen=false;
var mouseDown=false;

function init() {

	if (window.screen.height==568) {
	document.querySelector("meta[name=viewport]").content="width=320.1";
	}
	canvas = $("#game")[0];
	ctx=canvas.getContext("2d");
	resize();
	me = new ScreenObject();
	me.draw = function() {
		ctx.beginPath();
		ctx.fillStyle=this.color;
		ctx.arc(marginLeft+me.x*scale,marginTop+me.y*scale,scale/2,0,2*Math.PI,true);
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.moveTo(marginLeft+me.x*scale,marginTop+me.y*scale-scale/4);
		ctx.lineTo(marginLeft+me.x*scale-scale/2,marginTop+me.y*scale-scale/2);
		ctx.lineTo(marginLeft+me.x*scale-scale/2,marginTop+me.y*scale)
		ctx.moveTo(marginLeft+me.x*scale,marginTop+me.y*scale-scale/4);
		ctx.lineTo(marginLeft+me.x*scale+scale/2,marginTop+me.y*scale-scale/2);
		ctx.lineTo(marginLeft+me.x*scale+scale/2,marginTop+me.y*scale)
		ctx.closePath();
		ctx.fill();
		ctx.fillStyle="#0a0"
		ctx.beginPath();
		ctx.arc(marginLeft+me.x*scale+scale/6,marginTop+me.y*scale-scale/8,scale/16,0,2*Math.PI,true)
		ctx.closePath();
		ctx.fill();
		ctx.beginPath();
		ctx.arc(marginLeft+me.x*scale-scale/6,marginTop+me.y*scale-scale/8,scale/16,0,2*Math.PI,true)
		ctx.closePath();
		ctx.fill();
		ctx.strokeStyle="#222"

		ctx.beginPath();
		ctx.arc(marginLeft+me.x*scale-scale/8,marginTop+me.y*scale+scale/32,scale/8,4*Math.PI/2,Math.PI,false);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(marginLeft+me.x*scale+scale/8,marginTop+me.y*scale+scale/32,scale/8,4*Math.PI/2,Math.PI,false);
		ctx.stroke();
		ctx.beginPath();
		ctx.arc(marginLeft+me.x*scale,marginTop+me.y*scale+scale/16,scale/8,-5*Math.PI/4,-7*Math.PI/4,Math.PI,true);
		ctx.stroke();
		ctx.fillStyle="#a77"
		ctx.beginPath();
		ctx.arc(marginLeft+me.x*scale,marginTop+me.y*scale,scale/20,0,2*Math.PI,true);
		ctx.closePath();
		ctx.fill();
		}
	me.update = function() {
		if(!touches || touches.length==0)
			return;
		var direction = Math.atan2(me.y-touches[0].y,me.x-touches[0].x);
		
		if((charDown[KeyEvent.DOM_VK_F] || (touches&&touches.length>1))) {
			if(me.weaponDelay == null || me.weaponDelay<new Date().getTime()) {
				me.weaponDelay = new Date().getTime()+100;
				var projectile = new ScreenObject("projectile",me.x,me.y+1/8);
				projectile.direction=direction;
				projectile.update = function() {
					var dx = Math.cos(direction);
					var dy = -Math.sin(direction);
					var ds = timeFix*5;
					projectile.x-=dx*ds;
					projectile.y+=dy*ds;
				}
			}
			return; //do not walk if shooting
		}		
		if(!touchScreen && !mouseDown)
			return;
		var dx = Math.cos(direction);
		var dy = -Math.sin(direction);
		var ds = me.speed*timeFix;
		if(ds<Math.sqrt(Math.pow((touches[0].x-me.x),2)+Math.pow((touches[0].y-me.y),2))) {
			me.x-=dx*ds;			
			me.y+=dy*ds;
		}

	}	
	
	
	for(var a=0;a<256;a++)
		charDown[a]=false;
	$(document).keydown(onKeyDown);
	$(document).keyup(onKeyUp);
	$(document).mousedown(onPressDown);
	$(document).mouseup(onPressUp);
	$(document).mousemove(onCursorMove);
	document.addEventListener('touchstart',onPressDown);
	document.addEventListener('touchmove',onCursorMove);	
	document.addEventListener('touchend',onPressUp);
	lastExecution=new Date().getTime();
	fpsTimer=lastExecution;
	setTimeout(update,1);
}
function update() {
	var timePast = new Date().getTime()-lastExecution;
	lastExecution=new Date().getTime();
	fpsCounter++;

	if(fpsCounter>99) {
		fps = Math.round(1000/((lastExecution-fpsTimer)/fpsCounter));
		fpsCounter = 0;
		fpsTimer = lastExecution;
		resize();
	}
		
	timeFix = timePast/1000;

		ctx.clearRect(0,0,canvas.width,canvas.height);


	ctx.strokeStyle = "#ddd";
	for(var i=0;i<=16;i++) {
		ctx.drawLine(new Point(marginLeft+gameWidth/16*i,marginTop+0-.5), new Point(marginLeft+gameWidth/16*i,marginTop+gameHeight));
	}
	for(var i=0;i<=9;i++) {
		ctx.drawLine(new Point(marginLeft+0,marginTop+gameHeight/9*i-.5), new Point(marginLeft+gameWidth,marginTop+gameHeight/9*i));
	}
		for(var a=0;a<screenObjects.length;a++) {
			screenObjects[a].update();
			screenObjects[a].draw();
			
		}
		ctx.fillStyle="#dddddd";
		ctx.font = (scale/3)+"px Arial";
		ctx.fillText(fps+"", 0, (scale/3));

	setTimeout(update,0);
}

function resize() {
	if (window.devicePixelRatio) {
		canvas.width = window.innerWidth*window.devicePixelRatio;
		canvas.height = window.innerHeight*window.devicePixelRatio;
		canvas.style.width=window.innerWidth+"px";
		canvas.style.height=window.innerHeight+"px";
	} else {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
	}
	gameWidth = canvas.width;
	gameHeight = canvas.height;
	if(gameWidth/16>gameHeight/9) {
		var newWidth = gameHeight*16/9;
		marginTop=0;
		marginLeft = (gameWidth-newWidth)/2;
		gameWidth = newWidth;
		scale=gameHeight/9;
	} else {
		var newHeight = gameWidth*9/16;
		marginLeft=0;
		marginTop = (gameHeight-newHeight)/2;
		gameHeight = newHeight;
		scale=gameWidth/16;
	}
}
function Point(x,y) {
	this.x=x;
	this.y=y;
}
Point.prototype.getInfo = function() {
	return "("+this.x+","+this.y+")";
}
function ScreenObject(type,x,y) {
	screenObjects.push(this);
	this.color="#555";
	if(!type) {
		size=50;
	} else if(type=="projectile") {
		size = 1/8;
		this.color="#aa5522";
	} 
	if(!x || !y) {
		x = 16/2;
		y = 9/2;
	}
	this.x=x;
	this.y=y;
	this.speed=4;
	this.size=size;
}
ScreenObject.prototype.draw = function() {
	ctx.fillStyle=this.color;
	ctx.beginPath();
	ctx.arc(marginLeft+this.x*scale,marginTop+this.y*scale,scale*this.size/2,0,2*Math.PI,false);
	ctx.fill();
}
ScreenObject.prototype.update = function() {
}
ScreenObject.prototype.remove = function() {
	screenObjects.pop(this);
}

function onKeyDown(evt) { 
	var key = evt.keyCode;
	charDown[key]=true;
	evt.preventDefault();

}

function onKeyUp(evt) {
	var key = evt.keyCode;
	charDown[key]=false;
}


function onPressDown(evt) {
	touches=new Array();
	var ratio=1;
	if(window.devicePixelRatio)
		ratio=window.devicePixelRatio;
	var x=(evt.pageX-marginLeft)*ratio;
	var y=(evt.pageY-marginTop)*ratio;
	if(evt.touches) {
		touchScreen=true;
		for(var i=0;i<evt.touches.length;i++) {
			x = (evt.touches[i].pageX)*ratio-marginLeft;
			y = (evt.touches[i].pageY)*ratio-marginTop;
			touches[i] = new Point(x/scale,y/scale);
		}
	} else {
		mouseDown=true;
		touches[0] = new Point(x/scale,y/scale);
	}
}
function onCursorMove(evt) {
	evt.preventDefault();
	if(touches && touches.length==0 && !evt.touches) {
		return false;
	}
	touches=new Array();
	var ratio=1;
	if(window.devicePixelRatio)
		ratio=window.devicePixelRatio;
	var x=(evt.pageX-marginLeft)*ratio;
	var y=(evt.pageY-marginTop)*ratio;
	if(evt.touches) {
		for(var i=0;i<evt.touches.length;i++) {
			x = (evt.touches[i].pageX)*ratio-marginLeft;
			y = (evt.touches[i].pageY)*ratio-marginTop;
			touches[i] = new Point(x/scale,y/scale);
		}
	} else {
		touches[0] = new Point(x/scale,y/scale);
	}
}
function onPressUp(evt) {
	evt.preventDefault();
	touches=new Array();
	var ratio=1;
	if(window.devicePixelRatio)
		ratio=window.devicePixelRatio;
	var x=(evt.pageX-marginLeft)*ratio;
	var y=(evt.pageY-marginTop)*ratio;
	if(evt.touches) {
		for(var i=0;i<evt.touches.length;i++) {
			x = (evt.touches[i].pageX)*ratio-marginLeft;
			y = (evt.touches[i].pageY)*ratio-marginTop;
			touches[i] = new Point(x/scale,y/scale);
		}
	} else {
		touches[0] = new Point(x/scale,y/scale);
		mouseDown=false;
	}
}
CanvasRenderingContext2D.prototype.drawLine = function(p1,p2) {
  this.beginPath();
  this.moveTo(p1.x,p1.y);
  this.lineTo(p2.x,p2.y);
  this.closePath();
  this.stroke();
}
window.onresize = resize;
window.onload = init;


if (typeof KeyEvent == "undefined") {
    var KeyEvent = {
        DOM_VK_CANCEL: 3,
        DOM_VK_HELP: 6,
        DOM_VK_BACK_SPACE: 8,
        DOM_VK_TAB: 9,
        DOM_VK_CLEAR: 12,
        DOM_VK_RETURN: 13,
        DOM_VK_ENTER: 14,
        DOM_VK_SHIFT: 16,
        DOM_VK_CONTROL: 17,
        DOM_VK_ALT: 18,
        DOM_VK_PAUSE: 19,
        DOM_VK_CAPS_LOCK: 20,
        DOM_VK_ESCAPE: 27,
        DOM_VK_SPACE: 32,
        DOM_VK_PAGE_UP: 33,
        DOM_VK_PAGE_DOWN: 34,
        DOM_VK_END: 35,
        DOM_VK_HOME: 36,
        DOM_VK_LEFT: 37,
        DOM_VK_UP: 38,
        DOM_VK_RIGHT: 39,
        DOM_VK_DOWN: 40,
        DOM_VK_PRINTSCREEN: 44,
        DOM_VK_INSERT: 45,
        DOM_VK_DELETE: 46,
        DOM_VK_0: 48,
        DOM_VK_1: 49,
        DOM_VK_2: 50,
        DOM_VK_3: 51,
        DOM_VK_4: 52,
        DOM_VK_5: 53,
        DOM_VK_6: 54,
        DOM_VK_7: 55,
        DOM_VK_8: 56,
        DOM_VK_9: 57,
        DOM_VK_SEMICOLON: 59,
        DOM_VK_EQUALS: 61,
        DOM_VK_A: 65,
        DOM_VK_B: 66,
        DOM_VK_C: 67,
        DOM_VK_D: 68,
        DOM_VK_E: 69,
        DOM_VK_F: 70,
        DOM_VK_G: 71,
        DOM_VK_H: 72,
        DOM_VK_I: 73,
        DOM_VK_J: 74,
        DOM_VK_K: 75,
        DOM_VK_L: 76,
        DOM_VK_M: 77,
        DOM_VK_N: 78,
        DOM_VK_O: 79,
        DOM_VK_P: 80,
        DOM_VK_Q: 81,
        DOM_VK_R: 82,
        DOM_VK_S: 83,
        DOM_VK_T: 84,
        DOM_VK_U: 85,
        DOM_VK_V: 86,
        DOM_VK_W: 87,
        DOM_VK_X: 88,
        DOM_VK_Y: 89,
        DOM_VK_Z: 90,
        DOM_VK_CONTEXT_MENU: 93,
        DOM_VK_NUMPAD0: 96,
        DOM_VK_NUMPAD1: 97,
        DOM_VK_NUMPAD2: 98,
        DOM_VK_NUMPAD3: 99,
        DOM_VK_NUMPAD4: 100,
        DOM_VK_NUMPAD5: 101,
        DOM_VK_NUMPAD6: 102,
        DOM_VK_NUMPAD7: 103,
        DOM_VK_NUMPAD8: 104,
        DOM_VK_NUMPAD9: 105,
        DOM_VK_MULTIPLY: 106,
        DOM_VK_ADD: 107,
        DOM_VK_SEPARATOR: 108,
        DOM_VK_SUBTRACT: 109,
        DOM_VK_DECIMAL: 110,
        DOM_VK_DIVIDE: 111,
        DOM_VK_F1: 112,
        DOM_VK_F2: 113,
        DOM_VK_F3: 114,
        DOM_VK_F4: 115,
        DOM_VK_F5: 116,
        DOM_VK_F6: 117,
        DOM_VK_F7: 118,
        DOM_VK_F8: 119,
        DOM_VK_F9: 120,
        DOM_VK_F10: 121,
        DOM_VK_F11: 122,
        DOM_VK_F12: 123,
        DOM_VK_F13: 124,
        DOM_VK_F14: 125,
        DOM_VK_F15: 126,
        DOM_VK_F16: 127,
        DOM_VK_F17: 128,
        DOM_VK_F18: 129,
        DOM_VK_F19: 130,
        DOM_VK_F20: 131,
        DOM_VK_F21: 132,
        DOM_VK_F22: 133,
        DOM_VK_F23: 134,
        DOM_VK_F24: 135,
        DOM_VK_NUM_LOCK: 144,
        DOM_VK_SCROLL_LOCK: 145,
        DOM_VK_COMMA: 188,
        DOM_VK_PERIOD: 190,
        DOM_VK_SLASH: 191,
        DOM_VK_BACK_QUOTE: 192,
        DOM_VK_OPEN_BRACKET: 219,
        DOM_VK_BACK_SLASH: 220,
        DOM_VK_CLOSE_BRACKET: 221,
        DOM_VK_QUOTE: 222,
        DOM_VK_META: 224
    };
}
