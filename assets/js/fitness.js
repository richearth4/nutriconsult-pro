/**
 * Fitness Tracker Manager
 */
const FitnessManager = {
    async syncData() {
        try {
            return await api.request('/api/fitness/sync', {
                method: 'POST'
            });
        } catch (error) {
            console.error('Fitness sync failed:', error);
            throw error;
        }
    },

    async getSummary(userId) {
        try {
            return await api.request(`/api/fitness/summary/${userId}`);
        } catch (error) {
            console.error('Failed to fetch fitness summary:', error);
            return [];
        }
    },

    renderWidget(data) {
        const widgetContainer = document.getElementById('fitnessWidget');
        if (!widgetContainer) return;

        if (!data || data.length === 0) {
            widgetContainer.innerHTML = `
                <div class="card" style="text-align: center; padding: 2rem; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 200px;">
                    <div style="font-size: 2rem; margin-bottom: 1rem;">🏃‍♂️</div>
                    <p class="text-muted" style="margin-bottom: 1.5rem;">Connect your fitness tracker to see activity data.</p>
                    <button class="btn btn-primary" onclick="syncFitness()">Connect Tracker</button>
                </div>
            `;
            return;
        }

        const latest = data[0];
        const stepGoal = 10000;
        const stepPercent = Math.min((latest.steps / stepGoal) * 100, 100);

        widgetContainer.innerHTML = `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="font-size: 1.1rem;">Activity Tracker</h3>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="syncFitness()">🔄 Sync</button>
                </div>
                
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 2.5rem; font-weight: 700; color: var(--primary);">${latest.steps.toLocaleString()}</div>
                    <div class="text-muted" style="font-size: 0.85rem;">Steps Today</div>
                    <div style="width: 100%; height: 8px; background: #E5E7EB; border-radius: 4px; margin-top: 0.75rem; overflow: hidden;">
                        <div style="width: ${stepPercent}%; height: 100%; background: var(--primary); border-radius: 4px;"></div>
                    </div>
                </div>

                <div class="grid grid-cols-2" style="gap: 1rem;">
                    <div style="background: #F8FAFC; padding: 0.75rem; border-radius: 0.75rem; text-align: center; border: 1px solid var(--border-light);">
                        <div style="font-weight: 700; color: var(--text-dark);">${latest.active_minutes}m</div>
                        <div class="text-muted" style="font-size: 0.75rem;">Active</div>
                    </div>
                    <div style="background: #F8FAFC; padding: 0.75rem; border-radius: 0.75rem; text-align: center; border: 1px solid var(--border-light);">
                        <div style="font-weight: 700; color: var(--text-dark);">${latest.sleep_hours}h</div>
                        <div class="text-muted" style="font-size: 0.75rem;">Sleep</div>
                    </div>
                </div>
            </div>
        `;
    }
};

async function syncFitness() {
    try {
        const btn = event?.target;
        let originalText = '🔄 Sync';
        if (btn) {
            originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = 'Syncing...';
        }

        await FitnessManager.syncData();
        const session = getSession();
        const data = await FitnessManager.getSummary(session.userId);
        FitnessManager.renderWidget(data);

        if (window.showNotification) {
            showNotification('Fitness data synced successfully!', 'success');
        } else {
            console.log('Fitness data synced successfully!');
        }
    } catch (error) {
        if (window.showNotification) {
            showNotification('Failed to sync fitness data.', 'error');
        } else {
            console.error('Failed to sync fitness data.');
        }
    } finally {
        const btn = document.querySelector('[onclick="syncFitness()"]');
        if (btn) {
            btn.disabled = false;
            btn.textContent = '🔄 Sync';
        }
    }
}

// Export
window.FitnessManager = FitnessManager;
