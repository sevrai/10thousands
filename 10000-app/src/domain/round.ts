import { Index, Roll, Value } from "./roll";

export class Round {
  private remainingDices: number;
  private activeRoll?: Roll;
  private currentDiceSelection: Set<Index>;
  stackedSelections: Roll[];

  constructor() {
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
    return (
      this.activeRoll &&
      this.activeRoll.getCollectibleDices().every((collectible) => !collectible)
    );
  }

  public rollDices() {
    const values: Value[] = new Array(this.remainingDices)
      .fill(undefined)
      .map(() => Math.ceil(Math.random() * 6));
    this.activeRoll = new Roll(values);
    return this.activeRoll;
  }

  public reuseRound() {
    this.activeRoll = undefined
  }

  public getRoll() {
    return this.activeRoll;
  }

  public isSelectedDice(diceIndex: Index) {
    return this.currentDiceSelection.has(diceIndex);
  }

  public toggleSelectDice(diceIndex: Index) {
    return this.isSelectedDice(diceIndex)
      ? this.unselectDice(diceIndex)
      : this.selectDice(diceIndex);
  }

  public unselectDice(diceIndex: Index) {
    this.currentDiceSelection.delete(diceIndex);
    return false;
  }
  public selectDice(diceIndex: Index) {
    if (this.activeRoll?.getCollectibleDices()[diceIndex]) {
      this.currentDiceSelection.add(diceIndex);
      return true;
    }
    return false;
  }

  private getSelectionRoll() {
    return new Roll(
      [...this.currentDiceSelection.values()].map(
        (idx) => (this.activeRoll?.getValues() ?? [])[idx]
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
