import Sketchfab from '@sketchfab/viewer-api';
const linear=h=>{const v=parseInt(h,16)/255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};
export async function makeExternal(host,status,model,reduced){
 const frame=document.createElement('iframe');
 frame.tabIndex=-1;
 frame.title='Интерактивная 3D-модель BMW M5 G90 — JUSTGAME';
 frame.allow='autoplay; fullscreen';
 frame.referrerPolicy='strict-origin-when-cross-origin';
 host.append(frame);
 let api,ready=false,baseline,colors=[],originalColors=new Map(),chosen;
 const paint=hex=>{
  chosen=hex;
  if(!ready||!colors.length)return;
  for(const m of colors){
   const target=m.channels.AlbedoPBR??m.channels.DiffusePBR??m.channels.DiffuseColor;
   target.color=hex===model.colors[0][0]?originalColors.get(m.id).slice():hex.slice(1).match(/../g).map(linear);
   api.setMaterial(m);
  }
 };
 const updateStatus=message=>{if(host.dataset.engine==='embed')status.textContent=message};
 const fallback=()=>{
  if(ready)return;
  host.dataset.embedReady='false';frame.tabIndex=-1;
  updateStatus('Показан статичный ракурс BMW M5.');
 };
 const timeout=setTimeout(fallback,14000);
 try{
  new Sketchfab('1.12.1',frame).init(model.embed,{
   autostart:1,preload:1,ui_infos:0,ui_help:0,ui_inspector:0,ui_watermark_link:0,ui_settings:0,ui_annotations:0,ui_ar:0,ui_stop:0,
   success(client){
    api=client;
    api.addEventListener('viewerready',()=>{
     ready=true;frame.tabIndex=0;clearTimeout(timeout);host.dataset.embedReady='true';updateStatus('');
     api.getCameraLookAt((err,pose)=>{if(!err)baseline=pose});
     api.getMaterialList((err,mats)=>{
      if(err)return;
      colors=mats.filter(m=>/paint|coloured|colored|car.?body/i.test(m.name)&&(m.channels.AlbedoPBR??m.channels.DiffusePBR??m.channels.DiffuseColor)?.color);
      for(const m of colors)originalColors.set(m.id,(m.channels.AlbedoPBR??m.channels.DiffusePBR??m.channels.DiffuseColor).color.slice());
      host.dispatchEvent(new CustomEvent('embed-paint',{detail:colors.length>0}));
      if(chosen)paint(chosen);
     });
    });
    api.start();
   },
   error(){clearTimeout(timeout);fallback()}
  });
 }catch{clearTimeout(timeout);fallback()}
 return {
  paint,
  control(key){
   if(!ready)return;
   const duration=reduced?0:.35;
   if(key==='reset'&&baseline){api.setCameraLookAt(baseline.position,baseline.target,duration);return;}
   if(key!=='plus'&&key!=='minus')return;
   api.getCameraLookAt((err,pose)=>{
    if(err)return;
    const factor=key==='plus'?.84:1.19;
    const p=pose.position.map((x,i)=>pose.target[i]+(x-pose.target[i])*factor);
    api.setCameraLookAt(p,pose.target,duration);
   });
  }
 };
}
