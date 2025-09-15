class BackendTester {
    constructor() {
        this.springUrl = '';
        this.pythonUrl = '';
        this.init();
    }

    init() {
        // DOM 요소 참조
        this.statusDot = document.getElementById('status-dot');
        this.statusText = document.getElementById('status-text');
        this.springUrlInput = document.getElementById('spring-url');
        this.pythonUrlInput = document.getElementById('python-url');
        this.springStatus = document.getElementById('spring-status');
        this.pythonStatus = document.getElementById('python-status');
        this.lastRequest = document.getElementById('last-request');
        this.responseTime = document.getElementById('response-time');
        this.statusCode = document.getElementById('status-code');
        this.responseData = document.getElementById('response-data');
        this.logsContainer = document.getElementById('logs-container');
        this.testLat = document.getElementById('test-lat');
        this.testLon = document.getElementById('test-lon');

        // 이벤트 리스너 설정
        document.getElementById('test-spring').addEventListener('click', () => this.testSpringBoot());
        document.getElementById('test-python').addEventListener('click', () => this.testPythonAPI());
        document.getElementById('test-places').addEventListener('click', () => this.testPlacesAPI());
        document.getElementById('test-weather').addEventListener('click', () => this.testWeatherAPI());
        document.getElementById('test-recommend').addEventListener('click', () => this.testRecommendAPI());
        document.getElementById('clear-logs').addEventListener('click', () => this.clearLogs());
        
        // 새로운 추천 테스트 이벤트 리스너
        document.getElementById('test-distance-recommend').addEventListener('click', () => this.testDistanceRecommend());
        document.getElementById('test-comprehensive-recommend').addEventListener('click', () => this.testComprehensiveRecommend());
        document.getElementById('test-weather-recommend').addEventListener('click', () => this.testWeatherRecommend());
        document.getElementById('test-all-recommendations').addEventListener('click', () => this.testAllRecommendations());

        // 초기 상태 설정
        this.updateStatus('disconnected', '서버 연결 확인 필요');
        this.addLog('여기강원 백엔드 테스트 페이지가 로드되었습니다.', 'info');

        // URL 입력 필드 변경 감지
        this.springUrlInput.addEventListener('input', (e) => {
            this.springUrl = e.target.value;
        });
        this.pythonUrlInput.addEventListener('input', (e) => {
            this.pythonUrl = e.target.value;
        });

        // 초기 URL 설정
        this.springUrl = this.springUrlInput.value;
        this.pythonUrl = this.pythonUrlInput.value;

        // 자동으로 서버 상태 확인
        setTimeout(() => this.checkAllServers(), 1000);
    }

    updateStatus(status, message) {
        this.statusDot.className = `status-dot ${status}`;
        this.statusText.textContent = message;
    }

    updateServerStatus(server, status) {
        const statusElement = server === 'spring' ? this.springStatus : this.pythonStatus;
        statusElement.textContent = status;
        statusElement.className = status.includes('연결됨') ? 'server-connected' : 
                                 status.includes('오류') ? 'server-error' : 'server-disconnected';
    }

    addLog(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logItem = document.createElement('div');
        logItem.className = `log-item ${type}`;
        logItem.innerHTML = `
            <span class="log-time">[${timestamp}]</span>
            <span class="log-message">${message}</span>
        `;
        this.logsContainer.appendChild(logItem);
        this.logsContainer.scrollTop = this.logsContainer.scrollHeight;
    }

    clearLogs() {
        this.logsContainer.innerHTML = '';
        this.addLog('로그가 지워졌습니다.', 'info');
    }

    async makeRequest(url, method = 'GET', body = null, requestName = '') {
        const startTime = Date.now();
        
        this.addLog(`요청 시작: ${method} ${url}`, 'info');
        this.lastRequest.textContent = requestName || `${method} ${url}`;
        this.updateStatus('connecting', '연결 중...');

        try {
            const options = {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors',
            };

            if (body) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            // 응답 정보 업데이트
            this.responseTime.textContent = `${responseTime}ms`;
            this.statusCode.textContent = response.status;

            let responseText;
            try {
                const responseJson = await response.json();
                responseText = JSON.stringify(responseJson, null, 2);
            } catch (e) {
                responseText = await response.text();
            }

            this.responseData.textContent = responseText;

            if (response.ok) {
                this.updateStatus('connected', '연결 성공');
                this.addLog(`응답 성공: ${response.status} (${responseTime}ms)`, 'success');
                return { success: true, response, data: responseText, responseTime, json: JSON.parse(responseText || '{}') };
            } else {
                this.updateStatus('error', `오류: ${response.status}`);
                this.addLog(`응답 오류: ${response.status} ${response.statusText}`, 'error');
                return { success: false, response, data: responseText, responseTime };
            }

        } catch (error) {
            const endTime = Date.now();
            const responseTime = endTime - startTime;

            this.responseTime.textContent = `${responseTime}ms`;
            this.statusCode.textContent = 'Network Error';
            this.responseData.textContent = error.message;

            this.updateStatus('error', '연결 실패');
            this.addLog(`연결 실패: ${error.message}`, 'error');
            
            return { success: false, error, responseTime };
        }
    }

    async checkAllServers() {
        this.addLog('서버 상태 자동 확인을 시작합니다...', 'info');
        await this.testSpringBoot(false);
        await this.testPythonAPI(false);
    }

    async testSpringBoot(verbose = true) {
        if (verbose) this.addLog('Spring Boot 서버 연결 테스트를 시작합니다.', 'info');
        
        // Spring Boot Actuator health endpoint 시도
        const healthEndpoints = ['/actuator/health', '/health', '/api/health'];
        let connected = false;

        for (const endpoint of healthEndpoints) {
            const result = await this.makeRequest(`${this.springUrl}${endpoint}`, 'GET', null, `Spring Boot Health Check (${endpoint})`);
            if (result.success) {
                this.updateServerStatus('spring', '연결됨');
                if (verbose) this.addLog(`Spring Boot 서버가 ${endpoint}에서 응답합니다!`, 'success');
                connected = true;
                break;
            }
        }

        if (!connected) {
            this.updateServerStatus('spring', '연결 실패');
            if (verbose) this.addLog('Spring Boot 서버에 연결할 수 없습니다.', 'error');
        }
    }

    async testPythonAPI(verbose = true) {
        if (verbose) this.addLog('Python API 서버 연결 테스트를 시작합니다.', 'info');
        
        // Python API health check (기본 endpoint 시도)
        const result = await this.makeRequest(`${this.pythonUrl}/`, 'GET', null, 'Python API Health Check');
        
        if (result.success) {
            this.updateServerStatus('python', '연결됨');
            if (verbose) this.addLog('Python API 서버가 응답합니다!', 'success');
        } else {
            this.updateServerStatus('python', '연결 실패');
            if (verbose) this.addLog('Python API 서버에 연결할 수 없습니다.', 'error');
        }
    }

    async testPlacesAPI() {
        this.addLog('관광지 API 테스트를 시작합니다.', 'info');
        
        const lat = parseFloat(this.testLat.value);
        const lon = parseFloat(this.testLon.value);
        
        if (isNaN(lat) || isNaN(lon)) {
            this.addLog('유효한 위도/경도를 입력해주세요.', 'error');
            return;
        }

        // 1. 전체 관광지 목록 조회
        this.addLog('📍 전체 관광지 목록을 조회합니다...', 'info');
        const allPlacesResult = await this.makeRequest(`${this.springUrl}/api/places`, 'GET', null, '전체 관광지 조회');
        
        if (allPlacesResult.success) {
            const places = allPlacesResult.json;
            this.addLog(`총 ${places.length}개의 관광지 데이터를 확인했습니다.`, 'success');
        }

        // 2. 근처 관광지 조회
        this.addLog(`위치 (${lat}, ${lon}) 근처 관광지를 조회합니다...`, 'info');
        await this.makeRequest(`${this.springUrl}/api/places/nearby?lat=${lat}&lon=${lon}&limit=5`, 'GET', null, '근처 관광지 조회');
    }

    async testWeatherAPI() {
        this.addLog('날씨 API 테스트를 시작합니다.', 'info');
        
        const lat = parseFloat(this.testLat.value);
        const lon = parseFloat(this.testLon.value);
        
        if (isNaN(lat) || isNaN(lon)) {
            this.addLog('유효한 위도/경도를 입력해주세요.', 'error');
            return;
        }

        this.addLog(`위치 (${lat}, ${lon})의 날씨 정보를 조회합니다...`, 'info');
        await this.makeRequest(`${this.springUrl}/api/weather?lat=${lat}&lon=${lon}`, 'GET', null, '날씨 정보 조회');
    }

    async testRecommendAPI() {
        this.addLog('관광지 추천 API 테스트를 시작합니다.', 'info');
        
        const lat = parseFloat(this.testLat.value);
        const lon = parseFloat(this.testLon.value);
        
        if (isNaN(lat) || isNaN(lon)) {
            this.addLog('유효한 위도/경도를 입력해주세요.', 'error');
            return;
        }

        // 1. 거리 기반 추천
        this.addLog(`위치 (${lat}, ${lon}) 기반 거리 추천을 조회합니다...`, 'info');
        await this.makeRequest(`${this.springUrl}/api/places/recommended?lat=${lat}&lon=${lon}&limit=5&transport=car`, 'GET', null, '거리 기반 추천');

        // 2. 종합 추천 (POST 방식)
        this.addLog(`종합 추천 API를 테스트합니다...`, 'info');
        const recommendRequest = {
            latitude: lat,
            longitude: lon,
            preferredThemes: ["실외", "산", "해변"],
            maxDistance: 50,
            limit: 5,
            avoidCrowded: true,
            considerWeather: true,
            transportationMode: "CAR",
            maxTravelTime: 60,
            considerTravelTime: true
        };
        
        await this.makeRequest(`${this.springUrl}/api/places/recommend`, 'POST', recommendRequest, '종합 추천 API');

        // 3. 날씨 기반 추천
        this.addLog(`날씨 기반 추천을 조회합니다...`, 'info');
        await this.makeRequest(`${this.springUrl}/api/places/recommend/weather-based?lat=${lat}&lon=${lon}&limit=3`, 'GET', null, '날씨 기반 추천');
    }

    // 새로운 추천 테스트 메서드들
    getRecommendationSettings() {
        const lat = parseFloat(this.testLat.value);
        const lon = parseFloat(this.testLon.value);
        
        if (isNaN(lat) || isNaN(lon)) {
            this.addLog('유효한 위도/경도를 입력해주세요.', 'error');
            return null;
        }

        // 선택된 테마들 가져오기
        const selectedThemes = Array.from(document.querySelectorAll('.theme-checkboxes input[type="checkbox"]:checked'))
            .map(checkbox => checkbox.value);

        return {
            lat,
            lon,
            preferredThemes: selectedThemes,
            maxDistance: parseInt(document.getElementById('max-distance').value),
            limit: parseInt(document.getElementById('recommend-limit').value),
            transportationMode: document.getElementById('transport-mode').value,
            maxTravelTime: parseInt(document.getElementById('max-travel-time').value),
            avoidCrowded: document.getElementById('avoid-crowded').checked,
            considerWeather: document.getElementById('consider-weather').checked,
            considerTravelTime: document.getElementById('consider-travel-time').checked
        };
    }

    async testDistanceRecommend() {
        this.addLog('거리 기반 추천 테스트를 시작합니다.', 'info');
        
        const settings = this.getRecommendationSettings();
        if (!settings) return;

        const transport = settings.transportationMode === 'CAR' ? 'car' : 'walk';
        const url = `${this.springUrl}/api/places/recommended?lat=${settings.lat}&lon=${settings.lon}&limit=${settings.limit}&transport=${transport}`;
        
        this.addLog(`위치: (${settings.lat}, ${settings.lon}), 이동수단: ${transport}, 개수: ${settings.limit}`, 'info');
        await this.makeRequest(url, 'GET', null, '거리 기반 추천');
    }

    async testComprehensiveRecommend() {
        this.addLog('종합 추천 테스트를 시작합니다.', 'info');
        
        const settings = this.getRecommendationSettings();
        if (!settings) return;

        const recommendRequest = {
            latitude: settings.lat,
            longitude: settings.lon,
            preferredThemes: settings.preferredThemes,
            maxDistance: settings.maxDistance,
            limit: settings.limit,
            avoidCrowded: settings.avoidCrowded,
            considerWeather: settings.considerWeather,
            transportationMode: settings.transportationMode,
            maxTravelTime: settings.maxTravelTime,
            considerTravelTime: settings.considerTravelTime
        };
        
        this.addLog(`설정: 테마=${settings.preferredThemes.join(',')}, 거리=${settings.maxDistance}km, 개수=${settings.limit}`, 'info');
        await this.makeRequest(`${this.springUrl}/api/places/recommend`, 'POST', recommendRequest, '종합 추천 API');
    }

    async testWeatherRecommend() {
        this.addLog('날씨 기반 추천 테스트를 시작합니다.', 'info');
        
        const settings = this.getRecommendationSettings();
        if (!settings) return;

        const url = `${this.springUrl}/api/places/recommend/weather-based?lat=${settings.lat}&lon=${settings.lon}&limit=${settings.limit}&transportationMode=${settings.transportationMode}&maxTravelTime=${settings.maxTravelTime}`;
        
        this.addLog(`위치: (${settings.lat}, ${settings.lon}), 이동수단: ${settings.transportationMode}, 개수: ${settings.limit}`, 'info');
        await this.makeRequest(url, 'GET', null, '날씨 기반 추천');
    }

    async testAllRecommendations() {
        this.addLog('모든 추천 기능을 순차적으로 테스트합니다.', 'info');
        
        await this.testDistanceRecommend();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        
        await this.testComprehensiveRecommend();
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        
        await this.testWeatherRecommend();
        
        this.addLog('모든 추천 테스트가 완료되었습니다!', 'success');
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    new BackendTester();
});
