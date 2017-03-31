var App = function(){
    this.level = 1;
    this.heart = 3;
    this.points = 0;
    this.allItems = new Map();
    this.pause = false;
    this.allEnemies = [];
    this.player = new Player();
}

App.prototype.onStart = function(){
    var selected = null;
    $("#startModal").modal('show');
    $(".char-elem").click(function(){
        if(selected){
            selected.removeClass('char-selected');
        }
        app.player.sprite = $(this).attr('src');
        $(this).addClass('char-selected');
        selected = $(this);
    });
    $(".start").click(function(){
        app.allEnemies = [];
        app.allItems.clear();
        app.pause = false;
        var enemy = new Enemy();
        app.allEnemies.push(enemy);
    });
};

App.prototype.LevelUp = function(){
    var level = ++this.level;
    $('#level').text("Level "+ level);
    if(this.level<=8||(this.level>10&&this.level%3==0)){
        this.allEnemies.push(new Enemy());
    }
    if(this.level>=3&&this.level%3==0){
        var rock = new Rock();
        this.allItems.set(rock.key,rock);
    }
    if(this.level>=3&&this.level%3==1){
        var gem = new Gem();
        this.allItems.set(gem.key,gem);
    }
    if(this.level%5==0){
        var heart = new Heart();
        this.allItems.set(heart.key,heart);
    }

    if(this.level >= 20){
        app.pause = true;
        $('#winModal').modal('show');
        this.onRestart();
    }
};

App.prototype.onRestart = function(){
    $('.restart').click(function(){

        app.onStart();
        app.heart = 3;
        app.level = 1;
        app.points = 0;
        $('#hearts').text(app.heart+" Heart");
        $('#level').text("Level "+app.level);
        $('#points').text("points "+app.points);
    });
};

// Enemies our player must avoid
var Enemy = function(x,y,speed) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started
    this.X_INIT = 0;
    this.Y_INIT = Math.random()*184+50;
    this.SPEED = Math.random()*150+10*app.level;
    this.x = this.X_INIT;
    this.y = this.Y_INIT;
    this.speed = this.SPEED;
    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x += this.speed*dt;
    if(this.x>=1010){
        this.x = 0;
        this.y = Math.random()*184+50;
        this.speed = Math.random()*150+50;
    }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.

var Player = function(){
    this.X_INIT = 454.5;
    this.Y_INIT = 383;
    this.SPEED = 50.5;
    this.x = this.X_INIT;
    this.y = this.Y_INIT;
    this.x_move = 0;
    this.y_move = 0;
    this.speed = this.SPEED;
    this.sprite = 'images/char-boy.png';
};

Player.prototype.update = function(){
    var that = this;
    if(this.y<=-10){
        this.x = this.X_INIT;
        this.y = this.Y_INIT;
        app.LevelUp();
    }
    if(this.y>383) this.y = 383;
    if(this.x>909){
        this.x = 909;
    }else if(this.x<0){
        this.x = 0;
    }
    if(app.allItems.size>0){
        app.allItems.forEach(function(item){
            if(item.x==that.x&&Math.abs(item.y-that.y)<=10){

                if(item instanceof Rock){
                    that.x -=that.x_move;
                    that.y -=that.y_move;
                }else if(item instanceof Gem){
                    app.points += item.points;
                    $('#points').text(app.points+" pts");
                    app.allItems.delete(item.key);
                }else if(item instanceof Heart){
                    app.heart += 1;
                    $('#hearts').text(app.heart+" Heart");
                    app.allItems.delete(item.key);
                }
            }
        });
    }
}

Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite),this.x,this.y);
}

Player.prototype.handleInput = function(keyPress){
    this.x_move = 0;
    this.y_move = 0;
    switch(keyPress){
        case 'left': this.x-=this.speed;
            this.x_move = -this.speed;
            break;
        case 'right': this.x+=this.speed;
            this.x_move = this.speed;
            break;
        case 'up': this.y-=this.speed-20;
            this.y_move = -(this.speed-20);
            break;
        case 'down': this.y+=this.speed-20;
            this.y_move = (this.speed-20);
            break;
    }
    //console.log(this.x+" "+this.y);
}


var Item = function(){
    //this.x = this.getX;
    //this.y = this.getY;
    this.x = 101;
    this.y = 143;
    this.key = this.x+","+this.y;
    while(app.allItems.has(this.key)){
        this.x = this.getX();
        this.y = this.getY();
        this.key = this.x+","+this.y;
    }
}

Item.prototype.getX = function(){
    return Math.floor(Math.random()*10)*101;
}

Item.prototype.getY = function(){
    return Math.floor(Math.random()*3)*90+53;
}

Item.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite),this.x,this.y);
}

var Rock = function(){
    this.sprite = 'images/Rock.png';
    Item.call(this);
}
Rock.prototype = Object.create(Item.prototype);

var Gem = function(){
    this.getColor();
    Item.call(this);
}
Gem.prototype = Object.create(Item.prototype);

Gem.prototype.getColor = function(){
    var flag = Math.floor(Math.random()*3);
    switch(flag){
        case 0:
            this.sprite = 'images/Gem-Orange.png';
            this.points = 100;
            break;
        case 1:
            this.sprite = 'images/Gem-Green.png';
            this.points = 200;
            break;
        case 2:
            this.sprite = 'images/Gem-Blue.png';
            this.points = 300;
            break;
    }
}

var Heart = function(){
    this.sprite = 'images/Heart.png';
    Item.call(this);
}
Heart.prototype = Object.create(Item.prototype);
// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var app = new App();


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    if(e.keyCode===32){
        if(!app.pause){
            app.pause = true;
            $('#pauseModal').modal('show');
            app.onRestart();
        }else{
            app.pause = false;
            $('#pauseModal').modal('hide');
        }
    }
    if(!app.pause){
        app.player.handleInput(allowedKeys[e.keyCode]);
    }
});
