// One continuous picture edit, locked to the same clock as the film.
export function createCinemaScore(src, duration, onError) {
 const audio=new Audio(src);
 audio.preload='metadata';audio.volume=0;audio.preservesPitch=true;
 let enabled=false,position=0,playing=false,speed=1,visible=true,pending=null,mix=0,lastFrame=0,failed=null;
 const levels=[[0, 0.9], [13, 0.9], [23, 0.76], [45, 0.72], [57, 0.65], [67, 0.52], [96, 0.52], [105, 0.85], [129, 0.85], [165, 0.94], [174, 1], [209, 1], [221, 0.8], [243, 0.75], [252, 0.94], [258, 0.85], [266, 0]];
 function levelAt(t){
  for(let i=1;i<levels.length;i++)if(t<=levels[i][0]){
   const [a,x]=levels[i-1],[b,y]=levels[i],p=Math.max(0,Math.min(1,(t-a)/(b-a)));
   return x+(y-x)*p;
  }
  return 0;
 }
 const active=()=>enabled&&playing&&visible&&position<duration;
 function align(force=false){
  if(audio.readyState>0&&(force||Math.abs(audio.currentTime-position)>.45))audio.currentTime=Math.min(position,Math.max(0,audio.duration-.015));
 }
 async function resume(){
  if(!active()||!audio.paused)return;
  if(pending)return pending;
  align(true);
  pending=audio.play().then(()=>{if(!active())audio.pause();}).catch(error=>{
   // A pause or seek may legitimately interrupt a pending play request.
   if(error.name==='AbortError')return;
   failed=error.message;enabled=false;audio.pause();onError?.(error);throw error;
  }).finally(()=>{pending=null;});
  return pending;
 }
 function sync(nextPosition,nextPlaying,nextSpeed=1,nextVisible=true){
  position=Math.max(0,Math.min(duration,nextPosition));playing=nextPlaying;speed=nextSpeed;visible=nextVisible;
  audio.playbackRate=speed;align();
  if(active())void resume().catch(()=>{});
  else{audio.pause();audio.volume=0;mix=0;}
 }
 function tick(now){
  const dt=lastFrame?Math.min(.1,(now-lastFrame)/1000):0;lastFrame=now;
  const target=(active()&&!audio.paused) ? .78*levelAt(position) : 0;
  mix+=(target-mix)*(1-Math.exp(-dt/.18));
  audio.volume=Math.max(0,Math.min(1,mix));requestAnimationFrame(tick);
 }
 audio.addEventListener('loadedmetadata',()=>align(true));
 audio.addEventListener('error',()=>{failed=audio.error?.message||'Music could not be loaded';enabled=false;onError?.(new Error(failed));});
 requestAnimationFrame(tick);
 return {
  sync,
  async setEnabled(value){enabled=value;if(enabled){failed=null;await resume();}else{audio.pause();audio.volume=0;mix=0;}},
  get state(){return{enabled,time:audio.currentTime,duration:audio.duration,paused:audio.paused,playbackRate:audio.playbackRate,preservesPitch:audio.preservesPitch,readyState:audio.readyState,volume:audio.volume,error:failed};}
 };
}
