import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";                                                                                                                                                          
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const SHEET_ID = "17aB2MrWCG573pSNPatGqQ89UglR0mhCokGb1C0CG7bw";
const SHEET_GVIZ_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

export default function PanelInnovaBeach(){
  const [rows,setRows]=useState([]);
  const [loading,setLoading]=useState(true);
  const [dark,setDark]=useState(()=>{try{const s=localStorage.getItem('ib_dark'); if(s!==null) return s==='1'; const isMobile=typeof navigator!=='undefined' && /Mobi|Android|iPhone|iPad|Mobile/.test(navigator.userAgent); return isMobile;}catch(e){return true}});
  const [showQR,setShowQR]=useState(false);
  const [showIncident,setShowIncident]=useState(false);
  useEffect(()=>{document.documentElement.classList.toggle('dark',dark); try{localStorage.setItem('ib_dark',dark?'1':'0')}catch(e){}},[dark]);
  useEffect(()=>{fetch(SHEET_GVIZ_URL).then(r=>r.text()).then(text=>{const jsonText=text.replace(/^.*setResponse\(|\);?\s*$/gs,'');const data=JSON.parse(jsonText);const table=data.table;const cols=table.cols.map(c=>c.label||c.id);const rows=table.rows.map(r=>{const obj={};r.c.forEach((cell,i)=>obj[cols[i]]=(cell&&cell.v)||"");return obj;});setRows(rows.reverse());}).catch(e=>console.error(e)).finally(()=>setLoading(false));},[]);
  const tasksList=["Poner ventanas","Poner hojas correderas","Cristales fijos","Poner manetas","Regular","Poner cierres","Poner chapita","Poner ángulos exteriores","Esquinero","Sellado interior","Sellado exterior","Poner puerta peatonal","Bajo escalera","Poner cristales solarium","Poner cristales terraza","Sellar cristales","Poner vigas 7016","Ventanas de sótano"];
  function calcProgressForVivienda(v){const latest=rows.find(r=>r['Vivienda']===v); if(!latest) return {done:0,total:tasksList.length,pct:0}; let done=0; tasksList.forEach(t=>{ if(latest[t] && String(latest[t]).toLowerCase().includes('sí')) done++; }); const pct=Math.round((done/tasksList.length)*1000)/10; return {done,total:tasksList.length,pct};}
  const bloques={}; for(let i=1;i<=24;i++){ const v=`V${i}`; const info=calcProgressForVivienda(v); const bloque=(i<=6)?'Bloque 1':(i<=22?'Bloque 2':'Dúplex'); if(!bloques[bloque]) bloques[bloque]=[]; bloques[bloque].push({vivienda:v,...info}); }
  function renderProgressBar(pct){return <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden"><div className="h-3 rounded-full" style={{width:`${pct}%`,background:`linear-gradient(90deg,#0A4BE0,#007AFF)`}}></div></div>}
  async function generatePDF(){try{const el=document.getElementById('panel-root'); if(!el) return alert('Elemento de panel no encontrado.'); const canvas=await html2canvas(el,{scale:2}); const imgData=canvas.toDataURL('image/png'); const pdf=new jsPDF('p','mm','a4'); const imgProps=pdf.getImageProperties(imgData); const pdfWidth=pdf.internal.pageSize.getWidth(); const pdfHeight=(imgProps.height*pdfWidth)/imgProps.width; pdf.addImage(imgData,'PNG',0,0,pdfWidth,pdfHeight); pdf.save(`Progreso_InnovaBeachIII_${new Date().toISOString().slice(0,10)}.pdf`);}catch(e){console.error(e); alert('Error generando PDF: '+e.message);} }
  const INCIDENT_FORM_URL='';
  return (
    <div id="panel-root" className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-white p-4">
      <header className="max-w-5xl mx-auto flex items-center justify-between mb-4">
        <div className="flex items-center gap-4"><img src="/logo-innova.png" alt="Innova" className="h-10"/><div><div className="text-sm text-slate-500 dark:text-slate-300">PROGRESO OBRA</div><div className="text-2xl font-semibold">Innova Beach III — Control de montaje</div></div></div>
        <div className="flex items-center gap-3">
          <button onClick={()=>setShowQR(true)} className="px-3 py-2 bg-white dark:bg-slate-800 border rounded shadow-sm">QR</button>
          <button onClick={()=>setShowIncident(true)} className="px-3 py-2 bg-green-600 text-white rounded shadow-sm">Incidencia</button>
          <button onClick={generatePDF} className="px-3 py-2 bg-indigo-600 text-white rounded shadow-sm">Descargar PDF</button>
          <button onClick={()=>setDark(d=>!d)} className="px-3 py-2 bg-blue-600 text-white rounded shadow-sm">{dark? 'Modo claro' : 'Modo oscuro'}</button>
          <img src="/logo-winplast.png" alt="Winplast" className="h-10"/>
        </div>
      </header>
      <main className="max-w-5xl mx-auto"> 
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white dark:bg-slate-800 rounded shadow"> <div className="text-sm text-slate-400">Progreso total</div>
            {(()=>{const all=Object.values(bloques).flat(); const avg=Math.round((all.reduce((s,x)=>s+x.pct,0)/all.length)*10)/10||0; return (<><div className="text-3xl font-bold my-2">{avg}%</div>{renderProgressBar(avg)}</>);})()}
          </div>
          {Object.keys(bloques).slice(0,2).map(bk=>(<div key={bk} className="p-4 bg-white dark:bg-slate-800 rounded shadow"><div className="text-sm text-slate-400">{bk}</div>{(()=>{const list=bloques[bk]; const avg=Math.round((list.reduce((s,x)=>s+x.pct,0)/list.length)*10)/10; return (<><div className="text-2xl font-semibold">{avg}%</div>{renderProgressBar(avg)}<div className="mt-2 text-sm">{list.filter(x=>x.pct===100).length} finalizadas • {list.filter(x=>x.pct>0 && x.pct<100).length} en proceso • {list.filter(x=>x.pct===0).length} pendientes</div></>);})()}</div>))}
          <div className="p-4 bg-white dark:bg-slate-800 rounded shadow"><div className="text-sm text-slate-400">Dúplex</div>{(()=>{const list=bloques['Dúplex']; const avg=Math.round((list.reduce((s,x)=>s+x.pct,0)/list.length)*10)/10; return (<><div className="text-2xl font-semibold">{avg}%</div>{renderProgressBar(avg)}<div className="mt-2 text-sm">{list.filter(x=>x.pct===100).length} finalizadas • {list.filter(x=>x.pct>0 && x.pct<100).length} en proceso • {list.filter(x=>x.pct===0).length} pendientes</div></>);})()}</div>
        </section>
        <section className="mb-6"><h3 className="text-lg font-semibold mb-3">Viviendas (resumen)</h3><div className="grid grid-cols-1 md:grid-cols-3 gap-3">{Object.values(bloques).flat().map(v=>(<div key={v.vivienda} className="p-3 bg-white dark:bg-slate-800 rounded shadow flex flex-col"><div className="flex items-center justify-between mb-2"><div><div className="font-semibold">{v.vivienda}</div><div className="text-sm text-slate-400">Tipo</div></div><div className="text-right"><div className="text-xl font-bold">{v.pct}%</div><div className="text-sm text-slate-400">{v.done}/{v.total}</div></div></div><div className="mt-auto">{renderProgressBar(v.pct)}</div></div>))}</div></section>
        <section><h3 className="text-lg font-semibold mb-3">Últimas respuestas</h3><div className="space-y-2">{loading? <div>Cargando...</div> : rows.slice(0,10).map((r,idx)=>(<div key={idx} className="p-3 bg-white dark:bg-slate-800 rounded shadow flex items-center justify-between"><div><div className="font-medium">{r["Vivienda"]} — {r["Bloque"]}</div><div className="text-sm text-slate-400">{r["Marca temporal"]}</div><div className="text-sm">{r["Tareas realizadas"]}</div></div><div className="flex items-center gap-3">{r["Foto"]? <a href={r["Foto"]} target="_blank" rel="noreferrer"><img src={r["Foto"]} alt="foto" className="h-16 w-24 object-cover rounded"/></a> : <div className="text-sm text-slate-400">Sin foto</div>}</div></div>))}</div></section></main>
      {showQR && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-800 p-6 rounded shadow max-w-sm w-full text-center"><h4 className="font-semibold mb-2">QR para abrir el panel</h4><div className="mb-3"><QRCodeCanvas value={window.location.href} size={200} /></div><div className="flex gap-2 justify-center"><button onClick={()=>{navigator.clipboard?.writeText(window.location.href);} } className="px-3 py-2 bg-blue-600 text-white rounded">Copiar enlace</button><button onClick={()=>setShowQR(false)} className="px-3 py-2 bg-slate-200 rounded">Cerrar</button></div></div></div>)}
      {showIncident && (<IncidentModal onClose={()=>setShowIncident(false)} formUrl={INCIDENT_FORM_URL} sheetId={SHEET_ID} />)}
    </div>
  );
}

function IncidentModal({onClose,formUrl,sheetId}){const [text,setText]=useState("");const [vivienda,setVivienda]=useState("");const [bloque,setBloque]=useState("");const submit=()=>{if(formUrl){window.open(formUrl,"_blank");onClose();return;}const subject=encodeURIComponent("Incidencia - Innova Beach III");const body=encodeURIComponent(`Bloque: ${bloque}\nVivienda: ${vivienda}\nDescripcion:\n${text}`);window.location.href=`mailto:tu-email@empresa.com?subject=${subject}&body=${body}`;}return(<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"><div className="bg-white dark:bg-slate-800 p-6 rounded shadow max-w-lg w-full"><h3 className="text-lg font-semibold mb-2">Reportar incidencia</h3><div className="space-y-2"><div><label className="block text-sm">Bloque</label><input value={bloque} onChange={e=>setBloque(e.target.value)} className="w-full p-2 rounded bg-slate-50 dark:bg-slate-700"/></div><div><label className="block text-sm">Vivienda</label><input value={vivienda} onChange={e=>setVivienda(e.target.value)} className="w-full p-2 rounded bg-slate-50 dark:bg-slate-700"/></div><div><label className="block text-sm">Descripción</label><textarea value={text} onChange={e=>setText(e.target.value)} className="w-full p-2 rounded h-28 bg-slate-50 dark:bg-slate-700"/></div></div><div className="flex gap-2 mt-4 justify-end"><button onClick={submit} className="px-4 py-2 bg-green-600 text-white rounded">Enviar</button><button onClick={onClose} className="px-4 py-2 bg-slate-200 rounded">Cerrar</button></div></div></div>)}
