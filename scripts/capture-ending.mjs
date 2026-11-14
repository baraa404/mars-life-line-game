import { spawn } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const ARTIFACT_DIR = '/home/baraa/.gemini/antigravity/brain/3ec275da-6c3e-4589-aab9-f2f64adfda66'
const PORT = 9231
const URL = 'http://localhost:5199/'

async function main() {
  console.log('Launching headless Chrome...')
  const chrome = spawn('google-chrome', [
    '--headless=new',
    `--remote-debugging-port=${PORT}`,
    '--no-sandbox',
    '--window-size=1440,920',
    URL,
  ])

  // Give Chrome time to start
  await new Promise(r => setTimeout(r, 1500))

  let targets
  for (let i = 0; i < 10; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json`)
      targets = await res.json()
      break
    } catch {
      await new Promise(r => setTimeout(r, 500))
    }
  }

  const page = targets?.find(t => t.type === 'page')
  if (!page) {
    console.error('Could not find page target!')
    chrome.kill()
    process.exit(1)
  }

  const ws = new WebSocket(page.webSocketDebuggerUrl)
  let nextId = 1
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = nextId++
    const handler = (e) => {
      const data = JSON.parse(e.data)
      if (data.id === id) {
        ws.removeEventListener('message', handler)
        if (data.error) reject(data.error)
        else resolve(data)
      }
    }
    ws.addEventListener('message', handler)
    ws.send(JSON.stringify({ id, method, params }))
  })

  await new Promise(resolve => { ws.onopen = resolve })
  console.log('Connected to Chrome CDP.')

  await send('Page.enable')
  await send('Runtime.enable')

  // Set viewport
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1440,
    height: 920,
    deviceScaleFactor: 1,
    mobile: false,
  })

  await new Promise(r => setTimeout(r, 1500))

  console.log('Generating simulated Mission Success state...')
  // Set localStorage and reload
  await send('Runtime.evaluate', {
    expression: `(async () => {
      const { createStory, act, tick } = await import('/src/sim/story/story.ts');
      function run(s, ...actions) {
        for (const action of actions) {
          const r = act(s, action);
          s = r.state;
        }
        return s;
      }
      function wait(s, seconds, step = 0.2) {
        for (let t = 0; t < seconds; t += step) s = tick(s, step).state;
        return s;
      }
      function growAndHarvest(s) {
        for (let guard = 0; guard < 4000 && s.scene === 4; guard++) {
          s = wait(s, 1);
          s.trays.forEach((t, i) => { if (t.blocked) s = run(s, { type: 'clearTray', tray: i }); });
          s.trays.forEach((t, i) => { if (t.growth >= 1 && !t.harvested && s.scene === 4) s = run(s, { type: 'harvest', tray: i }); });
        }
        return s;
      }

      let s = createStory('gale');
      s = wait(s, 45);
      s = run(s, { type: 'enterHab' }, { type: 'terminal' });
      s = wait(s, 80);
      s = run(s, ...[0, 1, 2, 3].map(panel => ({ type: 'cleanPanel', panel })));
      s = wait(s, 60);
      s = run(s, { type: 'takeFilter' }, { type: 'installFilter' }, { type: 'startRecycler' }, { type: 'startOxygen' });
      s = wait(s, 50);
      s = run(s, { type: 'greenhouse', inside: true }, { type: 'valve' }, { type: 'lights' }, { type: 'mode', mode: 'balanced' });
      s = growAndHarvest(s);
      s = wait(s, 45);
      s = run(s, { type: 'terminal' }, { type: 'confirm' });
      s = run(s, { type: 'mode', mode: 'emergency' });
      s = run(s, { type: 'secure', system: 'oxygen' }, { type: 'secure', system: 'recycler' });
      s = wait(s, 20);
      s = run(s, { type: 'shelter' });
      for (let guard = 0; guard < 2000 && s.scene === 6; guard++) s = wait(s, 0.5);
      s = wait(s, 40);
      s = run(s, { type: 'report' });

      // Save to localStorage as a valid resumable save (ending: null allows Continue button)
      const saveState = { ...s, ending: null };
      localStorage.setItem('marslifeline.story.v1', JSON.stringify(saveState));
      localStorage.setItem('marslifeline.site', 'gale');
      window.__COMPLETED_STORY = s;
      return { ok: true, decisions: s.decisions.length };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  })

  // Reload page to let App see the save
  console.log('Reloading page to show Continue button...')
  await send('Page.reload')
  await new Promise(r => setTimeout(r, 2000))

  // Click Continue Game
  console.log('Clicking Continue Game...')
  const clickContinue = await send('Runtime.evaluate', {
    expression: `(() => {
      const continueBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Continue Game'));
      if (continueBtn) {
        continueBtn.click();
        return 'clicked';
      }
      return 'not found: ' + Array.from(document.querySelectorAll('button')).map(b => b.textContent).join(', ');
    })()`,
    returnByValue: true,
  })
  console.log('Continue button status:', clickContinue.result?.value)

  await new Promise(r => setTimeout(r, 1500))

  // Now apply the completed story state and open the end panel
  console.log('Opening end panel on surface...')
  await send('Runtime.evaluate', {
    expression: `(async () => {
      const { useStoryStore } = await import('/src/state/useStoryStore.ts');
      const { useMissionStore } = await import('/src/state/useMissionStore.ts');
      const s = window.__COMPLETED_STORY || JSON.parse(localStorage.getItem('marslifeline.story.v1'));
      s.ending = 'success';
      useStoryStore.setState({ state: s, queue: [], line: null });
      useMissionStore.setState({ openPanel: 'end', panelHistory: [], view: 'firstPerson' });
    })()`,
    awaitPromise: true,
  })

  // Poll for the ending modal
  console.log('Waiting for ending modal...')
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 400))
    const check = await send('Runtime.evaluate', {
      expression: `!!document.querySelector('.story-end-modal') && !!document.querySelector('.kid-vital-card')`,
      returnByValue: true,
    })
    if (check.result?.result?.value) {
      console.log(`Modal detected after ${(i + 1) * 400}ms!`)
      break
    }
    // Re-assert
    await send('Runtime.evaluate', {
      expression: `(async () => {
        const { useMissionStore } = await import('/src/state/useMissionStore.ts');
        useMissionStore.setState({ openPanel: 'end' });
      })()`,
    })
  }

  await new Promise(r => setTimeout(r, 1200))

  // Capture Screenshot 1: Kid-friendly simple colorful view
  console.log('Capturing simple kid-friendly screenshot...')
  const snap = await send('Page.captureScreenshot', { format: 'png' })
  const outPath = `${ARTIFACT_DIR}/ending_results.png`
  writeFileSync(outPath, Buffer.from(snap.result.data, 'base64'))
  console.log(`Saved simple screenshot to ${outPath}`)

  // Click toggle button to open full scientific report
  console.log('Toggling full science report...')
  await send('Runtime.evaluate', {
    expression: `(() => {
      const toggle = document.querySelector('.kid-toggle-btn');
      if (toggle) toggle.click();
    })()`,
  })
  await new Promise(r => setTimeout(r, 600))

  // Scroll slightly down to show the report contents
  await send('Runtime.evaluate', {
    expression: `(() => {
      const body = document.querySelector('.story-end-modal .oh-dialog-body');
      if (body) body.scrollTop = 250;
    })()`,
  })
  await new Promise(r => setTimeout(r, 600))

  // Capture Screenshot 2: Full scientific report view
  console.log('Capturing full report screenshot...')
  const snap2 = await send('Page.captureScreenshot', { format: 'png' })
  const outPath2 = `${ARTIFACT_DIR}/ending_results_details.png`
  writeFileSync(outPath2, Buffer.from(snap2.result.data, 'base64'))
  console.log(`Saved full report screenshot to ${outPath2}`)

  ws.close()
  chrome.kill()
  process.exit(0)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
