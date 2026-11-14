import type { Card } from './commands.ts'

export const planningCard: Card = {
  id: 'night-plan',
  text: 'Mars gets cold at night. How should we use our power?',
  details: {
    info: 'Check Power for the battery charge and hours left.',
    hint: 'What stops making power after sunset?',
    science: 'Solar panels need sunlight. The battery stores some for later.',
    source: 'game-value',
  },
  options: [
    { id: 'warm', label: 'Keep the heater warm', effects: [{ type: 'toggleLoad', load: 'heaters', on: true }, { type: 'setLevel', load: 'heaters', level: 1 }],
      benefit: 'The hab stays warmer.', cost: 'The battery drains faster.', systems: ['power', 'you'],
      later: 'Less power may be left at dawn.', feedback: 'The heater runs at full power.', recovery: 'Lower the heater in Station View.' },
    { id: 'save', label: 'Save battery power', effects: [{ type: 'toggleLoad', load: 'heaters', on: true }, { type: 'setLevel', load: 'heaters', level: .5 }],
      benefit: 'The battery lasts longer.', cost: 'The hab may get colder.', systems: ['power', 'you'],
      later: 'A cold night can leave you tired.', feedback: 'The heater uses half its usual power.', recovery: 'Raise the heater in Station View.' },
  ],
}
