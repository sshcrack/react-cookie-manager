(()=>{var e={};e.id=931,e.ids=[931],e.modules={7849:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external")},2934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},5403:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external")},4580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},4749:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external")},5869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},8356:(e,t,a)=>{"use strict";a.r(t),a.d(t,{GlobalError:()=>n.a,__next_app__:()=>d,originalPathname:()=>u,pages:()=>x,routeModule:()=>g,tree:()=>c});var r=a(482),s=a(9108),l=a(2563),n=a.n(l),i=a(8300),o={};for(let e in i)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(o[e]=()=>i[e]);a.d(t,o);let c=["",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(a.bind(a,1136)),"/Users/james/Projects/Hypership/packages/react-cookie-manager/playground-next/src/app/page.tsx"]}]},{layout:[()=>Promise.resolve().then(a.bind(a,9342)),"/Users/james/Projects/Hypership/packages/react-cookie-manager/playground-next/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(a.t.bind(a,9361,23)),"next/dist/client/components/not-found-error"]}],x=["/Users/james/Projects/Hypership/packages/react-cookie-manager/playground-next/src/app/page.tsx"],u="/page",d={require:a,loadChunk:()=>Promise.resolve()},g=new r.AppPageRouteModule({definition:{kind:s.x.APP_PAGE,page:"/page",pathname:"/",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:c}})},7288:(e,t,a)=>{Promise.resolve().then(a.bind(a,8897))},8897:(e,t,a)=>{"use strict";a.r(t),a.d(t,{default:()=>u});var r=a(5344),s=a(3729),l=a(1202);let n=({theme:e="light",tFunction:t,onSave:a,onCancel:l,initialPreferences:n={Analytics:!1,Social:!1,Advertising:!1},detailedConsent:i})=>{let[o,c]=(0,s.useState)(n),x=e=>{c(t=>({...t,[e]:!t[e]}))},u=e=>{try{return new Date(e).toLocaleString(void 0,{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}catch(e){return"Invalid date"}},d=e=>{if(!i||!i[e])return null;let a=i[e];return r.jsx("p",{className:"text-xs mt-1 text-left text-gray-500",children:t("manageCookiesStatus",{status:a.consented?t("manageCookiesStatusConsented"):t("manageCookiesStatusDeclined"),date:u(a.timestamp)})})};return(0,r.jsxs)("div",{className:"flex flex-col gap-6",children:[(0,r.jsxs)("div",{children:[r.jsx("h3",{className:`text-sm font-semibold mb-2 ${"light"===e?"text-gray-900":"text-white"}`,children:t("manageTitle")}),r.jsx("p",{className:`text-xs ${"light"===e?"text-gray-700":"text-gray-200"}`,children:t("manageMessage")})]}),(0,r.jsxs)("div",{className:"flex flex-col gap-4",children:[(0,r.jsxs)("div",{className:"flex items-start justify-between",children:[(0,r.jsxs)("div",{children:[r.jsx("h4",{className:`text-xs font-medium text-left ${"light"===e?"text-gray-900":"text-white"}`,children:t("manageEssentialTitle")}),r.jsx("p",{className:`text-xs text-left ${"light"===e?"text-gray-600":"text-gray-400"}`,children:t("manageEssentialSubtitle")}),r.jsx("p",{className:"text-xs mt-1 text-left text-gray-500",children:t("manageEssentialStatus")})]}),r.jsx("div",{className:`px-3 py-1 text-xs text-center font-medium rounded-full ${"light"===e?"bg-gray-200 text-gray-600":"bg-gray-800 text-gray-300"}`,children:t("manageEssentialStatusButtonText")})]}),(0,r.jsxs)("div",{className:"flex items-start justify-between",children:[(0,r.jsxs)("div",{children:[r.jsx("h4",{className:`text-xs font-medium text-left ${"light"===e?"text-gray-900":"text-white"}`,children:t("manageAnalyticsTitle")}),r.jsx("p",{className:`text-xs text-left ${"light"===e?"text-gray-600":"text-gray-400"}`,children:t("manageAnalyticsSubtitle")}),d("Analytics")]}),(0,r.jsxs)("label",{className:"relative inline-flex items-center cursor-pointer",children:[r.jsx("input",{type:"checkbox",checked:o.Analytics,onChange:()=>x("Analytics"),className:"sr-only peer"}),r.jsx("div",{className:`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 
              ${"light"===e?"bg-gray-200 peer-checked:bg-blue-500":"bg-gray-700 peer-checked:bg-blue-500"} 
              peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 
              after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
              after:transition-all`})]})]}),(0,r.jsxs)("div",{className:"flex items-start justify-between",children:[(0,r.jsxs)("div",{children:[r.jsx("h4",{className:`text-xs font-medium text-left ${"light"===e?"text-gray-900":"text-white"}`,children:t("manageSocialTitle")}),r.jsx("p",{className:`text-xs text-left ${"light"===e?"text-gray-600":"text-gray-400"}`,children:t("manageSocialSubtitle")}),d("Social")]}),(0,r.jsxs)("label",{className:"relative inline-flex items-center cursor-pointer",children:[r.jsx("input",{type:"checkbox",checked:o.Social,onChange:()=>x("Social"),className:"sr-only peer"}),r.jsx("div",{className:`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 
              ${"light"===e?"bg-gray-200 peer-checked:bg-blue-500":"bg-gray-700 peer-checked:bg-blue-500"} 
              peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 
              after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
              after:transition-all`})]})]}),(0,r.jsxs)("div",{className:"flex items-start justify-between",children:[(0,r.jsxs)("div",{children:[r.jsx("h4",{className:`text-xs font-medium text-left ${"light"===e?"text-gray-900":"text-white"}`,children:t("manageAdvertTitle")}),r.jsx("p",{className:`text-xs text-left ${"light"===e?"text-gray-600":"text-gray-400"}`,children:t("manageAdvertSubtitle")}),d("Advertising")]}),(0,r.jsxs)("label",{className:"relative inline-flex items-center cursor-pointer",children:[r.jsx("input",{type:"checkbox",checked:o.Advertising,onChange:()=>x("Advertising"),className:"sr-only peer"}),r.jsx("div",{className:`w-11 h-6 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 
              ${"light"===e?"bg-gray-200 peer-checked:bg-blue-500":"bg-gray-700 peer-checked:bg-blue-500"} 
              peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 
              after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 
              after:transition-all`})]})]})]}),(0,r.jsxs)("div",{className:"flex flex-col sm:flex-row gap-3 mt-2",children:[l&&r.jsx("button",{onClick:l,className:`w-full sm:flex-1 px-3 py-2 sm:py-1.5 text-xs font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105 ${"light"===e?"bg-gray-200 hover:bg-gray-300 text-gray-800":"bg-gray-800 hover:bg-gray-700 text-gray-300"}`,children:t("manageCancelButtonText")}),r.jsx("button",{onClick:()=>{a(o)},className:"w-full sm:flex-1 px-3 py-2 sm:py-1.5 text-xs font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 hover:scale-105",children:t("manageSaveButtonText")})]})]})},i=()=>{let[e,t]=(0,s.useState)(!1);return(0,s.useEffect)(()=>{let e=()=>{t(window.innerWidth<640)};return e(),window.addEventListener("resize",e),()=>window.removeEventListener("resize",e)},[]),e},o=({showManageButton:e,privacyPolicyUrl:t,theme:a,tFunction:s,handleAccept:l,handleDecline:i,handleManage:o,isExiting:c,isEntering:x,isManaging:u,handleSavePreferences:d,handleCancelManage:g,displayType:m="banner",initialPreferences:f,detailedConsent:p})=>{let h=s("title");return(0,r.jsxs)("div",{className:"cookie-manager",children:["modal"===m&&r.jsx("div",{className:"fixed inset-0 z-[99999] bg-black/40 backdrop-blur-sm"}),r.jsx("div",{className:`
        fixed inset-x-0 bottom-0 px-4 pb-4 pt-2 z-[99999]
        transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
        ${c?"translate-y-full":x?"translate-y-full":"translate-y-0"}
      `,children:r.jsx("div",{className:`
            p-4 mx-auto max-w-[calc(100vw-32px)]
            ${"light"===a?"bg-white/95 ring-1 ring-black/10":"bg-black/95 ring-1 ring-white/10"}
            rounded-2xl backdrop-blur-sm backdrop-saturate-150
          `,children:u?r.jsx(n,{theme:a,tFunction:s,onSave:d,onCancel:g,initialPreferences:f,detailedConsent:p}):(0,r.jsxs)("div",{className:"flex flex-col gap-3",children:[h&&r.jsx("h3",{className:`font-semibold my-0 ${"light"===a?"text-gray-900":"text-white"}`,children:h}),r.jsx("p",{className:`text-sm ${"light"===a?"text-gray-700":"text-gray-200"}`,children:s("message")}),(0,r.jsxs)("div",{className:"flex flex-col gap-3",children:[r.jsx("button",{onClick:l,className:"w-full px-3 py-2.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 focus-visible:outline-none focus:outline-none focus-visible:outline-transparent focus:outline-transparent",children:s("buttonText")}),r.jsx("button",{onClick:i,className:`w-full px-3 py-2.5 text-sm font-medium rounded-lg focus-visible:outline-none focus:outline-none focus-visible:outline-transparent focus:outline-transparent
                    ${"light"===a?"bg-gray-200 hover:bg-gray-300 text-gray-800":"bg-gray-800 hover:bg-gray-700 text-gray-300"}`,children:s("declineButtonText")}),e&&r.jsx("button",{onClick:o,className:"w-full px-3 py-2.5 text-sm font-medium bg-transparent text-blue-500 border border-blue-500 rounded-lg hover:text-blue-400 hover:border-blue-400 focus-visible:outline-none focus:outline-none focus-visible:outline-transparent focus:outline-transparent",children:s("manageButtonText")})]}),t&&r.jsx("a",{href:t,target:"_blank",rel:"noopener noreferrer",className:`text-xs ${"light"===a?"text-gray-500 hover:text-gray-700":"text-gray-400 hover:text-gray-200"}`,children:s("privacyPolicyText")})]})})})]})},c=({showManageButton:e=!1,privacyPolicyUrl:t,displayType:a="banner",theme:n="light",tFunction:c,onAccept:x,onDecline:u,onManage:d,initialPreferences:g={Analytics:!1,Social:!1,Advertising:!1},detailedConsent:m,isManaging:f=!1})=>{let[p,h]=(0,s.useState)(!1),[b,y]=(0,s.useState)(!0),[v,j]=(0,s.useState)(!0),N=i();(0,s.useEffect)(()=>{setTimeout(()=>{y(!1)},50)},[]),(0,s.useEffect)(()=>{if(p){let e=setTimeout(()=>{j(!1)},500);return()=>clearTimeout(e)}},[p]);let k=e=>{e.preventDefault(),h(!0),setTimeout(()=>{x&&x()},500)},w=e=>{e.preventDefault(),h(!0),setTimeout(()=>{u&&u()},500)},$=e=>{e.preventDefault(),d&&d()};if(!v||f)return null;if(N)return(0,l.createPortal)(r.jsx(o,{showManageButton:e,privacyPolicyUrl:t,theme:n,tFunction:c,handleAccept:k,handleDecline:w,handleManage:$,isExiting:p,isEntering:b,isManaging:!1,handleSavePreferences:e=>{h(!0),setTimeout(()=>{d&&d(e)},500)},handleCancelManage:()=>{h(!0),setTimeout(()=>{d&&d()},500)},displayType:a,initialPreferences:g,detailedConsent:m}),document.body);let C=`
    fixed inset-0 flex items-center justify-center p-4
    ${"light"===n?"bg-black/20 backdrop-blur-sm":"bg-black/40 backdrop-blur-sm"}
    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
    z-[99999]
    ${p?"opacity-0":b?"opacity-0":"opacity-100"}
  `,T=`
    w-full max-w-lg rounded-xl p-6
    ${"light"===n?"bg-white/95 ring-2 ring-gray-200":"bg-black/95 ring-1 ring-white/10"}
    ${p?"scale-95":b?"scale-95":"scale-100"}
    transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
  `,P=`
    text-lg font-semibold mb-3
    ${"light"===n?"text-gray-900":"text-white"}
  `,S=`
    text-sm font-medium mb-6
    ${"light"===n?"text-gray-700":"text-gray-200"}
  `,_=`
    fixed bottom-4 left-4 w-80
    ${"light"===n?"bg-white/95 ring-1 ring-black/10 shadow-lg":"bg-black/95 ring-1 ring-white/10"}
    rounded-lg backdrop-blur-sm backdrop-saturate-150 
    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
    z-[99999] hover:-translate-y-2
    ${p?"opacity-0 scale-95":b?"opacity-0 scale-95":"opacity-100 scale-100"}
  `,A=`
    fixed bottom-4 left-1/2 -translate-x-1/2 w-full md:max-w-2xl
    ${"light"===n?"bg-white/95 border border-black/10 shadow-lg":"bg-black/95 ring-1 ring-white/10"}
    rounded-lg backdrop-blur-sm backdrop-saturate-150 
    transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]
    z-[99999] hover:-translate-y-2
    ${p?"opacity-0 transform translate-y-full":b?"opacity-0 transform translate-y-full":"opacity-100 transform translate-y-0"}
  `,E=`
    flex flex-col gap-4 p-4
    ${"light"===n?"text-gray-600":"text-gray-300"}
  `,z=`
    flex flex-col items-start gap-4 p-4
    ${"light"===n?"text-gray-600":"text-gray-300"}
  `,B=`
    text-sm font-semibold mb-1
    ${"light"===n?"text-gray-900":"text-white"}
  `,q=`
    text-sm font-semibold mb-2
    ${"light"===n?"text-gray-900":"text-white"}
  `,M=`
    text-xs sm:text-sm font-medium text-center sm:text-left
    ${"light"===n?"text-gray-700":"text-gray-200"}
  `,D=`
    text-xs font-medium
    ${"light"===n?"text-gray-700":"text-gray-200"}
  `,G=`
    px-3 py-1.5 text-xs font-medium rounded-md
    bg-blue-500 hover:bg-blue-600 text-white
    transition-all duration-200
    hover:scale-105 focus-visible:outline-none focus:outline-none
    focus-visible:outline-transparent focus:outline-transparent
    ${"popup"===a?"flex-1":""}
  `,U=`
    px-3 py-1.5 text-xs font-medium rounded-md
    ${"light"===n?"bg-gray-200 hover:bg-gray-300 text-gray-800":"bg-gray-800 hover:bg-gray-700 text-gray-300"}
    transition-all duration-200
    hover:scale-105 focus-visible:outline-none focus:outline-none
    focus-visible:outline-transparent focus:outline-transparent
    ${"popup"===a?"flex-1":""}
  `,H=`
    px-3 py-1.5 text-xs font-medium rounded-md
    border border-blue-500 text-blue-500
    bg-transparent
    hover:text-blue-600 hover:border-blue-600
    transition-all duration-200
    hover:scale-105 focus-visible:outline-none focus:outline-none
    focus-visible:outline-transparent focus:outline-transparent
  `,L=`
    text-xs font-medium
    ${"light"===n?"text-gray-500 hover:text-gray-700":"text-gray-400 hover:text-gray-200"}
    transition-colors duration-200
  `,F=()=>{switch(a){case"modal":return P;case"popup":return q;default:return B}},O=()=>{switch(a){case"modal":return S;case"popup":return D;default:return M}},I=r.jsx("div",{className:"cookie-manager",children:r.jsx("div",{className:(()=>{switch(a){case"modal":return C;case"popup":return _;default:return A}})().trim(),children:(0,r.jsxs)("div",{className:(()=>{switch(a){case"modal":return T;case"popup":return z;default:return E}})().trim(),children:[(()=>{let s=c("title");return"banner"===a?(0,r.jsxs)("div",{className:"flex flex-col gap-4",children:[(0,r.jsxs)("div",{children:[s&&r.jsx("p",{className:F().trim(),children:s}),r.jsx("p",{className:O().trim(),children:c("message")})]}),(0,r.jsxs)("div",{className:"flex items-center justify-between w-full",children:[t&&r.jsx("a",{href:t,target:"_blank",rel:"noopener noreferrer",className:L.trim(),children:c("privacyPolicyText")}),(0,r.jsxs)("div",{className:"flex items-center gap-3",children:[e&&r.jsx("button",{onClick:$,className:H.trim(),children:c("manageButtonText")}),r.jsx("button",{onClick:w,className:U.trim(),children:c("declineButtonText")}),r.jsx("button",{onClick:k,className:G.trim(),children:c("buttonText")})]})]})]}):(0,r.jsxs)("div",{className:"flex flex-col",children:[s&&r.jsx("p",{className:F().trim(),children:s}),r.jsx("p",{className:O().trim(),children:c("message")})]})})(),"popup"===a?(0,r.jsxs)("div",{className:"flex flex-col gap-3 w-full",children:[(0,r.jsxs)("div",{className:"flex items-center gap-3",children:[r.jsx("button",{onClick:w,className:U.trim(),children:c("declineButtonText")}),r.jsx("button",{onClick:k,className:G.trim(),children:c("buttonText")})]}),(0,r.jsxs)("div",{className:"flex flex-col gap-2 w-full",children:[e&&r.jsx("button",{onClick:$,className:`${H.trim()} w-full justify-center`,children:c("manageButtonText")}),t&&r.jsx("a",{href:t,target:"_blank",rel:"noopener noreferrer",className:L.trim(),children:c("privacyPolicyText")})]})]}):"modal"===a?r.jsx("div",{className:"flex flex-col gap-3",children:(0,r.jsxs)("div",{className:"flex items-center justify-between",children:[t&&r.jsx("a",{href:t,target:"_blank",rel:"noopener noreferrer",className:L.trim(),children:c("privacyPolicyText")}),(0,r.jsxs)("div",{className:"flex items-center gap-3",children:[e&&r.jsx("button",{onClick:$,className:H.trim(),children:c("manageButtonText")}),r.jsx("button",{onClick:w,className:U.trim(),children:c("declineButtonText")}),r.jsx("button",{onClick:k,className:G.trim(),children:c("buttonText")})]})]})}):null]})})});return(0,l.createPortal)(I,document.body)};var x=a(9758);function u(){let[e,t]=(0,s.useState)({analytics:!1,marketing:!1}),{t:a}=(0,x.$G)();return(0,r.jsxs)("main",{className:"flex min-h-screen flex-col items-center justify-between p-24",children:[r.jsx("h1",{className:"text-4xl font-bold",children:"Cookie Consent Playground"}),r.jsx("div",{className:"flex flex-col gap-4",children:(0,r.jsxs)("div",{className:"p-4 border rounded",children:[r.jsx("h2",{className:"text-xl font-semibold mb-2",children:"Current Consent State:"}),r.jsx("pre",{children:JSON.stringify(e,null,2)})]})}),r.jsx(c,{tFunction:a,showManageButton:!0,privacyPolicyUrl:"https://example.com/privacy",displayType:"banner",theme:"light",onAccept:()=>{t({analytics:!0,marketing:!0}),console.log("Cookies accepted")},onDecline:()=>{t({analytics:!1,marketing:!1}),console.log("Cookies declined")},onManage:e=>{e&&(t(e),console.log("Cookie preferences updated:",e))}})]})}},1136:(e,t,a)=>{"use strict";a.r(t),a.d(t,{$$typeof:()=>l,__esModule:()=>s,default:()=>n});let r=(0,a(6843).createProxy)(String.raw`/Users/james/Projects/Hypership/packages/react-cookie-manager/playground-next/src/app/page.tsx`),{__esModule:s,$$typeof:l}=r,n=r.default}};var t=require("../webpack-runtime.js");t.C(e);var a=e=>t(t.s=e),r=t.X(0,[21,427],()=>a(8356));module.exports=r})();