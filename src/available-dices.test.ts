// given a random roll you can take every one or 5 in game
// Un 1 vaut 100 points, un 5 vaut 50 points.
// Un brelan d'as (3 dés avec le 1) vaut 1000 points.
// Un brelan (3 dés identiques) vaut 100 fois la valeur d'un des 3 dés (un brelan de 2 vaut 200 points, un brelan de 4 vaut 400 points, un brelan de 5 vaut 500 points).
// Un carré (4 dés identiques) vaut le double du brelan (un carré de 6 vaut 1200)
// Un yam (5 dés identiques) vaut le double du carré (un yams de 6 vaut donc 2400)
// Un yam d'as vaut 4000 points.
// Une suite (1,2,3,4,5) ou (2,3,4,5,6) vaut 1500.
// Les figures (brelan, carré, yam et suite) doivent être obtenues en un seul lancé.
// Lors d'une main pleine (les 5 dés valent des points) le joueur doit rejouer les 5 dés. On additionne alors le score de la nouvelle main à celui de la main précédente. Un yam, une suite ou un full sont considérés comme des mains pleines.
// On ne peut pas garder un score finissant par 50. Dans ce cas on rejoue jusqu'à obtenir un score rond ou perdre la main.
// Un joueur ne peut entrer dans la partie qu'en faisant un score supérieur ou égal à 500 (on peut pimenter le jeu en fixant le score d'entrée à 800 ou 1000).
// Il faut obtenir les combinaisons en un seul lancer. Si on obtient un premier 1, puis deux autres au deuxième lancer, on obtient 100 + 200 = 300 points et non pas 1000 points.
// Si un joueur "A" atteint le score d'un joueur "B", il prend automatiquement sa place et le joueur "B" redescend au palier précédent.
// Dans certains cas, un joueur adverse peut récupérer le score de l'adversaire. Par exemple, un joueur a fait 500 points avec 3 cinq. Il décide de s'arrêter et laisse deux dés sur le plateau. Le joueur suivant peut continuer à jouer et dois dire « Je reprends ! ». Ce dernier ne peut jouer qu'avec les deux restant sur le plateau. S'il marque, il additionne son résultat à celui du joueur précédent.

describe("can I take a dice", () => {
  it("'s possible to take every 1 or 5 in game", () => {
    // Given a roll of 1 5 3 2 5
    const roll = new Roll([1, 5, 3, 2, 5]);
    // When I ask the collectible dices
    const collectibleDices = getCollectibleDices(roll);
    // Then I get 1 & 5 & 5
    expect(collectibleDices).toMatchObject([true, true, false, false, true]);
  });
});
