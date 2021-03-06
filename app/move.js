const k = require("./keys");
const g = require("./grid");
const t = require("./target");
const s = require("./self");
const p = require("./params");
const search = require("./search");
const log = require("./logger");
const astar = require("./astar");
const u = require("./utils");
// const graph = require("./graph");


// target closest reachable food
const eat = (staySafe, grid, data) => {
  let scores = [0, 0, 0, 0];
  const myHead = s.location(data);
  const myHealth = data.you.health;

  let urgencyScore = Math.round((101 - myHealth) * p.FEEDING_URGENCY_MULTIPLIER);
  const distanceToClosestFood = t.distanceToFoodInFoodList(myHead, data);
  let behaviour = k.EATING;
  let emergency = (distanceToClosestFood >= myHealth || myHealth < (p.SURVIVAL_MIN - 5));
  log.status(`EATING w/ urgency ${urgencyScore} ${emergency ? ", EMERGENCY!" : ""}`);

  // if emergency look for closest foods in data list
  if (emergency) {
    try {
      behaviour = k.EATING_EMERGENCY;
      scores = search.foodScoresFromData(urgencyScore, grid, data);
    }
    catch (e) { log.error(`ex in move.eat.emergency: ${e}`, data.turn); }
  }
  // if not emergency use foods marked in grid
  else {
    try {
      scores = search.foodScoresFromGrid(urgencyScore, grid, data);
    }
    catch (e) { log.error(`ex in move.eat.non-emergency: ${e}`, data.turn); }
  }
  return buildMove(scores, staySafe, behaviour, grid, data);
};
 

// track closest KILL_ZONE
const hunt = (staySafe, grid, data) => {
  let scores = [0, 0, 0, 0];
  log.status("HUNTING");
  try {
    scores = search.closeAccessableKillZoneFarFromWall(grid, data);
  }
  catch (e) { log.error(`ex in move.hunt: ${e}`, data.turn); }
  return buildMove(scores, staySafe, k.HUNTING, grid, data);
};


const lateHunt = (staySafe, grid, data) => {
  let scores = [0, 0, 0, 0];
  log.status("HUNTING, LATE GAME");
  try {
    if (s.existsSmallerSnake(data)) {
      scores = search.closeAccessableKillZoneFarFromWall(grid, data);
    }
    else {
      scores = search.closeAccessableFuture2FarFromWall(grid, data);
    }
  }
  catch (e) { log.error(`ex in move.lateHunt: ${e}`, data.turn); }
  return buildMove(scores, staySafe, k.LATE_HUNTING, grid, data);
};


// track own tail
const killTime = (staySafe, grid, data) => {
  log.status("KILLING TIME");
  // rely on default move in buildMove
  return buildMove([0, 0, 0, 0], staySafe, k.KILLING_TIME, grid, data);
};


// build up move scores and return best move
const buildMove = (scores = [0, 0, 0, 0], staySafe, behaviour = null, grid, data) => {
  let behaviourScores = [scores[0], scores[1], scores[2], scores[3]];
  log.status(`Behaviour scores:\n ${u.scoresToString(scores, data)}`);
  const myHead = s.location(data);

  // FALLBACK FOR BEHAVIOUR
  let fallbackScores;
  let coilScores;
  try {
    // if move is null, try to find fallback move
    if (!u.moveInScores(scores)) {
      fallbackScores = getFallbackMove(grid, data);
      if (u.moveInScores(fallbackScores)) {
        log.status(`Fallback scores:\n ${u.scoresToString(fallbackScores, data)}`);
        scores = u.combineScores(fallbackScores, scores);
      }
      // if no fallback move, try to coil on self to save space
      else {
        coilScores = coil(grid, data);
        log.status(`Coil scores:\n ${u.scoresToString(coilScores, data)}`);
        scores = coilScores;
      }
    }
  }
  catch (e) { log.error(`ex in move.buildMove.fallback: ${e}`, data.turn); }

  // BASE SCORES
  let baseScores = baseMoveScores(grid, myHead);
  log.status(`Base scores:\n ${u.scoresToString(baseScores, data)}`);
  scores = u.combineScores(baseScores, scores);

  // TIGHT MOVE
  let tightMoveScores = search.testForConstrainedMove(grid, data);
  if (staySafe) {
    tightMoveScores = tightMoveScores.map((x) => x * p.STAY_SAFE_MULTIPLIER);
  }
  log.status(`Tight move scores:\n ${u.scoresToString(tightMoveScores, data)}`);
  scores = u.combineScores(scores, tightMoveScores);

  // FLOOD FILLS
  let floodScores = search.completeFloodSearch(grid, data);
  log.status(`Flood scores:\n ${u.scoresToString(floodScores, data)}`);
  scores = u.combineScores(scores, floodScores);

  // FARTHER FROM DANGER SNAKES
  let fartherFromDangerousSnakesScores = search.scoresFartherFromDangerousSnake(grid, data);
  if (staySafe) {
    fartherFromDangerousSnakesScores = fartherFromDangerousSnakesScores.map((x) => x * p.STAY_SAFE_MULTIPLIER);
  }
  log.status(`Farther from danger snakes scores:\n ${u.scoresToString(fartherFromDangerousSnakesScores, data)}`);
  scores = u.combineScores(scores, fartherFromDangerousSnakesScores);

  // CLOSER TO KILLABLE SNAKES
  let closerToKillableSnakesScores = search.scoresCloserToKillableSnakes(grid, data);
  log.status(`Closer to killable snakes scores:\n ${u.scoresToString(closerToKillableSnakesScores, data)}`);
  scores = u.combineScores(scores, closerToKillableSnakesScores);

  // FARTHER FROM WALL
  let fartherFromWallsScores = search.scoresFartherFromWall(grid, data);
  if (staySafe) {
    fartherFromWallsScores = fartherFromWallsScores.map((x) => x * p.STAY_SAFE_MULTIPLIER);
  }
  log.status(`Farther from walls scores:\n ${u.scoresToString(fartherFromWallsScores, data)}`);
  scores = u.combineScores(scores, fartherFromWallsScores);

  // TAIL BIAS
  let closerToTailsScores = search.scoresCloserToTails(grid, data);
  if (staySafe) {
    closerToTailsScores = closerToTailsScores.map((x) => x * p.STAY_SAFE_MULTIPLIER);
  }
  log.status(`Closer to tails scores:\n ${u.scoresToString(closerToTailsScores, data)}`);
  scores = u.combineScores(scores, closerToTailsScores);

  // try {
  //   graph.search(grid, data);
  // }
  // catch (e) {
  //   console.error(`ex in graph.search: ${e}`, data.turn);
  // }


  scores = u.normalizeScores(scores);
  // log all scores together for readability in logs
  log.status(`\nBehaviour scores:\n ${u.scoresToString(behaviourScores, data)}`);
  log.status(`Base scores:\n ${u.scoresToString(baseScores, data)}`);
  if (fallbackScores) { log.status(`Fallback scores:\n ${u.scoresToString(fallbackScores, data)}`); }
  if (coilScores) { log.status(`Coil scores:\n ${u.scoresToString(coilScores, data)}`); }
  log.status(`Tight move scores:\n ${u.scoresToString(tightMoveScores, data)}`);
  log.status(`Flood scores:\n ${u.scoresToString(floodScores, data)}`);
  log.status(`Farther from danger snakes scores:\n ${u.scoresToString(fartherFromDangerousSnakesScores, data)}`);
  log.status(`Closer to killable snakes scores:\n ${u.scoresToString(closerToKillableSnakesScores, data)}`);
  log.status(`Farther from walls scores:\n ${u.scoresToString(fartherFromWallsScores, data)}`);
  log.status(`Closer to tails scores:\n ${u.scoresToString(closerToTailsScores, data)}`);
  log.status(`\nFinal scores:\n ${u.scoresToString(scores, data)}`);
  log.status(`\nMove: ${k.DIRECTION_ICON[u.highestScoreMove(scores)]}${behaviour !== null ? `  was ${k.BEHAVIOURS[behaviour]}` : ""}\n`);

  return u.highestScoreMove(scores)
};


const getFallbackMove = (grid, data) => {
  try {
    const myHead = s.location(data);
    log.status("Resorting to fallback move");
    // try finding a path to tail first
    let target = s.tailLocation(data);
    let result = astar.search(myHead, target, grid, k.SNAKE_BODY);
    let movePos = null, move = null, score = 0;
    if (result) {
      movePos = result.pos;
      move = u.calcDirection(myHead, movePos, data);
    }
    // if no path to own tail, try searching for food
    const gridCopy = g.copyGrid(grid);
    while (move === null) {
      target = t.closestFood(myHead, gridCopy, data);
      if (target != null) {
        gridCopy[target.y][target.x] = k.WARNING;
        let result = astar.search(myHead, target, grid, k.SNAKE_BODY);
        if (result) {
          movePos = result.pos;
          move = u.calcDirection(myHead, movePos, data);
        }
      }
      // if no more food to search for just quit
      else break;
    }
    if (move != null) {
      score = p.FALLBACK;
      log.debug(`getFallbackMove target: ${u.pairToString(target)}`);
      log.debug(`getFallbackMove move: ${k.DIRECTION[move]}`);
      log.debug(`getFallbackMove score: ${score}`);
      return u.applyMoveToScores(move, score);
    }
  }
  catch (e) { log.error(`ex in move.getFallbackMove: ${e}`, data.turn); }
  return [0, 0, 0, 0];
};


const coil = (grid, data) => {
  log.status("Trying to coil to save space");
  let coilScores = [0, 0, 0, 0];
  try {
    let tailLocation = s.tailLocation(data);
    let tailDistances = [0, 0, 0, 0];
    let largestDistance = 0;

    for (let m = 0; m < 4; m++) {
      const nextMove = u.applyMoveToPos(m, s.location(data));
      if (search.outOfBounds(nextMove, grid)) continue;
      if (grid[nextMove.y][nextMove.x] >= k.SNAKE_BODY) continue;
      const currentDistance = g.getDistance(tailLocation, nextMove);
      log.debug(`Distance to tail for move ${k.DIRECTION[m]} is ${currentDistance}`);
      if (tailDistances[m] < currentDistance) {
        tailDistances[m] = currentDistance;
        if (largestDistance < currentDistance) {
          largestDistance = currentDistance;
        }
      }
    }

    for (let m = 0; m < 4; m++) {
      if (tailDistances[m] === largestDistance) {
        coilScores[m] += p.COIL;
      }
    }
  }
  catch (e) { log.error(`ex in move.coil: ${e}`, data.turn); }
  return coilScores
};


// get base score for each possible move
const baseMoveScores = (grid, myHead) => {
  let scores = [0, 0, 0, 0];
  // get score for each direction
  scores[k.UP] += baseScoreForBoardPosition(myHead.x, myHead.y - 1, grid);
  scores[k.DOWN] += baseScoreForBoardPosition(myHead.x, myHead.y + 1, grid);
  scores[k.LEFT] += baseScoreForBoardPosition(myHead.x - 1, myHead.y, grid);
  scores[k.RIGHT] += baseScoreForBoardPosition(myHead.x + 1, myHead.y, grid);
  return scores;
};


// return a base score depending on what is currently in that position on the board
const baseScoreForBoardPosition = (x, y, grid) => {
  try {
    // if out of bounds
    if (search.outOfBounds({ x: x, y: y }, grid)) return p.FORGET_ABOUT_IT;
    // types of spaces
    switch (grid[y][x]) {
      case k.SPACE:
      case k.TAIL:
      case k.FUTURE_2:
        return p.BASE_SPACE;
      case k.FOOD:
        return p.BASE_FOOD;
      case k.KILL_ZONE:
        return (p.BASE_KILL_ZONE * p.KILL_ZONE_BASE_MOVE_MULTIPLIER);
      case k.WALL_NEAR:
        return (p.BASE_WALL_NEAR * p.WALL_NEAR_BASE_MOVE_MULTIPLIER);
      case k.WARNING:
        return p.BASE_WARNING;
      case k.SMALL_DANGER:
        return p.BASE_SMALL_DANGER;
      case k.DANGER:
        return p.BASE_DANGER;
      // default includes SNAKE_BODY, ENEMY_HEAD and YOUR_BODY
      default:
        return p.FORGET_ABOUT_IT;
    }
  }
  catch (e) { log.error(`ex in move.baseScoreForBoardPosition: ${e}`); }
  return 0;
};


// check if move is not fatal
const validMove = (direction, pos, grid) => {
  try {
    if (search.outOfBounds(pos, grid)) return false;
    switch (direction) {
      case k.UP:
        return grid[pos.y - 1][pos.x] <= k.DANGER;
      case k.DOWN:
        return grid[pos.y + 1][pos.x] <= k.DANGER;
      case k.LEFT:
        return grid[pos.y][pos.x - 1] <= k.DANGER;
      case k.RIGHT:
        return grid[pos.y][pos.x + 1] <= k.DANGER;
    }
    return false;
  }
  catch (e) { log.error(`ex in move.validMove: ${e}`); }
  return false;
};


module.exports = {
  eat,
  killTime,
  hunt,
  lateHunt,
  validMove
};
