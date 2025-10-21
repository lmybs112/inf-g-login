var test="A";function IDRxGet(t,e,n,o,a,i){if("undefined"!=typeof ga&&"function"==typeof ga.getAll&&void 0!==ga.getAll()[0])try{var r=ga.getAll()[0].get("clientId")}catch(t){r="notfoundgaid"}else r="notfoundgaid";n.postMessage({MsgHeader:"IDRxGet",MRID:t,GVID:e,LGVID:o,ga_id:r,TESTING:a,SizeAIFast_switch:i},"*")}var makeid=function(t){for(var e="",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",o=n.length,a=0;a<t;a++)e+=n.charAt(Math.floor(Math.random()*o));return e},time_count=0;function checkloaded(){void 0!==document.body?Trigger_infFITS():(time_count<=20&&setTimeout(checkloaded,250),time_count+=.25)}function Trigger_infFITS(){!function($){var s,d="ontouchstart"in window||0<navigator.maxTouchPoints,h=d?"touchstart":"click",t=document.createElement("link");t.rel="preconnect",t.href="https://fonts.googleapis.com",document.head.appendChild(t);t=document.createElement("link");t.rel="preconnect",t.href="https://fonts.gstatic.com",t.crossorigin="anonymous",document.head.appendChild(t);t=document.createElement("link");t.rel="stylesheet",t.href="https://fonts.googleapis.com/css2?family=Chocolate+Classical+Sans&family=Figtree:ital,wght@0,300..900;1,300..900&family=Noto+Sans+TC:wght@100..900&display=swap",document.head.appendChild(t);t=document.createElement("script");t.src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js",t.crossorigin="anonymous",document.head.appendChild(t);t=document.createElement("style");t.id="bootstrap-scoped",document.head.appendChild(t);t=document.createElement("style");t.type="text/css",t.innerHTML=`
    @charset "UTF-8";
  :root {
    --dark-primary-color: rgba(51, 51, 51, 1);
    --light-primary-color: rgba(144, 144, 144, 1);
    --light-background-color: rgba(245, 245, 245, 1);
    --light-primary-color: rgba(255, 255, 255, 0.5);
  }
  
  /* modal trigger button */
  .trigger-icon--text{
    box-sizing: border-box;
    font-family:"Chocolate Classical Sans", sans-serif;
    color: #F3F3EF;
    opacity: 0.9;
    text-align: center;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 16px;
    letter-spacing: 0.78px;
    overflow-wrap: break-word;
  }
  #panelTagBtn.trigger-icon--shirt{
  position: fixed; right: 0px; top: calc(50vh - 88.5px);
  display: flex;
  padding: 11px 10px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width:40px;
  gap: 4px;
  box-sizing: border-box;
  border-radius: 13px 0px 0px 13px;
  background:  #1E1E19;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='110' viewBox='0 0 40 110' fill='none'%3E%3Cpath d='M0 0H40V110H0V0Z' fill='%231E1E19'/%3E%3Cpath d='M0 0H40V110H0V0Z' fill='black' fill-opacity='0.1'/%3E%3C/svg%3E");
  background-size: cover;
  background-position:center;
  background-repeat: no-repeat;
  box-shadow: 0px 0.5px 5px 0px rgba(0, 0, 0, 0.14), 0px 0px 20px 0px rgba(0, 0, 0, 0.15);
    font-family: "Chocolate Classical Sans", sans-serif;
    z-index:1000000000; cursor: pointer
    ; transition:background 300ms ease-out;opacity 0.3s ease-out; opacity: 1; pointer-events: auto; font-weight: 400; left: auto;
    transition: 0.5s;
  }
    #panelTagBtn.trigger-icon--shirt:hover{
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='110' viewBox='0 0 40 110' fill='none'%3E%3Cg clip-path='url(%23clip0_403_4114)'%3E%3Cpath d='M51.5 5L-8 52.5' stroke='white' stroke-opacity='0.07' stroke-width='10'/%3E%3Cpath opacity='0.07' d='M53.5 65L-8 113' stroke='%23F3F3EF' stroke-width='3'/%3E%3Cpath opacity='0.07' d='M58.5 43L-8 94.5' stroke='%23F3F3EF' stroke-width='14'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0_403_4114'%3E%3Cpath d='M0 13C0 5.8203 5.8203 0 13 0H40V110H13C5.8203 110 0 104.18 0 97V13Z' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E");    background-repeat: no-repeat;
      background-size: cover;
      background-position:center;
      background-repeat: no-repeat;
    }
    #panelTagBtn.trigger-icon--shirt:hover #svg-shirt,
    #panelTagBtn.trigger-icon--shirt:hover span{
      opacity: 1;
    }
  
  .inf-panel-container .btn.btn-light.trigger-icon--shirt {
    display: none;
    position: fixed;
    bottom: 18px;
    right: 18px;
    background: #fff;
    box-shadow: 0px 0.5px 5px 0px rgba(0, 0, 0, 0.25), 0px 0px 20px 0px rgba(0, 0, 0, 0.15);
    width: 70px;
    height: 70px;
    cursor: pointer;
    border-radius: 25px;
    -webkit-border-radius: 25px;
    -moz-border-radius: 25px;
    -ms-border-radius: 25px;
    -o-border-radius: 25px;
    z-index: 99;
  }
  
  .inf-panel-container .fixed-panel-header {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    padding: 12px;
    z-index: 999;
  }
  
  .inf-panel-container .toggle-btn-container {
    border-radius: 100px;
    border: 1px solid rgba(59, 59, 50, 0.18);
    background: rgba(255, 255, 255, 0.3);
    box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.05);
    display: flex;
    padding: 10px;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
  }
  
  .inf-panel-container button#guideBtn,
  .inf-panel-container button#AIbtn {
    cursor: pointer;
    padding: 10px 0;
    width: 100%;
    color: rgba(59, 59, 50, 0.5);
    font-family: "Chocolate Classical Sans", "Figtree", sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 19px;
  }
  
  .inf-panel-container .btn-custom-size {
    font-size: 14px;
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.15);
  }
  
  .inf-panel-container .btn.btn-white {
    /* background-color: #ebebeb; */
    background-color: var(--light-background-color);
    border: 0cm;
    font-weight: 400;
    color: rgb(144, 144, 144) !important;
  }
  
  .inf-panel-container .btn.btn-active {
    background-color: var(--dark-primary-color) !important;
    border: none;
    z-index: 1060;
    color: #f3f3ef !important;
    font-family: "Chocolate Classical Sans";
    font-size: 14px;
    font-style: normal;
    font-weight: 400;
    line-height: 19px; /* 135.714% */
  }
  
  /* .inf-panel-container .overlap-btn {
    width: calc(50% + 15px);
    z-index: 1;
  }
  
  .inf-panel-container .overlap-btn:first-child {
    margin-right: -30px;
  } */
  .inf-panel-container .btn.overlap-btn:hover {
    z-index: 1070;
    /* background-color: rgb(184, 184, 184); */
    box-shadow: 0px 2px 10px 0px rgba(0, 0, 0, 0.15);
    /* color: #6a675d; */
  }
  
  .inf-panel-container #info-content {
    padding: 0 18px;
    height: 100%;
  }
  
  .inf-panel-container #info-content #modalInfoAccordion {
    padding-top: 65px;
    padding-bottom: 12px;
  }
  
  .inf-panel-container .accordion-button.collapsed,
  .accordion-button:not(.collapsed) {
    background: transparent;
    border-bottom: none;
  }
  
  .inf-panel-container .accordion-item,
  .inf-panel-container .accordion-button {
    background-color: transparent !important;
  }
  
  .inf-panel-container .accordion-header {
    padding: 21px 0;
  }
  
  /* accordion */
  .inf-panel-container .accordion-button {
    padding: 0;
    font-size: 14px;
    color: #333;
    font-family: "Noto Sans TC", sans-serif;
    font-style: normal;
    font-weight: 500;
    line-height: 19px; /* 135.714% */
  }
  
  .inf-panel-container .accordion-button.collapsed,
  .inf-panel-container .accordion-button:not(.collapsed) {
    background: #fff;
    border-bottom: 1px solid var(--light-primary-color);
  }
  
  .inf-panel-container .accordion-button,
  .inf-panel-container .accordion-button:focus {
    box-shadow: none;
    border-color: transparent;
  }
  
  .inf-panel-container .accordion-button.collapsed:not(:last-child) {
    border-color: var(--light-primary-color);
  }
  
  /* .accordion-button::after {
  
  } */
  .inf-panel-container .accordion-button:not(.collapsed)::after {
    transform: rotate(0deg);
    -webkit-transform: rotate(0deg);
    -moz-transform: rotate(0deg);
    -ms-transform: rotate(0deg);
    -o-transform: rotate(0deg);
    background-image: url("https://raw.githubusercontent.com/infFITSDevelopment/pop-ad/refs/heads/main/more.svg");
    background-size: auto;
    background-position: center;
  }
  
  .inf-panel-container .accordion-button.collapsed::after {
    background-image: url("https://raw.githubusercontent.com/infFITSDevelopment/pop-ad/refs/heads/main/more.svg");
    background-size: auto;
    background-position: center;
    transform: rotate(-90deg);
    -webkit-transform: rotate(-90deg);
    -moz-transform: rotate(-90deg);
    -ms-transform: rotate(-90deg);
    -o-transform: rotate(-90deg);
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    -moz-transition: all 0.5s;
    -ms-transition: all 0.5s;
    -o-transition: all 0.5s;
  }
  
  .inf-panel-container div.accordion-body {
    padding: 8px;
  }
  
  .inf-panel-container #modalSizeInfo {
    max-width: 100%;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .inf-panel-container #modalSizeInfo::-webkit-scrollbar {
    display: none;
  }
  
  /* table */
  .inf-panel-container table {
    text-align: center;
    width: 100%;
    border-collapse: separate;
    color: #000;
    font-family: "Chocolate Classical Sans", "Figtree", sans-serif;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 18px;
  }
  
  .inf-panel-container .size-table--panel thead th {
    font-weight: 400;
    text-wrap: nowrap;
  }
  
  .inf-panel-container .size-table--panel tr {
    display: block;
  }
  
  .inf-panel-container .size-table--panel thead tr {
    border: none;
  }
  
  .inf-panel-container .size-table--panel tbody tr {
    margin-bottom: 6px;
  }
  
  .inf-panel-container th,
  .inf-panel-container td {
    width: 100px;
    padding: 12px 18px;
    white-space:nowrap;
  }
  
  .inf-panel-container .size-table--panel thead th {
    position: sticky;
    /* background: #fff; */
    top: 0;
    z-index: 2; /* 保證表頭高於內容 */
  }
  
  .inf-panel-container .size-table--panel tbody td:first-child,
  .inf-panel-container .size-table--panel thead th:first-child {
    position: sticky;
    left: 0;
    z-index: 99;
    /*保證左邊第一列高於其它列*/
    transition: background-color 0.3s ease;
    -webkit-transition: background-color 0.3s ease;
    -moz-transition: background-color 0.3s ease;
    -ms-transition: background-color 0.3s ease;
    -o-transition: background-color 0.3s ease;
  }
  
  .inf-panel-container .size-btn--panel {
    cursor: pointer;
    color: rgb(144, 144, 144);
    transition: color 0.3s;
    -webkit-transition: color 0.3s;
    -moz-transition: color 0.3s;
    -ms-transition: color 0.3s;
    -o-transition: color 0.3s;
  }
  
  .inf-panel-container .size-btn:hover {
    color: rgba(144, 144, 144, 0.75);
  }
  
  .inf-panel-container .size-btn:not(.selected) {
    border-radius: 13px;
    border: 1px solid rgba(59, 59, 50, 0.14);
    background: #fff;
    -webkit-border-radius: 13px;
    -moz-border-radius: 13px;
    -ms-border-radius: 13px;
    -o-border-radius: 13px;
  }
  
  .inf-panel-container .size-btn--panel.selected {
    color: #000;
    font-weight: 500;
    border: 1px solid #3b3b32;
    background: #f3f3ef;
    border-radius: 13px;
    -webkit-border-radius: 13px;
    -moz-border-radius: 13px;
    -ms-border-radius: 13px;
    -o-border-radius: 13px;
  }
  
  .inf-panel-container .size-btn--panel.selected:hover {
    color: rgba(51, 51, 51, 0.75);
  }
  
  /* .size-btn--panel.selected td:first-child {
    background-color: rgba(240, 240, 240, 1);
  } */
  .inf-panel-container .modal-right-top {
    display: block;
    position: absolute;
    top: 2vh;
    right: 1vw;
    max-width: 100vw;
    width: 400px;
    height: 95vh;
    max-height: 700px;
    margin: 0px;
    padding: 20px;
    z-index: 1050;
    background-color: white;
    box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.15);
    transform: translateX(0%);
    transition: transform 350ms ease;
    -webkit-transition: transform 350ms ease;
    -moz-transition: transform 350ms ease;
    -ms-transition: transform 350ms ease;
    -o-transition: transform 350ms ease;
    -webkit-transform: translateX(0%);
    -moz-transform: translateX(0%);
    -ms-transform: translateX(0%);
    -o-transform: translateX(0%);
  }
  
  .inf-panel-container #panel-content.panelOffcanvas-body {
    padding: 0;
    overflow: hidden;
    position: relative;
  }
  
  .panelOffcanvas-backdrop {
    visibility: "hidden";
    opacity: 0;
    position: fixed;
    width: 100%;
    height: 100%;
    transition: visibility 0s linear 0.2s, opacity 0.2s linear; /* 動畫效果 */
  }
  
  .panelOffcanvas-backdrop.show {
    opacity: 1 !important;
    z-index: 999;
    background-color: rgba(0, 0, 0, 0.3) !important;
    backdrop-filter: blur(12px) !important;
    -webkit-backdrop-filter: blur(12px) !important;
  }
  
  .inf-panel-container .panelOffcanvas-bottom.main-modal,
  .inf-panel-container .panelOffcanvas-end.main-modal {
    border-radius: 21px;
    background: rgba(255, 255, 255, 0.72);
    box-shadow: 0px 0px 30px 0px rgba(0, 0, 0, 0.15);
    backdrop-filter: blur(38px);
    -webkit-backdrop-filter: blur(38px);
    -webkit-border-radius: 21px;
    -moz-border-radius: 21px;
    -ms-border-radius: 21px;
    -o-border-radius: 21px;
  }
    .inf-panel-container .panelOffcanvas-bottom.main-modal{
      background: rgba(255, 255, 255, 1);
    }
  
  .inf-panel-container #svg_size--panel,
  .inf-panel-container #svg_unit--panel {
    color: var(--dark-primary-color);
  }
  
  .inf-panel-container #svg_size--panel {
    padding-bottom: 40px;
  }
  
  .inf-panel-container #svg_unit--panel {
    font-size: 12px;
    display: flex;
    justify-content: flex-end;
  }
  
  .inf-panel-container #TryonTable-container--panel {
    width: 100%;
    border: 1px solid rgb(185, 185, 185);
    border-radius: 5px;
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .inf-panel-container #TryonTable-container--panel::-webkit-scrollbar {
    display: none;
  }
  
  .inf-panel-container #modalFilterInfo .filter-container--panel {
    display: flex;
    justify-content: flex-start;
    margin-bottom: 10px;
    white-space: nowrap;
    overflow: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .inf-panel-container #modalFilterInfo .filter-container--panel::-webkit-scrollbar {
    display: none;
  }
  
  .inf-panel-container #modalFilterInfo .filter-button--panel {
    margin-left: 0.25em;
    padding: 4px 12px;
    border: none;
    outline: none;
    background-color: white;
    cursor: pointer;
    border-radius: 20px;
    font-size: 13px;
    color: #666;
    white-space: nowrap;
    overflow-x: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    -ms-overflow-style: none;
    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    -ms-border-radius: 20px;
    -o-border-radius: 20px;
    transition: background-color 0.3s, color 0.3s;
    -webkit-transition: background-color 0.3s, color 0.3s;
    -moz-transition: background-color 0.3s, color 0.3s;
    -ms-transition: background-color 0.3s, color 0.3s;
    -o-transition: background-color 0.3s, color 0.3s;
  }
  
  .inf-panel-container #modalFilterInfo .filter-button--panel::-webkit-scrollbar {
    display: none;
  }
  
  .inf-panel-container #modalFilterInfo .filter-button--panel:hover {
    background-color: #ddd;
  }
  
  .inf-panel-container #modalFilterInfo .filter-button--panel.active {
    background-color: #333;
    color: #fff;
  }
  
  .inf-panel-container #modalFilterInfo table {
    width: 100%;
    border-collapse: collapse;
    overflow-x: scroll;
  }
  
  .inf-panel-container #modalFilterInfo th,
  .inf-panel-container #modalFilterInfo td {
    padding: 8px;
    text-align: center;
    white-space: nowrap;
    overflow-x: scroll;
    -ms-overflow-style: none;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 10px;
    text-align: center;
    color: rgb(51, 51, 51);
    border: 0.5px solid rgb(185, 185, 185);
  }
  
  .inf-panel-container #modalFilterInfo th::-webkit-scrollbar,
  .inf-panel-container #modalFilterInfo td::-webkit-scrollbar {
    display: none;
  }
  
  .inf-panel-container #modalFilterInfo th {
    color: rgb(51, 51, 51);
    font-weight: 400;
    background-color: rgb(240, 240, 240);
  }
  
  /* modalAttributeInfo */
  .inf-panel-container #modalAttributeInfo {
    border: 1px solid rgb(185, 185, 185);
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    -ms-border-radius: 5px;
    -o-border-radius: 5px;
  }
  
  .inf-panel-container #modalAttributeInfo table {
    width: 100%;
    border-collapse: collapse;
    // overflow-x: scroll;
    border-radius: 5px;
    -webkit-border-radius: 5px;
    -moz-border-radius: 5px;
    -ms-border-radius: 5px;
    -o-border-radius: 5px;
  }
  .inf-panel-container #modalAttributeInfo tbody th:first-child{
    position: sticky;
    left: 0;
    z-index: 99;
  }
  
  .inf-panel-container #modalAttributeInfo th,
  .inf-panel-container #modalAttributeInfo td {
    padding: 10px;
    text-align: center;
    color: rgb(51, 51, 51);
    background-color: rgba(255, 255, 255, 0.9);
  }
  
  .inf-panel-container #modalAttributeInfo th {
    border: 1px solid #ddd;
    background-color: #f2f2f2;
    font-weight: 400;
    white-space: nowrap;
  }
  
  .inf-panel-container #modalAttributeInfo .checkmark {
    // font-size: 18px;
    color: black !important;
  }
  
  .inf-panel-container #modalAttributeInfo td > span {
    text-align: center;
    white-space: nowrap;
    width: -moz-fit-content;
    width: fit-content;
    box-sizing: border-box;
    padding: 0px 12px;
    font-weight: 400;
    color: rgb(144, 144, 144);
  }
  .inf-panel-container #modalAttributeInfo{
    overflow-x: scroll;
  }
  .inf-panel-container #modalAttributeInfo td.active > span {
    border-radius: 20px;
    -webkit-border-radius: 20px;
    -moz-border-radius: 20px;
    -ms-border-radius: 20px;
    -o-border-radius: 20px;
    background-color: #f3f3ef;
    color: #3b3b32;
    font-size: 13px;
    line-height: 16px; /* 123.077% */
    letter-spacing: 0.52px;
  }
  
  .inf-panel-container #modalAttributeInfo tr:not(:last-child) {
    background: radial-gradient(circle at bottom, rgb(144, 144, 144) 10px, transparent 0px) repeat-x bottom;
    background-size: 10px 1px;
  }
  
  .inf-panel-container rect {
    fill: #333;
  }
  
  .inf-panel-container text {
    fill: #fff;
  }
  
  .inf-panel-container .accordion-flush > .accordion-item > .accordion-header .accordion-button {
    box-shadow: none;
    border: none;
  }
  
  .inf-panel-container .accordion-button:not(.collapsed) {
    color: #333;
    font-family: "Noto Sans TC";
    font-size: 14px;
    font-style: normal;
    font-weight: 500;
    line-height: 19px;
  }
  
  .inf-panel-container #ai-content {
    overflow-x: hidden;
    overflow-y: auto;
    border-radius: 21px;
    -webkit-border-radius: 8px;
    -moz-border-radius: 8px;
    -ms-border-radius: 8px;
    -o-border-radius: 8px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  
  .inf-panel-container #ai-content::-webkit-scrollbar {
    display: none;
  }
  
  #intro-content {
    overflow: hidden;
    border-radius: 21px;
    background-color: #fff;
    // position: fixed;
    // margin: auto;
    // left: 0;
    // right: 0;
    // top: 0;
    // bottom: 0;
    display: flex;
    flex-direction: column;
    max-height: 700px;
    width:100%;
    position: relative;
    height:calc(90lvh - 60px);
  }
  @media screen and (min-width: 768px){
  #intro-content {
    height: 95vh;
    // border-radius: 28px;
  }
  }
  #intro-content #intro-bg{
    height: 0;
    padding: 0; /* remove any pre-existing padding, just in case */
    padding-bottom: 85%; /* for a 4:3 aspect ratio */
    background-image: url(https://raw.githubusercontent.com/infFITSDevelopment/pop-ad/refs/heads/main/panel-intro.png);
    background-repeat: no-repeat;
    background-size: 100%;
    background-position: center;
  
  }
  #intro-content #intro-section{
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align:left;
    width:100%;
    padding: 0 16px;
    gap: 9px;
    padding-top: 24px;
  }
  @media screen and (min-width: 768px){
  #intro-content #intro-section{
    gap: 11px;
    padding: 0 18px;
    padding-top: 36px;
  }
  }
  
  #intro-content #intro-section div{
    width:100%;
  }
  #intro-content #intro-section .intro-tag{
    color: #1E1E19;
    font-family: "Chocolate Classical Sans";
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: 15px; /* 115.385% */
    letter-spacing: 0.52px;
    opacity: 0.7;
  }
  @media screen and (min-width: 768px){
    #intro-content #intro-section .intro-tag{
      font-size: 15px;
      line-height: 18px; /* 120% */
      letter-spacing: 0.6px;
    }
  }
  #intro-content #intro-section .intro-title{
    color: #1E1E19;
    font-family: "Noto Sans TC", "Chocolate Classical Sans", "Figtree";
    font-size: 21px;
    font-style: normal;
    font-weight: 700;
    line-height: 26px; /* 123.81% */
    letter-spacing: 0.63px;
  }
  @media screen and (min-width: 768px){
    #intro-content #intro-section .intro-title{
      font-size: 24px;
      line-height: 34px; /* 141.667% */
      letter-spacing: 0.48px;
    }
    #intro-content #intro-section .intro-title.en{
      font-family: "Figtree";
      font-size: 24px;
      font-style: normal;
      font-weight: 600;
      line-height: 34px;
    }
  }
  #intro-content #intro-section .intro-desc{
    color: #1E1E19;
    font-family: "Chocolate Classical Sans";
    font-size: 15px;
    font-style: normal;
    font-weight: 400;
    line-height: 18px; /* 120% */
    letter-spacing: 0.6px;
    opacity: 0.7;
  }
  @media screen and (min-width: 768px){
    #intro-content #intro-section .intro-desc{
      font-size: 16px;
      line-height: 19px; /* 118.75% */
      letter-spacing: 0.64px;
    }
  }
  
  #intro-content #intro-footer{
    margin-top: auto;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    gap:12px;
  }
  
  @media screen and (min-width: 768px){
  #intro-content #intro-footer{
    flex-direction: column;
    padding: 18px;
  }
  #intro-content #intro-footer .intro-btn--secondary{
    order:2;
  }
  }
  
  #intro-content #intro-footer .intro-btn{
    display: flex;
    width:100%;
    height: 40px;
    padding: 8px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    align-self: stretch;
    border:none;
    border-radius: 10px;
    text-align: center;
    font-family: Figtree;
    font-size: 15px;
    font-style: normal;
    font-weight: 500;
    line-height: 17px; /* 113.333% */
    opacity: 0.9;
  }
    #intro-content #intro-footer .intro-btn:hover{
      opacity: 1;
    }
  
  #intro-content #intro-footer .intro-btn--primary{
      background-color: rgba(30, 30, 25, 0.85);
      color: #FFF;
  
  }
  #intro-content #intro-footer .intro-btn--secondary{
    background-color: #F3F3EF;
    color: #1E1E19;
  }
  
  .inf-panel-container #info-content {
    max-height: 700px;
  }
  
  .inf-panel-container #ai-content .iframe-container {
    width: 100%;
    height: 95vh;
    max-height: 700px;
    overflow: hidden; /* 隱藏 iframe 自身的滾動條 */
    display: none;
  }
  
  #inffits_cblock,
  #ctryon,
  #inffits_ctryon_window {
    width: 100%;
    height: 100%;
  }
  
  @media (max-width: 991px) {
    .inf-panel-container #ai-content .iframe-container {
      height: 700px; /* 固定 iframe 容器的高度 */
      max-height: calc(90vh - 60px);
      max-height: calc(90lvh - 60px);
    }
    .inf-panel-container #intro-content {
      max-height: calc(90vh - 60px);
      max-height: calc(90lvh - 60px);
      }
    .inf-panel-container #info-content {
      padding: 0 16px;
      max-height: calc(90vh - 60px);
      max-height: calc(90lvh - 60px);
    }
    .inf-panel-container #ai-content {
      max-height: calc(90vh - 60px);
      max-height: calc(90lvh - 60px);
    }
    .inf-panel-container .panelOffcanvas-bottom.main-modal,
    .inf-panel-container .panelOffcanvas-end.main-modal {
      backdrop-filter: blur(48px);
      -webkit-backdrop-filter: blur(48px);
    }
    .inf-panel-container #info-content {
      padding: 0 18px;
    }
  }
  @media (max-width: 767px) {
    .inf-panel-container .btn.btn-light.trigger-icon--shirt {
      bottom: 58px;
    }
  }
  @media (max-width: 360px) {
    .inf-panel-container .fixed-panel-header {
      padding: 10px;
    }
    .inf-panel-container .toggle-btn-container {
      gap: 8px;
    }
  }
  @media (max-width: 320px) {
    .inf-panel-container .fixed-panel-header {
      padding: 8px;
    }
    .inf-panel-container .toggle-btn-container {
      gap: 6px;
    }
  }
  .inf-panel-container .panelOffcanvas {
    display: none;
    position: fixed;
    //width: 95vw;
    width:calc(100% - 16px);
    max-width: 400px;
    max-height: 700px;
    z-index: 1050;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin: auto;
  }
  @media screen and (min-width: 768px) {
    .inf-panel-container .panelOffcanvas {
      right: 20px;
      left: unset;
    }
  }
  .inf-panel-container .panelOffcanvas #ai-content {
    overflow: hidden !important;
    border-radius: 21px;
  }
  
  .inf-panel-container {
    /* 定義 offcanvas 從右滑入的動畫 */
    /* 關閉 offcanvas 的滑出動畫 */
  }
  .inf-panel-container .slide-in {
    animation: slideIn 0.5s both;
  }
  .inf-panel-container .slide-out {
    animation: slideOut 0.5s both;
  }
  @keyframes slideIn {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(0);
    }
  }
  @keyframes slideOut {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(110%);
    }
  }/*# sourceMappingURL=index.css.map */
    `,document.head.appendChild(t);$(function(){var t;fetch("https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css").then(t=>t.text()).then(t=>{t=t.replace(/(^|\})\s*([^{]+)\s*\{/g,function(t,e,n){return n.startsWith("@")||n.startsWith(":root")?t:e+" .inf-panel-container "+n+" {"});document.getElementById("bootstrap-scoped").textContent=t}),document.body.insertAdjacentHTML("afterbegin",`
  <div id="panelTagBtn" class="trigger-icon--shirt" style="display:none;">
  <svg xmlns="http://www.w3.org/2000/svg" style="box-sizing:border-box" width="20" height="20" viewBox="0 0 20 20" fill="none">
    <g id="svg-shirt" opacity="0.9">
      <path d="M10.0001 3.75C11.2923 3.75 12.3716 2.74297 12.5001 1.48438C12.5118 1.36719 12.3829 1.25 12.2657 1.25C12.2024 1.25006 12.1396 1.26199 12.0806 1.28516C12.0728 1.28828 11.2564 1.60156 10.0001 1.60156C8.74385 1.60156 7.92588 1.28906 7.91963 1.28516C7.85306 1.262 7.78309 1.25011 7.7126 1.25H7.71026C7.68106 1.25155 7.65245 1.25884 7.62607 1.27147C7.59969 1.28409 7.57606 1.3018 7.55654 1.32357C7.53702 1.34534 7.52198 1.37076 7.5123 1.39835C7.50261 1.42594 7.49847 1.45518 7.5001 1.48438C7.63096 2.74063 8.71104 3.75 10.0001 3.75Z" fill="#F3F3EF"/>
      <path d="M18.9565 3.51165L13.9061 1.74368C13.8845 1.73613 13.8615 1.73343 13.8387 1.73577C13.8159 1.73811 13.794 1.74542 13.7743 1.7572C13.7547 1.76897 13.7379 1.78493 13.7251 1.80392C13.7123 1.82291 13.7038 1.84449 13.7003 1.86711C13.5542 2.74253 13.1023 3.53775 12.425 4.11134C11.7477 4.68494 10.889 4.99972 10.0015 4.99972C9.11393 4.99972 8.25517 4.68494 7.5779 4.11134C6.90062 3.53775 6.44875 2.74253 6.30263 1.86711C6.2992 1.84411 6.29068 1.82216 6.27769 1.80287C6.2647 1.78358 6.24757 1.76743 6.22755 1.7556C6.20752 1.74377 6.18511 1.73657 6.16194 1.7345C6.13878 1.73244 6.11544 1.73557 6.09364 1.74368L1.04325 3.51165C0.901896 3.56113 0.783008 3.65973 0.708232 3.78949C0.633456 3.91926 0.607763 4.07156 0.635831 4.21868L1.28544 7.65618C1.31044 7.7872 1.3767 7.90679 1.47454 7.99745C1.57237 8.08812 1.69665 8.14511 1.82919 8.16008L3.73857 8.37571C3.81651 8.3845 3.8883 8.42227 3.93967 8.48154C3.99105 8.54081 4.01827 8.61723 4.01591 8.69563L3.72958 18.1058C3.72579 18.2271 3.75738 18.3468 3.8205 18.4505C3.88362 18.5541 3.97554 18.6371 4.08505 18.6894C4.17608 18.7305 4.27501 18.7512 4.37489 18.7499H15.6249C15.7248 18.7512 15.8237 18.7305 15.9147 18.6894C16.0242 18.6371 16.1162 18.5541 16.1793 18.4505C16.2424 18.3468 16.274 18.2271 16.2702 18.1058L15.9839 8.69563C15.9815 8.61723 16.0087 8.54081 16.0601 8.48154C16.1115 8.42227 16.1833 8.3845 16.2612 8.37571L18.1706 8.16008C18.3031 8.14511 18.4274 8.08812 18.5252 7.99745C18.6231 7.90679 18.6893 7.7872 18.7143 7.65618L19.364 4.21868C19.392 4.07156 19.3663 3.91926 19.2916 3.78949C19.2168 3.65973 19.0979 3.56113 18.9565 3.51165Z" fill="#F3F3EF"/>
      <path d="M9.625 8.6C9.625 8.44087 9.69085 8.28826 9.80806 8.17574C9.92527 8.06321 10.0842 8 10.25 8C10.4158 8 10.5747 8.06321 10.6919 8.17574C10.8092 8.28826 10.875 8.44087 10.875 8.6C10.875 8.75913 10.8092 8.91174 10.6919 9.02426C10.5747 9.13679 10.4158 9.2 10.25 9.2C10.0842 9.2 9.92527 9.13679 9.80806 9.02426C9.69085 8.91174 9.625 8.75913 9.625 8.6ZM9 10.4C9 10.1788 9.1862 10 9.41667 10H10.25C10.4805 10 10.6667 10.1788 10.6667 10.4V13.2H11.0833C11.3138 13.2 11.5 13.3787 11.5 13.6C11.5 13.8212 11.3138 14 11.0833 14H9.41667C9.1862 14 9 13.8212 9 13.6C9 13.3787 9.1862 13.2 9.41667 13.2H9.83333V10.8H9.41667C9.1862 10.8 9 10.6213 9 10.4Z" fill="#1E1E19" stroke="#1E1E19" stroke-width="0.25"/>
    </g>
  </svg>
  <span class="trigger-icon--text">
    智慧尺寸
  </span>
  </div>
        <div class="panelOffcanvas-backdrop" style="display: none;"></div>
        <div class="inf-panel-container relative" style="display: none;">
        <div class="relative">
          <!-- mobile bottom sheet -->
          <button
            class="btn btn-light trigger-icon trigger-icon--shirt"
            type="button"
          >
            <img
              src="https://raw.githubusercontent.com/infFITSDevelopment/pop-ad/d75982f3200164aff6aff272b1b26bcf02793f37/shirt-icon.svg"
              alt=""
            />
          </button>
          <div
            class="panelOffcanvas panelOffcanvas-bottom panelOffcanvas-end main-modal"
            tabindex="-1"
            id="panelOffcanvasBottomPanel"
            style="display: none;"
          >
            <div
              class="btn-close-container"
              style="
                position: absolute;
                top: -8px;
                right: -8px;
                background: #fff;
                border-radius: 50%;
                width: 28px;
                height: 28px;
                display: flex;
                justify-content: center;
                align-items: center;
                box-shadow: 0px 0px 0.5px 0px rgba(0, 0, 0, 0.25) inset;
                z-index: 9999999;
              "
            >
              <button
                type="button"
                class="btn-close btn-close--panel"
                aria-label="Close"
                style="font-size: 12px; color: #3b3b32"
              ></button>
            </div>
            <div class="panelOffcanvas-body small" id="panel-content">
            <div class="fixed-panel-header">
              <div class="d-flex justify-content-between toggle-btn-container">
                <button
                  id="guideBtn"
                  class="btn rounded-pill px-3 btn-white overlap-btn btn-active btn-custom-size"
                  type="button"
                >
                  商品指南
                </button>
                <button
                  id="AIbtn"
                  class="btn rounded-pill px-3 btn-white overlap-btn btn-custom-size"
                  type="button"
                >
                  AI找尺寸
                </button>
              </div>
              </div>
              <div class="modal-body py-0" id="intro-content">
                    <div
                    class="close-intro-container"
              style="
                position: absolute;
                top: 8px;
                left: 8px;
                border-radius: 50%;
                width: 24px;
                height: 24px;
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999999;
              "
            >
              <button
                type="button"
                class="btn-close btn-close--intro"
                aria-label="Close"
                style="font-size: 12px; color: #3b3b32"
              ></button>
            </div>
                  <div id="intro-bg"></div>
                  <div id="intro-section">
                    <div class="intro-tag">智慧尺寸</div>
                    <div class="intro-title">使用 <span class="en" lang="en">infFITS AI</span> 找尋合適的尺寸，智慧精準購物。</div>
                    <div class="intro-desc">全面了解商品特徵，選取最佳尺寸。</div>
                  </div>
                   <div id="intro-footer">
                      <button class="intro-btn intro-btn--secondary">開啟商品亮點</button>
                      <button class="intro-btn intro-btn--primary">找尋合適尺寸</button>
                    </div>
              </div>
              <div class="modal-body py-0 overflow-auto" id="info-content">
                <!-- 手風琴折疊 -->
                <div class="accordion accordion-flush" id="modalInfoAccordion">
                  <!-- 尺寸表內容 -->
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="modalSizeInfoHeader">
                      <button
                        class="accordion-button"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#sizeInfoCollapse"
                        aria-expanded="true"
                        aria-controls="sizeInfoCollapse"
                      >
                        尺寸表
                      </button>
                    </h2>
                    <div
                      id="sizeInfoCollapse"
                      class="accordion-collapse collapse show"
                      aria-labelledby="modalSizeInfoHeader"
                    >
                      <div class="accordion-body">
                        <div id="modalSizeImg"></div>
                        <div id="svg_size--panel" class="px-2">
                          尺寸:&nbsp;<span></span>
                        </div>
                        <div id="modalSizeInfo">
                          <!-- 尺寸表內容將由JavaScript動態填充 -->
                        </div>
                        <div id="svg_unit--panel" class="py-1">
                          單位:&nbsp;<span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 試穿資訊內容 -->
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="modalFilterInfoHeader">
                      <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#filterInfoCollapse"
                        aria-expanded="false"
                        aria-controls="filterInfoCollapse"
                      >
                        試穿資訊
                      </button>
                    </h2>
                    <div
                      id="filterInfoCollapse"
                      class="accordion-collapse collapse"
                      aria-labelledby="modalFilterInfoHeader"
                    >
                      <div class="accordion-body">
                        <div id="modalFilterInfo">
                          <!-- 試穿資訊內容將由JavaScript動態填充 -->
                          <div class="filter-container--panel">
                            <div class="filter-btn-container--panel"></div>
                          </div>
                          <div id="TryonTable-container--panel">
                            <table id="TryonTable--panel">
                              <thead>
                                <tr id="th_tr_size_TR--panel"></tr>
                              </thead>
                              <tbody id="tbody_size_TR--panel"></tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <!-- 商品屬性內容 -->
                  <div class="accordion-item">
                    <h2 class="accordion-header" id="modalAttributeInfoHeader">
                      <button
                        class="accordion-button collapsed"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#attributeInfoCollapse"
                        aria-expanded="false"
                        aria-controls="attributeInfoCollapse"
                      >
                        商品屬性
                      </button>
                    </h2>
                    <div
                      id="attributeInfoCollapse"
                      class="accordion-collapse collapse"
                      aria-labelledby="modalAttributeInfoHeader"
                    >
                      <div class="accordion-body">
                        <div id="modalAttributeInfo">
                          <!-- 商品屬性內容將由JavaScript動態填充 -->
                          <table>
                            <tr>
                              <th class="properties-header--panel" name="Elasticity">
                                彈性
                              </th>
                              <td><span>無彈</span></td>
                              <td><span>適中</span></td>
                              <td><span>超彈</span></td>
                            </tr>
                            <tr>
                              <th class="properties-header--panel" name="Cut">版型</th>
                              <td><span>合身</span></td>
                              <td><span>適中</span></td>
                              <td><span>寬鬆</span></td>
                            </tr>
                            <tr>
                              <th class="properties-header--panel" name="Thickness">
                                厚度
                              </th>
                              <td><span>輕薄</span></td>
                              <td><span>適中</span></td>
                              <td><span>厚實</span></td>
                            </tr>
                            <tr>
                              <th class="properties-header--panel" name="Materials">
                                材質
                              </th>
                              <td
                                colspan="3"
                                style="color: black; font-weight: 400"
                              ></td>
                            </tr>
                            <tr>
                              <th class="properties-header--panel" name="Lining">
                                內襯
                              </th>
                              <td colspan="3" style="text-align: center">
                                <span class="checkmark"
                                  >
                                  有
                                </span>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="modal-body py-0" id="ai-content">
                <div class="iframe-container">
                <div id="inffits_cblock" style="width:101%">
                  <div
                    id="ctryon"
                    style="
                      margin: auto;
                      top: 0px;
                      text-align: left;
                      visibility: visible;
                      outline: none;
                    "
                  >
                    <iframe
                      id="inffits_ctryon_window"
                      style="
                        width: 100%;
                        height: 100%;
                        visibility: visible;
                        border: none;
                        outline: none;
                        z-index: 14;
                      "
                      src=""
                    ></iframe>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `),t={Brand:"INFS",url:decodeURI(document.location.href).split("?")[0],CONFIG:"on"},$.ajax({url:"https://api.inffits.com/gpi/model/",method:"POST",dataType:"text",data:JSON.stringify(t),async:!0,success:t=>{var r,l;JSON.parse(t);null!==document.querySelector(".quantity-wrapper")?document.querySelector(".quantity-wrapper"):null!==document.querySelector(".quantity")&&document.querySelector(".quantity"),t=(r="M&INFS_20240607MT0934&U").split("&")[1],l=r.split("&")[1].split("_")[0],$.ajax({url:"https://etpbgcktrk.execute-api.ap-northeast-1.amazonaws.com/v0/model",method:"GET",dataType:"text",data:"ClothID="+t+"&Brand="+l,crossDomain:!0,async:!0,success:t=>{s=JSON.parse(t);var e,n,o,a=(e=JSON.parse(s.SizeInfo),n=Object.keys(e[0]),o='<table class="size-table--panel"><thead><tr>',n.forEach(function(t){o+="<th>"+t+"</th>"}),o+="</tr></thead><tbody>",e.forEach(function(e,t){o+='<tr class="size-btn--panel" data-row-index="'+t+'">',n.forEach(function(t){o+="<td>"+e[t]+"</td>"}),o+="</tr>"}),o+="</tbody></table>",$(document).on("click","table tbody tr",function(){var t=$(this).data("row-index");e[t];document.querySelectorAll(".size-table--panel tbody td:first-child").forEach(function(t){isScrolling&&(t.style.backgroundColor="#fff",t.parentElement.classList.contains("selected")&&(t.style.backgroundColor="transparent",t.style.borderRadius="0"))}),$(this).addClass("selected").siblings().removeClass("selected"),document.querySelectorAll(".size-table--panel tbody td:first-child").forEach(function(t){isScrolling?t.parentElement.classList.contains("selected")?(t.style.transition="background-color 0s",t.style.backgroundColor="rgba(240, 240, 240, 1)"):t.style.backgroundColor="#fff":t.style.backgroundColor="transparent"})}),o);$("#modalSizeInfo").html(a);document.getElementById("inffits_ctryon_window").setAttribute("src","https://inf-g-login.vercel.app/size/indexwebiframe_CA_tw_"+l.toLowerCase()+".html?"+r);
window.addEventListener("message",function(t){if("IDRxReady"==t.data.MsgHeader){var e="",n="",o=document.getElementById("inffits_ctryon_window").contentWindow;gvid_exist=!1;try{gvid_exist=void 0!==localStorage.GVID}catch(t){gvid_exist=!1}gvid_exist?e=localStorage.GVID:(e=makeid(20),localStorage.setItem("GVID",e)),lgvid_exist=!1;try{lgvid_exist=void 0!==localStorage.LGVID}catch(t){lgvid_exist=!1}lgvid_exist?n=localStorage.LGVID:(n=makeid(20),localStorage.setItem("LGVID",n)),IDRxGet("",e,o,n,test,!1),document.getElementById("inffits_ctryon_window").contentWindow.postMessage({MsgHeader:"RemoveWaistFlow"},"*")}else"AddtoCart"==t.data.MsgHeader&&(RecomText=t.data.Size,Message_AddtoCartold(!0),$(".btn-close").click())},!1),"ChartInfo"in JSON.parse(t)&&function(t){function i(t,e){const n=document.getElementById("svgContainerPanel");var o=document.getElementById("svgContainerPanel").offsetWidth;function a(t,e,n,o,a){return m=0,n==a?(y1_m=n,y2_m=a,x2_m=o<e?(x1_m=e-m,o+m):(x1_m=e+m,o-m)):y2_m=e==o?(x1_m=e,x2_m=o,a<n?(y1_m=n-m,a+m):(y1_m=n+m,a-m)):(x1_m=e,x2_m=o,y1_m=n,a),svg_dat=`<line x1="${e}" y1="${n}" x2="${o}" y2="${a}" stroke="rgb(27, 27, 27)" stroke-width="1" stroke-dasharray="none"/>
                              <!-- 起点圆球 --> <circle cx="${x1_m}" cy="${y1_m}" r="3" fill="rgb(27, 27, 27)"/>
                              <!-- 终点圆球 --> <circle cx="${x2_m}" cy="${y2_m}" r="3" fill="rgb(27, 27, 27)"/>`,t+=svg_dat}function i(t,e,n,o,a,i,r){return o_p=15,"Y"==r?(x1_p=e,x2_p=o,y1_p=n+i,y2_p=a+i,n-=o_p,a-=o_p):"-Y"==r?(x1_p=e,x2_p=o,y1_p=n-i,y2_p=a-i,n+=o_p,a+=o_p):"X"==r?(x1_p=e+i,x2_p=o+i,e-=o_p,o-=o_p,y1_p=n,y2_p=a):"-X"==r&&(x1_p=e-i,x2_p=o-i,e+=o_p,o+=o_p,y1_p=n,y2_p=a),svg_dat=`<line x1="${e}" y1="${n}" x2="${x1_p}" y2="${y1_p}" stroke="darkgray" stroke-width="1" stroke-dasharray="1, 1"/>
                         <line x1="${o}" y1="${a}" x2="${x2_p}" y2="${y2_p}" stroke="darkgray" stroke-width="1" stroke-dasharray="1, 1"/>
                        `,t+=svg_dat}for(var r,l,s,d,c,p,f,h,b,g,u,x,v,y,w,k,C,z,_="",I=0;I<e.length;I++)"DottedVertical"==t[e[I]].linetype_id&&"angle"in t[e[I]].param?(c=t[e[I]].param.x1,r=t[e[I]].param.x2,l=t[e[I]].param.y1,p=t[e[I]].param.y2,t[e[I]].param.p1,t[e[I]].param.p1,t[e[I]].param.angle,h=(parseFloat(c)+parseFloat(r))/2,f=(parseFloat(l)+parseFloat(p))/2,_=a(_,c*o,l*o,r*o,p*o),parseFloat(c),_+=`<rect x=${0<h*o-.5*(p=11*("value"in t[e[I]]?1.1*(t[e[I]].linename.length+(t[e[I]].value.length<3?t[e[I]].value.length+1:t[e[I]].value.length)):t[e[I]].linename.length+3))?h*o-.5*p:1} y=${f*o-8.25} width=${p} height=16.5 rx="10" ry="10" fill="white" stroke="rgb(27, 27, 27)" stroke-width="1"/><text letter-spacing="1px" x=${h*o+(0<h*o-.5*p?0:1-(h*o-.5*p))} y=${f*o} text-anchor="middle" dominant-baseline="central"  fill="rgb(27, 27, 27)" font-size="12">${t[e[I]].linename} ${["value"in t[e[I]]?t[e[I]].value:""]}</text> `):"Round"==t[e[I]].linetype_id?(s=t[e[I]].param.a,d=t[e[I]].param.b,c=t[e[I]].param.X,h=t[e[I]].param.Y,p=(parseFloat(c)+parseFloat(c))/2,f=(parseFloat(h)+parseFloat(h))/2,y=_,C=centerX=c*o,z=centerY=h*o,svg_dat=`<path d="${`M ${C} ${z-(k=d*o)} `+`a ${w=s*o} ${k} 0 1 0 0 ${2*k} `+`a ${w} ${k} 0 1 0 0 ${-2*k}`}" stroke="rgb(27, 27, 27)" fill="none" stroke-dasharray="1, 1"/>`,_=y+=svg_dat,_+=`<rect x=${p*o-.5*(h=11*("value"in t[e[I]]?1.1*(t[e[I]].linename.length+(t[e[I]].value.length<3?t[e[I]].value.length+1:t[e[I]].value.length)):t[e[I]].linename.length+3))} y=${f*o-8.25+10} width=${h} height=16.5 rx="10" ry="10" fill="white" stroke="rgb(27, 27, 27)" stroke-width="1"/><text letter-spacing="1px" x=${p*o} y=${f*o+10} text-anchor="middle" dominant-baseline="central"  fill="rgb(27, 27, 27)" font-size="12">${t[e[I]].linename} ${["value"in t[e[I]]?t[e[I]].value:""]}</text> `):"DottedRound"==t[e[I]].linetype_id?(x=t[e[I]].param.x1,b=t[e[I]].param.x2,g=t[e[I]].param.y1,u=t[e[I]].param.y2,v=(parseFloat(x)+parseFloat(b))/2,_=a(_="ChestWidth"!=t[e[I]].linename_id?i(_,x*o,g*o,b*o,u*o,.1*o,direction="-Y"):_,x*o,g*o,b*o,u*o),t[e[I]].linename.length,_+=`<rect x=${v*o-.5*(x=11*("value"in t[e[I]]?1.1*(t[e[I]].linename.length+(t[e[I]].value.length<3?t[e[I]].value.length+1:t[e[I]].value.length)):t[e[I]].linename.length+3))} y=${g*o-8.25} width=${x} height=16.5 rx="10" ry="10" fill="white" stroke="rgb(27, 27, 27)" stroke-width="1"/><text letter-spacing="1px" x=${v*o} y=${g*o} text-anchor="middle" dominant-baseline="central"  fill="rgb(27, 27, 27)" font-size="12">${t[e[I]].linename} ${["value"in t[e[I]]?t[e[I]].value:""]}</text> `):"DottedVertical"==t[e[I]].linetype_id&&(b=t[e[I]].param.x1,u=t[e[I]].param.x2,x=t[e[I]].param.y1,v=t[e[I]].param.y2,g=t[e[I]].param.p,_="ShoulderWidth"==t[e[I]].linename_id?a(_=i(_,b*o,1.6*x*o,u*o,1.6*v*o,g/1.7*o,direction="-Y"),b*o,x*o,u*o,v*o):a(_=i(_,b*o,x*o,u*o,v*o,g*o,direction="-Y"),b*o,x*o,u*o,v*o),u=(parseFloat(b)+parseFloat(u))/2,x=(parseFloat(x)+parseFloat(v))/2,t[e[I]].linename.length,_+=`<rect x=${u*o-.5*(v=11*("value"in t[e[I]]?1.1*(t[e[I]].linename.length+(t[e[I]].value.length<3?t[e[I]].value.length+1:t[e[I]].value.length)):t[e[I]].linename.length+3))} y=${x*o-8.25} width=${v} height=16.5 rx="10" ry="10" fill="white" stroke="rgb(27, 27, 27)" stroke-width="1"/><text letter-spacing="1px" x=${u*o} y=${x*o} text-anchor="middle" dominant-baseline="central"  fill="rgb(27, 27, 27)" font-size="12">${t[e[I]].linename} ${["value"in t[e[I]]?t[e[I]].value:""]}</text> `);return n.innerHTML='<svg width="'+o+'" height="'+1.05*o+'" xmlns="http://www.w3.org/2000/svg">'+_+"</svg>",{data:t,Labels:e}}let r=t.ChartInfo,l=JSON.parse(t.SizeInfo),e=[];for(let t=0;t<l.length;t++)e.push(l[t]["尺寸"]);document.querySelector("#modalSizeImg").insertAdjacentHTML("beforebegin",`
      <div id="SVG-Display" class="d-flex align-items-center justify-content-center" >
          <div >
              <div class='garment-svg' style="margin-bottom: 45px;">
                  <img id="svg_imgsrc--panel"  onerror="this.style.display='none';">
                  <div id='svgContainerPanel'></div>    
              </div>
              <div class="size-btn-wrapper" data-labels="${t.ChartInfo.Labels}">
              </div>
          </div>
      </div>
      `),$("#svg_imgsrc--panel")[0].src="https://www.myinffits.com/images/garment_svgs/"+r.data.filename+".svg","cm"==t.punit?$("#svg_unit--panel").find("span").text("cm(±2)"):$("#svg_unit--panel").find("span").text("英吋inch(±2)");$(document).ready(function(){$(document).on("click",".size-btn--panel",function(){$(this).addClass("size-btn--panel"),$(".size-btn--panel").removeClass("active"),$(this).addClass("active");var e=$(this).index(),t=$(this).find("td:first").text();$("#svg_size--panel").find("span").text(t);let n=$(".size-btn-wrapper").data("labels").split(",");for(let t=1;t<Object.keys(l[0]).length;t++){var o=Object.keys(l[0])[t],a=function(e){const t={ChestWidth:["胸寬","衣寬","身寬"],ChestCircum:["胸圍","衣圍","上胸圍"],ClothLength:["衣長","身長","全長"],HemWidth:["下擺寬","下擺"],ShoulderWidth:["肩寬"],SleeveLength:["袖長"],HipCircum:["臀圍"],HipWidth:["臀寬"],PantHemWidth:["褲口寬","褲口"],PantLength:["褲長","全長"],SkirtLength:["裙長","全長"],WaistCircum:["腰圍"],WaistWidth:["腰寬"]};for(const n in t)if(t.hasOwnProperty(n)){const o=t[n];if(o.some(t=>e.includes(t)))return n}return null}(o);n.includes(a)&&r.data&&r.data[a]&&(r.data[a].value=l[e][o])}r&&r.data&&(r=i(r.data,r.Labels),$("#svgContainerPanel").find("text").hide().fadeIn())})});t=document.createElement("style");t.innerText=`
          .svg-container{
            position: relative;
            text-align: center;
          }
          .garment-svg{
            position: relative;
            display: flex;
            width:40%;
            min-width:300px;
            height: auto;
            margin:auto;
            margin-bottom:150px;
          }
          #svg_unit--panel--panel, #svg_size--panel{
              color:black;font-size:14px;width:100%;margin-right:0;margin: auto;
              display: flex;
              justify-content: end;
          }
          #svg_imgsrc--panel{
              width: 70%;height: 70%;margin: auto;transform: translate(0%, 20%);opacity: 0.5;
          }
          #svgContainerPanel{
              position: absolute;width: 100%;height: 100%;top: 0;left: 0; display:none;
          }
          .size-btn-wrapper{
            position:relative;
            /*display: flex;*/
            width: 100%;
            /*width: 90%;*/
            margin: auto;
            overflow: scroll;
            justify-content: center;
          //   margin-bottom:16px;
            scrollbar-width: none; /* 隱藏標準的捲動條 */
        -ms-overflow-style: none; /* 隱藏IE/Edge中的捲動條 */
            border-collapse: collapse;
          }
  
          .size-btn-wrapper .size-btn{
              border: 1px solid lightgray;
              padding: 12px 20px;
              /*border-radius: 20px;*/
              cursor: pointer;
              /*margin: 0 4px;*/
              text-align: center;
              font-size: 12px;
              display: table-cell;
              border: 1px solid #333;
              min-width: 80px;
              color:#333;
            }
            
          .size-btn-wrapper.size-btn--panel.active{
            background: #858585;
            color:white;
          }
          
          `,document.head.appendChild(t)}(JSON.parse(t)),r.split("&")[1].split("_")[1].match(/[A-Z]+/)[0].includes("A")||function(t){function e(t,e,n,o,a,r,l){if(0==p)for(k=0;k<c;k++)$("#th_tr_size_TR--panel").append('<th id="headerTR--panel'+k+'"><span>'+e[k]+"</span></th>");for(i=0;i<n;i++){for($("#tbody_size_TR--panel").append('<tr id="rowTR--panel'+p+'" class="150d"></tr > '),k=0;k<c;k++)$("#rowTR--panel"+p).append('<td id="'+p+"_"+k+'TR--panel" style="height: 30px;"></td>'),null==f[k]&&(f[k]=[]),f[k].push("");p++}for(i=0;i<o;i++){for($("#tbody_size_TR--panel").append('<tr id="rowTR--panel'+p+'" class="150" style="display:none"></tr > '),k=0;k<c;k++)$("#rowTR--panel"+p).append('<td id="'+p+"_"+k+'TR--panel" style="height: 30px;"></td>'),null==f[k]&&(f[k]=[]),f[k].push("");p++}for(i=0;i<a;i++){for($("#tbody_size_TR--panel").append('<tr id="rowTR--panel'+p+'" class="160" style="display:none"></tr > '),k=0;k<c;k++)$("#rowTR--panel"+p).append('<td id="'+p+"_"+k+'TR--panel" style="height: 30px;"></td>'),null==f[k]&&(f[k]=[]),f[k].push("");p++}for(i=0;i<r;i++){for($("#tbody_size_TR--panel").append('<tr id="rowTR--panel'+p+'" class="170" style="display:none"></tr > '),k=0;k<c;k++)$("#rowTR--panel"+p).append('<td id="'+p+"_"+k+'TR--panel" style="height: 30px;"></td>'),null==f[k]&&(f[k]=[]),f[k].push("");p++}for(i=0;i<l;i++){for($("#tbody_size_TR--panel").append('<tr id="rowTR--panel'+p+'" class="180u" style="display:none></tr > '),k=0;k<c;k++)$("#rowTR--panel"+p).append('<td id="'+p+"_"+k+'TR--panel" style="height: 30px;"></td>'),null==f[k]&&(f[k]=[]),f[k].push("");p++}}var n=[],o=[],a=[],r=[],l=[];!function(t){for(i=0;i<JSON.parse(t).length;i++)JSON.parse(t)[i].Height<=150?n.push(JSON.parse(t)[i]):JSON.parse(t)[i].Height<=160&&150<=JSON.parse(t)[i].Height?o.push(JSON.parse(t)[i]):JSON.parse(t)[i].Height<=170&&160<=JSON.parse(t)[i].Height?a.push(JSON.parse(t)[i]):170<=JSON.parse(t)[i].Height&&JSON.parse(t)[i].Height<=180?r.push(JSON.parse(t)[i]):180<=JSON.parse(t)[i].Height&&l.push(JSON.parse(t)[i])}(t);const s=$(".filter-btn-container--panel");n.length&&s.append('<button class="filter-button--panel active" data-height="150d">150 以上</button>');o.length&&s.append('<button class="filter-button--panel" data-height="150">150 ~ 160</button>');a.length&&s.append('<button class="filter-button--panel" data-height="160">160 ~ 170</button>');r.length&&s.append('<button class="filter-button--panel" data-height="170">170 ~ 180</button>');l.length&&s.append('<button class="filter-button--panel" data-height="180u">180 以下</button>');$(".filter-button--panel").on(h,function(){filterTablePanel($(this).data("height"),this)});var d=function(t){var e=JSON.parse(t).length,n=!0;for(i=0;i<e;i++)JSON.parse(t)[i].Chest.includes("-")&&(n=!1);return n}(t);d?(c=6,e(Object.keys(JSON.parse(t)).length,["人員","身高","體重","胸圍","尺寸","試穿偏好"],n.length,o.length,a.length,r.length,l.length)):(c=5,e(Object.keys(JSON.parse(t)).length,["人員","身高","體重","尺寸","試穿偏好"],n.length,o.length,a.length,r.length,l.length));!function(t,e,n){var o,a=e.rows,i=a.length,r=0,l=0,s=["A","B","C","D","E","F","G"],d=[0,2.5,5,7.5,10,12.5,15];o=n?["Name","Height","Weight","Chest","size","FitP"]:["Name","Height","Weight","size","FitP"],ResortAvatar=t,ResortAvatar.sort(function(t,e){return parseInt(t.Order)-parseInt(e.Order)});for(var c,p="A".charCodeAt(0)-1,r=0;r<i;r++)if(0==r)for(l=0;l<a[r].children.length;l++)o[l];else for(l=0;l<a[r].children.length;l++)"Chest"==o[l]?ResortAvatar[r-1].Chest.includes("_")?a[r].children[l].innerText=ResortAvatar[r-1].Chest.split("_")[0]:a[r].children[l].innerText=2.5*parseInt(ResortAvatar[r-1].Chest.substring(0,2))+d[s.indexOf(ResortAvatar[r-1].Chest.substring(2,3))]:"Name"==o[l]&&Object.keys(ResortAvatar[r-1]).includes("Image_src")?a[r].children[l].innerHTML='<div style="height: 32px;width: 32px;display: flex;align-items: center;margin: auto;justify-content: center;"><img width=100% height=100% style="border-radius: 60px;object-fit: cover" src="'+ResortAvatar[r-1].Image_src+'"></div>':"Name"==o[l]?a[r].children[l].innerText=String.fromCharCode(p+r):void 0===ResortAvatar[r-1][o[l]]?a[r].children[l].innerText="-":a[r].children[l].innerText=(c=ResortAvatar[r-1][o[l]],output="Tight"==c?"緊身":"Fit"==c?"合身":"Great"==c?"適中":"Comfort"==c?"舒適":"Loose"==c?"寬鬆":c,output)}([...n,...o,...a,...r,...l],document.getElementById("TryonTable--panel"),d);d=100/c;$("#TryonTable--panel th, #TryonTable--panel td").css("width",d+"%")}(JSON.parse(t).Avatar),"AttributeInfo"in JSON.parse(t)&&function(o){o.AttributeInfo;for(let n in o.AttributeInfo)$(".properties-header--panel").each(function(t,e){$(e).attr("name")==n&&"Lining"!==n?$(e).siblings().each(function(t,e){e.textContent.trim().replace(/\s+/g," ")==o.AttributeInfo[n]&&$(e).addClass("active")}):$(e).attr("name")==n&&"Lining"===n&&"無"===o.AttributeInfo[n]&&($(e).next().children()[0].innerText=o.AttributeInfo[n])});for(let t=0;t<o.AttributeInfo.Materials.length;t++)$('.properties-header--panel[name="Materials"]').siblings().append(o.AttributeInfo.Materials[t].split("(")[0]+" ");window.innerWidth<440&&$(".square").parent().parent().css("justify-content","start")}(JSON.parse(t)),$("#AIbtn").click(),$(".btn-close-container").hide(),$(".fixed-panel-header").hide(),$("#info-content.modal-body").hide(),$("#ai-content.modal-body").hide(),$("#intro-content.modal-body").show(),$("#panelTagBtn").show()},error:t=>{}})},error:t=>{}}),window.isScrolling=0,document.querySelector("#modalSizeInfo").addEventListener("scroll",function(){isScrolling=0<this.scrollLeft,document.querySelectorAll(".size-table--panel tbody td:first-child").forEach(function(t){t.parentElement.classList.contains("selected")?(t.style.backgroundColor="rgba(240, 240, 240, 1)",t.style.borderRadius="13px"):isScrolling?(t.style.borderRadius="13px",t.style.backgroundColor="#fff"):t.style.backgroundColor="transparent"}),document.querySelectorAll(".size-table--panel thead th:first-child").forEach(function(t){isScrolling?t.style.backgroundColor="#fff":t.style.backgroundColor="transparent"})});document.getElementById("panelOffcanvasBottomPanel");function e(){window.innerWidth}window.addEventListener("resize",e),e();var n=navigator.userAgent.toLowerCase().includes("edgios"),o=window.innerWidth<992,a=$("#info-content"),r=$("#ai-content"),l=$(".inf-panel-container .panelOffcanvas.panelOffcanvas-bottom");o&&(l.css("height","calc(90lvh - 60px)"),n&&(a.css("max-height","calc(90lvh - 10px)"),r.css("max-height","calc(90lvh - 10px)"),l.css("height","calc(90lvh - 10px)"))),$("#panelTagBtn.trigger-icon--shirt").on("click",function(){$(".panelOffcanvas").removeClass("slide-out").addClass("slide-in").show(),window.innerWidth<768&&($(".panelOffcanvas-backdrop").addClass("show"),document.body.style.overflow="hidden"),$(".inf-panel-container").show(),$("#panelTagBtn.trigger-icon--shirt").hide()}),$(".btn-close--panel").on(h,function(){$(".panelOffcanvas").removeClass("slide-in").addClass("slide-out"),$("#panelTagBtn.trigger-icon--shirt").fadeIn(),window.innerWidth<768&&($(".panelOffcanvas-backdrop").removeClass("show"),document.body.style.overflow=""),setTimeout(function(){$(".panelOffcanvas").hide()},500)}),$(".btn-close--intro").on(h,function(){$(".panelOffcanvas").removeClass("slide-in").addClass("slide-out"),$("#panelTagBtn.trigger-icon--shirt").fadeIn(),window.innerWidth<768&&($(".panelOffcanvas-backdrop").removeClass("show"),document.body.style.overflow=""),setTimeout(function(){$(".panelOffcanvas").hide()},500)}),d&&($("#guideBtn").on("touchstart",function(t){t.preventDefault(),$(this).trigger("click")}),$("#AIbtn").on("touchstart",function(t){t.preventDefault(),$(this).trigger("click")}),$(".accordion-button").on("touchstart",function(t){t.preventDefault(),$(this).trigger("click")})),$("#guideBtn").on("click",function(){$("#guideBtn").removeClass("btn-white"),$("#guideBtn").addClass("btn-active"),$("#AIbtn").removeClass("btn-active"),$("#AIbtn").addClass("btn-white"),$("#ai-content.modal-body").hide(),$("#info-content.modal-body").show(),$(".iframe-container").hide(),$("#svgContainerPanel").show(),(0<$(".size-btn--panel.selected.active").length?$(".size-btn--panel.selected.active"):$(".size-btn--panel")[0]).click()}),$("#AIbtn").on("click",function(){$(".iframe-container").show(),$("#AIbtn").removeClass("btn-white"),$("#AIbtn").addClass("btn-active"),$("#guideBtn").removeClass("btn-active"),$("#guideBtn").addClass("btn-white"),$("#info-content.modal-body").hide(),$("#ai-content.modal-body").show().scrollTop($("#ai-content.modal-body").height(),{behavior:"smooth"})}),$(".accordion-button").on("click",function(){var t=$(this).data("bs-target");const n=$(t);n.on("shown.bs.collapse",function(){if(n.attr("id").includes("sizeInfoCollapse")&&($("#svgContainerPanel").show(),(0<$(".size-btn--panel.selected.active").length?$(".size-btn--panel.selected.active"):$(".size-btn--panel")[0]).click()),n.attr("id").includes("filterInfoCollapse")){const t=document.querySelector("#filterInfoCollapse");t.scrollIntoView({behavior:"smooth",block:"nearest"})}if(n.attr("id").includes("attributeInfoCollapse")){const e=document.querySelector("#attributeInfoCollapse");e.scrollIntoView({behavior:"smooth",block:"nearest"})}})}),$(".intro-btn--primary").on(h,function(){$("#intro-content.modal-body").hide(),$(".fixed-panel-header").show(),$(".btn-close-container").show(),$("#AIbtn").click()}),$(".intro-btn--secondary").on(h,function(){$("#intro-content.modal-body").hide(),$(".fixed-panel-header").show(),$(".btn-close-container").show(),$("#guideBtn").click()}),$(".panelOffcanvas-backdrop").on(h,function(t){t.stopPropagation(),t.preventDefault(),$(".btn-close--panel").trigger(h)});var c,p=0,f=[];window.filterTablePanel=function(t,e){for(var n=document.getElementById("TryonTable--panel").getElementsByTagName("tr"),o=1;o<n.length;o++)n[o].style.display="none",n[o].classList.contains(t)&&(n[o].style.display="");var a=document.getElementsByClassName("filter-button--panel");for(o=0;o<a.length;o++)a[o].classList.remove("active");e.classList.add("active")}}),function t(){void 0!==$("#sl-product-image")[0]?$("#intro-bg").css("background-image","url("+$("#sl-product-image")[0].getAttribute("src").replace("webp?source_format=jpg","jpg")+")"):setTimeout(t,250)}()}(jQuery)}function ensureEmbeddedAdJQueryLoaded(t){var e;"undefined"==typeof jQuery?((e=document.createElement("script")).src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js",e.type="text/javascript",e.onload=function(){t()},e.onerror=function(){console.error("載入 jQuery 時出錯")},document.head.appendChild(e)):t()}ensureEmbeddedAdJQueryLoaded(checkloaded);