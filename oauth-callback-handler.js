/**
 * OAuth 回調處理機制
 * 處理 Google OAuth 登入回調，支援多種配置模式
 */

// 檢查 OAuth 回調並自動重開 modal
function checkOAuthCallback(config = {}) {
    const urlParams = new URLSearchParams(window.location.search);
    const urlHash = window.location.hash;
    
    let accessToken = urlParams.get('access_token');
    
    // 檢查 hash 參數
    if (urlHash.includes('access_token=')) {
        const hashParams = new URLSearchParams(urlHash.substring(1));
        accessToken = hashParams.get('access_token');
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

// Panel 模式的 OAuth 回調處理
function handleOAuthCallbackForPanel(config = {}) {
    // 立即保存 access_token 和用戶信息到 localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    
    if (accessToken) {
        localStorage.setItem('inf_google_access_token', accessToken);
        
        // 獲取用戶信息（不需要獲取 inf_id，iframe 會自己處理）
        fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`)
            .then(response => response.json())
            .then(userInfo => {
                localStorage.setItem('inf_google_user_info', JSON.stringify(userInfo));
                console.log('✅ Panel 模式：已保存 access_token 和 userInfo');
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

// 開啟彈窗並切換到 AI 頁面的函數（優化版 - 監聽 iframe 通知）
function openPanelAndSwitchToAI(panelOffcanvas, aiBtn, iframe, config = {}) {
    let buttonClicked = false;
    
    // 點擊按鈕並處理後續流程
    function clickButtonAndProceed() {
        if (buttonClicked) return;
        buttonClicked = true;
        
        const triggerBtn = document.getElementById('panelTagBtn');
        
        if (triggerBtn) {
            console.log('✅ 找到 #panelTagBtn，準備點擊');
            triggerBtn.click();
            
            // 監聽彈窗開啟動畫完成事件
            panelOffcanvas.addEventListener('transitionend', function onTransitionEnd() {
                panelOffcanvas.removeEventListener('transitionend', onTransitionEnd);
                
                // 自動點擊「找尋合適尺寸」按鈕
                autoClickFindSizeButton(iframe, config);
            }, { once: true });
            
            // 如果沒有動畫，延遲執行（確保彈窗已開啟）
            setTimeout(() => {
                if (!panelOffcanvas.style.transition) {
                    autoClickFindSizeButton(iframe, config);
                }
            }, 500);
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
    
    // 安全機制：10 秒後如果還沒收到通知，強制執行
    setTimeout(() => {
        if (!buttonClicked) {
            console.warn('⚠️ 10 秒內未收到 iframe 通知，強制執行');
            window.removeEventListener('message', iframeReadyHandler);
            clickButtonAndProceed();
        }
    }, 10000);
}

// 自動點擊「找尋合適尺寸」按鈕的函數（嚴謹版）
function autoClickFindSizeButton(iframe, config = {}) {
    // 狀態管理
    const state = {
        buttonClicked: false,
        checkAttempts: 0,
        pollInterval: null,
        observer: null,
        timeoutId: null,
        cleanedUp: false
    };
    
    // 檢測是否為手機瀏覽器
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const maxCheckAttempts = isMobile ? 75 : 50; // 手機版更多嘗試次數
    const pollIntervalTime = isMobile ? 100 : 200;
    const timeoutDuration = isMobile ? 15000 : 10000;
    const clickDelay = isMobile ? 800 : 500;
    
    console.log(`📱 檢測到 ${isMobile ? '手機' : '電腦'} 瀏覽器`);
    console.log(`⚙️ 配置: 輪詢間隔=${pollIntervalTime}ms, 超時=${timeoutDuration}ms, 最大嘗試=${maxCheckAttempts}次`);
    
    // 清理所有監聽器和計時器
    function cleanup(reason = '完成') {
        if (state.cleanedUp) return;
        state.cleanedUp = true;
        
        if (state.pollInterval) {
            clearInterval(state.pollInterval);
            state.pollInterval = null;
        }
        
        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }
        
        if (state.timeoutId) {
            clearTimeout(state.timeoutId);
            state.timeoutId = null;
        }
        
        console.log(`🧹 已清理資源 (原因: ${reason})`);
    }
    
    // 驗證按鈕是否真正可點擊
    function validateButton(button) {
        if (!button) return { valid: false, reason: '按鈕不存在' };
        
        const checks = {
            exists: !!button,
            visible: button.offsetParent !== null,
            enabled: !button.disabled,
            hasText: button.textContent && button.textContent.trim().length > 0,
            inDocument: document.body.contains(button),
            notHidden: window.getComputedStyle(button).display !== 'none',
            notTransparent: window.getComputedStyle(button).opacity !== '0',
            hasSize: button.offsetWidth > 0 && button.offsetHeight > 0
        };
        
        const allValid = Object.values(checks).every(v => v === true);
        
        return {
            valid: allValid,
            checks: checks,
            text: button.textContent?.trim(),
            reason: allValid ? '驗證通過' : '驗證失敗'
        };
    }
    
    // 安全的點擊方法
    function safeClickButton(button) {
        try {
            console.log('🖱️ 開始執行點擊序列...');
            
            if (isMobile) {
                // 手機版：觸控事件序列
                try {
                    // 1. touchstart
                    const touchStartEvent = new TouchEvent('touchstart', {
                        bubbles: true,
                        cancelable: true,
                        view: window,
                        touches: [new Touch({
                            identifier: Date.now(),
                            target: button,
                            clientX: button.getBoundingClientRect().left + button.offsetWidth / 2,
                            clientY: button.getBoundingClientRect().top + button.offsetHeight / 2,
                            screenX: button.getBoundingClientRect().left + button.offsetWidth / 2,
                            screenY: button.getBoundingClientRect().top + button.offsetHeight / 2,
                            pageX: button.getBoundingClientRect().left + button.offsetWidth / 2,
                            pageY: button.getBoundingClientRect().top + button.offsetHeight / 2
                        })]
                    });
                    button.dispatchEvent(touchStartEvent);
                    console.log('  ✓ touchstart 已觸發');
                } catch (touchError) {
                    console.warn('  ⚠️ touchstart 失敗:', touchError.message);
                }
                
                // 2. click (延遲 50ms)
                setTimeout(() => {
                    try {
                        button.click();
                        console.log('  ✓ click 已觸發');
                        
                        // 3. touchend (延遲 100ms)
                        setTimeout(() => {
                            try {
                                const touchEndEvent = new TouchEvent('touchend', {
                                    bubbles: true,
                                    cancelable: true,
                                    view: window
                                });
                                button.dispatchEvent(touchEndEvent);
                                console.log('  ✓ touchend 已觸發');
                            } catch (touchEndError) {
                                console.warn('  ⚠️ touchend 失敗:', touchEndError.message);
                            }
                        }, 100);
                    } catch (clickError) {
                        console.error('  ❌ click 失敗:', clickError.message);
                    }
                }, 50);
            } else {
                // 電腦版：直接點擊
                button.click();
                console.log('  ✓ click 已觸發（電腦版）');
            }
            
            return true;
        } catch (error) {
            console.error('❌ 點擊執行失敗:', error);
            return false;
        }
    }
    
    // 嘗試點擊按鈕
    function tryClickButton() {
        if (state.buttonClicked) {
            return true;
        }
        
        state.checkAttempts++;
        
        // 尋找按鈕
        const findSizeButton = document.querySelector('.intro-btn--primary');
        
        if (!findSizeButton) {
            // 只在特定次數輸出，避免日誌過多
            if (state.checkAttempts === 1 || state.checkAttempts % 10 === 0) {
                console.log(`🔍 第 ${state.checkAttempts} 次檢查：未找到按鈕`);
            }
            return false;
        }
        
        // 驗證按鈕
        const validation = validateButton(findSizeButton);
        
        // 輸出檢查結果（前 5 次或每 10 次）
        if (state.checkAttempts <= 5 || state.checkAttempts % 10 === 0) {
            console.log(`🔍 第 ${state.checkAttempts} 次檢查:`, validation);
        }
        
        if (!validation.valid) {
            return false;
        }
        
        // 驗證通過，執行點擊
        console.log(`✅ 按鈕驗證通過 (第 ${state.checkAttempts} 次)，準備點擊`);
        state.buttonClicked = true;
        
        // 清理監聽器
        cleanup('找到按鈕並準備點擊');
        
        // 執行點擊
        const clickSuccess = safeClickButton(findSizeButton);
        
        if (!clickSuccess) {
            console.error('❌ 點擊失敗，嘗試降級處理');
        }
        
        // 等待頁面切換後處理 iframe
        setTimeout(() => {
            console.log('🔄 按鈕點擊完成，開始處理 iframe');
            handleIframeAndUrlCleanup(iframe, config);
        }, clickDelay);
        
        return true;
    }
    
    // 立即嘗試
    console.log('🚀 開始查找「找尋合適尺寸」按鈕...');
    if (tryClickButton()) {
        return;
    }
    
    console.log('🔄 按鈕尚未就緒，開始輪詢檢查...');
    
    // 輪詢檢查
    state.pollInterval = setInterval(() => {
        if (state.buttonClicked || state.checkAttempts >= maxCheckAttempts) {
            cleanup('達到條件停止輪詢');
            
            if (!state.buttonClicked) {
                console.warn(`⚠️ 已嘗試 ${state.checkAttempts} 次仍未找到按鈕，降級處理`);
                handleIframeAndUrlCleanup(iframe, config);
            }
            return;
        }
        
        tryClickButton();
    }, pollIntervalTime);
    
    // MutationObserver 輔助
    try {
        state.observer = new MutationObserver((mutations) => {
            if (!state.buttonClicked && tryClickButton()) {
                cleanup('Observer 檢測到變化並找到按鈕');
            }
        });
        
        state.observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });
    } catch (observerError) {
        console.warn('⚠️ MutationObserver 初始化失敗:', observerError.message);
    }
    
    // 超時保護
    state.timeoutId = setTimeout(() => {
        if (!state.buttonClicked) {
            console.warn(`⚠️ 超時 ${timeoutDuration}ms，強制降級處理`);
            cleanup('超時');
            handleIframeAndUrlCleanup(iframe, config);
        }
    }, timeoutDuration);
}

// 處理 iframe 載入和 URL 清除（優化版）
function handleIframeAndUrlCleanup(iframe, config = {}) {
    // 獲取 access_token 和用戶信息
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('access_token');
    const userInfoStr = localStorage.getItem('inf_google_user_info');
    
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
            
            // ✅ 清除 parent 的 localStorage（iframe 已保存，不需要保留在 parent）
            localStorage.removeItem('inf_google_access_token');
            localStorage.removeItem('inf_google_user_info');
            console.log('🗑️ 已清除 parent localStorage 中的登入信息（iframe 已保存）');
            
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

// 等待 token 保存完成後再清除 URL
function waitForTokenSaveAndClearUrl(config = {}) {
    // 檢查是否有 access_token 在 URL 中
    const urlParams = new URLSearchParams(window.location.search);
    const urlHash = window.location.hash;
    const hasAccessToken = urlParams.get('access_token') || urlHash.includes('access_token=');
    
    if (!hasAccessToken) {
        // 沒有 access_token，直接清除 URL
        clearUrlParameters();
        return;
    }
    
    // 有 access_token，等待保存到 localStorage
    let attempts = 0;
    const maxAttempts = config.maxAttempts || 50; // 最多等待 5 秒 (50 * 100ms)
    const checkInterval = config.checkInterval || 100; // 檢查間隔
    
    const checkTokenSaved = () => {
        attempts++;
        
        // 檢查 token 是否已保存到 localStorage
        const savedToken = localStorage.getItem('inf_google_access_token');
        
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

// 清除 URL 參數的函數
function clearUrlParameters() {
    const cleanUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
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
window.clickPanelTagBtn = clickPanelTagBtn;
window.autoClickFindSizeButton = autoClickFindSizeButton;
window.handleIframeAndUrlCleanup = handleIframeAndUrlCleanup;
window.waitForTokenSaveAndClearUrl = waitForTokenSaveAndClearUrl;
window.clearUrlParameters = clearUrlParameters;
window.onloadIframeSendUrl = onloadIframeSendUrl;