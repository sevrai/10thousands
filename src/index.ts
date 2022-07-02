class Roll {
  constructor(private values: Value[]) {
    // TODO :  constraints on number of dices
  }

  get length() {
    return this.values.length;
  }

  public getValues() {
    return [...this.values];
  }

  public convertFivePair() {
    const selectedFives = this.values.filter((value) => value === 5);
    if (selectedFives.length === 2) {
      // Not allowed for three/four/five of a kind fives
      const newValues = this.values.filter((value) => value !== 5);
      newValues.push(1);
      this.values = newValues;
      return true;
    }
    return false;
  }

  public getThreeOfAKind() {
    const valuesCounter: Record<Value, Index[]> = {};
    this.values.forEach((dice, idx) => {
      valuesCounter[dice] ??= [];
      valuesCounter[dice].push(idx);
    });
    const threeOfAKind =
      Object.values(valuesCounter)
        .filter((indices) => indices.length === 3)
        .pop() ?? [];
    return this.values.map((_, idx) => threeOfAKind.includes(idx));
  }

  public getFourOfAKind() {
    const valuesCounter: Record<number, number[]> = {};
    this.values.forEach((dice, idx) => {
      valuesCounter[dice] ??= [];
      valuesCounter[dice].push(idx);
    });
    const fourOfAKind =
      Object.values(valuesCounter)
        .filter((indices) => indices.length === 4)
        .pop() ?? [];
    return this.values.map((_, idx) => fourOfAKind.includes(idx));
  }

  public getFiveOfAKind() {
    const valuesCounter: Record<number, number[]> = {};
    this.values.forEach((dice, idx) => {
      valuesCounter[dice] ??= [];
      valuesCounter[dice].push(idx);
    });
    const fiveOfAKind =
      Object.values(valuesCounter)
        .filter((indices) => indices.length === 5)
        .pop() ?? [];
    return this.values.map((_, idx) => fiveOfAKind.includes(idx));
  }

  public getStraight() {
    const setValues = new Set(this.values);
    const isStraight = setValues.size === 5;
    return this.values.map(() => isStraight);
  }

  public getOnes() {
    return this.values.map((dice) => dice === 1);
  }
  public getFives() {
    return this.values.map((dice) => dice === 5);
  }

  public getCollectibleDices = (): boolean[] => {
    const threeOfAKindMask = this.getThreeOfAKind();
    const fourOfAKindMask = this.getFourOfAKind();
    const fiveOfAKindMask = this.getFiveOfAKind();
    const straightMask = this.getStraight();
    const onesMask = this.getOnes();
    const fivesMask = this.getFives();
    return this.values.map(
      (_, i) =>
        threeOfAKindMask[i] ||
        fourOfAKindMask[i] ||
        fiveOfAKindMask[i] ||
        straightMask[i] ||
        onesMask[i] ||
        fivesMask[i]
    );
  };

  public getScore(): number {
    const StraightScore = 1500;
    const FiveBaseScore = 400;
    const FiveOnes = 4000;
    const FourBaseScore = 200;
    const FourOnes = 2000;
    const ThreeBaseScore = 100;
    const ThreeOnes = 1000;
    const OneScore = 100;
    const FiveScore = 50;

    if (this.values.length === 0) {
      return 0;
    }

    if (this.getStraight().some((v) => v)) return StraightScore;

    const fiveIndex = this.getFiveOfAKind().findIndex((v) => v);
    if (fiveIndex >= 0) {
      return this.values[fiveIndex] === 1
        ? FiveOnes
        : FiveBaseScore * this.values[fiveIndex];
    }

    const fourOfAKindMask = this.getFourOfAKind();
    const fourIndex = fourOfAKindMask.findIndex((v) => v);
    if (fourIndex >= 0) {
      const subRoll = new Roll(
        this.values.filter((_, idx) => !fourOfAKindMask[idx])
      );
      return (
        (this.values[fourIndex] === 1
          ? FourOnes
          : FourBaseScore * this.values[fourIndex]) + subRoll.getScore()
      );
    }

    const threeOfAKindMask = this.getThreeOfAKind();
    const threeIndex = threeOfAKindMask.findIndex((v) => v);
    if (threeIndex >= 0) {
      const subRoll = new Roll(
        this.values.filter((_, idx) => !threeOfAKindMask[idx])
      );
      return (
        (this.values[threeIndex] === 1
          ? ThreeOnes
          : ThreeBaseScore * this.values[threeIndex]) + subRoll.getScore()
      );
    }

    const onesMask = this.getOnes();
    const onesCount = onesMask.filter((v) => v).length;
    if (onesCount) {
      const subRoll = new Roll(this.values.filter((_, idx) => !onesMask[idx]));
      return OneScore * onesCount + subRoll.getScore();
    }
    const fivesMask = this.getFives();
    const fivesCount = fivesMask.filter((v) => v).length;
    if (fivesCount) {
      const subRoll = new Roll(this.values.filter((_, idx) => !fivesMask[idx]));
      return FiveScore * fivesCount + subRoll.getScore();
    }
    return 0;

    // TODO Full House
  }
}

class Score {
  private invalidated: boolean;
  constructor(private _value: number) {
    this.invalidated = false;
  }

  public invalidate() {
    this.invalidated = true;
  }

  get value() {
    return this.invalidated ? 0 : this._value;
  }
}

class Player {
  private scores: Score[];
  public nextPlayer!: Player;
  private nullRoundCount: number;
  private active: boolean;
  hasStarted: boolean;
  constructor(private name: PlayerName) {
    this.scores = [];
    this.nullRoundCount = 0;
    this.active = false;
    this.hasStarted = false;
  }

  public startRound(): Player {
    this.active = true;
    return this;
  }

  public endRound(): Player {
    this.active = false;
    this.nextPlayer.setActive();
    return this.nextPlayer;
  }

  protected setActive() {
    this.active = true;
  }
  public isActive() {
    return this.active;
  }
  public setNextPlayer(player: Player) {
    this.nextPlayer = player;
  }

  public getName() {
    return this.name;
  }

  public canScore(score: number) {
    if (!this.hasStarted && score < 500) return false;
    return this.getScore() + score <= 10000;
  }

  public addScore(roundScore: number): number {
    if (
      this.getScore() > 0 &&
      roundScore === 0 &&
      (this.nullRoundCount = ++this.nullRoundCount % 3) === 0
    )
      this.resetScore();
    else this.scores.push(new Score(roundScore));

    return this.getScore();
  }

  public getScore() {
    return this.scores.reduce((total, score) => total + score.value, 0);
  }
  public resetScore() {
    const lastScore = this.scores.length
      ? this.scores[this.scores.length - 1]
      : undefined;
    lastScore?.invalidate();
  }
}

type PlayerName = string;

type Value = number;

type Index = number; //0 | 1 | 2 | 3 | 4;

class Round {
  private remainingDices: number;
  private activeRoll!: Roll;
  private currentDiceSelection: Set<Index>;
  stackedSelections: Roll[];

  constructor(private player: Player) {
    this.remainingDices = 5;
    this.currentDiceSelection = new Set();
    this.stackedSelections = [];
  }

  private updateRollSize(selectionSize: number) {
    this.remainingDices = this.remainingDices - selectionSize || 5;
  }

  private increaseRemainingDice() {
    this.remainingDices = (this.remainingDices % 5) + 1;
  }

  public isLost() {
    return this.activeRoll
      .getCollectibleDices()
      .every((collectible) => !collectible);
  }

  public rollDices() {
    const values: Value[] = new Array(this.remainingDices)
      .fill(undefined)
      .map(() => Math.ceil(Math.random() * 6));
    this.activeRoll = new Roll(values);
    return this.activeRoll;
  }

  public selectDice(diceIndex: Index) {
    if (this.activeRoll.getCollectibleDices()[diceIndex]) {
      this.currentDiceSelection.add(diceIndex);
      return true;
    }
    return false;
  }

  private getSelectionRoll() {
    return new Roll(
      [...this.currentDiceSelection.values()].map(
        (idx) => this.activeRoll.getValues()[idx]
      )
    );
  }
  public validateSelection() {
    const selection = this.getSelectionRoll();
    this.stackedSelections.push(selection);
    this.updateRollSize(this.currentDiceSelection.size);
    this.currentDiceSelection = new Set();
    return selection;
  }

  public convertFivePair() {
    const hasBeenConverted =
      this.stackedSelections[
        this.stackedSelections.length - 1
      ].convertFivePair();
    if (hasBeenConverted) this.increaseRemainingDice();
    return hasBeenConverted;
  }

  public getSelectionScore() {
    return this.getSelectionRoll().getScore();
  }

  public getRoundScore() {
    return this.stackedSelections.reduce(
      (total, selection) => total + selection.getScore(),
      0
    );
  }
}

class Game {
  private activePlayer: Player;
  private activeRound!: Round;
  private players: Player[];
  constructor(playerNames: PlayerName[]) {
    if (playerNames.length < 2) throw new Error("2 players minimum");
    this.players = playerNames.map((name) => new Player(name));
    this.players.forEach((player, idx) =>
      player.setNextPlayer(this.players[idx + 1] ?? this.players[0])
    );
    this.activePlayer = this.players[0].startRound();
  }

  public startRound() {
    this.activeRound = new Round(this.activePlayer);
  }

  public play() {
    const roll = this.activeRound.rollDices();
    console.log({ roll: roll.getValues() });
    const collectibleDices = roll.getCollectibleDices();
    console.log({ collectibleDices, pendingScore: roll.getScore() });
    const index = collectibleDices.findIndex((dice) => dice);
    this.activeRound.selectDice(index);
    console.log({ selectionScore: this.activeRound.getSelectionScore() });
    // collectibleDices.forEach((isCollectible, idx) => {
    //   if (isCollectible) {this.activeRound.selectDice(idx);
    // });
    const selection = this.activeRound.validateSelection();
    console.log({ selection: selection.getValues() });

    console.log({ score: this.activeRound.getRoundScore() });
    if (this.activeRound.isLost()) {
      console.log("round lost. Next player");
      return;
    }
    console.log("wanna continue ?");
    console.log("next roll");
    this.play();
  }

  public rollDice() {
    const roll = this.activeRound.rollDices();
    const dices = roll.getValues();
    const collectibleDices = roll.getCollectibleDices();
    const canRollAgain = !this.activeRound.isLost();
    const pendingScore = roll.getScore();
  }

  public endRound() {
    const newScore = this.activePlayer.addScore(
      this.activeRound.getRoundScore()
    );
    this.players.forEach((player) => {
      if (!player.isActive() && player.getScore() === newScore)
        player.resetScore();
    });
  }

  public nextPlayer() {}
}

const game = new Game(["Mathou", "Séverin"]);
game.startRound();
game.play();
