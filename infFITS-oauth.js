/**
 * infFITS Google OAuth2 登入 Web Component
 * 使用 Authorization Code Flow popup window 現代化登入流程
 * 
 * 功能特色：
 * - Shadow DOM 封裝
 * - 自動登入判斷
 * - 登入狀態持久化
 * - 自動刷新 token
 * - 事件驅動架構
 * - 支援多種配置類型
 */

// 載入 Google Fonts
const loadGoogleFonts = () => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
};

// 防止重複重新載入的全局標記
let isSafeReloading = false;

// 安全的重新載入函數，專門處理手機瀏覽器問題
const safeReload = () => {
    // 防止重複調用
    if (isSafeReloading) {
        return;
    }
    
    isSafeReloading = true;
    
    try {
        // ✅ 直接重新載入 iframe（不再透過 parent postMessage）
        console.log('🔄 準備重新載入 iframe，資料同步完成');
        
        // 延遲執行確保資料已保存
        setTimeout(() => {
            try {
                console.log('🔄 執行 iframe reload');
                window.location.reload();
            } catch (reloadError) {
                console.warn('⚠️ reload 失敗，嘗試 href:', reloadError);
                try {
                    window.location.href = window.location.href;
                } catch (hrefError) {
                    console.error('❌ href 失敗，嘗試 replace:', hrefError);
                    window.location.replace(window.location.href);
                }
            }
        }, 300);
    } catch (error) {
        console.error('❌ safeReload 發生錯誤:', error);
    } finally {
        // 延遲重置標記，避免快速重複調用
        setTimeout(() => {
            isSafeReloading = false;
        }, 1000);
    }
};

// 配置設定
const configs = [
    {
        avatarContainerId: 'intro-content-simple',
        modalContainerId: 'intro-content-simple',
        avatarStyle: {
            desktop: {
                position: 'absolute',
                right: '20px',
                top: '20px',
                width: '32px',
                height: '32px',
            },
            mobile: {
                position: 'absolute',
                right: '15px',
                top: '15px',
                width: '28px',
                height: '28px',
            }
        }
    },
    {
        avatarContainerId: 'intro-content-advanced',
        modalContainerId: 'intro-content-advanced',
        avatarStyle: {
            desktop: {
                position: 'absolute',
                right: '20px',
                top: '20px',
                width: '32px',
                height: '32px',
            },
            mobile: {
                position: 'absolute',
                right: '15px',
                top: '15px',
                width: '28px',
                height: '28px',
            }
        }
    },
    {
        avatarContainerId: '#container-container-recom-header',
        modalContainerId: 'container-recom',
        avatarStyle: {
            desktop: {
                position: 'absolute',
                right: '20px',
                top: '20px',
                width: '32px',
                height: '32px',
            },
            mobile: {
                position: 'absolute',
                right: '15px',
                top: '15px',
                width: '28px',
                height: '28px',
            }
        }
    },
    {
        avatarContainerId: '#container_BF_mbinfo #header_BF',
        modalContainerId: '#container_BF_mbinfo',
        avatarStyle: {
            desktop: {
                position: 'absolute',
                left: '10px',
                top: '10px',
                width: '28px',
                height: '28px',
            },
            mobile: {
                position: 'absolute',
                left: '10px',
                top: '10px',
                width: '28px',
                height: '28px',
            }
        },
        modalContainerStyle: {
            desktop: {},
            mobile: {}
        }
    },
    {
        avatarContainerId: 'SB_Prod_cart',
        modalContainerId: 'Sizebox_cart',
        avatarStyle: {
            desktop: {
                position: 'absolute',
                left: '10px',
                top: '10px',
                width: '28px',
                height: '28px',
            },
            mobile: {
                position: 'absolute',
                left: '10px',
                top: '10px',
                width: '28px',
                height: '28px',
            }
        },
        modalContainerStyle: {
            desktop: {},
            mobile: {}
        }
    }
];

// OAuth2 配置
const OAUTH_CONFIG = {
    clientId: '265821704236-fkdt4rrvpmuhf442c7r2dfg16i71c6qg.apps.googleusercontent.com',
    redirectUri: 'https://api.inffits.com/inffits_account_register_and_retrieve_data/model',
    scope: 'openid profile email'
};

// 工具函數
const utils = {
    // 檢測是否為移動端
    isMobile: () => window.innerWidth <= 768,
    
    // 獲取當前頁面 URL
    getCurrentUrl: () => window.location.href,
    
    // 從 URL 獲取參數
    getUrlParams: (url) => {
        try {
            // 支援相對 URL 和絕對 URL
            const urlObj = url.startsWith('http') ? new URL(url) : new URL(url, window.location.origin);
            const urlParams = new URLSearchParams(urlObj.search);
            const urlHash = urlObj.hash;
            
            let result = Object.fromEntries(urlParams.entries());
            
            // 檢查 hash 參數（手機上可能使用 hash）
            if (urlHash.includes('access_token=')) {
                const hashParams = new URLSearchParams(urlHash.substring(1));
                const hashResult = Object.fromEntries(hashParams.entries());
                result = { ...result, ...hashResult }; // hash 參數優先
            }
            
            return result;
        } catch (error) {
            // 嘗試手動解析 URL 參數
            const manualParams = {};
            
            // 解析查詢參數
            const queryString = url.includes('?') ? url.split('?')[1].split('#')[0] : '';
            if (queryString) {
                queryString.split('&').forEach(param => {
                    const [key, value] = param.split('=');
                    if (key && value) {
                        manualParams[decodeURIComponent(key)] = decodeURIComponent(value);
                    }
                });
            }
            
            // 解析 hash 參數
            const hashString = url.includes('#') ? url.split('#')[1] : '';
            if (hashString && hashString.includes('access_token=')) {
                hashString.split('&').forEach(param => {
                    const [key, value] = param.split('=');
                    if (key && value) {
                        manualParams[decodeURIComponent(key)] = decodeURIComponent(value);
                    }
                });
            }
            
            return manualParams;
        }
    },
    
    // 檢測是否為移動端樣式
    getResponsiveStyle: (config, isMobile) => {
        return isMobile ? config.mobile : config.desktop;
    }
};

// Token 管理類
class TokenManager {
    static getAccessToken() {
        return localStorage.getItem('inf_google_access_token');
    }
    
    static setAccessToken(token) {
        localStorage.setItem('inf_google_access_token', token);
    }
    
    static getUserInfo() {
        const userInfo = localStorage.getItem('inf_google_user_info');
        return userInfo ? JSON.parse(userInfo) : null;
    }
    
    static setUserInfo(userInfo) {
        localStorage.setItem('inf_google_user_info', JSON.stringify(userInfo));
    }
    
    static getInfId() {
        return localStorage.getItem('inf_google_inf_id');
    }
    
    static setInfId(infId) {
        localStorage.setItem('inf_google_inf_id', infId);
    }
    
    static clearAll() {
        localStorage.removeItem('inf_google_access_token');
        localStorage.removeItem('inf_google_user_info');
        localStorage.removeItem('inf_google_inf_id');
    }
    
    // 刷新 access_token
    static async refreshAccessToken(sub) {
        try {
            const response = await fetch('https://api.inffits.com/inffits_account_register_and_retrieve_data/model', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    IDTYPE: "Google",
                    sub: sub,
                    refresh_token_proc: "1"
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.access_token) {
                    this.setAccessToken(data.access_token);
                    return data.access_token;
                }
            }
            
            // Token 刷新失敗，直接登出
            this.clearAll();
            document.dispatchEvent(new CustomEvent('infFITS:tokenRefreshFailed', {
                detail: { error: 'No refresh token found for user' }
            }));
            return null;
        } catch (error) {
            // 刷新失敗時清除所有本地存儲並觸發登出事件
            this.clearAll();
            
            // 觸發全域登出事件
            document.dispatchEvent(new CustomEvent('infFITS:tokenRefreshFailed', {
                detail: { error: error.message }
            }));
            
            // 不拋出錯誤，直接返回 null
            return null;
        }
    }
    
    // 獲取用戶資訊
    static async getUserInfoFromGoogle(accessToken) {
        try {
            const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            if (response.ok) {
                const userInfo = await response.json();
                this.setUserInfo(userInfo);
                return userInfo;
            }
            throw new Error('Failed to get user info');
        } catch (error) {
            throw error;
        }
    }
    
    // 調用 API 並處理 401 錯誤
    static async callApiWithRetry(apiUrl, payload, userInfo) {
        try {
            const accessToken = this.getAccessToken();
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
            
            if (response.status === 401) {
                try {
                // Token 過期，嘗試刷新
                const newToken = await this.refreshAccessToken(userInfo.sub);
                
                // 如果刷新失敗，直接返回，不重複調用
                if (!newToken) {
                    return null;
                }
                
                // 重新調用 API
                const retryResponse = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${newToken}`
                    },
                    body: JSON.stringify(payload)
                });
                return retryResponse;
                } catch (refreshError) {
                    // 刷新失敗，用戶已被登出，不拋出錯誤，讓調用者處理
                    return null;
                }
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    }
}

// 主要 Web Component 類
class InfGoogleLoginComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.isLoggedIn = false;
        this.userInfo = null;
        this.config = null;
        this.avatarElement = null;
        this.modalElement = null;
        this.avatarClickHandler = null;
        this.modalClickHandler = null;
        this.globalEventBound = false;
        this.isUpdatingBodyData = false;
        
        // 編輯追蹤 - 使用全域存儲，避免組件重新創建時丟失
        if (!window.globalEditedUsers) {
            window.globalEditedUsers = new Set();
        }
        this.editedUsers = window.globalEditedUsers; // 指向全域實例
        this.isHandlingBack = false; // 防止 handleBackToAvatar 重複調用
        
        this.init();
    }
    
    // 組件連接到 DOM 時調用
    connectedCallback() {
        // 檢查服飾 iframe 雲端資料同步
        this.checkCloudLocalDataSync();
    }
    
    // 初始化組件
    init() {
        this.checkLoginStatus();
        this.render();
        this.attachEventListeners();
        
        // 添加組件同步機制
        this.setupComponentSync();
        
        // 立即檢查 OAuth 回調
        this.handleOAuthCallback();
        
        // 檢查並填入本地鞋子測量資料
        this.checkAndFillLocalShoesData();
    }
    
    // 設置組件同步機制
    setupComponentSync() {
        // 監聽登入成功事件，同步所有組件狀態
        document.addEventListener('infFITS:loginSuccess', (event) => {
            const userInfo = event.detail;
            this.syncComponentState(userInfo);
        });
        
        // 監聽登出事件，同步所有組件狀態
        document.addEventListener('infFITS:logout', () => {
            this.syncComponentState(null);
        });
    }
    
    // 同步組件狀態
    syncComponentState(userInfo) {
        if (userInfo) {
            this.isLoggedIn = true;
            this.userInfo = userInfo;
        } else {
            this.isLoggedIn = false;
            this.userInfo = null;
        }
        
        // 重新渲染組件以反映新狀態
        this.render();
        this.attachEventListeners();
    }
    
    // 檢查登入狀態
    checkLoginStatus() {
        const accessToken = TokenManager.getAccessToken();
        const userInfo = TokenManager.getUserInfo();
        
        if (accessToken && userInfo) {
            this.isLoggedIn = true;
            this.userInfo = userInfo;
        }
    }
    
    // 渲染組件
    render() {
        this.shadowRoot.innerHTML = `
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap');
                
                :host {
                    --primary-color: #333;
                    --secondary-color: #d3d3d3;
                    --white-color: #fff;
                    --light-gray-color: #f2f2f2;
                    --font-family: "Noto Sans TC", sans-serif;
                    --box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
                }
                
                .avatar {
                    cursor: pointer;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-family: var(--font-family);
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: var(--box-shadow);
                    will-change: transform, box-shadow;
                }
                
                .avatar:hover {
                    transform: scale(1.05);
                    box-shadow: 0px 0px 8px 0px rgba(0, 0, 0, 0.15);
                }
                
                .avatar:active {
                    transform: scale(0.95);
                    transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
                }
                
                .avatar--logged-out {
                    background-color: var(--secondary-color);
                    color: var(--white-color);
                }
                
                .avatar--logged-in {
                    background-color: var(--primary-color);
                    color: var(--white-color);
                    overflow: hidden;
                }
                
                .avatar-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 50%;
                    display: block;
                    background-color: var(--secondary-color);
                }
                
                .avatar-icon {
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.5);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.3s ease;
                }
                
                .modal--visible {
                    opacity: 1;
                    visibility: visible;
                }
                
                .modal-content {
                    background-color: var(--white-color);
                    border-radius: 12px;
                    padding: 32px;
                    max-width: 400px;
                    width: 90%;
                    text-align: center;
                    font-family: var(--font-family);
                    box-shadow: var(--box-shadow);
                    transform: translateY(-20px);
                    transition: transform 0.3s ease;
                }
                
                .modal--visible .modal-content {
                    transform: translateY(0);
                }
                

                
                
                @media (max-width: 768px) {
                    .modal-content {
                        padding: 24px;
                        margin: 20px;
                    }
                }
            </style>
            
            <div class="avatar ${this.isLoggedIn ? 'avatar--logged-in' : 'avatar--logged-out'}">
                ${this.isLoggedIn ? this.renderLoggedInAvatar() : this.renderLoggedOutAvatar()}
            </div>
            
            <div class="modal">
                <div class="modal-content">
                    <!-- 模態框內容將在點擊頭像時動態載入 -->
                </div>
            </div>
        `;
        
        this.avatarElement = this.shadowRoot.querySelector('.avatar');
        this.modalElement = this.shadowRoot.querySelector('.modal');
        
        // 重新應用配置樣式
        this.updateAvatarStyle();
    }
    
    // 渲染未登入 Avatar
    renderLoggedOutAvatar() {
        return `
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_7314_33987)">
                    <rect width="32" height="32" rx="16" fill="#787974"/>
                    <path d="M20.2426 18.2426C19.1174 19.3679 17.5913 20 16 20C14.4087 20 12.8826 19.3679 11.7574 18.2426C10.6321 17.1174 10 15.5913 10 14C10 12.4087 10.6321 10.8826 11.7574 9.75736C12.8826 8.63214 14.4087 8 16 8C17.5913 8 19.1174 8.63214 20.2426 9.75736C21.3679 10.8826 22 12.4087 22 14C22 15.5913 21.3679 17.1174 20.2426 18.2426Z" fill="#FCFCF8"/>
                    <path d="M13.2791 19.3335C7.41602 19.3335 2.66602 24.6668 2.66602 33.6498C2.66602 34.5795 3.45768 35.3335 4.43387 35.3335H27.5648C28.541 35.3335 29.3327 34.5795 29.3327 33.6498C29.3327 24.0002 24.5827 19.3335 18.7196 19.3335H13.2791Z" fill="#FCFCF8"/>
                </g>
                <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="15.25" stroke="#787974" stroke-width="1.5"/>
                <defs>
                    <clipPath id="clip0_7314_33987">
                        <rect width="32" height="32" rx="16" fill="white"/>
                    </clipPath>
                </defs>
            </svg>
        `;
    }
    
    // 渲染已登入 Avatar
    renderLoggedInAvatar() {
        if (this.userInfo && this.userInfo.picture) {
            return `<img src="${this.userInfo.picture}" alt="User Avatar" class="avatar-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><span class="avatar-icon" style="display:none;">${this.userInfo.name ? this.userInfo.name.charAt(0).toUpperCase() : 'U'}</span>`;
        } else if (this.userInfo && this.userInfo.name) {
            const initial = this.userInfo.name.charAt(0).toUpperCase();
            return `<span class="avatar-icon">${initial}</span>`;
        }
        return this.renderLoggedOutAvatar();
    }
    
    // 渲染登入 Modal
    renderLoginModal() {
        return `
            <div class="login-modal-header">
                <div class="login-modal__back-arrow" id="login-modal__back-arrow" data-action="back-to-avatar">
                    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
                        <path d="M15.9996 22.3999L9.59961 15.9999L15.9996 9.5999" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                        <path d="M22.3996 16H9.59961" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
                    </svg>
            </div>
                <h2 class="login-modal-title">登入</h2>
                <div class="login-modal-spacer"></div>
            </div>
            <div class="login-modal__content">
                <div class="login-modal__logo">
                    <svg width="121" height="26" viewBox="0 0 121 26" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M108.993 25.0225C108.218 24.9117 107.436 24.8294 106.666 24.6852C104.615 24.3015 102.652 23.6742 100.911 22.4783C100.822 22.4172 100.739 22.3495 100.619 22.2591C101.246 20.8717 101.871 19.4884 102.51 18.0742C102.858 18.2941 103.158 18.5011 103.473 18.6795C105.75 19.9691 108.199 20.607 110.819 20.5532C111.716 20.5345 112.603 20.4172 113.436 20.0546C114.108 19.7622 114.648 19.3255 114.848 18.585C115.101 17.6489 114.703 16.8506 113.733 16.308C112.679 15.7182 111.505 15.4925 110.357 15.1829C108.727 14.743 107.088 14.3202 105.486 13.7931C104.306 13.4053 103.258 12.7349 102.442 11.7695C101.305 10.4261 100.962 8.84078 101.151 7.13813C101.482 4.16705 103.268 2.34546 105.957 1.30514C108.231 0.425301 110.608 0.325097 113.005 0.540169C114.851 0.705546 116.634 1.14383 118.314 1.94709C118.689 2.12713 119.05 2.33813 119.452 2.5532C118.876 3.96828 118.313 5.35157 117.729 6.78701C117.554 6.69903 117.4 6.62652 117.251 6.5475C115.036 5.37927 112.696 4.76257 110.175 4.95809C109.304 5.02571 108.458 5.19923 107.709 5.68559C106.86 6.23711 106.459 7.18538 106.709 8.05952C106.886 8.67703 107.347 9.05178 107.883 9.33854C109.031 9.9528 110.3 10.1915 111.549 10.4897C113.416 10.9361 115.305 11.3174 117.035 12.2029C118.81 13.1121 120.052 14.4538 120.353 16.4823C120.739 19.0852 119.941 21.2677 117.844 22.9084C116.19 24.2029 114.238 24.7178 112.187 24.9361C112.043 24.9516 111.903 24.9923 111.76 25.0216C110.838 25.0225 109.915 25.0225 108.993 25.0225Z" fill="#1E1E19"/>
                        <path d="M0.552734 5.36793C0.758844 4.52964 1.18166 3.86813 2.01261 3.51049C3.11241 3.03717 4.63094 3.29705 5.32992 4.09787C6.40039 5.32475 5.91974 7.26691 4.36618 7.83555C3.30141 8.22577 2.26842 8.12964 1.34459 7.38911C0.896523 7.02984 0.735219 6.52149 0.552734 6.01803C0.552734 5.80133 0.552734 5.58463 0.552734 5.36793Z" fill="#1E1E19"/>
                        <path d="M65.2331 11.5178C65.2331 13.038 65.2331 14.4922 65.2331 15.9846C61.581 15.9846 57.9517 15.9846 54.2702 15.9846C54.2702 18.8677 54.2702 21.7133 54.2702 24.5867C52.3932 24.5867 50.5692 24.5867 48.7109 24.5867C48.7109 16.7015 48.7109 8.80743 48.7109 0.865273C48.8429 0.858755 48.9863 0.844906 49.1305 0.844091C54.8405 0.843277 60.5513 0.845721 66.2612 0.835945C66.605 0.83513 66.7337 0.903562 66.7264 1.27831C66.702 2.48238 66.7175 3.68645 66.7166 4.89134C66.7166 5.0111 66.706 5.13004 66.6979 5.30845C62.5529 5.30845 58.4266 5.30845 54.2783 5.30845C54.2783 7.4054 54.2783 9.44287 54.2783 11.5178C57.9297 11.5178 61.5598 11.5178 65.2331 11.5178Z" fill="#1E1E19"/>
                        <path d="M86.4174 24.5827C86.4174 18.1836 86.4174 11.8039 86.4174 5.386C83.8715 5.386 81.3673 5.386 78.8377 5.386C78.8239 5.24832 78.8051 5.14486 78.8051 5.0414C78.8027 3.7697 78.8133 2.4972 78.797 1.22551C78.7929 0.916751 78.8972 0.836914 79.1937 0.836914C85.8675 0.843431 92.5404 0.841802 99.2141 0.843431C99.32 0.843431 99.4251 0.859725 99.5563 0.870315C99.5563 2.37011 99.5563 3.84954 99.5563 5.36971C97.0365 5.36971 94.533 5.36971 91.9937 5.36971C91.9937 11.7901 91.9937 18.1697 91.9937 24.5819C90.1355 24.5827 88.3131 24.5827 86.4174 24.5827Z" fill="#1E1E19"/>
                        <path d="M30.7687 13.9895C30.7687 12.6861 30.7687 11.4567 30.7687 10.1818C31.9963 10.1818 33.2224 10.1818 34.4827 10.1818C34.4909 10.0091 34.5023 9.87955 34.5031 9.74921C34.5047 8.7211 34.543 7.69055 34.4966 6.66407C34.3458 3.35002 36.7564 0.906028 39.4945 0.216008C42.6416 -0.577475 46.0094 0.870183 47.3935 3.6547C47.501 3.87141 47.5898 4.09707 47.7128 4.3765C46.3817 4.7936 45.075 5.20338 43.7405 5.62212C43.2908 4.75206 42.5552 4.32273 41.6118 4.18342C39.9629 3.93984 38.653 5.04126 38.653 6.69259C38.653 7.80216 38.6546 8.91173 38.6562 10.0213C38.6562 10.0474 38.6652 10.0734 38.6815 10.1622C39.286 10.1622 39.9035 10.1622 40.521 10.1622C41.1295 10.1622 41.7373 10.1622 42.3719 10.1622C42.3719 11.438 42.3719 12.6869 42.3719 13.9667C41.1434 13.9667 39.9279 13.9667 38.653 13.9667C38.653 14.1386 38.653 14.2812 38.653 14.4237C38.653 15.5333 38.6163 16.6445 38.6603 17.7525C38.7809 20.8026 36.6684 23.2775 33.932 24.0906C30.635 25.0706 27.0554 23.5309 25.6803 20.5297C25.6029 20.3602 25.5377 20.1842 25.4473 19.9618C26.7931 19.5415 28.1128 19.1292 29.4212 18.7211C30.3247 20.0694 31.6697 20.5329 33.0179 19.9749C33.9629 19.5838 34.4778 18.8669 34.4982 17.847C34.5234 16.5769 34.5039 15.306 34.5039 13.9903C33.2583 13.9895 32.033 13.9895 30.7687 13.9895Z" fill="#1E1E19"/>
                        <path d="M24.1711 24.5974C22.7649 24.5974 21.3719 24.5974 19.921 24.5974C19.921 24.4467 19.921 24.3041 19.921 24.1616C19.921 21.8471 19.9283 19.5327 19.9152 17.2182C19.9128 16.7481 19.859 16.274 19.7865 15.808C19.5739 14.4459 18.6484 13.6182 17.288 13.5335C15.8167 13.4414 14.4513 14.0483 13.8753 15.4724C13.5886 16.1811 13.5226 16.9127 13.5193 17.6565C13.5104 19.795 13.5161 21.9335 13.5161 24.072C13.5161 24.2333 13.5161 24.3946 13.5161 24.5852C12.0871 24.5852 10.6859 24.5852 9.25781 24.5852C9.25781 19.7379 9.25781 14.8997 9.25781 10.0329C10.6045 10.0329 11.9397 10.0329 13.3197 10.0329C13.3197 10.5396 13.3197 11.0447 13.3197 11.6019C13.701 11.3127 14.013 11.039 14.3592 10.819C15.8729 9.85689 17.5446 9.65078 19.2823 9.88296C22.3438 10.2919 24.0244 12.4744 24.1385 15.3771C24.2558 18.3636 24.1947 21.3575 24.2102 24.3481C24.2102 24.4263 24.1865 24.5045 24.1711 24.5974Z" fill="#1E1E19"/>
                        <path d="M75.5762 24.6023C73.7146 24.6023 71.8988 24.6023 70.0527 24.6023C70.0527 16.6944 70.0527 8.79949 70.0527 0.871993C70.179 0.862217 70.2963 0.844294 70.4144 0.844294C72.0153 0.842665 73.6161 0.849997 75.2169 0.836962C75.5216 0.834518 75.6087 0.924946 75.6079 1.228C75.6006 8.90213 75.6022 16.5763 75.6006 24.2512C75.6022 24.3563 75.5867 24.4622 75.5762 24.6023Z" fill="#1E1E19"/>
                        <path d="M1.125 10.019C2.54822 10.019 3.92744 10.019 5.34007 10.019C5.34007 14.8785 5.34007 19.7241 5.34007 24.5918C3.94048 24.5918 2.55066 24.5918 1.125 24.5918C1.125 19.7445 1.125 14.8997 1.125 10.019Z" fill="#1E1E19"/>
                    </svg>
                </div>
                <div class="login-modal__divider">
                    <div class="login-modal__divider-line"></div>
                    <div class="login-modal__divider-line"></div>
                 </div>
            <button class="google-login-btn" data-action="login">
                <svg class="google-icon" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                繼續使用 Google 登入
            </button>
            </div>
        `;
    }
    
    // 渲染用戶資訊 Modal
    renderUserInfoModal() {
        return `
            <div class="profile-modal-header">
                <div class="profile-modal__back-arrow" id="modal-profile-back-arrow" data-action="back-to-avatar">
                    <svg width="36" height="36" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.9996 22.3999L9.59961 15.9999L15.9996 9.5999" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M22.3996 16H9.59961" stroke="#333" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <h2 class="profile-modal-title">個人資訊</h2>
                <div class="profile-modal__setting-btn" id="profile-setting-btn">
                    <img height="15px" src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAAdgAAAHYAfpcpnIAAAAHdElNRQfpBgQOLjND9MctAAACi0lEQVRo3u2YTUhUURTHfyM1m5hPV0XmKsxcWWPUJiQnBIU0JSHaRC1ahEQEuQlTXEVRmxatMiq1JgrbZCWtWxQ0pcnQrrFoaJGOMS3E3mnRY7ozz3Geb57Xove/m/fOu+/8z73n4x4uePCwzvCV+V5FK3E2k+U1D5nXbd4eZpD8WKBXL30LPxT63+OyPvpqviIIEzSykRr6THM6dBlwEUG4qURJOwbCW3dp1CDcx1blbYg65qllQZHdpwc4xVyFrJ94uZw4YfH406IZJy0znI3EH5VV7m7o6rFBeb7GgyIX7GUTOUUWB5dcYAP9CMJ1JUriLCEkde1NlIwZB7vwU8sQiwjCIV0GQDM5S/hc0kcP0MS0Qp7ltPsU5Q+jg8TZQpZXPCKrd/0ePPwfKJeGzhChmxgBMkzyHEP3os7wXSlf72nSS3/VUr5zNOuj70IQFhmgBj+NZpOTIaLLgGkEgzZFMowgXCj1Q+me0Ami3ADucVSRhfhIiBT9isx2T+hsnCjS++yv7gnXwgWjHCtwQZqgPRe4gSmEJQ4oC7y1chC6jcNmGg6yDT+7Tf9/0ZeGcGWZQrRfHz1AL1mFforYSpPX5jAK00WMEJ95waT+w8iDh38LlaRhA51sBz4wzoxuwyOMYeSLjcGozmILEd5ZCm6SsD4DxhCENN0ECNBJCkG4q4u+AQMhTVTZkTSCQf3qlamXVHYbknZ8wFm+5SVznCOBj/M8saXBlZ4wUPBvcL3vCR2nc+l7wtJo4zjQwrgiawVgmAmbLqgIOzEQUkrmVzOL8JMdlSm2jxEzDY8QJEgPswjCbV30ECZpCaw3hPQZABFGCkrxHad1sJLDqJ4O6oAUj0npXL0HD67iF0TWfTWq41byAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDI1LTA2LTA0VDE0OjQ2OjIxKzAwOjAwCttSSgAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyNC0wMi0yMFQwNDo0NTowOCswMDowMCROR08AAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjUtMDYtMDRUMTQ6NDY6NTErMDA6MDAmVsIwAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAAABJRU5ErkJggg==">
                    <div class="profile-modal__dropdown" id="profile-dropdown">
                        <div class="profile-modal__dropdown-item logout" id="profile-logout-item">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path d="M16 17L21 12L16 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path d="M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                            登出
                        </div>
                        <div class="profile-modal__dropdown-item delete" id="profile-delete-item">
                            <svg viewBox="0 0 24 24" fill="none">
                                <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                            </svg>
                            刪除帳號
                        </div>
                    </div>
                </div>
            </div>
            <div class="user-info">
                <div class="user-avatar">
                    ${this.userInfo && this.userInfo.picture ? 
                        `<img src="${this.userInfo.picture}" alt="User Avatar" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"><span style="display:none;">${this.userInfo.name ? this.userInfo.name.charAt(0).toUpperCase() : 'U'}</span>` :
                        `<span>${this.userInfo && this.userInfo.name ? this.userInfo.name.charAt(0).toUpperCase() : 'U'}</span>`
                    }
                </div>
                <div class="user-details">
                    <div class="user-detail-item">
                        <span class="user-detail-label">姓名</span>
                        <span class="user-detail-value">${this.userInfo ? this.userInfo.name : '尚未提供'}</span>
                    </div>
                    <div class="user-detail-item">
                        <span class="user-detail-label">電子郵件</span>
                        <span class="user-detail-value">${this.userInfo ? this.userInfo.email : '尚未提供'}</span>
                    </div>
                    <div class="user-detail-item">
                        <span class="user-detail-label">電話號碼</span>
                        <span class="user-detail-value">尚未提供</span>
                    </div>
                    <div class="user-detail-item">
                        <span class="user-detail-label">出生日期</span>
                        <span class="user-detail-value">尚未提供</span>
                    </div>
                </div>
            </div>
            
            ${this.renderUserDataSection()}
        `;
    }
    
    // 渲染使用者資料區塊
    renderUserDataSection() {
        if (!this.userInfo || !this.userInfo.BodyData) {
            return '';
        }
        
        const bodyData = this.userInfo.BodyData;
        let html = '<div class="section-title" style="margin-top: 24px;">使用者資料</div>';
        
        // 渲染每個使用者資料
        Object.keys(bodyData).forEach(userKey => {
            const userData = bodyData[userKey];
            const isShoes = userKey.includes('shoes');
            const isBody = userKey.includes('body') || (!isShoes && (userKey.includes('F') || userKey.includes('M')));
            
            if (isShoes) {
                html += this.renderShoesUserData(userKey, userData);
            } else if (isBody) {
                html += this.renderBodyUserData(userKey, userData);
            }
        });
        
        return html;
    }
    
    // 渲染身體資料使用者
    renderBodyUserData(userKey, userData) {
        const height = userData.HV || '0';
        const weight = userData.WV || '0';
        
        // 格式化胸圍顯示（與 demo.js 一致）
        let bust = '尚未提供';
        if (userData.CC && userData.CC.trim() !== '') {
            const currentValue = userData.CC;
            // 獲取當前使用的單位（從 localStorage 讀取，預設為 cm）
            const currentUnit = localStorage.getItem('chestMeasurementUnit') || 'cm';
            
            if (currentValue.includes('_')) {
                // 上下胸圍格式 (例如: "85_75")
                const parts = currentValue.split('_');
                bust = `上胸圍 ${parts[0]} ${currentUnit} / 下胸圍 ${parts[1]} ${currentUnit}`;
            } else if (/^\d+(\.\d+)?$/.test(currentValue.trim())) {
                // 純數字格式 (例如: "85")
                bust = `${currentValue} ${currentUnit}`;
            } else {
                // 胸圍/罩杯格式 (例如: "32B")
                bust = currentValue;
            }
        }
        
        const gender = userData.Gender === 'F' ? '女性' : userData.Gender === 'M' ? '男性' : '尚未提供';
        const isFemale = userData.Gender === 'F';
        
        // 計算 BMI
        const bmi = this.calculateBMI(height, weight);
        const bmiStatus = this.getBMIStatus(bmi);
        
        // 只有女性才顯示胸圍欄位
        const chestField = isFemale ? `
            <div class="body-data-item editable-field" data-field="胸圍" data-user-key="${userKey}" onclick="window.editFieldHandler && window.editFieldHandler('胸圍', this)">
                <span class="body-data-label">胸圍</span>
                <div class="body-data-value-container">
                    <span class="body-data-value">${bust}</span>
                    <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
            </div>
        ` : '';
        
        return `
            <div class="user-data-card" data-user-key="${userKey}">
                <div class="user-avatar-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>
                    </svg>
                </div>
                <div class="user-data-info">
                    <div class="user-data-name">${userKey}</div>
                    <div class="user-data-subtitle">身體測量資料</div>
                </div>
                <div class="user-data-actions">
                    <div class="user-data-delete" data-action="delete-user-data" data-user-key="${userKey}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            <div class="body-data-list">
                <div class="body-data-item">
                    <span class="body-data-label">性別</span>
                    <span class="body-data-value">${gender}</span>
                </div>
                <div class="body-data-item editable-field" data-field="身高" data-user-key="${userKey}" onclick="window.editFieldHandler && window.editFieldHandler('身高', this)">
                    <span class="body-data-label">身高</span>
                    <div class="body-data-value-container">
                        <span class="body-data-value">${height} cm</span>
                        <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="body-data-item editable-field" data-field="體重" data-user-key="${userKey}" onclick="window.editFieldHandler && window.editFieldHandler('體重', this)">
                    <span class="body-data-label">體重</span>
                    <div class="body-data-value-container">
                        <span class="body-data-value">${weight} kg</span>
                        <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                ${chestField}
                <div class="bmi-data-item" style="display: none;">
                    <span class="body-data-label">BMI 指數</span>
                    <div class="bmi-value-container">
                        <span class="bmi-value">${bmi}</span>
                        <div class="bmi-status">${bmiStatus}</div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 渲染鞋子資料使用者
    renderShoesUserData(userKey, userData) {
        const footLength = userData.FH || '0';
        const footWidth = userData.FW || '0';
        // 腳圍是選填的，且需落在 18.0~39.9（步進 0.1）才顯示
        const rawFC = userData.FCir;
        const fcNum = rawFC !== undefined && rawFC !== null ? parseFloat(rawFC) : NaN;
        const isValidFC = !!rawFC && !isNaN(fcNum) && fcNum >= 18.0 && fcNum <= 39.9 && Math.round(fcNum * 10) === fcNum * 10;
        const footCircumference = isValidFC ? rawFC : '';
        const gender = userData.Gender === 'F' ? '女性' : userData.Gender === 'M' ? '男性' : '尚未提供';
        
        return `
            <div class="user-data-card" data-user-key="${userKey}">
                <div class="user-avatar-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/>
                    </svg>
                </div>
                <div class="user-data-info">
                    <div class="user-data-name">${userKey}</div>
                    <div class="user-data-subtitle">鞋子測量資料</div>
                </div>
                <div class="user-data-actions">
                    <div class="user-data-delete" data-action="delete-user-data" data-user-key="${userKey}">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 6H5H21" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
            
            <div class="body-data-list">
                <div class="body-data-item editable-field" data-field="腳長" data-user-key="${userKey}" onclick="window.editFieldHandler && window.editFieldHandler('腳長', this)">
                    <span class="body-data-label">腳長</span>
                    <div class="body-data-value-container">
                        <span class="body-data-value">${footLength} cm</span>
                        <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="body-data-item editable-field" data-field="腳寬" data-user-key="${userKey}" onclick="window.editFieldHandler && window.editFieldHandler('腳寬', this)">
                    <span class="body-data-label">腳寬</span>
                    <div class="body-data-value-container">
                        <span class="body-data-value">${footWidth} cm</span>
                        <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
                <div class="body-data-item editable-field" data-field="腳圍" data-user-key="${userKey}" onclick="window.editFieldHandler && window.editFieldHandler('腳圍', this)">
                    <span class="body-data-label">腳圍</span>
                    <div class="body-data-value-container">
                        <span class="body-data-value">${footCircumference ? footCircumference + ' cm' : '未填寫'}</span>
                        <svg class="edit-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89783 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    }
    
    // 關閉所有編輯彈窗 - 修復 shadowRoot 問題
    closeAllEditPopups() {
        let closedCount = 0;
        
        // 方法1: 在整個文檔中查找編輯器 (不在 shadowRoot 中)
        const allDivs = document.querySelectorAll('div');
        
        allDivs.forEach((div, index) => {
            const hasSelect = div.querySelector('select');
            const hasButton = div.querySelector('button');
            const isAbsolute = div.style.position === 'absolute';
            const hasSelectorClass = div.className.includes('selector');
            
            // 只有真正的編輯器才移除（必須是絕對定位且有特定類名）
            if (hasSelect && hasButton && isAbsolute && hasSelectorClass) {
                closedCount++;
                
                // 恢復隱藏的元素
                const fieldContainer = div.closest('.body-data-item');
                if (fieldContainer) {
                    const valueElement = fieldContainer.querySelector('.body-data-value');
                    const editIcon = fieldContainer.querySelector('.edit-icon');
                    
                    if (valueElement) {
                        valueElement.style.display = 'block';
                        valueElement.style.visibility = 'visible';
                    }
                    if (editIcon) {
                        editIcon.style.display = 'flex';
                        editIcon.style.visibility = 'visible';
                    }
                }
                
                // 移除編輯器
                div.remove();
            }
        });
        
        // 方法2: 在 shadowRoot 中查找 (如果存在)
        if (this.shadowRoot) {
            const shadowDivs = this.shadowRoot.querySelectorAll('div');
            
            shadowDivs.forEach((div, index) => {
                const hasSelect = div.querySelector('select');
                const hasButton = div.querySelector('button');
                
                if (hasSelect && hasButton) {
                    closedCount++;
                    div.remove();
                }
            });
        }
        
        // 方法3: 只恢復沒有編輯器的欄位的隱藏元素
        const allFieldContainers = document.querySelectorAll('.body-data-item');
        allFieldContainers.forEach(container => {
            // 檢查這個容器是否有編輯器
            const hasEditor = container.querySelector('.height-selector, .weight-selector, .bust-selector, .foot-length-selector, .foot-width-selector, .foot-circumference-selector');
            
            if (!hasEditor) {
                // 只有沒有編輯器的容器才恢復隱藏元素
                const valueElement = container.querySelector('.body-data-value');
                const editIcon = container.querySelector('.edit-icon');
                
                if (valueElement && valueElement.style.display === 'none') {
                    valueElement.style.display = 'block';
                    valueElement.style.visibility = 'visible';
                }
                if (editIcon && editIcon.style.display === 'none') {
                    editIcon.style.display = 'flex';
                    editIcon.style.visibility = 'visible';
                }
            }
        });
        
    }
    
    // 設置外部點擊監聽器來關閉編輯彈窗
    setupOutsideClickListener() {
        
        // 移除舊的監聽器（如果存在）
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler);
        }
        
        // 創建新的監聽器
        this.outsideClickHandler = (event) => {
            
            // 檢查點擊是否在編輯器內部 (在整個文檔中查找)
            let clickedInsideEditor = false;
            let hasActiveEditor = false;
            
            // 在整個文檔中查找編輯器（包括胸圍測量選擇器和胸圍/罩杯選擇器）
            const allDivs = document.querySelectorAll('div');
            allDivs.forEach(div => {
                const hasSelect = div.querySelector('select');
                const hasButton = div.querySelector('button');
                const isAbsolute = div.style.position === 'absolute';
                const hasSelectorClass = div.className.includes('selector');
                const isChestMeasurement = div.className.includes('chest-measurement-selector');
                const isBraSize = div.className.includes('bra-size-selector');
                
                // 檢查是否為真正的編輯器（包括胸圍相關的選擇器）
                if ((hasSelect && hasButton && isAbsolute && hasSelectorClass) || isChestMeasurement || isBraSize) {
                    hasActiveEditor = true;
                    
                    if (div.contains(event.target)) {
                        clickedInsideEditor = true;
                    }
                }
            });
            
            // 如果有活動編輯器且點擊不在編輯器內部，關閉所有彈窗
            if (hasActiveEditor && !clickedInsideEditor) {
                this.closeAllEditPopups();
            }
        };
        
        // 立即添加監聽器
        document.addEventListener('click', this.outsideClickHandler);
    }
    
    // 編輯欄位
    editField(fieldLabel, editIcon) {
        // 暫時禁用外部點擊監聽器
        if (this.outsideClickHandler) {
            document.removeEventListener('click', this.outsideClickHandler);
        }
        
        // 先關閉所有現有的編輯彈窗
        this.closeAllEditPopups();
        
        // 延遲創建新的編輯器，確保關閉操作完成
        setTimeout(() => {
            this.createNewEditor(fieldLabel, editIcon);
        }, 50);
        
        // 延遲重新設置外部點擊監聽器
        setTimeout(() => {
            this.setupOutsideClickListener();
        }, 100);
    }
    
    // 創建新的編輯器
    createNewEditor(fieldLabel, editIcon) {
        // 找到欄位容器
        const fieldContainer = editIcon.closest('.body-data-item');
        if (!fieldContainer) {
            console.error('找不到欄位容器');
            return;
        }
        
        // 獲取當前值
        const valueElement = fieldContainer.querySelector('.body-data-value');
        if (!valueElement) {
            console.error('找不到數值元素');
            return;
        }
        
        const currentValue = valueElement.textContent || '';
        
        // 根據欄位類型創建編輯器
        if (fieldLabel === '身高') {
            this.createHeightEditor(fieldContainer, valueElement, currentValue);
        } else if (fieldLabel === '體重') {
            this.createWeightEditor(fieldContainer, valueElement, currentValue);
        } else if (fieldLabel === '胸圍') {
            this.createBustEditor(fieldContainer, valueElement, currentValue);
        } else if (fieldLabel === '腳長') {
            this.createFootLengthEditor(fieldContainer, valueElement, currentValue);
        } else if (fieldLabel === '腳寬') {
            this.createFootWidthEditor(fieldContainer, valueElement, currentValue);
        } else if (fieldLabel === '腳圍') {
            this.createFootCircumferenceEditor(fieldContainer, valueElement, currentValue);
        } else {
            console.error('未知的欄位類型:', fieldLabel);
        }
        
    }
    
    // 創建身高編輯器
    createHeightEditor(fieldContainer, valueElement, currentValue) {
        // 找到編輯圖標
        const editIcon = fieldContainer.querySelector('.edit-icon');
        
        // 隱藏原始值
        valueElement.style.display = 'none';
        if (editIcon) editIcon.style.display = 'none';
        
        // 創建選擇器容器
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'height-selector';
        selectorContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1500;
            margin-top: 8px;
        `;
        
        // 防止事件冒泡
        selectorContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 創建標題
        const title = document.createElement('div');
        title.textContent = '選擇身高';
        title.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: #1E293B;
            margin-bottom: 16px;
            text-align: center;
        `;
        selectorContainer.appendChild(title);
        
        // 創建身高選擇區域
        const heightSection = document.createElement('div');
        heightSection.style.cssText = `
            margin-bottom: 16px;
        `;
        
        // 創建下拉選擇器
        const selectElement = document.createElement('select');
        selectElement.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            outline: none;
        `;
        
        // 添加預設選項
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇身高';
        selectElement.appendChild(defaultOption);
        
        // 生成身高選項 (145-195)
        for (let height = 145; height <= 195; height++) {
            const option = document.createElement('option');
            option.value = height.toString();
            option.textContent = `${height} cm`;
            if (currentValue === `${height} cm`) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        }
        
        heightSection.appendChild(selectElement);
        selectorContainer.appendChild(heightSection);
        
        // 創建按鈕區域
        const buttonSection = document.createElement('div');
        buttonSection.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '確認';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #000000;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        buttonSection.appendChild(cancelBtn);
        buttonSection.appendChild(confirmBtn);
        selectorContainer.appendChild(buttonSection);
        
        // 添加到容器
        fieldContainer.appendChild(selectorContainer);
        
        // 取消按鈕事件
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectorContainer.remove();
            valueElement.style.display = 'block';
            if (editIcon) editIcon.style.display = 'flex';
        });
        
        // 確認按鈕事件
        confirmBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedHeight = selectElement.value;
            if (selectedHeight) {
                try {
                    // 更新顯示值
                    valueElement.textContent = `${selectedHeight} cm`;
                    
                    // 保存到本地存儲
                    await this.saveFieldValue('HV', selectedHeight, 'body', fieldContainer);
                    
                    // 關閉選擇器
                    selectorContainer.remove();
                    valueElement.style.display = 'block';
                    if (editIcon) editIcon.style.display = 'flex';
                    
                } catch (error) {
                    console.error('保存身高失敗:', error);
                    // showNotification('保存失敗，請重試', 'error');
                }
            }
        });
    }
    
    // 創建體重編輯器
    createWeightEditor(fieldContainer, valueElement, currentValue) {
        // 找到編輯圖標
        const editIcon = fieldContainer.querySelector('.edit-icon');
        
        // 隱藏原始值
        valueElement.style.display = 'none';
        if (editIcon) editIcon.style.display = 'none';
        
        // 創建選擇器容器
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'weight-selector';
        selectorContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1500;
            margin-top: 8px;
        `;
        
        // 防止事件冒泡
        selectorContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 創建標題
        const title = document.createElement('div');
        title.textContent = '選擇體重';
        title.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: #1E293B;
            margin-bottom: 16px;
            text-align: center;
        `;
        selectorContainer.appendChild(title);
        
        // 創建體重選擇區域
        const weightSection = document.createElement('div');
        weightSection.style.cssText = `
            margin-bottom: 16px;
        `;
        
        // 創建下拉選擇器
        const selectElement = document.createElement('select');
        selectElement.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            outline: none;
        `;
        
        // 添加預設選項
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇體重';
        selectElement.appendChild(defaultOption);
        
        // 生成體重選項 (35-120)
        for (let weight = 35; weight <= 120; weight++) {
            const option = document.createElement('option');
            option.value = weight.toString();
            option.textContent = `${weight} kg`;
            if (currentValue === `${weight} kg`) {
                option.selected = true;
            }
            selectElement.appendChild(option);
        }
        
        weightSection.appendChild(selectElement);
        selectorContainer.appendChild(weightSection);
        
        // 創建按鈕區域
        const buttonSection = document.createElement('div');
        buttonSection.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '確認';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #000000;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        buttonSection.appendChild(cancelBtn);
        buttonSection.appendChild(confirmBtn);
        selectorContainer.appendChild(buttonSection);
        
        // 添加到容器
        fieldContainer.appendChild(selectorContainer);
        
        // 取消按鈕事件
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectorContainer.remove();
            valueElement.style.display = 'block';
            if (editIcon) editIcon.style.display = 'flex';
        });
        
        // 確認按鈕事件
        confirmBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedWeight = selectElement.value;
            if (selectedWeight) {
                try {
                    // 更新顯示值
                    valueElement.textContent = `${selectedWeight} kg`;
                    
                    // 保存到本地存儲
                    await this.saveFieldValue('WV', selectedWeight, 'body', fieldContainer);
                    
                    // 關閉選擇器
                    selectorContainer.remove();
                    valueElement.style.display = 'block';
                    if (editIcon) editIcon.style.display = 'flex';
                    
                } catch (error) {
                    console.error('保存體重失敗:', error);
                    // showNotification('保存失敗，請重試', 'error');
                }
            }
        });
    }
    
    // 檢測胸圍編輯模式（根據格式判斷）
    detectChestEditMode(currentValue) {
        
        if (!currentValue || currentValue.trim() === '') {
            return false; // 空值預設使用胸圍/罩杯模式
        }

        // 檢查是否包含下底線 (例如: "33_33", "27.0inch_24.0inch")
        if (currentValue.includes('_')) {
            return true; // 使用上胸圍/下胸圍模式
        }

        // 檢查是否是純數字格式 (例如: "85", "90")
        if (/^\d+(\.\d+)?$/.test(currentValue.trim())) {
            return true; // 使用上胸圍/下胸圍模式
        }


        // 其他情況（如 "28A", "32B" 等）使用胸圍/罩杯模式
        return false;
    }
    
    // 創建胸圍編輯器
    createBustEditor(fieldContainer, valueElement, currentValue) {
        
        // 取得原始資料值而不是顯示文字
        let rawValue = currentValue;
        
        // 如果是格式化的顯示文字，嘗試從資料源取得原始值
        if (currentValue.includes('上胸圍') && currentValue.includes('下胸圍')) {
            
            // 從 fieldContainer 的 data-user-key 取得使用者類型
            const userKey = fieldContainer.getAttribute('data-user-key');
            if (userKey && this.userInfo && this.userInfo.BodyData && this.userInfo.BodyData[userKey]) {
                const userData = this.userInfo.BodyData[userKey];
                rawValue = userData.CC || userData.cc || currentValue;
            } else {
                // 後備方案：從本地存儲取得
                const localKey = userKey === 'bodyM' ? 'BodyMID_size' : 'BodyID_size';
                const localData = this.getLocalData(localKey);
                if (localData && (localData.CC || localData.cc)) {
                    rawValue = localData.CC || localData.cc;
                }
            }
        }
        
        
        // 根據格式判斷使用不同的編輯方式
        const useChestMeasurement = this.detectChestEditMode(rawValue);
        
        if (useChestMeasurement) {
            // 格式為 "33_33" 或包含下底線，使用上胸圍/下胸圍編輯器
            this.createChestMeasurementSelector(fieldContainer, valueElement, rawValue);
        } else {
            // 格式為 "28A" 或空值，使用胸圍/罩杯編輯器
            this.createBraSizeSelector(fieldContainer, valueElement, rawValue);
        }
    }

    // 創建胸圍/罩杯選擇器
    createBraSizeSelector(fieldContainer, valueElement, currentValue) {
        // 隱藏原始值
        valueElement.style.display = 'none';
        
        // 創建胸圍選擇器容器
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'bra-size-selector';
        selectorContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1500;
        `;
        
        // 解析當前值
        let currentBand = '';
        let currentCup = '';
        let currentSystem = 'european'; // 預設歐規
        
        if (currentValue) {
            // 處理格式如 "28A" 或 "28_A"
            if (currentValue.includes('_')) {
                const parts = currentValue.split('_');
                if (parts.length >= 2) {
                    currentBand = parts[0];
                    currentCup = parts[1];
                }
            } else {
                // 處理格式如 "28A"
                const match = currentValue.match(/^(\d+)([A-G])$/);
                if (match) {
                    currentBand = match[1];
                    currentCup = match[2];
                }
            }
            
            // 根據胸圍數字判斷是歐規還是日規
            if (currentBand) {
                const bandNum = parseInt(currentBand);
                // 歐規範圍：28-54，日規範圍：60-125
                if (bandNum >= 60 && bandNum <= 125) {
                    currentSystem = 'japanese';
                } else if (bandNum >= 28 && bandNum <= 54) {
                    currentSystem = 'european';
                }
            }
        }
        
        // 創建標題區域（包含標題和切換按鈕）
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        `;
        
        const title = document.createElement('div');
        title.textContent = '選擇胸圍尺寸';
        title.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: #1E293B;
            flex: 1;
            text-align: center;
        `;
        
        // 創建切換模式按鈕
        const toggleModeBtn = document.createElement('div');
        toggleModeBtn.style.cssText = `
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;
        toggleModeBtn.title = '切換到上胸圍/下胸圍編輯模式';
        toggleModeBtn.innerHTML = `
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAEuYAABLmAc2/QKgAAAAHdElNRQfpBgQOLjND9MctAAAE6klEQVRo3sWZ30+TZxTHP7y8tFUDXWkmSwYDAQuLynoBFxtLgGXgdoPJlsgS4w3ZnZqMLOwPkGTlZjfuFrlZSCbGcDG8QRO9GNEEJ52bCVTMZGNEnbRiYmlraXfRh4e2vG/7PrSU04uePD/OOc/znuc5z/meMtTIhQcvH9BKHW4OYgNivCbICov4mSdASEVgmYLqDnrppBkXusmYOC95xCw3mFMzIx81M8xdwiQt/sLcZZim4ihv5CKPDdVsEiVMmCibhv2PGaGxsE/g5CwX8GS0RVghQIAnPGWdKGDHSQ1H8OChFkfG6EV+5Cde7W7t7VwnnraiCHP4OEktdsPxNmrp43vm2EibFWeadnXlOoMsp4kJcYV+3JbmVtPPz4TSZi8zaOq4hlTJaJrLhZmkC5vSAiroYjJDho9Kq5PdjJOQU+cZyPquVsnBaealnATj1nbQzYScFGWMhl0p36J6xohKeRP5TahkXA4PMrTLtWfuwxBBKXOcqlyDdUbl5q8yULDyLRpgVX6I0VzuOCjdZpVTRVMPcEqaEGbQbFC7PHjBIq5+exeC8lAa3gtOrkvX+6bo6gGGpDtOG3nCeXnrjRXB9YzIwZi8Hc9ndzayKM99vYLQCioURjfIe2EhO1ZelC5yWkFgD1NM0aMwY0C6+Uh6c7MMuJMK21/DfZIkuU+N5TkOJmWwbt5u/k6GnC6F1ZzgBUmSvOCEwqwuGaaGATTAxReic4Y7CqLKDLj8dIcZwX2JK2VAB20ARJggpiBqdxRjgigAbXSkDOjlAAB/8uueqweY5Q8ADtALGi46RcdNgiUxYI2bguvEpeHhKAARbpdEPcBtIgA049Fw8hYAKzwsmQEPWQHAhVfDK8JjgOclM+A/HgGg49VoEY2BEpyALYqyKLgWjTrB/qUsZtOAs0pPxH+dLl5pCZ7lGF7D4R2XTYIWygEop5UytKz+JM9zyHxKAg2o1jkIQJx108E9/MB7Bu26iOpOLhM36P+bb7llInOdODbgEOINGDaNaRVMWU5Ks39TpsH6ExEVExr7TDox7EC5Sb4Hb7hEveknKAOSvDL8BMtc4o2JVJvwn5hOGDug4zQ18hafGzphK2M4gXW+ZlHRCZ3i9nmts4YL0HI+Kp4ZikqKdW+yoHyLviMMXtP4RzQdURSB2MRMzio1iP8VTd5JHsX8txCyy/t3QcMvNtLD4ZIZ8LZAXeL8ruEXeFYtx0pmwDHeBSCEXyPAEgAOuktmQLd4ey8R0AgxK5o/tQjBFEpuegU3S0gDbrABwHH5ONtb6uQ4ABvMpB6lczwAwMGZEpwEG2fErfuAeykDQlwTnX18qCAqacDlp4/oE9y1bTi3qaDU7DeFA+zgqtC0lJmebienKtBE0ZJTaGRBpucNCgJV03O/TM93oMjnSgpQnNvZXcW0hGiG9sSAPBDNvoNUsO8wHej40oDKr4q4eotAZSmg2ryYeTpYHSsYrG5QBatTJlxOqwL5C4DrB3YD1wNU4ssoNlylWzFM2QopWMDOks1LhZKNm36uFFaySVE7v2QVre7h4zPqTJIYO7WcxKdWtMoNsFVxlgvyBZuiCP8SYFGU7WKATZTtWjha3LJdihoZYckw9SxK4dIaNe1d6ValeN1OLx/nKV6HWFIrXquArCkzPHhp433qqOaQLN+vifK9X7V8/z/eIK2JvdrbcwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNS0wNi0wNFQxNDo0NjoyMSswMDowMArbUkoAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDYtMTJUMDE6NTg6MTgrMDA6MDB4xjtKAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDI1LTA2LTA0VDE0OjQ2OjUxKzAwOjAwJlbCMAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=" width="16" height="16" alt="+">
        `;
        
        // 切換按鈕事件
        toggleModeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // 移除當前選擇器
            valueElement.style.display = '';
            selectorContainer.remove();
            // 切換到上胸圍/下胸圍模式
            this.createChestMeasurementSelector(fieldContainer, valueElement, '', 'body');
        });
        
        toggleModeBtn.addEventListener('mouseenter', () => {
            toggleModeBtn.style.background = 'transparent';
        });
        
        toggleModeBtn.addEventListener('mouseleave', () => {
            toggleModeBtn.style.background = 'transparent';
        });
        
        titleContainer.appendChild(title);
        titleContainer.appendChild(toggleModeBtn);
        selectorContainer.appendChild(titleContainer);
        
        // 創建胸圍選擇區域
        const bandSection = document.createElement('div');
        bandSection.style.cssText = `
            margin-bottom: 16px;
        `;
        
        // 創建胸圍標題和切換器的容器
        const bandHeader = document.createElement('div');
        bandHeader.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        `;
        
        const bandTitle = document.createElement('div');
        bandTitle.textContent = '胸圍';
        bandTitle.style.cssText = `
            font-size: 14px;
            font-weight: 600;
            color: #374151;
        `;
        
        // 移動歐規/日規切換器到胸圍區域
        const systemToggle = document.createElement('div');
        systemToggle.style.cssText = `
            display: flex;
            gap: 0;
            border: 1px solid #E5E7EB;
            border-radius: 20px;
            padding: 2px;
            background: white;
            width: fit-content;
        `;
        
        const europeanBtn = document.createElement('button');
        europeanBtn.textContent = '歐規';
        europeanBtn.type = 'button';
        europeanBtn.style.cssText = `
            padding: 6px 16px;
            border: none;
            border-radius: 18px;
            background: ${currentSystem === 'european' ? 'white' : 'transparent'};
            color: ${currentSystem === 'european' ? '#374151' : '#9CA3AF'};
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            box-shadow: ${currentSystem === 'european' ? '0 0 0 1px #E5E7EB' : 'none'};
        `;
        
        const japaneseBtn = document.createElement('button');
        japaneseBtn.textContent = '日規';
        japaneseBtn.type = 'button';
        japaneseBtn.style.cssText = `
            padding: 6px 16px;
            border: none;
            border-radius: 18px;
            background: ${currentSystem === 'japanese' ? 'white' : 'transparent'};
            color: ${currentSystem === 'japanese' ? '#374151' : '#9CA3AF'};
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            box-shadow: ${currentSystem === 'japanese' ? '0 0 0 1px #E5E7EB' : 'none'};
        `;
        
        systemToggle.appendChild(europeanBtn);
        systemToggle.appendChild(japaneseBtn);
        
        bandHeader.appendChild(bandTitle);
        bandHeader.appendChild(systemToggle);
        bandSection.appendChild(bandHeader);
        
        const bandGrid = document.createElement('div');
        bandGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 6px;
        `;
        
        // 歐規和日規的胸圍尺寸對應
        const bandSizes = {
            european: [28, 30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54],
            japanese: [60, 65, 70, 75, 80, 85, 90, 95, 100, 105, 110, 115, 120, 125]
        };
        
        let selectedBand = currentBand;
        let selectedCup = currentCup || '';
        
        function createBandButtons() {
            bandGrid.innerHTML = '';
            const sizes = bandSizes[currentSystem];
            
            sizes.forEach(size => {
                const button = document.createElement('button');
                button.textContent = size;
                button.style.cssText = `
                    width: 32px;
                    height: 32px;
                    border: 1px solid #E5E7EB;
                    border-radius: 50%;
                    background: ${selectedBand === size.toString() ? '#000000' : 'white'};
                    color: ${selectedBand === size.toString() ? 'white' : '#374151'};
                    font-size: 12px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    outline: none;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    pointer-events: auto;
                    z-index: 10;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectedBand = size.toString();
                    createBandButtons();
                    createCupButtons();
                });
                
                // 添加 mousedown 事件作為備用
                button.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectedBand = size.toString();
                    createBandButtons();
                    createCupButtons();
                });
                
                bandGrid.appendChild(button);
            });
        }
        
        createBandButtons();
        bandSection.appendChild(bandGrid);
        selectorContainer.appendChild(bandSection);
        
        // 創建罩杯選擇區域
        const cupSection = document.createElement('div');
        cupSection.style.cssText = `
            margin-bottom: 16px;
        `;
        
        const cupTitle = document.createElement('div');
        cupTitle.textContent = '罩杯';
        cupTitle.style.cssText = `
            font-size: 14px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
            text-align: left;
        `;
        cupSection.appendChild(cupTitle);
        
        const cupGrid = document.createElement('div');
        cupGrid.style.cssText = `
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 6px;
        `;
        
        const cupSizes = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
        
        function createCupButtons() {
            cupGrid.innerHTML = '';
            
            cupSizes.forEach(cup => {
                const button = document.createElement('button');
                button.textContent = cup;
                button.style.cssText = `
                    width: 32px;
                    height: 32px;
                    border: 1px solid #E5E7EB;
                    border-radius: 50%;
                    background: ${selectedCup === cup ? '#000000' : 'white'};
                    color: ${selectedCup === cup ? 'white' : '#374151'};
                    font-size: 12px;
            font-weight: 500;
            cursor: pointer;
                    transition: all 0.2s ease;
            outline: none;
                    user-select: none;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    pointer-events: auto;
                    z-index: 10;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                `;
                
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectedCup = cup;
                    createCupButtons();
                });
                
                // 添加 mousedown 事件作為備用
                button.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    selectedCup = cup;
                    createCupButtons();
                });
                
                cupGrid.appendChild(button);
            });
        }
        
        createCupButtons();
        cupSection.appendChild(cupGrid);
        selectorContainer.appendChild(cupSection);
        
        // 創建按鈕區域
        const buttonSection = document.createElement('div');
        buttonSection.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #D1D5DB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '確認';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #000000;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        buttonSection.appendChild(cancelBtn);
        buttonSection.appendChild(confirmBtn);
        selectorContainer.appendChild(buttonSection);
        
        // 添加事件阻止冒泡，確保所有內部點擊都不會觸發外部處理器
        selectorContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        selectorContainer.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        
        // 添加到容器
        fieldContainer.appendChild(selectorContainer);
        
        // 規格切換事件
        europeanBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentSystem = 'european';
            // 清除選中的胸圍
            selectedBand = '';
            // 強制更新樣式
            europeanBtn.style.setProperty('background', 'white', 'important');
            europeanBtn.style.setProperty('color', '#374151', 'important');
            europeanBtn.style.setProperty('box-shadow', '0 0 0 1px #E5E7EB', 'important');
            japaneseBtn.style.setProperty('background', 'transparent', 'important');
            japaneseBtn.style.setProperty('color', '#9CA3AF', 'important');
            japaneseBtn.style.setProperty('box-shadow', 'none', 'important');
            createBandButtons();
            createCupButtons();
        });
        
        japaneseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            currentSystem = 'japanese';
            // 清除選中的胸圍
            selectedBand = '';
            // 強制更新樣式
            japaneseBtn.style.setProperty('background', 'white', 'important');
            japaneseBtn.style.setProperty('color', '#374151', 'important');
            japaneseBtn.style.setProperty('box-shadow', '0 0 0 1px #E5E7EB', 'important');
            europeanBtn.style.setProperty('background', 'transparent', 'important');
            europeanBtn.style.setProperty('color', '#9CA3AF', 'important');
            europeanBtn.style.setProperty('box-shadow', 'none', 'important');
            createBandButtons();
            createCupButtons();
        });
        
        // 取消按鈕事件
        cancelBtn.addEventListener('click', () => {
            selectorContainer.remove();
            valueElement.style.display = 'block';
            fieldContainer.querySelector('.edit-icon').style.display = 'flex';
        });
        
        // 確認按鈕事件
        confirmBtn.addEventListener('click', async () => {
            if (selectedBand && selectedCup) {
                const newValue = `${selectedBand}${selectedCup}`;
                
                try {
                    await this.saveFieldValue('CC', newValue, 'body', fieldContainer);
                    
                    // API 成功後更新顯示（胸圍/罩杯格式直接顯示原值）
                    valueElement.textContent = newValue;
                    
                    // 關閉選擇器
                    selectorContainer.remove();
                    valueElement.style.display = 'block';
                    fieldContainer.querySelector('.edit-icon').style.display = 'flex';
                    
                } catch (error) {
                    // showNotification('保存失敗，請重試', 'error');
                    
                    // API 失敗時也要更新顯示和關閉選擇器（與 demo.js 一致）
                    valueElement.textContent = newValue;
                    selectorContainer.remove();
                    valueElement.style.display = 'block';
                    fieldContainer.querySelector('.edit-icon').style.display = 'flex';
                }
            } else {
                // showNotification('請選擇胸圍和罩杯', 'error');
            }
        });
        
        // 點擊外部關閉選擇器
        const clickOutsideHandler = (e) => {
            // 如果點擊的是選擇器內部的任何元素，不關閉
            if (selectorContainer.contains(e.target)) {
                return;
            }
            
            // 如果點擊的是欄位容器，也不關閉
            if (fieldContainer.contains(e.target)) {
                return;
            }
            
            // 只有當點擊完全在選擇器和欄位容器外部時才關閉
            selectorContainer.remove();
            valueElement.style.display = 'block';
            fieldContainer.querySelector('.edit-icon').style.display = 'flex';
            document.removeEventListener('click', clickOutsideHandler);
        };
        
        // 延遲添加事件監聽器，避免立即觸發
        setTimeout(() => {
            document.addEventListener('click', clickOutsideHandler);
        }, 200);
    }

    // 創建上胸圍/下胸圍測量選擇器
    createChestMeasurementSelector(fieldContainer, valueElement, currentValue) {
        // 隱藏原始值
        valueElement.style.display = 'none';
        
        // 解析當前值
        let currentUpChest = '';
        let currentDownChest = '';
        
        if (currentValue) {
            if (currentValue.includes('_')) {
                const parts = currentValue.split('_');
                if (parts.length >= 2) {
                    currentUpChest = parts[0];
                    currentDownChest = parts[1];
                }
            } else if (/^\d+(\.\d+)?$/.test(currentValue.trim())) {
                // 如果是純數字，同時設定為上胸圍和下胸圍
                currentUpChest = currentValue.trim();
                currentDownChest = currentValue.trim();
            }
        }
        
        // 創建胸圍測量選擇器容器
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'chest-measurement-selector';
        selectorContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1500;
        `;
        
        // 創建標題區域（包含標題和切換按鈕）
        const titleContainer = document.createElement('div');
        titleContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 16px;
        `;
        
        const titleElement = document.createElement('div');
        titleElement.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: #1E293B;
            flex: 1;
            text-align: center;
        `;
        titleElement.textContent = '胸圍測量';
        
        // 創建切換模式按鈕
        const toggleModeBtn = document.createElement('div');
        toggleModeBtn.style.cssText = `
            cursor: pointer;
            padding: 8px;
            border-radius: 6px;
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
        `;
        toggleModeBtn.title = '切換到胸圍/罩杯編輯模式';
        toggleModeBtn.innerHTML = `
            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZcwAAEuYAABLmAc2/QKgAAAAHdElNRQfpBgQOLjND9MctAAAE6klEQVRo3sWZ30+TZxTHP7y8tFUDXWkmSwYDAQuLynoBFxtLgGXgdoPJlsgS4w3ZnZqMLOwPkGTlZjfuFrlZSCbGcDG8QRO9GNEEJ52bCVTMZGNEnbRiYmlraXfRh4e2vG/7PrSU04uePD/OOc/znuc5z/meMtTIhQcvH9BKHW4OYgNivCbICov4mSdASEVgmYLqDnrppBkXusmYOC95xCw3mFMzIx81M8xdwiQt/sLcZZim4ihv5CKPDdVsEiVMmCibhv2PGaGxsE/g5CwX8GS0RVghQIAnPGWdKGDHSQ1H8OChFkfG6EV+5Cde7W7t7VwnnraiCHP4OEktdsPxNmrp43vm2EibFWeadnXlOoMsp4kJcYV+3JbmVtPPz4TSZi8zaOq4hlTJaJrLhZmkC5vSAiroYjJDho9Kq5PdjJOQU+cZyPquVsnBaealnATj1nbQzYScFGWMhl0p36J6xohKeRP5TahkXA4PMrTLtWfuwxBBKXOcqlyDdUbl5q8yULDyLRpgVX6I0VzuOCjdZpVTRVMPcEqaEGbQbFC7PHjBIq5+exeC8lAa3gtOrkvX+6bo6gGGpDtOG3nCeXnrjRXB9YzIwZi8Hc9ndzayKM99vYLQCioURjfIe2EhO1ZelC5yWkFgD1NM0aMwY0C6+Uh6c7MMuJMK21/DfZIkuU+N5TkOJmWwbt5u/k6GnC6F1ZzgBUmSvOCEwqwuGaaGATTAxReic4Y7CqLKDLj8dIcZwX2JK2VAB20ARJggpiBqdxRjgigAbXSkDOjlAAB/8uueqweY5Q8ADtALGi46RcdNgiUxYI2bguvEpeHhKAARbpdEPcBtIgA049Fw8hYAKzwsmQEPWQHAhVfDK8JjgOclM+A/HgGg49VoEY2BEpyALYqyKLgWjTrB/qUsZtOAs0pPxH+dLl5pCZ7lGF7D4R2XTYIWygEop5UytKz+JM9zyHxKAg2o1jkIQJx108E9/MB7Bu26iOpOLhM36P+bb7llInOdODbgEOINGDaNaRVMWU5Ks39TpsH6ExEVExr7TDox7EC5Sb4Hb7hEveknKAOSvDL8BMtc4o2JVJvwn5hOGDug4zQ18hafGzphK2M4gXW+ZlHRCZ3i9nmts4YL0HI+Kp4ZikqKdW+yoHyLviMMXtP4RzQdURSB2MRMzio1iP8VTd5JHsX8txCyy/t3QcMvNtLD4ZIZ8LZAXeL8ruEXeFYtx0pmwDHeBSCEXyPAEgAOuktmQLd4ey8R0AgxK5o/tQjBFEpuegU3S0gDbrABwHH5ONtb6uQ4ABvMpB6lczwAwMGZEpwEG2fErfuAeykDQlwTnX18qCAqacDlp4/oE9y1bTi3qaDU7DeFA+zgqtC0lJmebienKtBE0ZJTaGRBpucNCgJV03O/TM93oMjnSgpQnNvZXcW0hGiG9sSAPBDNvoNUsO8wHej40oDKr4q4eotAZSmg2ryYeTpYHSsYrG5QBatTJlxOqwL5C4DrB3YD1wNU4ssoNlylWzFM2QopWMDOks1LhZKNm36uFFaySVE7v2QVre7h4zPqTJIYO7WcxKdWtMoNsFVxlgvyBZuiCP8SYFGU7WKATZTtWjha3LJdihoZYckw9SxK4dIaNe1d6ValeN1OLx/nKV6HWFIrXquArCkzPHhp433qqOaQLN+vifK9X7V8/z/eIK2JvdrbcwAAACV0RVh0ZGF0ZTpjcmVhdGUAMjAyNS0wNi0wNFQxNDo0NjoyMSswMDowMArbUkoAAAAldEVYdGRhdGU6bW9kaWZ5ADIwMTktMDYtMTJUMDE6NTg6MTgrMDA6MDB4xjtKAAAAKHRFWHRkYXRlOnRpbWVzdGFtcAAyMDI1LTA2LTA0VDE0OjQ2OjUxKzAwOjAwJlbCMAAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAAASUVORK5CYII=" width="16" height="16" alt="+">
        `;
        
        // 切換按鈕事件
        toggleModeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            // 移除當前選擇器
            valueElement.style.display = '';
            selectorContainer.remove();
            // 切換到胸圍/罩杯模式
            this.createBraSizeSelector(fieldContainer, valueElement, '');
        });
        
        toggleModeBtn.addEventListener('mouseenter', () => {
            toggleModeBtn.style.background = 'transparent';
        });
        
        toggleModeBtn.addEventListener('mouseleave', () => {
            toggleModeBtn.style.background = 'transparent';
        });
        
        titleContainer.appendChild(titleElement);
        titleContainer.appendChild(toggleModeBtn);
        selectorContainer.appendChild(titleContainer);
        
        // 當前選中的單位 - 從 localStorage 讀取上次的選擇，預設為 cm
        let currentUnit = localStorage.getItem('chest_measurement_unit') || 'cm';
        
        // 創建單位切換器
        const unitToggle = document.createElement('div');
        unitToggle.style.cssText = `
            display: flex;
            gap: 0;
            border: 1px solid #E5E7EB;
            border-radius: 20px;
            padding: 2px;
            background: white;
            width: fit-content;
        `;
        
        const cmBtn = document.createElement('button');
        cmBtn.textContent = '公分';
        cmBtn.type = 'button';
        cmBtn.style.cssText = `
            padding: 6px 16px;
            border: none;
            border-radius: 18px;
            background: ${currentUnit === 'cm' ? 'white' : 'transparent'};
            color: ${currentUnit === 'cm' ? '#374151' : '#9CA3AF'};
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            box-shadow: ${currentUnit === 'cm' ? '0 0 0 1px #E5E7EB' : 'none'};
        `;
        
        const inchBtn = document.createElement('button');
        inchBtn.textContent = '英吋';
        inchBtn.type = 'button';
        inchBtn.style.cssText = `
            padding: 6px 16px;
            border: none;
            border-radius: 18px;
            background: ${currentUnit === 'inch' ? 'white' : 'transparent'};
            color: ${currentUnit === 'inch' ? '#374151' : '#9CA3AF'};
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            outline: none;
            user-select: none;
            -webkit-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            box-shadow: ${currentUnit === 'inch' ? '0 0 0 1px #E5E7EB' : 'none'};
        `;
        
        unitToggle.appendChild(cmBtn);
        unitToggle.appendChild(inchBtn);
        
        // 創建上胸圍選擇區域
        const upChestSection = document.createElement('div');
        upChestSection.style.cssText = `
            margin-bottom: 16px;
        `;
        
        // 創建上胸圍標籤和單位切換器的容器（同一行）
        const upChestLabelContainer = document.createElement('div');
        upChestLabelContainer.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        `;
        
        const upChestLabel = document.createElement('div');
        upChestLabel.style.cssText = `
            font-size: 14px;
            font-weight: 500;
            color: #475569;
        `;
        upChestLabel.textContent = '上胸圍';
        
        upChestLabelContainer.appendChild(upChestLabel);
        upChestLabelContainer.appendChild(unitToggle);
        upChestSection.appendChild(upChestLabelContainer);
        
        const upChestSelect = document.createElement('select');
        upChestSelect.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            outline: none;
        `;
        upChestSection.appendChild(upChestSelect);
        selectorContainer.appendChild(upChestSection);
        
        // 創建下胸圍選擇區域
        const downChestSection = document.createElement('div');
        downChestSection.style.cssText = `
            margin-bottom: 20px;
        `;
        
        const downChestLabel = document.createElement('div');
        downChestLabel.style.cssText = `
            font-size: 14px;
            font-weight: 500;
            color: #475569;
            margin-bottom: 8px;
            text-align: left;
        `;
        downChestLabel.textContent = '下胸圍';
        downChestSection.appendChild(downChestLabel);
        
        const downChestSelect = document.createElement('select');
        downChestSelect.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            outline: none;
        `;
        downChestSection.appendChild(downChestSelect);
        selectorContainer.appendChild(downChestSection);
        
        // 創建按鈕區域
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;
        
        // 取消按鈕
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #E2E8F0;
            border-radius: 6px;
            background: white;
            color: #64748B;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        cancelBtn.addEventListener('mouseenter', () => {
            cancelBtn.style.backgroundColor = '#F8FAFC';
            cancelBtn.style.borderColor = '#CBD5E1';
        });
        cancelBtn.addEventListener('mouseleave', () => {
            cancelBtn.style.backgroundColor = 'white';
            cancelBtn.style.borderColor = '#E2E8F0';
        });
        
        // 確認按鈕
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '確認';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #000000;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        confirmBtn.addEventListener('mouseenter', () => {
            confirmBtn.style.backgroundColor = '#333333';
        });
        confirmBtn.addEventListener('mouseleave', () => {
            confirmBtn.style.backgroundColor = '#000000';
        });
        
        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(confirmBtn);
        selectorContainer.appendChild(buttonContainer);
        
        // 單位轉換函數
        function cmToInch(cm) {
            return Math.round(cm / 2.54 * 10) / 10;
        }
        
        function inchToCm(inch) {
            return Math.round(inch * 2.54 * 10) / 10;
        }
        
        // 填充選項函數
        function populateSelects(unit) {
            upChestSelect.innerHTML = '';
            downChestSelect.innerHTML = '';
            
            // 添加空選項
            const upEmptyOption = document.createElement('option');
            upEmptyOption.value = '';
            upEmptyOption.textContent = '請選擇上胸圍';
            upChestSelect.appendChild(upEmptyOption);
            
            const downEmptyOption = document.createElement('option');
            downEmptyOption.value = '';
            downEmptyOption.textContent = '請選擇下胸圍';
            downChestSelect.appendChild(downEmptyOption);
            
            if (unit === 'cm') {
                // 公分選項：上胸圍 65-120，下胸圍 60-110（與 demo.js 一致）
                for (let i = 65; i <= 120; i += 0.5) {
                    const option = document.createElement('option');
                    // 保留 .0 格式，確保與 demo.js 一致
                    const formattedValue = i % 1 === 0 ? `${i}.0` : i.toString();
                    option.value = i.toString();
                    option.textContent = `${formattedValue} cm`;
                    upChestSelect.appendChild(option);
                }
                
                for (let i = 60; i <= 110; i += 0.5) {
                    const option = document.createElement('option');
                    // 保留 .0 格式，確保與 demo.js 一致
                    const formattedValue = i % 1 === 0 ? `${i}.0` : i.toString();
                    option.value = i.toString();
                    option.textContent = `${formattedValue} cm`;
                    downChestSelect.appendChild(option);
                }
            } else {
                // 英吋選項：上胸圍 26-48，下胸圍 24-44（與 demo.js 一致）
                for (let i = 26; i <= 48; i += 0.5) {
                    const option = document.createElement('option');
                    // 保留 .0 格式
                    const formattedValue = i % 1 === 0 ? `${i}.0` : i.toString();
                    // 英吋選項的 value 直接使用英吋值，不轉換
                    option.value = formattedValue;
                    option.textContent = `${formattedValue} inch`;
                    upChestSelect.appendChild(option);
                }
                
                for (let i = 24; i <= 44; i += 0.5) {
                    const option = document.createElement('option');
                    // 保留 .0 格式
                    const formattedValue = i % 1 === 0 ? `${i}.0` : i.toString();
                    // 英吋選項的 value 直接使用英吋值，不轉換
                    option.value = formattedValue;
                    option.textContent = `${formattedValue} inch`;
                    downChestSelect.appendChild(option);
                }
            }
            
            // 設置當前值 - 只在相同單位時設置
            if (currentUpChest && currentUnit === unit) {
                upChestSelect.value = currentUpChest;
            }
            if (currentDownChest && currentUnit === unit) {
                downChestSelect.value = currentDownChest;
            }
        }
        
        // 單位切換事件
        cmBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentUnit !== 'cm') {
                currentUnit = 'cm';
                // 保存單位選擇到 localStorage
                localStorage.setItem('chest_measurement_unit', 'cm');
                
                // 更新按鈕樣式 - 使用和歐規/日規一樣的樣式更新方式
                cmBtn.style.background = 'white';
                cmBtn.style.color = '#374151';
                cmBtn.style.boxShadow = '0 0 0 1px #E5E7EB';
                
                inchBtn.style.background = 'transparent';
                inchBtn.style.color = '#9CA3AF';
                inchBtn.style.boxShadow = 'none';
                
                populateSelects('cm');
                // 切換單位時清空選擇器
                upChestSelect.value = '';
                downChestSelect.value = '';
            }
        });
        
        inchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (currentUnit !== 'inch') {
                currentUnit = 'inch';
                // 保存單位選擇到 localStorage
                localStorage.setItem('chest_measurement_unit', 'inch');
                
                // 更新按鈕樣式 - 使用和歐規/日規一樣的樣式更新方式
                inchBtn.style.background = 'white';
                inchBtn.style.color = '#374151';
                inchBtn.style.boxShadow = '0 0 0 1px #E5E7EB';
                
                cmBtn.style.background = 'transparent';
                cmBtn.style.color = '#9CA3AF';
                cmBtn.style.boxShadow = 'none';
                
                populateSelects('inch');
                // 切換單位時清空選擇器
                upChestSelect.value = '';
                downChestSelect.value = '';
            }
        });
        
        // 根據記憶的單位初始化選項和按鈕狀態
        populateSelects(currentUnit);
        
        // 根據 currentUnit 設置初始按鈕狀態
        if (currentUnit === 'inch') {
            inchBtn.style.background = 'white';
            inchBtn.style.color = '#374151';
            inchBtn.style.boxShadow = '0 0 0 1px #E5E7EB';
            
            cmBtn.style.background = 'transparent';
            cmBtn.style.color = '#9CA3AF';
            cmBtn.style.boxShadow = 'none';
        } else {
            cmBtn.style.background = 'white';
            cmBtn.style.color = '#374151';
            cmBtn.style.boxShadow = '0 0 0 1px #E5E7EB';
            
            inchBtn.style.background = 'transparent';
            inchBtn.style.color = '#9CA3AF';
            inchBtn.style.boxShadow = 'none';
        }
        
        // 添加事件阻止冒泡，確保所有內部點擊都不會觸發外部處理器
        selectorContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        selectorContainer.addEventListener('mousedown', (e) => {
            e.stopPropagation();
        });
        
        // 將選擇器添加到欄位容器
        fieldContainer.appendChild(selectorContainer);
        
        // 取消按鈕事件
        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            valueElement.style.display = '';
            selectorContainer.remove();
        });
        
        // 確認按鈕事件
        confirmBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            
            const upValue = upChestSelect.value.trim();
            const downValue = downChestSelect.value.trim();
            
            let newValue = '';
            if (upValue && downValue) {
                // 兩個值都有，使用下底線格式（不管公分還是英吋都用純數字）
                newValue = `${upValue}_${downValue}`;
            } else if (upValue && !downValue) {
                // 只有上胸圍，使用上胸圍值
                newValue = upValue;
            } else if (!upValue && downValue) {
                // 只有下胸圍，使用下胸圍值
                newValue = downValue;
            }
            
            if (newValue) {
                try {
                    await this.saveFieldValue('CC', newValue, 'body', fieldContainer);
                    
                    // API 成功後更新顯示（與 demo.js 一致）
                    let displayValue = '';
                    if (newValue) {
                        if (newValue.includes('_')) {
                            const parts = newValue.split('_');
                            const unit = currentUnit === 'cm' ? 'cm' : 'inch';
                            displayValue = `上胸圍 ${parts[0]} ${unit} / 下胸圍 ${parts[1]} ${unit}`;
                        } else {
                            const unit = currentUnit === 'cm' ? 'cm' : 'inch';
                            displayValue = `${newValue} ${unit}`;
                        }
                    } else {
                        displayValue = '尚未提供';
                    }
                    
                    valueElement.textContent = displayValue;
                    valueElement.style.display = '';
                    selectorContainer.remove();
                    
                    // 移除事件監聽器
                    document.removeEventListener('click', clickOutsideHandler);
                    
                } catch (error) {
                    showNotification('保存失敗，請重試', 'error');
                    
                    // API 失敗時也要更新顯示和關閉選擇器（與 demo.js 一致）
                    let displayValue = '';
                    if (newValue) {
                        if (newValue.includes('_')) {
                            const parts = newValue.split('_');
                            const unit = currentUnit === 'cm' ? 'cm' : 'inch';
                            displayValue = `上胸圍 ${parts[0]} ${unit} / 下胸圍 ${parts[1]} ${unit}`;
                        } else {
                            const unit = currentUnit === 'cm' ? 'cm' : 'inch';
                            displayValue = `${newValue} ${unit}`;
                        }
                    } else {
                        displayValue = '尚未提供';
                    }
                    
                    valueElement.textContent = displayValue;
                    valueElement.style.display = '';
                    selectorContainer.remove();
                    
                    // 移除事件監聽器
                    document.removeEventListener('click', clickOutsideHandler);
                }
            } else {
                // showNotification('請選擇至少一個胸圍值', 'error');
            }
        });
        
        // 點擊外部關閉選擇器
        const clickOutsideHandler = (e) => {
            // 如果點擊的是選擇器內部的任何元素，不關閉
            if (selectorContainer.contains(e.target)) {
                return;
            }
            
            // 如果點擊的是欄位容器，也不關閉
            if (fieldContainer.contains(e.target)) {
                return;
            }
            
            // 只有當點擊完全在選擇器和欄位容器外部時才關閉
            valueElement.style.display = '';
            selectorContainer.remove();
            document.removeEventListener('click', clickOutsideHandler);
        };
        
        // 延遲添加點擊外部監聽器，避免立即觸發
        setTimeout(() => {
            document.addEventListener('click', clickOutsideHandler);
        }, 200);
    }
    
    // 創建腳長編輯器
    createFootLengthEditor(fieldContainer, valueElement, currentValue) {
        // 找到編輯圖標
        const editIcon = fieldContainer.querySelector('.edit-icon');
        
        // 隱藏原始值
        valueElement.style.display = 'none';
        if (editIcon) editIcon.style.display = 'none';
        
        // 創建選擇器容器
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'foot-length-selector';
        selectorContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1500;
            margin-top: 8px;
        `;
        
        // 防止事件冒泡
        selectorContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 創建標題
        const title = document.createElement('div');
        title.textContent = '選擇腳長';
        title.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: #1E293B;
            margin-bottom: 16px;
            text-align: center;
        `;
        selectorContainer.appendChild(title);
        
        // 創建腳長選擇區域
        const footLengthSection = document.createElement('div');
        footLengthSection.style.cssText = `
            margin-bottom: 16px;
        `;
        
        // 創建下拉選擇器
        const selectElement = document.createElement('select');
        selectElement.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            outline: none;
        `;
        
        // 添加預設選項
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇腳長';
        selectElement.appendChild(defaultOption);
        
        // 生成腳長選項 (22~27, 間隔 0.1)
        for (let length = 22; length <= 27; length += 0.1) {
            // 修正浮點數精度問題並保留一位小數
            const roundedLength = Math.round(length * 10) / 10;
            const formattedLength = roundedLength.toFixed(1);
            const option = document.createElement('option');
            option.value = formattedLength;
            option.textContent = `${formattedLength} cm`;
            // 檢查當前值是否匹配 (支援 cm 和 mm 格式)
            if (currentValue && typeof currentValue === 'string') {
                const currentValueCm = currentValue.replace(' mm', '').replace(' cm', '');
                if (currentValueCm === formattedLength || 
                    currentValue === `${formattedLength} cm` || 
                    currentValue === `${formattedLength} mm` ||
                    parseFloat(currentValueCm) === parseFloat(formattedLength)) {
                    option.selected = true;
                }
            }
            selectElement.appendChild(option);
        }
        
        footLengthSection.appendChild(selectElement);
        selectorContainer.appendChild(footLengthSection);
        
        // 創建按鈕區域
        const buttonSection = document.createElement('div');
        buttonSection.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '確認';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #000000;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        buttonSection.appendChild(cancelBtn);
        buttonSection.appendChild(confirmBtn);
        selectorContainer.appendChild(buttonSection);
        
        // 添加到容器
        fieldContainer.appendChild(selectorContainer);
        
        // 取消按鈕事件
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectorContainer.remove();
            valueElement.style.display = 'block';
            if (editIcon) editIcon.style.display = 'flex';
        });
        
        // 確認按鈕事件
        confirmBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedLength = selectElement.value;
            if (selectedLength) {
                try {
                    // 更新顯示值
                    valueElement.textContent = `${selectedLength} cm`;
                    
                    // 保存到本地存儲
                    await this.saveFieldValue('FH', selectedLength, 'foot', fieldContainer);
                    
                    // 關閉選擇器
                    selectorContainer.remove();
                    valueElement.style.display = 'block';
                    if (editIcon) editIcon.style.display = 'flex';
                    
                } catch (error) {
                    console.error('保存腳長失敗:', error);
                    // showNotification('保存失敗，請重試', 'error');
                }
            }
        });
    }
    
    // 創建腳寬編輯器
    createFootWidthEditor(fieldContainer, valueElement, currentValue) {
        // 找到編輯圖標
        const editIcon = fieldContainer.querySelector('.edit-icon');
        
        // 隱藏原始值
        valueElement.style.display = 'none';
        if (editIcon) editIcon.style.display = 'none';
        
        // 創建選擇器容器
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'foot-width-selector';
        selectorContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1500;
            margin-top: 8px;
        `;
        
        // 防止事件冒泡
        selectorContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 創建標題
        const title = document.createElement('div');
        title.textContent = '選擇腳寬';
        title.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: #1E293B;
            margin-bottom: 16px;
            text-align: center;
        `;
        selectorContainer.appendChild(title);
        
        // 創建腳寬選擇區域
        const footWidthSection = document.createElement('div');
        footWidthSection.style.cssText = `
            margin-bottom: 16px;
        `;
        
        // 創建下拉選擇器
        const selectElement = document.createElement('select');
        selectElement.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            outline: none;
        `;
        
        // 添加預設選項
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇腳寬';
        selectElement.appendChild(defaultOption);
        
        // 生成腳寬選項 (6~15, 間隔 0.1)
        for (let width = 6; width <= 15; width += 0.1) {
            // 修正浮點數精度問題並保留一位小數
            const roundedWidth = Math.round(width * 10) / 10;
            const formattedWidth = roundedWidth.toFixed(1);
            const option = document.createElement('option');
            option.value = formattedWidth;
            option.textContent = `${formattedWidth} cm`;
            // 檢查當前值是否匹配 (支援 cm 和 mm 格式)
            if (currentValue && typeof currentValue === 'string') {
                const currentValueCm = currentValue.replace(' mm', '').replace(' cm', '');
                if (currentValueCm === formattedWidth || 
                    currentValue === `${formattedWidth} cm` || 
                    currentValue === `${formattedWidth} mm` ||
                    parseFloat(currentValueCm) === parseFloat(formattedWidth)) {
                    option.selected = true;
                }
            }
            selectElement.appendChild(option);
        }
        
        footWidthSection.appendChild(selectElement);
        selectorContainer.appendChild(footWidthSection);
        
        // 創建按鈕區域
        const buttonSection = document.createElement('div');
        buttonSection.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '確認';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #000000;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        buttonSection.appendChild(cancelBtn);
        buttonSection.appendChild(confirmBtn);
        selectorContainer.appendChild(buttonSection);
        
        // 添加到容器
        fieldContainer.appendChild(selectorContainer);
        
        // 取消按鈕事件
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectorContainer.remove();
            valueElement.style.display = 'block';
            if (editIcon) editIcon.style.display = 'flex';
        });
        
        // 確認按鈕事件
        confirmBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedWidth = selectElement.value;
            if (selectedWidth) {
                try {
                    // 更新顯示值
                    valueElement.textContent = `${selectedWidth} cm`;
                    
                    // 保存到本地存儲
                    await this.saveFieldValue('FW', selectedWidth, 'foot', fieldContainer);
                    
                    // 關閉選擇器
                    selectorContainer.remove();
                    valueElement.style.display = 'block';
                    if (editIcon) editIcon.style.display = 'flex';
                    
                } catch (error) {
                    console.error('保存腳寬失敗:', error);
                    // showNotification('保存失敗，請重試', 'error');
                }
            }
        });
    }
    
    // 創建腳圍編輯器
    createFootCircumferenceEditor(fieldContainer, valueElement, currentValue) {
        // 找到編輯圖標
        const editIcon = fieldContainer.querySelector('.edit-icon');
        
        // 隱藏原始值
        valueElement.style.display = 'none';
        if (editIcon) editIcon.style.display = 'none';
        
        // 創建選擇器容器
        const selectorContainer = document.createElement('div');
        selectorContainer.className = 'foot-circumference-selector';
        selectorContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #000;
            border-radius: 8px;
            padding: 16px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1500;
            margin-top: 8px;
        `;
        
        // 防止事件冒泡
        selectorContainer.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // 創建標題
        const title = document.createElement('div');
        title.textContent = '選擇腳圍';
        title.style.cssText = `
            font-size: 16px;
            font-weight: 600;
            color: #1E293B;
            margin-bottom: 16px;
            text-align: center;
        `;
        selectorContainer.appendChild(title);
        
        // 創建腳圍選擇區域
        const footCircumferenceSection = document.createElement('div');
        footCircumferenceSection.style.cssText = `
            margin-bottom: 16px;
        `;
        
        // 創建下拉選擇器
        const selectElement = document.createElement('select');
        selectElement.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            outline: none;
        `;
        
        // 添加預設選項
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '請選擇腳圍';
        selectElement.appendChild(defaultOption);
        
        // 生成腳圍選項 (18~39.9, 間隔 0.1)
        for (let circumference = 18; circumference <= 39.9; circumference += 0.1) {
            // 修正浮點數精度問題並保留一位小數
            const roundedCircumference = Math.round(circumference * 10) / 10;
            const formattedCircumference = roundedCircumference.toFixed(1);
            const option = document.createElement('option');
            option.value = formattedCircumference;
            option.textContent = `${formattedCircumference} cm`;
            // 檢查當前值是否匹配 (支援 cm 和 mm 格式)
            if (currentValue && typeof currentValue === 'string') {
                const currentValueCm = currentValue.replace(' mm', '').replace(' cm', '');
                if (currentValueCm === formattedCircumference || 
                    currentValue === `${formattedCircumference} cm` || 
                    currentValue === `${formattedCircumference} mm` ||
                    parseFloat(currentValueCm) === parseFloat(formattedCircumference)) {
                    option.selected = true;
                }
            }
            selectElement.appendChild(option);
        }
        
        footCircumferenceSection.appendChild(selectElement);
        selectorContainer.appendChild(footCircumferenceSection);
        
        // 創建按鈕區域
        const buttonSection = document.createElement('div');
        buttonSection.style.cssText = `
            display: flex;
            gap: 8px;
            justify-content: flex-end;
        `;
        
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.cssText = `
            padding: 8px 16px;
            border: 1px solid #E5E7EB;
            border-radius: 6px;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        const confirmBtn = document.createElement('button');
        confirmBtn.textContent = '確認';
        confirmBtn.style.cssText = `
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            background: #000000;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
        `;
        
        buttonSection.appendChild(cancelBtn);
        buttonSection.appendChild(confirmBtn);
        selectorContainer.appendChild(buttonSection);
        
        // 添加到容器
        fieldContainer.appendChild(selectorContainer);
        
        // 取消按鈕事件
        cancelBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            selectorContainer.remove();
            valueElement.style.display = 'block';
            if (editIcon) editIcon.style.display = 'flex';
        });
        
        // 確認按鈕事件
        confirmBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const selectedCircumference = selectElement.value;
            if (selectedCircumference) {
                try {
                    // 更新顯示值
                    valueElement.textContent = `${selectedCircumference} cm`;
                    
                    // 保存到本地存儲
                    await this.saveFieldValue('FCir', selectedCircumference, 'foot', fieldContainer);
                    
                    // 關閉選擇器
                    selectorContainer.remove();
                    valueElement.style.display = 'block';
                    if (editIcon) editIcon.style.display = 'flex';
                    
                } catch (error) {
                    console.error('保存腳圍失敗:', error);
                    showNotification('保存失敗，請重試', 'error');
                }
            }
        });
    }
    
    // 保存欄位值
    async saveFieldValue(fieldName, value, dataType, fieldContainer = null) {
        try {
            // 根據資料類型確定本地存儲鍵值和使用者類型
            let localKey;
            let userType;
            
            if (dataType === 'body') {
                // 優先從 fieldContainer 獲取使用者類型
                if (fieldContainer) {
                    // 直接從 fieldContainer 本身獲取 data-user-key
                    if (fieldContainer.hasAttribute('data-user-key')) {
                        userType = fieldContainer.getAttribute('data-user-key');
                    }
                }
                
                // 如果沒有從 fieldContainer 取得，則使用 URL 判斷（後備方案）
                if (!userType) {
                const currentUrl = window.location.href;
                if (currentUrl.includes('?M')) {
                        userType = 'bodyM';
                    } else {
                        userType = 'bodyF';
                    }
                }
                
                // 根據使用者類型設定本地存儲鍵
                if (userType === 'bodyM') {
                    localKey = 'BodyMID_size';
                } else {
                    localKey = 'BodyID_size';
                }
                
            } else if (dataType === 'foot') {
                localKey = 'BodyID_Foot_size';
                // 腳部資料優先從 fieldContainer 獲取使用者類型
                if (fieldContainer) {
                    if (fieldContainer.hasAttribute('data-user-key')) {
                        userType = fieldContainer.getAttribute('data-user-key');
                    }
                }
                
                // 如果沒有從 fieldContainer 取得，則使用 URL 判斷（後備方案）
                if (!userType) {
                    const currentUrl = window.location.href;
                    if (currentUrl.includes('cid') && currentUrl.includes('M')) {
                        userType = 'shoesM';
                    } else if (currentUrl.includes('cid') && currentUrl.includes('F')) {
                        userType = 'shoesF';
                    }
                }
            }
            
            if (localKey) {
                // 記錄編輯的使用者類型
                if (userType) {
                    this.editedUsers.add(userType);
                }
                
                // 獲取完整的雲端資料作為基礎
                let completeData = {};
                if (this.userInfo && this.userInfo.BodyData && this.userInfo.BodyData[userType]) {
                    completeData = { ...this.userInfo.BodyData[userType] };
                } else {
                    // 如果沒有雲端資料，使用現有本地資料
                    completeData = this.getLocalData(localKey) || {};
                }
                
                // 更新欄位值
                completeData[fieldName] = value;
                
                // 先保存到本地存儲（不調用API）
                if(userType === 'shoesM' || userType === 'shoesF') {
                    const currentShoesType =  `shoes${this.extractGenderFromUrl()}`;
                    if(userType === currentShoesType) {
                        localStorage.setItem(localKey, JSON.stringify(completeData));
                    }
                }else{
                    localStorage.setItem(localKey, JSON.stringify(completeData));
                }
                
                // 調用API並獲取更新後的完整資料
                let updatedBodyData;
                if (dataType === 'foot') {
                    // 腳部資料使用 updateFootDataToAPI
                    await this.updateFootDataToAPI(completeData, userType);
                    updatedBodyData = null; // 腳部資料不需要返回 BodyData
                } else {
                    // 身體資料使用 updateBodyDataToAPI
                    const uploadKey = userType; // 直接使用被編輯的使用者類型 (bodyF/bodyM)
                    updatedBodyData = await this.updateBodyDataToAPI(completeData, uploadKey);
                }
                
                if (updatedBodyData && updatedBodyData[userType]) {
                    // 使用API回傳的最新資料更新本地存儲和雲端資料
                    localStorage.setItem(localKey, JSON.stringify(updatedBodyData[userType]));
                    this.userInfo.BodyData = updatedBodyData;
                    TokenManager.setUserInfo(this.userInfo);
                    
                    // 更新顯示
                    this.updateDisplayedBodyData(updatedBodyData[userType]);
                    
                } else {
                    // API失敗時的後備處理
                    this.updateDisplayedBodyData(completeData);
                }
                
            }
        } catch (error) {
            console.error('保存欄位值失敗:', error);
            throw error;
        }
    }
    
    // 計算 BMI
    calculateBMI(height, weight) {
        const heightM = parseFloat(height) / 100;
        const weightKg = parseFloat(weight);
        if (heightM === 0 || weightKg === 0) return '0.0';
        const bmi = weightKg / (heightM * heightM);
        return bmi.toFixed(1);
    }
    
    // 獲取 BMI 狀態
    getBMIStatus(bmi) {
        const bmiValue = parseFloat(bmi);
        if (bmiValue < 18.5) return '體重過輕';
        if (bmiValue >= 18.5 && bmiValue < 24) return '正常';
        if (bmiValue >= 24 && bmiValue < 27) return '體重過重';
        if (bmiValue >= 27 && bmiValue < 30) return '輕度肥胖';
        if (bmiValue >= 30 && bmiValue < 35) return '中度肥胖';
        return '重度肥胖';
    }
    
    // 附加事件監聽器
    attachEventListeners() {
        // 移除舊的事件監聽器（如果存在）
        if (this.avatarClickHandler) {
            this.avatarElement?.removeEventListener('click', this.avatarClickHandler);
        }
        if (this.modalClickHandler) {
            this.modalElement?.removeEventListener('click', this.modalClickHandler);
        }
        
        // 創建新的事件處理器
        this.avatarClickHandler = () => {
            // 添加點擊視覺反饋
            if (this.avatarElement) {
                this.avatarElement.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.avatarElement.style.transform = '';
                }, 100);
            }
            
            // 短暫延遲後顯示模態框，讓點擊反饋更明顯
            setTimeout(() => {
                this.toggleModal();
            }, 50);
        };
        
        this.modalClickHandler = (e) => {
            const action = e.target.dataset.action;
            
            switch (action) {
                case 'close':
                    this.closeModal();
                    break;
                case 'login':
                    this.handleLogin();
                    break;
                case 'logout':
                    this.handleLogout();
                    break;
            }
            
            // Modal 背景點擊關閉
            if (e.target === this.modalElement) {
                this.closeModal();
            }
        };
        
        // 綁定新的事件監聽器
        if (this.avatarElement) {
            this.avatarElement.addEventListener('click', this.avatarClickHandler);
            // 手機觸摸事件
            this.avatarElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.avatarClickHandler();
            });
            
            // 手機瀏覽器特殊處理：防止長按選取
            this.avatarElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
            });
            
            // 手機瀏覽器特殊處理：防止雙擊縮放
            this.avatarElement.addEventListener('touchend', (e) => {
                e.preventDefault();
            });
        }
        
        if (this.modalElement) {
            this.modalElement.addEventListener('click', this.modalClickHandler);
            // 手機觸摸事件
            this.modalElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.modalClickHandler(e);
            });
        }
        
        // 全局事件監聽器（只綁定一次）
        if (!this.globalEventBound) {
            // 監聽 URL 變化（處理 OAuth 回調）
            window.addEventListener('popstate', () => {
                this.handleOAuthCallback();
            });
            
            // 監聽視窗大小變化（手機旋轉）
            window.addEventListener('resize', () => {
                this.updateAvatarStyle();
            });
            
            // 監聽全局 OAuth 回調事件
            document.addEventListener('infFITS:oauth-callback', (event) => {
                const { access_token, error, error_description } = event.detail;
                
                if (access_token) {
                    TokenManager.setAccessToken(access_token);
                    this.getUserInfoAndUpdate(access_token, true);
                    this.cleanupUrl();
                } else if (error) {
                    this.dispatchEvent(new CustomEvent('infFITS:error', {
                        detail: { 
                            error: error,
                            description: error_description || '登入過程中發生錯誤'
                        }
                    }));
                    this.cleanupUrl();
                }
            });
            
            // 監聽 token 刷新失敗事件
            document.addEventListener('infFITS:tokenRefreshFailed', (event) => {
                // 自動執行登出
                this.handleLogout();
                
                // 觸發錯誤事件
                this.dispatchEvent(new CustomEvent('infFITS:error', {
                    detail: { 
                        error: 'Token refresh failed',
                        description: '登入狀態已過期，請重新登入'
                    }
                }));
            });
            
            // 監聽父窗口的 OAuth 回調（iframe 環境）
            if (window.parent !== window) {
                window.addEventListener('message', (event) => {
                    if (event.data && event.data.type === 'infFITS:oauth-callback') {
                        const { access_token, error, error_description } = event.data;
                        
                        if (access_token) {
                            TokenManager.setAccessToken(access_token);
                            this.getUserInfoAndUpdate(access_token, true);
                        } else if (error) {
                            this.dispatchEvent(new CustomEvent('infFITS:error', {
                                detail: { 
                                    error: error,
                                    description: error_description || '登入過程中發生錯誤'
                                }
                            }));
                        }
                    }
                    
                    // 處理從外部傳入的 URL 作為 oauth_return_url
                    if (event.data && event.data.url) {
                        const ref = new URL(event.data.url);
                        localStorage.setItem('oauth_return_url', ref.origin + ref.pathname);
                    }
                });
            }
            
            // 監聽 FML_Done postMessage 來更新 BodyData（只綁定一次）
            if (!window.infFITSFMLListenerBound) {
                window.addEventListener('message', (event) => {
                    if (event.data && event.data.header === 'bid' && event.data.value) {
                        // 找到第一個已登入的組件實例來處理
                        const components = document.querySelectorAll('inf-google-login');
                        for (let component of components) {
                            if (component.isLoggedIn && component.userInfo) {
                                component.handleBodyDataUpdate(event.data.value);
                                break; // 只處理一次
                            }
                        }
                    }
                });
                window.infFITSFMLListenerBound = true;
            }
            
            // 監聽鞋子測量頁面的載入和變化事件（只綁定一次）
            if (!window.infFITSShoesDataListenerBound) {
                // 監聽頁面載入完成事件
                window.addEventListener('load', () => {
                    // 延遲執行，確保 DOM 完全載入
                    setTimeout(() => {
                        const components = document.querySelectorAll('inf-google-login');
                        for (let component of components) {
                            if (component.isLoggedIn) {
                                component.checkAndFillLocalShoesData();
                            }
                        }
                    }, 500);
                });
                
                // 監聽鞋子測量欄位的變化事件
                document.addEventListener('change', (event) => {
                    const target = event.target;
                    if (target && (
                        target.id === 'FootLength_input_PS_mbinfo' ||
                        target.id === 'FootWidth_input_PS_mbinfo' ||
                        target.id === 'FootCircu_input_PS_mbinfo'
                    )) {
                        // 當鞋子測量欄位發生變化時，檢查是否需要填入其他空欄位
                        const components = document.querySelectorAll('inf-google-login');
                        for (let component of components) {
                            if (component.isLoggedIn) {
                                component.checkAndFillLocalShoesData();
                            }
                        }
                    }
                });
                
                // 監聽自定義事件：當用戶登入成功時檢查鞋子資料
                document.addEventListener('infFITS:loginSuccess', () => {
                    setTimeout(() => {
                        const components = document.querySelectorAll('inf-google-login');
                        for (let component of components) {
                            if (component.isLoggedIn) {
                                component.checkAndFillLocalShoesData();
                            }
                        }
                    }, 1000);
                });
                
                window.infFITSShoesDataListenerBound = true;
            }
            
            this.globalEventBound = true;
        }
        
        // 頁面載入時檢查 OAuth 回調
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.handleOAuthCallback();
            });
        } else {
            // 頁面已經載入完成，立即檢查 OAuth 回調
            this.handleOAuthCallback();
        }
    }
    
    // 載入模態框內容
    loadModalContent() {
        if (!this.modalElement) return;
        
        const modalContent = this.modalElement.querySelector('.modal-content');
        if (modalContent) {
            // 動態載入模態框內容
            modalContent.innerHTML = this.isLoggedIn ? this.renderUserInfoModal() : this.renderLoginModal();
        }
    }
    
    // 切換 Modal 顯示狀態
    toggleModal() {
        if (this.isLoggedIn) {
            // 已登入用戶點擊 avatar，調用 API
            this.handleLoggedInUserClick();
        }
        
        // 先載入模態框內容
        this.loadModalContent();
        
        // 根據配置決定顯示方式
        if (this.config && this.config.modalContainerId) {
            // 在指定容器內顯示模態框
            this.showModalInContainer();
        } else {
            // 顯示固定位置的 modal，等待樣式載入完成
            this.waitForStylesAndShowFixedModal();
        }
    }
    
    // 關閉 Modal
    closeModal() {
        if (this.config && this.config.modalContainerId) {
            // 隱藏容器內的模態框
            this.hideModalInContainer();
        } else {
            // 隱藏固定位置的 modal
        this.modalElement.classList.remove('modal--visible');
        }
    }
    
    // 隱藏原本內容
    hideOriginalContent(container) {
        // 保存原本內容的引用
        this.originalContainer = container;
        this.originalContainerId = container.id;

        // 將原本內容移動到隱藏位置，而不是複製
        const hiddenContainer = document.createElement('div');
        hiddenContainer.style.cssText = `
            position: absolute;
            top: -9999px;
            left: -9999px;
            width: 1px;
            height: 1px;
            overflow: hidden;
            opacity: 0;
            pointer-events: none;
        `;

        // 移動所有子元素到隱藏容器，包括 avatar 元素
        // 使用 while 循環確保移動所有子元素，包括動態添加的 avatar
        while (container.firstChild) {
            hiddenContainer.appendChild(container.firstChild);
        }

        document.body.appendChild(hiddenContainer);
        this.hiddenContent = hiddenContainer;
    }

    // 顯示原本內容
    showOriginalContent(container) {
        if (this.originalContainer && this.hiddenContent) {
            // 將原本內容移回原容器
            while (this.hiddenContent.firstChild) {
                container.appendChild(this.hiddenContent.firstChild);
            }

            // 移除隱藏的容器
            if (this.hiddenContent.parentNode) {
                this.hiddenContent.parentNode.removeChild(this.hiddenContent);
            }

            this.originalContainer = null;
            this.originalContainerId = null;
            this.hiddenContent = null;
        }
    }
    
    // 在容器內顯示模態框
    showModalInContainer() {
        // 找到目標容器
        const containerId = this.config.modalContainerId;
        let targetContainer;
        
        if (containerId.includes(' ')) {
            // CSS 選擇器（包含空格）
            targetContainer = document.querySelector(containerId);
        } else if (containerId.startsWith('#')) {
            targetContainer = document.querySelector(containerId);
        } else {
            targetContainer = document.querySelector('#' + containerId);
        }
        
        if (!targetContainer) {
            return;
        }
        
        // 隱藏原本內容
        this.hideOriginalContent(targetContainer);
        
        // 創建模態框內容
        const modalContent = this.createModalContent();
        
        // 直接將模態框內容添加到容器
        targetContainer.appendChild(modalContent);
        targetContainer.style.opacity = '1';
        targetContainer.style.pointerEvents = 'auto';
        
        // 立即開始動畫，減少延遲
        this.startModalAnimation(modalContent);
        
        // 添加事件監聽器
        this.setupModalEventListeners(targetContainer);
    }
    
    // 立即開始模態框動畫
    startModalAnimation(modalContent) {
        const modalWrapper = modalContent.querySelector('.inf-google-login-modal');
        if (!modalWrapper) return;
        
        // 使用 requestAnimationFrame 確保 DOM 更新後再觸發動畫
        requestAnimationFrame(() => {
            modalWrapper.classList.add('animX');
        });
    }
    
    // 等待樣式載入完成後顯示模態框動畫（保留作為備用）
    waitForStylesAndShowModal(modalContent) {
        const modalWrapper = modalContent.querySelector('.inf-google-login-modal');
        if (!modalWrapper) return;
        
        // 立即添加動畫類，但先隱藏
        modalWrapper.style.opacity = '0';
        modalWrapper.style.transform = 'translateX(100%)';
        
        // 快速檢查樣式載入狀態
        const quickStyleCheck = () => {
            return new Promise((resolve) => {
                // 立即檢查字體是否已載入
                if (document.fonts && document.fonts.check && document.fonts.check('16px "Noto Sans TC"')) {
                    resolve(true);
                    return;
                }
                
                // 如果字體未載入，等待較短時間
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => {
                        setTimeout(resolve, 50);
                    });
                } else {
                    // 降級處理：短延遲
                    setTimeout(resolve, 100);
                }
            });
        };
        
        // 快速檢查並顯示動畫
        quickStyleCheck().then(() => {
            // 重置樣式並觸發動畫
            modalWrapper.style.opacity = '';
            modalWrapper.style.transform = '';
            modalWrapper.classList.add('animX');
        });
    }
    
    // 等待樣式載入完成後顯示固定位置模態框
    waitForStylesAndShowFixedModal() {
        if (!this.modalElement) return;
        
        // 快速檢查樣式載入狀態
        const quickStyleCheck = () => {
            return new Promise((resolve) => {
                // 立即檢查字體是否已載入
                if (document.fonts && document.fonts.check && document.fonts.check('16px "Noto Sans TC"')) {
                    resolve(true);
                    return;
                }
                
                // 如果字體未載入，等待較短時間
                if (document.fonts && document.fonts.ready) {
                    document.fonts.ready.then(() => {
                        setTimeout(resolve, 50);
                    });
                } else {
                    // 降級處理：短延遲
                    setTimeout(resolve, 100);
                }
            });
        };
        
        // 快速檢查並顯示動畫
        quickStyleCheck().then(() => {
            // 確保樣式已應用
            requestAnimationFrame(() => {
                this.modalElement.classList.add('modal--visible');
            });
        });
    }
    
    // 隱藏容器內的模態框
    hideModalInContainer() {
        // 找到目標容器
        const containerId = this.config.modalContainerId;
        let targetContainer;
        
        if (containerId.includes(' ')) {
            // CSS 選擇器（包含空格）
            targetContainer = document.querySelector(containerId);
        } else if (containerId.startsWith('#')) {
            targetContainer = document.querySelector(containerId);
        } else {
            targetContainer = document.querySelector('#' + containerId);
        }
        
        if (targetContainer) {
            const modalContainer = targetContainer.querySelector('.inf-google-login-modal-container');
            if (modalContainer) {
                const modalWrapper = modalContainer.querySelector('.inf-google-login-modal');
                if (modalWrapper) {
                    // 添加退出動畫
                    modalWrapper.classList.remove('animX');
                    modalWrapper.classList.add('animX-reverse');
                    
                    // 立即移除元素
                    modalContainer.remove();
                    // 恢復原本內容
                    this.showOriginalContent(targetContainer);
                } else {
                    // 如果沒有找到 modalWrapper，直接移除
                    modalContainer.remove();
                    this.showOriginalContent(targetContainer);
                }
            } else {
                // 恢復原本內容
                this.showOriginalContent(targetContainer);
            }
        }
    }
    
    // 創建模態框內容
    createModalContent() {
        const modalContainer = document.createElement('div');
        modalContainer.className = 'inf-google-login-modal-container';
        
        // 應用容器樣式
        if (this.config.modalContainerStyle) {
            const isMobile = utils.isMobile();
            const containerStyle = utils.getResponsiveStyle(this.config.modalContainerStyle, isMobile);
            Object.assign(modalContainer.style, containerStyle);
        }
        
        // 設置基本樣式
        modalContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: white;
            z-index: 1000;
            overflow: auto;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            ${modalContainer.style.cssText}
        `;
        
        // 創建包含樣式的完整模態框內容
        const fullModalContent = this.createFullModalContent();
        modalContainer.appendChild(fullModalContent);
        
        return modalContainer;
    }
    
    // 創建包含完整樣式的模態框內容
    createFullModalContent() {
        // 創建樣式元素
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&display=swap');
            
            .inf-google-login-modal {
                --primary-color: #333;
                --secondary-color: #d3d3d3;
                --white-color: #fff;
                --light-gray-color: #f2f2f2;
                --font-family: "Noto Sans TC", sans-serif;
                --box-shadow: 0px 0px 5px 0px rgba(0, 0, 0, 0.1);
            }
            .inf-google-login-modal *{
                font-family: var(--font-family) !important;
            }
            
            /* 優化的動畫效果 - 更流暢的過渡 */
            @keyframes animX {
                0% {
                    transform: translateX(100%);
                    opacity: 0;
                }
                100% {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes animXReverse {
                0% {
                    transform: translateX(0);
                    opacity: 1;
                }
                100% {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
            
            .inf-google-login-modal.animX {
                animation: animX 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                will-change: transform, opacity;
            }
            
            .inf-google-login-modal.animX-reverse {
                animation: animXReverse 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                will-change: transform, opacity;
            }
            
            .inf-google-login-modal .modal-content {
                background-color: var(--white-color);
                // border-radius: 12px;
                // padding: 32px;
                // max-width: 400px;
                // width: 90%;
                // text-align: center;
                // font-family: var(--font-family);
                // box-shadow: var(--box-shadow);
                // transform: translateY(-20px);
                // transition: transform 0.3s ease;
            }
            
            .inf-google-login-modal .modal--visible .modal-content {
                transform: translateY(0);
            }
            
            .inf-google-login-modal .login-modal-header,
            .inf-google-login-modal .profile-modal-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 24px;
            }
            
            /* 固定 profile-modal-header 不滾動 */
            .inf-google-login-modal .profile-modal-header {
                position: sticky;
                top: 0;
                background-color: var(--white-color);
                z-index: 2000;
                padding: 2% 0;
                margin-bottom: 16px;
            }
            
            .inf-google-login-modal .login-modal-title,
            .inf-google-login-modal .profile-modal-title {
                font-size: 16px;
                font-weight: 700;
                color: #333;
                margin: 0;
            }

           .inf-google-login-modal .login-modal__content {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 20px 0;
                max-width: 450px;
                margin: 0 auto;
                width: 100%;
            }


          .inf-google-login-modal .login-modal__logo {
                width: 119.894px;
                height: 25.022px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

           .inf-google-login-modal .login-modal__divider {
                display: flex;
                gap: 6px;
                width: 100%;
                padding-top: 24px;
                padding-bottom: 18px;
            }
            
           .inf-google-login-modal .login-modal__divider-line {
                flex: 1;
                height: 1px;
                background-color: #D7D7D6;
            }

             .inf-google-login-modal .profile-modal__setting-btn {
               display: flex;
                height: 20px;
                width: 20px;
                padding: 4px;
                border-radius: 60px;
                opacity: 1;
                font-size: 12px;
                align-items: center;
                flex-direction: column;
                box-shadow: 0 0 12px #0003, inset -72px 0 #fff;
                text-align: center;
                justify-content: center;
                cursor: pointer;
                position: relative;
            }
            
             .inf-google-login-modal .profile-modal__dropdown {
                position: absolute;
                top: 0;
                right: 0;
                margin-top: 4px;
                background: white;
                border: 1px solid #E2E8F0;
                border-radius: 6px;
                box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
                min-width: 140px;
                z-index: 1000;
                opacity: 0;
                visibility: hidden;
                transform: scale(0.95);
                transition: all 0.15s ease;
            }
            
             .inf-google-login-modal .profile-modal__dropdown.show {
                opacity: 1;
                visibility: visible;
                transform: scale(1);
            }
            
             .inf-google-login-modal .profile-modal__dropdown-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                cursor: pointer;
                transition: background 0.15s ease;
                font-size: 13px;
            }
            
             .inf-google-login-modal .profile-modal__dropdown-item:hover {
                background: #F8FAFC;
            }
            
             .inf-google-login-modal .profile-modal__dropdown-item.logout {
                color: #6B7280;
            }
            
             .inf-google-login-modal .profile-modal__dropdown-item.delete {
                color: #6B7280;
            }
            
             .inf-google-login-modal .profile-modal__dropdown-item.delete:hover {
                color: #DC2626;
            }
            
             .inf-google-login-modal .profile-modal__dropdown-item svg {
                 width: 14px;
                 height: 14px;
             }
             
            /* 自定義確認彈窗樣式 */
            .custom-confirm-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: 10001;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }

            .custom-confirm-overlay.show {
                opacity: 1;
                visibility: visible;
            }

            .custom-confirm-modal {
                background: white;
                border-radius: 8px;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
                max-width: 380px;
                width: 90%;
                transform: scale(0.9);
                transition: all 0.3s ease;
                overflow: hidden;
                border: 1px solid #E5E7EB;
            }

            .custom-confirm-overlay.show .custom-confirm-modal {
                transform: scale(1);
            }

            .custom-confirm-header {
                color: #374151;
                padding-top: 20px;
                text-align: center;
            }

            .custom-confirm-title {
                font-size: 16px;
                font-weight: 600;
                margin: 0;
                color: #1F2937;
            }
                .inf-google-login-modal .modal-content:has(.login-modal-header) {
                   paddingt-top: 12px;
                   paddingt-bottom: 12px;
                }
            .custom-confirm-content {
                padding: 12px 20px;
                text-align: center;
            }

            .custom-confirm-message {
                color: #6B7280;
                font-size: 14px;
                line-height: 1.5;
                margin: 0 0 20px;
            }

            .custom-confirm-actions {
                display: flex;
                gap: 12px;
                justify-content: center;
            }

            .custom-confirm-btn {
                padding: 10px 24px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                border: none;
                transition: all 0.2s ease;
                min-width: 100px;
            }

            .custom-confirm-btn.cancel {
                background: #F3F4F6;
                color: #6B7280;
                border: 1px solid #D1D5DB;
            }

            .custom-confirm-btn.cancel:hover {
                background: #E5E7EB;
                border-color: #9CA3AF;
            }

            .custom-confirm-btn.confirm {
                background: #000;
                color: white;
            }

            .custom-confirm-btn.confirm:hover {
                opacity: 0.8;
            }
            .inf-google-login-modal .profile-modal__back-arrow {
                background: none;
                border: none;
                cursor: pointer;
                color: var(--primary-color);
                padding: 0;
                width: 36px;
                height: 36px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .inf-google-login-modal .profile-modal__back-arrow svg {
                width: 100%;
                height: 100%;
            }
            
            .inf-google-login-modal .login-modal-spacer,
            .inf-google-login-modal .profile-modal-spacer {
                width: 36px;
                height: 36px;
            }
            
            .inf-google-login-modal .google-login-btn {
                width: 100%;
                padding: 12px 16px;
                background-color: var(--light-gray-color);
                border: none;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 12px;
                cursor: pointer;
                font-family: var(--font-family);
                font-size: 14px;
                font-weight: 500;
                color: var(--primary-color);
                transition: all 0.3s ease;
            }
            
            .inf-google-login-modal .google-login-btn:hover {
                background-color: var(--primary-color);
                color: var(--white-color);
            }
            
            .inf-google-login-modal .google-icon {
                width: 20px;
                height: 20px;
            }
            
            .inf-google-login-modal .user-info {
                text-align: left;
            }
            
            .inf-google-login-modal .user-avatar {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                margin: 0 auto 16px;
                overflow: hidden;
                background-color: var(--primary-color);
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--white-color);
                font-size: 32px;
                font-weight: 700;
            }
            
            .inf-google-login-modal .user-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .inf-google-login-modal .user-name {
                font-size: 16px;
                font-weight: 700;
                color: var(--primary-color);
                margin-bottom: 8px;
            }
            
            .inf-google-login-modal .user-email {
                font-size: 14px;
                color: var(--primary-color);
                margin-bottom: 16px;
            }
            
            .inf-google-login-modal .user-detail-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px 0;
                border-bottom: 1px solid var(--secondary-color);
            }
            
            .inf-google-login-modal .user-detail-item:last-child {
                border-bottom: none;
            }
            
            .inf-google-login-modal .user-detail-label {
                font-size: 14px;
                font-weight: 500;
                color: var(--primary-color);
            }
            
            .inf-google-login-modal .user-detail-value {
                font-size: 14px;
                color: var(--primary-color);
            }
            
            /* 使用者資料區塊樣式 */
            .inf-google-login-modal .user-data-section {
                margin-top: 24px;
            }
            
            .inf-google-login-modal .section-title {
                font-size: 14px;
                font-weight: 700;
                color: #333;
                margin-bottom: 10px;
                display: flex;
            }
            
            .inf-google-login-modal .user-data-card {
                display: flex;
                align-items: center;
                padding: 12px 0;
                margin-bottom: 16px;
                position: relative;
                border-bottom: 1px solid #E5E7EB;
            }
            
            .inf-google-login-modal .user-avatar-icon {
                width: 36px;
                height: 36px;
                background-color: #333;
                border-radius: 8px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 12px;
                flex-shrink: 0;
            }
            
            .inf-google-login-modal .user-data-info {
                display: flex;
                flex-direction: column;
                width: 100%;
                align-items: self-start;
                flex: 1;
            }
            
            .inf-google-login-modal .user-data-name {
                font-size: 14px;
                font-weight: 700;
                color: #333;
                margin-bottom: 2px;
            }
            
            .inf-google-login-modal .user-data-subtitle {
                font-size: 12px;
                color: #666;
            }
            
            .inf-google-login-modal .user-data-actions {
                display: flex;
                gap: 8px;
                align-items: center;
            }
            
            .inf-google-login-modal .user-data-edit,
            .inf-google-login-modal .user-data-delete {
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .inf-google-login-modal .user-data-edit:hover,
            .inf-google-login-modal .user-data-delete:hover {
                background-color: #E5E7EB;
            }
            
            .inf-google-login-modal .body-data-list {
                margin-bottom: 16px;
            }
            
            .inf-google-login-modal .body-data-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 16px;
                background-color: #F8F9FA;
                border-radius: 8px;
                margin-bottom: 6px;
            }
            
            .inf-google-login-modal .body-data-item:last-child {
                margin-bottom: 0;
            }
            
            .inf-google-login-modal .body-data-label {
                font-size: 14px;
                color: #333;
                font-weight: 500;
            }
            
            .inf-google-login-modal .body-data-value-container {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .inf-google-login-modal .body-data-value {
                font-size: 14px;
                color: #333;
                font-weight: 400;
            }
            
            .inf-google-login-modal .edit-icon {
                cursor: pointer;
                opacity: 0.6;
                transition: opacity 0.2s ease;
            }
            
            .inf-google-login-modal .edit-icon:hover {
                opacity: 1;
            }
            
            .inf-google-login-modal .editable-field {
                cursor: pointer;
                transition: background-color 0.2s ease;
                position: relative;
            }
            
            .inf-google-login-modal .editable-field:hover {
                background-color: #f8f9fa;
            }
            
            .inf-google-login-modal .bmi-data-item {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 10px 16px;
                background-color: #f8f9fa;
                border-radius: 8px;
                margin-bottom: 6px;
            }
            
            .inf-google-login-modal .bmi-value-container {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
            }
            
            .inf-google-login-modal .bmi-value {
                font-size: 18px;
                font-weight: 700;
                color: #3B82F6;
                margin-bottom: 2px;
            }
            
            .inf-google-login-modal .bmi-status {
                font-size: 12px;
                color: #3B82F6;
                font-weight: 400;
            }
            
            @media (max-width: 768px) {
                .inf-google-login-modal .modal-content:has(.login-modal-header) {
                     padding: 12px 20px;
                }
                   .inf-google-login-modal .modal-content:has(.profile-modal-header) {
                     padding: 0 2%;
                     max-width: 99%;
                     margin: 0 auto;
                     box-sizing: border-box;
                }
                
                .inf-google-login-modal .user-avatar {
                    width: 60px;
                    height: 60px;
                    font-size: 24px;
                }
            }
        `;
        
        // 創建模態框內容
        const modalWrapper = document.createElement('div');
        modalWrapper.className = 'inf-google-login-modal';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.innerHTML = this.isLoggedIn ? this.renderUserInfoModal() : this.renderLoginModal();
        
        modalWrapper.appendChild(modalContent);
        
        // 創建容器並添加樣式和內容
        const container = document.createElement('div');
        container.appendChild(styleElement);
        container.appendChild(modalWrapper);
        
        return container;
    }
    
    // 設置模態框事件監聽器
    setupModalEventListeners(container) {
        const modalContainer = container.querySelector('.inf-google-login-modal-container');
        if (!modalContainer) return;
        
        modalContainer.addEventListener('click', (e) => {
            const action = e.target.dataset.action || e.target.closest('[data-action]')?.dataset.action;
            
            switch (action) {
                case 'close':
                    this.closeModal();
                    break;
                case 'login':
                    this.handleLogin();
                    break;
                case 'logout':
                    this.handleLogout();
                    break;
                case 'back-to-avatar':
                    this.handleBackToAvatar();
                    break;
                case 'delete-user-data':
                    const userKey = e.target.closest('[data-user-key]')?.dataset.userKey;
                    if (userKey) {
                        this.handleDeleteUserData(userKey);
                    }
                    break;
            }
        });
        
        // 設定按鈕下拉選單功能
        const settingBtn = container.querySelector('#profile-setting-btn');
        const dropdown = container.querySelector('#profile-dropdown');
        
        if (settingBtn && dropdown) {
            // 點擊設定按鈕切換下拉選單
            settingBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('show');
            });
            
            // 點擊其他地方關閉下拉選單
            document.addEventListener('click', (e) => {
                if (!settingBtn.contains(e.target) && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('show');
                }
            });
            
            // 登出選項
            const logoutItem = container.querySelector('#profile-logout-item');
            if (logoutItem) {
                logoutItem.addEventListener('click', () => {
                    this.handleLogout();
                    dropdown.classList.remove('show');
                });
            }
            
            // 刪除帳號選項
            const deleteItem = container.querySelector('#profile-delete-item');
            if (deleteItem) {
                deleteItem.addEventListener('click', () => {
                    this.handleDeleteAccount();
                    dropdown.classList.remove('show');
                });
            }
        }
    }
    
    // 處理返回原 avatar 的邏輯
    handleBackToAvatar() {
          
          // 防止重複調用 - 如果已經在處理中就直接返回
          if (this.isHandlingBack) {
              return;
          }
          
          this.isHandlingBack = true;
          
          try {
              // 檢查是否在服飾 iframe 中，並且編輯了對應使用者的欄位
              if (this.shouldReloadOnBack()) {
                  safeReload();
                  return;
              }
              
              // 檢查是否在鞋子頁面且編輯了鞋子資料
              if (this.shouldUpdateShoesFields()) {
                  this.updateShoesFieldsOnBack();
                  safeReload();
                  return;
              }
          } finally {
              // 重置標記，允許後續調用
              setTimeout(() => {
                  this.isHandlingBack = false;
              }, 100);
          }
          
        if (this.config && this.config.modalContainerId) {
            // 找到目標容器
            const containerId = this.config.modalContainerId;
            let targetContainer;
            
            if (containerId.includes(' ')) {
                // CSS 選擇器（包含空格）
                targetContainer = document.querySelector(containerId);
            } else if (containerId.startsWith('#')) {
                targetContainer = document.querySelector(containerId);
            } else {
                targetContainer = document.querySelector('#' + containerId);
            }
            
            if (targetContainer) {
                const modalContainer = targetContainer.querySelector('.inf-google-login-modal-container');
                if (modalContainer) {
                    const modalWrapper = modalContainer.querySelector('.inf-google-login-modal');
                    if (modalWrapper) {
                        // 添加與 #settings_backarrow 相同的退出動畫
                        modalWrapper.classList.remove('animX');
                        modalWrapper.classList.add('animX-reverse');
                        
                        // 動畫完成後關閉模態框
                        modalWrapper.addEventListener('animationend', () => {
                            modalContainer.remove();
                            // 恢復原本內容
                            this.showOriginalContent(targetContainer);
                        }, { once: true });
                    } else {
                        // 如果沒有找到 modalWrapper，直接關閉
                        modalContainer.remove();
                        this.showOriginalContent(targetContainer);
                    }
                } else {
                    // 恢復原本內容
                    this.showOriginalContent(targetContainer);
                }
            }
        } else {
            // 關閉固定位置的 modal
            this.closeModal();
        }
    }
      
      // 判斷是否應該在返回時重新載入頁面
      shouldReloadOnBack() {
          try {
              
              // 檢查是否在 iframe 中
              const isInIframe = window.self !== window.top;
              if (!isInIframe) {
                  return false;
              }
              
              
              // 獲取當前 URL 並判斷頁面對應的使用者類型
              const currentUrl = window.location.href;
              let expectedUserType = null;
              
              // 根據 URL 判斷期望的使用者類型
              if (currentUrl.includes('indexwebiframe_')) {
                  // 身體資料頁面：從 URL 參數判斷
                  expectedUserType = currentUrl.includes('?M') ? 'bodyM' : 'bodyF';
              } else {
                  return false;
              }
              
              if (!expectedUserType) {
                  return false;
              }
              
              // 聰明的方式：直接檢查是否編輯了當前頁面對應的使用者
              const hasEditedCurrentPageUser = this.editedUsers.has(expectedUserType);
              
              if (hasEditedCurrentPageUser) {
                  return true;
              } else {
                  return false;
              }
              
          } catch (error) {
              console.error('判斷是否需要重新載入時發生錯誤:', error);
              return false;
        }
    }
    
    // 檢查是否應該更新鞋子欄位
    shouldUpdateShoesFields() {
        try {
            // 檢查是否在鞋子頁面
            const currentUrl = window.location.href;
            if (!currentUrl.includes('cid')) {
                return false;
            }
            
            // 檢查是否編輯了鞋子資料
            const hasEditedShoes = this.editedUsers.has('shoesM') || this.editedUsers.has('shoesF');
            
            return hasEditedShoes;
        } catch (error) {
            console.error('檢查鞋子欄位更新時發生錯誤:', error);
            return false;
        }
    }
    
    // 更新鞋子欄位
    updateShoesFieldsOnBack() {
        try {
            // 檢查是否在鞋子頁面
            const currentUrl = window.location.href;
            if (!currentUrl.includes('cid')) {
                return;
            }
            
            // 從本地存儲取得最新的腳部資料
            const footData = this.getLocalData('BodyID_Foot_size');
            if (footData) {
                // 立即填入欄位，不延遲執行
                this.fillShoesMeasurementFields(footData);
            } else {
            }
        } catch (error) {
            console.error('更新鞋子欄位時發生錯誤:', error);
        }
    }
    
    // 檢查是否編輯了指定類型的使用者
      hasEditedUserType(userType) {
          try {
              // 方法1: 檢查記憶體中的編輯追蹤
              const hasEditedInMemory = this.editedUsers.has(userType);
              
              if (hasEditedInMemory) {
                  return true;
              }
              
              // 方法2: 檢查是否有對應的本地存儲資料（作為後備檢查）
              const storageKey = userType === 'bodyM' ? 'BodyMID_size' : 'BodyID_size';
              const savedData = localStorage.getItem(storageKey);
              
              if (savedData) {
                  
                  try {
                      const data = JSON.parse(savedData);
                      // 如果有有意義的資料（不只是空物件），就判定為已編輯
                      if (data && typeof data === 'object' && Object.keys(data).length > 0) {
                          // 補充到記憶體追蹤中
                          this.editedUsers.add(userType);
                          return true;
                      }
                  } catch (parseError) {
                      console.error(`解析 ${userType} 本地資料時發生錯誤:`, parseError);
                  }
              }
              
              return false;
              
          } catch (error) {
              console.error('檢查編輯記錄時發生錯誤:', error);
              return false;
          }
      }
      
      // 檢查服飾 iframe 雲端資料同步
      async checkCloudLocalDataSync() {
          try {
              // 檢查是否在服飾 iframe 中
              const isInIframe = window.self !== window.top;
              if (!isInIframe) {
                  return;
              }
              
              const currentUrl = window.location.href;
              if (!currentUrl.includes('indexwebiframe_')) {
                  return;
              }
              
              // 檢查是否已登入
              if (!this.isLoggedIn || !this.userInfo) {
                  return;
              }
              
              
              // 根據 URL 判斷對應的使用者類型
              const expectedUserType = currentUrl.includes('?M') ? 'bodyM' : 'bodyF';
              const localKey = expectedUserType === 'bodyM' ? 'BodyMID_size' : 'BodyID_size';
              
              
              // 檢查雲端是否有對應資料
              if (!this.userInfo.BodyData || !this.userInfo.BodyData[expectedUserType]) {
                  return;
              }
              
              const cloudData = this.userInfo.BodyData[expectedUserType];
              
              // 檢查本地是否有對應資料
              const localData = this.getLocalData(localKey);
              
              if (localData && Object.keys(localData).length > 0) {
                  return;
              }
              
              
              // 將雲端資料保存到本地
              await this.saveLocalData(localKey, cloudData, 'body');
              
              
              // 重新載入頁面
              safeReload();
              
          } catch (error) {
              console.error('檢查雲端資料同步時發生錯誤:', error);
        }
    }
    
    // 處理 BodyData 更新
    async handleBodyDataUpdate(bodyDataValue) {
        try {
            // 防止重複調用
            if (this.isUpdatingBodyData) {
                return;
            }
            
            // 檢查是否已登入
            if (!this.isLoggedIn || !this.userInfo) {
                return;
            }
            
            this.isUpdatingBodyData = true;
            
            // 判斷是身體資料還是鞋子資料
            const isShoesData = bodyDataValue.FH !== undefined || bodyDataValue.FW !== undefined || bodyDataValue.FCir !== undefined;
            let bodyDataPtr;
            if (isShoesData) {
                // 鞋子資料：：根據當前頁面 URL 判斷
                const urlParams = new URLSearchParams(window.location.search);
                const cid = urlParams.get('cid');
                let genderFromCid = 'F'; // 預設為女性
                
                if (cid) {
                    const underscoreIndex = cid.indexOf('_');
                    if (underscoreIndex !== -1) {
                        const afterUnderscore = cid.substring(underscoreIndex + 1);
                        if (afterUnderscore.includes('M')) {
                            genderFromCid = 'M';
                        } else {
                            genderFromCid = 'F';
                        }
                    }
                }
                bodyDataPtr = genderFromCid === 'M' ? 'shoesM' : 'shoesF';
            } else {
                // 身體資料：根據當前頁面 URL 判斷
                const currentUrl = window.location.href;
                bodyDataPtr = currentUrl.includes('?M') ? 'bodyM' : 'bodyF';
            }
            
            // 獲取存儲的憑證
            const accessToken = TokenManager.getAccessToken();
            if (!accessToken) {
                return;
            }
            if(bodyDataValue.CC === "null_null"){
                bodyDataValue.CC = "";
            }
            
            const payload = {
                BodyData: {[bodyDataPtr]:bodyDataValue},
                BodyData_ptr: bodyDataPtr,
                update_bodydata: true,
                credential: accessToken,
                sub: this.userInfo.sub || this.userInfo.id,
                IDTYPE: 'Google'
            };
            
            // 調用更新 BodyData API
            const response = await fetch('https://api.inffits.com/inffits_account_register_and_retrieve_data/model?IDTYPE=Google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token 過期，嘗試刷新
                    await TokenManager.refreshAccessToken(this.userInfo.sub);
                    // 重新調用更新 API
                    const newToken = TokenManager.getAccessToken();
                    payload.credential = newToken;
                    
                    const retryResponse = await fetch('https://api.inffits.com/inffits_account_register_and_retrieve_data/model?IDTYPE=Google', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!retryResponse.ok) {
                        // throw new Error(`更新 BodyData 失敗: ${retryResponse.status} ${retryResponse.statusText}`);
                        return;
                    }
                    
                    // 重試成功，獲取回傳資料
                    const retryResponseData = await retryResponse.json();
                    
                    
                    // 根據 API 回傳的 BodyData 更新本地資料
                    if (retryResponseData.BodyData) {
                        this.userInfo.BodyData = retryResponseData.BodyData;
                        TokenManager.setUserInfo(this.userInfo);
                    }
                    
                    // 重新渲染模態框
                    this.refreshModalContent();
                    
                    // 顯示成功通知
                    // showNotification(`${bodyDataPtr} 資料已更新`, 'success');
                    return;
                } else {
                    throw new Error(`更新 BodyData 失敗: ${response.status} ${response.statusText}`);
                }
            }
            
            // 獲取 API 回傳的資料來更新 BodyData
            const responseData = await response.json();
            
            
            // 根據 API 回傳的 BodyData 更新本地資料
            if (responseData.BodyData) {
                this.userInfo.BodyData = responseData.BodyData;
                TokenManager.setUserInfo(this.userInfo);
            }
            
            // 重新渲染模態框
            this.refreshModalContent();
            
            // 顯示成功通知
            // showNotification(`${bodyDataPtr} 資料已更新`, 'success');
            
        } catch (error) {
            this.dispatchEvent(new CustomEvent('infFITS:error', {
                detail: { error: error.message, type: 'update_bodydata_failed' }
            }));
            // 顯示錯誤通知
            // showNotification('更新 BodyData 時發生錯誤: ' + error.message, 'error');
        } finally {
            // 重置更新狀態標記
            this.isUpdatingBodyData = false;
        }
    }
    
    // 刷新模態框內容
    refreshModalContent() {
        // 根據配置決定刷新方式
        if (this.config && this.config.modalContainerId) {
            const containerId = this.config.modalContainerId;
            let targetContainer;
            
            if (containerId.includes(' ')) {
                // CSS 選擇器（包含空格）
                targetContainer = document.querySelector(containerId);
            } else if (containerId.startsWith('#')) {
                targetContainer = document.querySelector(containerId);
            } else {
                targetContainer = document.querySelector('#' + containerId);
            }
            
            if (targetContainer) {
                const modalContainer = targetContainer.querySelector('.inf-google-login-modal-container');
                if (modalContainer) {
                    const modalContent = modalContainer.querySelector('.modal-content');
                    if (modalContent) {
                        modalContent.innerHTML = this.renderUserInfoModal();
                        this.setupModalEventListeners(targetContainer);
                    }
                }
            }
        } else {
            this.render();
            this.attachEventListeners();
        }
    }
    
    // 處理刪除使用者資料
    async handleDeleteUserData(userKey) {
        // 防止重複調用
        if (this.isDeletingUser) {
            return;
        }
        
        try {
            this.isDeletingUser = true;
            
            const confirmed = await showCustomConfirm(
                '刪除使用者資料',
                `確定要刪除使用者 ${userKey} 嗎？<br>此操作無法復原，所有身體資料將被永久刪除。`,
                null,
                null
            );
            
            if (!confirmed) {
                this.isDeletingUser = false;
                return;
            }
            
            // 獲取存儲的憑證和用戶資訊
            const storedCredential = TokenManager.getAccessToken();
            const userInfo = this.userInfo;
            
            if (!storedCredential || !userInfo) {
                return;
            }
            
            const payload = {
                BodyData_ptr: userKey, // 指定要刪除的使用者(ex:bodyF)
                delete_bodydata: true,
                credential: storedCredential,
                sub: userInfo.sub || userInfo.id,
                IDTYPE: 'Google'
            };
            
            // 調用刪除使用者資料 API
            const response = await fetch('https://api.inffits.com/inffits_account_register_and_retrieve_data/model?IDTYPE=Google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token 過期，嘗試刷新
                    await TokenManager.refreshAccessToken(userInfo.sub);
                    // 重新調用刪除 API
                    const newCredential = TokenManager.getAccessToken();
                    payload.credential = newCredential;
                    
                    const retryResponse = await fetch('https://api.inffits.com/inffits_account_register_and_retrieve_data/model?IDTYPE=Google', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!retryResponse.ok) {
                        // throw new Error(`刪除使用者資料失敗: ${retryResponse.status} ${retryResponse.statusText}`);
                        return;
                    }
                    
                    // 重試成功，獲取回傳資料
                    const retryResponseData = await retryResponse.json();
                    
                    // 根據重試 API 回傳的 BodyData 更新本地資料
                    if (retryResponseData.BodyData) {
                        this.userInfo.BodyData = retryResponseData.BodyData;
                        // 更新本地存儲
                        TokenManager.setUserInfo(this.userInfo);
                    }
                    
                    // 重新渲染模態框
                    if (this.config && this.config.modalContainerId) {
                        const containerId = this.config.modalContainerId;
                        let targetContainer;
                        
                        if (containerId.includes(' ')) {
                            // CSS 選擇器（包含空格）
                            targetContainer = document.querySelector(containerId);
                        } else if (containerId.startsWith('#')) {
                            targetContainer = document.querySelector(containerId);
                        } else {
                            targetContainer = document.querySelector('#' + containerId);
                        }
                        
                        if (targetContainer) {
                            const modalContainer = targetContainer.querySelector('.inf-google-login-modal-container');
                            if (modalContainer) {
                                const modalContent = modalContainer.querySelector('.modal-content');
                                if (modalContent) {
                                    modalContent.innerHTML = this.renderUserInfoModal();
                                    this.setupModalEventListeners(targetContainer);
                                }
                            }
                        }
                    } else {
                        this.render();
                        this.attachEventListeners();
                    }
                    
                    // 顯示成功通知
                    showNotification(`使用者 ${userKey} 資料已刪除`, 'success');
                    
                    // 重置刪除狀態標記
                    this.isDeletingUser = false;
                    return; // 提前返回，避免執行後續代碼
                } else {
                    throw new Error(`刪除使用者資料失敗: ${response.status} ${response.statusText}`);
                }
            }
            
            // 獲取 API 回傳的資料來更新 BodyData
            const responseData = await response.json();
            
            
            // 根據 API 回傳的 BodyData 更新本地資料
            if (responseData.BodyData) {
                this.userInfo.BodyData = responseData.BodyData;
                // 更新本地存儲
                TokenManager.setUserInfo(this.userInfo);
            }
            
            // 重新渲染模態框
            if (this.config && this.config.modalContainerId) {
                const containerId = this.config.modalContainerId;
                let targetContainer;
                
                if (containerId.includes(' ')) {
                    // CSS 選擇器（包含空格）
                    targetContainer = document.querySelector(containerId);
                } else if (containerId.startsWith('#')) {
                    targetContainer = document.querySelector(containerId);
                } else {
                    targetContainer = document.querySelector('#' + containerId);
                }
                
                if (targetContainer) {
                    const modalContainer = targetContainer.querySelector('.inf-google-login-modal-container');
                    if (modalContainer) {
                        const modalContent = modalContainer.querySelector('.modal-content');
                        if (modalContent) {
                            modalContent.innerHTML = this.renderUserInfoModal();
                            this.setupModalEventListeners(targetContainer);
                        }
                    }
                }
            } else {
                this.render();
                this.attachEventListeners();
            }
            
            // 顯示成功通知
            showNotification(`使用者 ${userKey} 資料已刪除`, 'success');
            
            // 重置刪除狀態標記
            this.isDeletingUser = false;
        } catch (error) {
            this.dispatchEvent(new CustomEvent('infFITS:error', {
                detail: { error: error.message, type: 'delete_user_data_failed' }
            }));
            // 顯示錯誤通知
            showNotification('刪除使用者資料時發生錯誤: ' + error.message, 'error');
            
            // 重置刪除狀態標記
            this.isDeletingUser = false;
        }
    }
    
    // 根據當前 iframe src 判斷資料類型
    determineDataTypeFromIframeSrc() {
        const currentUrl = window.location.href;
        
        // 判斷是否為鞋子測量頁面
        if (currentUrl.includes('iframe_container_shoes_login.html')) {
            // 從 URL 參數解析性別
            const urlParams = new URLSearchParams(window.location.search);
            const cid = urlParams.get('cid');
            let gender = 'F'; // 預設為女性
            
            if (cid) {
                const underscoreIndex = cid.indexOf('_');
                if (underscoreIndex !== -1) {
                    const afterUnderscore = cid.substring(underscoreIndex + 1);
                    if (afterUnderscore.includes('M')) {
                        gender = 'M';
                    } else {
                        gender = 'F';
                    }
                }
            }
            
            return gender === 'M' ? 'shoesM' : 'shoesF';
        }
        
        // 判斷是否為身體測量頁面
        if (currentUrl.includes('indexwebiframe_')) {
            // 從 URL 參數判斷性別
            if (currentUrl.includes('?M')) {
                return 'bodyM';
            } else if (currentUrl.includes('?F')) {
                return 'bodyF';
            }
        }
        
        return null; // 無法確定資料類型
    }
    
    // 首次登入資料同步
    async syncFirstLoginData(dataType, userInfo) {
        // 獲取本地資料鍵值
        const localKey = this.getLocalStorageKey(dataType);
        
        // 獲取本地資料
        const localData = this.getLocalData(localKey);
        
        // 獲取雲端資料
        const cloudData = await this.getCloudData(userInfo);
        
        // 比對並處理資料
        const syncResult = await this.compareAndSyncData(dataType, localData, cloudData, userInfo);
        
        // 如果是鞋子資料且有資料被保存到本地，填入測量欄位
        if ((dataType === 'shoesF' || dataType === 'shoesM') && 
            (syncResult.action === 'downloaded' || syncResult.action === 'user_choice_downloaded')) {
            this.fillShoesMeasurementFields(syncResult.localData);
        }
        
        return syncResult;
    }
    
    // 獲取本地存儲鍵值
    getLocalStorageKey(dataType) {
        const keyMap = {
            'bodyF': 'BodyID_size',
            'bodyM': 'BodyMID_size',
            'shoesF': 'BodyID_Foot_size',
            'shoesM': 'BodyID_Foot_size'
        };
        return keyMap[dataType];
    }
    
    // 獲取本地資料
    getLocalData(localKey) {
        try {
            const data = localStorage.getItem(localKey);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    }
    
    // 獲取雲端資料
    async getCloudData(userInfo) {
        try {
            const accessToken = TokenManager.getAccessToken();
            if (!accessToken) {
                return;
            }
            
            const payload = {
                credential: accessToken,
                IDTYPE: "Google"
            };
            
            const response = await fetch('https://api.inffits.com/inffits_account_register_and_retrieve_data/model?IDTYPE=Google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token 過期，嘗試刷新
                    await TokenManager.refreshAccessToken();
                    const newAccessToken = TokenManager.getAccessToken();
                    payload.credential = newAccessToken;
                    
                    const retryResponse = await fetch('https://api.inffits.com/inffits_account_register_and_retrieve_data/model?IDTYPE=Google', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!retryResponse.ok) {
                        // throw new Error(`API 請求失敗: ${retryResponse.status}`);
                        return;
                    }
                    
                    const retryData = await retryResponse.json();
                    
                    
                    return retryData.BodyData || {};
                } else {
                    throw new Error(`API 請求失敗: ${response.status}`);
                }
            }
            
            const data = await response.json();
            
            // 保存 INF_ID 到 localStorage（首次登入時）
            if (data.INF_ID) {
                TokenManager.setInfId(data.INF_ID);
            }
            
            return data.BodyData || {};
        } catch (error) {
            throw new Error(`獲取雲端資料失敗: ${error.message}`);
        }
    }
    
    // 比對並同步資料
    async compareAndSyncData(dataType, localData, cloudData, userInfo) {
        const localKey = this.getLocalStorageKey(dataType);
        const cloudKey = this.getCloudDataKey(dataType, cloudData);
        
        const hasLocal = localData !== null;
        const hasCloud = cloudKey && cloudData[cloudKey] !== undefined;
        
        if (!hasLocal && !hasCloud) {
            // 情況 4：兩邊都沒有資料
            return {
                action: 'skipped',
                message: '本地和雲端都沒有資料，等待用戶填寫',
                localData: null,
                cloudData: null
            };
        } else if (!hasLocal && hasCloud) {
            // 情況 1：雲端有，本地沒有
            await this.saveLocalData(localKey, cloudData[cloudKey], dataType);
            // 如果是身體資料（bodyM 或 bodyF），重新載入頁面
            if (dataType === 'bodyM' || dataType === 'bodyF') {
                window.location.reload();
                return;
            }
            return {
                action: 'downloaded',
                message: '已從雲端下載資料到本地',
                localData: cloudData[cloudKey],
                cloudData: cloudData[cloudKey]
            };
        } else if (hasLocal && !hasCloud) {
            // 情況 2：本地有，雲端沒有
            await this.uploadLocalToCloud(localData, dataType, userInfo);
            return {
                action: 'uploaded',
                message: '已上傳本地資料到雲端',
                localData: localData,
                cloudData: localData
            };
        } else {
            // 情況 3：兩邊都有資料
            const isSame = this.deepCompareData(localData, cloudData[cloudKey], dataType);
            
            if (isSame) {
                // 資料相同，略過
                return {
                    action: 'skipped',
                    message: '本地和雲端資料一致，已略過同步',
                    localData: localData,
                    cloudData: cloudData[cloudKey]
                };
            } else {
                // 資料不同，讓用戶選擇
                const userChoice = await showDataVersionDialog(dataType, localData, cloudData[cloudKey]);
                
                if (userChoice === 'cloud') {
                    // 用戶選擇雲端資料
                    await this.saveLocalData(localKey, cloudData[cloudKey], dataType);
                    
                    // 如果是身體資料（bodyM 或 bodyF），重新載入頁面
                    if (dataType === 'bodyM' || dataType === 'bodyF') {
                        safeReload();
                        return;
                    }
                    
                    return {
                        action: 'user_choice_downloaded',
                        message: '用戶選擇雲端資料，已下載到本地',
                        localData: cloudData[cloudKey],
                        cloudData: cloudData[cloudKey]
                    };
                } else if (userChoice === 'local') {
                    // 用戶選擇本地資料
                    await this.uploadLocalToCloud(localData, dataType, userInfo);
                    return {
                        action: 'user_choice_uploaded',
                        message: '用戶選擇本地資料，已上傳到雲端',
                        localData: localData,
                        cloudData: localData
                    };
                } else {
                    // 用戶取消
                    return {
                        action: 'user_cancelled',
                        message: '用戶取消資料同步',
                        localData: localData,
                        cloudData: cloudData[cloudKey]
                    };
                }
            }
        }
    }
    
    // 獲取雲端資料鍵值
    getCloudDataKey(dataType, cloudData) {
        if (dataType === 'shoesF' || dataType === 'shoesM') {
            // 鞋子資料：優先檢查直接對應的 shoesM/shoesF
            if (cloudData[dataType]) {
                return dataType;
            }
            
            // 備用方案：檢查 BodyID_Foot_size（舊格式）
            const footData = cloudData.BodyID_Foot_size;
            if (footData) {
                const gender = footData.Gender || this.extractGenderFromUrl();
                return (gender === 'M') ? 'shoesM' : 'shoesF';
            }
            
            return null;
        } else {
            // 身體資料直接對應
            return dataType;
        }
    }
    
    // 從 URL 提取性別
    extractGenderFromUrl() {
        const currentUrl = window.location.href;
        if (currentUrl.includes('iframe_container_shoes_login.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const cid = urlParams.get('cid');
            if (cid) {
                const underscoreIndex = cid.indexOf('_');
                if (underscoreIndex !== -1) {
                    const afterUnderscore = cid.substring(underscoreIndex + 1);
                    return afterUnderscore.includes('M') ? 'M' : 'F';
                }
            }
        }
        return 'F'; // 預設為女性
    }

    // 觸發 Find My Size 功能
 triggerFindMySizeGlobal() {
    console.error('triggerFindMySizeGlobal')
    const $btn = $("#findmysize");
    if ($btn.length > 0) {
        $btn.trigger("click");
        // console statement removed
    } else {
        // console statement removed
    }
}

// 檢查並填入本地鞋子測量資料
    async checkAndFillLocalShoesData() {
    try {
        // 檢查當前頁面是否為鞋子測量頁面
        const currentUrl = window.location.href;
        if (!currentUrl.includes('iframe_container_shoes_login.html')) {
            return; // 不是鞋子測量頁面，不需要填入
        }
        
        // 檢查鞋子測量欄位是否為空
        const footLength = document.getElementById('FootLength_input_PS_mbinfo');
        const footWidth = document.getElementById('FootWidth_input_PS_mbinfo');
        const footCircum = document.getElementById('FootCircu_input_PS_mbinfo');
        
        // 檢查必填欄位是否為空（腳圍是選填的，所以不檢查）
        const hasEmptyFields = (!footLength || !footLength.value.trim()) ||
                               (!footWidth || !footWidth.value.trim());
        
        // 如果有空欄位，嘗試從本地存儲填入資料
        if (hasEmptyFields) {
            const localFootData = localStorage.getItem('BodyID_Foot_size');
            const currentShoesGender = this.extractGenderFromUrl();
            if (localFootData) {
                const data = JSON.parse(localFootData);
                if(currentShoesGender === data.Gender) {
                    this.fillShoesMeasurementFields(data);
                }else{
                    const userInfo = TokenManager.getUserInfo();
                    const cloudData = await this.getCloudData(userInfo);
                    const dataType = `shoes${currentShoesGender}`;
                    const footData = cloudData[dataType];
                    if(footData) {
                        this.fillShoesMeasurementFields(footData);
                    }
                }
            }
        }
    } catch (error) {
        console.error('檢查本地鞋子測量資料失敗:', error);
    }
}

// 填入鞋子測量欄位
fillShoesMeasurementFields(data) {
    try {
        // 檢查本地 BodyID_Foot_size 是否有值
        const footLength = document.getElementById('FootLength_input_PS_mbinfo');
        const footWidth = document.getElementById('FootWidth_input_PS_mbinfo');
        const footCircum = document.getElementById('FootCircu_input_PS_mbinfo');
        
        
        // 檢查元素是否存在
        if (footLength && data.FH) {
            footLength.value = data.FH;
            // 延遲觸發 change 事件，避免影響頁面載入
            setTimeout(() => {
                footLength.dispatchEvent(new Event('change', { bubbles: true }));
            }, 200);
        }
        
        if (footWidth && data.FW) {
            footWidth.value = data.FW;
            setTimeout(() => {
                footWidth.dispatchEvent(new Event('change', { bubbles: true }));
            }, 200);
        }
        
        // 腳圍是選填的，只有在有值時才填入
        if (footCircum && data.FCir && data.FCir.trim() !== '') {
            footCircum.value = data.FCir;
            setTimeout(() => {
                footCircum.dispatchEvent(new Event('change', { bubbles: true }));
            }, 200);
        }
    } catch (error) {
        console.error('填入鞋子測量欄位失敗:', error);
    }
}
    
    // 深度比對資料（只比對關鍵欄位）
    deepCompareData(data1, data2, dataType) {
        if (!data1 || !data2) return false;
        
        if (dataType === 'shoesF' || dataType === 'shoesM') {
            // 鞋子資料比對：FCir, FH, FW
            return data1.FCir === data2.FCir && 
                   data1.FH === data2.FH && 
                   data1.FW === data2.FW;
        } else if (dataType === 'bodyF' || dataType === 'bodyM') {
            // 身體資料比對：HV, WV, CC
            return data1.HV === data2.HV && 
                   data1.WV === data2.WV && 
                   data1.CC === data2.CC;
        } else {
            // 預設：比對整個物件
            return JSON.stringify(data1) === JSON.stringify(data2);
        }
    }
    
    // 保存本地資料
    async saveLocalData(localKey, data, dataType = null) {
        try {
            if (localKey === 'BodyID_size' || localKey === 'BodyMID_size') {
                if (data.CC === "null_null") {
                    data.CC = "";
                }
                // 將 FitP 欄位的值改為使用 Pattern_Prefer 的值
                if (data.Pattern_Prefer !== undefined) {
                    data.FitP = data.Pattern_Prefer;
                }
            } else if (localKey === 'BodyID_Foot_size') {
                // 鞋子資料：確保包含 Gender 欄位
                if (dataType === 'shoesM' || dataType === 'shoesF') {
                    data.Gender = dataType === 'shoesM' ? 'M' : 'F';
                } else if (!data.Gender) {
                    // 如果沒有 Gender 欄位，從 URL 提取
                    data.Gender = this.extractGenderFromUrl();
                }
            }
            localStorage.setItem(localKey, JSON.stringify(data));
            if (localKey === 'BodyID_size' || localKey === 'BodyMID_size') {
                // 身體資料的API調用現在由 saveFieldValue 處理，這裡只需要重新渲染顯示
                this.updateDisplayedBodyData(data);
            } else if (localKey === 'BodyID_Foot_size') {
                // 腳部資料的API調用現在由 saveFieldValue 處理，這裡只需要重新渲染顯示
                this.updateDisplayedFootData(data);
                // 檢查並填入鞋子測量欄位
                this.fillShoesMeasurementFields(data);
            }
        } catch (error) {
            throw new Error(`保存本地資料失敗: ${error.message}`);
        }
    }
    
    // 更新身體數據到 API
    async updateBodyDataToAPI(data, dataType) {
        try {
            const userInfo = TokenManager.getUserInfo();
            if (userInfo) {
                const updatedBodyData = await this.uploadLocalToCloud(data, dataType, userInfo);
                
                // 返回更新後的完整BodyData供後續使用
                return updatedBodyData;
            }
        } catch (error) {
            console.error('更新身體數據到 API 失敗:', error);
            // 不拋出錯誤，讓本地保存仍然生效
            return null;
        }
    }
    
    // 更新腳部數據到 API
    async updateFootDataToAPI(data, userType) {
        try {
            const userInfo = TokenManager.getUserInfo();
            if (userInfo) {
                await this.uploadLocalToCloud(data, userType, userInfo);
            }
        } catch (error) {
            console.error('更新腳部數據到 API 失敗:', error);
            // 不拋出錯誤，讓本地保存仍然生效
        }
    }
    
    // 更新顯示的身體數據
    updateDisplayedBodyData(data) {
        try {
            // 獲取當前顯示的元素並更新
            if (data.HV && this.shadowRoot) {
                const heightElement = this.shadowRoot.querySelector('[data-field="身高"] .body-data-value');
                if (heightElement) {
                    heightElement.textContent = `${data.HV} cm`;
                }
            }
            
            if (data.WV && this.shadowRoot) {
                const weightElement = this.shadowRoot.querySelector('[data-field="體重"] .body-data-value');
                if (weightElement) {
                    weightElement.textContent = `${data.WV} kg`;
                }
            }
            
            if (data.CC && this.shadowRoot) {
                const bustElement = this.shadowRoot.querySelector('[data-field="胸圍"] .body-data-value');
                if (bustElement) {
                    // 使用與 demo.js 一致的顯示格式
                    let displayValue = '';
                    const currentValue = data.CC;
                    
                    // 獲取當前使用的單位（從 localStorage 讀取，預設為 cm）
                    const currentUnit = localStorage.getItem('chestMeasurementUnit') || 'cm';
                    
                    if (currentValue && currentValue.trim() !== '') {
                        if (currentValue.includes('_')) {
                            // 上下胸圍格式 (例如: "85_75")
                            const parts = currentValue.split('_');
                            displayValue = `上胸圍 ${parts[0]} ${currentUnit} / 下胸圍 ${parts[1]} ${currentUnit}`;
                        } else if (/^\d+(\.\d+)?$/.test(currentValue.trim())) {
                            // 純數字格式 (例如: "85")
                            displayValue = `${currentValue} ${currentUnit}`;
                        } else {
                            // 胸圍/罩杯格式 (例如: "32B")
                            displayValue = currentValue;
                        }
                    } else {
                        displayValue = '尚未提供';
                    }
                    
                    bustElement.textContent = displayValue;
                }
            }
            
            // 更新 BMI - 當身高或體重有變化時自動重新計算
            if (data.HV && data.WV) {
                const bmi = this.calculateBMI(data.HV, data.WV);
                const bmiStatus = this.getBMIStatus(bmi);
                const bmiElement = this.shadowRoot.querySelector('.bmi-value');
                const bmiStatusElement = this.shadowRoot.querySelector('.bmi-status');
                
                if (bmiElement) {
                    bmiElement.textContent = bmi;
                }
                if (bmiStatusElement) {
                    bmiStatusElement.textContent = bmiStatus;
                }
            } 
            
        } catch (error) {
            console.error('更新顯示數據失敗:', error);
        }
    }
    
    // 更新顯示的腳部數據
    updateDisplayedFootData(data) {
        try {
            if (data.FH && this.shadowRoot) {
                const footLengthElement = this.shadowRoot.querySelector('[data-field="腳長"] .body-data-value');
                if (footLengthElement) {
                    footLengthElement.textContent = `${data.FH} cm`;
                }
            }
            
            if (data.FW && this.shadowRoot) {
                const footWidthElement = this.shadowRoot.querySelector('[data-field="腳寬"] .body-data-value');
                if (footWidthElement) {
                    footWidthElement.textContent = `${data.FW} cm`;
                }
            }
            
            if (this.shadowRoot) {
                const rawFC = data.FCir;
                const fcNum = rawFC !== undefined && rawFC !== null ? parseFloat(rawFC) : NaN;
                const isValidFC = !!rawFC && !isNaN(fcNum) && fcNum >= 18.0 && fcNum <= 39.9 && Math.round(fcNum * 10) === fcNum * 10;
                const footCircumferenceElement = this.shadowRoot.querySelector('[data-field="腳圍"] .body-data-value');
                if (footCircumferenceElement) {
                    footCircumferenceElement.textContent = isValidFC ? `${rawFC} cm` : '未填寫';
                }
            }
            
        } catch (error) {
            console.error('更新腳部顯示數據失敗:', error);
        }
    }
    
    // 上傳本地資料到雲端
    async uploadLocalToCloud(localData, dataType, userInfo) {
        try {
            const accessToken = TokenManager.getAccessToken();
            if (!accessToken) {
                return;
            }
            
            // 在上傳前正規化 CC 欄位：若為 "null_null" 則改為空字串
            if (localData && typeof localData === 'object' && localData.CC === "null_null") {
                localData = { ...localData, CC: "" };
            }
            
            // 構造上傳資料
            const uploadData = this.constructUploadData(localData, dataType);
            const payload = {
                BodyData: uploadData,
                BodyData_ptr: dataType,
                update_bodydata: true,
                credential: accessToken,
                sub: userInfo.sub || userInfo.id,
                IDTYPE: 'Google'
            };
            
            const response = await fetch('https://api.inffits.com/inffits_account_register_and_retrieve_data/model?IDTYPE=Google', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            let finalResponse = response;
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token 過期，嘗試刷新
                    await TokenManager.refreshAccessToken();
                    const newAccessToken = TokenManager.getAccessToken();
                    payload.credential = newAccessToken;
                    
                    const retryResponse = await fetch('https://api.inffits.com/inffits_account_register_and_retrieve_data/model?IDTYPE=Google', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!retryResponse.ok) {
                        // throw new Error(`上傳資料失敗: ${retryResponse.status}`);
                        return;
                    }
                    finalResponse = retryResponse;
                } else {
                    throw new Error(`上傳資料失敗: ${response.status}`);
                }
            }
            
            // 處理API回應，更新本地的使用者資料
            const responseData = await finalResponse.json();
            
            
            if (responseData.BodyData) {
                // 更新本地的 userInfo
                if (this.userInfo) {
                    this.userInfo.BodyData = responseData.BodyData;
                    TokenManager.setUserInfo(this.userInfo);
                }
                
                // 根據 dataType 更新對應的本地存儲
                if (responseData.BodyData[dataType]) {
                    let localKey;
                    if (dataType === 'bodyM') {
                        localKey = 'BodyMID_size';
                    } else if (dataType === 'bodyF') {
                        localKey = 'BodyID_size';
                    } else if (dataType === 'shoesM' || dataType === 'shoesF') {
                        localKey = 'BodyID_Foot_size';
                    }
                    
                    if (localKey) {
                        if(localKey === 'BodyID_Foot_size') {
                            const currentShoesType =  `shoes${this.extractGenderFromUrl()}`;
                            if(dataType === currentShoesType){
                                localStorage.setItem(localKey, JSON.stringify(responseData.BodyData[dataType]));
                            }
                        }else{
                            localStorage.setItem(localKey, JSON.stringify(responseData.BodyData[dataType]));
                        }
                    }
                }
                
                return responseData.BodyData;
            }
            
            return null;
        } catch (error) {
            throw new Error(`上傳本地資料到雲端失敗: ${error.message}`);
        }
    }
    
    // 構造上傳資料
    constructUploadData(localData, dataType) {
        // 所有資料類型都使用 dataType 作為 key，與 BodyData_ptr 保持一致
            return {
                [dataType]: localData
            };
    }
    
    // 處理登入
    async handleLogin() {
        const currentUrl = utils.getCurrentUrl();
        
        // 決定 state 參數
        let stateParam;
        if (currentUrl.includes('iframe')) {
            stateParam =  localStorage.getItem('oauth_return_url')
        } else {
            // 否則使用當前頁面 URL
            stateParam = currentUrl;
        }
        
        // 構建 OAuth URL
        const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
        authUrl.searchParams.set('client_id', OAUTH_CONFIG.clientId);
        authUrl.searchParams.set('redirect_uri', OAUTH_CONFIG.redirectUri);
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('scope', OAUTH_CONFIG.scope);
        authUrl.searchParams.set('state', stateParam); // 使用決定的 state 參數
        authUrl.searchParams.set('access_type', 'offline'); // 🔑 關鍵：必須設定才能獲得 refresh_token
        authUrl.searchParams.set('prompt', 'consent'); // 🔑 關鍵：強制顯示授權頁面
        
        // 檢測是否為手機瀏覽器
        const isMobile = utils.isMobile();
        const isInIframe = window.parent !== window;
        
        // 手機瀏覽器或 iframe 環境的處理策略
        if (isMobile || isInIframe) {
            // 手機瀏覽器：嘗試使用彈窗，如果失敗則使用頁面跳轉
            if (isMobile && !isInIframe) {
                try {
                    // 嘗試開啟彈窗
                    const popup = this.openOAuthPopup(authUrl.toString());
                    if (popup) {
                        console.log('📱 手機瀏覽器：使用彈窗登入');
                        return; // 成功開啟彈窗，結束函數
                    }
                } catch (error) {
                    console.warn('⚠️ 彈窗被阻擋，改用頁面跳轉:', error);
                }
            }
            
            // 彈窗失敗或 iframe 環境：使用頁面跳轉
            if (isInIframe) {
                console.log('🖼️ iframe 環境：跳出 iframe 進行登入');
                window.top.location.href = authUrl.toString();
            } else {
                console.log('📱 手機瀏覽器：使用頁面跳轉登入');
                window.location.href = authUrl.toString();
            }
        } else {
            // 桌面瀏覽器：使用彈窗登入
            console.log('🖥️ 桌面瀏覽器：使用彈窗登入');
            const popup = this.openOAuthPopup(authUrl.toString());
            if (!popup) {
                console.warn('⚠️ 彈窗被阻擋，改用頁面跳轉');
                window.location.href = authUrl.toString();
            }
        }
    }
    
    // 開啟 OAuth 彈窗
    openOAuthPopup(url) {
        // 彈窗尺寸設定（針對不同設備優化）
        const isMobile = utils.isMobile();
        const width = isMobile ? Math.min(400, window.innerWidth * 0.9) : 500;
        const height = isMobile ? Math.min(600, window.innerHeight * 0.8) : 600;
        
        // 計算彈窗位置（居中顯示）
        const left = Math.round((window.innerWidth - width) / 2);
        const top = Math.round((window.innerHeight - height) / 2);
        
        // 彈窗特性設定
        const popupFeatures = [
            `width=${width}`,
            `height=${height}`,
            `left=${left}`,
            `top=${top}`,
            'scrollbars=yes',
            'resizable=yes',
            'toolbar=no',
            'menubar=no',
            'location=no',
            'status=no'
        ].join(',');
        
        try {
            // 開啟彈窗
            const popup = window.open(url, 'oauth-popup', popupFeatures);
            
            if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                // 彈窗被阻擋或開啟失敗
                this.showPopupBlockedMessage();
                return null;
            }
            
            // 監聽彈窗關閉和授權完成
            this.monitorOAuthPopup(popup);
            
            return popup;
        } catch (error) {
            console.error('❌ 開啟彈窗失敗:', error);
            this.showPopupBlockedMessage();
            return null;
        }
    }
    
    // 顯示彈窗被阻擋的提示訊息
    showPopupBlockedMessage() {
        // 檢查是否已經顯示過提示
        if (document.getElementById('popup-blocked-message')) {
            return;
        }
        
        const isMobile = utils.isMobile();
        const message = isMobile ? 
            '手機瀏覽器已自動使用頁面跳轉進行登入' : 
            '彈窗被瀏覽器阻擋，請允許彈窗或使用頁面跳轉登入';
        
        // 創建提示元素
        const messageDiv = document.createElement('div');
        messageDiv.id = 'popup-blocked-message';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 300px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        // 添加動畫樣式
        if (!document.getElementById('popup-message-styles')) {
            const style = document.createElement('style');
            style.id = 'popup-message-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        // 3秒後自動移除提示
        setTimeout(() => {
            if (messageDiv && messageDiv.parentNode) {
                messageDiv.style.animation = 'slideInRight 0.3s ease-out reverse';
                setTimeout(() => {
                    messageDiv.remove();
                }, 300);
            }
        }, 3000);
    }
    
    // 監聽 OAuth 彈窗狀態
    monitorOAuthPopup(popup) {
        const checkClosed = setInterval(() => {
            try {
                if (popup.closed) {
                    // 彈窗已關閉
                    clearInterval(checkClosed);
                    console.log('🔒 OAuth 彈窗已關閉');
                    
                    // 檢查是否有授權結果（可能需要延遲檢查）
                    setTimeout(() => {
                        this.checkOAuthResult();
                    }, 500);
                    return;
                }
                
                // 檢查彈窗 URL 是否包含授權結果
                try {
                    const popupUrl = popup.location.href;
                    if (popupUrl.includes('code=') || popupUrl.includes('error=')) {
                        // 授權完成，關閉彈窗
                        popup.close();
                        clearInterval(checkClosed);
                        
                        // 處理授權結果
                        this.handleOAuthCallback();
                    }
                } catch (e) {
                    // 跨域錯誤，忽略（彈窗還在 Google 域名）
                }
            } catch (error) {
                // 彈窗可能已關閉或發生錯誤
                clearInterval(checkClosed);
            }
        }, 1000); // 每秒檢查一次
        
        // 設定超時（5分鐘）
        setTimeout(() => {
            clearInterval(checkClosed);
            if (!popup.closed) {
                popup.close();
                console.warn('⏰ OAuth 彈窗超時關閉');
            }
        }, 300000);
    }
    
    // 檢查 OAuth 授權結果
    checkOAuthResult() {
        // 檢查 URL 參數
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (code || error) {
            console.log('✅ 檢測到 OAuth 授權結果');
            this.handleOAuthCallback();
        } else {
            console.log('ℹ️ 未檢測到 OAuth 授權結果');
        }
    }
    
    // 處理已登入用戶點擊
    async handleLoggedInUserClick() {
        try {
            const accessToken = TokenManager.getAccessToken();
            
            // 調用用戶資訊 API
            const response = await fetch("https://api.inffits.com/inffits_account_register_and_retrieve_data/model", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    credential: accessToken,
                    IDTYPE: "Google"
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                
                // 更新 userInfo 包含 BodyData
                if (data.BodyData) {
                    this.userInfo.BodyData = data.BodyData;
                    // 更新本地存儲
                    TokenManager.setUserInfo(this.userInfo);
                    
                    // 重新渲染模態框以顯示新的 BodyData
                    if (this.config && this.config.modalContainerId) {
                        const containerId = this.config.modalContainerId;
                        let targetContainer;
                        
                        if (containerId.includes(' ')) {
                            // CSS 選擇器（包含空格）
                            targetContainer = document.querySelector(containerId);
                        } else if (containerId.startsWith('#')) {
                            targetContainer = document.querySelector(containerId);
                        } else {
                            targetContainer = document.querySelector('#' + containerId);
                        }
                        
                        if (targetContainer) {
                            const modalContainer = targetContainer.querySelector('.inf-google-login-modal-container');
                            if (modalContainer) {
                                const modalContent = modalContainer.querySelector('.modal-content');
                                if (modalContent) {
                                    modalContent.innerHTML = this.renderUserInfoModal();
                                    this.setupModalEventListeners(targetContainer);
                                }
                            }
                        }
                    }
                }
            } else if (response.status === 401) {
                // Token 過期，自動刷新
                await TokenManager.refreshAccessToken(this.userInfo.sub);
                // 重新調用 API
                await this.handleLoggedInUserClick();
            }
        } catch (error) {
            this.dispatchEvent(new CustomEvent('infFITS:error', {
                detail: { error: error.message }
            }));
        }
    }
    
    // 處理登出
    async handleLogout() {
        TokenManager.clearAll();
        this.isLoggedIn = false;
        this.userInfo = null;
        
        // 根據配置決定關閉方式
        if (this.config && this.config.modalContainerId) {
            // 關閉容器內的模態框
            this.hideModalInContainer();
            // 重新渲染 avatar（因為原本內容已恢復）
            this.render();
            this.attachEventListeners();
        } else {
            // 關閉固定位置的 modal
        this.closeModal();
        this.render();
            this.attachEventListeners();
        }
        
        // 在 document 上觸發登出事件，確保所有組件都能接收到
        document.dispatchEvent(new CustomEvent('infFITS:logout'));
    }
    
    // 處理刪除帳號
    async handleDeleteAccount() {
        try {
            // 使用自定義確認彈窗
            const confirmed = await showCustomConfirm(
                '刪除帳號',
                '此操作無法復原，所有資料將被永久刪除。<br>確定要繼續嗎？',
                null, // onConfirm callback
                null  // onCancel callback
            );
            
            if (!confirmed) return;
            
            // 獲取存儲的憑證和用戶資訊
            const storedCredential = TokenManager.getAccessToken();
            const userInfo = this.userInfo;
            
            if (!storedCredential || !userInfo) {
                return;
            }
            
            const payload = {
                delete_user: true,
                credential: storedCredential,
                sub: userInfo.sub || userInfo.id,
                IDTYPE: "Google"
            };
            
            // 調用刪除帳號 API
            const response = await fetch("https://api.inffits.com/inffits_account_register_and_retrieve_data/model?IDTYPE=Google", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    // Token 過期，嘗試刷新
                    await TokenManager.refreshAccessToken(userInfo.sub);
                    // 重新調用刪除 API
                    const newCredential = TokenManager.getAccessToken();
                    payload.credential = newCredential;
                    
                    const retryResponse = await fetch("https://api.inffits.com/inffits_account_register_and_retrieve_data/model?IDTYPE=Google", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(payload)
                    });
                    
                    if (!retryResponse.ok) {
                        // throw new Error(`刪除帳號失敗: ${retryResponse.status} ${retryResponse.statusText}`);
                        return;
                    }
                } else {
                    throw new Error(`刪除帳號失敗: ${response.status} ${response.statusText}`);
                }
            }
            
            // 清除所有本地存儲的數據
            TokenManager.clearAll();
            this.isLoggedIn = false;
            this.userInfo = null;
            
            // 根據配置決定關閉方式
            if (this.config && this.config.modalContainerId) {
                // 關閉容器內的模態框
                this.hideModalInContainer();
                // 重新渲染 avatar（因為原本內容已恢復）
                this.render();
                this.attachEventListeners();
            } else {
                // 關閉固定位置的 modal
                this.closeModal();
                this.render();
                this.attachEventListeners();
            }
            
            // 觸發刪除帳號事件
            this.dispatchEvent(new CustomEvent('infFITS:deleteAccount'));
            
            // 顯示成功通知
            showNotification('帳號已成功刪除', 'success');
        } catch (error) {
            this.dispatchEvent(new CustomEvent('infFITS:error', {
                detail: { error: error.message, type: 'delete_account_failed' }
            }));
            // 顯示錯誤通知
            showNotification('刪除帳號時發生錯誤: ' + error.message, 'error');
        }
    }
    
    // 處理 OAuth 回調
    handleOAuthCallback() {
        const urlParams = utils.getUrlParams(window.location.href);
        
        if (urlParams.access_token) {
            const accessToken = urlParams.access_token;
            TokenManager.setAccessToken(accessToken);
            this.getUserInfoAndUpdate(accessToken, true);
            this.cleanupUrl();
        } else if (urlParams.error) {
            this.dispatchEvent(new CustomEvent('infFITS:error', {
                detail: { 
                    error: urlParams.error,
                    description: urlParams.error_description || '登入過程中發生錯誤'
                }
            }));
            this.cleanupUrl();
        }
    }
    
    // 獲取用戶資訊並更新狀態
    async getUserInfoAndUpdate(accessToken, isFirstLogin = false) {
        // 防止重複調用 - 使用全局標記
        if (window.infFITSUserInfoUpdating) {
            return;
        }
        
        window.infFITSUserInfoUpdating = true;
        
        try {
            const userInfo = await TokenManager.getUserInfoFromGoogle(accessToken);
            
            this.isLoggedIn = true;
            this.userInfo = userInfo;
            
            // 首次登入時，進行本地與雲端資料同步
            if (isFirstLogin) {
                const dataType = this.determineDataTypeFromIframeSrc();
                if (dataType) {
                    try {
                        const syncResult = await this.syncFirstLoginData(dataType, userInfo);
                        this.dispatchEvent(new CustomEvent('infFITS:firstLogin', {
                            detail: { 
                                userInfo: userInfo,
                                dataType: dataType,
                                iframeSrc: window.location.href,
                                syncResult: syncResult
                            }
                        }));
                    } catch (error) {
                        // showNotification('首次登入資料同步失敗: ' + error.message, 'error');
                        this.dispatchEvent(new CustomEvent('infFITS:firstLogin', {
                            detail: { 
                                userInfo: userInfo,
                                dataType: dataType,
                                iframeSrc: window.location.href,
                                syncResult: { action: 'sync_failed', error: error.message }
                            }
                        }));
                    }
                }
            }
            
            // 無論使用哪種模態框方式，都需要重新渲染 avatar
            this.render();
            this.attachEventListeners();
            
            // 如果是容器內模態框，還需要更新模態框內容
            if (this.config && this.config.modalContainerId) {
                const containerId = this.config.modalContainerId;
                let targetContainer;
                
                if (containerId.includes(' ')) {
                    // CSS 選擇器（包含空格）
                    targetContainer = document.querySelector(containerId);
                } else if (containerId.startsWith('#')) {
                    targetContainer = document.querySelector(containerId);
                } else {
                    targetContainer = document.querySelector('#' + containerId);
                }
                
                if (targetContainer) {
                    const modalContainer = targetContainer.querySelector('.inf-google-login-modal-container');
                    if (modalContainer) {
                        // 更新模態框內容為已登入狀態，保持樣式
                        const modalContent = modalContainer.querySelector('.modal-content');
                        if (modalContent) {
                            modalContent.innerHTML = this.renderUserInfoModal();
                            this.setupModalEventListeners(targetContainer);
                        }
                    }
                }
            }
            
            this.dispatchEvent(new CustomEvent('infFITS:login', {
                detail: userInfo
            }));
            
            // 觸發登入成功事件，用於檢查鞋子測量資料
            document.dispatchEvent(new CustomEvent('infFITS:loginSuccess', {
                detail: userInfo
            }));
            
        } catch (error) {
            TokenManager.clearAll();
            this.dispatchEvent(new CustomEvent('infFITS:error', {
                detail: { 
                    error: error.message,
                    type: 'user_info_fetch_failed'
                }
            }));
        } finally {
            // 重置更新標記
            window.infFITSUserInfoUpdating = false;
        }
    }
    
    // 清理 URL
    cleanupUrl() {
    try {
        const currentUrl = window.location.href;
        let newUrl = currentUrl;
        
        // 手動移除 OAuth 相關參數，避免 URLSearchParams 改變原始格式
        newUrl = newUrl.replace(/[?&]access_token=[^&]*/g, '');
        newUrl = newUrl.replace(/[?&]state=[^&]*/g, '');
        newUrl = newUrl.replace(/[?&]error=[^&]*/g, '');
        newUrl = newUrl.replace(/[?&]error_description=[^&]*/g, '');
        
        // 清理 hash 參數
        newUrl = newUrl.split('#')[0];
        
        // 修復可能的雙重問號或和號
        newUrl = newUrl.replace(/\?\?+/g, '?');
        newUrl = newUrl.replace(/&&+/g, '&');
        newUrl = newUrl.replace(/\?&/g, '?');
        newUrl = newUrl.replace(/&$/g, '');
        newUrl = newUrl.replace(/\?$/g, '');
        
        // 修復可能的 = 符號問題
        newUrl = newUrl.replace(/==/g, '=');
        
        window.history.replaceState({}, document.title, newUrl);
    } catch (error) {
        console.error('清理 URL 失敗:', error);
    }
    }
    
    // 應用配置樣式
    applyConfig(config) {
        this.config = config;
        this.updateAvatarStyle();
    }
    
    // 更新 Avatar 樣式
    updateAvatarStyle() {
        if (this.avatarElement && this.config) {
            const isMobile = utils.isMobile();
            const avatarStyle = utils.getResponsiveStyle(this.config.avatarStyle, isMobile);
            
            Object.assign(this.avatarElement.style, avatarStyle);
        }
    }
    
    // 公共方法
    login() {
        this.handleLogin();
    }
    
    logout() {
        this.handleLogout();
    }
    
    getUserInfo() {
        return this.userInfo;
    }
    
    isUserLoggedIn() {
        return this.isLoggedIn;
    }
}

// 全局 OAuth 回調處理器
function handleGlobalOAuthCallback() {
    // 檢查 URL 查詢參數
    const urlParams = new URLSearchParams(window.location.search);
    const urlHash = window.location.hash;
    
    let accessToken = urlParams.get('access_token');
    let state = urlParams.get('state');
    let error = urlParams.get('error');
    let errorDescription = urlParams.get('error_description');
    
    // 檢查 hash 參數（手機上可能使用 hash）
    if (urlHash.includes('access_token=')) {
        const hashParams = new URLSearchParams(urlHash.substring(1));
        accessToken = hashParams.get('access_token');
        state = hashParams.get('state') || state;
        error = hashParams.get('error') || error;
        errorDescription = hashParams.get('error_description') || errorDescription;
    }
    
    if (accessToken) {
        document.dispatchEvent(new CustomEvent('infFITS:oauth-callback', {
            detail: {
                access_token: accessToken,
                state: state,
                error: error,
                error_description: errorDescription
            }
        }));
    } else if (error) {
        document.dispatchEvent(new CustomEvent('infFITS:oauth-callback', {
            detail: {
                access_token: null,
                state: state,
                error: error,
                error_description: errorDescription
            }
        }));
    }
}

// 處理 iframe 中的 OAuth 回調
function handleIframeOAuthCallback() {
    // 檢查是否在 iframe 中
    if (window.parent !== window) {
        // 在 iframe 中，檢查父窗口的 URL 參數
        try {
            const parentUrl = window.parent.location.href;
            const urlParams = new URLSearchParams(new URL(parentUrl).search);
            const urlHash = new URL(parentUrl).hash;
            
            let accessToken = urlParams.get('access_token');
            let state = urlParams.get('state');
            let error = urlParams.get('error');
            let errorDescription = urlParams.get('error_description');
            
            // 檢查 hash 參數
            if (urlHash.includes('access_token=')) {
                const hashParams = new URLSearchParams(urlHash.substring(1));
                accessToken = hashParams.get('access_token');
                state = hashParams.get('state') || state;
                error = hashParams.get('error') || error;
                errorDescription = hashParams.get('error_description') || errorDescription;
            }
            
            if (accessToken || error) {
                document.dispatchEvent(new CustomEvent('infFITS:oauth-callback', {
                    detail: {
                        access_token: accessToken,
                        state: state,
                        error: error,
                        error_description: errorDescription
                    }
                }));
            }
        } catch (e) {
            // 跨域限制，無法訪問父窗口 URL
            handleGlobalOAuthCallback();
        }
    } else {
        // 不在 iframe 中，使用標準處理
        handleGlobalOAuthCallback();
    }
}

    // 綁定編輯欄位處理函數
    function bindEditFieldHandler() {
        // 全域編輯欄位處理函數 - 確保每次組件創建時都重新綁定
        window.editFieldHandler = function(fieldLabel, fieldContainer) {
        // 方法1: 嘗試從當前元素往上找 inf-google-login 組件
        let component = fieldContainer.closest('inf-google-login');
        
        // 方法2: 如果找不到，嘗試在整個文檔中找到 inf-google-login 組件
        if (!component) {
            const allComponents = document.querySelectorAll('inf-google-login');
            
            // 找到包含當前欄位的組件
            for (let comp of allComponents) {
                if (comp.shadowRoot && comp.shadowRoot.contains(fieldContainer)) {
                    component = comp;
                    break;
                }
            }
            
            // 如果還是找不到，使用第一個可用的組件
            if (!component && allComponents.length > 0) {
                component = allComponents[0];
            }
        }
        
        if (component && typeof component.editField === 'function') {
            // 找到編輯圖標
            const editIcon = fieldContainer.querySelector('.edit-icon');
            if (editIcon) {
                component.editField(fieldLabel, editIcon);
            } else {
                console.error('找不到編輯圖標');
            }
        } else {
            console.error('找不到 inf-google-login 組件或 editField 方法');
        }
    };
}

// 動態監聽 DOM 變化並創建組件
function initDynamicComponentListener(type) {
    // 使用 MutationObserver 監聽 DOM 變化
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                // 檢查新增的節點
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // 根據類型檢查對應的容器
                        // 前三個配置（intro-content-simple, intro-content-advanced, #container-container-recom-header）是 product
                        // 後兩個配置（header_BF, SB_Prod_cart）是 size
                        const typeConfigs = type === 'product' ? configs.slice(0, 3) : configs.slice(3);
                        
                        typeConfigs.forEach((config) => {
                            const containerId = config.avatarContainerId;
                            let targetContainer = null;
                            
                            // 檢查新增的節點是否包含目標容器
                            if (containerId.includes(' ')) {
                                // CSS 選擇器（包含空格）
                                targetContainer = node.querySelector ? node.querySelector(containerId) : null;
                            } else if (containerId.startsWith('#')) {
                                targetContainer = node.querySelector ? node.querySelector(containerId) : null;
                            } else {
                                // 檢查節點本身或子節點是否匹配
                                if (node.id === containerId) {
                                    targetContainer = node;
                                } else {
                                    targetContainer = node.querySelector ? node.querySelector('#' + containerId) : null;
                                }
                            }
                            
                            // 如果找到容器，創建組件
                            if (targetContainer) {
                                createComponentInContainer(targetContainer, config);
                                // 重新綁定 editFieldHandler
                                bindEditFieldHandler();
                            }
                        });
                    }
                });
                
                // 檢查整個文檔中是否已經存在容器
                // 前三個配置（intro-content-simple, intro-content-advanced, #container-container-recom-header）是 product
                // 後兩個配置（header_BF, SB_Prod_cart）是 size
                const typeConfigs = type === 'product' ? configs.slice(0, 3) : configs.slice(3);
                typeConfigs.forEach((config) => {
                    const containerId = config.avatarContainerId;
                    let existingContainer = null;
                    
                    if (containerId.includes(' ')) {
                        // CSS 選擇器（包含空格）
                        existingContainer = document.querySelector(containerId);
                    } else if (containerId.startsWith('#')) {
                        existingContainer = document.querySelector(containerId);
                    } else {
                        existingContainer = document.querySelector('#' + containerId);
                    }
                    
                    if (existingContainer && !existingContainer.querySelector('inf-google-login')) {
                        createComponentInContainer(existingContainer, config);
                        // 重新綁定 editFieldHandler
                        bindEditFieldHandler();
                    }
                });
            }
        });
    });
    
    // 開始監聽
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    
    return observer;
}

// 在指定容器中創建組件
function createComponentInContainer(container, config) {
    // 清理已存在的 Google 登入組件
    const existingComponents = container.querySelectorAll('inf-google-login');
    existingComponents.forEach(component => {
        component.remove();
    });

    // 創建新組件
    const component = document.createElement('inf-google-login');
    component.applyConfig(config);
    
    // 確保容器有 position: relative 設定，這樣 absolute 定位的 avatar 才能正確定位
    if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
    }
    
    container.appendChild(component);
}

// 創建組件工廠函數
function createGoogleLoginComponentsByType(type) {
    // 載入 Google Fonts
    loadGoogleFonts();
    
    // 註冊自定義元素
    if (!customElements.get('inf-google-login')) {
        customElements.define('inf-google-login', InfGoogleLoginComponent);
    }
    
    // 初始綁定
    bindEditFieldHandler();
    
    // 根據類型創建組件
    // 前三個配置（intro-content-simple, intro-content-advanced, #container-container-recom-header）是 product
    // 後兩個配置（header_BF, SB_Prod_cart）是 size
    const typeConfigs = type === 'product' ? configs.slice(0, 3) : configs.slice(3);
    
    typeConfigs.forEach((config, index) => {
        const {
            avatarContainerId,
            modalContainerId,
            avatarStyle,
            modalContainerStyle
        } = config;

        // 處理選擇器（支援 ID 和 CSS 選擇器）
        let containers;
        if (avatarContainerId.includes(' ')) {
            // 如果是 CSS 選擇器（包含空格），使用 querySelectorAll
            containers = document.querySelectorAll(avatarContainerId);
        } else if (avatarContainerId.startsWith('#')) {
            // 如果是 ID 選擇器，使用 querySelectorAll（處理重複 ID）
            containers = document.querySelectorAll(avatarContainerId);
        } else {
            // 如果是純 ID，使用 querySelectorAll 來處理重複 ID
            containers = document.querySelectorAll('#' + avatarContainerId);
        }

        containers.forEach(container => {
            createComponentInContainer(container, config);
            // 重新綁定 editFieldHandler
            bindEditFieldHandler();
        });
    });
    
    // 檢查 OAuth 回調
    handleIframeOAuthCallback();
}

// 等待 iframe 載入完成後初始化動態監聽
function initGoogleLoginWithDynamicListener(type) {
    // 等待 iframe 載入完成
    function waitForIframeLoad() {
        return new Promise((resolve) => {
            if (window.parent !== window) {
                // 在 iframe 中
                if (document.readyState === 'complete') {
                    resolve();
                } else {
                    window.addEventListener('load', resolve);
                }
            } else {
                // 不在 iframe 中，等待 DOM 載入完成
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', resolve);
                } else {
                    resolve();
                }
            }
        });
    }
    
    waitForIframeLoad().then(() => {
        // 先嘗試立即創建組件
        createGoogleLoginComponentsByType(type);
        
        // 然後啟動動態監聽
        initDynamicComponentListener(type);
    });
}

// AWS Lambda 錯誤處理機制
class AWSLambdaErrorHandler {
    static init() {
        // 設置 AWS Lambda 錯誤監聽器
        window.addEventListener('error', function(event) {
            if (event.error && event.error.message && event.error.message.includes('DP_CODE')) {
                AWSLambdaErrorHandler.handleError();
            }
        });
        
        // 監聽未處理的 Promise 錯誤
        window.addEventListener('unhandledrejection', function(event) {
            if (event.reason && event.reason.message && event.reason.message.includes('DP_CODE')) {
                AWSLambdaErrorHandler.handleError();
            }
        });
        
        // 監聽 console.error 中的 DP_CODE 錯誤
        const originalConsoleError = console.error;
        console.error = function(...args) {
            const errorString = args.join(' ');
            if (errorString.includes('DP_CODE')) {
                AWSLambdaErrorHandler.handleError();
            }
            // 調用原始方法
            originalConsoleError.apply(console, args);
        };
        
        // 監聽網絡錯誤（AWS Lambda 400 錯誤）
        window.addEventListener('load', function() {
            const originalXHROpen = XMLHttpRequest.prototype.open;
            const originalXHRSend = XMLHttpRequest.prototype.send;
            
            XMLHttpRequest.prototype.open = function(method, url, ...args) {
                this._url = url;
                return originalXHROpen.apply(this, [method, url, ...args]);
            };
            
            XMLHttpRequest.prototype.send = function(...args) {
                this.addEventListener('error', function() {
                    if (this._url && this._url.includes('lambda.ap-northeast-1.amazonaws.com')) {
                        AWSLambdaErrorHandler.handleError();
                    }
                });
                
                this.addEventListener('load', function() {
                    if (this.status >= 400 && this._url && this._url.includes('lambda.ap-northeast-1.amazonaws.com')) {
                        AWSLambdaErrorHandler.handleError();
                    }
                });
                
                return originalXHRSend.apply(this, args);
            };
        });
    }
    
    static handleError() {
        // 找到 inf-google-login 組件並調用錯誤處理方法
        const infGoogleLoginElement = document.querySelector('inf-google-login');
        if (infGoogleLoginElement && infGoogleLoginElement.handleAWSLambdaError) {
            infGoogleLoginElement.handleAWSLambdaError();
        } else {
            // 如果找不到組件，根據性別判斷要清除的資料
            AWSLambdaErrorHandler.clearDataByGender();
        }
    }
    
    static clearDataByGender() {
        // 從 URL 解析性別
        const urlParams = new URLSearchParams(window.location.search);
        const searchParams = window.location.search.substring(1);
        const firstParam = searchParams.split('&')[0];
        
        if (firstParam === 'M') {
            localStorage.removeItem('BodyMID_size');
        } else {
            localStorage.removeItem('BodyID_size');
        }
        
        setTimeout(() => {
            window.location.reload();
        }, 2000);
    }
}

// 導出函數供外部使用
window.createGoogleLoginComponentsByType = createGoogleLoginComponentsByType;
window.initGoogleLoginWithDynamicListener = initGoogleLoginWithDynamicListener;
window.InfGoogleLoginComponent = InfGoogleLoginComponent;
window.AWSLambdaErrorHandler = AWSLambdaErrorHandler;

// 立即檢查 OAuth 回調（腳本載入時就執行，適用於手機）
(function() {
    // 檢查 URL 中是否有 OAuth 參數
    const hasOAuthParams = window.location.search.includes('access_token') || 
                          window.location.search.includes('error') ||
                          window.location.hash.includes('access_token') ||
                          window.location.hash.includes('error');
    
    if (hasOAuthParams) {
        // 等待 DOM 載入完成後觸發事件
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                handleIframeOAuthCallback();
            });
        } else {
            // DOM 已經載入完成，立即觸發事件
            handleIframeOAuthCallback();
        }
    }
    
    // 初始化 AWS Lambda 錯誤處理器
    AWSLambdaErrorHandler.init();
    
    // 監聽來自 parent window 的跨域登入訊息（支援跨域）
    let loginProcessed = false; // 防止重複處理
    
    window.addEventListener("message", async function(event) {
        if (event.data && event.data.MsgHeader === "OAuth_Login_Success") {
            const accessToken = event.data.access_token;
            const userInfo = event.data.userInfo;
            const timestamp = event.data.timestamp;
            
            if (!accessToken) {
                console.error('❌ 沒有收到 access_token');
                return;
            }
            
            // 防止重複處理同一個登入訊息
            if (loginProcessed) {
                console.log('⏭️ 登入已處理，跳過重複訊息');
                return;
            }
            
            console.log('📥 收到跨域登入訊息，timestamp:', timestamp);
            loginProcessed = true;
            
            // 立即發送確認訊息給 parent
            if (window.parent && window.parent !== window) {
                window.parent.postMessage({
                    MsgHeader: 'OAuth_Login_Confirmed',
                    timestamp: timestamp,
                    confirmed_at: Date.now()
                }, '*');
                console.log('✅ 已發送登入確認訊息給 parent');
            }
            
            // 保存 access_token 和 userInfo 到 localStorage
            TokenManager.setAccessToken(accessToken);
            if (userInfo) {
                TokenManager.setUserInfo(userInfo);
            }
            
            console.log('✅ 已保存 access_token 和 userInfo');
            
            // ✅ 重要：調用 API 註冊並獲取 inf_id（iframe 自己完成）
            try {
                console.log('🔄 正在註冊 infFITS 帳號並獲取 inf_id...');
                const registerResponse = await fetch('https://api.inffits.com/inffits_account_register_and_retrieve_data/model', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        IDTYPE: "Google",
                        sub: userInfo.id || userInfo.sub,
                        refresh_token_proc: "1"
                    })
                });
                
                const registerData = await registerResponse.json();
                console.log('📦 API 回應:', registerData);
                
                // ✅ 注意：API 回傳的是 INF_ID（大寫），不是 inf_id（小寫）
                if (registerData.INF_ID) {
                    TokenManager.setInfId(registerData.INF_ID);
                    console.log('✅ 已獲取並保存 inf_id:', registerData.INF_ID);
                } else {
                    console.warn('⚠️ 未能獲取 inf_id，API 回應:', registerData);
                }
            } catch (error) {
                console.error('❌ 註冊 infFITS 帳號失敗:', error);
            }
            
            // 觸發登入成功事件（這會同步所有組件狀態）
            document.dispatchEvent(new CustomEvent('infFITS:loginSuccess', {
                detail: userInfo || {}
            }));
            
            // 找到所有 inf-google-login 組件並更新它們
            setTimeout(async () => {
                const components = document.querySelectorAll('inf-google-login');
                console.log(`🔄 找到 ${components.length} 個組件，開始更新`);
                
                // 找到第一個組件來執行資料同步（避免重複同步）
                let dataSynced = false;
                
                for (let index = 0; index < components.length; index++) {
                    const component = components[index];
                    try {
                        // 更新組件的內部狀態
                        component.isLoggedIn = true;
                        component.userInfo = userInfo;
                        
                        // ✅ 重要：首次登入時進行雲端與本地資料同步（只執行一次）
                        if (!dataSynced && typeof component.syncFirstLoginData === 'function') {
                            const dataType = component.determineDataTypeFromIframeSrc();
                            if (dataType) {
                                try {
                                    console.log(`🔄 開始雲端與本地資料同步 (${dataType})...`);
                                    const syncResult = await component.syncFirstLoginData(dataType, userInfo);
                                    console.log('✅ 資料同步完成:', syncResult);
                                    dataSynced = true;
                                    
                                    // 觸發首次登入事件
                                    document.dispatchEvent(new CustomEvent('infFITS:firstLogin', {
                                        detail: { 
                                            userInfo: userInfo,
                                            dataType: dataType,
                                            iframeSrc: window.location.href,
                                            syncResult: syncResult
                                        }
                                    }));
                                } catch (error) {
                                    console.error('❌ 資料同步失敗:', error);
                                    dataSynced = true; // 標記為已嘗試，避免重複
                                }
                            }
                        }
                        
                        // 重新檢查登入狀態
                        if (typeof component.checkLoginStatus === 'function') {
                            component.checkLoginStatus();
                        }
                        
                        // 重新渲染 UI
                        if (typeof component.render === 'function') {
                            component.render();
                        }
                        
                        // 重新綁定事件
                        if (typeof component.attachEventListeners === 'function') {
                            component.attachEventListeners();
                        }
                        
                        console.log(`✅ 組件 ${index + 1} 更新完成`);
                    } catch (error) {
                        console.error(`❌ 更新組件 ${index + 1} 失敗:`, error);
                    }
                }
                
                console.log('✅ 所有組件更新完成（跨域登入）');
                
                // ✅ 通知 parent 可以點擊 #panelTagBtn 了（iframe 已準備好）
                if (window.parent && window.parent !== window) {
                    window.parent.postMessage({
                        MsgHeader: 'infFITS_Iframe_Ready',
                        timestamp: Date.now()
                    }, '*');
                    console.log('📤 已通知 parent iframe 已準備好');
                }
            }, 300);
        }
    });
})();

// 全域自定義確認彈窗函數
function showCustomConfirm(title, message, onConfirm, onCancel) {
    return new Promise((resolve) => {
        // 檢查是否已經存在確認彈窗，如果存在則先移除
        const existingOverlay = document.getElementById('custom-confirm-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        
        // 創建遮罩層
        const overlay = document.createElement('div');
        overlay.className = 'custom-confirm-overlay';
        overlay.id = 'custom-confirm-overlay';

        // 創建彈窗內容
        overlay.innerHTML = `
            <div class="custom-confirm-modal">
                <div class="custom-confirm-header">
                    <h3 class="custom-confirm-title">${title}</h3>
                </div>
                <div class="custom-confirm-content">
                    <p class="custom-confirm-message">${message}</p>
                    <div class="custom-confirm-actions">
                        <button class="custom-confirm-btn cancel" id="confirm-cancel-btn">取消</button>
                        <button class="custom-confirm-btn confirm" id="confirm-confirm-btn">確認</button>
                    </div>
                </div>
            </div>
        `;

        // 添加到頁面
        document.body.appendChild(overlay);

        // 顯示動畫
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);

        // 綁定事件
        const cancelBtn = overlay.querySelector('#confirm-cancel-btn');
        const confirmBtn = overlay.querySelector('#confirm-confirm-btn');

        const closeModal = (result) => {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                resolve(result);
            }, 300);
        };

        // 取消按鈕
        cancelBtn.addEventListener('click', () => {
            if (onCancel) onCancel();
            closeModal(false);
        });

        // 確認按鈕
        confirmBtn.addEventListener('click', () => {
            if (onConfirm) onConfirm();
            closeModal(true);
        });

        // 點擊遮罩層關閉
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                if (onCancel) onCancel();
                closeModal(false);
            }
        });

        // ESC 鍵關閉
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                if (onCancel) onCancel();
                closeModal(false);
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    });
}

// 全域自定義通知函數
function showNotification(message, type = 'info') {
    // 移除現有的通知
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    const bgColor = type === 'success' ? '#333' : type === 'error' ? '#EF4444' : '#333';
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${bgColor};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;

    document.body.appendChild(notification);

    // 顯示動畫
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // 自動隱藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 全域資料版本選擇對話框函數
async function showDataVersionDialog(targetUserType, localData, cloudData) {
    return new Promise((resolve) => {
        // 檢查是否已經有對話框正在顯示
        const existingOverlay = document.getElementById('data-version-overlay');
        if (existingOverlay) {
            resolve('cancel');
            return;
        }

        // 創建遮罩層
        const overlay = document.createElement('div');
        overlay.className = 'custom-confirm-overlay';
        overlay.id = 'data-version-overlay';

        // 添加專用的 CSS 樣式，確保不影響頁面其他元素
        const style = document.createElement('style');
        style.id = 'data-version-dialog-styles';
        style.textContent = `
            * {
                box-sizing: border-box;
            }
            
            #data-version-overlay {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                background: rgba(0, 0, 0, 0.5) !important;
                display: flex !important;
                justify-content: center !important;
                align-items: center !important;
                z-index: 10000 !important;
                opacity: 0 !important;
                transition: opacity 0.3s ease !important;
                pointer-events: auto !important;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            }
            
            #data-version-overlay.show {
                opacity: 1 !important;
            }
            
            #data-version-overlay * {
                box-sizing: border-box !important;
            }
            
            #data-version-overlay .custom-confirm-modal {
                background: white !important;
                border-radius: 12px !important;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3) !important;
                max-width: 500px !important;
                width: 90% !important;
                max-height: 90vh !important;
                overflow-y: auto !important;
                position: relative !important;
                margin: 0 !important;
            }
            
            #data-version-overlay .custom-confirm-header {
                padding: 20px !important;
                border-bottom: 1px solid #e5e7eb !important;
                text-align: center !important;
            }
            
            #data-version-overlay .custom-confirm-title {
                margin: 0 !important;
                font-size: 18px !important;
                font-weight: 600 !important;
                color: #1f2937 !important;
                font-family: inherit !important;
            }
            
            #data-version-overlay .custom-confirm-content {
                padding: 20px !important;
            }
            
            #data-version-overlay .custom-confirm-message {
                margin: 0 0 20px 0 !important;
                text-align: center !important;
                color: #6b7280 !important;
                font-size: 14px !important;
                line-height: 1.5 !important;
                font-family: inherit !important;
            }
            
            #data-version-overlay .data-comparison {
                display: flex !important;
                gap: 15px !important;
                margin: 20px 0 !important;
            }
            
            #data-version-overlay .data-card {
                flex: 1 !important;
                min-width: 0 !important;
                padding: 15px !important;
                border: 2px solid #e5e7eb !important;
                border-radius: 8px !important;
                background: #f5f5f5 !important;
                position: relative !important;
                overflow: hidden !important;
                cursor: pointer !important;
                transition: all 0.2s ease !important;
            }
            
            #data-version-overlay .data-card:hover {
                border-color: #111111 !important;
                background: #ffffff !important;
                transform: none !important;
                box-shadow: 0 2px 0 rgba(0, 0, 0, 0.05) !important;
            }
            
            #data-version-overlay .data-card.selected {
                border-color: #111111 !important;
                background: #ffffff !important;
                box-shadow: 0 2px 0 rgba(0, 0, 0, 0.05) !important;
            }
            
            #data-version-overlay .data-card.selected::after {
                content: '✓' !important;
                position: absolute !important;
                top: 10px !important;
                right: 10px !important;
                width: 24px !important;
                height: 24px !important;
                border-radius: 9999px !important;
                background: #111111 !important;
                color: #ffffff !important;
                font-size: 14px !important;
                line-height: 24px !important;
                text-align: center !important;
                box-shadow: 0 0 0 2px #ffffff !important;
            }
            
            #data-version-overlay .data-card.selected:hover {
                transform: none !important;
            }
            
            #data-version-overlay .data-card p {
                margin: 0 0 10px 0 !important;
                color: #9ca3af !important;
                font-size: 14px !important;
                font-weight: 600 !important;
                font-family: inherit !important;
                line-height: 1.2 !important;
            }
            
            #data-version-overlay .data-card.selected p {
                color: #111827 !important;
            }
            
            #data-version-overlay .data-info {
                font-family: inherit !important;
            }
            
            #data-version-overlay .data-info div {
                margin: 0 0 4px 0 !important;
                padding: 0 !important;
                font-size: 12px !important;
                color: #9ca3af !important;
                line-height: 1.4 !important;
                border: none !important;
                background: none !important;
                width: 100% !important;
                white-space: nowrap !important;
                overflow: hidden !important;
                text-overflow: ellipsis !important;
            }
            
            #data-version-overlay .data-card.selected .data-info div {
                color: #111827 !important;
            }
            
            #data-version-overlay .data-info div:last-child {
                margin-bottom: 0 !important;
            }
            
            #data-version-overlay .custom-confirm-actions {
                display: flex !important;
                gap: 10px !important;
                justify-content: center !important;
                margin-top: 20px !important;
                flex-wrap: wrap !important;
            }
            
            #data-version-overlay .custom-confirm-btn {
                border: none !important;
                padding: 10px 20px !important;
                border-radius: 6px !important;
                cursor: pointer !important;
                font-weight: 500 !important;
                font-size: 14px !important;
                font-family: inherit !important;
                min-width: 100px !important;
                transition: all 0.2s ease !important;
                outline: none !important;
                text-decoration: none !important;
            }
            
            #data-version-overlay .custom-confirm-btn:hover {
                opacity: 0.9 !important;
            }
            
            @media (max-width: 480px) {
                #data-version-overlay .data-comparison {
                    flex-direction: column !important;
                    gap: 15px !important;
                }
                
                #data-version-overlay .custom-confirm-actions {
                    flex-direction: column !important;
                }
                
                #data-version-overlay .custom-confirm-btn {
                    width: 100% !important;
                    min-width: auto !important;
                }
            }
        `;
        
        // 先移除舊的樣式（如果存在）
        const existingStyle = document.getElementById('data-version-dialog-styles');
        if (existingStyle) {
            existingStyle.remove();
        }
        
        document.head.appendChild(style);

        // 根據使用者類型生成相應的資料顯示內容
        let cloudDataHtml = '';
        let localDataHtml = '';
        let dataTypeTitle = '';
        
        if (targetUserType === 'shoesF' || targetUserType === 'shoesM') {
            // 腳部資料
            dataTypeTitle = '腳部尺寸';
            cloudDataHtml = `
                <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">腳部尺寸</div>
                <div>腳長：${cloudData.footLength || cloudData.FH || 'N/A'}</div>
                <div>腳寬：${cloudData.footWidth || cloudData.FW || 'N/A'}</div>
                <div>腳圍：${cloudData.footCircumference || cloudData.FCir || '未填寫'}</div>
                <div>性別：${targetUserType.includes('M')? '男': '女'}</div>
            `;
            localDataHtml = `
                <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">腳部尺寸</div>
                <div>腳長：${localData.footLength || localData.FH || 'N/A'}</div>
                <div>腳寬：${localData.footWidth || localData.FW || 'N/A'}</div>
                <div>腳圍：${localData.footCircumference || localData.FCir || '未填寫'}</div>
                <div>性別：${targetUserType.includes('M')? '男': '女'}</div>
            `;
        } else if (targetUserType === 'bodyF' || targetUserType === 'bodyM') {
            // 身體資料
            dataTypeTitle = '身體尺寸';
            const isFemale = targetUserType.includes('F');
            const genderText = targetUserType.includes('M') ? '男' : '女';
            
            // 只有女性才顯示胸圍欄位，並格式化顯示
            const formatChestDisplay = (data) => {
                const chestValue = data.cc || data.CC;
                if (!chestValue || chestValue.trim() === '') return 'N/A';
                
                // 獲取當前使用的單位（從 localStorage 讀取，預設為 cm）
                const currentUnit = localStorage.getItem('chestMeasurementUnit') || 'cm';
                
                if (chestValue.includes('_')) {
                    // 上下胸圍格式 (例如: "66_60.5")
                    const parts = chestValue.split('_');
                    return `上胸圍 ${parts[0]} ${currentUnit} / 下胸圍 ${parts[1]} ${currentUnit}`;
                } else if (/^\d+(\.\d+)?$/.test(chestValue.trim())) {
                    // 純數字格式 (例如: "85")
                    return `${chestValue} ${currentUnit}`;
                } else {
                    // 胸圍/罩杯格式 (例如: "48D")
                    return chestValue;
                }
            };
            
            const chestRow = isFemale ? `<div>胸圍：${formatChestDisplay(cloudData)}</div>` : '';
            const localChestRow = isFemale ? `<div>胸圍：${formatChestDisplay(localData)}</div>` : '';
            
            cloudDataHtml = `
                <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">身體尺寸</div>
                <div>身高：${cloudData.height || cloudData.HV || 'N/A'}</div>
                <div>體重：${cloudData.weight || cloudData.WV || 'N/A'}</div>
                <div>性別：${genderText}</div>
                ${chestRow}
            `;
            localDataHtml = `
                <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">身體尺寸</div>
                <div>身高：${localData.height || localData.HV || 'N/A'}</div>
                <div>體重：${localData.weight || localData.WV || 'N/A'}</div>
                <div>性別：${genderText}</div>
                ${localChestRow}
            `;
        }

        // 創建彈窗內容
        overlay.innerHTML = `
            <div class="custom-confirm-modal">
                <div class="custom-confirm-header">
                    <h3 class="custom-confirm-title">選擇要使用的${dataTypeTitle}版本</h3>
                </div>
                <div class="custom-confirm-content">
                    <p class="custom-confirm-message">發現本地和雲端都有${dataTypeTitle}資料，請選擇要使用哪個版本：</p>
                    
                    <div class="data-comparison">
                        <div class="data-card selected" id="cloud-data-card">
                            <p>☁️ 雲端資料</p>
                            <div class="data-info">
                                ${cloudDataHtml}
                            </div>
                        </div>
                        
                        <div class="data-card" id="local-data-card">
                            <p>📱 本地資料</p>
                            <div class="data-info">
                                ${localDataHtml}
                            </div>
                        </div>
                    </div>
                    
                    <div class="custom-confirm-actions">
                        <button class="custom-confirm-btn" id="confirm-btn" style="background: #333; color: white;">確定</button>
                    </div>
                </div>
            </div>
        `;

        // 添加到頁面
        document.body.appendChild(overlay);

        // 顯示動畫
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);

        // 關閉函數
        const closeModal = (result) => {
            overlay.classList.remove('show');
            setTimeout(() => {
                if (overlay.parentNode) {
                    overlay.parentNode.removeChild(overlay);
                }
                // 移除樣式
                const dialogStyle = document.getElementById('data-version-dialog-styles');
                if (dialogStyle) {
                    dialogStyle.remove();
                }
                resolve(result);
            }, 200);
        };

        // 卡片選擇邏輯
        let selectedData = 'cloud'; // 預設選擇雲端資料
        const cloudCard = overlay.querySelector('#cloud-data-card');
        const localCard = overlay.querySelector('#local-data-card');

        const selectCard = (card, dataType) => {
            // 移除所有卡片的選中狀態
            cloudCard.classList.remove('selected');
            localCard.classList.remove('selected');
            
            // 設置選中卡片的樣式
            card.classList.add('selected');
            
            selectedData = dataType;
        };

        // 綁定卡片點擊事件
        cloudCard.addEventListener('click', () => selectCard(cloudCard, 'cloud'));
        localCard.addEventListener('click', () => selectCard(localCard, 'local'));

        // 按鈕事件
        const confirmBtn = overlay.querySelector('#confirm-btn');

        confirmBtn.addEventListener('click', () => {
            closeModal(selectedData);
        });

        // 點擊遮罩層關閉
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeModal('cancel');
            }
        });

        // ESC 鍵關閉
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                document.removeEventListener('keydown', handleEsc);
                closeModal('cancel');
            }
        };
        document.addEventListener('keydown', handleEsc);
    });
}
