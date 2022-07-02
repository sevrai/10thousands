export type Value = number;

export type Index = number; //0 | 1 | 2 | 3 | 4;

export class Roll {
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
    const sum = this.values.reduce((acc, v) => acc + v, 0);
    const setValues = new Set(this.values);
    const isStraight = setValues.size === 5 && (sum === 15 || sum === 20);
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
