import assert from 'node:assert/strict'
import test from 'node:test'
import { opacityFactor, solarKW, stepPower } from '../../src/sim/power.ts'
import { loadKW } from '../../src/sim/loads.ts'
import { stepEnvironment } from '../../src/sim/environment.ts'
import { topContributors, openCard } from '../../src/sim/causal.ts'
import { drawEvent, stepDirector } from '../../src/sim/events/director.ts'
import { H, absoluteMinute } from '../../src/sim/time.ts'
import { fresh, near, card } from './helpers.mjs'
test('solar dust/health/opacity lookup, fission unaffected by night', () => {
  const [s,r]=fresh();s.env.daylight=1;s.power.panelDust=0
  near(solarKW(s),16)
  for(const [tau,factor] of [[.5,1],[1,.8],[2,.5],[3,.3],[4,.18],[5,.12],[7,.12],[1.5,.65]])near(opacityFactor(tau),factor)
  s.power.panelDust=.5;s.power.arrayHealth=.5;near(solarKW(s),4)
  s.env.daylight=0;s.power.fissionOnline=true;const flow=stepPower(s,r);near(flow.generatedKWh,6*H/60)
})
test('load table, conditional work, dimmer and dirty-ice surcharge', () => {
  const [s,r]=fresh();for(const id of s.power.priority)s.power.on[id]=true
  s.water.iceKg=10;s.rover.batteryKWh=0;s.pebble.batteryPct=10;r.pumpMinutes=60
  s.food.trays[0].crop='pepper';s.food.trays[1].crop='wheat';s.clock.minute=600
  for(const [id,kw] of Object.entries({lifeSupport:1.5,oxygenMaker:1.5,electrolyser:1,waterProcessor:1.5,trayLights1:1,trayLights2:1,trayLights3:0,trayClimate:.55,lab:1.5,dish:0,roverCharge:2,pebbleCharge:.2,shelterPump:.3}))near(loadKW(s,r,id),kw)
  s.water.iceDirty=true;near(loadKW(s,r,'waterProcessor'),2.1)
  s.power.level.heaters=.5;near(loadKW(s,r,'heaters'),(.2+.015*(20-s.env.outsideC))*.5)
})
test('energy conservation includes charging loss and battery-cap spill for each step', () => {
  const [s,r]=fresh()
  for(let i=0;i<1440;i++){
    s.clock.minute=i;stepEnvironment(s,r)
    const result=stepPower(s,r)
    near(result.generatedKWh-result.usedKWh-result.lossKWh-result.spilledKWh,result.deltaKWh,1e-12)
    // Cards do not alter power calculations; these unit checks inspect the frame directly.
    r.card=null
  }
  s.power.batteryKWh=80;s.env.daylight=1;const full=stepPower(s,r);assert(full.spilledKWh>0)
})
test('brownout sheds from END, records top two energy causes and wakes sleep', () => {
  const [s,r]=fresh();s.clock.sleeping=true;s.env.daylight=0;s.power.batteryKWh=.03
  s.power.on.lab=s.power.on.roverCharge=true;s.rover.batteryKWh=0
  s.power.ledger.lab=20;s.power.ledger.heaters=10
  const flow=stepPower(s,r)
  assert.equal(s.power.on.lab,false);assert.equal(s.power.on.roverCharge,false)
  assert.equal(s.clock.sleeping,false);assert(r.card)
  const event=s.log.find(e=>e.kind==='brownout');assert.equal(event.causeIds.length,2)
  assert(event.causeIds.every(id=>s.log.some(e=>e.id===id&&e.kind==='energy')))
  near(flow.generatedKWh-flow.usedKWh-flow.lossKWh-flow.spilledKWh,flow.deltaKWh)
})
test('life support is last emergency cut and no other load can run at zero power', () => {
  const [s,r]=fresh();s.env.daylight=0;s.power.batteryKWh=0
  for(const id of s.power.priority)s.power.on[id]=true
  const flow=stepPower(s,r)
  near(flow.usedKWh,0);assert.equal(s.power.on.lifeSupport,false)
  assert(s.log.find(e=>e.kind==='brownout').text.endsWith('lifeSupport. Review the night plan.'))
})
test('energy ledger resets at sunset and chooses two largest positive contributors', () => {
  const [s,r]=fresh();s.power.ledger.lab=20;s.power.ledger.heaters=10;s.power.ledger.dish=2
  const ids=topContributors(s);assert.equal(ids.length,2);assert(s.log.find(e=>e.id===ids[0]).text.startsWith('lab:'))
  s.clock.minute=1080;stepPower(s,r);near(s.power.ledger.lab,0);assert(s.power.ledger.heaters>0)
})
test('clear clean Act I demand/supply budget and formula-consistent essentials night', () => {
  const [s,r]=fresh();s.power.panelDust=0;s.power.batteryKWh=80;s.power.fissionOnline=true
  s.power.on.electrolyser=s.power.on.trayLights1=s.power.on.trayLights2=s.power.on.trayClimate=true
  s.power.level.electrolyser=14/24
  s.food.trays[0].crop=s.food.trays[1].crop='mizuna'
  let solar=0,demand=0,night=0
  for(let minute=0;minute<1440;minute++){
    s.clock.minute=minute;stepEnvironment(s,r);solar+=solarKW(s)*H/60
    demand+=s.power.priority.reduce((sum,id)=>sum+loadKW(s,r,id),0)*H/60
    if(minute<360||minute>=1080)night+=(loadKW(s,r,'heaters')+loadKW(s,r,'lifeSupport'))*H/60
  }
  assert(solar>125&&solar<126);assert(demand>123&&demand<127)
  // The design's 44kWh estimate conflicts with its heater formula at -80..-20C.
  assert(night>36&&night<40);assert(night<3.2*12*H)
  console.log(`Balance: ${demand.toFixed(2)} kWh demand / ${solar.toFixed(2)} kWh solar; essentials night ${night.toFixed(2)} kWh`)
})
test('seeded director respects weights, cooldown, no consecutive repeat and forecast leads', () => {
  const [s,r]=fresh();const deck=[{id:'dust',domain:'dust',negative:true,cooldownSols:3,forecastLead:0,weight:()=>1,card:card('dust')}]
  assert.equal(drawEvent(s,r,deck),'dust');assert.equal(r.scheduled[0].at,absoluteMinute(s)+1440)
  assert.equal(drawEvent(s,r,deck),null)
  s.clock.sol++;stepDirector(s,r,[]);assert.equal(r.card.id,'dust')
  const [ss,rr]=fresh();assert.equal(drawEvent(ss,rr,[{...deck[0],weight:()=>0}]),null)
})
test('director fires at most one negative major per sol and no same-domain hazard in a sol', () => {
  const [s,r]=fresh(),at=absoluteMinute(s)
  r.scheduled=[{at,card:card('a'),domain:'fault',negative:true},{at,card:card('b'),domain:'dust',negative:true},{at,card:card('c'),domain:'fault',negative:false}]
  stepDirector(s,r,[]);assert.equal(r.card.id,'a');r.card=null
  stepDirector(s,r,[]);assert.equal(r.card,null)
  s.clock.sol++;stepDirector(s,r,[]);assert.equal(r.card.id,'b');r.card=null
  stepDirector(s,r,[]);assert.equal(r.card.id,'c')
})
test('open card never overwrites an unresolved decision', () => {
  const [s,r]=fresh();openCard(s,r,card('first'));assert.equal(openCard(s,r,card('second')),false);assert.equal(r.card.id,'first')
})
