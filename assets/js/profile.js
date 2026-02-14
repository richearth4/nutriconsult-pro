
// --- Client Profile Logic ---

function renderClientProfile(userId) {
    const session = db.getSession();
    const users = JSON.parse(localStorage.getItem('nutri_users')) || [];
    const user = users.find(u => u.id === userId);
    const clientData = db.getClientData(userId);
    const subscription = db.getUserSubscription(userId);

    if (!clientData) {
        alert('No profile data found. Please complete the intake form first.');
        window.location.href = 'dashboard-client.html';
        return;
    }

    // Populate view mode
    document.getElementById('viewName').textContent = user?.name || '-';
    document.getElementById('viewEmail').textContent = user?.email || '-';
    document.getElementById('viewSubscription').textContent = subscription.tier.toUpperCase();

    document.getElementById('viewWeight').textContent = clientData.weight || '-';
    document.getElementById('viewHeight').textContent = clientData.height || '-';
    document.getElementById('viewBMI').textContent = clientData.bmi || '-';
    document.getElementById('viewBMIStatus').textContent = clientData.status || '-';
    document.getElementById('viewGoalWeight').textContent = clientData.goalWeight || 'Not set';

    document.getElementById('viewActivity').textContent = clientData.activity || 'Not specified';
    document.getElementById('viewSleep').textContent = clientData.sleepQuality || 'Not specified';
    document.getElementById('viewWater').textContent = clientData.water ? clientData.water + 'L' : 'Not tracked';
    document.getElementById('viewMeals').textContent = clientData.mealsPerDay || 'Not specified';

    document.getElementById('viewConditions').textContent = clientData.conditions || 'None reported';
    document.getElementById('viewMedications').textContent = clientData.medications || 'None reported';
    document.getElementById('viewAllergies').textContent = clientData.allergies || 'None reported';
}

function enableEditMode() {
    const session = db.getSession();
    const clientData = db.getClientData(session.userId);

    // Populate edit form
    document.getElementById('editWeight').value = clientData.weight || '';
    document.getElementById('editHeight').value = clientData.height || '';
    document.getElementById('editGoalWeight').value = clientData.goalWeight || '';
    document.getElementById('editActivity').value = clientData.activity || 'sedentary';
    document.getElementById('editSleep').value = clientData.sleepQuality || 'good';
    document.getElementById('editWater').value = clientData.water || '';
    document.getElementById('editMeals').value = clientData.mealsPerDay || 3;
    document.getElementById('editMedications').value = clientData.medications || '';
    document.getElementById('editAllergies').value = clientData.allergies || '';

    // Toggle modes
    document.getElementById('viewMode').style.display = 'none';
    document.getElementById('editMode').style.display = 'block';
}

function cancelEdit() {
    document.getElementById('viewMode').style.display = 'block';
    document.getElementById('editMode').style.display = 'none';
}

function saveProfile() {
    const session = db.getSession();

    const profileData = {
        weight: parseFloat(document.getElementById('editWeight').value),
        height: parseFloat(document.getElementById('editHeight').value),
        goalWeight: parseFloat(document.getElementById('editGoalWeight').value),
        activity: document.getElementById('editActivity').value,
        sleepQuality: document.getElementById('editSleep').value,
        water: parseFloat(document.getElementById('editWater').value),
        mealsPerDay: parseInt(document.getElementById('editMeals').value),
        medications: document.getElementById('editMedications').value,
        allergies: document.getElementById('editAllergies').value
    };

    const success = db.updateClientProfile(session.userId, profileData);

    if (success) {
        alert('Profile updated successfully! ✅');
        window.location.reload(); // Refresh to show updated data
    } else {
        alert('Failed to update profile. Please try again.');
    }
}
