 // Country-specific water data
        const COUNTRY_DATA = {
            KE: { currency: 'KES', rate: 53.00, name: 'Kenya', avgBill: 1500, stressed: false },
            NG: { currency: 'NGN', rate: 150.00, name: 'Nigeria', avgBill: 8000, stressed: true },
            GH: { currency: 'GHS', rate: 4.50, name: 'Ghana', avgBill: 180, stressed: false },
            ZA: { currency: 'ZAR', rate: 25.00, name: 'South Africa', avgBill: 650, stressed: true },
            TZ: { currency: 'TZS', rate: 800.00, name: 'Tanzania', avgBill: 35000, stressed: false },
            UG: { currency: 'UGX', rate: 2500.00, name: 'Uganda', avgBill: 95000, stressed: false },
            EG: { currency: 'EGP', rate: 3.50, name: 'Egypt', avgBill: 120, stressed: true },
            MA: { currency: 'MAD', rate: 7.00, name: 'Morocco', avgBill: 200, stressed: true },
            RW: { currency: 'RWF', rate: 550.00, name: 'Rwanda', avgBill: 22000, stressed: false },
            ET: { currency: 'ETB', rate: 12.00, name: 'Ethiopia', avgBill: 400, stressed: true },
            ZW: { currency: 'USD', rate: 1.50, name: 'Zimbabwe', avgBill: 45, stressed: true },
            ZM: { currency: 'ZMW', rate: 8.50, name: 'Zambia', avgBill: 280, stressed: false },
            BW: { currency: 'BWP', rate: 15.00, name: 'Botswana', avgBill: 450, stressed: true },
            SN: { currency: 'XOF', rate: 500.00, name: 'Senegal', avgBill: 18000, stressed: false },
            CI: { currency: 'XOF', rate: 450.00, name: 'Côte d\'Ivoire', avgBill: 16000, stressed: false },
            TN: { currency: 'TND', rate: 1.20, name: 'Tunisia', avgBill: 35, stressed: true }
        };

        // Water activities with typical usage
        const WATER_ACTIVITIES = [
            { id: 'shower', name: 'Shower', icon: '🚿', literPerMin: 10, defaultMin: 8, defaultTimes: 4 },
            { id: 'bath', name: 'Bath', icon: '🛁', literPerMin: 80, defaultMin: 1, defaultTimes: 0 },
            { id: 'toilet', name: 'Toilet Flush', icon: '🚽', literPerMin: 6, defaultMin: 1, defaultTimes: 20 },
            { id: 'dishes', name: 'Washing Dishes', icon: '🍽️', literPerMin: 6, defaultMin: 15, defaultTimes: 3 },
            { id: 'cooking', name: 'Cooking', icon: '🍳', literPerMin: 2, defaultMin: 20, defaultTimes: 3 },
            { id: 'laundry', name: 'Laundry (Manual)', icon: '🧺', literPerMin: 50, defaultMin: 1, defaultTimes: 1 },
            { id: 'machine', name: 'Washing Machine', icon: '🌀', literPerMin: 100, defaultMin: 1, defaultTimes: 0 },
            { id: 'garden', name: 'Watering Garden', icon: '🌱', literPerMin: 15, defaultMin: 20, defaultTimes: 1 },
            { id: 'car', name: 'Washing Car', icon: '🚗', literPerMin: 20, defaultMin: 15, defaultTimes: 0 },
            { id: 'drinking', name: 'Drinking & Cooking Water', icon: '💧', literPerMin: 3, defaultMin: 1, defaultTimes: 15 },
            { id: 'cleaning', name: 'House Cleaning', icon: '🧹', literPerMin: 8, defaultMin: 20, defaultTimes: 2 },
            { id: 'handwash', name: 'Hand Washing', icon: '🧼', literPerMin: 1, defaultMin: 1, defaultTimes: 25 }
        ];

        let activities = {};

        function initializeData() {
            const saved = localStorage.getItem('waterCalculator');
            if (saved) {
                const data = JSON.parse(saved);
                activities = data.activities || {};
                document.getElementById('country').value = data.country || '';
                document.getElementById('currency').value = data.currency || 'KES';
                document.getElementById('waterRate').value = data.rate || 53.00;
                document.getElementById('householdSize').value = data.householdSize || 4;
                updateWaterRate();
            } else {
                // Initialize with default values
                WATER_ACTIVITIES.forEach(activity => {
                    activities[activity.id] = {
                        minutes: activity.defaultMin,
                        times: activity.defaultTimes
                    };
                });
            }
            displayActivities();
            calculateAll();
        }

        function saveData() {
            const data = {
                activities: activities,
                country: document.getElementById('country').value,
                currency: document.getElementById('currency').value,
                rate: document.getElementById('waterRate').value,
                householdSize: document.getElementById('householdSize').value
            };
            localStorage.setItem('waterCalculator', JSON.stringify(data));
        }

        function updateWaterRate() {
            const country = document.getElementById('country').value;
            const infoDiv = document.getElementById('countryInfo');
            
            if (country && country !== 'OTHER' && COUNTRY_DATA[country]) {
                const data = COUNTRY_DATA[country];
                document.getElementById('currency').value = data.currency;
                document.getElementById('waterRate').value = data.rate;
                
                infoDiv.style.display = 'block';
                const stressInfo = data.stressed ? 
                    '<strong style="color: #e53e3e;">⚠️ Water-stressed region</strong> - Extra conservation recommended' :
                    '<strong style="color: #38a169;">✓ Moderate water availability</strong>';
                infoDiv.innerHTML = `
                    <strong>${data.name}</strong> average water rate: ${data.currency} ${data.rate}/1000L | 
                    Average monthly bill: ${data.currency} ${data.avgBill.toLocaleString()} | 
                    ${stressInfo}
                `;
            } else if (country === 'OTHER') {
                infoDiv.style.display = 'block';
                infoDiv.innerHTML = 'Please enter your water rate manually from your utility bill.';
            } else {
                infoDiv.style.display = 'none';
            }
            calculateAll();
        }

        function displayActivities() {
            const grid = document.getElementById('activityGrid');
            const currency = document.getElementById('currency').value;
            const rate = parseFloat(document.getElementById('waterRate').value) || 0;

            grid.innerHTML = WATER_ACTIVITIES.map(activity => {
                const activityData = activities[activity.id] || { minutes: activity.defaultMin, times: activity.defaultTimes };
                const dailyLiters = activity.literPerMin * activityData.minutes * activityData.times;
                const dailyCost = (dailyLiters / 1000) * rate;
                const monthlyLiters = dailyLiters * 30;
                const monthlyCost = dailyCost * 30;

                return `
                    <div class="activity-card">
                        <div class="activity-header">
                            <div class="activity-name">${activity.name}</div>
                            <div class="activity-icon">${activity.icon}</div>
                        </div>
                        
                        <div class="usage-controls">
                            <div class="usage-item">
                                <label>Minutes per use</label>
                                <input type="number" 
                                       value="${activityData.minutes}" 
                                       min="0" 
                                       step="1"
                                       onchange="updateActivity('${activity.id}', 'minutes', this.value)">
                            </div>
                            <div class="usage-item">
                                <label>Times per day</label>
                                <input type="number" 
                                       value="${activityData.times}" 
                                       min="0" 
                                       step="1"
                                       onchange="updateActivity('${activity.id}', 'times', this.value)">
                            </div>
                        </div>

                        <div class="water-amount">
                            <div class="water-label">Daily Water Usage</div>
                            <div class="water-value">${dailyLiters.toFixed(1)} L</div>
                            <div class="water-label" style="margin-top: 5px; font-size: 0.8em;">
                                Monthly: ${monthlyLiters.toFixed(0)} L
                            </div>
                        </div>

                        <div class="cost-amount">
                            <div class="water-label">Daily Cost</div>
                            <div class="cost-value">${currency} ${dailyCost.toFixed(2)}</div>
                            <div class="water-label" style="font-size: 0.8em; margin-top: 3px;">
                                Monthly: ${currency} ${monthlyCost.toFixed(2)}
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }

        function updateActivity(id, field, value) {
            if (!activities[id]) activities[id] = {};
            activities[id][field] = parseFloat(value) || 0;
            saveData();
            displayActivities();
            calculateAll();
        }

        function calculateAll() {
            const rate = parseFloat(document.getElementById('waterRate').value) || 0;
            const currency = document.getElementById('currency').value;
            const householdSize = parseInt(document.getElementById('householdSize').value) || 1;

            let totalDaily = 0;

            WATER_ACTIVITIES.forEach(activity => {
                const activityData = activities[activity.id] || { minutes: 0, times: 0 };
                const dailyLiters = activity.literPerMin * activityData.minutes * activityData.times;
                totalDaily += dailyLiters;
            });

            const perPerson = totalDaily / householdSize;
            const monthlyLiters = totalDaily * 30;
            const monthlyCost = (monthlyLiters / 1000) * rate;

            document.getElementById('dailyUsage').textContent = `${totalDaily.toFixed(0)} L`;
            document.getElementById('perPersonUsage').textContent = `${perPerson.toFixed(0)} L`;
            document.getElementById('monthlyUsage').textContent = `${monthlyLiters.toFixed(0)} L`;
            document.getElementById('monthlyCost').textContent = `${currency} ${monthlyCost.toFixed(2)}`;
            document.getElementById('yourPerPerson').textContent = `${perPerson.toFixed(0)} L`;

            updateStatus(perPerson);
            generateSavingTips(perPerson, totalDaily);
            saveData();
        }

        function updateStatus(perPerson) {
            const alertDiv = document.getElementById('statusAlert');
            
            if (perPerson < 50) {
                alertDiv.className = 'alert alert-warning';
                alertDiv.innerHTML = '<strong>⚠️ Below WHO Minimum:</strong> Your usage is below the recommended 50L/person/day. Ensure adequate hygiene and health needs are met.';
            } else if (perPerson <= 80) {
                alertDiv.className = 'alert alert-success';
                alertDiv.innerHTML = '<strong>✓ Excellent:</strong> Your water usage is within the efficient range for African households.';
            } else if (perPerson <= 150) {
                alertDiv.className = 'alert alert-info';
                alertDiv.innerHTML = '<strong>ℹ️ Moderate:</strong> Your usage is reasonable but there\'s room for conservation.';
            } else {
                alertDiv.className = 'alert alert-danger';
                alertDiv.innerHTML = '<strong>🚨 High Usage:</strong> Your water consumption is significantly above average. Consider conservation measures.';
            }
        }

        function generateSavingTips(perPerson, totalDaily) {
            const tipsContainer = document.getElementById('savingTips');
            const tips = [];
            const country = document.getElementById('country').value;
            const isStressed = COUNTRY_DATA[country]?.stressed;

            if (isStressed) {
                tips.push('<strong>Your region is water-stressed.</strong> Every drop counts! Prioritize conservation measures.');
            }

            // Check specific activities
            const showerData = activities['shower'] || { minutes: 0, times: 0 };
            if (showerData.minutes > 10) {
                tips.push('🚿 Reduce shower time to 5-7 minutes. Save up to 30 liters per shower.');
            }

            const bathData = activities['bath'] || { minutes: 0, times: 0 };
            if (bathData.times > 0) {
                tips.push('🛁 Replace baths with showers. A bath uses 80L vs 50L for a 5-minute shower.');
            }

            const toiletData = activities['toilet'] || { minutes: 0, times: 0 };
            if (toiletData.times > 25) {
                tips.push('🚽 Consider a dual-flush toilet or put a bottle in the tank to reduce water per flush.');
            }

            const dishesData = activities['dishes'] || { minutes: 0, times: 0 };
            if (dishesData.minutes > 20) {
                tips.push('🍽️ Don\'t leave taps running while washing dishes. Use a basin to save up to 50% water.');
            }

            const gardenData = activities['garden'] || { minutes: 0, times: 0 };
            if (gardenData.times > 1 || gardenData.minutes > 20) {
                tips.push('🌱 Water garden early morning or evening. Use drip irrigation or greywater where possible.');
            }

            const carData = activities['car'] || { minutes: 0, times: 0 };
            if (carData.times > 0) {
                tips.push('🚗 Use a bucket instead of a hose to wash your car. Save up to 200 liters per wash.');
            }

            const laundryData = activities['laundry'] || { minutes: 0, times: 0 };
            const machineData = activities['machine'] || { minutes: 0, times: 0 };
            if (laundryData.times > 2 || machineData.times > 1) {
                tips.push('🧺 Do full loads of laundry. Half loads waste water and energy.');
            }

            // General tips if specific issues not found
            if (tips.length < 3) {
                tips.push('💧 Fix leaking taps immediately. A dripping tap wastes up to 20L per day.');
                tips.push('🧼 Turn off tap while brushing teeth or soaping hands. Save 6L per minute.');
                tips.push('♻️ Collect and reuse greywater from washing for watering plants or cleaning.');
            }

            if (perPerson > 150) {
                tips.push('<strong>Your usage is very high.</strong> Implement multiple conservation measures to reduce consumption by at least 30%.');
            }

            tipsContainer.innerHTML = tips.map(tip => `<li>${tip}</li>`).join('');
        }

        function exportData() {
            const rate = parseFloat(document.getElementById('waterRate').value) || 0;
            const currency = document.getElementById('currency').value;
            const country = document.getElementById('country').value;
            const countryName = COUNTRY_DATA[country]?.name || 'Custom';
            const householdSize = parseInt(document.getElementById('householdSize').value) || 1;

            let csv = `Water Usage Report - ${countryName}\n`;
            csv += `Household Size: ${householdSize} people\n`;
            csv += `Rate: ${currency} ${rate}/1000L\n`;
            csv += `Generated: ${new Date().toLocaleString()}\n\n`;
            csv += 'Activity,Minutes per Use,Times per Day,Daily Liters,Monthly Liters,Daily Cost,Monthly Cost\n';

            let totalDaily = 0;
            let totalDailyCost = 0;

            WATER_ACTIVITIES.forEach(activity => {
                const activityData = activities[activity.id] || { minutes: 0, times: 0 };
                const dailyLiters = activity.literPerMin * activityData.minutes * activityData.times;
                const monthlyLiters = dailyLiters * 30;
                const dailyCost = (dailyLiters / 1000) * rate;
                const monthlyCost = dailyCost * 30;

                totalDaily += dailyLiters;
                totalDailyCost += dailyCost;

                csv += `${activity.name},${activityData.minutes},${activityData.times},${dailyLiters.toFixed(1)},${monthlyLiters.toFixed(0)},${dailyCost.toFixed(2)},${monthlyCost.toFixed(2)}\n`;
            });

            const perPerson = totalDaily / householdSize;
            const totalMonthly = totalDaily * 30;
            const totalMonthlyCost = totalDailyCost * 30;

            csv += `\nTOTAL,,,${totalDaily.toFixed(0)},${totalMonthly.toFixed(0)},${totalDailyCost.toFixed(2)},${totalMonthlyCost.toFixed(2)}\n`;
            csv += `\nPer Person Daily,${perPerson.toFixed(0)} liters\n`;
            csv += `WHO Recommended Minimum,50 liters\n`;
            csv += `African Urban Average,80 liters\n`;

            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `water-usage-report-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        }

        function resetData() {
            if (confirm('Are you sure you want to reset all data? This will restore default values.')) {
                localStorage.removeItem('waterCalculator');
                activities = {};
                WATER_ACTIVITIES.forEach(activity => {
                    activities[activity.id] = {
                        minutes: activity.defaultMin,
                        times: activity.defaultTimes
                    };
                });
                displayActivities();
                calculateAll();
            }
        }

        // Initialize
        initializeData();