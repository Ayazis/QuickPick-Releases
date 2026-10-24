// Shared by browser, renderer and audio. Frame 0 is t=0; 800 audio samples/frame.
globalThis.QP_BEAT_GRID=Object.freeze({
 fps:60,bpm:120,sampleRate:48000,framesPerBeat:30,framesPerBar:120,
 backbeats:[30,90],durationFrames:1560,
 cues:[
  [210,'controls-card'],[330,'controls-menu'],[390,'volume-click'],
  [450,'brightness-click'],[510,'brightness-restore'],[570,'combined-card'],
  [750,'chrome-menu'],[810,'New tab'],[870,'Bookmark'],[930,'Downloads'],
  [990,'photoshop-preview'],[1050,'photoshop-click'],[1110,'photoshop-menu'],
  [1170,'Brush'],[1230,'Pen'],[1290,'Duplicate layer'],[1410,'closing-card']
 ].map(([frame,name])=>Object.freeze({frame,name,beat:(frame%120)/30+1,sample:frame*800}))
});
