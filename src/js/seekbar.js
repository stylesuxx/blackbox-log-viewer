"use strict";

function SeekBar(canvas) {
	var
		that = this,
		
		//Times:
		min, max, current,
		
		//Activity to display on bar:
		activityStrength, activityTime,
		//Expect to be plotting PWM-like data by default:
		activityMin = 1000, activityMax = 2000,
		
		canvasContext = canvas.getContext("2d"),
		
		//Current time cursor:
		CURSOR_WIDTH = 2.5,
		
		// The bar begins a couple of px inset from the left to allow the cursor to hang over the edge at start&end
		BAR_INSET = CURSOR_WIDTH;
	
	this.onSeek = false;
	
	function seekToPixel(x) {
		var 
			time = (x - BAR_INSET) * (max - min) / (canvas.width - 1 - BAR_INSET * 2) + min;
	
		if (time < min)
			time = min;
		
		if (time > max)
			time = max;
		
		if (that.onSeek)
			that.onSeek(time);
	}
	
	function onMouseMove(e) {
		if (e.which == 1)
			seekToPixel(e.pageX - $(canvas).offset().left);
	}
	
	$(canvas).mousedown(function(e) {
		seekToPixel(e.offsetX);
		
		//"capture" the mouse so we can drag outside the boundaries of the seek bar
		$(document).on("mousemove", onMouseMove);
		
		//Release the capture when the mouse is released
		$(document).one("mouseup", function () {
			$(document).off("mousemove", onMouseMove);
		});
	});
	
	this.setActivityRange = function(min, max) {
		activityMin = min;
		activityMax = max;
	};
	
	this.setTimeRange = function(newMin, newMax, newCurrent) {
		min = newMin;
		max = newMax;
		current = newCurrent;
	};
	
	this.setActivity = function(newActivityStrengths, newActivityTimes) {
		activityStrength = newActivityStrengths;
		activityTime = newActivityTimes;
	};
	
	this.setCurrentTime = function(newTime) {
		current = newTime;
	};
	
	this.repaint = function() {
		var 
			x, activityIndex = 0,
			pixelTimeStep;
		
		canvasContext.fillStyle = '#eee';
		canvasContext.fillRect(0, 0, canvas.width, canvas.height);
		
		if (max > min) {
			pixelTimeStep = (max - min) / (canvas.width - 1 - BAR_INSET * 2);
			
			//Draw activity bars
			if (activityTime.length) {
				canvasContext.strokeStyle = '#AAF';
				canvasContext.beginPath();
				
				var 
					time = min;
				
				for (x = BAR_INSET; x < canvas.width - BAR_INSET; x++) {
					var 
						activity;
					
					//Advance to the right entry in the activity array for this time
					while (activityIndex < activityTime.length && time >= activityTime[activityIndex])
						activityIndex++;
					
					if (activityIndex == activityTime.length)
						activity = 0;
					else {
						activity = (activityStrength[activityIndex] - activityMin) / (activityMax - activityMin) * canvas.height;
						canvasContext.moveTo(x, canvas.height);
						canvasContext.lineTo(x, canvas.height - activity);
					}
					
					time += pixelTimeStep;
				}
				
				canvasContext.stroke();
			}
			
			//Draw cursor
			var cursorX = (current - min) / pixelTimeStep + BAR_INSET;

			canvasContext.fillStyle = 'rgba(0,0,0,0.5)';
			canvasContext.fillRect(cursorX - CURSOR_WIDTH, 0, CURSOR_WIDTH * 2, canvas.height);
		}
	};
}