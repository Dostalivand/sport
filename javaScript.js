document.addEventListener('DOMContentLoaded', function() {
    const addPersonForm = document.getElementById('addPersonForm');
    const personNameInput = document.getElementById('personName');
    const personWeightInput = document.getElementById('personWeight');
    const personBirthYearInput = document.getElementById('personBirthYear');
    const personBeltColorInput = document.getElementById('personBeltColor');
    const personRegistrationDateInput = document.getElementById('personRegistrationDate');
    const personImageInput = document.getElementById('personImage');
    const peopleList = document.getElementById('peopleList');
    const calendarContainer = document.getElementById('calendarContainer');
    const calendar = document.getElementById('calendar');
    const calculateAttendanceButton = document.getElementById('calculateAttendance');
    const results = document.getElementById('results');

    let attendanceRecords = JSON.parse(localStorage.getItem('attendanceRecords')) || {};
    let selectedPerson = null;

    // ذخیره رکوردهای حضور و غیاب در LocalStorage
    function saveAttendanceRecords() {
        localStorage.setItem('attendanceRecords', JSON.stringify(attendanceRecords));
    }

    // ایجاد لیست افراد
    function renderPeopleList() {
        peopleList.innerHTML = '';
        for (const name in attendanceRecords) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <div class="person-info">
                    <img src="${attendanceRecords[name].image}" alt="${name}" class="person-image">
                    <div class="person-details">
                        <strong>${name}</strong>
                        <p>وزن: ${attendanceRecords[name].weight} کیلوگرم</p>
                        <p>سال تولد: ${attendanceRecords[name].birthYear}</p>
                        <p>رنگ کمربند: ${attendanceRecords[name].beltColor}</p>
                        <p>تاریخ ثبت نام: ${attendanceRecords[name].registrationDate}</p>
                    </div>
                </div>
                <div class="actions">
                    <button class="selectPerson">انتخاب</button>
                    <button class="deletePerson">حذف</button>
                </div>
            `;
            listItem.querySelector('.selectPerson').addEventListener('click', function() {
                selectPerson(name);
            });
            listItem.querySelector('.deletePerson').addEventListener('click', function() {
                deletePerson(name);
            });
            peopleList.appendChild(listItem);
        }
    }

    // ایجاد تقویم شمسی
    function generateCalendar() {
        const daysInMonth = new Date(1403, 12, 0).getDate();
        calendar.innerHTML = '';
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'day';
            dayElement.textContent = day;
            dayElement.addEventListener('click', function() {
                toggleDayStatus(day);
            });
            calendar.appendChild(dayElement);
        }
    }

    // به‌روزرسانی تقویم برای کاربر انتخاب‌شده
    function updateCalendar(name) {
        const days = calendar.querySelectorAll('.day');
        days.forEach(day => {
            const dayNumber = day.textContent;
            day.className = 'day';
            if (attendanceRecords[name] && attendanceRecords[name].days) {
                if (attendanceRecords[name].days[dayNumber]) {
                    const status = attendanceRecords[name].days[dayNumber];
                    day.classList.add(status);
                    if (status === 'absent' && attendanceRecords[name].notes && attendanceRecords[name].notes[dayNumber]) {
                        const note = document.createElement('div');
                        note.className = 'note';
                        note.textContent = attendanceRecords[name].notes[dayNumber];
                        day.appendChild(note);
                    }
                }
            }
        });
    }

    // انتخاب کاربر
    function selectPerson(name) {
        selectedPerson = name;
        updateCalendar(name);
        calendarContainer.style.display = 'block';
    }

    // تغییر وضعیت روز در تقویم
    function toggleDayStatus(dayNumber) {
        if (!selectedPerson) return;

        const dayElement = calendar.querySelector(`.day:nth-child(${dayNumber})`);
        if (!attendanceRecords[selectedPerson].days) {
            attendanceRecords[selectedPerson].days = {};
        }
        if (!attendanceRecords[selectedPerson].notes) {
            attendanceRecords[selectedPerson].notes = {};
        }
        if (dayElement.classList.contains('present')) {
            dayElement.classList.remove('present');
            dayElement.classList.add('absent');
            const reason = prompt("لطفاً علت غیبت را وارد کنید:");
            attendanceRecords[selectedPerson].days[dayNumber] = 'absent';
            attendanceRecords[selectedPerson].notes[dayNumber] = reason || '';
        } else if (dayElement.classList.contains('absent')) {
            dayElement.classList.remove('absent');
            delete attendanceRecords[selectedPerson].days[dayNumber];
            delete attendanceRecords[selectedPerson].notes[dayNumber];
        } else {
            dayElement.classList.add('present');
            attendanceRecords[selectedPerson].days[dayNumber] = 'present';
        }
        saveAttendanceRecords();
    }

    // حذف کاربر
    function deletePerson(name) {
        delete attendanceRecords[name];
        saveAttendanceRecords();
        renderPeopleList();
        if (selectedPerson === name) {
            selectedPerson = null;
            calendarContainer.style.display = 'none';
        }
    }

    // افزودن کاربر جدید
    addPersonForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const personName = personNameInput.value.trim();
        const personWeight = personWeightInput.value.trim();
        const personBirthYear = personBirthYearInput.value.trim();
        const personBeltColor = personBeltColorInput.value.trim();
        const personRegistrationDate = personRegistrationDateInput.value.trim();
        const personImageFile = personImageInput.files[0];

        if (personName && !attendanceRecords[personName]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageSrc = e.target.result;
                attendanceRecords[personName] = {
                    weight: personWeight,
                    birthYear: personBirthYear,
                    beltColor: personBeltColor,
                    registrationDate: personRegistrationDate,
                    image: imageSrc,
                    present: 0,
                    absent: 0,
                    days: {},
                    notes: {}
                };
                saveAttendanceRecords();
                renderPeopleList();
                personNameInput.value = '';
                personWeightInput.value = '';
                personBirthYearInput.value = '';
                personBeltColorInput.value = '';
                personRegistrationDateInput.value = '';
                personImageInput.value = '';
            };
            reader.readAsDataURL(personImageFile);
        }
    });

    // محاسبه حضور و غیاب
    calculateAttendanceButton.addEventListener('click', function() {
        results.innerHTML = '<h3>نتایج حضور و غیاب خرداد ماه 1403:</h3>';
        for (const name in attendanceRecords) {
            const days = attendanceRecords[name].days;
            attendanceRecords[name].present = 0;
            attendanceRecords[name].absent = 0;
            for (const day in days) {
                if (days[day] === 'present') {
                    attendanceRecords[name].present++;
                } else if (days[day] === 'absent') {
                    attendanceRecords[name].absent++;
                    if (attendanceRecords[name].notes && attendanceRecords[name].notes[day]) {
                        results.innerHTML += `
                            <p>${name} - روز ${day}: غیبت به دلیل "${attendanceRecords[name].notes[day]}"</p>
                        `;
                    }
                }
            }
        }
        saveAttendanceRecords();
        renderResults();
    });

    // نمایش نتایج
    function renderResults() {
        for (const name in attendanceRecords) {
            const record = attendanceRecords[name];
            results.innerHTML += `
                <p>${name}: حاضر - ${record.present} بار، غایب - ${record.absent} بار</p>
            `;
        }
    }

    // بارگذاری اولیه
    renderPeopleList();
    generateCalendar();
});
