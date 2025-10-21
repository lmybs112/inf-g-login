/**
 * OAuth 回調處理機制
 * 處理 Google OAuth 登入回調，支援多種配置模式
 * 包含無痕模式檢測和處理
 */

// 無痕模式檢測和處理類別
class IncognitoModeHandler {
    constructor() {
        this.isIncognito = false;
        this.storageAvailable = true;
        this.detectionMethods = [
            this.detectByStorageQuota,
            this.detectByIndexedDB,
            this.detectByServiceWorker,
            this.detectByWebRTC
        ];
        
        this.init();
    }
    
    init() {
        this.detectIncognitoMode();
        this.setupStorageFallback();
    }
    
    // 檢測無痕模式
    detectIncognitoMode() {
        console.log('🔍 開始檢測無痕模式...');
        
        // 嘗試多種檢測方法
        for (const method of this.detectionMethods) {
            try {
                if (method.call(this)) {
                    this.isIncognito = true;
                    console.log('🚫 檢測到無痕模式');
                    break;
                }
            } catch (e) {
                console.log(`檢測方法失敗: ${method.name}`, e);
            }
        }
        
        // 檢查 localStorage 是否可用
        this.checkStorageAvailability();
        
        console.log(`無痕模式狀態: ${this.isIncognito ? '是' : '否'}`);
        console.log(`存儲可用性: ${this.storageAvailable ? '是' : '否'}`);
    }
    
    // 方法1: 通過存儲配額檢測
    detectByStorageQuota() {
        return new Promise((resolve) => {
            if ('storage' in navigator && 'estimate' in navigator.storage) {
                navigator.storage.estimate().then((estimate) => {
                    // 無痕模式下配額通常很小或為0
                    const isIncognito = estimate.quota < 120000000; // 120MB
                    resolve(isIncognito);
                }).catch(() => resolve(false));
            } else {
                resolve(false);
            }
        });
    }
    
    // 方法2: 通過 IndexedDB 檢測
    detectByIndexedDB() {
        return new Promise((resolve) => {
            if ('indexedDB' in window) {
                const request = indexedDB.open('test');
                request.onerror = () => resolve(true); // 無痕模式下可能失敗
                request.onsuccess = () => {
                    request.result.close();
                    resolve(false);
                };
                setTimeout(() => resolve(false), 100);
            } else {
                resolve(false);
            }
        });
    }
    
    // 方法3: 通過 Service Worker 檢測
    detectByServiceWorker() {
        return new Promise((resolve) => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.register('data:text/javascript,')
                    .then(() => resolve(false))
                    .catch(() => resolve(true)); // 無痕模式下可能失敗
            } else {
                resolve(false);
            }
        });
    }
    
    // 方法4: 通過 WebRTC 檢測
    detectByWebRTC() {
        return new Promise((resolve) => {
            if (window.RTCPeerConnection) {
                const pc = new RTCPeerConnection({
                    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
                });
                pc.createDataChannel('test');
                pc.createOffer().then(() => {
                    pc.close();
                    resolve(false);
                }).catch(() => resolve(true));
                setTimeout(() => resolve(false), 1000);
            } else {
                resolve(false);
            }
        });
    }
    
    // 檢查存儲可用性
    checkStorageAvailability() {
        try {
            // 測試 localStorage
            const testKey = '__incognito_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            
            // 測試 sessionStorage
            sessionStorage.setItem(testKey, 'test');
            sessionStorage.removeItem(testKey);
            
            this.storageAvailable = true;
        } catch (e) {
            console.warn('⚠️ 存儲不可用，可能是無痕模式或存儲被禁用');
            this.storageAvailable = false;
        }
    }
    
    // 設置存儲降級方案
    setupStorageFallback() {
        if (this.isIncognito || !this.storageAvailable) {
            console.log('🔄 設置無痕模式存儲降級方案');
            this.setupURLBasedStorage();
        }
    }
    
    // 設置基於 URL 的存儲方案
    setupURLBasedStorage() {
        // 重寫存儲方法，使用 URL 參數和 sessionStorage
        this.originalSetItem = localStorage.setItem;
        this.originalGetItem = localStorage.getItem;
        this.originalRemoveItem = localStorage.removeItem;
        
        // 使用 sessionStorage 作為主要存儲
        this.storage = sessionStorage;
        
        // 重寫 localStorage 方法
        localStorage.setItem = (key, value) => {
            try {
                this.storage.setItem(key, value);
            } catch (e) {
                console.warn(`存儲失敗: ${key}`, e);
                // 降級到 URL 參數
                this.storeInURL(key, value);
            }
        };
        
        localStorage.getItem = (key) => {
            try {
                return this.storage.getItem(key);
            } catch (e) {
                // 從 URL 參數獲取
                return this.getFromURL(key);
            }
        };
        
        localStorage.removeItem = (key) => {
            try {
                this.storage.removeItem(key);
            } catch (e) {
                // 從 URL 參數移除
                this.removeFromURL(key);
            }
        };
    }
    
    // 在 URL 中存儲數據
    storeInURL(key, value) {
        try {
            const url = new URL(window.location);
            url.searchParams.set(`storage_${key}`, encodeURIComponent(value));
            window.history.replaceState({}, '', url);
            console.log(`📝 已將 ${key} 存儲到 URL 參數`);
        } catch (e) {
            console.error('URL 存儲失敗:', e);
        }
    }
    
    // 從 URL 參數獲取數據
    getFromURL(key) {
        try {
            const url = new URL(window.location);
            const value = url.searchParams.get(`storage_${key}`);
            return value ? decodeURIComponent(value) : null;
        } catch (e) {
            console.error('URL 獲取失敗:', e);
            return null;
        }
    }
    
    // 從 URL 參數移除數據
    removeFromURL(key) {
        try {
            const url = new URL(window.location);
            url.searchParams.delete(`storage_${key}`);
            window.history.replaceState({}, '', url);
        } catch (e) {
            console.error('URL 移除失敗:', e);
        }
    }
    
    // 獲取無痕模式狀態
    isIncognitoMode() {
        return this.isIncognito || !this.storageAvailable;
    }
    
    // 獲取存儲可用性
    isStorageAvailable() {
        return this.storageAvailable;
    }
    
    // 恢復原始存儲方法
    restore() {
        if (this.originalSetItem) {
            localStorage.setItem = this.originalSetItem;
            localStorage.getItem = this.originalGetItem;
            localStorage.removeItem = this.originalRemoveItem;
        }
    }
}

// 創建全局無痕模式處理器
const incognitoHandler = new IncognitoModeHandler();

// 穩定的按鈕查找器類別（替代不穩定的 setTimeout）
class StableButtonFinder {
    constructor(selector, options = {}) {
        this.selector = selector;
        this.onFound = options.onFound || (() => {});
        this.onTimeout = options.onTimeout || (() => {});
        this.isMobile = options.isMobile || false;
        this.timeout = options.timeout || 10000;
        this.pollInterval = this.isMobile ? 100 : 150; // 手機版檢查更頻繁
        this.maxAttempts = Math.floor(this.timeout / this.pollInterval);
        
        this.attempts = 0;
        this.observers = [];
        this.intervals = [];
        this.isActive = false;
        
        console.log(`🔍 初始化穩定按鈕查找器: ${selector}, 手機模式: ${this.isMobile}`);
    }
    
    start() {
        if (this.isActive) return;
        this.isActive = true;
        
        // 立即檢查按鈕是否存在
        if (this.checkButton()) {
            return;
        }
        
        // 使用 MutationObserver 監聽 DOM 變化
        this.setupMutationObserver();
        
        // 使用輪詢機制作為備用
        this.setupPolling();
        
        // 設置超時機制
        this.setupTimeout();
    }
    
    checkButton() {
        const button = this.findButton();
        if (button && this.isButtonReady(button)) {
            console.log(`✅ 按鈕 ${this.selector} 已準備就緒`);
            this.cleanup();
            this.onFound();
            return true;
        }
        return false;
    }
    
    findButton() {
        // 支援 ID 選擇器和 CSS 選擇器
        if (this.selector.startsWith('#')) {
            return document.getElementById(this.selector.substring(1));
        } else if (this.selector.startsWith('.')) {
            return document.querySelector(this.selector);
        } else {
            // 假設是 CSS 選擇器
            return document.querySelector(this.selector);
        }
    }
    
    isButtonReady(button) {
        // 檢查按鈕是否可見且可點擊
        const isVisible = this.isMobile 
            ? (button.offsetWidth > 0 || button.offsetHeight > 0)
            : (button.offsetParent !== null);
        
        const isClickable = !button.disabled && 
                           !button.hasAttribute('disabled') && 
                           button.style.display !== 'none' &&
                           button.style.visibility !== 'hidden';
        
        return isVisible && isClickable;
    }
    
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            if (this.checkButton()) {
                return;
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class', 'disabled']
        });
        
        this.observers.push(observer);
    }
    
    setupPolling() {
        const pollInterval = setInterval(() => {
            this.attempts++;
            
            if (this.checkButton()) {
                return;
            }
            
            if (this.attempts >= this.maxAttempts) {
                console.warn(`⚠️ 按鈕查找達到最大嘗試次數: ${this.attempts}`);
                this.cleanup();
                this.onTimeout();
                return;
            }
            
            // 每 10 次嘗試輸出一次日誌
            if (this.attempts % 10 === 0) {
                console.log(`🔍 按鈕查找進行中... (${this.attempts}/${this.maxAttempts})`);
            }
        }, this.pollInterval);
        
        this.intervals.push(pollInterval);
    }
    
    setupTimeout() {
        const timeoutId = setTimeout(() => {
            console.warn(`⚠️ 按鈕查找超時: ${this.timeout}ms`);
            this.cleanup();
            this.onTimeout();
        }, this.timeout);
        
        this.intervals.push(timeoutId);
    }
    
    cleanup() {
        this.isActive = false;
        
        // 清除所有觀察器
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        
        // 清除所有定時器
        this.intervals.forEach(interval => clearInterval(interval));
        this.intervals = [];
    }
    
    stop() {
        this.cleanup();
    }
}

// 檢查 OAuth 回調並自動重開 modal（支援無痕模式）
function checkOAuthCallback(config = {}) {
    // 檢查是否為無痕模式
    const isIncognito = incognitoHandler.isIncognitoMode();
    console.log(`🔍 OAuth 回調檢查，無痕模式: ${isIncognito ? '是' : '否'}`);
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlHash = window.location.hash;
    
    let accessToken = urlParams.get('access_token');
    
    // 檢查 hash 參數
    if (urlHash.includes('access_token=')) {
        const hashParams = new URLSearchParams(urlHash.substring(1));
        accessToken = hashParams.get('access_token');
    }
    
    // 無痕模式：檢查 URL 參數中的備用 token
    if (isIncognito && !accessToken) {
        accessToken = urlParams.get('incognito_token');
        if (accessToken) {
            console.log('🔍 從無痕模式 URL 參數獲取 access_token');
        }
    }
    
    if (accessToken) {
        // 根據配置決定處理方式
        if (config.mode === 'size') {
            // Size 模式：使用 sessionStorage 和 showIframe
            const savedIframeType = sessionStorage.getItem('current_iframe_type');
            
            if (savedIframeType) {
                // 自動重開對應的 modal
                if (typeof showIframe === 'function') {
                    showIframe(savedIframeType);
                }
                
                // 等待 iframe 載入完成後清除 URL 參數
                const iframe = document.getElementById(config.iframeId || 'inffits_ctryon_window');
                if (iframe) {
                    iframe.onload = function() {
                        // 發送 URL 到 iframe
                        iframe.contentWindow.postMessage(
                            { url: window.location.href },
                            "*"
                        );
                        
                        // 等待 token 保存完成後再清除 URL
                        waitForTokenSaveAndClearUrl();
                    };
                }
            }
        } else if (config.mode === 'panel') {
            // Panel 模式：處理彈窗和自動點擊流程
            handleOAuthCallbackForPanel(config);
        } else {
            // 標準模式：使用 jQuery modal
            $("#inffits_cblock--overlay").fadeIn();
            $(".ai-pd-container__trigger").removeClass('ai-pd-container__trigger--search')
                                          .addClass('ai-pd-container__trigger--close');
            
            // 等待 iframe 處理完成後清除 URL 參數
            const iframe = document.getElementById(config.iframeId || 'inffits_tryon_window');
            if (iframe) {
                // 使用 setTimeout 確保 iframe 已經處理完 access_token
                setTimeout(() => {
                    // 發送 URL 到 iframe（讓 iframe 可以處理 OAuth）
                    iframe.contentWindow.postMessage(
                        { url: window.location.href },
                        "*"
                    );
                    
                    // 等待 token 保存完成後再清除 URL
                    waitForTokenSaveAndClearUrl();
                    
                }, config.delay || 1000); // 可配置延遲時間
            }
        }
    }
}

// Panel 模式的 OAuth 回調處理（支援無痕模式）
function handleOAuthCallbackForPanel(config = {}) {
    // 檢查是否為無痕模式
    const isIncognito = incognitoHandler.isIncognitoMode();
    console.log(`🔍 Panel 模式 OAuth 處理，無痕模式: ${isIncognito ? '是' : '否'}`);
    
    // 立即保存 access_token 和用戶信息
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    
    if (accessToken) {
        // 使用無痕模式安全的存儲方式
        try {
            localStorage.setItem('inf_google_access_token', accessToken);
            console.log('✅ 已保存 access_token 到存儲');
        } catch (e) {
            console.warn('⚠️ localStorage 存儲失敗，使用 URL 參數備用方案');
            // 在 URL 中保存 token（無痕模式降級）
            const url = new URL(window.location);
            url.searchParams.set('incognito_token', accessToken);
            window.history.replaceState({}, '', url);
        }
        
        // 獲取用戶信息（不需要獲取 inf_id，iframe 會自己處理）
        fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`)
            .then(response => response.json())
            .then(userInfo => {
                try {
                    localStorage.setItem('inf_google_user_info', JSON.stringify(userInfo));
                    console.log('✅ Panel 模式：已保存 access_token 和 userInfo');
                } catch (e) {
                    console.warn('⚠️ 用戶信息存儲失敗，使用 URL 參數備用方案');
                    // 在 URL 中保存用戶信息（無痕模式降級）
                    const url = new URL(window.location);
                    url.searchParams.set('incognito_user_info', encodeURIComponent(JSON.stringify(userInfo)));
                    window.history.replaceState({}, '', url);
                }
            })
            .catch(error => {
                console.error('❌ 獲取用戶信息失敗:', error);
            });
    }
    
    // 使用 MutationObserver 監聽 DOM 變化，等待彈窗元素出現
    const observer = new MutationObserver((mutations) => {
        const panelOffcanvas = document.querySelector('.panelOffcanvas');
        const aiBtn = document.getElementById('AIbtn');
        const iframe = document.getElementById(config.iframeId || 'inffits_ctryon_window');
        
        if (panelOffcanvas && aiBtn && iframe) {
            observer.disconnect(); // 停止監聽
            
            // 開啟彈窗
            setTimeout(()=>{
                openPanelAndSwitchToAI(panelOffcanvas, aiBtn, iframe, config);
            }, 1000)
        }
    });
    
    // 開始監聽 DOM 變化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 10 秒後停止監聽（安全機制）
    setTimeout(() => {
        observer.disconnect();
    }, config.timeout || 10000);
}

// 開啟彈窗並切換到 AI 頁面的函數（優化版 - 使用穩定的按鈕查找機制）
function openPanelAndSwitchToAI(panelOffcanvas, aiBtn, iframe, config = {}) {
    let buttonClicked = false;
    let findSizeButtonAutoClicked = false;
    
    // 檢測是否為手機瀏覽器
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const animationDelay = isMobile ? 1000 : 500; // 手機版等待更久
    
    console.log(`📱 檢測到 ${isMobile ? '手機' : '電腦'} 瀏覽器，動畫延遲: ${animationDelay}ms`);
    
    // 點擊按鈕並處理後續流程
    function clickButtonAndProceed() {
        if (buttonClicked) return;
        buttonClicked = true;
        
        const triggerBtn = document.getElementById('panelTagBtn');
        
        if (triggerBtn) {
            console.log('✅ 找到 #panelTagBtn，直接點擊！');
            
            // 手機版：使用觸控事件序列確保點擊有效
            if (isMobile) {
                try {
                    // 觸控事件序列
                    triggerBtn.dispatchEvent(new TouchEvent('touchstart', { 
                        bubbles: true, 
                        cancelable: true,
                        touches: [new Touch({ identifier: 0, target: triggerBtn, clientX: 0, clientY: 0 })]
                    }));
                    triggerBtn.click();
                    triggerBtn.dispatchEvent(new TouchEvent('touchend', { 
                        bubbles: true, 
                        cancelable: true,
                        changedTouches: [new Touch({ identifier: 0, target: triggerBtn, clientX: 0, clientY: 0 })]
                    }));
                    console.log('📱 手機版觸控事件序列完成');
                } catch (e) {
                    // 降級：只用 click
                    triggerBtn.click();
                    console.log('📱 降級使用 click 事件');
                }
            } else {
                // 電腦版：直接 click
                triggerBtn.click();
            }
            
            // 設置雙重保險：transitionend 事件 + 定時器
            let transitionFired = false;
            
            // 監聽彈窗開啟動畫完成事件
            const onTransitionEnd = function() {
                if (findSizeButtonAutoClicked) return;
                transitionFired = true;
                panelOffcanvas.removeEventListener('transitionend', onTransitionEnd);
                
                console.log('✅ transitionend 事件觸發');
                // 自動點擊「找尋合適尺寸」按鈕
                autoClickFindSizeButton(iframe, config);
            };
            
            panelOffcanvas.addEventListener('transitionend', onTransitionEnd, { once: true });
            
            // ✅ 定時器保底（手機版尤其重要）
            setTimeout(() => {
                if (!findSizeButtonAutoClicked && !transitionFired) {
                    console.log(`⏱️ ${animationDelay}ms 定時器觸發（transitionend 未觸發）`);
                    panelOffcanvas.removeEventListener('transitionend', onTransitionEnd);
                    autoClickFindSizeButton(iframe, config);
                }
            }, animationDelay);
        } else {
            console.warn('⚠️ 找不到 #panelTagBtn，直接嘗試點擊「找尋合適尺寸」');
            autoClickFindSizeButton(iframe, config);
        }
    }
    
    // ✅ 監聽來自 iframe 的準備完成訊息
    const iframeReadyHandler = function(event) {
        if (event.data && event.data.MsgHeader === 'infFITS_Iframe_Ready') {
            console.log('📥 收到 iframe 準備完成通知');
            window.removeEventListener('message', iframeReadyHandler);
            
            // iframe 準備好了，立即點擊 #panelTagBtn
            setTimeout(() => {
                clickButtonAndProceed();
            }, 100);
        }
    };
    
    window.addEventListener('message', iframeReadyHandler);
    
    // ✅ 使用穩定的按鈕查找機制（移除不穩定的 setTimeout）
    const buttonFinder = new StableButtonFinder('#panelTagBtn', {
        onFound: () => {
            if (!buttonClicked) {
                console.log('🎯 穩定按鈕查找器找到 #panelTagBtn，直接點擊！');
                clickButtonAndProceed();
            }
        },
        onTimeout: () => {
            console.warn('⚠️ 按鈕查找超時，直接嘗試點擊「找尋合適尺寸」');
            autoClickFindSizeButton(iframe, config);
        },
        isMobile: isMobile,
        timeout: 15000 // 15 秒超時
    });
    
    buttonFinder.start();
}

// 自動點擊「找尋合適尺寸」按鈕的函數（優化版 - 使用穩定查找機制）
function autoClickFindSizeButton(iframe, config = {}) {
    let buttonClicked = false;
    
    // 檢測是否為手機瀏覽器
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const buttonDelay = isMobile ? 800 : 500; // 手機版延遲更久
    
    console.log(`📱 autoClickFindSizeButton: ${isMobile ? '手機' : '電腦'}模式`);
    
    // 點擊按鈕的函數
    function clickFindSizeButton(button) {
        if (buttonClicked) return;
        buttonClicked = true;
        
        console.log('✅ 找到「找尋合適尺寸」按鈕，自動點擊');
        
        // 手機版：使用觸控事件序列確保點擊有效
        if (isMobile) {
            try {
                // 觸控事件序列
                button.dispatchEvent(new TouchEvent('touchstart', { 
                    bubbles: true, 
                    cancelable: true,
                    touches: [new Touch({ identifier: 0, target: button, clientX: 0, clientY: 0 })]
                }));
                button.click();
                button.dispatchEvent(new TouchEvent('touchend', { 
                    bubbles: true, 
                    cancelable: true,
                    changedTouches: [new Touch({ identifier: 0, target: button, clientX: 0, clientY: 0 })]
                }));
                console.log('📱 手機版觸控事件序列完成');
            } catch (e) {
                // 降級：只用 click
                button.click();
                console.log('📱 降級使用 click 事件');
            }
        } else {
            // 電腦版：直接 click
            button.click();
        }
        
        // 等待按鈕點擊後的頁面切換，然後處理 iframe
        setTimeout(() => {
            handleIframeAndUrlCleanup(iframe, config);
        }, buttonDelay);
    }
    
    // 檢查按鈕是否準備就緒
    function isButtonReady(button) {
        // 手機版：更寬鬆的可見性檢查
        const isVisible = isMobile 
            ? (button.offsetWidth > 0 || button.offsetHeight > 0)
            : (button.offsetParent !== null);
        
        const isClickable = !button.disabled && 
                           !button.hasAttribute('disabled') && 
                           button.style.display !== 'none' &&
                           button.style.visibility !== 'hidden';
        
        return isVisible && isClickable;
    }
    
    // 使用穩定的按鈕查找器
    const findSizeButtonFinder = new StableButtonFinder('.intro-btn--primary', {
        onFound: () => {
            const button = document.querySelector('.intro-btn--primary');
            if (button && isButtonReady(button)) {
                clickFindSizeButton(button);
            }
        },
        onTimeout: () => {
            console.warn('⚠️ 未找到「找尋合適尺寸」按鈕，直接處理 iframe');
            handleIframeAndUrlCleanup(iframe, config);
        },
        isMobile: isMobile,
        timeout: isMobile ? 15000 : 10000 // 手機版給更多時間
    });
    
    findSizeButtonFinder.start();
}

// 處理 iframe 載入和 URL 清除（優化版 - 支援無痕模式）
function handleIframeAndUrlCleanup(iframe, config = {}) {
    // 檢查是否為無痕模式
    const isIncognito = incognitoHandler.isIncognitoMode();
    console.log(`🔍 Iframe 登入處理，無痕模式: ${isIncognito ? '是' : '否'}`);
    
    // 獲取 access_token 和用戶信息（支援無痕模式）
    const urlParams = new URLSearchParams(window.location.search);
    let accessToken = urlParams.get('access_token');
    let userInfoStr = localStorage.getItem('inf_google_user_info');
    
    // 無痕模式降級：從 URL 參數獲取
    if (isIncognito && !accessToken) {
        accessToken = urlParams.get('incognito_token');
        const userInfoParam = urlParams.get('incognito_user_info');
        if (userInfoParam) {
            try {
                userInfoStr = decodeURIComponent(userInfoParam);
            } catch (e) {
                console.warn('⚠️ 解析無痕模式用戶信息失敗:', e);
            }
        }
    }
    
    if (!accessToken) {
        console.warn('⚠️ 沒有 access_token，跳過 iframe 登入處理');
        return;
    }
    
    let loginConfirmed = false;
    let sendAttempts = 0;
    const maxSendAttempts = 20; // 減少到 20 次（10 秒）
    const retryIntervals = [0, 300, 600, 1000, 1500]; // 前 5 次快速重試
    let pollInterval = null;
    
    // 解析用戶信息
    let userInfo = null;
    try {
        userInfo = JSON.parse(userInfoStr);
    } catch (e) {
        console.error('解析用戶信息失敗:', e);
    }
    
    // 監聽來自 iframe 的登入確認訊息
    const confirmHandler = function(event) {
        if (event.data && event.data.MsgHeader === 'OAuth_Login_Confirmed') {
            console.log('✅ Iframe 已確認接收登入信息');
            loginConfirmed = true;
            
            // 清除輪詢
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
            
            // 移除監聽器
            window.removeEventListener('message', confirmHandler);
            
            // ✅ 清除 parent 的存儲（iframe 已保存，不需要保留在 parent）
            try {
                localStorage.removeItem('inf_google_access_token');
                localStorage.removeItem('inf_google_user_info');
                console.log('🗑️ 已清除 parent localStorage 中的登入信息（iframe 已保存）');
            } catch (e) {
                console.warn('⚠️ 清除 localStorage 失敗:', e);
            }
            
            // 無痕模式：清除 URL 參數
            if (isIncognito) {
                try {
                    const url = new URL(window.location);
                    url.searchParams.delete('incognito_token');
                    url.searchParams.delete('incognito_user_info');
                    window.history.replaceState({}, '', url);
                    console.log('🗑️ 已清除無痕模式 URL 參數');
                } catch (e) {
                    console.warn('⚠️ 清除 URL 參數失敗:', e);
                }
            }
            
            // 立即清除 URL（不再等待）
            waitForTokenSaveAndClearUrl(config);
        }
    };
    window.addEventListener('message', confirmHandler);
    
    // 發送登入信息到 iframe（支援跨域）
    function sendLoginInfoToIframe(isVerbose = false) {
        if (!iframe.contentWindow || !accessToken || loginConfirmed) {
            return false;
        }
        
        sendAttempts++;
        
        // 只在首次和確認重試時輸出日誌
        if (isVerbose || sendAttempts === 1 || sendAttempts % 5 === 0) {
            console.log(`📤 發送登入信息到 iframe (第 ${sendAttempts} 次)`);
        }
        
        iframe.contentWindow.postMessage({
            MsgHeader: 'OAuth_Login_Success',
            access_token: accessToken,
            userInfo: userInfo,
            source: 'parent_window',
            timestamp: Date.now()
        }, '*');
        
        return true;
    }
    
    // 智能輪詢：前 5 次快速重試，之後降低頻率
    function startSmartPolling() {
        // 前 5 次使用預定義的間隔快速重試
        retryIntervals.forEach((delay, index) => {
            setTimeout(() => {
                if (!loginConfirmed && sendAttempts < maxSendAttempts) {
                    sendLoginInfoToIframe(index === 0);
                }
            }, delay);
        });
        
        // 之後降低頻率到 1 秒一次
        setTimeout(() => {
            if (loginConfirmed || sendAttempts >= maxSendAttempts) {
                return;
            }
            
            pollInterval = setInterval(() => {
                if (loginConfirmed || sendAttempts >= maxSendAttempts) {
                    clearInterval(pollInterval);
                    if (!loginConfirmed) {
                        console.warn('⚠️ 未收到 iframe 登入確認，已達最大嘗試次數');
                        waitForTokenSaveAndClearUrl(config);
                    }
                    return;
                }
                
                sendLoginInfoToIframe();
            }, 1000); // 降低到 1 秒一次
        }, 2000);
    }
    
    // 設置 iframe onload 事件
    iframe.onload = function() {
        console.log('📥 Iframe 已載入');
        
        // 立即發送
        if (!loginConfirmed) {
            sendLoginInfoToIframe(true);
        }
    };
    
    // 立即開始智能輪詢
    startSmartPolling();
}

// 等待 token 保存完成後再清除 URL（支援無痕模式）
function waitForTokenSaveAndClearUrl(config = {}) {
    // 檢查是否為無痕模式
    const isIncognito = incognitoHandler.isIncognitoMode();
    console.log(`🔍 URL 清除處理，無痕模式: ${isIncognito ? '是' : '否'}`);
    
    // 檢查是否有 access_token 在 URL 中
    const urlParams = new URLSearchParams(window.location.search);
    const urlHash = window.location.hash;
    const hasAccessToken = urlParams.get('access_token') || urlHash.includes('access_token=');
    const hasIncognitoToken = urlParams.get('incognito_token');
    
    if (!hasAccessToken && !hasIncognitoToken) {
        // 沒有 access_token，直接清除 URL
        clearUrlParameters();
        return;
    }
    
    // 有 access_token，等待保存到存儲
    let attempts = 0;
    const maxAttempts = config.maxAttempts || 50; // 最多等待 5 秒 (50 * 100ms)
    const checkInterval = config.checkInterval || 100; // 檢查間隔
    
    const checkTokenSaved = () => {
        attempts++;
        
        // 檢查 token 是否已保存到存儲
        let savedToken = null;
        try {
            savedToken = localStorage.getItem('inf_google_access_token');
        } catch (e) {
            console.warn('⚠️ 檢查 localStorage 失敗:', e);
        }
        
        // 無痕模式：檢查 URL 參數
        if (isIncognito && !savedToken) {
            savedToken = urlParams.get('incognito_token');
        }
        
        if (savedToken) {
            // Token 已保存，清除 URL
            clearUrlParameters();
        } else if (attempts < maxAttempts) {
            // 還沒保存，繼續等待
            setTimeout(checkTokenSaved, checkInterval);
        } else {
            // 超時，強制清除 URL（避免無限等待）
            console.warn('Token 保存超時，強制清除 URL');
            clearUrlParameters();
        }
    };
    
    // 開始檢查
    checkTokenSaved();
}

// 清除 URL 參數的函數（支援無痕模式）
function clearUrlParameters() {
    try {
        const url = new URL(window.location);
        
        // 清除標準 OAuth 參數
        url.searchParams.delete('access_token');
        url.searchParams.delete('code');
        url.searchParams.delete('state');
        url.searchParams.delete('scope');
        
        // 清除無痕模式參數
        url.searchParams.delete('incognito_token');
        url.searchParams.delete('incognito_user_info');
        
        // 清除其他可能的存儲參數
        const storageParams = Array.from(url.searchParams.keys())
            .filter(key => key.startsWith('storage_'));
        storageParams.forEach(key => url.searchParams.delete(key));
        
        // 更新 URL
        const cleanUrl = url.origin + url.pathname + (url.search ? url.search : '');
        window.history.replaceState({}, document.title, cleanUrl);
        
        console.log('✅ 已清除所有 URL 參數');
    } catch (e) {
        console.warn('⚠️ 清除 URL 參數失敗，使用降級方案:', e);
        // 降級方案：只清除基本路徑
        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }
}

// 初始化 OAuth 回調處理
function initOAuthCallbackHandler(config = {}) {
    // 頁面載入時檢查 OAuth 回調
    window.addEventListener('load', () => checkOAuthCallback(config));
}

function onloadIframeSendUrl(iframeId) {
    // 使用 MutationObserver 等待 iframe 元素出現
    const observer = new MutationObserver((mutations) => {
        const iframe = document.getElementById(iframeId);
        if (iframe) {
            // iframe 已存在，停止監聽並設置 onload 事件
            observer.disconnect();
            iframe.onload = function() {
                iframe.contentWindow.postMessage(
                    { url: window.location.href },
                    "*"
                );
            };
        }
    });
    
    // 開始監聽 DOM 變化
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    // 如果 iframe 已經存在，立即處理
    const existingIframe = document.getElementById(iframeId);
    if (existingIframe) {
        observer.disconnect();
        existingIframe.onload = function() {
            existingIframe.contentWindow.postMessage(
                { url: window.location.href },
                "*"
            );
        };
    }
}


// 導出函數供外部使用
window.checkOAuthCallback = checkOAuthCallback;
window.initOAuthCallbackHandler = initOAuthCallbackHandler;
window.handleOAuthCallbackForPanel = handleOAuthCallbackForPanel;
window.openPanelAndSwitchToAI = openPanelAndSwitchToAI;
window.autoClickFindSizeButton = autoClickFindSizeButton;
window.handleIframeAndUrlCleanup = handleIframeAndUrlCleanup;
window.waitForTokenSaveAndClearUrl = waitForTokenSaveAndClearUrl;
window.clearUrlParameters = clearUrlParameters;
window.onloadIframeSendUrl = onloadIframeSendUrl;