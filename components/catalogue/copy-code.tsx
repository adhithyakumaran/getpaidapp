'use client';
import { useEffect,useRef, useState } from 'react';
import { Icon } from './chrome';
export function CopyCode({code,compact=false}:{code:string;compact?:boolean}) {
  const [revealed,setRevealed]=useState(false);
  const [state,setState]=useState<'idle'|'copying'|'copied'|'error'>('idle');const text=useRef<HTMLElement>(null);
  async function copy() {
    setRevealed(true);
    setState('copying');
    try {await navigator.clipboard.writeText(code);setState('copied');}
    catch {setState('error');}
  }
  useEffect(()=>{if(state!=='error')return;const selection=window.getSelection();if(selection&&text.current){const range=document.createRange();range.selectNodeContents(text.current);selection.removeAllRanges();selection.addRange(range);}},[state]);
  return <div className={`copy-control ${compact?'copy-compact':''}`}><div className={`code-line ${revealed?'code-revealed':'code-masked'}`}><code ref={text} tabIndex={revealed?0:-1} aria-label={revealed?`Coupon code ${code}`:'Coupon code hidden'}>{revealed?code:'••••••••'}</code><button className="btn btn-primary reveal-button" onClick={copy} disabled={state==='copying'}><Icon name={state==='copied'?'check':'ticket'}/>{state==='copied'?'Copied':state==='copying'?'Copying':revealed?'Copy code':compact?'Reveal code':'Reveal & copy code'}</button></div><p className="copy-feedback" role="status" aria-live="polite">{state==='copied'?'Code revealed and copied.':state==='error'?'Copy unavailable. The code is selected so you can copy it manually.':compact?'Not checkout tested.':'Reveal the code, then check the source conditions.'}</p></div>;
}
