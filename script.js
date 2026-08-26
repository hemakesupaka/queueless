// ============================================================
// QUEUELESS - SCRIPT.JS
// Smart Digital Queue Management
// ============================================================


// ============================================================
// GET HTML ELEMENTS
// ============================================================

const joinQueueButton = document.querySelector("#joinQueueBtn");
const queueModal = document.querySelector("#queueModal");
const closeModal = document.querySelector("#closeModal");

const queueForm = document.querySelector("#queueForm");
const queueFormContainer = document.querySelector("#queueFormContainer");

const ticket = document.querySelector("#ticket");
const closeTicket = document.querySelector("#closeTicket");
const cancelTicket = document.querySelector("#cancelTicket");

const adminButton = document.querySelector("#adminBtn");
const adminDashboard = document.querySelector("#adminDashboard");
const adminClose = document.querySelector("#adminClose");

const callNextButton = document.querySelector("#callNextBtn");

const waitingCount = document.querySelector("#waitingCount");
const servingNumber = document.querySelector("#servingNumber");
const completedCount = document.querySelector("#completedCount");

const adminQueueList = document.querySelector("#adminQueueList");


// ============================================================
// CURRENT CUSTOMER
// ============================================================

let currentCustomerId =
    Number(localStorage.getItem("queuelessCurrentCustomer")) || null;


// ============================================================
// LOAD QUEUE
// ============================================================

let queue = JSON.parse(
    localStorage.getItem("queuelessQueue")
) || [];


// ============================================================
// SAVE QUEUE
// ============================================================

function saveQueue() {

    localStorage.setItem(
        "queuelessQueue",
        JSON.stringify(queue)
    );

}


// ============================================================
// SAVE CURRENT CUSTOMER
// ============================================================

function saveCurrentCustomer(id) {

    currentCustomerId = id;

    localStorage.setItem(
        "queuelessCurrentCustomer",
        String(id)
    );

}


// ============================================================
// GET CURRENT CUSTOMER
// ============================================================

function getCurrentCustomer() {

    if (!currentCustomerId) {
        return null;
    }

    return queue.find(function (person) {

        return person.id === currentCustomerId;

    }) || null;

}


// ============================================================
// CREATE QUEUE NUMBER
// ============================================================

function createQueueNumber() {

    const numbers = queue

        .map(function (person) {

            if (!person.queueNumber) {
                return 0;
            }

            return parseInt(
                person.queueNumber.replace("A", "")
            );

        })

        .filter(function (number) {

            return !isNaN(number);

        });


    if (numbers.length === 0) {

        return "A01";

    }


    const highestNumber =
        Math.max(...numbers);


    return "A" +
        String(highestNumber + 1).padStart(2, "0");

}


// ============================================================
// GET PEOPLE AHEAD
// ============================================================

function getPeopleAhead(customer) {

    if (!customer) {
        return 0;
    }


    if (customer.status === "serving") {
        return 0;
    }


    if (customer.status === "completed") {
        return 0;
    }


    const peopleAhead = queue.filter(function (person) {

        return (

            person.business === customer.business &&

            person.status === "waiting" &&

            person.id !== customer.id &&

            new Date(person.joinedAt) <
            new Date(customer.joinedAt)

        );

    });


    return peopleAhead.length;

}


// ============================================================
// CALCULATE WAIT TIME
// ============================================================

function getWaitTime(customer) {

    const peopleAhead =
        getPeopleAhead(customer);


    return peopleAhead * 5;

}


// ============================================================
// UPDATE CUSTOMER TICKET
// ============================================================

function updateCustomerTicket() {

    const customer =
        getCurrentCustomer();


    if (!customer) {
        return;
    }


    const ticketBusiness =
        document.querySelector("#ticketBusiness");

    const ticketNumber =
        document.querySelector("#ticketNumber");

    const ticketMessage =
        document.querySelector("#ticketMessage");

    const peopleAheadElement =
        document.querySelector("#peopleAhead");

    const waitTimeElement =
        document.querySelector("#waitTime");


    if (!ticketBusiness) {
        return;
    }


    ticketBusiness.textContent =
        customer.business;


    ticketNumber.textContent =
        customer.queueNumber;


    const peopleAhead =
        getPeopleAhead(customer);


    const waitTime =
        getWaitTime(customer);


    peopleAheadElement.textContent =
        peopleAhead;


    waitTimeElement.textContent =
        `${waitTime} min`;


    // ========================================================
    // UPDATE MESSAGE BASED ON STATUS
    // ========================================================

    if (customer.status === "waiting") {

        ticketMessage.textContent =
            `Welcome ${customer.name}! Your place has been reserved.`;

    }


    else if (customer.status === "serving") {

        ticketMessage.textContent =
            `It's your turn, ${customer.name}! You are being served now.`;

    }


    else if (customer.status === "completed") {

        ticketMessage.textContent =
            `Thank you ${customer.name}! Your service has been completed.`;

    }

}


// ============================================================
// OPEN QUEUE MODAL
// ============================================================

if (joinQueueButton) {

    joinQueueButton.addEventListener(
        "click",
        function () {

            queueModal.classList.add("active");

            queueFormContainer.style.display =
                "block";

            ticket.classList.remove("active");

        }
    );

}


// ============================================================
// CLOSE QUEUE MODAL
// ============================================================

if (closeModal) {

    closeModal.addEventListener(
        "click",
        function () {

            queueModal.classList.remove(
                "active"
            );

        }
    );

}


// ============================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ============================================================

if (queueModal) {

    queueModal.addEventListener(
        "click",
        function (event) {

            if (event.target === queueModal) {

                queueModal.classList.remove(
                    "active"
                );

            }

        }
    );

}


// ============================================================
// JOIN QUEUE
// ============================================================

if (queueForm) {

    queueForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            // ==================================================
            // GET CUSTOMER NAME
            // ==================================================

            const customerName =
                document
                    .querySelector("#customerName")
                    .value
                    .trim();


            // ==================================================
            // GET BUSINESS
            // ==================================================

            const business =
                document
                    .querySelector("#business")
                    .value;


            // ==================================================
            // VALIDATE
            // ==================================================

            if (!customerName || !business) {

                alert(
                    "Please enter your name and choose a business."
                );

                return;

            }


            // ==================================================
            // CREATE QUEUE NUMBER
            // ==================================================

            const queueNumber =
                createQueueNumber();


            // ==================================================
            // CREATE CUSTOMER
            // ==================================================

            const customer = {

                id: Date.now(),

                name: customerName,

                business: business,

                queueNumber: queueNumber,

                status: "waiting",

                joinedAt:
                    new Date().toISOString()

            };


            // ==================================================
            // ADD TO QUEUE
            // ==================================================

            queue.push(customer);


            // ==================================================
            // SAVE
            // ==================================================

            saveQueue();


            // ==================================================
            // REMEMBER CUSTOMER
            // ==================================================

            saveCurrentCustomer(
                customer.id
            );


            // ==================================================
            // CALCULATE POSITION
            // ==================================================

            const peopleAhead =
                getPeopleAhead(customer);


            const waitTime =
                getWaitTime(customer);


            // ==================================================
            // SHOW TICKET
            // ==================================================

            document.querySelector(
                "#ticketBusiness"
            ).textContent =
                business;


            document.querySelector(
                "#ticketNumber"
            ).textContent =
                queueNumber;


            document.querySelector(
                "#ticketMessage"
            ).textContent =
                `Welcome ${customerName}! Your place has been reserved.`;


            document.querySelector(
                "#peopleAhead"
            ).textContent =
                peopleAhead;


            document.querySelector(
                "#waitTime"
            ).textContent =
                `${waitTime} min`;


            // ==================================================
            // HIDE FORM
            // ==================================================

            queueFormContainer.style.display =
                "none";


            // ==================================================
            // SHOW TICKET
            // ==================================================

            ticket.classList.add("active");


            // ==================================================
            // RESET FORM
            // ==================================================

            queueForm.reset();


            // ==================================================
            // UPDATE ADMIN
            // ==================================================

            updateAdminDashboard();

        }
    );

}


// ============================================================
// CLOSE CUSTOMER TICKET
// ============================================================

if (closeTicket) {

    closeTicket.addEventListener(
        "click",
        function () {

            queueModal.classList.remove(
                "active"
            );

        }
    );

}


// ============================================================
// LEAVE QUEUE
// ============================================================

if (cancelTicket) {

    cancelTicket.addEventListener(
        "click",
        function () {

            const customer =
                getCurrentCustomer();


            // ==================================================
            // NO CURRENT CUSTOMER
            // ==================================================

            if (!customer) {

                queueModal.classList.remove(
                    "active"
                );

                return;

            }


            // ==================================================
            // DO NOT ALLOW LEAVING AFTER SERVICE IS COMPLETED
            // ==================================================

            if (customer.status === "completed") {

                alert(
                    "This queue service has already been completed."
                );

                return;

            }


            // ==================================================
            // DO NOT ALLOW LEAVING WHILE BEING SERVED
            // ==================================================

            if (customer.status === "serving") {

                alert(
                    "You are currently being served and cannot leave the queue."
                );

                return;

            }


            // ==================================================
            // CONFIRM
            // ==================================================

            const confirmLeave =
                confirm(
                    "Are you sure you want to leave the queue?"
                );


            if (!confirmLeave) {
                return;
            }


            // ==================================================
            // REMOVE CUSTOMER
            // ==================================================

            queue =
                queue.filter(function (person) {

                    return person.id !== customer.id;

                });


            // ==================================================
            // SAVE UPDATED QUEUE
            // ==================================================

            saveQueue();


            // ==================================================
            // CLEAR CURRENT CUSTOMER
            // ==================================================

            currentCustomerId = null;

            localStorage.removeItem(
                "queuelessCurrentCustomer"
            );


            // ==================================================
            // CLOSE MODAL
            // ==================================================

            queueModal.classList.remove(
                "active"
            );


            // ==================================================
            // RESET FORM
            // ==================================================

            queueFormContainer.style.display =
                "block";


            ticket.classList.remove(
                "active"
            );


            // ==================================================
            // RESET FORM FIELDS
            // ==================================================

            if (queueForm) {
                queueForm.reset();
            }


            // ==================================================
            // UPDATE ADMIN DASHBOARD
            // ==================================================

            updateAdminDashboard();


            // ==================================================
            // MESSAGE
            // ==================================================

            alert(
                "You have left the queue."
            );

        }
    );

}


// ============================================================
// OPEN ADMIN DASHBOARD
// ============================================================

if (adminButton) {

    adminButton.addEventListener(
        "click",
        function () {

            adminDashboard.classList.add(
                "active"
            );


            updateAdminDashboard();


            setTimeout(function () {

                window.scrollTo({

                    top:
                        adminDashboard.offsetTop,

                    behavior:
                        "smooth"

                });

            }, 50);

        }
    );

}


// ============================================================
// CLOSE ADMIN DASHBOARD
// ============================================================

if (adminClose) {

    adminClose.addEventListener(
        "click",
        function () {

            adminDashboard.classList.remove(
                "active"
            );


            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        }
    );

}


// ============================================================
// UPDATE ADMIN DASHBOARD
// ============================================================

function updateAdminDashboard() {

    if (!adminQueueList) {
        return;
    }


    // ========================================================
    // H'S CLINIC ONLY
    // ========================================================

    const clinicQueue =
        queue.filter(function (person) {

            return person.business === "H's Clinic";

        });


    // ========================================================
    // WAITING
    // ========================================================

    const waitingCustomers =
        clinicQueue.filter(function (person) {

            return person.status === "waiting";

        });


    // ========================================================
    // SERVING
    // ========================================================

    const servingCustomer =
        clinicQueue.find(function (person) {

            return person.status === "serving";

        });


    // ========================================================
    // COMPLETED
    // ========================================================

    const completedCustomers =
        clinicQueue.filter(function (person) {

            return person.status === "completed";

        });


    // ========================================================
    // UPDATE COUNTERS
    // ========================================================

    waitingCount.textContent =
        waitingCustomers.length;


    completedCount.textContent =
        completedCustomers.length;


    // ========================================================
    // UPDATE SERVING NUMBER
    // ========================================================

    if (servingCustomer) {

        servingNumber.textContent =
            servingCustomer.queueNumber;


        callNextButton.textContent =
            "Finish Current Customer";


        callNextButton.classList.add(
            "finish-mode"
        );

    }

    else {

        servingNumber.textContent =
            "—";


        callNextButton.textContent =
            "Call Next";


        callNextButton.classList.remove(
            "finish-mode"
        );

    }


    // ========================================================
    // EMPTY QUEUE
    // ========================================================

    if (clinicQueue.length === 0) {

        adminQueueList.innerHTML = `

            <p class="empty-queue">
                No customers in the queue yet.
            </p>

        `;

        return;

    }


    // ========================================================
    // CLEAR LIST
    // ========================================================

    adminQueueList.innerHTML = "";


    // ========================================================
    // SORT QUEUE
    // ========================================================

    clinicQueue.sort(function (a, b) {

        return new Date(a.joinedAt) -
               new Date(b.joinedAt);

    });


    // ========================================================
    // DISPLAY CUSTOMERS
    // ========================================================

    clinicQueue.forEach(function (customer) {

        const customerRow =
            document.createElement("div");


        customerRow.className =
            "customer-row";


        // ====================================================
        // QUEUE NUMBER
        // ====================================================

        const number =
            document.createElement("strong");


        number.textContent =
            customer.queueNumber;


        // ====================================================
        // CUSTOMER NAME
        // ====================================================

        const name =
            document.createElement("span");


        name.textContent =
            customer.name;


        // ====================================================
        // STATUS
        // ====================================================

        const status =
            document.createElement("span");


        status.className =
            "customer-status";


        if (customer.status === "waiting") {

            status.textContent =
                "Waiting";


            status.classList.add(
                "status-waiting"
            );

        }


        else if (customer.status === "serving") {

            status.textContent =
                "Now Serving";


            status.classList.add(
                "status-serving"
            );

        }


        else {

            status.textContent =
                "Completed";


            status.classList.add(
                "status-completed"
            );

        }


        // ====================================================
        // ADD ELEMENTS
        // ====================================================

        customerRow.appendChild(
            number
        );


        customerRow.appendChild(
            name
        );


        customerRow.appendChild(
            status
        );


        adminQueueList.appendChild(
            customerRow
        );

    });


    // ========================================================
    // UPDATE CUSTOMER TICKET
    // ========================================================

    updateCustomerTicket();

}


// ============================================================
// CALL NEXT CUSTOMER
// ============================================================

if (callNextButton) {

    callNextButton.addEventListener(
        "click",
        function () {


            // ==================================================
            // FIND CURRENT SERVING CUSTOMER
            // ==================================================

            const servingCustomer =
                queue.find(function (person) {

                    return (

                        person.business === "H's Clinic" &&

                        person.status === "serving"

                    );

                });


            // ==================================================
            // FINISH CURRENT CUSTOMER
            // ==================================================

            if (servingCustomer) {

                servingCustomer.status =
                    "completed";


                saveQueue();


                updateAdminDashboard();


                updateCustomerTicket();


                return;

            }


            // ==================================================
            // FIND NEXT WAITING CUSTOMER
            // ==================================================

            const nextCustomer =
                queue.find(function (person) {

                    return (

                        person.business === "H's Clinic" &&

                        person.status === "waiting"

                    );

                });


            // ==================================================
            // NO CUSTOMER
            // ==================================================

            if (!nextCustomer) {

                alert(
                    "There are no customers waiting."
                );

                return;

            }


            // ==================================================
            // MOVE TO SERVING
            // ==================================================

            nextCustomer.status =
                "serving";


            // ==================================================
            // SAVE
            // ==================================================

            saveQueue();


            // ==================================================
            // UPDATE ADMIN
            // ==================================================

            updateAdminDashboard();


            // ==================================================
            // UPDATE CUSTOMER TICKET
            // ==================================================

            updateCustomerTicket();


            // ==================================================
            // NOTIFY ADMIN
            // ==================================================

            alert(

                `${nextCustomer.queueNumber} - ${nextCustomer.name} is now being served.`

            );

        }
    );

}


// ============================================================
// AUTO REFRESH
// ============================================================

setInterval(function () {

    queue =
        JSON.parse(
            localStorage.getItem("queuelessQueue")
        ) || [];


    updateCustomerTicket();


    if (
        adminDashboard &&
        adminDashboard.classList.contains("active")
    ) {

        updateAdminDashboard();

    }

}, 2000);


// ============================================================
// INITIAL LOAD
// ============================================================

updateAdminDashboard();

updateCustomerTicket();