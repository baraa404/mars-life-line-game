import { fileURLToPath } from 'node:url'
import { SimRunner, assertInvariants, absoluteMinute } from '../src/sim/index.ts'
/** Stability check, not the Phase 19 campaign/medal balance study. No free stock injections. */
export function runCampaignCheck(seed=1, sols=60) {
  const runner=new SimRunner(seed)
  runner.enqueue({type:'toggleLoad',load:'electrolyser',on:true})
  const end=absoluteMinute(runner.state)+sols*1440
  let decisions=0
  while(absoluteMinute(runner.state)<end){
    if(runner.runtime.card){runner.enqueue({type:'choose',cardId:runner.runtime.card.id,optionId:runner.runtime.card.options[0].id});decisions++}
    runner.tick();assertInvariants(runner.state)
  }
  return {seed,sols,steps:runner.runtime.steps,decisions,batteryKWh:runner.state.power.batteryKWh,airKg:runner.state.air.o2Kg,waterL:runner.state.water.liters,pantrySols:runner.state.food.pantrySols,doseDP:runner.state.you.doseDP}
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  console.log(JSON.stringify([1,42,2026].map(seed=>runCampaignCheck(seed)),null,2))
}
