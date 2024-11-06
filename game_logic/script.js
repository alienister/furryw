// Define the game object
var gameObj = {
  // Points object to keep track of score, history, and status
  points: {
    score: 0,
    highScore: 0,
    history: [],
    status: 1,
  },
  // Stage array to represent the game grid
  stage: [],
  // Function to initialize the game stage
  intiStage: function () {
    // Loop through each cell in the 4x4 grid
    for (var cell = 0; cell < 4; cell++) {
      this.stage[cell] = [];
      for (var row = 0; row < 4; row++) {
        // Initialize each cell with a box object and its position
        this.stage[cell][row] = {
          boxObj: null,
          position: [cell, row],
        };
      }
    }
  },

  // Function to get a list of empty cells
  empty: function () {
    var emptyList = [];
    for (var row = 0; row < 4; row++) {
      for (var cell = 0; cell < 4; cell++) {
        // If the cell is empty, add it to the empty list
        if (this.stage[cell][row].boxObj == null) {
          emptyList.push(this.stage[cell][row]);
        }
      }
    }
    return emptyList;
  },
  // Function to create a new box in a random empty cell
  newBox: function () {
    var _this = this;

    // Box constructor function
    var box = function (obj) {
      // Randomly assign a value of 2 or 4 to the box
      var num = Math.random() > 0.9 ? 4 : 2;
      this.value = num;
      this.parent = obj;
      // Create a DOM element for the box
      this.domObj = (function () {
        var domBox = document.createElement("span");
        // domBox.innerText = num; // disabled @Edit
        // domBox.textContent = num; // disabled @Edit
        domBox.className =
          "row" + obj.position[0] + " cell" + obj.position[1] + " num" + num;
        var root = document.getElementById("stage");
        root.appendChild(domBox);
        return domBox;
      })();
      obj.boxObj = this;
    };
    // Get the list of empty cells
    var emptyList = this.empty();
    if (emptyList.length) {
      // Choose a random empty cell and place a new box there
      var randomIndex = Math.floor(Math.random() * emptyList.length);
      new box(emptyList[randomIndex]);
      return true;
    }
  },
  // Function to check if the game has ended
  isEnd: function () {
    var emptyList = this.empty();
    if (!emptyList.length) {
      // Check if there are no more moves left
      for (var i = 0; i < 4; i++) {
        for (var j = 0; j < 4; j++) {
          var obj = this.stage[i][j];
          var objLeft =
            j == 0 ? { boxObj: { value: 0 } } : this.stage[i][j - 1];
          var objRight =
            j == 3 ? { boxObj: { value: 0 } } : this.stage[i][j + 1];
          var objUp = i == 0 ? { boxObj: { value: 0 } } : this.stage[i - 1][j];
          var objDown =
            i == 3 ? { boxObj: { value: 0 } } : this.stage[i + 1][j];
          if (
            obj.boxObj.value == objLeft.boxObj.value ||
            obj.boxObj.value == objDown.boxObj.value ||
            obj.boxObj.value == objRight.boxObj.value ||
            obj.boxObj.value == objUp.boxObj.value
          ) {
            return false;
          }
        }
      }
      return true;
    }
    return false;
  },
  // Function to display game over message
  gameOver: function () {
    alert("Oopsie-woopsie! Game over! 😿 uwu");
    // Save the highScore to local storage
    this.history.push(this.points.score);
    var highScore = localStorage.getItem("highScore");
    if (highScore == null || this.points.score > highScore) {
      localStorage.setItem("highScore", this.points.score);
    }
    // Reset the game
    this.points.score = 0;
    this.points.status = 1;
    this.intiStage();
    this.newBox();
  },
  // Function to move a box from one cell to another
  moveTo: function (obj1, obj2) {
    obj2.boxObj = obj1.boxObj;
    obj2.boxObj.domObj.className =
      "row" +
      obj2.position[0] +
      " " +
      "cell" +
      obj2.position[1] +
      " " +
      "num" +
      obj2.boxObj.value;
    obj1.boxObj = null;
  },
  // Function to add the value of one box to another
  addTo: function (obj1, obj2) {
    obj2.boxObj.domObj.parentNode.removeChild(obj2.boxObj.domObj);
    obj2.boxObj = obj1.boxObj;
    obj1.boxObj = null;
    obj2.boxObj.value = obj2.boxObj.value * 2;
    obj2.boxObj.domObj.className =
      "row" +
      obj2.position[0] +
      " cell" +
      obj2.position[1] +
      " num" +
      obj2.boxObj.value;
    // obj2.boxObj.domObj.innerText = obj2.boxObj.value;
    // obj2.boxObj.domObj.textContent = obj2.boxObj.value;
    this.points.score += obj2.boxObj.value;
    var scoreBar = document.getElementById("score");
    var highScoreBar = document.getElementById("highScore");

    scoreBar.innerText = this.points.score;
    scoreBar.textContent = this.points.score;

    if (this.points.score > parseInt(highScoreBar.innerText)) {
      highScoreBar.innerText = this.points.score;
      highScoreBar.textContent = this.points.score;

      // Save the highScore to local storage
      localStorage.setItem("highScore", this.points.score);
    }

    return obj2.boxObj.value;
  },
  // Function to clear the grid in a specific direction
  clear: function (x, y) {
    var can = 0;
    for (var i = 0; i < 4; i++) {
      var fst = null;
      var fstEmpty = null;
      for (var j = 0; j < 4; j++) {
        var objInThisWay = null;
        switch ("" + x + y) {
          case "00":
            objInThisWay = this.stage[i][j];
            break;
          case "10":
            objInThisWay = this.stage[j][i];
            break;
          case "11":
            objInThisWay = this.stage[3 - j][i];
            break;
          case "01":
            objInThisWay = this.stage[i][3 - j];
            break;
        }
        if (objInThisWay.boxObj != null) {
          if (fstEmpty) {
            this.moveTo(objInThisWay, fstEmpty);
            fstEmpty = null;
            j = 0;
            can = 1;
          }
        } else if (!fstEmpty) {
          fstEmpty = objInThisWay;
        }
      }
    }
    return can;
  },

  // Function to move boxes in a specific direction
  move: function (x, y) {
    var can = 0;
    can = this.clear(x, y) ? 1 : 0;
    var add = 0;
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 3; j++) {
        var objInThisWay = null;
        var objInThisWay2 = null;
        switch ("" + x + y) {
          case "00": {
            objInThisWay = this.stage[i][j];
            objInThisWay2 = this.stage[i][j + 1];
            break;
          }
          case "10": {
            objInThisWay = this.stage[j][i];
            objInThisWay2 = this.stage[j + 1][i];
            break;
          }

          case "11": {
            objInThisWay = this.stage[3 - j][i];
            objInThisWay2 = this.stage[2 - j][i];
            break;
          }
          case "01": {
            objInThisWay = this.stage[i][3 - j];
            objInThisWay2 = this.stage[i][2 - j];
            break;
          }
        }
        if (
          objInThisWay2.boxObj &&
          objInThisWay.boxObj.value == objInThisWay2.boxObj.value
        ) {
          add += this.addTo(objInThisWay2, objInThisWay);
          this.clear(x, y);
          can = 1;
        }
      }
    }
    if (add) {
      let comment = "";
      var addscore = document.getElementById("addScore");
      if (add <= 4) {
        displayFlashyComment("Pawsitively adorable!");
      } else if (add <= 8) {
        displayFlashyComment("Fur-tastic!");
      } else if (add <= 16) {
        displayFlashyComment("Clawsome score!");
      } else if (add <= 32) {
        displayFlashyComment("You're on a wild streak!");
      } else if (add <= 64) {
        displayFlashyComment("Roaring to the top!");
      } else if (add <= 128) {
        displayFlashyComment("Unleashing the beast!");
      } else if (add <= 256) {
        displayFlashyComment("Tail-tastic moves!");
      } else if (add <= 512) {
        displayFlashyComment("You're practically howling with power!");
      } else if (add <= 1024) {
        displayFlashyComment("Apex predator! Look at you go!");
      } else if (add <= 2048) {
        displayFlashyComment("Furry royalty! All bow to the champion!");
      } else {
        displayFlashyComment("Ultimate Alpha! Fierce and fabulous!");
      }

      addscore.innerText = "+" + add + " " + comment;
      addscore.textContent = "+" + add + " " + comment;
      addscore.className = "show";
      setTimeout(function () {
        addscore.className = "hide";
      }, 500);
    }
    if (can) {
      this.newBox();
    }
    if (this.isEnd()) {
      this.gameOver();
    }
  },

  // Initialize the game
  inti: null,
};

// Controller object to handle user input
var controller = (function () {
  var startX = 0;
  var startY = 0;
  var ready = 0;
  // Function to start tracking user input
  this.start = function (x, y) {
    ready = 1;
    startX = x;
    startY = y;
  };
  // Function to handle user movement
  this.move = function (x, y) {
    if (x - startX > 100 && ready) {
      gameObj.move(0, 1);
      ready = 0;
    } else if (startX - x > 100 && ready) {
      gameObj.move(0, 0);
      ready = 0;
    } else if (startY - y > 100 && ready) {
      gameObj.move(1, 0);
      ready = 0;
    } else if (y - startY > 100 && ready) {
      gameObj.move(1, 1);
      ready = 0;
    }
  };
  // Function to stop tracking user input
  this.end = function (x, y) {
    ready = 0;
  };
  return {
    start: this.start,
    move: this.move,
    end: this.end,
  };
})();

// Function to disable text selection on the page
function disableSelection(target) {
  if (typeof target.onselectstart != "undefined")
    target.onselectstart = function () {
      return false;
    };
  else if (typeof target.style.MozUserSelect != "undefined")
    target.style.MozUserSelect = "none";
  else
    target.onmousedown = function () {
      return false;
    };
  target.style.cursor = "default";
}

// Initialize the game when the window loads
window.onload = function () {
  gameObj.intiStage();
  gameObj.newBox();
  var cover = document.querySelector(".cover");

  // Initialize high score from localStorage
  var highScore = localStorage.getItem("highScore");
  if (highScore === null) {
    localStorage.setItem("highScore", 0);
    highScore = 0;
  }
  document.getElementById("highScore").innerText = highScore;

  // Add touch controls on the cover layer for swipe detection
  cover.addEventListener("touchstart", function (event) {
    var touch = event.touches[0];
    controller.start(touch.pageX, touch.pageY);
  });

  cover.addEventListener("touchmove", function (event) {
    var touch = event.touches[0];
    controller.move(touch.pageX, touch.pageY);
  });

  cover.addEventListener("touchend", function () {
    controller.end();
  });

  // Handle key up event for keyboard controls
  function keyUp(e) {
    var currKey = 0,
      e = e || event;
    currKey = e.keyCode || e.which || e.charCode;
    switch (currKey) {
      case 37:
        gameObj.move(0, 0); // Left
        break;
      case 38:
        gameObj.move(1, 0); // Up
        break;
      case 39:
        gameObj.move(0, 1); // Right
        break;
      case 40:
        gameObj.move(1, 1); // Down
        break;
    }
  }
  document.onkeyup = keyUp;
};

function displayFlashyComment(text) {
  const commentElement = document.createElement("div");
  commentElement.className = "fullscreen-comment";
  commentElement.textContent = text;

  // Generate random positions within the viewport
  const randomTop = Math.random() * (window.innerHeight - 100) + "px";
  const randomLeft = Math.random() * (window.innerWidth - 100) + "px";

  // Apply random positions
  commentElement.style.top = randomTop;
  commentElement.style.right = randomLeft;

  document.body.appendChild(commentElement);

  // Remove the element after the animation completes
  setTimeout(() => {
    document.body.removeChild(commentElement);
  }, 1500); // Duration matches the CSS animation
}

// log cloudflare turso AUTH_URL env var
console.log("TURSO_URL", env.TURSO_URL);