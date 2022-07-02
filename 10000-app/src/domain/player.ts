import { Round } from "./round";

class Score {
  private invalidated: boolean;
  constructor(private _value: number) {
    this.invalidated = false;
  }

  public invalidate() {
    this.invalidated = true;
  }

  get value() {
    return this._value;
  }

  get score() {
    return this.invalidated ? 0 : this._value;
  }
}

export type PlayerName = string;

export type PlayingPlayer = Player & {
  activeRound: Round;
};

export class Player {
  private scores: Score[];
  public nextPlayer!: Player;
  private nullRoundCount: number;
  private active: boolean;
  hasStarted: boolean;
  activeRound?: Round;
  constructor(private name: PlayerName) {
    this.scores = [];
    this.nullRoundCount = 0;
    this.active = false;
    this.hasStarted = false;
  }

  private createOrReuseRound(round?: Round): asserts this is PlayingPlayer {
    // round?.reuseRound()
    this.activeRound = round ?? new Round();
  }

  public startRound(round?: Round): PlayingPlayer {
    this.active = true;
    this.createOrReuseRound(round);
    return this;
  }

  public endRound(reuse?: boolean): PlayingPlayer {
    this.active = false;
    const roundToReuse = reuse ? this.activeRound : undefined;
    this.activeRound = undefined;
    return this.nextPlayer.startRound(roundToReuse);
  }

  public isActive() {
    return this.active;
  }

  public setNextPlayer(player: Player) {
    this.nextPlayer = player;
  }

  public getNextPlayer() {
    return this.nextPlayer;
  }

  public getName() {
    return this.name;
  }

  public canScore(score?: number) {
    if (!score) return false;
    if (!this.hasStarted && score < 500) return false;
    return this.getScore() + score <= 10000;
  }

  public addScore(roundScore: number): number {
    if (roundScore === 0) {
      if (
        this.getScore() > 0 &&
        roundScore === 0 &&
        (this.nullRoundCount = ++this.nullRoundCount % 3) === 0
      )
        this.resetScore();
    } else {
      this.scores.push(new Score(roundScore));
      this.hasStarted = true;
    }

    return this.getScore();
  }

  public getScores() {
    return this.scores;
  }

  public getScore() {
    return this.scores.reduce((total, score) => total + score.score, 0);
  }
  public resetScore() {
    const lastScore = this.scores.length
      ? this.scores[this.scores.length - 1]
      : undefined;
    lastScore?.invalidate();
  }
}
