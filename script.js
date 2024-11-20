// Select the canvas element
const canvas = document.getElementById("myCanvas");
canvas.width = 500;
canvas.height = 500;
// Get the 2D drawing context
const ctx = canvas.getContext("2d");

class InputHandler{
    constructor(game){
        this.game = game
        window.addEventListener('keydown', e=>{
            if ( ( 
                    (e.key === 'ArrowUp') ||
                    (e.key === 'ArrowDown') 
                )
                && this.game.keys.indexOf(e.key) === -1){
                this.game.keys.push(e.key)
            }else if(e.key=== ' '){
                this.game.player.shootTop()
            }
        })

        window.addEventListener('keyup', e=> {
            if (this.game.keys.indexOf(e.key) > -1) {
                this.game.keys.splice(this.game.keys.indexOf(e.key), 1)
            }
        })
    }   
}

class Projectile {
    constructor(game, x, y){
        this.game = game
        this.x = x
        this.y = y
        this.width = 10
        this.height = 3
        this.speed = 3
        this.markForDeletion = false
    }

    update(){
        this.x += this.speed
        if (this.x > this.game.width * 0.8) this.markForDeletion = true 
    }

    draw(context){
        context.fillStyle ='yellow'
        context.fillRect(this.x, this.y, this.width, this.height)
    }
}

class Player {
    constructor(game){
        this.game = game
        this.width = 100
        this.height = 190
        this.x=20
        this.y=100
        this.speedY=2
        this.maxSpeed=5
        this.projectiles=[]
    }

    update(){
        if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed
        else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed
        else this.speedY = 0
        this.y += this.speedY
        this.projectiles.forEach(projectile =>{
            projectile.update()
        })
        this.projectiles = this.projectiles.filter(projectile => !projectile.markForDeletion)
    }
    draw(context){
        context.fillStyle = 'white'
        context.fillRect(this.x, this.y, this.width, this.height)
        this.projectiles.forEach(projectile => {
            projectile.draw(context)
        })
    }

    shootTop(){
        if(this.game.ammo > 0){
            this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30))
            this.game.ammo--
        }
    }
}

class Enemy {
    constructor(game){
        this.game =  game
        this.x  = this.game.width
        this.speedX = Math.random() * -1.5 - 0.5
        this.markForDeletion = false
        this.lives=5
        this.score = this.lives
    }

    update(){
        this.x += this.speedX
        if (this.x + this.width < 0) this.markForDeletion = true
    }

    draw(context){
        context.fillStyle = 'red'
        context.fillRect(this.x, this.y, this.width, this.height)

        context.fillStyle = 'black'
        context.font = '20px Helvetica'
        context.fillText(this.lives, this.x, this.y)
    }
}

class Angler1 extends Enemy{
    constructor(game){
        super(game)
        this.width = 228 * .2
        this.height = 169 * .2
        this.y =  Math.random() * (this.game.height  * 0.9 - this.height)
    }
}

class Layer {

}

class Background {

}


class UI {
    constructor(game){
        this.game = game
        this.fontSize = '15'
        this.fontFamily = 'Helvetica'
        this.color = 'white '
    }
    draw(context){
        context.save()
        context.fillStyle=this.color
        context.shadowOffsetX = 2
        context.shadowOffsetY = 2
        context.shadowColor = 'black'
        context.font =  this.fontSize + 'px ' + this.fontFamily
        context.fillText('Score: '+ this.game.score, 20, 40)
        for (let i = 0; i < this.game.ammo; i++){
            context.fillRect(20 + 5  * i, 50, 4, 20)
        }
        const formatedTime = (this.game.gameTime * 0.001). toFixed(1)
        context.fillText('Time: ' + formatedTime, 20, 90)
        if(this.game.gameOver){
            context.textAlign = 'center'
            let message1;
            let message2;
            if (this.game.score > this.game.winningScore){
                message1 = 'You Won!'
                message2 = 'Your score: ' + this.game.score
            }else{
                message1 = 'Game Over'
                message2 = 'Try Again'
            }
        
            
            context.font = '40px '+ this.fontFamily
            context.fillText(message1, this.game.width * .5, this.game.height * .5 - 40)

            context.font = '20px ' + this.fontFamily
            context.fillText(message2, this.game.width * .5, this.game.height * .5 + 40)
        }
        context.restore()
    }
}

class Game {
    constructor(width, height){
        this.width=width
        this.height = height
        this.player = new Player(this)
        this.input = new InputHandler(this)
        this.ui = new UI(this)
        this.ammo = 30
        this.ammoMax = 100
        this.ammoTimer = 0
        this.ammoInterval = 500
        this.enemyTimer = 0
        this.enemyInterval = 1000
        this.keys = []
        this.enemies = []
        this.score=0
        this.winningScore=20
        this.gameOver = false
        this.gameTime=0
        this.timeLimit=5000
    }

    update(deltaTime){
        if(!this.gameOver) this.gameTime += deltaTime
        if(this.gameTime > this.timeLimit) this.gameOver = true
        this.player.update()          
        if (this.ammoTimer > this.ammoInterval){
            if(this.ammo < this.ammoMax) this.ammo++
            this.ammoTimer = 0
        }else{
            this.ammoTimer += deltaTime 
        }

        this.enemies.forEach(enemy =>{
            enemy.update()
            if (this.collisionCheck(this.player, enemy)) {
                enemy.markForDeletion = true
            }
            this.player.projectiles.forEach(projectile => {
                if (this.collisionCheck(projectile, enemy)) {
                    enemy.lives--
                    projectile.markForDeletion = true
                    if(enemy.lives <= 0){
                        enemy.markForDeletion = true
                        if(!this.gameOver) this.score += enemy.score
                        if(this.score > this.winningScore) this.gameOver = true
                    }

                }
            })   
        })

        this.enemies = this.enemies.filter(enemy=> !enemy.markForDeletion)

        if (this.enemyTimer > this.enemyInterval && !this.gameOver) {
            this.addEnemy()
            this.enemyTimer = 0
        }else{
            this.enemyTimer += deltaTime 
        }
    }
    draw(context){
        this.player.draw(context)
        this.ui.draw(context)
        this.enemies.forEach(enemy => {
            enemy.draw(context)
        })
    }
    addEnemy(){
        this.enemies.push(new Angler1(this))
    }

    collisionCheck(rect1, rect2){
        return(
            rect1.x < rect2.x +rect2.width && 
            rect1.x + rect1.width > rect2.x &&
            rect1.y < rect2.y + rect2.height &&
            rect1.y + rect1.height > rect2.y
        )
    }
}

const game = new Game(canvas.width, canvas.height)
let lastTime=0

// animation loop
function animate(timeStamp) {
    const deltaTime = timeStamp - lastTime
    lastTime = timeStamp
    ctx.clearRect(0,0,canvas.width,canvas.height)
    game.update(deltaTime)
    game.draw(ctx)
    requestAnimationFrame(animate)
}

requestAnimationFrame(animate)