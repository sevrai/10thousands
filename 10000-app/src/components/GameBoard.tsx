import React from "react";
import { Game } from "../domain/game";
import { Round } from "../domain/round";
import "./GameBoard.css";

type GameBoardState = {
  game: Game;
  previousRound?: Round;
};
export class GameBoard extends React.Component<{}, GameBoardState> {
  constructor(props: {}) {
    super(props);
    const game = new Game(["Mathou", "Séverin"]);
    this.state = {
      game,
    };
  }

  private getActiveRound() {
    return this.state.game.activePlayer.activeRound;
  }

  cannotPlay = () => {
    const cannotRollAgain = this.getActiveRound().isLost();
    const selectionIsEmpty =
      this.getActiveRound().getRoll() &&
      this.getActiveRound().getSelectionScore() === 0;
    return cannotRollAgain || selectionIsEmpty;
  };

  isLost = () => {
    return this.getActiveRound().isLost();
  };

  isPlaying = () => !this.isLost() && !this.state.previousRound

  canReuse = () => this.state.game.activePlayer.getNextPlayer().hasStarted && !this.isLost()

  canCollect = () => {
    return this.state.game.activePlayer.canScore(
      this.getActiveRound().getRoundScore() +
        this.getActiveRound().getSelectionScore()
    );
  };

  rollDices = () => {
    if (this.getActiveRound().getRoll()) {
      this.getActiveRound().validateSelection();
    }
    const round = this.getActiveRound();
    round.rollDices();
    this.setState({ game: this.state.game });
  };

  selectDice = (idx: number) => {
    if (!this.isPlaying()) return
    this.getActiveRound().toggleSelectDice(idx);
    this.setState({ game: this.state.game });
  };

  stopRound = () => {
    this.getActiveRound().validateSelection();
    this.state.game.markScore();
    this.setState({ previousRound: this.getActiveRound() })

  };

  startNewRound = () => {
    this.state.game.nextPlayer(false);
    this.rollDices()
    this.setState({ game: this.state.game, previousRound: undefined });
  }

  reuseRound = () => {
    this.state.game.nextPlayer(true);
    this.rollDices()
    this.setState({ game: this.state.game, previousRound: undefined });
  };

  renderDices = () => {
    return this.getActiveRound()
      .getRoll()
      ?.getValues()
      .map((dice, idx) => {
        let className = "dice"
          if(this.getActiveRound().isSelectedDice(idx) )
          className += " selected-dice" 
          if (!this.isPlaying())
          className += " disabled-dice"
        return (
          <div
            className={className}
            key={idx}
            onClick={this.selectDice.bind(this, idx)}
          >
            {dice}
          </div>
        );
      });
  };

  renderScores = () => {
    return (
      <>
        {this.isPlaying() ? (
          <>
            <p>
              Score du tour :{" "}
              {this.getActiveRound().getRoundScore() +
                this.getActiveRound().getSelectionScore()}
            </p>
            <p>Sélection : {this.getActiveRound().getSelectionScore()}</p>
          </>
        ) : undefined}
        <div className="scoreboard">
          {this.state.game
            .getScores()
            .map(({ name, scores, total }, playerIdx) => (
              <div className="user-score" key={playerIdx}>
                <h3>{name}</h3>
                <h4>{total}</h4>
                {scores.map((score, idx) => (
                  <div key={idx} className={score.score ? "" : "invalidated"}>
                    {score.value}
                  </div>
                ))}
              </div>
            ))}
        </div>
      </>
    );
  };

  renderTitle = () => {
    return (
      <h3>
        {this.isPlaying()
          ? `${this.state.game.activePlayer.getName()} joue`
          : `${this.state.game.activePlayer
              .getNextPlayer()
              .getName()}, à vous de jouer`}
      </h3>
    );
  };

  render() {
    return (
      <div>
        {this.renderTitle()}
        <div className="dices">{this.renderDices()}</div>
        {!this.isPlaying() ? (
          <>
            <button onClick={this.startNewRound}>Recommencer</button>
            <button
              disabled={!this.canReuse()}
              onClick={this.reuseRound}
            >
              Récupérer ({this.getActiveRound().getRoundScore()})
            </button>
          </>
        ) : (
          <>
            <button disabled={this.cannotPlay()} onClick={this.rollDices}>
              Lancer les dés
            </button>
            {/* <button onClick={this.getActiveRound().convertFivePair}>
              Fusionner les 5
            </button> */}
            <button disabled={!this.canCollect()} onClick={this.stopRound}>
              Finir le tour
            </button>
          </>
        )}
        {this.renderScores()}
      </div>
    );
  }
}
