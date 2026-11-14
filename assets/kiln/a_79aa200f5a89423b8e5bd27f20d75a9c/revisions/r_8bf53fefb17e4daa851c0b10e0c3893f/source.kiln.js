const meta = { name: 'Habitat living quarters detail', role: 'prop' };
async function build() {
  const root = createRoot('HabLivingDetails');
  const make = (name, color, roughness=.65, glow=false) => gameMaterial(color, { name, roughness, metalness: glow ? 0 : .05, ...(glow ? { emissive: color, emissiveIntensity: 1.2 } : {}) });
  const ivory=make('hab-ivory',0xF2E5D2), slate=make('hab-slate',0x686976), dark=make('hab-trim',0x303240), orange=make('hab-orange',0xFF8A24), plum=make('hab-fabric',0x765768,.95), blue=make('hab-blue',0x2F58B8), green=make('hab-leaves',0x5A9E58,.95), warm=make('hab-light',0xE6A26A,.5,true), cyan=make('hab-status',0x54E5F5,.5,true);
  const box=(name,x,y,z,w,h,d,m,parent=root)=>createPart(name,new THREE.BoxGeometry(w,h,d),m,{position:[x,y,z],parent});
  const round=async(name,x,y,z,w,h,d,m,parent=root)=>createPart(name,await roundedBoxGeo(w,h,d,Math.min(w,h,d)*.09,{style:'chamfer',segments:1}),m,{position:[x,y,z],parent});
  const cyl=(name,x,y,z,r,h,m,parent=root)=>createPart(name,new THREE.CylinderGeometry(r,r,h,12),m,{position:[x,y,z],parent});
  // Galley sits against the east wall, with its working face toward the aisle.
  const galley=createRoot('Galley'); root.add(galley); galley.position.set(2.64,0,1.4); galley.rotation.y=-Math.PI/2;
  await round('GalleyBase',0,.44,0,1.75,.84,.56,slate,galley);
  await round('Worktop',0,.9,0,1.83,.09,.64,ivory,galley);
  for(let i=0;i<3;i++) {
    box('Drawer_'+i,-.57+i*.57,.46,.294,.53,.67,.025,ivory,galley);
    box('DrawerPull_'+i,-.57+i*.57,.67,.324,.19,.026,.035,dark,galley);
    box('DrawerLabel_'+i,-.57+i*.57,.51,.311,.12,.035,.006,orange,galley);
  }
  box('SinkRim',-.44,.952,0,.55,.018,.42,slate,galley);
  box('SinkBasin',-.44,.963,0,.46,.012,.33,dark,galley);
  cyl('TapStem',-.44,1.06,-.19,.022,.22,slate,galley);
  box('TapSpout',-.44,1.17,-.12,.045,.035,.16,slate,galley);
  await round('WaterDispenser',.48,1.18,-.1,.42,.47,.34,ivory,galley);
  box('DispenserRecess',.48,1.17,.079,.26,.26,.025,dark,galley);
  box('DispenserIndicator',.48,1.36,.077,.15,.023,.01,cyan,galley);
  cyl('Cup',.48,1.02,.1,.065,.12,orange,galley);
  createPart('CupHandle',new THREE.TorusGeometry(.044,.012,6,12),orange,{position:[.565,1.035,.1],parent:galley});
  box('GalleyBacksplash',0,1.39,-.281,1.79,.88,.035,dark,galley);
  box('GalleyShelf',0,1.77,-.12,1.85,.055,.38,ivory,galley);
  box('ShelfTaskLight',0,1.735,.04,1.64,.018,.035,warm,galley);
  for(let i=0;i<5;i++){ cyl('RationJar_'+i,-.66+i*.24,1.92,-.12,.075,.25,i%2?slate:ivory,galley); cyl('JarLid_'+i,-.66+i*.24,2.057,-.12,.08,.025,orange,galley); }
  // Personal lockers, boots and soft bags at the southwest wall.
  await round('LockerCarcass',-2.64,1.04,1.54,.54,2.08,1.46,slate);
  for(let i=0;i<2;i++){
    box('LockerDoor_'+i,-2.351,1.13,1.19+i*.69,.034,1.77,.65,ivory);
    box('LockerHandle_'+i,-2.315,1.16,1.4+i*.69,.045,.26,.035,dark);
    box('LockerStripe_'+i,-2.327,1.73,1.19+i*.69,.02,.065,.61,orange);
    for(let j=0;j<4;j++)box('LockerVent_'+i+'_'+j,-2.326,.5+j*.055,1.19+i*.69,.012,.018,.28,dark);
    await round('StowedBoot_'+i,-2.17,.12,1.28+i*.35,.28,.24,.22,dark);
  }
  // Bunk alcove: quilted headboard, overhead luggage and a reading lamp.
  box('BunkHeadboard',-2.86,1.19,-.8,.08,.68,1.94,plum);
  for(let i=0;i<7;i++)box('UpholsterySeam_'+i,-2.809,1.19,-1.64+i*.28,.014,.64,.016,slate);
  box('BunkShelf',-2.62,1.92,-.8,.64,.065,2.13,ivory);
  for(let i=0;i<3;i++){
    await round('FabricBag_'+i,-2.64,2.12,-1.46+i*.65,.43,.34,.55,i%2?plum:slate);
    box('BagStrap_'+i,-2.41,2.12,-1.46+i*.65,.015,.32,.06,dark);
  }
  box('ReadingLightMount',-2.77,1.61,-1.54,.16,.1,.12,slate);
  box('ReadingLight',-2.67,1.59,-1.54,.12,.025,.12,warm);
  // Breakfast table beside the existing chair; the central aisle stays clear.
  cyl('TableFoot',1.25,.04,-.2,.25,.08,slate);
  cyl('TablePedestal',1.25,.39,-.2,.055,.7,slate);
  cyl('BreakfastTable',1.25,.76,-.2,.43,.08,ivory);
  await round('ClosedNotebook',1.18,.815,-.3,.24,.03,.32,blue);
  box('NotebookBand',1.18,.834,-.3,.035,.008,.32,orange);
  cyl('BreakfastMug',1.39,.87,-.06,.06,.14,plum);
  createPart('BreakfastMugHandle',new THREE.TorusGeometry(.042,.012,6,12),plum,{position:[1.466,.88,-.06],parent:root});
  // Mission board and personal photographs above the terminal.
  await round('MissionBoard',.02,1.93,-2.88,1.65,.78,.075,dark);
  box('BoardInset',.02,1.93,-2.833,1.52,.65,.013,slate);
  for(let i=0;i<3;i++){
    const x=-.48+i*.5;
    box('PinnedPage_'+i,x,1.96,-2.813,.38,.43,.018,ivory);
    box('PageHeader_'+i,x,2.105,-2.8,.29,.036,.008,i===0?orange:blue);
    for(let j=0;j<4;j++)box('NoteLine_'+i+'_'+j,x-.025,2.02-j*.066,-2.799,.23-(j%2)*.06,.013,.008,slate);
    cyl('BoardPin_'+i,x,2.185,-2.787,.022,.02,orange).rotation.x=Math.PI/2;
  }
  // A small personal shelf, with books, a framed Earth and a living plant.
  box('PersonalShelf',1.77,1.57,-2.72,1.45,.065,.44,ivory);
  for(const x of [1.22,2.3])box('ShelfBracket_'+x,x,1.43,-2.82,.055,.26,.18,slate);
  for(let i=0;i<5;i++){
    box('Book_'+i,1.23+i*.085,1.75,-2.72,.065,.3+(i%2)*.05,.22,i%2?plum:blue);
    box('BookSpineBand_'+i,1.23+i*.085,1.68,-2.602,.067,.026,.008,ivory);
  }
  await round('PhotoFrame',1.92,1.83,-2.76,.38,.45,.045,orange);
  box('PhotoSky',1.92,1.83,-2.732,.31,.38,.012,dark);
  createPart('EarthPhoto',new THREE.SphereGeometry(.105,12,8),blue,{position:[1.92,1.87,-2.719],scale:[1,1,.08],parent:root});
  cyl('PlantPot',2.32,1.72,-2.68,.105,.24,plum);
  cyl('PlantSoil',2.32,1.844,-2.68,.096,.012,dark);
  for(let i=0;i<7;i++){
    const a=i*2.4;
    const leaf=createPart('PlantLeaf_'+i,new THREE.SphereGeometry(1,8,6),green,{position:[2.32+Math.cos(a)*.07,1.96+(i%3)*.045,-2.68+Math.sin(a)*.07],scale:[.045,.15,.035],parent:root});leaf.rotation.z=Math.sin(a)*.65;
  }
  // Visible service rails, floor skirting and light strips articulate the room.
  for(const x of [-2.92,2.92]){
    box('Skirting_'+x,x,.11,0,.075,.16,5.7,slate);
    box('UpperServiceRail_'+x,x,2.28,0,.08,.11,5.75,slate);
    box('WarmLightStrip_'+x,x,2.22,0,.085,.025,5.5,warm);
  }
  for(const z of [-2.91,2.91])box('EndSkirting_'+z,0,.11,z,5.72,.16,.075,slate);
  // Entry utility panel, first-aid case and visible pipe clamps.
  await round('FirstAidCase',1.86,1.58,2.82,.57,.57,.18,ivory);
  box('FirstAidCrossV',1.86,1.58,2.714,.06,.28,.02,orange);
  box('FirstAidCrossH',1.86,1.58,2.714,.28,.06,.02,orange);
  for(let i=0;i<2;i++){
    const pipe=cyl('ServicePipe_'+i,2.8-i*.12,1.37,2.8,.035,2.25,slate);
    for(const y of [.45,1.4,2.2])box('PipeClamp_'+i+'_'+y,2.8-i*.12,y,2.79,.08,.035,.12,dark);
  }
  return root;
}
