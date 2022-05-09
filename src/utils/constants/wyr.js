const u = [
  {
    wyr: "Would you rather only be able to whisper or only be able to shout?",
    id: 1,
  },
  {
    wyr: "Would you rather lose all your teeth or lose all your hair?",
    id: 2,
  },
  {
    wyr: "Would you rather read the book or watch the movie version of the book?",
    id: 3,
  },
  { wyr: "Would you rather have five feet or five hands?", id: 4 },
  {
    wyr: "Would you rather have unlimited strength or unlimited speed?",
    id: 5,
  },
  {
    wyr: "Would you rather dress in only pink neon or only black for the rest of your life?",
    id: 6,
  },
  {
    wyr: "Would you rather lose your sense of smell or your ability to taste?",
    id: 7,
  },
  {
    wyr: "Would you rather be able to time travel or to be able to stop time?",
    id: 8,
  },
  {
    wyr: "Would you rather find a dream partner or a dream job?",
    id: 9,
  },
  {
    wyr: "Would you rather spend the rest of your life without music or without movies?",
    id: 10,
  },
  {
    wyr: "Would you rather work in a high-paying job that you hate or in a low wage job you love?",
    id: 11,
  },
  {
    wyr: "Would you rather wear nothing but sweatpants for the rest of your life or never be able to wear sweatpants again?",
    id: 12,
  },
  {
    wyr: "Would you rather invent something for the first time or discover something for the first time?",
    id: 13,
  },
  {
    wyr: "Would you rather be an infamous villain or an unknown superhero?",
    id: 14,
  },
  {
    wyr: "Would you rather eat dog food or cat food with every meal?",
    id: 15,
  },
  {
    wyr: "Would you rather understand what everyone is thinking or see everyone’s future?",
    id: 16,
  },
  {
    wyr: "Would you rather be great at something nobody cares about or average at something everyone cares about?",
    id: 17,
  },
  {
    wyr: "Would you rather not be able to speak or not be able to read?",
    id: 18,
  },
  {
    wyr: "Would you rather only be able to drink coffee or never be able to drink it again?",
    id: 19,
  },
  {
    wyr: "Would you rather let a random stranger lick you or you lick a random stranger?",
    id: 20,
  },
  {
    wyr: "Would you rather be able to change your past or be able to change your future?",
    id: 21,
  },
  {
    wyr: "Would you rather always have to tell the truth or never be able to speak again?",
    id: 22,
  },
  {
    wyr: "Would you rather have free coffee or free ice-cream for the rest of your life?",
    id: 23,
  },
  {
    wyr: "Would you rather use a phone that had an extremely weak signal and that was extremely slow?",
    id: 24,
  },
  {
    wyr: "Would you rather remember everything you see or remember everything you hear?",
    id: 25,
  },
  {
    wyr: "Would you rather kiss a poisonous snake or a crocodile?",
    id: 26,
  },
  {
    wyr: "Would you rather lie without anyone knowing or tell when anybody is lying?",
    id: 27,
  },
  {
    wyr: "Would you rather accidentally walk in on your parents making out or have them walk in on you making out?",
    id: 28,
  },
  {
    wyr: "Would you rather give up pizza or give up coffee forever?",
    id: 29,
  },
  {
    wyr: "Would you rather have no feelings or be over-emotional?",
    id: 30,
  },
  {
    wyr: "Would you rather be well fed but homeless or have a home but little food for a month?",
    id: 31,
  },
  {
    wyr: "Would you rather be unhappily single or unhappily married for the rest of your life?",
    id: 32,
  },
  {
    wyr: 'Would you rather have to tell everyone you meet "I love you" or never be able to say "I love you: to anyone?',
    id: 33,
  },
  {
    wyr: "Would you rather be able to control fire or be able to control water?",
    id: 34,
  },
  {
    wyr: "Would you rather spend a week in the wilderness or one night in a haunted house?",
    id: 35,
  },
  {
    wyr: "Would you rather have your phone hacked or have your house robbed?",
    id: 36,
  },
  {
    wyr: "Would you rather have someone cheat on you or you cheat on someone and they find out?",
    id: 37,
  },
  {
    wyr: "Would you rather get a terrible tattoo that's visible or a terrible scar that's semi-visible.",
    id: 38,
  },
  {
    wyr: "Would you rather wear all second-hand clothes or all designer clothes",
    id: 39,
  },
  {
    wyr: "Would you rather spend a year on an island with someone who never stopped talking or completely alone?",
    id: 40,
  },
  {
    wyr: "Would you rather eat food that you're not allowed to cook or TV dinners for the rest of your life?",
    id: 41,
  },
  {
    wyr: "Would you rather live in a world where robots or aliens ruled the world?",
    id: 42,
  },
  {
    wyr: "Would you rather watch a movie in a theater by yourself or with friends but as the third wheel?",
    id: 43,
  },
  {
    wyr: "Would you rather always be ten minutes late or an hour early?",
    id: 44,
  },
  {
    wyr: "Would you rather never be able to eat cake or pie again?",
    id: 45,
  },
  {
    wyr: "Would you rather be attacked by a great white shark or grizzly bear?",
    id: 46,
  },
  {
    wyr: "Would you rather be bitten by a poisonous snake or a poisonous spider?",
    id: 47,
  },
  {
    wyr: "Would you rather spend five years in prison or twenty years in a coma?",
    id: 48,
  },
  {
    wyr: "Would you rather eat steak with a spoon or soup with a fork?",
    id: 49,
  },
  {
    wyr: "Would you rather always have a terrible haircut or shave your head bald?",
    id: 50,
  },
  {
    wyr: "Would you rather work hard to earn $1 million or inherit $1 million?",
    id: 51,
  },
  {
    wyr: "Would you rather eat nothing but burnt food or nothing but leftovers from people you don't know?",
    id: 52,
  },
  { wyr: "Would you rather have nine toes or eleven toes?", id: 53 },
  { wyr: "Would you rather be burned alive or buried alive?", id: 54 },
  {
    wyr: "Would you rather never eat your favorite food again or never kiss someone again?",
    id: 55,
  },
  {
    wyr: "Would you rather achieve world peace or solve world hunger?",
    id: 56,
  },
  {
    wyr: "Would you rather wake up in the morning next to your ex boyfriend/girfriend or next to a poisonous snake? (no",
    id: 57,
  },
  {
    wyr: "Would you rather only be able to go out when it's light outside or only when it's dark outside?",
    id: 58,
  },
  {
    wyr: "Would you rather have the ability to be invisible to people of the same sex or the opposite sex?",
    id: 59,
  },
  {
    wyr: "Would you rather be blind or completely forget your memory to this point?",
    id: 60,
  },
  {
    wyr: "Would you rather have your purse/wallet or your phone stolen?",
    id: 61,
  },
  {
    wyr: "Would you rather lose all your keys or your wallet?",
    id: 62,
  },
  {
    wyr: "Would you rather be poor but everyone loves you or a billionaire and nobody likes you?",
    id: 63,
  },
  {
    wyr: "Would you rather find a hidden camera in your bathroom or in your bedroom?",
    id: 64,
  },
  {
    wyr: "Would you rather die at 50 with no regrets or at 90 with numerous regrets?",
    id: 65,
  },
  {
    wyr: "Would you rather watch TV that's commercial-free but doesn't have a remote or have a remote but you have to watch all the commercials?",
    id: 66,
  },
  {
    wyr: "Would you rather be born with the head of a horse or the feet of a duck?",
    id: 67,
  },
  {
    wyr: "Would you rather look young but feel old or look old but feel young?",
    id: 68,
  },
  {
    wyr: "Would you rather know your significant other cheated on you once but never will again or not know they ever did and they never will again?",
    id: 69,
  },
  {
    wyr: "Would you rather never eat breakfast foods or never eat desserts for the rest of your life?",
    id: 70,
  },
  {
    wyr: "Would you rather have a job where you sit all day or a job where you stand all day?",
    id: 71,
  },
  {
    wyr: "Would you rather always feel hot or always feel cold?",
    id: 72,
  },
  { wyr: "Would you rather win $100", id: 73 },
  {
    wyr: "Would you rather have no eyebrows or a unibrow that you can't fix?",
    id: 74,
  },
  {
    wyr: "Would you rather have your perfect body but be poor or have a body your never satisfied with but be rich?",
    id: 75,
  },
  {
    wyr: "Would you rather be intelligent but poor or stupid but rich?",
    id: 76,
  },
  { wyr: "Would you rather receive a guaranteed $250", id: 77 },
  {
    wyr: "Would you rather get one wish granted today or wait five years to get three wished granted? (no wishing for more wishes)",
    id: 78,
  },
  {
    wyr: "Would you rather lose all the toes on one foot or one of your ears?",
    id: 79,
  },
  {
    wyr: "Would you rather not have knees or not have elbows?",
    id: 80,
  },
  {
    wyr: "Would you rather get no gifts on your birthday or 100 gifts that you absolutely hated on your birthday?",
    id: 81,
  },
  {
    wyr: "Would you rather have nobody attend your funeral or nobody attend your wedding?",
    id: 82,
  },
  {
    wyr: "Would you rather have neighbors who were noisy or neighbors who were nosy?",
    id: 83,
  },
  {
    wyr: "Would you rather be bored all the time or too busy all the time?",
    id: 84,
  },
  {
    wyr: "Would you rather a best friend or five really good friends?",
    id: 85,
  },
  {
    wyr: "Would you rather talk like Donald Trump or look like Donald Trump?",
    id: 86,
  },
  {
    wyr: "Would you rather only be able to eat meat you hunt or raise yourself or only eat fruits and vegetables you grow yourself?",
    id: 87,
  },
  {
    wyr: "Would you rather only be able to eat ice-cream in the winter or only be able to drink hot chocolate in the summer?",
    id: 88,
  },
  {
    wyr: "Would you rather not get a birthday cake on your birthday or not get any gifts on your birthday?",
    id: 89,
  },
  {
    wyr: "Would you rather let a random person cut your hair or let a random person color your hair?",
    id: 90,
  },
  {
    wyr: "Would you rather only be able to tell your food is rotten by tasting it or have all the food you eat smell rotten even though it's fine?",
    id: 91,
  },
  {
    wyr: "Would you rather always drink bad coffee or always eat stale bread?",
    id: 92,
  },
  {
    wyr: "Would you rather eat ants on your ice-cream or worms in your soup?",
    id: 93,
  },
  {
    wyr: "Would you rather not have turkey on Thanksgiving or not get any candy on Halloween?",
    id: 94,
  },
  {
    wyr: "Would you rather eat delicious food with a blind date or eat fast food with a good friend each night for an entire month?",
    id: 95,
  },
  {
    wyr: "Would you rather eat a delicious meal with no utensils or a mediocre meal with utensils?",
    id: 96,
  },
  {
    wyr: "Would you rather feel the pain of everything you eat or see the death of everything you eat?",
    id: 97,
  },
  {
    wyr: "Would you rather lose all your photos or lose all your mementos?",
    id: 98,
  },
  {
    wyr: "Would you rather never be able to take a shower again or never be able to take a bath again?",
    id: 99,
  },
  {
    wyr: "Would you rather never use toilet paper or only use leaves from trees you've gathered as toilet paper?",
    id: 100,
  },
  {
    wyr: "Would you rather listen to only your three favorite songs or listen to only 100 randomly assigned songs for a year?",
    id: 101,
  },
  {
    wyr: "Would you rather watch movies alone or eat dinner alone?",
    id: 102,
  },
  {
    wyr: "Would you rather have a song that you hate stuck in your head or an itch you can't reach for a year?",
    id: 103,
  },
  {
    wyr: "Would you rather be in a room for a year with only one movie to watch or only one book to read?",
    id: 104,
  },
  {
    wyr: "Would you rather look and feel 20 years younger from the neck down or the neck up?",
    id: 105,
  },
  {
    wyr: "Would you rather have other people think your smell like bacon or have every person you meet smell like bacon to you?",
    id: 106,
  },
  {
    wyr: "Would you rather be at a 4-hour concert of a band you hate or a 4-hour dinner with a person you dislike?",
    id: 107,
  },
  {
    wyr: "Would you rather always have a slow Internet connection or always be in traffic jams when you drive?",
    id: 108,
  },
  {
    wyr: "Would you rather have wet gloves or wet shoes every time you go out in the snow?",
    id: 109,
  },
  {
    wyr: "Would you rather kiss a random stranger on the mouth or use a family member's toothbrush?",
    id: 110,
  },
  {
    wyr: "Would you rather live next to a graveyard or next to a haunted house?",
    id: 111,
  },
  {
    wyr: "Would you rather all your pants have broken zippers or all your shirts have missing buttons?",
    id: 112,
  },
  {
    wyr: "Would you rather go a year without combing your hair or a year without deodorant?",
    id: 113,
  },
  {
    wyr: "Would you rather wake up with a hangover every morning or go to sleep with a headache every night?",
    id: 114,
  },
  {
    wyr: "Would you rather have constantly chapped lips or constantly stuffed nose?",
    id: 115,
  },
  {
    wyr: "Would you rather let ten people die and save your friend or save ten strangers and let your friend die?",
    id: 116,
  },
  {
    wyr: "Would you rather know when you're going to die or how you're going to die?",
    id: 117,
  },
  {
    wyr: "Would you rather have the ability to speak to animals or the ability to speak all languages?",
    id: 118,
  },
  {
    wyr: "Would you rather earn $1 for each word you say or earn $1 for each step you take?",
    id: 119,
  },
  {
    wyr: "Would you rather receive a $200 discount on everything or receive a 30% discount on everything?",
    id: 120,
  },
  {
    wyr: "Would you rather never have to sleep or never have to go to the bathroom?",
    id: 121,
  },
  {
    wyr: "Would you rather have a perfect memory of your past or be able to see one minute into your future?",
    id: 122,
  },
  {
    wyr: "Would you rather be able to hear all the positive things people say about you or all the negative things people say about you?",
    id: 123,
  },
  {
    wyr: "Would you rather have a personal assistant or a housekeeper?",
    id: 124,
  },
  {
    wyr: "Would you rather have a personal chef or a personal driver?",
    id: 125,
  },
  {
    wyr: "Would you rather have the power to fall asleep on command or the power to wake up on command?",
    id: 126,
  },
  {
    wyr: "Would you rather be the first of your kind or the last of your kind?",
    id: 127,
  },
  {
    wyr: "Would you rather have every minute feel like an hour or every hour feel like a minute?",
    id: 128,
  },
  {
    wyr: "Would you rather have carpet in your bathroom or carpet in your kitchen?",
    id: 129,
  },
  {
    wyr: "Would you rather spend eight hours listening to someone scratch a chalkboard with their nails or have a mosquito buzzing around your head as you try to sleep each night for a month?",
    id: 130,
  },
  {
    wyr: "Would you rather sleep every night in a room with someone who snores or in a room with a fly buzzing?",
    id: 131,
  },
  {
    wyr: "Would you rather eat all your meals with someone who eats loudly or someone who eats with their mouth open?",
    id: 132,
  },
  {
    wyr: "Would you rather be seen as a person who always whines or as someone who is a bad person?",
    id: 133,
  },
  {
    wyr: "Would you rather be the God of light or the God of darkness?",
    id: 134,
  },
  {
    wyr: "Would you rather have unlimited knowledge or unlimited wealth?",
    id: 135,
  },
  {
    wyr: "Would you rather receive $500 each time you make someone laugh or $10",
    id: 136,
  },
  {
    wyr: "Would you rather be a multi-millionaire in 1900 or a middle-class person today?",
    id: 137,
  },
  {
    wyr: "Would you rather have lips made of teeth or teeth made of lips?",
    id: 138,
  },
  {
    wyr: "Would you rather wake up 3 hours earlier than normal or sleep 3 hours later than normal?",
    id: 139,
  },
  {
    wyr: "Would you rather know a little about numerous topics or know a lot about a few specific topics?",
    id: 140,
  },
  {
    wyr: "Would you rather get rid of 90% of your possessions or 10% of your friends?",
    id: 141,
  },
  {
    wyr: "Would you rather be able to taste color or see smell?",
    id: 142,
  },
  {
    wyr: "Would you rather spend the rest of your life underwater or underground?",
    id: 143,
  },
  {
    wyr: "Would you rather wear clothes that are a bit too small or wear clothes three times too big?",
    id: 144,
  },
  {
    wyr: "Would you rather marry your perfect partner or achieve all of your dreams?",
    id: 145,
  },
  {
    wyr: "Would you rather receive a one-time payment of $500",
    id: 146,
  },
  {
    wyr: "Would you rather be a good cook or be well organized?",
    id: 147,
  },
  {
    wyr: "Would you rather be able to able to play any instrument you touch or understand any language you hear?",
    id: 148,
  },
  {
    wyr: "Would you rather have perfect skin but bad teeth or a perfect smile but bad skin?",
    id: 149,
  },
  {
    wyr: "Would you rather have a free day off on Friday or Monday?",
    id: 150,
  },
  {
    wyr: "Would you rather have excellent cooking skills or excellent organizing skills?",
    id: 151,
  },
  {
    wyr: "Would you rather live in luxury in a town you don't like or in a shack in a town you love?",
    id: 152,
  },
  {
    wyr: "Would you rather fly free anywhere at any time or eat free anywhere at any time?",
    id: 153,
  },
  {
    wyr: "Would you rather get special discounts at your favorite restaurant or special discounts at your favorite store?",
    id: 154,
  },
  {
    wyr: "Would you rather never have to wait at lights or never have to wait for your food?",
    id: 155,
  },
  {
    wyr: "Would you rather have a car that always has fuel or a car that never needs repairs?",
    id: 156,
  },
  { wyr: "Would you rather give up social media or Netflix?", id: 157 },
  {
    wyr: "Would you rather have no long-term memory or no short-term memory?",
    id: 158,
  },
  {
    wyr: "Would you rather never own a car or never own a pet?",
    id: 159,
  },
  {
    wyr: "Would you rather wear no underwear or no socks for a year?",
    id: 160,
  },
  {
    wyr: "Would you rather have a great significant other but o friends",
    id: 161,
  },
  {
    wyr: "Would you rather always have spinach stuck in your teeth or always have dandruff on your shoulders?",
    id: 162,
  },
  {
    wyr: "Would you rather be punished for a crime you didn't commit or have a friend punished for a crime you committed?",
    id: 163,
  },
  { wyr: "Would you rather live in a tree or in a cave?", id: 164 },
  {
    wyr: "Would you rather die before your significant other or after your significant other?",
    id: 165,
  },
  {
    wyr: "Would you rather date your best friend's sibling or have your best friend date your sibling?",
    id: 166,
  },
  {
    wyr: "Would you rather invent time travel or perpetual motion machines?",
    id: 167,
  },
  {
    wyr: "Would you rather stuck in a cave for a day or stuck in an elevator for a day?",
    id: 168,
  },
  {
    wyr: "Would you rather your parents or your boss have access to everything on your phone?",
    id: 169,
  },
  {
    wyr: "Would you rather be able to talk to wild animals or domesticated animals?",
    id: 170,
  },
  {
    wyr: "Would you rather live in an RV or live on a sailboat?",
    id: 171,
  },
  {
    wyr: "Would you rather be able to see your own future or be able to see other people's future?",
    id: 172,
  },
  {
    wyr: "Would you rather work incredibly hard for yourself or have an easy job working for someone else while earning the same amount of money with each?",
    id: 173,
  },
  {
    wyr: "Would you rather be able to mind control people or be able to put words in people's mouths?",
    id: 174,
  },
  {
    wyr: "Would you rather move to a new city every month or stay in the same location for your entire life?",
    id: 175,
  },
  {
    wyr: "Would you rather be a God on an isolated island or an average person in the world?",
    id: 176,
  },
  {
    wyr: "Would you rather have a sign saying the individual's net worth or a sign with the number of random acts of kindness the individual has done above their head?",
    id: 177,
  },
  {
    wyr: "Would you rather always have to travel by hippo or by kangaroo?",
    id: 178,
  },
  {
    wyr: "Would you rather have every outfit you wear be slightly itchy or slightly too tight?",
    id: 179,
  },
  {
    wyr: "Would you rather have long hair growing out of your nose or long hair growing out of your ears?",
    id: 180,
  },
  {
    wyr: "Would you rather always have a shopping cart with one wheel that doesn't work right when shopping or an uneven table leg at every restaurant where you eat?",
    id: 181,
  },
  {
    wyr: "Would you rather always have a little rock in your shoe you can't find or always have a hangnail that gets caught on things?",
    id: 182,
  },
  {
    wyr: "Would you rather be able to take a shower whenever you want but the water pressure is always really low or take the perfect shower but only be able to do it once a month?",
    id: 183,
  },
  {
    wyr: "Would you rather burn your tongue or burn the top of your mouth?",
    id: 184,
  },
  {
    wyr: "Would you rather have unlimited pencils but the erasers don't work or one pencil with a great eraser to use for the rest of your life?",
    id: 185,
  },
  {
    wyr: "Would you rather go on a date where the person constantly humblebrags or where they're constantly on their phone?",
    id: 186,
  },
  {
    wyr: "Would you rather be in a quiet room with someone tapping their foot or clicking a pen?",
    id: 187,
  },
  {
    wyr: "Would you rather date someone who always talks during movies or wears too much fragrance?",
    id: 188,
  },
  {
    wyr: "Would you rather have a roommate that doesn't replace the toilet paper when it runs out or puts empty food packages back into the refrigerator?",
    id: 189,
  },
  {
    wyr: "Would you rather have a friend that types in all caps in texts or a friend that replies to all in emails?",
    id: 190,
  },
  {
    wyr: "Would you rather stub your toe or get a paper cut?",
    id: 191,
  },
  {
    wyr: "Would you rather spend a day switching radio stations and hearing the same song or switching TV stations and seeing the same show?",
    id: 192,
  },
  {
    wyr: "Would you rather have a phone with unlimited battery life or strong",
    id: 193,
  },
  {
    wyr: "Would you rather never have to do laundry or never have to do dishes again?",
    id: 194,
  },
  {
    wyr: "Would you rather have a friend that always tells you the truth or a friend who always backs you up even when you're wrong?",
    id: 195,
  },
  {
    wyr: "Would you rather have all your food overseasoned or underseasoned?",
    id: 196,
  },
  {
    wyr: "Would you rather never get angry or never get jealous?",
    id: 197,
  },
  {
    wyr: "Would you rather be famous now and forgotten when you die or unknown now and famous after your death?",
    id: 198,
  },
  {
    wyr: "Would you rather have a bad hair day or a bad clothes day?",
    id: 199,
  },
  {
    wyr: "Would you rather work for the rest of your life as a portable toilet cleaner or have all the garbage you produce going forward permanently stay at your house?",
    id: 200,
  },
];
