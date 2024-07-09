class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        
        this.load.tilemapTiledJSON('map', 'assets/tilemap/tilemap.json');

        this.load.image('tiles', 'assets/tilemap/tileset.png');
                
        
        this.load.image('pinge', 'assets/images/pinge.png');
        this.load.image('collect', 'assets/images/milkbottle.png');
        
        this.load.audio('jumpSFX', 'assets/audio/sfx/jumpSFX.mp3');
        this.load.audio('winSFX', 'assets/audio/sfx/winSFX.mp3');
        this.load.audio('collectSFX', 'assets/audio/sfx/collectSFX.mp3');
        this.load.audio('gameoverSFX', 'assets/audio/sfx/gameoverSFX.mp3');
        this.load.audio('gameBGM', 'assets/audio/bgm/gameBGM.mp3');
    }

    create() {
        const map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tileset', 'tiles');
    
        const platformLayer = map.createLayer('platform', tileset, 0, 0);
        platformLayer.setCollisionByProperty({ collides: true });
    
        const waterLayer = map.createLayer('water', tileset);
        waterLayer.setCollisionByProperty({ collides: true });
    
        const collectiblesLayer = map.createLayer('milkbottle', tileset);
        collectiblesLayer.setTileIndexCallback([2], this.collectCollectible, this);
    
        this.gameBgm = this.sound.add('gameBGM', { loop: true, volume: 0.1 });
        this.gameBgm.play();
    
        this.physics.world.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.player = this.physics.add.sprite(100, 900, 'pinge');
        this.player.setScale(2);
        this.player.setCollideWorldBounds(true);
    
        this.physics.add.collider(this.player, platformLayer);
        this.physics.add.collider(this.player, waterLayer, this.playerCollideWater, null, this);
    
        this.physics.add.overlap(this.player, collectiblesLayer);
    
        this.score = 0;
        this.collectibleCount = 0;
    
        this.scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFFFFF' }).setScrollFactor(0);
        this.collectibleImage = this.add.image(40, 80, 'collect').setScrollFactor(0).setScale(0.05);
        this.collectibleText = this.add.text(70, 60, 'x 0', { fontSize: '32px', fill: '#FFFFFF' }).setScrollFactor(0);
    
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBackgroundColor('#301934'); 
    
        // Add cursor keys for player movement
        this.cursors = this.input.keyboard.createCursorKeys();
    }

    update() {
        if (this.cursors.left.isDown) {
            this.player.setVelocityX(-160);
            // Flip the image to face left
            this.player.flipX = true;
        }
        else if (this.cursors.right.isDown) {
            this.player.setVelocityX(160);
            // Ensure the image faces right
            this.player.flipX = false;
        }
        else {
            this.player.setVelocityX(0);
        }
        
        
        if (this.cursors.up.isDown && this.player.body.onFloor()) {
        const jumpSound = this.sound.add('jumpSFX');
        jumpSound.volume = 0.05;
        jumpSound.play();
    
    this.player.setVelocityY(-300);
        }
    }

    collectCollectible(player, tile) {
        console.log('Collectible touched');
    
        if (tile) {
            tile.tilemapLayer.removeTileAt(tile.x, tile.y);
    
            this.score += 10;
            this.scoreText.setText('Score: ' + this.score);
    
            this.collectibleCount += 1;
            this.collectibleText.setText('x ' + this.collectibleCount);
    
            const collectSound = this.sound.add('collectSFX');
            collectSound.volume = 0.5; 
            collectSound.play();
    
            const totalCollectibles = 5; // Change to 5 if you need to collect 5 milk bottles
            if (this.collectibleCount === totalCollectibles) {
                const winSound = this.sound.add('winSFX');
                winSound.volume = 0.5;
    
                this.gameBgm.stop();
                winSound.play();
    
                this.scene.start('GameScene2'); // Transition to GameScene2
            }
        }
    }
    

    playerCollideWater(player, water) {
        
        const gameOverSound = this.sound.add('gameoverSFX');
        gameOverSound.volume = 0.2; 
    
        this.gameBgm.stop();
        gameOverSound.play();
    
        this.scene.start('GameOverScene', { score: this.score });
    }
}

export default GameScene;