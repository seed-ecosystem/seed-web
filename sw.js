if(!self.define){let e,s={};const i=(i,n)=>(i=new URL(i+".js",n).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(n,r)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let c={};const o=e=>i(e,t),l={module:{uri:t},exports:c,require:o};s[t]=Promise.all(n.map((e=>l[e]||o(e)))).then((e=>(r(...e),c)))}}define(["./workbox-5ffe50d4"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/b4a90b39168f4e38b6de8.css",revision:null},{url:"assets/ce2f51ee5625c7cb71c02.js",revision:null},{url:"index.html",revision:"203c0999e7cdfbe20b93219627c1231b"},{url:"registerSW.js",revision:"04d776ecba8e64ad05214fedb6230520"},{url:"icon.svg",revision:"400de37377551a72fb3d501bf84cba17"},{url:"manifest.webmanifest",revision:"170ace4876d92c8cb2c9390df347020c"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
//# sourceMappingURL=sw.js.map
