var sun;
var planets = [] ;
var shoot;
var count = 0;

function setup() {
	createCanvas(windowWidth, windowHeight);
	sun = new Sun(windowWidth/2, windowHeight/2);
	shoot = new shooter();
}

function draw() {
	background(255);

	for (var i = 0; i < planets.length ; i++) {
		for (var j = 0; j < planets.length ; j++) {
			if( i != j) {
				planets[i].orbit(planets[j]);
			}
		}
		planets[i].orbit(sun);
		planets[i].newton();
		planets[i].draw();
	}
  
	sun.draw();
	
	shoot.update();
	shoot.draw();
}

function shooter() {
	var x1 = 0;
	var y1 = 0;
	var x2 = 0;
	var y2 = 0;
	var R = 0;
	var G = 0;
	var B = 0;
	this.force = 0;
	var shooting=false;

	this.update = function() {
		if((!this.shooting) && (mouseIsPressed)) {
			this.shooting = true;
			this.x1 = mouseX;
			this.y1 = mouseY;
			this.R = floor(random(255));
			this.G = floor(random(255));
			this.B = floor(random(255));
		}

		if (this.shooting && mouseIsPressed) {
			this.x2 = mouseX;
			this.y2 = mouseY;
			this.force = int(dist(this.x1, this.y1, this.x2, this.y2))/10;
		}

		if (!mouseIsPressed && this.shooting) {
			var alpha = 0;
			var force_x = 0;
			var force_y = 0;
			var x_dir = 0;
			var y_dir = 0;

			if (this.force > 1) {
				if (this.x1 != this.x2) {
					alpha = atan(abs((this.y1 - this.y2)) / abs((this.x1 - this.x2)));
					force_x = this.force * cos(alpha);
					force_y = this.force * sin(alpha);
				} else {
					force_x = 0;
					force_y = this.force;
				}	

				if (this.x2 < this.x1) {
					if(this.y2 < this.y1) {
						x_dir = 1;
						y_dir = 1;
					} else {
						x_dir = 1;
						y_dir = -1;
					}
				} else {
					if(this.y2 < this.y1) {
						x_dir = -1;
						y_dir = 1;
					} else {
						x_dir = -1;
						y_dir = -1;
					}
				}
				append(planets, new Planet(this.x1, this.y1, (x_dir * force_x),(y_dir * force_y),this.R,this.G,this.B,10));
			}
			this.shooting = false;
		}
	}

	this.draw = function() {

			if (this.shooting) {
				/* Draw the line and the arraow */
				stroke(0);
				line(this.x2-5,this.y2, this.x2+5, this.y2);
				line(this.x2,this.y2-5, this.x2, this.y2+5);
		        	line(this.x1, this.y1, this.x2, this.y2);

				/* Draw the futur planet */
				noStroke();
				fill(this.R,this.G,this.B);
			    	ellipse(this.x1, this.y1, 20, 20);

			        push();
				fill(0);
			        translate( (this.x1+this.x2)/2, (this.y1+this.y2)/2 );
				if (this.x2 > this.x1) {
			        	rotate( atan2(this.y2-this.y1,this.x2-this.x1) );
				} else {
			        	rotate( atan2(this.y1-this.y2,this.x1-this.x2) );
				}
			        text(nfc(this.force,1,1), 0, -5);
			        pop();
			}
	}
}

function Sun(x,y) {
	this.pos = createVector(0, 0);
	this.pos.x = x;
	this.pos.y = y;
	this.radius = 30;
	this.mass = 1000;

	this.draw = function() {
		fill(0);
		ellipse(this.pos.x, this.pos.y, this.radius*2, this.radius*2); 
	}
}

function Planet(x,y,accx,accy,R,G,B,radius) {
	this.radius = radius || 10;
	this.traj = [];
	this.count = 0;
	this.R = R || 0;
	this.G = G || 0;
	this.B = B || 0;
	this.pos = createVector(x, y);
	this.vel = createVector(0, 0);
	this.acc = createVector(accx, accy);
	this.mass = 10;
	this.Gravity = 1;

	this.draw = function() {
		/* Draw planet */
		push();
		fill(this.R,this.G,this.B,250);
		translate(this.pos.x, this.pos.y);
		rotate(this.vel.heading());
		ellipse(0, 0, this.radius*2, this.radius*2); 
		pop();

		/* Draw trajectory */
		if (255 == this.count ) {
			for (var i = 0; i < this.count-1; i++) {
				this.traj[i] = this.traj[i+1];
			}
			this.traj[this.count-1] = createVector(this.pos.x,this.pos.y);
		} else {
			this.traj[this.count] = createVector(this.pos.x,this.pos.y);
			this.count++;
		}
		for (var i =0; i < this.traj.length; i++) {
			fill(this.R,this.G,this.B,i);
			noStroke();
			ellipse(this.traj[i].x, this.traj[i].y, 2, 2);
		}
	}

	this.applyForce = function(force) {
		this.acc.add(force);
	}

	this.newton = function () {
		this.vel.add(this.acc);
		this.pos.add(this.vel);
		this.acc.mult(0);
	}

	this.orbit = function(body) {
		var gravity_force = 0; 
		var gravity_force_x = 0; 
		var gravity_force_y = 0; 
		var x_dir = 0;
		var y_dir = 0;
		var alpha =  0;


		/* Gravitational force */
		var g_dist = dist(this.pos.x,this.pos.y,body.pos.x,body.pos.y)
		gravity_force = ((this.Gravity * this.mass * body.mass)/(sq(g_dist)));
		if (body.pos.x != this.pos.x) {
			alpha = atan(abs((body.pos.y - this.pos.y)) / abs((body.pos.x - this.pos.x)));
			gravity_force_x = gravity_force * cos(alpha);
			gravity_force_y = gravity_force * sin(alpha);
		} else {
			gravity_force_x = 0;
			gravity_force_y = gravity_force;
		}	

		/* Gravitational force direction */
		if (this.pos.x < body.pos.x) {
			if(this.pos.y < body.pos.y) {
				x_dir = 1;
				y_dir = 1;
			} else {
				x_dir = 1;
				y_dir = -1;
			}
		} else {
			if(this.pos.y < body.pos.y) {
				x_dir = -1;
				y_dir = 1;
			} else {
				x_dir = -1;
				y_dir = -1;
			}
		}

		/* Apply gravitational force */
		this.applyForce(createVector((x_dir * gravity_force_x), (y_dir * gravity_force_y)));
	}

}
