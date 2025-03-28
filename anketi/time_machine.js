function initializeCalendar() {
    const calendar = document.getElementById('calendar');
    const selectionInfo = document.getElementById('selectionInfo');
    const daysOfWeek = ['Понеделник', 'Вторник', 'Сряда', 'Четвъртък', 'Петък', 'Събота', 'Неделя'];

    // Get references to all form fields
    const dayFields = {
        'Понеделник': document.getElementsByName('entry.1583041828')[0],
        'Вторник': document.getElementsByName('entry.1927286252')[0],
        'Сряда': document.getElementsByName('entry.580415229')[0],
        'Четвъртък': document.getElementsByName('entry.852829648')[0],
        'Петък': document.getElementsByName('entry.602504872')[0],
        'Събота': document.getElementsByName('entry.2121097989')[0],
        'Неделя': document.getElementsByName('entry.1842611270')[0]
    };


    // Generate time column (7am to 7pm)
    const timeColumn = document.querySelector('.time-column');
    for (let hour = 8; hour <= 18; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot';

            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            timeLabel.textContent = `${hour}:${minute.toString().padStart(2, '0')}`;

            timeSlot.appendChild(timeLabel);
            timeColumn.appendChild(timeSlot);
        }
    }

    // Track the currently active column
    let activeColumn = null;

    // Generate day columns
    daysOfWeek.forEach(day => {
        const dayColumn = document.createElement('div');
        dayColumn.className = 'day-column';
        dayColumn.dataset.day = day;

        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        dayColumn.appendChild(dayHeader);

        // Create time slots for the day
        for (let hour = 8; hour <= 18; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const daySlot = document.createElement('div');
                daySlot.className = 'day-slot';
                dayColumn.appendChild(daySlot);
            }
        }

        // Create selection element for this column
        const selection = document.createElement('div');
        selection.className = 'selection';
        selection.style.display = 'none';
        dayColumn.appendChild(selection);

        // Common function to start selection
        const startSelection = (clientY) => {
            const rect = dayColumn.getBoundingClientRect();
            const headerHeight = dayColumn.querySelector('.day-header').offsetHeight;
            const startY = clientY - rect.top - headerHeight;

            // Only start selection if in the content area (below header)
            if (startY >= 0) {
                activeColumn = dayColumn;
                dayColumn.dataset.selecting = 'true';
                dayColumn.dataset.startY = startY;

                // Create or reset selection
                selection.style.left = '0';
                selection.style.width = '100%';
                selection.style.top = (startY + headerHeight) + 'px';
                selection.style.height = '0';
                selection.style.display = 'block';

                updateSelectionInfo(startY, startY, day);
            }
        };

        // Common function to update selection
        const updateSelection = (clientY) => {
            if (dayColumn.dataset.selecting !== 'true') return;

            const rect = dayColumn.getBoundingClientRect();
            const headerHeight = dayColumn.querySelector('.day-header').offsetHeight;
            const currentY = clientY - rect.top - headerHeight;
            const startY = parseFloat(dayColumn.dataset.startY);

            // Constrain to column bounds
            const columnHeight = rect.height - headerHeight;
            const constrainedY = Math.max(0, Math.min(currentY, columnHeight));

            // Update selection dimensions
            if (constrainedY > startY) {
                selection.style.top = (startY + headerHeight) + 'px';
                selection.style.height = (constrainedY - startY) + 'px';
            } else {
                selection.style.top = (constrainedY + headerHeight) + 'px';
                selection.style.height = (startY - constrainedY) + 'px';
            }

            updateSelectionInfo(startY, constrainedY, day);
        };

        // Common function to end selection
        const endSelection = () => {
            if (dayColumn.dataset.selecting === 'true') {
                const startY = parseFloat(dayColumn.dataset.startY);
                const endY = parseFloat(dayColumn.dataset.endY || dayColumn.dataset.startY);

                if (startY === endY) {
                    selection.style.display = 'none';
                    selectionInfo.textContent = 'Изборът е отменен';
                } else {
                    // Update the form field for this day
                    updateFormField(day, startY, endY);
                }

                dayColumn.dataset.selecting = 'false';
                activeColumn = null;
            }
        };

        // Mouse events
        dayColumn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startSelection(e.clientY);
        });

        dayColumn.addEventListener('mousemove', (e) => {
            e.preventDefault();
            updateSelection(e.clientY);
        });

        dayColumn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            endSelection();
        });

        dayColumn.addEventListener('mouseleave', () => {
            if (dayColumn.dataset.selecting === 'true') {
                dayColumn.dataset.selecting = 'false';
                selection.style.display = 'none';
                selectionInfo.textContent = 'Изборът е отменен';
                activeColumn = null;
            }
        });

        // Touch events
        dayColumn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                startSelection(e.touches[0].clientY);
            }
        }, { passive: false });

        dayColumn.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (e.touches.length === 1) {
                updateSelection(e.touches[0].clientY);
            }
        }, { passive: false });

        dayColumn.addEventListener('touchend', (e) => {
            e.preventDefault();
            endSelection();
        }, { passive: false });

        calendar.appendChild(dayColumn);
    });

    // Convert pixels to time for a specific column
    function pixelsToTime(column, pixels) {
        const rect = column.getBoundingClientRect();
        const headerHeight = column.querySelector('.day-header').offsetHeight;
        const contentHeight = rect.height - headerHeight;
        const totalMinutes = 11 * 60; // 8am to 7pm
        const minutesPerPixel = totalMinutes / contentHeight;
        const minutesFromTop = pixels * minutesPerPixel;

        const totalMinutesFrom8am = Math.max(0, Math.min(minutesFromTop, totalMinutes));
        const hours = 8 + Math.floor(totalMinutesFrom8am / 60);
        const minutes = Math.floor(totalMinutesFrom8am % 60);
        return `${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    // Update the form field for a specific day
    function updateFormField(day, startY, endY) {
        const startTime = pixelsToTime(activeColumn, startY);
        const endTime = pixelsToTime(activeColumn, endY);

        // Update the corresponding form field
        dayFields[day].value = `${startTime} - ${endTime}`;

    }

    // Update the selection info display
    function updateSelectionInfo(startY, endY, day) {
        if (!activeColumn) return;

        // Store the current endY for mouseup/touchend
        activeColumn.dataset.endY = endY;

        const startTime = pixelsToTime(activeColumn, startY);
        const endTime = pixelsToTime(activeColumn, endY);

        selectionInfo.innerHTML = `
            <strong>Избор за ${day}:</strong>
            ${startTime} до ${endTime}<br>
        `;
        }

    // Prevent page scroll on touch devices
    document.addEventListener('touchmove', (e) => {
        if (activeColumn) {
            e.preventDefault();
        }
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', initializeCalendar);

function disable_submit_button(){
    const submitBtn = document.getElementById('submitBtn');        
    submitBtn.disabled = true;
    submitBtn.classList.add('processing');
    submitBtn.textContent = 'Изпратено...';
    setTimeout(function(){
        submitBtn.disabled = false;
        submitBtn.classList.remove('processing');
        submitBtn.textContent = 'Изпрати';
    },2000)
}