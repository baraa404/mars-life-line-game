/** "Mars: Mission Critical" dialogue. PEBBLE speaks for B.O.T. from the original script. */
export type Speaker = 'pebble' | 'control'
export type Mood = 'neutral' | 'happy' | 'very-happy' | 'worried' | 'thinking' | 'alarm'
export interface Line { who: Speaker; text: string; mood?: Mood }

const p = (text: string, mood: Mood = 'happy'): Line => ({ who: 'pebble', text, mood })
const c = (text: string): Line => ({ who: 'control', text, mood: 'neutral' })

export const SCRIPT = {
  arrival: [
    p('Landing successful! Welcome to Mars, Commander!', 'very-happy'),
    p('I’m PEBBLE, your robot assistant!'),
    p('Our mission is to get station ARES-7 ready for the next crew arriving from Earth.', 'neutral'),
    p('But there’s a problem. A dust storm just passed and knocked out some of the station’s systems.', 'worried'),
    p('Let’s get everything working again. First, head into the hab and find the main control terminal.', 'thinking'),
  ],
  enteredHab: [p('This is the hab, our home. The control terminal is the screen straight ahead.', 'neutral')],
  terminal: [
    p('Great! This terminal shows how our station is doing.', 'happy'),
    p('Tip: press M any time for quick management. It shows the whole base from above.', 'thinking'),
    p('Looks like our first problem is the power supply. Let’s fix that!', 'worried'),
  ],
  power: [
    p('Commander, the dust storm covered our solar panels!', 'worried'),
    p('Without enough power, our other systems can’t work properly.', 'worried'),
    p('We have two ways to fix it. Clean all four panels by hand, or switch on the backup battery. Your choice!', 'thinking'),
  ],
  cleanedOne: [p('Look at that shine! Keep going, three more rows to scrub.', 'happy')],
  cleaned: [
    p('Nice work! The panels can make much more electricity now!', 'very-happy'),
    p('That should keep the station running for the whole mission.', 'happy'),
  ],
  backup: [
    p('Backup power activated!', 'happy'),
    p('Good thinking, but remember: stored energy won’t last forever. The panels are still dusty.', 'worried'),
  ],
  powerDone: [p('Power problem handled! Now let’s check our life support systems.', 'happy')],
  lifeSupport: [
    p('Commander, there’s something very important we need to take care of.', 'thinking'),
    p('Humans need oxygen and water to survive, even on Mars!', 'neutral'),
    p('Our station has machines that make and recover them. Let’s get those running!', 'happy'),
    p('The water recycler needs a new filter. Grab one from the supply crates across the path.', 'thinking'),
  ],
  filterTaken: [p('Got it! Now carry the filter to the water recycler and slot it in.', 'happy')],
  filterInstalled: [p('Filter in! Now pull the start lever to get the water flowing.', 'happy')],
  recycler: [p('Excellent! We’re recovering water instead of wasting it!', 'very-happy')],
  oxygenNeedsWater: [p('The oxygen generator splits water to make oxygen. Get the water recycler running first!', 'thinking')],
  oxygen: [
    p('Oxygen production is online!', 'very-happy'),
    p('That’s a big step toward making this station ready for astronauts.', 'happy'),
    p('But what about food? Let’s go to the greenhouse!', 'thinking'),
  ],
  greenhouse: [
    p('Welcome to our greenhouse, Commander!', 'very-happy'),
    p('Scientists planted crops here before we arrived, but the growing systems stopped working.', 'worried'),
    p('If we want to live on Mars, we need to grow our own food! Open the water valve and switch on the grow lights.', 'thinking'),
  ],
  growing: [
    p('Great! Our plants are growing again!', 'very-happy'),
    p('But here’s the tricky part…', 'thinking'),
    p('Plants need water and electricity, and so do our other systems.', 'neutral'),
    p('Pull one lever on the priority board to decide what comes first: Survival, Balanced, or Farming.', 'thinking'),
  ],
  survival: [
    p('Survival Mode activated!', 'neutral'),
    p('We’re focusing on keeping our essential systems running. The plants will grow slowly for now.', 'neutral'),
  ],
  balanced: [
    p('Balanced Mode activated!', 'happy'),
    p('We’re sharing our resources between life support and farming.', 'happy'),
  ],
  farming: [
    p('Farming Mode activated!', 'very-happy'),
    p('Our plants can grow faster now! Just be careful: farming needs plenty of water and energy.', 'worried'),
  ],
  monitor: [p('Now keep an eye on the trays. If a tray’s light turns red, its drip line is blocked. Hold E on it to clear it.', 'thinking')],
  slowGrowth: [p('The plants are growing slowly in Survival Mode. You can switch modes on the priority board any time.', 'thinking')],
  ready: [
    p('Commander! Our crops are ready!', 'very-happy'),
    p('Go ahead and collect our first harvest! Hold E on each tray.', 'happy'),
  ],
  harvested: [
    p('We did it! We grew food on Mars!', 'very-happy'),
    p('I’ve replanted the trays with new seeds. That’s one more step toward a station that feeds itself!', 'happy'),
  ],
  review: [
    p('Commander, let’s check how our station is doing.', 'thinking'),
    p('Every decision we’ve made has changed our systems.', 'neutral'),
    p('Sometimes helping one system means using resources another one needs. Head back to the control terminal.', 'thinking'),
  ],
  lowPower: [p('Our energy is getting low. We need to be careful with what we use!', 'worried')],
  lowWater: [p('We’re using water faster than we’re recovering it!', 'worried')],
  stable: [p('Everything looks stable! Great management, Commander!', 'very-happy')],
  adjust: [p('Change the operating priority on the board next to the terminal if you want, then press Confirm.', 'thinking')],
  confirmed: [p('Alright! Let’s keep preparing for the next crew.', 'happy')],
  emergency: [
    p('Commander! We just got an urgent message from Earth!', 'alarm'),
    c('ARES-7, this is Mission Control. We detected a solar radiation storm heading toward Mars.'),
    c('Particles will reach you in under a minute. Protect yourselves and your equipment.'),
    p('Radiation can be dangerous to astronauts. We need to protect ourselves!', 'alarm'),
    p('Choose: pull the red EMERGENCY lever to save power, or override the greenhouse to keep farming. Then cover the oxygen generator and the water recycler, and get to the shelter!', 'worried'),
  ],
  emergencyMode: [
    p('Emergency Mode activated!', 'neutral'),
    p('We’re only running the systems we need most right now.', 'neutral'),
  ],
  keepFarming: [
    p('Alright, but keeping everything running will use more power.', 'worried'),
    p('Let’s make sure our essential systems stay safe!', 'thinking'),
  ],
  securedOne: [p('Covered! Radiation won’t damage that one.', 'happy')],
  arrived: [p('The particles are here! Get inside the shelter now!', 'alarm')],
  sheltered: [
    p('Good job, Commander! We’re in the shelter!', 'happy'),
    p('Thick walls block most of the radiation. Let’s stay here until Mission Control gives the all-clear.', 'neutral'),
  ],
  allClear: [
    c('ARES-7, the radiation event has passed.'),
    c('You may safely resume normal station operations.'),
    p('Phew! We made it!', 'very-happy'),
    p('That was our biggest challenge yet!', 'happy'),
  ],
  report: [
    p('Commander, we’ve reached the end of our first mission!', 'happy'),
    p('Let’s send our results to Mission Control. Hold E on the control terminal to submit the report.', 'thinking'),
  ],
  reportSent: [
    c('ARES-7, we’ve received your mission report.'),
    c('You restored critical systems, grew food, and responded to an emergency.'),
    c('Let’s see if the station is ready for the next crew…'),
  ],
  success: [
    c('Congratulations, Commander! ARES-7 is ready for the next crew.'),
    c('Your mission was a success!'),
    p('We did it, Commander!', 'very-happy'),
    p('We didn’t just survive on Mars… we proved we can build a future here!', 'very-happy'),
  ],
  improve: [
    c('Good effort, Commander. ARES-7 survived the emergency, but some systems still need attention.'),
    c('Your mission has helped us understand what needs to improve.'),
    p('Hey, we learned a lot today!', 'happy'),
    p('Being an astronaut means learning from every decision. Ready to try again?', 'thinking'),
  ],
  final: [
    p('Remember, Commander…', 'neutral'),
    p('Living on Mars isn’t just about exploring. It’s about making smart decisions, solving problems, and taking care of our new home.', 'happy'),
  ],
  brownout: [p('Alarm! The battery is empty. The recycler, oxygen generator and grow lights just shut down!', 'alarm')],
  powerBack: [p('Power is back. Our machines are starting up again.', 'happy')],
  oxygenLow: [p('Oxygen is getting low! The generator needs both power and water.', 'alarm')],
  trayBlocked: [p('Tray {n} looks thirsty! Its light turned red. Hold E on it to clear the drip line.', 'worried')],
  trayDied: [p('Oh no… tray {n} went without water for too long. Those plants are gone, and that tray won’t grow food again.', 'worried')],
  foodLow: [p('Commander, we’re almost out of food! The crew eats every minute. We need a harvest soon.', 'alarm')],
  oxygenEmpty: [p('THE AIR IS GONE! You can only hold on for a few seconds. Get the oxygen generator running: it needs power and water!', 'alarm')],
  oxygenWeak: [p('Your vision is going dark… Commander, fix the air NOW!', 'alarm')],
  waterEmpty: [p('The water tank is empty! Nobody can drink, and the oxygen generator and plants have stopped. Get the recycler working!', 'alarm')],
  waterWeak: [p('You’re dizzy from thirst and can’t run anymore. We need water very soon!', 'alarm')],
  foodEmpty: [p('The food is gone. You’re getting weak. Harvest the greenhouse trays!', 'alarm')],
  foodWeak: [p('You’re too hungry to run. If we don’t eat soon, the mission is over.', 'alarm')],
  doseHigh: [p('Your dosimeter is screaming! One more dose like that will make you very sick. Get to the shelter!', 'alarm')],
  lost_oxygen: [c('ARES-7, we have lost your life signs. The oxygen supply failed.')],
  lost_water: [c('ARES-7, the crew could not survive without water. Mission lost.')],
  lost_food: [c('ARES-7, with no food left the crew could not continue. Mission lost.')],
  lost_radiation: [c('ARES-7, the commander took a fatal radiation dose. Mission lost.')],
  lost: [
    p('Commander…? Commander!', 'worried'),
    p('On Mars, every choice adds up. Let’s look at what happened, then try again.', 'thinking'),
  ],
} satisfies Record<string, Line[]>

export type LineId = keyof typeof SCRIPT
