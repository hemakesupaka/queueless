// ============================================================
// QUEUELESS - SCRIPT.JS
// Smart Digital Queue Management
// ============================================================


// ============================================================
// BACKEND URL
// ============================================================

const API_URL = "http://127.0.0.1:5000";


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
const adminLogout = document.querySelector("#adminLogout");

const callNextButton = document.querySelector("#callNextBtn");

const waitingCount = document.querySelector("#waitingCount");
const servingNumber = document.querySelector("#servingNumber");
const completedCount = document.querySelector("#completedCount");

const adminQueueList = document.querySelector("#adminQueueList");


// ============================================================
// ADMIN LOGIN ELEMENTS
// ============================================================

const adminLoginModal =
    document.querySelector("#adminLoginModal");

const adminLoginForm =
    document.querySelector("#adminLoginForm");

const closeAdminLogin =
    document.querySelector("#closeAdminLogin");

const adminLoginError =
    document.querySelector("#adminLoginError");


// ============================================================
// CURRENT CUSTOMER
// ============================================================

let currentCustomerId =
    Number(
        localStorage.getItem("queuelessCurrentCustomer")
    ) || null;


// ============================================================
// LOCAL QUEUE
// ============================================================

let queue =
    JSON.parse(
        localStorage.getItem("queuelessQueue")
    ) || [];


// ============================================================
// SELECTED ADMIN BUSINESS
// ============================================================

let selectedBusiness =
    localStorage.getItem(
        "queuelessAdminBusiness"
    ) || "H's Clinic";


// ============================================================
// AVAILABLE BUSINESSES
// ============================================================

const availableBusinesses = [
    "H's Clinic",
    "ABC Bank",
    "City Salon"
];


// ============================================================
// ADMIN LOGIN STATE
// ============================================================

let isAdminLoggedIn =
    sessionStorage.getItem(
        "queuelessAdminLoggedIn"
    ) === "true";


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

    return (
        queue.find(function (person) {

            return person.id === currentCustomerId;

        }) || null
    );

}


// ============================================================
// GET PEOPLE AHEAD
// ============================================================

function getPeopleAhead(customer) {

    if (!customer) {
        return 0;
    }

    if (
        customer.status === "serving" ||
        customer.status === "completed" ||
        customer.status === "left"
    ) {
        return 0;
    }

    const peopleAhead =
        queue.filter(function (person) {

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

    if (
        !ticketBusiness ||
        !ticketNumber ||
        !ticketMessage ||
        !peopleAheadElement ||
        !waitTimeElement
    ) {
        return;
    }


    // Business

    ticketBusiness.textContent =
        customer.business;


    // Queue number

    ticketNumber.textContent =
        customer.queueNumber;


    // People ahead

    const peopleAhead =
        getPeopleAhead(customer);

    peopleAheadElement.textContent =
        peopleAhead;


    // Estimated wait

    const waitTime =
        getWaitTime(customer);

    waitTimeElement.textContent =
        `${waitTime} min`;


    // ========================================================
    // STATUS MESSAGE
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

    else if (customer.status === "left") {

        ticketMessage.textContent =
            `You have left the queue, ${customer.name}.`;

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

            queueModal.classList.remove("active");

        }
    );

}


// ============================================================
// CLOSE QUEUE MODAL OUTSIDE CLICK
// ============================================================

if (queueModal) {

    queueModal.addEventListener(
        "click",
        function (event) {

            if (event.target === queueModal) {

                queueModal.classList.remove("active");

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
        async function (event) {

            event.preventDefault();


            const customerName =
                document
                    .querySelector("#customerName")
                    .value
                    .trim();


            const business =
                document
                    .querySelector("#business")
                    .value;


            if (!customerName || !business) {

                alert(
                    "Please enter your name and choose a business."
                );

                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/queue`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({

                                name:
                                    customerName,

                                business:
                                    business

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.error ||
                        "Unable to join the queue."
                    );

                    return;
                }


                console.log(
                    "Backend response:",
                    data
                );


                // ==================================================
                // CREATE CUSTOMER OBJECT
                // ==================================================

                const customer = {

                    id:
                        data.id,

                    name:
                        data.name,

                    business:
                        data.business,

                    queueNumber:
                        data.queue_number_text ||
                        (
                            "A" +
                            String(
                                data.queue_number
                            ).padStart(2, "0")
                        ),

                    status:
                        data.status || "waiting",

                    joinedAt:
                        data.joined_at ||
                        new Date().toISOString()

                };


                // ==================================================
                // LOAD LATEST QUEUE
                // ==================================================

                await loadQueueFromBackend();


                // ==================================================
                // SAVE CURRENT CUSTOMER
                // ==================================================

                saveCurrentCustomer(
                    customer.id
                );


                updateCustomerTicket();


                // ==================================================
                // SHOW TICKET
                // ==================================================

                queueFormContainer.style.display =
                    "none";

                ticket.classList.add("active");


                queueForm.reset();


                alert(
                    `Successfully joined the queue! Your ticket number is ${customer.queueNumber}.`
                );

            }

            catch (error) {

                console.error(
                    "Queue API Error:",
                    error
                );

                alert(
                    "Unable to connect to QueueLess server. Please make sure Flask is running."
                );

            }

        }
    );

}


// ============================================================
// LOAD QUEUE FROM BACKEND
// ============================================================

async function loadQueueFromBackend() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/queue`
            );


        if (!response.ok) {

            console.error(
                "Unable to load queue from backend."
            );

            return;
        }


        const backendQueue =
            await response.json();


        queue =
            backendQueue.map(function (customer) {

                return {

                    id:
                        customer.id,

                    name:
                        customer.name,

                    business:
                        customer.business,

                    queueNumber:
                        customer.queue_number_text ||
                        (
                            "A" +
                            String(
                                customer.queue_number
                            ).padStart(2, "0")
                        ),

                    status:
                        customer.status,

                    joinedAt:
                        customer.joined_at

                };

            });


        saveQueue();


        updateAdminDashboard();


        updateCustomerTicket();

    }

    catch (error) {

        console.error(
            "Backend connection error:",
            error
        );

    }

}


// ============================================================
// CLOSE CUSTOMER TICKET
// ============================================================

if (closeTicket) {

    closeTicket.addEventListener(
        "click",
        function () {

            queueModal.classList.remove("active");

        }
    );

}


// ============================================================
// LEAVE QUEUE
// ============================================================

if (cancelTicket) {

    cancelTicket.addEventListener(
        "click",
        async function () {

            const customer =
                getCurrentCustomer();


            if (!customer) {

                queueModal.classList.remove(
                    "active"
                );

                return;
            }


            if (customer.status === "completed") {

                alert(
                    "This queue service has already been completed."
                );

                return;
            }


            if (customer.status === "serving") {

                alert(
                    "You are currently being served and cannot leave the queue."
                );

                return;
            }


            const confirmLeave =
                confirm(
                    "Are you sure you want to leave the queue?"
                );


            if (!confirmLeave) {
                return;
            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/queue/${customer.id}/leave`,
                        {
                            method: "POST"
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.error ||
                        "Unable to leave queue."
                    );

                    return;
                }


                currentCustomerId =
                    null;


                localStorage.removeItem(
                    "queuelessCurrentCustomer"
                );


                queueModal.classList.remove(
                    "active"
                );


                queueFormContainer.style.display =
                    "block";


                ticket.classList.remove(
                    "active"
                );


                if (queueForm) {
                    queueForm.reset();
                }


                await loadQueueFromBackend();


                alert(
                    "You have left the queue."
                );

            }

            catch (error) {

                console.error(
                    "Leave Queue Error:",
                    error
                );

                alert(
                    "Unable to connect to QueueLess server."
                );

            }

        }
    );

}


// ============================================================
// CREATE ADMIN BUSINESS SELECTOR
// ============================================================

function createBusinessSelector() {

    if (!adminDashboard) {
        return;
    }


    if (
        document.querySelector(
            "#adminBusinessSelector"
        )
    ) {
        return;
    }


    const selectorContainer =
        document.createElement("div");


    selectorContainer.id =
        "adminBusinessSelector";


    selectorContainer.style.marginBottom =
        "20px";


    const label =
        document.createElement("label");


    label.textContent =
        "Select Business: ";


    label.style.fontWeight =
        "600";


    const select =
        document.createElement("select");


    select.id =
        "adminBusinessSelect";


    select.style.padding =
        "8px 12px";


    select.style.marginLeft =
        "8px";


    select.style.borderRadius =
        "6px";


    availableBusinesses.forEach(
        function (business) {

            const option =
                document.createElement("option");


            option.value =
                business;


            option.textContent =
                business;


            if (
                business ===
                selectedBusiness
            ) {

                option.selected =
                    true;

            }


            select.appendChild(
                option
            );

        }
    );


    select.addEventListener(
        "change",
        function () {

            selectedBusiness =
                select.value;


            localStorage.setItem(
                "queuelessAdminBusiness",
                selectedBusiness
            );


            updateAdminDashboard();

        }
    );


    selectorContainer.appendChild(
        label
    );


    selectorContainer.appendChild(
        select
    );


    adminDashboard.insertBefore(
        selectorContainer,
        adminDashboard.firstChild
    );

}


// ============================================================
// SHOW ADMIN LOGIN MODAL
// ============================================================

function showAdminLogin() {

    if (!adminLoginModal) {

        alert(
            "Admin login window is not available."
        );

        return;
    }


    if (adminLoginError) {

        adminLoginError.textContent =
            "";

    }


    if (adminLoginForm) {

        adminLoginForm.reset();

    }


    adminLoginModal.classList.add(
        "active"
    );

}


// ============================================================
// CLOSE ADMIN LOGIN MODAL
// ============================================================

if (closeAdminLogin) {

    closeAdminLogin.addEventListener(
        "click",
        function () {

            adminLoginModal.classList.remove(
                "active"
            );

        }
    );

}


// ============================================================
// CLOSE ADMIN LOGIN OUTSIDE CLICK
// ============================================================

if (adminLoginModal) {

    adminLoginModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                adminLoginModal
            ) {

                adminLoginModal.classList.remove(
                    "active"
                );

            }

        }
    );

}


// ============================================================
// REAL ADMIN LOGIN
// ============================================================

if (adminLoginForm) {

    adminLoginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const username =
                document
                    .querySelector("#adminUsername")
                    .value
                    .trim();


            const password =
                document
                    .querySelector("#adminPassword")
                    .value;


            if (adminLoginError) {

                adminLoginError.textContent =
                    "";

            }


            try {

                const response =
                    await fetch(
                        `${API_URL}/api/admin/login`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body: JSON.stringify({

                                username:
                                    username,

                                password:
                                    password

                            })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    if (adminLoginError) {

                        adminLoginError.textContent =
                            data.error ||
                            "Invalid username or password.";

                    }

                    return;
                }


                // ==================================================
                // LOGIN SUCCESS
                // ==================================================

                isAdminLoggedIn =
                    true;


                sessionStorage.setItem(
                    "queuelessAdminLoggedIn",
                    "true"
                );


                adminLoginModal.classList.remove(
                    "active"
                );


                adminDashboard.classList.add(
                    "active"
                );


                createBusinessSelector();


                await loadQueueFromBackend();


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

            catch (error) {

                console.error(
                    "Admin Login Error:",
                    error
                );


                if (adminLoginError) {

                    adminLoginError.textContent =
                        "Unable to connect to the server. Make sure Flask is running.";

                }

            }

        }
    );

}


// ============================================================
// OPEN ADMIN DASHBOARD
// ============================================================

if (adminButton) {

    adminButton.addEventListener(
        "click",
        async function () {

            // ==================================================
            // CHECK BACKEND SESSION
            // ==================================================

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/admin/check`,
                        {
                            method: "GET",
                            credentials: "include"
                        }
                    );


                const data =
                    await response.json();


                if (response.ok && data.logged_in) {

                    isAdminLoggedIn =
                        true;


                    sessionStorage.setItem(
                        "queuelessAdminLoggedIn",
                        "true"
                    );

                }

                else {

                    isAdminLoggedIn =
                        false;

                    sessionStorage.removeItem(
                        "queuelessAdminLoggedIn"
                    );

                }

            }

            catch (error) {

                console.error(
                    "Admin session check error:",
                    error
                );

            }


            // ==================================================
            // NOT LOGGED IN
            // ==================================================

            if (!isAdminLoggedIn) {

                showAdminLogin();

                return;

            }


            // ==================================================
            // OPEN DASHBOARD
            // ==================================================

            adminDashboard.classList.add(
                "active"
            );


            createBusinessSelector();


            await loadQueueFromBackend();


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
// LOGOUT FUNCTION
// ============================================================

async function logoutAdmin() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/admin/logout`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );


        if (!response.ok) {

            console.error(
                "Logout request failed."
            );

        }

    }

    catch (error) {

        console.error(
            "Logout Error:",
            error
        );

    }


    isAdminLoggedIn =
        false;


    sessionStorage.removeItem(
        "queuelessAdminLoggedIn"
    );


    adminDashboard.classList.remove(
        "active"
    );


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


// ============================================================
// LOGOUT BUTTON
// ============================================================

if (adminLogout) {

    adminLogout.addEventListener(
        "click",
        async function () {

            await logoutAdmin();

        }
    );

}


// ============================================================
// BACK TO WEBSITE
// ============================================================

if (adminClose) {

    adminClose.addEventListener(
        "click",
        async function () {

            await logoutAdmin();

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


    createBusinessSelector();


    const businessQueue =
        queue.filter(function (person) {

            return (
                person.business ===
                selectedBusiness
            );

        });


    const waitingCustomers =
        businessQueue.filter(function (person) {

            return (
                person.status ===
                "waiting"
            );

        });


    const servingCustomer =
        businessQueue.find(function (person) {

            return (
                person.status ===
                "serving"
            );

        });


    const completedCustomers =
        businessQueue.filter(function (person) {

            return (
                person.status ===
                "completed"
            );

        });


    waitingCount.textContent =
        waitingCustomers.length;


    completedCount.textContent =
        completedCustomers.length;


    // ========================================================
    // CURRENT SERVING CUSTOMER
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
    // UPDATE BUSINESS TITLE
    // ========================================================

    const adminBusinessTitle =
        document.querySelector(
            ".admin-controls h3"
        );


    if (adminBusinessTitle) {

        adminBusinessTitle.textContent =
            selectedBusiness;

    }


    const adminBusinessDescription =
        document.querySelector(
            ".admin-controls p"
        );


    if (adminBusinessDescription) {

        adminBusinessDescription.textContent =
            `Manage today's customer queue for ${selectedBusiness}`;

    }


    // ========================================================
    // EMPTY QUEUE
    // ========================================================

    if (businessQueue.length === 0) {

        adminQueueList.innerHTML = `

            <p class="empty-queue">
                No customers in ${selectedBusiness} queue yet.
            </p>

        `;

        return;

    }


    // ========================================================
    // CLEAR LIST
    // ========================================================

    adminQueueList.innerHTML =
        "";


    // ========================================================
    // SORT BY JOIN TIME
    // ========================================================

    businessQueue.sort(function (a, b) {

        return (
            new Date(a.joinedAt) -
            new Date(b.joinedAt)
        );

    });


    // ========================================================
    // DISPLAY CUSTOMERS
    // ========================================================

    businessQueue.forEach(
        function (customer) {

            const customerRow =
                document.createElement("div");


            customerRow.className =
                "customer-row";


            const number =
                document.createElement("strong");


            number.textContent =
                customer.queueNumber;


            const name =
                document.createElement("span");


            name.textContent =
                customer.name;


            const status =
                document.createElement("span");


            status.className =
                "customer-status";


            // ==================================================
            // STATUS
            // ==================================================

            if (
                customer.status ===
                "waiting"
            ) {

                status.textContent =
                    "Waiting";


                status.classList.add(
                    "status-waiting"
                );

            }

            else if (
                customer.status ===
                "serving"
            ) {

                status.textContent =
                    "Now Serving";


                status.classList.add(
                    "status-serving"
                );

            }

            else if (
                customer.status ===
                "completed"
            ) {

                status.textContent =
                    "Completed";


                status.classList.add(
                    "status-completed"
                );

            }

            else if (
                customer.status ===
                "left"
            ) {

                status.textContent =
                    "Left";

            }


            customerRow.appendChild(
                number
            );


            customerRow.appendChild(
                name
            );


            customerRow.appendChild(
                status
            );


            // ==================================================
            // COMPLETE BUTTON
            // ==================================================

            if (
                customer.status ===
                "serving"
            ) {

                const completeButton =
                    document.createElement("button");


                completeButton.className =
                    "complete-customer-btn";


                completeButton.textContent =
                    "Complete";


                completeButton.addEventListener(
                    "click",
                    function () {

                        completeCustomer(
                            customer.id
                        );

                    }
                );


                customerRow.appendChild(
                    completeButton
                );

            }


            adminQueueList.appendChild(
                customerRow
            );

        }
    );


    updateCustomerTicket();

}


// ============================================================
// COMPLETE CUSTOMER
// ============================================================

async function completeCustomer(customerId) {

    try {

        const response =
            await fetch(
                `${API_URL}/api/queue/${customerId}/complete`,
                {
                    method: "POST",
                    credentials: "include"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            alert(
                data.error ||
                "Unable to complete customer."
            );

            return;

        }


        await loadQueueFromBackend();

    }

    catch (error) {

        console.error(
            "Complete Customer Error:",
            error
        );


        alert(
            "Unable to connect to QueueLess server."
        );

    }

}


// ============================================================
// CALL NEXT / FINISH CURRENT CUSTOMER
// ============================================================

if (callNextButton) {

    callNextButton.addEventListener(
        "click",
        async function () {

            const servingCustomer =
                queue.find(function (person) {

                    return (

                        person.business ===
                        selectedBusiness &&

                        person.status ===
                        "serving"

                    );

                });


            // ==================================================
            // FINISH CURRENT CUSTOMER
            // ==================================================

            if (servingCustomer) {

                try {

                    const response =
                        await fetch(
                            `${API_URL}/api/queue/${servingCustomer.id}/complete`,
                            {
                                method: "POST",
                                credentials: "include"
                            }
                        );


                    const data =
                        await response.json();


                    if (!response.ok) {

                        alert(
                            data.error ||
                            "Unable to finish current customer."
                        );

                        return;

                    }


                    alert(
                        `${servingCustomer.queueNumber} - ${servingCustomer.name} has completed service.`
                    );


                    await loadQueueFromBackend();

                }

                catch (error) {

                    console.error(
                        "Finish Customer Error:",
                        error
                    );


                    alert(
                        "Unable to connect to QueueLess server."
                    );

                }


                return;

            }


            // ==================================================
            // CALL NEXT CUSTOMER
            // ==================================================

            try {

                const response =
                    await fetch(
                        `${API_URL}/api/queue/next`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            credentials:
                                "include",

                            body: JSON.stringify({

                                business:
                                    selectedBusiness

                            })

                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {

                    alert(
                        data.error ||
                        "Unable to call next customer."
                    );

                    return;

                }


                await loadQueueFromBackend();


                const queueNumber =
                    data.queue_number_text ||
                    (
                        "A" +
                        String(
                            data.queue_number
                        ).padStart(2, "0")
                    );


                alert(
                    `${queueNumber} - ${data.name} is now being served.`
                );

            }

            catch (error) {

                console.error(
                    "Call Next Error:",
                    error
                );


                alert(
                    "Unable to connect to QueueLess server."
                );

            }

        }
    );

}


// ============================================================
// AUTO REFRESH
// ============================================================

setInterval(
    function () {

        loadQueueFromBackend();

    },
    2000
);


// ============================================================
// INITIAL LOAD
// ============================================================

loadQueueFromBackend();

createBusinessSelector();

updateAdminDashboard();

updateCustomerTicket();
