(() => {
    // Elements
    const loginPage = document.getElementById('login-page');
    const dashboardPage = document.getElementById('dashboard-page');
    const logoutBtn = document.getElementById('logout-btn');

    // Forms and messages
    const loginForm = document.getElementById('login-form');
    const loginErrorEl = document.getElementById('login-error');
    const registerForm = document.getElementById('register-form');
    const registerErrorEl = document.getElementById('register-error');
    const registerSuccessEl = document.getElementById('register-success');

    const toRegisterLink = document.getElementById('to-register');
    const toLoginLink = document.getElementById('to-login');

    // Dashboard elements
    const totalStepsEl = document.getElementById('total-steps');
    const currentHeartEl = document.getElementById('current-heart');
    const sleepHoursEl = document.getElementById('sleep-hours');
    const ctx = document.getElementById('healthChart').getContext('2d');

    // Simulated data arrays and stats
    const maxPoints = 24; // hourly data points

    let timeLabels = [];
    let stepsData = [];
    let heartRateData = [];
    let sleepData = [];

    let totalSteps = 0;
    let currentHeart = 60;
    let totalSleep = 7.5 + Math.random(); // base sleep hours

    // Generate labels: 1-24 hours (hours of the day)
    function generateTimeLabels() {
        const labels = [];
        for (let i = 0; i < maxPoints; i++) {
            let h = (i + 1) % 24;
            labels.push(h + ':00');
        }
        return labels;
    }

    // Initialize arrays
    function initializeDataArrays() {
        timeLabels = generateTimeLabels();
        stepsData = Array(maxPoints).fill(0);
        heartRateData = Array(maxPoints).fill(null);
        sleepData = Array(maxPoints).fill(null);
    }

    // Update summary cards display
    function updateSummary() {
        totalStepsEl.textContent = totalSteps.toLocaleString();
        currentHeartEl.textContent = currentHeart ? currentHeart : '--';
        sleepHoursEl.textContent = totalSleep.toFixed(1);
    }

    // Chart config and create
    let healthChart;

    function createChart() {
        healthChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'Steps',
                        data: stepsData,
                        borderColor: '#ff6f61',
                        backgroundColor: 'rgba(255,111,97,0.25)',
                        fill: true,
                        yAxisID: 'stepsAxis',
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                    },
                    {
                        label: 'Heart Rate (BPM)',
                        data: heartRateData,
                        borderColor: '#ffbb44',
                        backgroundColor: 'rgba(255,187,68,0.25)',
                        fill: true,
                        yAxisID: 'heartAxis',
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                    },
                    {
                        label: 'Sleep (hrs)',
                        data: sleepData,
                        borderColor: '#44b8ff',
                        backgroundColor: 'rgba(68,184,255,0.25)',
                        fill: true,
                        yAxisID: 'sleepAxis',
                        tension: 0.3,
                        pointRadius: 3,
                        pointHoverRadius: 6,
                        borderWidth: 2,
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart',
                },
                interaction: {
                    mode: 'nearest',
                    intersect: false,
                    axis: 'x'
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        mode: 'nearest',
                        intersect: false,
                        callbacks: {
                            label: function (context) {
                                let val = context.parsed.y;
                                if (context.dataset.label === 'Steps') return `Steps: ${val}`;
                                if (context.dataset.label === 'Heart Rate (BPM)') return `Heart Rate: ${val} BPM`;
                                if (context.dataset.label === 'Sleep (hrs)') return `Sleep: ${val.toFixed(2)} hrs`;
                                return val;
                            }
                        }
                    }
                },
                scales: {
                    stepsAxis: {
                        type: 'linear',
                        position: 'left',
                        min: 0,
                        max: 4000,
                        grid: { color: 'rgba(255,255,255,0.1)' },
                        ticks: {
                            color: '#ff6f61',
                            stepSize: 1000,
                            font: { weight: '600' }
                        },
                        title: {
                            display: true,
                            text: 'Steps',
                            color: '#ff6f61',
                            font: { weight: '600', size: 14 }
                        }
                    },
                    heartAxis: {
                        type: 'linear',
                        position: 'right',
                        min: 50, max: 130,
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#ffbb44', font: { weight: '600' } },
                        title: {
                            display: true,
                            text: 'Heart Rate (BPM)',
                            color: '#ffbb44',
                            font: { weight: '600', size: 14 }
                        }
                    },
                    sleepAxis: {
                        type: 'linear',
                        position: 'right',
                        min: 0,
                        max: 8,
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#44b8ff', font: { weight: '600' } },
                        title: {
                            display: true,
                            text: 'Sleep Hours',
                            color: '#44b8ff',
                            font: { weight: '600', size: 14 }
                        },
                        offset: true,
                        grace: '10%'
                    },
                    x: {
                        ticks: { color: '#ddd', font: { weight: '600' } },
                        grid: { color: 'rgba(255,255,255,0.05)' }
                    }
                }
            }
        });
    }

    // LocalStorage keys for users
    const USERS_KEY = 'healthDashboardUsers';

    // Read users from localStorage
    function getUsers() {
        const usersJson = localStorage.getItem(USERS_KEY);
        return usersJson ? JSON.parse(usersJson) : [];
    }

    // Save users array to localStorage
    function saveUsers(users) {
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }

    // Check if username exists
    function usernameExists(username) {
        const users = getUsers();
        return users.some(user => user.username.toLowerCase() === username.toLowerCase());
    }

    // Find user by username
    function findUser(username) {
        const users = getUsers();
        return users.find(user => user.username.toLowerCase() === username.toLowerCase());
    }

    // Functions to simulate physical activity effects
    function incrementSteps(count = 50) {
        totalSteps = Math.min(totalSteps + count, 4000);
        stepsData.shift();
        stepsData.push(totalSteps);
    }
    function incrementHeartRate() {
        currentHeart = Math.min(currentHeart + 5, 130);
        heartRateData.shift();
        heartRateData.push(currentHeart);
    }
    function decayHeartRate() {
        if (currentHeart > 60) currentHeart -= 1;
        heartRateData.shift();
        heartRateData.push(currentHeart);
    }
    function updateSleepData() {
        sleepData = Array(maxPoints).fill(0);
        for (let i = 0; i < maxPoints; i++) {
            let hour = (i + 1) % 24;
            if (hour >= 22 || hour < 7) {
                let avgSleep = totalSleep / 9;
                sleepData[i] = parseFloat((avgSleep + (Math.random() * 0.1 - 0.05)).toFixed(2));
            }
        }
    }

    function updateChartAndSummary() {
        healthChart.update();
        updateSummary();
    }

    // Activity simulation with keyboard space/arrow keys
    let activityTimeout;
    function simulateActivity() {
        clearTimeout(activityTimeout);
        incrementSteps();
        incrementHeartRate();
        updateChartAndSummary();
        activityTimeout = setTimeout(() => {
            startHeartRateDecay();
        }, 2000);
    }

    let heartRateDecayInterval;
    function startHeartRateDecay() {
        if (heartRateDecayInterval) return;
        heartRateDecayInterval = setInterval(() => {
            if (currentHeart <= 60) {
                clearInterval(heartRateDecayInterval);
                heartRateDecayInterval = null;
            } else {
                decayHeartRate();
                updateChartAndSummary();
            }
        }, 1000);
    }

    function handleActivityKeys(e) {
        if (['ArrowUp', 'ArrowDown', ' ', 'Spacebar'].includes(e.key)) {
            e.preventDefault();
            simulateActivity();
        }
    }

    // Validate login using localStorage users
    function validateLogin(username, password) {
        const user = findUser(username);
        if (!user) return false;
        return user.password === password;
    }

    // Validate registration form inputs
    function validateRegistration(data) {
        if (!data.username || data.username.length < 3) return 'Username must be at least 3 characters.';
        if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) return 'Invalid email address.';
        if (!data.password || data.password.length < 6) return 'Password must be at least 6 characters.';
        if (data.password !== data.confirmPassword) return 'Passwords do not match.';
        if (usernameExists(data.username)) return 'Username already taken.';
        return null;
    }

    // Show dashboard and hide login/registration
    function showDashboard() {
        loginPage.style.display = 'none';
        dashboardPage.style.display = 'block';
        initializeDataArrays();
        updateSleepData();
        createChart();
        updateSummary();
        window.addEventListener('keydown', handleActivityKeys);
    }

    // Logout resets everything back to login with login shown
    function logout() {
        window.removeEventListener('keydown', handleActivityKeys);
        if (healthChart) healthChart.destroy();
        healthChart = null;
        currentHeart = 60;
        totalSteps = 0;
        sleepData = [];
        stepsData = [];
        heartRateData = [];
        loginForm.reset();
        registerForm.reset();
        loginErrorEl.textContent = '';
        registerErrorEl.textContent = '';
        registerSuccessEl.textContent = '';
        dashboardPage.style.display = 'none';
        loginPage.style.display = 'flex';
        // Show login, hide register
        showLoginForm();
    }

    // Show login form, hide register form
    function showLoginForm() {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginErrorEl.textContent = '';
        registerErrorEl.textContent = '';
        registerSuccessEl.textContent = '';
    }
    // Show register form, hide login form
    function showRegisterForm() {
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
        loginErrorEl.textContent = '';
        registerErrorEl.textContent = '';
        registerSuccessEl.textContent = '';
    }

    // Login form submit handler
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        loginErrorEl.textContent = '';
        const username = loginForm.username.value.trim();
        const password = loginForm.password.value;
        if (validateLogin(username, password)) {
            showDashboard();
        } else {
            loginErrorEl.textContent = 'Invalid username or password.';
        }
    });

    // Register form submit handler
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        registerErrorEl.textContent = '';
        registerSuccessEl.textContent = '';
        const username = registerForm['username'].value.trim();
        const email = registerForm['email'].value.trim();
        const password = registerForm['password'].value;
        const confirmPassword = registerForm['confirm-password'].value;
        const validationError = validateRegistration({ username, email, password, confirmPassword });
        if (validationError) {
            registerErrorEl.textContent = validationError;
        } else {
            // Save user to localStorage
            const users = getUsers();
            users.push({
                username,
                email,
                password // storing plain text for demo only
            });
            saveUsers(users);
            // Show success message and switch to login
            registerSuccessEl.textContent = 'Registration successful! Please log in.';
            registerForm.reset();
            setTimeout(showLoginForm, 2000);
        }
    });

    // Toggle links
    toRegisterLink.addEventListener('click', showRegisterForm);
    toRegisterLink.addEventListener('keypress', (e) => { if (e.key === 'Enter') showRegisterForm(); });
    toLoginLink.addEventListener('click', showLoginForm);
    toLoginLink.addEventListener('keypress', (e) => { if (e.key === 'Enter') showLoginForm(); });

    // Logout button
    logoutBtn.addEventListener('click', logout);

    // Initialize page with login shown
    logout();
})();
