$(".hello__how, .black").on("click", function () {
  $(".how, .black").toggleClass("hidden");
});

$(".hello__input").on("keyup", function () {
  if ($(this).val().length > 0) {
    $(".hello__button").attr("disabled", false);
  } else {
    $(".hello__button").attr("disabled", true);
  }
});

$(".hello__button").on("click", function () {
  $(".hello").html(`
    <video muted autoplay>
        <source src="img/video.mp4" type="video/mp4">
    </video>
    <button class="hello__start button">Начать</button>
    <script>
        $('.hello__start').on('click', function() {
            $('.hello').toggleClass('hidden')
            $('.game').toggleClass('hidden')
            startGame()
        })
    </script>
    `);
});

const startGame = () => {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  $(".game__background").css("background-position-x", "0px");
  $("canvas").css("left", "0px");

  const screenWidth = 1000;
  const width = 10000;
  const height = 500;

  const floorY = 340;

  let gus = 0;

  let health = 100;

  let pause = false;

  let left, right, top, bottom;
  let damageTimer;

  let mm = 0,
    ss = 0;

  const personIdle = "img/spritepumbaidle.png";
  const personLeft = "img/spritepumba2.png";
  const personRight = "img/spritepumba.png";

  $('.finish__button').on('click', function() {
    $('.game__finish').addClass('hidden')
    finish()
  })

  $(window).on("keydown", function (e) {
    if (e.keyCode == 27) {
      $(".game__pause").toggleClass("hidden");
      if (pause) {
        pause = false;
        game.render();
      } else {
        pause = true;
      }
    }
    if (e.keyCode == 65) {
      left = true;
    }
    if (e.keyCode == 68) {
      right = true;
    }
    if (e.keyCode == 87 && !top) {
      top = true;
    }
    if (e.keyCode == 83) {
      bottom = true;
    }
  });
  $(window).on("keyup", function (e) {
    if (e.keyCode == 65) {
      left = false;
    }
    if (e.keyCode == 68) {
      right = false;
    }
    if (e.keyCode == 83) {
      bottom = false;
    }
  });

  class Game {
    render() {
      this.clear();
      this.background();
      this.interface();
      tree.forEach((element) => {
        element.render();
      });
      enemies.forEach((element) => {
        element.render();
      });
      hero.move();
      hero.render();
      if (!pause) {
        window.requestAnimationFrame(() => this.render());
      }
      if (health <= 0) {
        pause = true
        $('.game__finish').removeClass('hidden')
      }
    }

    interface() {
      $(".gus").html(gus);
      $(".health").html(health);
    }

    clear() {
      ctx.clearRect(0, 0, width, height);
    }

    background() {
      if (hero.x > screenWidth / 2 && hero.x < width - screenWidth / 2) {
        $(".game__background").css(
          "background-position-x",
          hero.x - hero.x * 2 + 500
        );
        $("canvas").css("left", hero.x - hero.x * 2 + 500);
      }
    }
  }

  class Hero {
    constructor(imgIdle, imgLeft, imgRight, numberOfFrames) {
      this.x = 0;
      this.y = floorY;
      this.img = new Image();
      this.img.src = imgIdle;
      this.imgIdle = imgIdle;
      this.imgLeft = imgLeft;
      this.imgRight = imgRight;
      this.currentFrame = 1;
      this.numberOfFrames = numberOfFrames;
      this.frameRate = 0;
      this.jumped = false;
      this.downground = false;
      this.treeCollisionStatus = false;
      this.enemyCollisionStatus = false;
    }

    treeCollision() {
      for (const element of tree) {
        if (
          this.x > element.x - 50 &&
          this.x < element.x + 50 &&
          this.y < 250
        ) {
          this.treeCollisionStatus = true;
          if (!element.eaten) {
            health += 5;
            gus++;
            element.eaten = true;
          }
          break;
        } else {
          this.treeCollisionStatus = false;
        }
      }
    }

    enemyCollision() {
      for (const element of enemies) {
        if (
          this.x > element.x - 50 &&
          this.x < element.x + 50 &&
          this.y >= floorY - 80 &&
          this.y <= floorY
        ) {
          if (!damageTimer) {
            health -= 30;
            damageTimer = setInterval(() => {
              if (this.enemyCollisionStatus) {
                health -= 30;
              } else {
                clearInterval(damageTimer);
                damageTimer = undefined;
              }
            }, 1000);
          }
          this.enemyCollisionStatus = true;
          break;
        } else {
          this.enemyCollisionStatus = false;
        }
      }
    }

    move() {
      this.jump();
      this.down();
      this.gravity();
      this.treeCollision();
      this.enemyCollision();
      if (
        left &&
        !right &&
        this.x > 0 &&
        !this.downground &&
        this.y <= floorY
      ) {
        this.frame();
        this.img.src = this.imgLeft;
        this.x -= 5;
      } else {
        left = false;
      }
      if (
        right &&
        !left &&
        this.x < width &&
        !this.downground &&
        this.y <= floorY
      ) {
        this.frame();
        this.img.src = this.imgRight;
        this.x += 5;
      } else {
        right = false;
      }
      if (!left && !right) {
        this.img.src = this.imgIdle;
      }
    }

    jump() {
      if (top && this.y >= floorY) {
        this.jumped = true;
        this.downground = false;
      }

      if (this.jumped && this.y > 200) {
        this.y -= 5;
      } else {
        this.jumped = false;
        top = false;
      }
    }

    down() {
      if (bottom && this.y == floorY) {
        this.downground = true;
        this.jumped = false;
      }

      if (this.downground && this.y < 500) {
        this.y += 5;
      }
    }

    gravity() {
      if (
        this.y < floorY &&
        !this.jumped &&
        !this.downground &&
        !this.treeCollisionStatus
      ) {
        this.y += 5;
      }
    }

    render() {
      ctx.drawImage(
        this.img,
        left || right
          ? (this.img.width * this.currentFrame) / this.numberOfFrames
          : 0,
        0,
        left || right ? this.img.width / this.numberOfFrames : this.img.width,
        this.img.height,
        this.x,
        this.y,
        100,
        80
      );
    }

    frame() {
      if (this.currentFrame != this.numberOfFrames) {
        if (this.frameRate == 6) {
          this.frameRate = 0;
          this.currentFrame++;
        } else {
          this.frameRate++;
        }
      } else {
        this.frameRate = 0;
        this.currentFrame = 1;
      }
    }
  }

  class Enemy {
    constructor(x, imgLeft, imgRight, numberOfFrames) {
      this.x = x;
      this.y = floorY;
      this.img = new Image();
      this.img.src = imgRight;
      this.imgLeft = imgLeft;
      this.imgRight = imgRight;
      this.currentFrame = 1;
      this.numberOfFrames = numberOfFrames;
      this.frameRate = 0;
      this.direction = "right";
      this.startPos = 0;
    }

    move() {
      if (this.startPos == 50) {
        this.direction = "left";
        this.img.src = this.imgLeft;
      }
      if (this.startPos == -50) {
        this.direction = "right";
        this.img.src = this.imgRight;
      }
      if (this.direction == "right") {
        this.startPos++;
        this.x += 5;
      }
      if (this.direction == "left") {
        this.startPos--;
        this.x -= 5;
      }
    }

    render() {
      this.move();
      this.frame();
      ctx.drawImage(
        this.img,
        (this.img.width * this.currentFrame) / this.numberOfFrames,
        0,
        this.img.width / this.numberOfFrames,
        this.img.height,
        this.x,
        this.y,
        100,
        80
      );
    }

    frame() {
      if (this.currentFrame != this.numberOfFrames) {
        if (this.frameRate == 3) {
          this.frameRate = 0;
          this.currentFrame++;
        } else {
          this.frameRate++;
        }
      } else {
        this.frameRate = 0;
        this.currentFrame = 1;
      }
    }
  }

  class Tree {
    constructor(x) {
      this.x = x;
      this.y = floorY;
      this.img = new Image();
      this.img.src = "img/tree.png";
      this.foodImg = new Image();
      this.foodImg.src = "img/gus.png";
      this.empty = false;
    }

    render() {
      ctx.drawImage(
        this.img,
        0,
        0,
        this.img.width,
        this.img.height,
        this.x,
        floorY - 80,
        100,
        170
      );
      if (!this.eaten) {
        ctx.drawImage(
          this.foodImg,
          0,
          0,
          this.foodImg.width,
          this.foodImg.height,
          this.x + 20,
          floorY - 100,
          60,
          60
        );
      }
    }
  }

  const hero = new Hero(personIdle, personLeft, personRight, 10);
  let tree = [];
  let enemies = [];
  for (let index = 1; index <= 10; index++) {
    tree.push(new Tree(getRandomInt(900 * index, 1000 * index)));
  }
  for (let index = 1; index <= 10; index++) {
    enemies.push(
      new Enemy(
        getRandomInt(900 * index, 1000 * index),
        "img/enemy2.png",
        "img/enemy.png",
        13
      )
    );
  }

  const game = new Game();
  game.render();

  const timer = setInterval(() => {
    if (!pause) {
      ss++;
      health--;
      if (mm == 59) {
        mm = 0;
      }
      if (ss == 59) {
        ss = 0;
        mm++;
      }
      if (ss < 10) {
        $(".ss").html("0" + ss);
      } else {
        $(".ss").html(ss);
      }
      if (mm < 10) {
        $(".mm").html("0" + mm);
      } else {
        $(".mm").html(mm);
      }
    }
  }, 1000);

  function finish() {
    ss = 0
    health = 100
    pause = false
    mm = 0
    gus = 0
    score = 0
    hero.x = 0
    tree = [];
    enemies = [];
    for (let index = 1; index <= 10; index++) {
      tree.push(new Tree(getRandomInt(900 * index, 1000 * index)));
    }
    for (let index = 1; index <= 10; index++) {
      enemies.push(
        new Enemy(
          getRandomInt(900 * index, 1000 * index),
          "img/enemy2.png",
          "img/enemy.png",
          13
        )
      );
    }
    game.render();
    $(".game__background").css("background-position-x", "0px");
    $("canvas").css("left", "0px");
  }
};

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

startGame();