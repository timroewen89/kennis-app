// Leerreeksen: vijf verdiepingen die op elkaar aansluiten, één per dag.
// 'parts' zijn id's uit content/deepdives.js, in de volgorde waarin je ze leest. Een verdieping
// hoort bij hooguit één reeks. 'topic' is een thema uit content/topics.js: een reeks start alleen
// als dat thema bij je gekozen onderwerpen hoort.
// De app start een reeks vanzelf en gaat pas verder als je de editie van die dag hebt afgerond.
export const series = [
  {
    id: 'reformatie-tot-rampjaar',
    topic: 'nederland',
    title: 'Van Reformatie tot Rampjaar',
    intro: 'Hoe een strijd om de kerk uitliep op een opstand, een nieuwe staat en het jaar waarin die bijna ten onder ging.',
    parts: ['reformatie', 'beeldenstorm', 'tachtigjarige-oorlog', 'statenvertaling', 'rampjaar-1672'],
  },
  {
    id: 'natuur-en-geschiedenis',
    topic: 'natuur',
    title: 'Natuur die de geschiedenis veranderde',
    intro: 'Vijf keer dat kou, een aardbeving, een vulkaan of rook het leven van mensen ingrijpend veranderde.',
    parts: ['kleine-ijstijd', 'aardbeving-lissabon', 'jaar-zonder-zomer', 'krakatau-1883', 'grote-smog-1952'],
  },
  {
    id: 'twintigste-eeuw',
    topic: 'wereld',
    title: 'De twintigste eeuw in vijf momenten',
    intro: 'Van de moord in Sarajevo tot de eerste verkiezingen in Zuid-Afrika waaraan iedereen mocht meedoen.',
    parts: ['eerste-wereldoorlog', 'spaanse-griep', 'hiroshima', 'berlijnse-muur', 'apartheid'],
  },
  {
    id: 'geschreven-woord',
    topic: 'cultuur',
    title: 'Het geschreven woord',
    intro: 'Van kleitablet tot roman: hoe mensen teksten vastlegden, verspreidden, kwijtraakten en weer leerden lezen.',
    parts: ['spijkerschrift', 'bibliotheek-alexandrie', 'boekdrukkunst', 'steen-van-rosette', 'max-havelaar'],
  },
  {
    id: 'wetenschap-en-wereld',
    topic: 'wetenschap',
    title: 'Wetenschap die de wereld veranderde',
    intro: 'Vijf verhalen over wat onderzoek en techniek mogelijk maakten, en over wat er mis kon gaan.',
    parts: ['pokken', 'darwin', 'penicilline', 'maanlanding', 'tsjernobyl'],
  },
]
