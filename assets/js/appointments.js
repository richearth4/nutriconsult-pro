/**
 * Appointments Manager
 */
const AppointmentManager = {
    async getAppointments() {
        try {
            return await api.request('/api/appointments');
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
            return [];
        }
    },

    async bookAppointment(data) {
        try {
            return await api.request('/api/appointments', {
                method: 'POST',
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('Booking failed:', error);
            throw error;
        }
    },

    async updateStatus(id, status) {
        try {
            return await api.request(`/api/appointments/${id}`, {
                method: 'PUT',
                body: JSON.stringify({ status })
            });
        } catch (error) {
            console.error('Status update failed:', error);
            throw error;
        }
    },

    renderClientWidget(appointments) {
        const container = document.getElementById('appointmentsWidget');
        if (!container) return;

        if (appointments.length === 0) {
            container.innerHTML = `
                <div class="card">
                    <h3 style="font-size: 1.1rem; margin-bottom: 1rem;">Appointments</h3>
                    <p class="text-muted">No upcoming appointments.</p>
                    <button class="btn btn-primary mt-4" style="width: 100%;" onclick="openBookingModal()">Book a Session</button>
                </div>
            `;
            return;
        }

        const upcoming = appointments.filter(a => a.status !== 'cancelled').sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));

        container.innerHTML = `
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                    <h3 style="font-size: 1.1rem;">Upcoming Sessions</h3>
                    <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.75rem;" onclick="openBookingModal()">+ Book</button>
                </div>
                <div class="appointment-list">
                    ${upcoming.map(a => `
                        <div style="padding: 0.75rem; border: 1px solid var(--border-light); border-radius: 0.5rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div style="font-weight: 600;">${new Date(a.appointment_date).toLocaleDateString()} at ${new Date(a.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">Status: <span style="color: ${a.status === 'confirmed' ? '#10B981' : '#F59E0B'}">${a.status.toUpperCase()}</span></div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
};

// Modals and Global Helpers
function openBookingModal() {
    // Basic modal for now
    const date = prompt("Enter Appointment Date (YYYY-MM-DD HH:MM):", "2024-03-20 10:00");
    if (!date) return;

    AppointmentManager.bookAppointment({
        nutritionistId: 'admin-fixed-id', // Assuming single admin for phase 1 of scheduling
        appointmentDate: date,
        notes: "Booking from dashboard"
    }).then(() => {
        alert("Booking request sent!");
        location.reload();
    }).catch(err => alert("Error: " + err.message));
}

window.AppointmentManager = AppointmentManager;
