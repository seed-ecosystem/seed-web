if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let o={};const d=e=>i(e,t),c={module:{uri:t},exports:o,require:d};s[t]=Promise.all(n.map((e=>c[e]||d(e)))).then((e=>(r(...e),o)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/9d55fddebd30f4a90b733.css",revision:null},{url:"assets/e509030a577ab6543f46f.js",revision:null},{url:"index.html",revision:"0b880902cd9d60f2d525d5a39b1e31c3"},{url:"registerSW.js",revision:"04d776ecba8e64ad05214fedb6230520"},{url:"icon.svg",revision:"400de37377551a72fb3d501bf84cba17"},{url:"manifest.webmanifest",revision:"170ace4876d92c8cb2c9390df347020c"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
//# sourceMappingURL=sw.js.map
