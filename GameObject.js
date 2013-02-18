if (typeof(console) === "undefined" || typeof(console.log) !== "function") {
	var console = { "log": function() {} };
}

console.log("started...");

var k_CellInvisible = -2;
var k_CellEmpty = -1;
var k_PortalWidth = 40;
k_loadedImages = new Object();

function Bonus()
{
}

function getDirection(dir)
{
    dir = dir % 4;

    if (dir == 0)
        return new Position(-1, 0);
    else if (dir == 1)
        return new Position( 0,-1);
    else if (dir == 2)
        return new Position( 1, 0);
    else if (dir == 3)
        return new Position( 0, 1);
}

function index1D(column,line)
{
    return (line*k_PortalWidth) + column;
}

function index2D(index)
{
    var x = index % k_PortalWidth;
    var y = (index - x) / k_PortalWidth;

    return new Position(x,y);
}

function Epicenter(id,pos)
{
    // Epicenter id
    this.id = id;
    // Life time
    this.lifeTime = 0;
    // Minimal life time
    this.minLifeTime = 60000;
    // Time since last rust cell
    this.timeSinceLastRust = 0;

    // Position
    this.position = pos;

    // Array of position representing rust candidate
    this.rustCandidates = new Array();

    // 
    this.rustBonus = new Array();

    // Number of new rust cell per millisecond
    this.propagationSpeed = 10;

    // Constructor---------------------------------------------------


    this.addRustCandidate = function(portal,cellX,cellY) {
        var idx = index1D(cellX,cellY);

        if ((cellX >= 0) && (cellX < k_PortalWidth) && (cellY >= 0) && (cellY < k_PortalWidth)
            && (portal.cells[cellY][cellX] == k_CellEmpty)
            && this.rustCandidates.indexOf(idx) == -1)
        {
            this.rustCandidates.push(idx);
            return true;
        }
        return false;
    };

    this.makeRusty = function(portal, cellX, cellY) {
        if ( (cellX >= 0) && (cellX < k_PortalWidth) && (cellY >= 0) && (cellY < k_PortalWidth))
        {
            // Remove the element from rust candidate because it's not empty
            // so not a proper candidate, otherwise it's will be filled
            var elemIdx = this.rustCandidates.indexOf(index1D(cellX,cellY));
            this.rustCandidates.splice(elemIdx,1);

            if(portal.cells[cellY][cellX] == k_CellEmpty)
            {
                portal.cells[cellY][cellX] = this.id;
                
                for (var i=0; i < 4; i++)
                {
                    var dir = getDirection(i);
                    this.addRustCandidate(portal,cellX+dir.x,cellY+dir.y);
                }
                return true;
            }
        }
            
        return false;
    };

    this.update = function(portal,deltaTime) {
        this.lifeTime += deltaTime;
        this.timeSinceLastRust += deltaTime;
        var candidateFound = false;


        if (this.timeSinceLastRust > this.propagationSpeed)
        {
            this.timeSinceLastRust -= this.propagationSpeed;
            if (this.rustCandidates.length == 0)
            {
                //while (!candidateFound)
                {
                    var dir = getDirection(Math.floor(Math.random()*4));
                    var cellX = this.position.x + dir.x;
                    var cellY = this.position.y + dir.y;
                    candidateFound = this.makeRusty(portal,cellX,cellY);
                }
            }
            else if (portal.bonus.length != 0)
            {
                var weigthedCandidates = new Array();

                // create a weigthed array for candidates
                for (var c=0; c < this.rustCandidates.length; c++)
                {
                    weigthedCandidates.push(c);
                    var candidatePos = index2D(this.rustCandidates[c]);
                    for (var i=0; i < portal.bonus.length; i++)
                    {
                        var distance = portal.bonus.distance(candidatePos);
                        if (distance < 11)
                        {
                            for (var w=0; w < distance/2; w++)
                            {
                                weigthedCandidates.push(c);
                            }
                        }
                    }
                }

                var selectedCandidateId = weigthedCandidates[Math.floor(Math.random()*weigthedCandidates.length)];
                var selectedCandidate = index2D(this.rustCandidates[selectedCandidateId]);
                this.makeRusty(portal, selectedCandidate.x, selectedCandidate.y);
            }
            else
            {
                var selectedCandidate = index2D(this.rustCandidates[Math.floor(Math.random()*this.rustCandidates.length)]);
                this.makeRusty(portal, selectedCandidate.x, selectedCandidate.y);
            }
        }
    };

    this.isAlive = function() {
        // No more rust candidate == no rust
        return ((this.lifeTime < this.minLifeTime) 
            || (this.rustCandidates.length != 0));
    };


    //this.construct();
}


function Position(x, y)
{
    this.x = x;
    this.y = y;
}


function getImageArray(imageFilename)
{
    if(k_loadedImages[imageFilename] == undefined)
    {
        console.log("Loading.... (" + imageFilename + ")");
        var img = new Image();
        img.onload = extractLoadedImage;
        img.src = imageFilename;
        // wait
    }
    else
    {
        console.log("Return extracted Image");
        //console.log(k_loadedImages[imageFilename]);
    }


    return k_loadedImages[imageFilename];
}

getImageArray("Portail_A.Map.png");

function extractLoadedImage()
{
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var imgWidth = this.width;
    var imgHeight = this.height;

    context.drawImage(this,0,0);
    var imageData = context.getImageData(0,0,imgWidth,imgHeight);
    var data = imageData.data;

    var filename = this.src.substr(this.src.lastIndexOf("/")+1);
    k_loadedImages[filename] = data;

    console.log("Loaded image (" + filename + ")");
}

function Portal(bitmapFilename)
{
    this.epicenters = new Array();
    this.cells = new Array();
    this.bonus = new Array();

    this.construct = function(imgFilename) {
		console.log("k_PortalWidth:" + k_PortalWidth);
	
        for (var i=0; i < k_PortalWidth; i++)
        {
            this.cells[i] = new Array();
            for (var j=0; j < k_PortalWidth; j++)
            {
                this.cells[i][j] = k_CellEmpty;
            }
        }

        for (var i=0; i < 10; i++)
        {
            var epicenterPos = new Position(Math.floor(Math.random()*k_PortalWidth), Math.floor(Math.random()*k_PortalWidth));
            var ep = new Epicenter(i,epicenterPos);
            this.epicenters.push(ep);
        }

        var imgData = getImageArray("Portail_A.Map.png");

        for (var i=0; i < imgData.length; i+=4)
        {
            var index = i/4;

            var x = index % k_PortalWidth;
            var y = (index - x) / k_PortalWidth;

            if ( y == k_PortalWidth) break;

            console.log(imgData[i]);
            this.cells[y][x] = ( imgData[i] > 250 ) ? k_CellInvisible : k_CellEmpty ;
        }
    };

    this.update = function(deltaTime) {

        for (var i=0; i < this.epicenters.length; i++) {
            var ep = this.epicenters[i];
            if ( ep.isAlive() ) {
                ep.update(this,deltaTime);
            }
            else {
                var epicenterId = this.epicenters.indexOf(ep);
                this.epicenters.splice(epicenterId,1);
            }
        }
    };

    this.getCell1D = function(index) {
        var x = index % k_PortalWidth;
        var y = (index - x) / k_PortalWidth;

        return this.cells[y][x];
    };
	
	this.getSize = function() {
		return { "width" : this.cells[0].length, "height" : this.cells.length };
	}

    this.construct(bitmapFilename);
}

function Game()
{
    // Members---------------------------------------------------------
    this.time = 0;
    this.objectMode = 0;

    MODE_OIL = 0;
    MODE_DOG = 1;

    this.portal = null;
    

    // Constructors----------------------------------------------------
    this.construct = function() {
        this.portal = new Portal("Portail_A.Map.png");
    };

    // render game
    this.update = function(deltaTime) {
        this.portal.update(deltaTime);   
    };

    // render game
    this.display = function() {
        
    };

    // Put the game on pause
    this.pause = function() {
        console.log("Pause");
    };


    this.reset = function() {
        this.time = 0;
        console.log("reset");
    };

    // Call constructor
    this.construct();
}

function init()
{
    var g = new Game();
}