import type { Card } from './commands.ts'

export const touchdownCard: Card = {
  id: 'm0-startup',
  text: 'Life Support is on. What should we wake up next?',
  details: { info: 'Check your battery. Sunset is getting close.', hint: 'What would help you most before dark?',
    science: 'A base shares its power. You choose what comes first.', source: 'game-value' },
  options: [
    { id: 'earth', label: 'Call Earth', benefit: 'Earth hears you landed safely.', cost: 'Sending a video takes time and power.',
      systems: ['earth-link','power','you'], later: 'Look for a reply in the morning.', recovery: 'You can warm the hab later.',
      feedback: 'You powered the dish and sent your first video.', effects: [{ type: 'm0Startup', plan: 'earth' }] },
    { id: 'warm', label: 'Warm the hab', benefit: 'Sleep warm and wake rested.', cost: 'The heater draws power all night.',
      systems: ['power','you'], later: 'Less battery may be left at dawn.', recovery: 'Turn down the heater in Station View.',
      feedback: 'You brought the heaters up to full power.', effects: [{ type: 'm0Startup', plan: 'warm' }] },
    { id: 'grow', label: 'Start the greenhouse', benefit: 'The first plants get a head start.', cost: 'The hab stays cool tonight.',
      systems: ['food','water','power'], later: 'The tray needs power and water.', recovery: 'Adjust the tray lights in Station View.',
      feedback: 'You woke the first growing tray.', effects: [{ type: 'm0Startup', plan: 'grow' }] },
  ],
}
