document.addEventListener('DOMContentLoaded', () => {
    populateCompetitionDropdown();
    renderTable();
    setupEventListeners();
});

function getAllCompetitions() {
    return [...new Set(studentsData.flatMap(student => Object.keys(student.competitions)))];
}

function populateCompetitionDropdown() {
    const competitionSelect = document.getElementById('competition-select');
    getAllCompetitions().forEach(comp => {
        const option = new Option(comp, comp);
        competitionSelect.appendChild(option);
    });
}

function renderTable(filterCompetition = null) {
    const table = document.getElementById('results-table');
    const thead = table.querySelector('thead tr');
    const tbody = table.querySelector('tbody');
    
    // Clear existing columns (except name, grade, school, city)
    while (thead.cells.length > 4) thead.deleteCell(-1);
    tbody.innerHTML = '';

    const competitions = getAllCompetitions();

    // Add competition columns to header
    competitions.forEach(comp => {
        const th = document.createElement('th');
        th.textContent = comp;
        thead.appendChild(th);
    });

    // Add student rows
    let visibleRowCount = 0;
    studentsData.forEach(student => {
        const row = document.createElement('tr');

        // Add basic info cells
        ['name', 'grade', 'school', 'city'].forEach(field => {
            const td = document.createElement('td');
            td.textContent = student[field];
            row.appendChild(td);
        });

        // Add competition cells
        competitions.forEach(comp => {
            const td = document.createElement('td');
            const result = student.competitions[comp];
            td.textContent = result || '-';
            td.classList.toggle('empty-cell', !result);
            row.appendChild(td);
        });

        // Determine if row should be visible
        const hasParticipation = filterCompetition ? student.competitions[filterCompetition] : true;
        row.style.display = hasParticipation ? '' : 'none';

        // Apply alternating row colors only to visible rows
        if (hasParticipation) {
            visibleRowCount++;
            row.style.backgroundColor = visibleRowCount % 2 === 0 ? 'var(--lightgray)' : '';
        }

        tbody.appendChild(row);
    });

    // Hide competition columns if filtered
    if (filterCompetition) {
        Array.from(thead.cells).slice(4).forEach((header, index) => {
            const isVisible = header.textContent === filterCompetition;
            header.style.display = isVisible ? '' : 'none';
            Array.from(tbody.rows).forEach(row => row.cells[index + 4].style.display = isVisible ? '' : 'none');
        });
    }
}

function setupEventListeners() {
    document.getElementById('apply-filter').addEventListener('click', () => {
        const selectedCompetition = document.getElementById('competition-select').value;
        renderTable(selectedCompetition === 'all' ? null : selectedCompetition);
    });
}
