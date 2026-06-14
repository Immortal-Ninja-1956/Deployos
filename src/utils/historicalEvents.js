export const HISTORICAL_EVENTS = [
  {
    name: 'Chelyabinsk, Russia',
    year: '2013',
    sizeValue: 20,
    size: '~20 M',
    detail: 'EXPLODED IN THE ATMOSPHERE WITH THE FORCE OF ROUGHLY 30 HIROSHIMA-SIZED BOMBS. SHOCKWAVE INJURED 1,500 PEOPLE, MOSTLY FROM SHATTERED GLASS. OBJECT NEVER REACHED THE GROUND INTACT.',
  },
  {
    name: 'Meteor Crater, Arizona',
    year: '~50,000 YRS AGO',
    sizeValue: 50,
    size: '~50 M',
    detail: 'LEFT A CRATER OVER A KILOMETER WIDE AND 170 METERS DEEP. CLEARLY VISIBLE TODAY, REMINDING US THAT EVEN SMALL VECTOR OBJECTS LEAVE PERMANENT SCARS.',
  },
  {
    name: 'Tunguska, Siberia',
    year: '1908',
    sizeValue: 55,
    size: '~50-60 M',
    detail: 'FLATTENED AN ESTIMATED 2,000 SQUARE KILOMETERS OF FOREST. REMOTE LOCATION RESULTED IN ZERO RECORDED CASUALTIES, BUT IT REMAINS THE LARGEST IMPACT EVENT IN RECORDED HISTORY.',
  },
  {
    name: 'Ries Crater, Germany',
    year: '~15M YRS AGO',
    sizeValue: 1500,
    size: '~1.5 KM',
    detail: 'LEFT A 24 KM CRATER IN GERMANY. RELEASED ENERGY EQUIVALENT TO 1.8 MILLION HIROSHIMA BOMBS, CREATING GLASSY TEKTITES FOUND HUNDREDS OF KILOMETERS AWAY.',
  },
  {
    name: 'Chicxulub Impactor',
    year: '~66M YRS AGO',
    sizeValue: 10000,
    size: '~10 KM',
    detail: 'TRIGGERED A GLOBAL MASS EXTINCTION EVENT THAT WIPED OUT 75% OF ALL LIFE, INCLUDING THE DINOSAURS. LEFT A 150 KM CRATER AND TOTALLY SHIFTED THE PLANETS BIOSPHERE.',
  },
];

export function findNearestHistoricalEvent(diameterMeters) {
  let closest = HISTORICAL_EVENTS[0];
  let minDiff = Math.abs(diameterMeters - closest.sizeValue);

  for (let i = 1; i < HISTORICAL_EVENTS.length; i++) {
    const diff = Math.abs(diameterMeters - HISTORICAL_EVENTS[i].sizeValue);
    if (diff < minDiff) {
      minDiff = diff;
      closest = HISTORICAL_EVENTS[i];
    }
  }
  return closest;
}
