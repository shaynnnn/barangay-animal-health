/* =====================================================
   GENERAL
===================================================== */

function toggleMenu() {

    const nav =
        document.getElementById("mainNav");

    if (nav) {
        nav.classList.toggle("show");
    }

}


function toggleElement(id) {

    const element =
        document.getElementById(id);

    if (element) {
        element.classList.toggle("hidden");
    }

}


function escapeHTML(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =====================================================
   AGE HELPERS
===================================================== */

/*
   Converts years and months into a readable age.

   Examples:
   0 years, 6 months
   = 6 months old

   1 year, 0 months
   = 1 year old

   2 years, 3 months
   = 2 years 3 months old
*/

function formatPetAge(years, months) {

    years = Number(years) || 0;
    months = Number(months) || 0;

    if (months < 0) {
        months = 0;
    }

    if (months > 11) {
        months = 11;
    }

    const parts = [];

    if (years > 0) {

        parts.push(
            years === 1
                ? "1 year"
                : `${years} years`
        );

    }

    if (months > 0) {

        parts.push(
            months === 1
                ? "1 month"
                : `${months} months`
        );

    }

    if (parts.length === 0) {
        return "0 months old";
    }

    return parts.join(" ") + " old";
}


/*
   Gets the age from a Firestore record.

   New records:
   ageYears + ageMonths

   Old records:
   age

   This keeps older Firebase records working.
*/

function getPetAgeText(pet) {

    if (
        pet.ageYears !== undefined ||
        pet.ageMonths !== undefined
    ) {

        return formatPetAge(
            pet.ageYears,
            pet.ageMonths
        );

    }

    return pet.age || "-";
}


/*
   Safely gets a number from an input.
*/

function getNumberValue(id) {

    const element =
        document.getElementById(id);

    if (!element) {
        return 0;
    }

    return Number(element.value) || 0;
}


/* =====================================================
   REGISTRY
===================================================== */

const registryForm =
    document.getElementById(
        "registryFormElement"
    );


if (registryForm) {

    registryForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const ageYears =
                getNumberValue(
                    "registryAgeYears"
                );

            const ageMonths =
                getNumberValue(
                    "registryAgeMonths"
                );


            if (
                ageYears < 0 ||
                ageMonths < 0 ||
                ageMonths > 11
            ) {

                alert(
                    "Please enter a valid age. Months must be from 0 to 11."
                );

                return;

            }


            try {

                await db
                    .collection("pets")
                    .add({

                        ownerName:
                            document
                                .getElementById(
                                    "ownerName"
                                )
                                .value
                                .trim(),

                        contactNumber:
                            document
                                .getElementById(
                                    "contactNumber"
                                )
                                .value
                                .trim(),

                        petName:
                            document
                                .getElementById(
                                    "registryPetName"
                                )
                                .value
                                .trim(),

                        breed:
                            document
                                .getElementById(
                                    "registryBreed"
                                )
                                .value
                                .trim(),

                        ageYears:
                            ageYears,

                        ageMonths:
                            ageMonths,

                        age:
                            formatPetAge(
                                ageYears,
                                ageMonths
                            ),

                        birthdate:
                            document
                                .getElementById(
                                    "registryBirthdate"
                                )
                                .value,

                        species:
                            document
                                .getElementById(
                                    "registrySpecies"
                                )
                                .value,

                        rabiesStatus:
                            document
                                .getElementById(
                                    "rabiesStatus"
                                )
                                .value,

                        accidentStatus:
                            "No accident reported",

                        accidentDescription:
                            "",

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });


                alert(
                    "Pet registered successfully."
                );


                registryForm.reset();


                document
                    .getElementById(
                        "registryForm"
                    )
                    ?.classList
                    .add("hidden");


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to register pet."
                );

            }

        }
    );

}


const registryTable =
    document.getElementById(
        "registryTable"
    );


let registryData = [];


if (registryTable) {

    db.collection("pets")
        .onSnapshot(

            snapshot => {

                registryData = [];

                snapshot.forEach(doc => {

                    registryData.push({

                        id: doc.id,

                        ...doc.data()

                    });

                });

                renderRegistry();

            },

            error => {

                console.error(
                    "Registry error:",
                    error
                );

            }

        );

}


function renderRegistry() {

    if (!registryTable) {
        return;
    }


    const search =
        (
            document
                .getElementById(
                    "registrySearch"
                )
                ?.value || ""
        )
        .toLowerCase();


    registryTable.innerHTML = "";


    const filtered =
        registryData.filter(pet => {

            const text =
                [

                    pet.ownerName,

                    pet.contactNumber,

                    pet.petName,

                    pet.breed,

                    getPetAgeText(pet),

                    pet.birthdate,

                    pet.species,

                    pet.rabiesStatus,

                    pet.accidentStatus

                ]
                .join(" ")
                .toLowerCase();


            return text.includes(search);

        });


    filtered.forEach(pet => {

        const row =
            document.createElement(
                "tr"
            );


        row.innerHTML = `

            <td>
                ${escapeHTML(
                    pet.ownerName
                )}
            </td>

            <td>
                ${escapeHTML(
                    pet.contactNumber
                )}
            </td>

            <td>
                ${escapeHTML(
                    pet.petName || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    pet.breed
                )}
            </td>

            <td>
                ${escapeHTML(
                    getPetAgeText(pet)
                )}
            </td>

            <td>
                ${escapeHTML(
                    pet.birthdate || "-"
                )}
            </td>

            <td>
                ${escapeHTML(
                    pet.species
                )}
            </td>

            <td>
                ${escapeHTML(
                    pet.rabiesStatus
                )}
            </td>

            <td>

                <div>
                    ${escapeHTML(
                        pet.accidentStatus ||
                        "No accident reported"
                    )}
                </div>

                <button
                    class="small-btn"
                    onclick="reportRegistryAccident('${pet.id}')">

                    Report Accident

                </button>

            </td>

        `;


        registryTable.appendChild(row);

    });

}


document
    .getElementById(
        "registrySearch"
    )
    ?.addEventListener(
        "input",
        renderRegistry
    );


async function reportRegistryAccident(id) {

    const description =
        prompt(
            "Describe the accident:"
        );


    if (!description) {
        return;
    }


    try {

        await db
            .collection("pets")
            .doc(id)
            .update({

                accidentStatus:
                    "Accident reported",

                accidentDescription:
                    description

            });

    } catch (error) {

        console.error(error);

        alert(
            "Unable to report accident."
        );

    }

}


/* =====================================================
   VACCINATION
===================================================== */

const vaccinationForm =
    document.getElementById(
        "vaccinationFormElement"
    );


if (vaccinationForm) {

    vaccinationForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            try {

                await db
                    .collection("vaccinations")
                    .add({

                        petId:
                            document
                                .getElementById(
                                    "petId"
                                )
                                .value,

                        vaccineName:
                            document
                                .getElementById(
                                    "vaccineName"
                                )
                                .value,

                        dateAdministered:
                            document
                                .getElementById(
                                    "dateAdministered"
                                )
                                .value,

                        nextDue:
                            document
                                .getElementById(
                                    "nextDue"
                                )
                                .value,

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });


                alert(
                    "Vaccination record saved."
                );


                vaccinationForm.reset();


                document
                    .getElementById(
                        "vaccinationForm"
                    )
                    ?.classList
                    .add("hidden");


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to save vaccination record."
                );

            }

        }
    );

}


const vaccinationTable =
    document.getElementById(
        "vaccinationTable"
    );


let vaccinationData = [];


if (vaccinationTable) {

    db.collection("vaccinations")
        .onSnapshot(snapshot => {

            vaccinationData = [];

            snapshot.forEach(doc => {

                vaccinationData.push({

                    id: doc.id,

                    ...doc.data()

                });

            });

            renderVaccinations();

        });

}


function renderVaccinations() {

    if (!vaccinationTable) {
        return;
    }


    const search =
        (
            document
                .getElementById(
                    "vaccinationSearch"
                )
                ?.value || ""
        )
        .toLowerCase();


    vaccinationTable.innerHTML = "";


    vaccinationData
        .filter(item =>
            JSON.stringify(item)
                .toLowerCase()
                .includes(search)
        )
        .forEach(item => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHTML(
                        item.petId
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        item.vaccineName
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        item.dateAdministered
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        item.nextDue
                    )}
                </td>

            `;


            vaccinationTable.appendChild(
                row
            );

        });

}


document
    .getElementById(
        "vaccinationSearch"
    )
    ?.addEventListener(
        "input",
        renderVaccinations
    );


/* =====================================================
   BITE CASES
===================================================== */

const biteForm =
    document.getElementById(
        "biteFormElement"
    );


if (biteForm) {

    biteForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            try {

                await db
                    .collection("bitecases")
                    .add({

                        victimName:
                            document
                                .getElementById(
                                    "victimName"
                                )
                                .value,

                        animalType:
                            document
                                .getElementById(
                                    "animalType"
                                )
                                .value,

                        incidentDate:
                            document
                                .getElementById(
                                    "incidentDate"
                                )
                                .value,

                        description:
                            document
                                .getElementById(
                                    "incidentDescription"
                                )
                                .value,

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });


                alert(
                    "Bite incident reported."
                );


                biteForm.reset();


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to report bite incident."
                );

            }

        }
    );

}


const biteList =
    document.getElementById(
        "biteCaseList"
    );


if (biteList) {

    db.collection("bitecases")
        .onSnapshot(snapshot => {

            biteList.innerHTML = "";


            if (snapshot.empty) {

                biteList.innerHTML =
                    "<p>No bite cases reported.</p>";

                return;

            }


            snapshot.forEach(doc => {

                const item =
                    doc.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "bite-card";


                card.innerHTML = `

                    <h3>
                        ${escapeHTML(
                            item.victimName
                        )}
                    </h3>

                    <p>
                        Animal:
                        ${escapeHTML(
                            item.animalType
                        )}
                    </p>

                    <p>
                        Date:
                        ${escapeHTML(
                            item.incidentDate
                        )}
                    </p>

                    <p>
                        ${escapeHTML(
                            item.description
                        )}
                    </p>

                `;


                biteList.appendChild(card);

            });

        });

}


/* =====================================================
   MISSIONS
===================================================== */

function handleMissionCategoryChange() {

    const category =
        document.getElementById(
            "missionCategory"
        );

    const otherGroup =
        document.getElementById(
            "otherMissionCategoryGroup"
        );

    const otherInput =
        document.getElementById(
            "otherMissionCategory"
        );

    if (
        !category ||
        !otherGroup
    ) {
        return;
    }

    if (
        category.value === "Other"
    ) {

        otherGroup
            .classList
            .remove("hidden");

        if (otherInput) {
            otherInput.required = true;
        }

    } else {

        otherGroup
            .classList
            .add("hidden");

        if (otherInput) {
            otherInput.required = false;
            otherInput.value = "";
        }

    }
}


const missionForm =
    document.getElementById(
        "missionFormElement"
    );


if (missionForm) {

    missionForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const selectedCategory =
                document
                    .getElementById(
                        "missionCategory"
                    )
                    .value;


            if (
                selectedCategory === "Other"
            ) {

                const otherCategory =
                    document
                        .getElementById(
                            "otherMissionCategory"
                        )
                        .value
                        .trim();


                if (!otherCategory) {

                    alert(
                        "Please specify the other mission category."
                    );

                    return;

                }

            }


            try {

                await db
                    .collection("missions")
                    .add({

                        eventName:
                            document
                                .getElementById(
                                    "eventName"
                                )
                                .value,

                        eventDate:
                            document
                                .getElementById(
                                    "eventDate"
                                )
                                .value,

                        location:
                            document
                                .getElementById(
                                    "missionLocation"
                                )
                                .value,

                        category:
                            document
                                .getElementById(
                                    "missionCategory"
                                )
                                .value === "Other"
                            ? document
                                .getElementById(
                                    "otherMissionCategory"
                                )
                                .value
                                .trim()
                            : document
                                .getElementById(
                                    "missionCategory"
                                )
                                .value,

                        description:
                            document
                                .getElementById(
                                    "missionDescription"
                                )
                                .value,

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });


                alert(
                    "Mission added."
                );


                missionForm.reset();


                document
                    .getElementById(
                        "otherMissionCategoryGroup"
                    )
                    ?.classList
                    .add("hidden");


                document
                    .getElementById(
                        "otherMissionCategory"
                    )
                    ?.removeAttribute(
                        "required"
                    );


                document
                    .getElementById(
                        "missionForm"
                    )
                    ?.classList
                    .add("hidden");


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to add mission."
                );

            }

        }
    );

}


const missionList =
    document.getElementById(
        "missionList"
    );


if (missionList) {

    db.collection("missions")
        .onSnapshot(snapshot => {

            missionList.innerHTML = "";


            if (snapshot.empty) {

                missionList.innerHTML =
                    "<p>No missions available.</p>";

                return;

            }


            snapshot.forEach(doc => {

                const mission =
                    doc.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "mission-card";


                card.innerHTML = `

                    <div class="mission-date">

                        ${escapeHTML(
                            mission.eventDate
                        )}

                    </div>


                    <span class="mission-category">

                        ${escapeHTML(
                            mission.category
                        )}

                    </span>


                    <h2>

                        ${escapeHTML(
                            mission.eventName
                        )}

                    </h2>


                    <p>

                        ${escapeHTML(
                            mission.description
                        )}

                    </p>


                    <p>

                        📍

                        ${escapeHTML(
                            mission.location
                        )}

                    </p>


                    <button
                        class="primary-btn">

                        Register / Volunteer

                    </button>

                `;


                missionList.appendChild(
                    card
                );

            });

        });

}

/* =====================================================
   ADOPTION
===================================================== */

const addAdoptionForm =
    document.getElementById(
        "addAdoptionForm"
    );


if (addAdoptionForm) {

    addAdoptionForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const selected =
                document.querySelector(
                    'input[name="petImage"]:checked'
                );


            if (!selected) {

                alert(
                    "Please choose an image."
                );

                return;

            }


            const ageYears =
                getNumberValue(
                    "petAgeYears"
                );

            const ageMonths =
                getNumberValue(
                    "petAgeMonths"
                );


            if (
                ageYears < 0 ||
                ageMonths < 0 ||
                ageMonths > 11
            ) {

                alert(
                    "Please enter a valid age. Months must be from 0 to 11."
                );

                return;

            }


            try {

                await db
                    .collection("adoptions")
                    .add({

                        petName:
                            document
                                .getElementById(
                                    "petName"
                                )
                                .value
                                .trim(),

                        animalType:
                            document
                                .getElementById(
                                    "animalType"
                                )
                                .value,

                        sex:
                            document
                                .getElementById(
                                    "petSex"
                                )
                                .value,

                        ageYears:
                            ageYears,

                        ageMonths:
                            ageMonths,

                        age:
                            formatPetAge(
                                ageYears,
                                ageMonths
                            ),

                        breed:
                            document
                                .getElementById(
                                    "petBreed"
                                )
                                .value,

                        vaccinationStatus:
                            document
                                .getElementById(
                                    "vaccinationStatus"
                                )
                                .value,

                        description:
                            document
                                .getElementById(
                                    "petDescription"
                                )
                                .value,

                        ownerName:
                            document
                                .getElementById(
                                    "ownerName"
                                )
                                .value,

                        ownerContact:
                            document
                                .getElementById(
                                    "ownerContact"
                                )
                                .value,

                        ownerEmail:
                            document
                                .getElementById(
                                    "ownerEmail"
                                )
                                .value
                                .toLowerCase(),

                        image:
                            getWebpAdoptionImageName(
                                selected.value
                            ),

                        status:
                            "Available",

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });


                alert(
                    "Animal listed for adoption."
                );


                addAdoptionForm.reset();

                closeAdoptionForm();


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to add adoption listing."
                );

            }

        }
    );

}


/* =====================================================
   ADOPTION IMAGE HELPERS
===================================================== */

function getWebpAdoptionImageName(
    imageName
) {

    const fileName =
        String(
            imageName || ""
        )
        .trim()
        .split("/")
        .pop()
        .split("\\")
        .pop();


    const converted =
        fileName.replace(
            /\.(png|jpe?g|webp)$/i,
            ".webp"
        );


    const allowedImages = [

        "dog.webp",

        "pup.webp",

        "cat.webp",

        "kit.webp"

    ];


    return allowedImages.includes(
        converted.toLowerCase()
    )
        ? converted
        : "dog.webp";
}


function getAdoptionImagePath(
    imageName
) {

    const defaultImage =
        "../Images/dog.webp";


    if (!imageName) {
        return defaultImage;
    }


    let fileName =
        String(imageName)
            .trim();


    fileName =
        fileName
            .split("/")
            .pop()
            .split("\\")
            .pop();


    fileName =
        fileName.replace(
            /\.(png|jpe?g)$/i,
            ".webp"
        );


    const allowedImages = [

        "dog.webp",

        "pup.webp",

        "cat.webp",

        "kit.webp"

    ];


    if (
        !allowedImages.includes(
            fileName.toLowerCase()
        )
    ) {

        return defaultImage;

    }


    return "../Images/" + fileName;
}


/* =====================================================
   ADOPTION FORM
===================================================== */

function openAdoptionForm() {

    document
        .getElementById(
            "adoptionForm"
        )
        ?.classList
        .remove("hidden");

}


function closeAdoptionForm() {

    document
        .getElementById(
            "adoptionForm"
        )
        ?.classList
        .add("hidden");

}


/* =====================================================
   ADOPTION LIST
===================================================== */

const adoptionList =
    document.getElementById(
        "adoptionList"
    );


if (adoptionList) {

    db.collection("adoptions")
        .onSnapshot(snapshot => {

            adoptionList.innerHTML = "";


            if (snapshot.empty) {

                adoptionList.innerHTML = `

                    <p class="empty-message">

                        No animals are currently listed
                        for adoption.

                    </p>

                `;

                return;

            }


            snapshot.forEach(doc => {

                const pet =
                    doc.data();


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "adoption-card";


                const petName =
                    pet.petName ||
                    "Unnamed Animal";


                card.innerHTML = `

                    <img
                        class="adoption-image"
                        src="${getAdoptionImagePath(
                            pet.image
                        )}"
                        alt="${escapeHTML(
                            petName
                        )}"
                        onerror="
                            this.onerror=null;
                            this.src='../Images/dog.webp';
                        ">


                    <div class="adoption-card-body">

                        <h3>

                            ${escapeHTML(
                                petName
                            )}

                        </h3>


                        <div class="pet-details">

                            <span class="pet-tag">

                                ${
                                    pet.sex === "Male"
                                        ? "♂ Male"
                                        : "♀ Female"
                                }

                            </span>


                            <span class="pet-tag">

                                ${escapeHTML(
                                    pet.animalType
                                )}

                            </span>


                            <span class="pet-tag">

                                ${escapeHTML(
                                    getPetAgeText(pet)
                                )}

                            </span>


                            <span class="pet-tag">

                                ${escapeHTML(
                                    pet.breed
                                )}

                            </span>

                        </div>


                        <p class="vaccination-status">

                            Vaccination:

                            ${escapeHTML(
                                pet.vaccinationStatus
                            )}

                        </p>


                        <p>

                            ${escapeHTML(
                                pet.description ||
                                "No description."
                            )}

                        </p>


                        <p class="posted-by">

                            Posted by:

                            ${escapeHTML(
                                pet.ownerName
                            )}

                        </p>


                        ${
                            pet.status === "Available"

                            ?

                            `<button
                                class="primary-btn full-btn"
                                onclick="openRequestModal(
                                    '${doc.id}',
                                    '${escapeHTML(
                                        petName
                                    )}'
                                )">

                                I WANT TO ADOPT

                            </button>`

                            :

                            `<div class="adopted-label">

                                Already Adopted

                            </div>`
                        }

                    </div>

                `;


                adoptionList.appendChild(
                    card
                );

            });

        });

}


/* =====================================================
   ADOPTION REQUEST
===================================================== */

function openRequestModal(
    adoptionId,
    petName
) {

    document
        .getElementById(
            "requestAdoptionId"
        )
        .value =
            adoptionId;


    document
        .getElementById(
            "requestPetName"
        )
        .textContent =
            "You are interested in adopting " +
            petName +
            ".";


    document
        .getElementById(
            "requestModal"
        )
        .classList
        .remove("hidden");

}


function closeRequestModal() {

    document
        .getElementById(
            "requestModal"
        )
        ?.classList
        .add("hidden");

}


const requestForm =
    document.getElementById(
        "adoptionRequestForm"
    );


if (requestForm) {

    requestForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const adoptionId =
                document
                    .getElementById(
                        "requestAdoptionId"
                    )
                    .value;


            const applicantName =
                document
                    .getElementById(
                        "applicantName"
                    )
                    .value
                    .trim();


            const applicantEmail =
                document
                    .getElementById(
                        "applicantEmail"
                    )
                    .value
                    .trim()
                    .toLowerCase();


            const message =
                document
                    .getElementById(
                        "applicantMessage"
                    )
                    .value
                    .trim();


            try {

                const request =
                    await db
                        .collection(
                            "adoptionRequests"
                        )
                        .add({

                            adoptionId,

                            applicantName,

                            applicantContact:
                                document
                                    .getElementById(
                                        "applicantContact"
                                    )
                                    .value,

                            applicantEmail,

                            applicantBarangay:
                                document
                                    .getElementById(
                                        "applicantBarangay"
                                    )
                                    .value,

                            reason:
                                document
                                    .getElementById(
                                        "adoptionReason"
                                    )
                                    .value,

                            initialMessage:
                                message,

                            status:
                                "Pending",

                            createdAt:
                                firebase.firestore
                                    .FieldValue
                                    .serverTimestamp()

                        });


                await db
                    .collection("messages")
                    .add({

                        adoptionId,

                        requestId:
                            request.id,

                        senderType:
                            "Applicant",

                        senderEmail:
                            applicantEmail,

                        senderName:
                            applicantName,

                        message,

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });


                alert(
                    "Adoption request sent."
                );


                requestForm.reset();

                closeRequestModal();


                openMessageModal(

                    adoptionId,

                    request.id,

                    "Pet Owner",

                    "Applicant",

                    applicantEmail

                );


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to send request."
                );

            }

        }
    );

}


/* =====================================================
   OWNER REQUESTS
===================================================== */

function openOwnerDashboard() {

    document
        .getElementById(
            "ownerModal"
        )
        ?.classList
        .remove("hidden");

}


function closeOwnerDashboard() {

    document
        .getElementById(
            "ownerModal"
        )
        ?.classList
        .add("hidden");

}


async function loadOwnerRequests() {

    const email =
        document
            .getElementById(
                "ownerDashboardEmail"
            )
            .value
            .trim()
            .toLowerCase();


    const container =
        document.getElementById(
            "ownerRequestsList"
        );


    if (!email) {

        alert(
            "Enter your email."
        );

        return;

    }


    container.innerHTML =
        "Loading requests...";


    try {

        const pets =
            await db
                .collection("adoptions")
                .where(
                    "ownerEmail",
                    "==",
                    email
                )
                .get();


        if (pets.empty) {

            container.innerHTML =
                "No adoption listings found.";

            return;

        }


        container.innerHTML = "";


        for (
            const petDoc
            of pets.docs
        ) {

            const requests =
                await db
                    .collection(
                        "adoptionRequests"
                    )
                    .where(
                        "adoptionId",
                        "==",
                        petDoc.id
                    )
                    .get();


            requests.forEach(
                requestDoc => {

                    const request =
                        requestDoc.data();


                    const pet =
                        petDoc.data();


                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "request-card";


                    card.innerHTML = `

                        <h3>

                            ${escapeHTML(
                                pet.petName ||
                                "Unnamed Animal"
                            )}

                        </h3>


                        <p>

                            <strong>
                                Applicant:
                            </strong>

                            ${escapeHTML(
                                request.applicantName
                            )}

                        </p>


                        <p>

                            <strong>
                                Contact:
                            </strong>

                            ${escapeHTML(
                                request.applicantContact
                            )}

                        </p>


                        <p>

                            <strong>
                                Barangay:
                            </strong>

                            ${escapeHTML(
                                request.applicantBarangay
                            )}

                        </p>


                        <p>

                            <strong>
                                Reason:
                            </strong>

                            ${escapeHTML(
                                request.reason
                            )}

                        </p>


                        <p>

                            <strong>
                                Message:
                            </strong>

                            ${escapeHTML(
                                request.initialMessage
                            )}

                        </p>


                        <button
                            class="primary-btn"
                            onclick="openMessageModal(
                                '${petDoc.id}',
                                '${requestDoc.id}',
                                '${escapeHTML(
                                    request.applicantName
                                )}',
                                'Owner',
                                '${escapeHTML(
                                    email
                                )}'
                            )">

                            Message Applicant

                        </button>

                    `;


                    container.appendChild(
                        card
                    );

                }
            );

        }


        if (!container.children.length) {

            container.innerHTML =
                "No adoption requests yet.";

        }


    } catch (error) {

        console.error(error);

        container.innerHTML =
            "Unable to load requests.";

    }

}


/* =====================================================
   UPDATE ADOPTION REQUEST STATUS
===================================================== */

async function updateAdoptionRequestStatus(
    requestId,
    adoptionId,
    status
) {

    try {

        await db
            .collection(
                "adoptionRequests"
            )
            .doc(requestId)
            .update({

                status:
                    status

            });


        if (status === "Approved") {

            await db
                .collection(
                    "adoptions"
                )
                .doc(adoptionId)
                .update({

                    status:
                        "Adopted"

                });

        }


        alert(
            "Request status updated."
        );


        loadOwnerRequests();


    } catch (error) {

        console.error(error);

        alert(
            "Unable to update request."
        );

    }

}


/* =====================================================
   MESSAGING
===================================================== */

let currentAdoptionId = null;

let currentRequestId = null;

let currentSenderType = null;

let currentSenderEmail = null;

let unsubscribeMessages = null;


function openMessageModal(

    adoptionId,

    requestId,

    personName,

    senderType,

    senderEmail

) {

    currentAdoptionId =
        adoptionId;

    currentRequestId =
        requestId;

    currentSenderType =
        senderType;

    currentSenderEmail =
        senderEmail;


    document
        .getElementById(
            "messageTitle"
        )
        .textContent =
            "Messages with " +
            personName;


    document
        .getElementById(
            "messageModal"
        )
        .classList
        .remove("hidden");


    listenForMessages();

}


function closeMessageModal() {

    if (unsubscribeMessages) {

        unsubscribeMessages();

        unsubscribeMessages =
            null;

    }


    document
        .getElementById(
            "messageModal"
        )
        ?.classList
        .add("hidden");

}


function listenForMessages() {

    const container =
        document.getElementById(
            "messagesContainer"
        );


    if (!container) {
        return;
    }


    if (unsubscribeMessages) {

        unsubscribeMessages();

    }


    unsubscribeMessages =
        db
            .collection("messages")

            .where(
                "adoptionId",
                "==",
                currentAdoptionId
            )

            .where(
                "requestId",
                "==",
                currentRequestId
            )

            .onSnapshot(

                snapshot => {

                    container.innerHTML = "";


                    const messages = [];


                    snapshot.forEach(
                        doc => {

                            messages.push(
                                doc.data()
                            );

                        }
                    );


                    messages.sort(
                        (a, b) => {

                            const aTime =
                                a.createdAt
                                    ? a.createdAt
                                        .toMillis()
                                    : 0;


                            const bTime =
                                b.createdAt
                                    ? b.createdAt
                                        .toMillis()
                                    : 0;


                            return (
                                aTime -
                                bTime
                            );

                        }
                    );


                    messages.forEach(
                        messageData => {

                            const div =
                                document
                                    .createElement(
                                        "div"
                                    );


                            div.className =
                                messageData.senderType ===
                                currentSenderType

                                    ? "message mine"

                                    : "message theirs";


                            div.textContent =
                                messageData.message;


                            container.appendChild(
                                div
                            );

                        }
                    );


                    container.scrollTop =
                        container.scrollHeight;

                },

                error => {

                    console.error(error);

                    container.innerHTML = `

                        <p>
                            Unable to load messages.
                        </p>

                    `;

                }

            );

}


/* =====================================================
   SEND MESSAGE
===================================================== */

const messageForm =
    document.getElementById(
        "messageForm"
    );


if (messageForm) {

    messageForm.addEventListener(
        "submit",
        async event => {

            event.preventDefault();


            const input =
                document.getElementById(
                    "messageInput"
                );


            const message =
                input.value.trim();


            if (!message) {
                return;
            }


            try {

                await db
                    .collection("messages")
                    .add({

                        adoptionId:
                            currentAdoptionId,

                        requestId:
                            currentRequestId,

                        senderType:
                            currentSenderType,

                        senderEmail:
                            currentSenderEmail,

                        message,

                        createdAt:
                            firebase.firestore
                                .FieldValue
                                .serverTimestamp()

                    });


                input.value = "";


            } catch (error) {

                console.error(error);

                alert(
                    "Unable to send message."
                );

            }

        }
    );

}