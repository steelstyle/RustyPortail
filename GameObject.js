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

function Epicenter(id,pos)
{
    // Epicenter id
    this.id = id;
    // Life time
    this.lifeTime = 0;
    // Minimal life time
    this.minLifeTime = 60000;

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
        if ((cellX >= 0) && (cellX < k_PortalWidth) && (cellY >= 0) && (cellY < k_PortalWidth)
            && (portal.cells[cellY][cellX] == k_CellEmpty))
        {
            this.rustCandidates.push(new Position(cellX,cellY));
            return true;
        }
        return false;
    };

    this.makeRusty = function(portal, cellX, cellY) {
        if ( (cellX >= 0) && (cellX < k_PortalWidth) && (cellY >= 0) && (cellY < k_PortalWidth)
            && (portal.cells[cellY][cellX] == k_CellEmpty))
        {
            portal.cells[cellY][cellX] = this.id;
            //TODO : test this function
            //var elemIdx = this.rustCandidates.indexOf(new Position(cellX,cellY));
            //this.rustCandidates.splice(elemIdx,1);

            for (var i=0; i < 4; i++)
            {
                var dir = getDirection(i);
                this.addRustCandidate(portal,cellX+dir.x,cellY+dir.y);
            }
            return true;
        }
        return false;
    };

    this.update = function(portal,deltaTime) {
        this.lifeTime += this.deltaTime;
        var candidateFound = false;

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
                var candidatePos = this.rustCandidates[c];
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
            var selectedCandidate = this.rustCandidates[selectedCandidateId];
            this.makeRusty(portal, selectedCandidate.x, selectedCandidate.y);
        }
        else
        {
            var selectedCandidate = this.rustCandidates[Math.floor(Math.random()*this.rustCandidates.length)];
            this.makeRusty(portal, selectedCandidate.x, selectedCandidate.y);
        }
    };

    this.isAlive = function() {
        // No more rust candidate == no rust
        return ((this.lifeTime < this.minLifeTime) 
            || (this.rustCandidates.length == 0));
    };


    //this.construct();
}


function Position(x, y)
{
    this.x = x;
    this.y = y;
}

k_CellInvisible = -2;
k_CellEmpty = -1;

k_PortalWidth = 80;

function Portal()
{
    this.epicenters = new Array();
    this.cells = new Array();
    this.bonus = new Array();

    this.construct = function() {
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
            var epicenterPos = new Position(Math.floor(Math.random()*80), Math.floor(Math.random()*80));
            var ep = new Epicenter(i,epicenterPos);
            this.epicenters.push(ep);
        }
    };

    this.update = function(deltaTime) {

        for (var i=0; i < this.epicenters.length; i++) {
            var ep = this.epicenters[i];
             ep.update(this,deltaTime);
            /*if ( ep.isAlive() ) {
                ep.update(this,deltaTime);
            }
            else {
                var epicenterId = this.epicenters.indexOf(ep);
                this.epicenters.splice(epicenterId,1);
            }*/
        }
    };

    this.getCell1D = function(index1D) {
        var x = index1D % k_PortalWidth;
        var y = (index1D - x) / k_PortalWidth;

        return this.cells[y][x];
    };

    this.construct();
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
        this.portal = new Portal();
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
        alert("Pause");
    };


    this.reset = function() {
        this.time = 0;
        alert("reset");
    };

    // Call constructor
    this.construct();
}

function init()
{
    var g = new Game();
}