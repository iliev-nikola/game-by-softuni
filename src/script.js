const gameStart = document.querySelector('.game-start');
const gameArea = document.querySelector('.game-area');
const gameOver = document.querySelector('.game-over');
const gameScore = document.querySelector('.game-score');
const gamePoints = gameScore.querySelector('.points');
const playAgain = document.querySelector('.play-again');

gameStart.addEventListener('click', onGameStart);
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

const keys = {};
const player = {
    x: 150,
    y: 150,
    width: 0,
    height: 0,
    lastTimeFiredFireball: 0
};

const scene = {
    score: 0,
    lastCloudSpawn: 0,
    lastBugSpawn: 0,
    isActiveGame: true
};

const game = {
    speed: 2,
    movingMultiplier: 4,
    fireballMultiplier: 5,
    fireInterval: 1000,
    cloudSpawnInterval: 3000,
    bugSpawnInterval: 300,
    bugKillBonus: 100
};

const heroes = {
    'wizard': {
        'cloud': 'cloud',
        'weapon': 'fireball',
        'enemy': 'bug',
        'color': '#086faf;'
    },
    'kolyo': {
        'cloud': 'mountains',
        'weapon': 'stone',
        'enemy': 'snake',
        'color': '#3835ffb0'
    },
    'viki': {
        'cloud': 'cat',
        'weapon': 'stone',
        'enemy': 'frog',
        'color': '#7000d69e'
    },
    'tina': {
        'cloud': 'cake',
        'weapon': 'kiwi',
        'enemy': 'burger',
        'color': '#8c006e7d'
    },
    'pepi': {
        'cloud': 'jagermeister',
        'weapon': 'cup',
        'enemy': 'pill',
        'color': '#327d3cd1'
    }
}

let currentHero = '';

function gameAction(timestamp) {
    const wizard = document.querySelector(`.${currentHero}`);
    // score counter
    scene.score += 0.3;

    // Add bugs
    if (timestamp - scene.lastBugSpawn > game.bugSpawnInterval + 5000 * Math.random()) {
        const bug = document.createElement('div');
        bug.classList.add(heroes[currentHero].enemy);
        bug.x = gameArea.offsetWidth - 60;
        bug.style.left = bug.x + 'px';
        bug.style.top = (gameArea.offsetHeight - 60) * Math.random() + 'px';
        gameArea.appendChild(bug);
        scene.lastBugSpawn = timestamp;
    }

    // Modify bug positions
    const bugs = document.querySelectorAll(`.${heroes[currentHero].enemy}`);
    bugs.forEach(b => {
        b.x -= game.speed * 4;
        b.style.left = (b.x - 52) + 'px';
        if (b.x + b.offsetWidth <= 0) {
            b.remove();
        }
    });

    // Add clouds
    if (timestamp - scene.lastCloudSpawn > game.cloudSpawnInterval + 20000 * Math.random()) {
        const cloud = document.createElement('div');
        cloud.classList.add(heroes[currentHero].cloud);
        cloud.x = gameArea.offsetWidth - 200;
        cloud.style.left = cloud.x + 'px';
        cloud.style.top = (gameArea.offsetHeight - 200) * Math.random() + 'px';
        gameArea.appendChild(cloud);
        scene.lastCloudSpawn = timestamp;
    }

    // Modify cloud positions
    const clouds = document.querySelectorAll(`.${heroes[currentHero].cloud}`);
    clouds.forEach(c => {
        c.x -= game.speed;
        c.style.left = c.x + 'px';
        if (c.x + c.offsetWidth <= 0) {
            c.parentElement.removeChild(c);
        }
    });

    // Modify fireballs positions
    const fireballs = document.querySelectorAll(`.${heroes[currentHero].weapon}`);
    fireballs.forEach(f => {
        f.x += game.speed * game.fireballMultiplier;
        f.style.left = f.x + 'px';

        if (f.x + f.offsetWidth > gameArea.offsetWidth) {
            f.remove();
        }
    });

    // Apply gravity
    let isInAir = player.y + player.height < gameArea.offsetHeight;
    if (isInAir) {
        player.y += game.speed;
    }

    // Register user input
    // up
    if (keys.ArrowUp && player.y > 0) {
        player.y -= game.speed * game.movingMultiplier;
    }
    // down
    if (keys.ArrowDown && isInAir) {
        player.y += game.speed * game.movingMultiplier;
    }
    // left
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= game.speed * game.movingMultiplier;
    }
    // right
    if (keys.ArrowRight && player.x + player.width < gameArea.offsetWidth) {
        player.x += game.speed * game.movingMultiplier;
    }
    // space
    if (keys.Space && timestamp - player.lastTimeFiredFireball > game.fireInterval) {
        if (currentHero === 'wizard') {
            wizard.classList.add('wizard-fire');
        }

        addFireBall(player);
        player.lastTimeFiredFireball = timestamp;
    } else {
        if (currentHero === 'wizard') {
            wizard.classList.remove('wizard-fire');
        }
    }

    // Collision detection
    bugs.forEach(b => {
        if (isCollision(wizard, b)) {
            gameOverAction();
        }

        fireballs.forEach(f => {
            if (isCollision(f, b)) {
                f.remove();
                b.remove();
                scene.score += game.bugKillBonus;
            }
        })
    });

    // Apply movement
    wizard.style.left = player.x + 'px';
    wizard.style.top = player.y + 'px';

    // Apply score
    gamePoints.textContent = Math.floor(scene.score);

    // Apply background animation
    if (scene.isActiveGame) {
        window.requestAnimationFrame(gameAction);
    }
}

function gameOverAction() {
    scene.isActiveGame = false;
    gameOver.classList.remove('hide');
    playAgain.classList.remove('hide');
    playAgain.addEventListener('click', function (e) {
        e.preventDefault();
        location.reload();
    });
}

function isCollision(firstElement, secondElement) {
    const firstRect = firstElement.getBoundingClientRect();
    const secondRect = secondElement.getBoundingClientRect();

    return !(firstRect.top > secondRect.bottom || firstRect.bottom < secondRect.top || firstRect.right < secondRect.left || firstRect.left > secondRect.right);
}

function addFireBall(player) {
    const fireball = document.createElement('div');
    fireball.classList.add(heroes[currentHero].weapon);
    fireball.style.top = (player.y + player.height / 3 - 5) + 'px';
    fireball.x = (player.x + player.width);
    fireball.style.left = fireball.x + 'px';
    gameArea.appendChild(fireball);
}

function onKeyDown(e) {
    keys[e.code] = true;
}

function onKeyUp(e) {
    keys[e.code] = false;
}

function onGameStart(e) {
    currentHero = e.target.title.toLowerCase();
    gameStart.style.display = 'none';
    document.querySelector('.choose-hero').classList.add('hide');
    document.querySelector('.title').style.display = 'none';
    document.querySelector('.game-score').style.display = 'block';
    const hero = document.createElement('div');
    hero.classList.add(currentHero);
    hero.style.top = player.y + 'px';
    hero.style.left = player.x + 'px';
    gameArea.appendChild(hero);
    gameArea.style.backgroundColor = heroes[currentHero].color;
    player.width = hero.offsetWidth;
    player.height = hero.offsetHeight;

    window.requestAnimationFrame(gameAction);
}