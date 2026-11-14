# Player views and switching

The first-person perspective and orthographic Station View share one R3F canvas,
Ecctrl body and simulation runner. M or interacting with the hab control terminal
switches views. In Station View, the left side displays the resources meters alongside
a docked subsystems card with solar generation/consumption and real-time status
for all base modules. The camera rises or returns over 0.8 seconds, keeping
first-person position and facing. The hab console adds a short screen approach.
Reduced motion skips these camera transitions.

Station View starts at 35.264° down and 45° around. WASD pans, Q/E rotate by
90°, and the wheel or +/− changes zoom. Right-drag also pans. Roofs and the
solid portions of the headquarters shell fade to show the room. Module tags
use authored anchors where available. Cable splines display power direction
and use three thickness bands. Time runs while looking at the site and pauses
while a panel is open.

First person supports Pointer Lock and I/J/K/L keyboard look. E uses the
highlighted target, with a hold or toggle for longer actions. F cycles nearby
targets with line of sight when Pointer Lock is off. Tab opens the Data Pad
from the world. Esc closes the active panel or returns to first person.
PEBBLE decisions release Pointer Lock and use a modal that waits for a choice.

## Hab and airlock

The 6 × 6 m hab uses tiled assets and authored furniture, inside the approved
command-base footprint. The player spawns in the hab on a new run. The airlock
uses a separately collidable chamber below the site during the masked transfer.
Turn the wheel, pull the lever, read the gauge and use the unlocked hatch.
The outer hatch requires pressure below 1%; the inner hatch requires at least
99%. The runtime checks simulation acceptance of an EVA before revealing the
yard. Saves and rewinds return the player to the anchor for their saved area.

The Phase 2 exterior retains its closed collider. The interior has independent
floor, wall, ceiling and furniture colliders. The same controller travels between
anchors during the fade. The window is furnished with the delivered hab window
model. See [Phase 3 verification](../game/phase-3-verification.md).
