import { Player, PlayerName, PlayingPlayer } from "./player";

export class Game {
  public activePlayer: PlayingPlayer;
  private players: Player[];
  constructor(playerNames: PlayerName[]) {
    if (playerNames.length < 2) throw new Error("2 players minimum");
    this.players = playerNames.map((name) => new Player(name));
    this.players.forEach((player, idx) =>
      player.setNextPlayer(this.players[idx + 1] ?? this.players[0])
    );
    this.activePlayer = this.players[0].startRound();
  }

  public getScores() {
    return this.players.map((player) => ({
      name: player.getName(),
      scores: player.getScores(),
      total: player.getScore(),
    }));
  }

  public markScore() {
    const newScore = this.activePlayer.addScore(
      this.activePlayer.activeRound.getRoundScore()
    );
    this.players.forEach((player) => {
      if (!player.isActive() && player.getScore() === newScore)
        player.resetScore();
    });
  }

  public nextPlayer(reuseRound: boolean) {
    this.activePlayer = this.activePlayer.endRound(reuseRound);
  }
}
