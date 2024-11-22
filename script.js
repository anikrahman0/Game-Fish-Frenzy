// Select the canvas element
const canvas = document.getElementById("myCanvas");
canvas.width = 900;
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
            } else if (e.key === 'd') {
                this.game.debug = !this.game.debug
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
        this.image = document.getElementById('projectile') 
        this.powerUpImage = document.getElementById('powerup') 
    }

    update(){
        this.x += this.speed
        if (this.x > this.game.width * 0.8) this.markForDeletion = true 
    }

    draw(context){
        // context.fillStyle ='yellow'
        // context.fillRect(this.x, this.y, this.width, this.height)
        if(this.game.player.powerUp){
            context.drawImage(this.powerUpImage, this.x, this.y)
        }else{
            context.drawImage(this.image, this.x, this.y)
        }
    }
}

class Particle{
    constructor(game, x, y){
        this.game = game
        this.x = x
        this.y = y
        this.image = document.getElementById('gears')
        this.frameX = Math.floor(Math.random() * 3)
        this.frameY = Math.floor(Math.random() * 3)
        this.spriteSize = 50
        this.sizeModifier = (Math.random() * 0.5 + 0.5).toFixed(1)
        this.size = this.spriteSize * this.sizeModifier
        this.speedX = Math.random() * 6 - 3
        this.speedY = Math.random() * -15
        this.gravity = 0.5
        this.markForDeletion = false
        this.angle = 0
        this.va = Math.random() * 0.2 - 0.1
        this.bounced = 0
        this.bottomBounceBoundary = Math.random() * 100 + 60
    }

    update(){
        this.angle += this.va
        this.speedY += this.gravity
        this.x -= this.speedX
        this.y += this.speedY
        if(this.y > this.game.height + this.size || this.x < 0 - this.size){
            this.markForDeletion = true
        }
        if (this.y > this.game.height - this.bottomBounceBoundary && this.bounced < 2){
            this.bounced ++
            this.speedY *= -0.7
        }
    }
    draw(context){
        context.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize ,this.x, this.y, this.size, this.size)
    }
}

class Player {
    constructor(game){
        this.game = game
        this.width = 120
        this.height = 190
        this.x=20
        this.y=100
        this.speedY=2
        this.maxSpeed=5
        this.projectiles=[]
        this.image = document.getElementById('player')
        this.frameX = 0
        this.frameY = 0
        this.maxFrame = 37
        this.powerUp = false
        this.powerUpTimer = 0
        this.powerUpLimit = 10000
    }

    update(deltaTime){
        if (this.game.keys.includes('ArrowUp')) this.speedY = -this.maxSpeed
        else if (this.game.keys.includes('ArrowDown')) this.speedY = this.maxSpeed
        else this.speedY = 0
        this.y += this.speedY
        if(this.y  >  this.game.height - this.height * 0.5){
            this.y = this.game.height - this.height * 0.5
        }else if(this.y < -this.height * 0.5){
            this.y = -this.height * 0.5
        }
        this.projectiles.forEach(projectile =>{
            projectile.update()
        })
        this.projectiles = this.projectiles.filter(projectile => !projectile.markForDeletion)
        // sprite animation
        if (this.frameX < this.maxFrame){
            this.frameX ++
        }else{
            this.frameX = 0
        }
        // power up
        if (this.powerUp){
            if(this.powerUpTimer > this.powerUpLimit){
                this.powerUpTimer = 0
                this.powerUp = false
                this.frameY = 0
            }else{
                this.powerUpTimer += deltaTime
                this.frameY = 1
                this.game.ammo += 0.1
            }
        }
    }
    draw(context){
        // context.fillStyle = 'white'
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height)
        this.projectiles.forEach(projectile => {
            projectile.draw(context)
        })
        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
    }

    shootTop(){
        if(this.game.ammo > 0){
            this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 30))
            this.game.ammo--
        }
        if(this.powerUp){
            this.shootBottom()
        }
    }

    shootBottom() {
        if (this.game.ammo > 0) {
            this.projectiles.push(new Projectile(this.game, this.x + 80, this.y + 175))
        }
    }

    enterPowerUp(){
        this.powerUpTimer  = 0
        this.powerUp = true
        this.game.ammo = this.game.ammoMax
    }
}

class Enemy {
    constructor(game){
        this.game =  game
        this.x  = this.game.width
        this.speedX = Math.random() * -1.5 - 0.5
        this.markForDeletion = false
        this.frameX =0
        this.frameY =0
        this.maxFrame = 37
    }

    update(){
        this.x += this.speedX - this.game.speed
        if (this.x + this.width < 0) this.markForDeletion = true

        // sprite animation
        if (this.frameX < this.maxFrame) {
            this.frameX++
        } else {
            this.frameX = 0
        }
    }

    draw(context){
        if (this.game.debug) context.strokeRect(this.x, this.y, this.width, this.height)
        context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height)
        context.fillStyle = 'yellow'
        context.font = '20px Bangers'
        if (this.game.debug)  context.fillText(this.lives, this.x, this.y)
    }
}

class Angler1 extends Enemy{
    constructor(game){
        super(game)
        this.width = 228
        this.height = 169
        this.y =  Math.random() * (this.game.height  * 0.9 - this.height)
        this.image = document.getElementById('angler1')
        this.frameY = Math.floor(Math.random() * 3)
        this.lives = 2
        this.score = this.lives
    }
}

class Angler2 extends Enemy {
    constructor(game) {
        super(game)
        this.width = 213
        this.height = 165
        this.y = Math.random() * (this.game.height * 0.9 - this.height)
        this.image = document.getElementById('angler2')
        this.frameY = Math.floor(Math.random() * 2)
        this.lives = 3
        this.score = this.lives
    }
}

class LuckyFish extends Enemy {
    constructor(game) {
        super(game)
        this.width = 99
        this.height = 95
        this.y = Math.random() * (this.game.height * 0.9 - this.height)
        this.image = document.getElementById('lucky')
        this.frameY = Math.floor(Math.random() * 2)
        this.lives = 3
        this.score = 15
    }
}

class Layer {
    constructor(game, image, speedModifier){
        this.game = game
        this.image = image
        this.speedModifier = speedModifier
        this.width = 1768
        this.height = 500
        this.x = 0
        this.y = 0
    }
    update() {
        if (this.x <= -this.width) this.x = 0
        this.x -= this.game.speed * this.speedModifier
    }
    draw(context){
        context.drawImage(this.image, this.x, this.y)
        context.drawImage(this.image, this.x + this.width, this.y)
    }
}

class Background {
    constructor(game){
        this.game = game
        this.image1 = document.getElementById('layer1')
        this.image2 = document.getElementById('layer2')
        this.image3 = document.getElementById('layer3')
        this.image4 = document.getElementById('layer4')
        this.layer1 = new Layer(this.game, this.image1, 0.2)
        this.layer2 = new Layer(this.game, this.image2, 0.4)
        this.layer3 = new Layer(this.game, this.image3, 1)
        this.layer4 = new Layer(this.game, this.image4, 1.5)
        this.layers = [this.layer1, this.layer2, this.layer3]  
    }
    update(){
        this.layers.forEach(layer=>layer.update())
    }
    draw(context){
        this.layers.forEach(layer => layer.draw(context))
    }
}


class UI {
    constructor(game){
        this.game = game
        this.fontSize = '15'
        this.fontFamily = 'Bangers'
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
        
            
            context.font = '70px '+ this.fontFamily
            context.fillText(message1, this.game.width * .5, this.game.height * .5 - 20)

            context.font = '25px ' + this.fontFamily
            context.fillText(message2, this.game.width * .5, this.game.height * .5 + 20)
        }
        if (this.game.player.powerUp) context.fillStyle = '#ffffbd'
        for (let i = 0; i < this.game.ammo; i++) {
            context.fillRect(20 + 5 * i, 50, 4, 20)
        }
        context.restore()
    }
}

class Game {
    constructor(width, height){
        this.width=width
        this.height = height
        this.background = new Background(this)
        this.player = new Player(this)
        this.input = new InputHandler(this)
        this.ui = new UI(this)
        this.ammo = 30
        this.ammoMax = 50
        this.ammoTimer = 0
        this.ammoInterval = 500
        this.enemyTimer = 0
        this.enemyInterval = 1000
        this.keys = []
        this.enemies = []
        this.particles = []
        this.score= 0
        this.winningScore= 50
        this.gameOver = false
        this.gameTime = 0
        this.timeLimit = 1000 * 60 * 2
        this.speed = 1
        this.debug = false
    }

    update(deltaTime){
        if(!this.gameOver) this.gameTime += deltaTime
        if(this.gameTime > this.timeLimit) this.gameOver = true
        this.background.update()
        this.background.layer1.update()
        this.player.update(deltaTime)          
        if (this.ammoTimer > this.ammoInterval){
            if(this.ammo < this.ammoMax) this.ammo++
            this.ammoTimer = 0
        }else{
            this.ammoTimer += deltaTime 
        }
        this.particles.forEach(particle => particle.update())
        this.particles = this.particles.filter(particle => !particle.markForDeletion)
        this.enemies.forEach(enemy =>{
            enemy.update()
            if (this.collisionCheck(this.player, enemy)) {
                enemy.markForDeletion = true
                for (let i = 0; i < 10; i++) {
                    this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))
                }
                if(enemy.type = 'lucky') this.player.enterPowerUp()
                else this.score--
            }
            this.player.projectiles.forEach(projectile => {
                if (this.collisionCheck(projectile, enemy)) {
                    enemy.lives--
                    projectile.markForDeletion = true
                    this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))
                    if(enemy.lives <= 0){
                        enemy.markForDeletion = true
                        for (let i = 0; i < 10; i++) {
                            this.particles.push(new Particle(this, enemy.x + enemy.width * 0.5, enemy.y + enemy.height * 0.5))
                        }
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
        this.background.draw(context)
        this.player.draw(context)
        this.ui.draw(context)
        this.particles.forEach(particle => particle.draw(context))
        this.enemies.forEach(enemy => { enemy.draw(context) })
        this.background.layer4.draw(context)
    }
    addEnemy(){
        const randomize = Math.random()
        if(randomize < 0.5) {
            this.enemies.push(new Angler1(this))
        } else if(randomize < 0.6){
            this.enemies.push(new Angler2(this))
        }else{
            this.enemies.push(new LuckyFish(this))
        }
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