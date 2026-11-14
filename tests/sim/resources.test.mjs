import assert from 'node:assert/strict'
import test from 'node:test'
import { stepAir } from '../../src/sim/air.ts'
import { stepWater, dailyWaterDemand } from '../../src/sim/water.ts'
import { stepFood, harvest, halfRations } from '../../src/sim/food.ts'
import { stepRadiation, sepFluxAt, G, S } from '../../src/sim/radiation.ts'
import { stepYou, taskMultiplier, canWorkOutside } from '../../src/sim/you.ts'
import { stepPebble } from '../../src/sim/pebble.ts'
import { stepComms, updateCommsTrack } from '../../src/sim/comms.ts'
import { applyCommand } from '../../src/sim/applyCommand.ts'
import { stepEnvironment, outsideTemperature } from '../../src/sim/environment.ts'
import { advanceClock, absoluteMinute } from '../../src/sim/time.ts'
import { airSols, waterSols, nightCovered, status } from '../../src/sim/gauges.ts'
import { fresh, near } from './helpers.mjs'
test('24-point temperature extrema and nine-sol storm evolution', () => {
  near(outsideTemperature(5 * 60), -80); near(outsideTemperature(14 * 60), -20)
  near(outsideTemperature(14 * 60 + 30), -21)
  const [s, r] = fresh(); r.stormStart = absoluteMinute(s)
  for (const [days, phase, tau] of [[0, 'building', .5], [2, 'peak', 4.5], [6, 'clearing', 4.5], [9, 'none', .5]]) {
    s.clock.sol = days + 1; stepEnvironment(s, r); assert.equal(s.env.stormPhase, phase); near(s.env.tau, tau)
  }
})
test('air use, electrolysis stoichiometry, MOXIE-like production and scrubber wear', () => {
  const [s, r] = fresh(); s.power.on.electrolyser = s.power.on.oxygenMaker = true
  for (let i = 0; i < 60; i++) { stepAir(s, r); stepWater(s, r) }
  near(s.air.o2Kg, 10 - .84 / 24 + .06 + .05)
  near(s.water.liters, 60 - 1 / 24 - .0675)
  near(s.air.scrubberLife, 1 - 1 / (8 * 24))
  s.air.scrubberLife = 0; s.air.co2 = 0
  for (let i = 0; i < 60; i++) stepAir(s, r)
  near(s.air.co2, .1)
})
test('suit fill costs 0.5kg once per EVA and lasts eight hours', () => {
  const [s, r] = fresh(); applyCommand(s, r, { type: 'setLocation', location: 'outside' })
  near(s.air.o2Kg, 9.5); near(s.you.suitO2Kg, .5)
  for (let i = 0; i < 480; i++) stepAir(s, r)
  near(s.you.suitO2Kg, 0); near(s.air.o2Kg, 9.5)
  applyCommand(s, r, { type: 'setLocation', location: 'hab' })
  s.air.o2Kg = .1; assert.equal(applyCommand(s, r, { type: 'setLocation', location: 'outside' }), false)
})
test('water drain per tray, wheat extra, dirty ice yield/rate/filter wear', () => {
  const [s, r] = fresh(); s.food.trays[0].crop = 'mizuna'; s.food.trays[1].crop = 'wheat'
  near(dailyWaterDemand(s), 6)
  for (let i = 0; i < 1440; i++) stepWater(s, r)
  near(s.water.liters, 54)
  const a = fresh(), b = fresh()
  for (const [state, runtime] of [a, b]) { state.water.iceKg = 60; state.power.on.waterProcessor = true; runtime.electrolyserWater = 0 }
  b[0].water.iceDirty = true
  for (let i = 0; i < 540; i++) { stepWater(...a); stepWater(...b) }
  near(a[0].water.iceKg, 0); near(a[0].water.liters, 60 + 54 - 540 / 1440)
  near(1 - b[0].water.filterLife, 2 * (1 - a[0].water.filterLife))
})
test('water wall requires 30L and a powered hour; locking and unlocking conserve water', () => {
  const [s, r] = fresh(); applyCommand(s, r, { type: 'waterWall', lock: true })
  s.power.on.shelterPump = false; stepWater(s, r); assert.equal(r.pumpMinutes, 60)
  s.power.on.shelterPump = true
  for (let i = 0; i < 60; i++) stepWater(s, r)
  assert.equal(r.waterWallLiters, 30); near(s.water.liters + r.waterWallLiters, 60 - 61 / 1440)
  applyCommand(s, r, { type: 'waterWall', lock: false }); assert.equal(r.waterWallLiters, 0); near(s.water.liters, 60 - 61 / 1440)
})
test('three crop cycles, light factors and harvest yields; cold/dry pause and harm plants', () => {
  for (const [crop, cycle, yieldSols] of [['mizuna',25,1],['wheat',50,6],['pepper',55,1.5]]) {
    const [s, r] = fresh(); s.food.trays[0].crop = crop; s.clock.minute = 600
    s.power.on.trayClimate = s.power.on.trayLights1 = true
    for (let i = 0; i < 60; i++) stepFood(s, r)
    near(s.food.trays[0].growth, 1 / (cycle * 16))
    s.food.trays[0].growth = 1; const before = s.food.pantrySols; harvest(s, r, 0)
    near(s.food.pantrySols - before, yieldSols); assert.equal(s.food.trays[0].crop, null)
  }
  const [s, r] = fresh(); s.food.trays[0].crop = 'wheat'; s.food.trays[0].photoperiod = 20; s.clock.minute = 600
  s.power.on.trayLights1 = true; s.power.on.trayClimate = true; stepFood(s, r)
  near(s.food.trays[0].growth, 1.25 / (50 * 16 * 60))
  const growth = s.food.trays[0].growth; r.waterAvailable = false; stepFood(s, r)
  near(s.food.trays[0].growth, growth); assert(s.food.trays[0].health < 1)
})
test('pantry consumes one sol or half rations and only near-ready harvest avoids half rations', () => {
  const [s, r] = fresh(); for (let i = 0; i < 1440; i++) stepFood(s, r); near(s.food.pantrySols, 49)
  s.food.pantrySols = .8; assert(halfRations(s)); stepFood(s, r); near(s.food.pantrySols, .8 - .5 / 1440)
  s.food.trays[0].crop = 'wheat'; s.food.trays[0].growth = .999; assert(!halfRations(s))
})
test('DP shielding by location and SEP profile integral is 39; Forbush lasts one sol', () => {
  near(Array.from({length:480},(_,i)=>sepFluxAt(i)).reduce((a,b)=>a+b,0)/1440,39)
  for (const location of Object.keys(G)) {
    const [s, r] = fresh(); s.you.location = location; s.rad.sepFlux = 10; stepRadiation(s, r)
    near(s.you.doseDP, (G[location] + 10 * S[location]) / 1440)
  }
  const [s, r] = fresh(); s.you.location = 'shelter'; r.waterWallLiters = 30; s.rad.sepFlux = 10; stepRadiation(s, r)
  near(s.you.doseDP, (.7 + 1) / 1440)
  r.forbushUntil = absoluteMinute(s) + 1440; stepRadiation(s, r); near(s.rad.gcrFactor, .9)
  s.clock.sol++; stepRadiation(s, r); near(s.rad.gcrFactor, 1)
})
test('astronaut energy falls at 02:00 and 06:00 only awake; task and EVA restrictions', () => {
  const [s, r] = fresh(); for (const minute of [120,360]) { s.clock.minute = minute; stepYou(s,r) }
  assert.equal(s.you.energy,1); near(taskMultiplier(s),1.25)
  s.clock.sleeping = true; stepYou(s,r); assert.equal(s.you.energy,1)
  s.you.energy=0; assert(!canWorkOutside(s)); near(taskMultiplier(s),1.5)
  s.you.energy=3;s.you.suitO2Kg=.5;s.you.doseDP=91;assert(!canWorkOutside(s))
})
test('PEBBLE drain, dust-slowed cleaning, charge off-duty, night watch, glitch/reboot', () => {
  const [s, r] = fresh(); for(let i=0;i<60;i++) stepPebble(s,r); near(s.pebble.batteryPct,99)
  applyCommand(s,r,{type:'pebbleJob',kind:'cleanPanels',target:'array'})
  for(let i=0;i<180;i++) stepPebble(s,r)
  assert(s.pebble.job,'dust slows cleaning'); for(let i=0;i<20;i++) stepPebble(s,r)
  assert.equal(s.pebble.job,null);near(s.power.panelDust,.025)
  s.clock.sleeping=true;s.power.on.pebbleCharge=true;const pct=s.pebble.batteryPct;stepPebble(s,r);assert(r.nightWatch);assert(s.pebble.batteryPct>pct)
  s.pebble.location='outside';s.rad.weather='sep';s.rad.sepFlux=10;stepPebble(s,r);assert(s.pebble.glitched)
  for(let i=0;i<30;i++)advanceClock(s);stepPebble(s,r);assert(!s.pebble.glitched)
})
test('comms track, relay upload cost, seeded delayed reply and blackout deferral', () => {
  const [s,r]=fresh();s.clock.minute=480;s.power.on.dish=true
  applyCommand(s,r,{type:'sendMessage',text:'Hello'})
  for(let i=0;i<10;i++){updateCommsTrack(s);stepComms(s);advanceClock(s)}
  const msg=s.comms.outbox[0];assert.equal(msg.uploadMin,10);assert(msg.replyAt>=msg.sentAt+40&&msg.replyAt<=msg.sentAt+60)
  s.clock.sol=41;updateCommsTrack(s);stepComms(s);assert(s.comms.blackout);assert.equal(s.comms.inbox.length,0)
  s.clock.sol=55;updateCommsTrack(s);stepComms(s);assert.equal(s.comms.oneWayMin,21);assert.equal(s.comms.inbox.length,1)
  stepComms(s);assert.equal(s.comms.inbox.length,1)
})
test('gauge thresholds, rolling water use and power night hours handle zero demand', () => {
  const [s,r]=fresh();near(airSols(s),10/.84);near(waterSols(s,r),60)
  for(let i=0;i<1440;i++){stepWater(s,r);r.steps++}near(waterSols(s,r),59)
  assert.equal(status(3).text,'OK');assert.equal(status(2.99).shape,'▲');assert.equal(status(.99).text,'Act');assert.equal(status(.249).text,'Return to Ship')
  assert(nightCovered(s,r)>0);s.power.fissionOnline=true;assert.equal(nightCovered(s,r),Infinity)
})
test('mizuna health bonus expires after ten sols and never removes an unapplied capped bonus', () => {
  const [s,r]=fresh();s.you.health=1;s.food.trays[0].crop='mizuna';s.food.trays[0].growth=1
  harvest(s,r,0);assert.equal(s.you.health,2)
  s.clock.sol+=10;stepYou(s,r);assert.equal(s.you.health,1)
  const [full,rr]=fresh();full.food.trays[0].crop='mizuna';full.food.trays[0].growth=1;harvest(full,rr,0)
  full.clock.sol+=10;stepYou(full,rr);assert.equal(full.you.health,3)
})
