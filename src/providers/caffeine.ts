import type { beverage, intake, myIntake } from "../interfaces/app-user";

class CaffeineController {

  constructor() { }

  async search(query: string, beverages: Array<beverage>) {
    const results = {
      shownBeverages: 0,
      beverages: beverages,
    };
    query = query.toLowerCase().replace(/,|\.|-/g, ' ');
    const queryWords = query.split(' ').filter(w => !!w.trim().length);
    results.beverages.forEach((beverage: beverage) => {
      beverage.hide = true;
      let matchesQuery = false;
      if (queryWords.length) {
        queryWords.forEach((queryWord: string) => {
          if (beverage.title.toLowerCase().indexOf(queryWord) > -1) {
            matchesQuery = true;
          }
        });
      } else {
        matchesQuery = true;
      }
      beverage.hide = !matchesQuery;
      if (!beverage.hide) {
        results.shownBeverages++;
      }
    });
    return results;
  }

  public calculateCaffeine(intake: intake): myIntake {
    if (!intake || !intake.amount || intake.amount.length <= 0) return {
      caffeine: 0,
      drinksLeft: null,
    };
    const caffeineIntake = parseFloat(intake.amount) * parseFloat(intake.servingsPerUnit) * parseFloat(intake.caffeinePerUnit);
    const remainingIntake = intake.currentIntake === 0 ? 500 - caffeineIntake : 500 - (intake.currentIntake + caffeineIntake);
    const drinks = remainingIntake <= 0 ? 0 : Math.round(remainingIntake / (parseFloat(intake.servingsPerUnit) * parseFloat(intake.caffeinePerUnit)));
    return {
      caffeine: caffeineIntake,
      drinksLeft: drinks <= 0 ? 0 : drinks,
    };
  }

}

export const Caffeine = new CaffeineController();