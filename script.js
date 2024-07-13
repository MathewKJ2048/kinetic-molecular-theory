HEIGHT = window.innerHeight
WIDTH = window.innerWidth
SCALE = (HEIGHT+WIDTH)/2
MAX_RADIUS = 4
MIN_RADIUS = 4
MAX_VELOCITY = 3
BACKGROUND = "black"
RESOLUTION_FACTOR = 10
N = 1024


var canvas = document.querySelector("canvas")
canvas.width = WIDTH
canvas.height = HEIGHT
window.addEventListener("resize",function(main){
	HEIGHT = this.window.innerHeight
	WIDTH = this.window.innerWidth
	canvas.width = WIDTH
	canvas.height = HEIGHT
})
var c = canvas.getContext("2d");


class Vector {
	constructor(x, y) 
	{
		this.x = x
		this.y = y
	}
	add(v) 
	{
		return new Vector(this.x+v.x,this.y+v.y)
	}
	sub(v)
	{
		return new Vector(this.x-v.x,this.y-v.y)
	}
	scale(k)
	{
		return new Vector(this.x*k,this.y*k)
	}
	dot(v)
	{
		return this.x*v.x+this.y*v.y
	}
	mag()
	{
		return Math.sqrt(this.x*this.x+this.y*this.y)
	}
}
class Circle
{
	constructor(r,v,radius,color)
	{
		this.r = r
		this.v = v
		this.radius = radius
		this.color = color
	}
}
class Grid
{
	constructor()
	{
		this.circles = new Set()
	}
}

const circles = []
const grids = new Map();

function random_radius()
{
	return Math.random()*(MAX_RADIUS-MIN_RADIUS) + MIN_RADIUS
}
function random_position(radius)
{
	x = Math.random()*(WIDTH-2*radius)+radius
	y = Math.random()*(HEIGHT-2*radius)+radius
	return new Vector(x,y)
}
function random_velocity()
{
	theta = Math.random()*2*Math.PI
	return new Vector(Math.sin(theta),Math.cos(theta))
}
function initiate()
{
	for(i=0;i<N;i++)
	{
		radius = random_radius()
		circ = new Circle(random_position(radius),random_velocity(),radius,"white")
		circles.push(circ)
	}
	for(i=-RESOLUTION_FACTOR;i<=2*RESOLUTION_FACTOR;i++)for(j=-RESOLUTION_FACTOR;j<=2*RESOLUTION_FACTOR+3;j++)grids.set(i+"|"+j,new Grid())
}
function get_grid(r)
{
	first = Math.floor(RESOLUTION_FACTOR*r.x/WIDTH)
	second = Math.floor(RESOLUTION_FACTOR*r.y/HEIGHT)
	return first+"|"+second
}
function collide(c1, c2)
{
	normal = c1.r.sub(c2.r)
	if(normal.mag()==0)
	{
		return
	}
	vnormal = c1.v.sub(c2.v)
	if(normal.dot(vnormal)>0)
	{
		return
	}
	normal = normal.scale(1/normal.mag())
	nv1 = normal.scale(normal.dot(c1.v))
	nv2 = normal.scale(normal.dot(c2.v))
	c1.v = c1.v.sub(nv1).add(nv2)
	c2.v = c2.v.sub(nv2).add(nv1)
}
function physics()
{
	for(g of grids.values())
	{
		g.circles.clear()
	}
	for(circ of circles)
	{
		circ.r = circ.r.add(circ.v.scale(1))
		if(circ.r.x < circ.radius)
		{
			circ.v.x=Math.abs(circ.v.x)
		}
		if(circ.r.x > WIDTH-circ.radius)
		{
			circ.v.x=-Math.abs(circ.v.x)
			circ.r.x=WIDTH-circ.radius
		}
		if(circ.r.y < circ.radius)
		{
			circ.v.y=Math.abs(circ.v.y)
		}
		if(circ.r.y > HEIGHT-circ.radius)
		{
			circ.v.y=-Math.abs(circ.v.y)
			circ.r.y=HEIGHT-circ.radius
		}
		grid = grids.get(get_grid(circ.r))
		if(grid)
			grid.circles.add(circ)
	}
	for(circ of circles)
	{
		y_hat = new Vector(0,HEIGHT/RESOLUTION_FACTOR)
		x_hat = new Vector(WIDTH/RESOLUTION_FACTOR,0)
		u = circ.r.add(y_hat)
		d = circ.r.sub(y_hat)
		l = circ.r.add(x_hat)
		r = circ.r.sub(x_hat)
		neighbourhood = [u,d,l,r,u.add(x_hat),u.sub(x_hat),l.add(x_hat),l.sub(x_hat)]
		neighbour_circles = []
		for(r of neighbourhood)
		{
			ncircles = grids.get(get_grid(r)).circles
			for(nc of ncircles)
			{
				neighbour_circles.push(nc)
			}
		}
		for(ic of neighbour_circles)
		{
			if (circ.r.sub(ic.r).mag() < circ.radius+ic.radius)
			{
				collide(circ,ic)
			}
		}
	}
}
function color(v)
{
	m = v.mag()
	if(m>MAX_VELOCITY)m-MAX_VELOCITY
	red = m/MAX_VELOCITY
	blue = 1-red
	return "rgb("+Math.round(255*red)+",0,"+Math.round(255*blue)+")"

}
function render()
{
	c.fillStyle = BACKGROUND
	c.fillRect(0, 0, WIDTH, HEIGHT)
	for(circ of circles)
	{
		c.fillStyle = color(circ.v)
		c.beginPath()
		c.arc(circ.r.x,circ.r.y,circ.radius,0,Math.PI*2)
		c.fill()
	}
}
function animate() 
{
	physics()
	render()
	requestAnimationFrame(animate);
}
initiate()
animate()