/*
====================================================
 STUDENT BLOCKCHAIN SYSTEM
====================================================
*/


/* =================================================
   BLOCKCHAIN CLASS
================================================= */

class Block {

    constructor(index, timestamp, student, previousHash = "") {

        this.index = index;

        this.timestamp = timestamp;

        this.student = student;

        this.previousHash = previousHash;

        this.hash = "";

    }


    async calculateHash() {

        const text =
            this.index +
            this.timestamp +
            JSON.stringify(this.student) +
            this.previousHash;


        const encoder =
            new TextEncoder();

        const data =
            encoder.encode(text);


        const hashBuffer =
            await crypto.subtle.digest(
                "SHA-256",
                data
            );


        const hashArray =
            Array.from(
                new Uint8Array(hashBuffer)
            );


        return hashArray
            .map(
                byte =>
                    byte.toString(16)
                        .padStart(2, "0")
            )
            .join("");

    }

}


/* =================================================
   BLOCKCHAIN
================================================= */

class StudentBlockchain {

    constructor() {

        this.chain = [];

    }


    async createGenesisBlock() {

        if (this.chain.length === 0) {

            const genesis =
                new Block(
                    0,
                    new Date().toISOString(),
                    {
                        type: "Genesis Block"
                    },
                    "0"
                );


            genesis.hash =
                await genesis.calculateHash();


            this.chain.push(genesis);

        }

    }


    async addStudent(student) {

        const previousBlock =
            this.chain[
                this.chain.length - 1
            ];


        const block =
            new Block(
                this.chain.length,
                new Date().toISOString(),
                student,
                previousBlock.hash
            );


        block.hash =
            await block.calculateHash();


        this.chain.push(block);


        this.save();

        return block;

    }


    async isValid() {

        for (
            let i = 1;
            i < this.chain.length;
            i++
        ) {

            const current =
                this.chain[i];

            const previous =
                this.chain[i - 1];


            const calculatedHash =
                await current.calculateHash();


            if (
                current.hash !==
                calculatedHash
            ) {

                return false;

            }


            if (
                current.previousHash !==
                previous.hash
            ) {

                return false;

            }

        }


        return true;

    }


    save() {

        localStorage.setItem(
            "studentBlockchain",
            JSON.stringify(this.chain)
        );

    }


    load() {

        const data =
            localStorage.getItem(
                "studentBlockchain"
            );


        if (data) {

            this.chain =
                JSON.parse(data);

        }

    }

}


/* =================================================
   CREATE BLOCKCHAIN
================================================= */

const blockchain =
    new StudentBlockchain();


/* =================================================
   INITIALIZE
================================================= */

async function initialize() {

    blockchain.load();


    if (blockchain.chain.length === 0) {

        await blockchain.createGenesisBlock();

        blockchain.save();

    }


    renderStudents();

    renderBlockchain();

    updateDashboard();

}


initialize();


/* =================================================
   ADD STUDENT
================================================= */

async function addStudent(
    nim,
    name,
    major,
    year
) {

    /*
    Cek NIM agar tidak duplikat
    */

    const exists =
        blockchain.chain.some(
            block =>
                block.student &&
                block.student.nim === nim
        );


    if (exists) {

        alert(
            "NIM tersebut sudah terdaftar!"
        );

        return false;

    }


    const student = {

        nim: nim,

        name: name,

        major: major,

        year: year

    };


    await blockchain.addStudent(student);


    renderStudents();

    renderBlockchain();

    updateDashboard();


    alert(
        "Dadus Estudante Susesu Rai Iha blockchain!"
    );


    return true;

}


/* =================================================
   FORM DASHBOARD
================================================= */

document
    .getElementById("studentForm")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const nim =
                document.getElementById(
                    "nim"
                ).value.trim();


            const name =
                document.getElementById(
                    "name"
                ).value.trim();


            const major =
                document.getElementById(
                    "major"
                ).value;


            const year =
                document.getElementById(
                    "year"
                ).value;


            const success =
                await addStudent(
                    nim,
                    name,
                    major,
                    year
                );


            if (success) {

                this.reset();

            }

        }
    );


/* =================================================
   FORM ADD STUDENT PAGE
================================================= */

document
    .getElementById("studentForm2")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const nim =
                document.getElementById(
                    "nim2"
                ).value.trim();


            const name =
                document.getElementById(
                    "name2"
                ).value.trim();


            const major =
                document.getElementById(
                    "major2"
                ).value;


            const year =
                document.getElementById(
                    "year2"
                ).value;


            const success =
                await addStudent(
                    nim,
                    name,
                    major,
                    year
                );


            if (success) {

                this.reset();

                showSection(
                    "dashboard"
                );

            }

        }
    );


/* =================================================
   GET STUDENTS
================================================= */

function getStudents() {

    return blockchain.chain
        .filter(
            block =>
                block.index !== 0 &&
                block.student
        );

}


/* =================================================
   RENDER STUDENT TABLE
================================================= */

function renderStudents() {

    const tbody =
        document.getElementById(
            "studentTableBody"
        );


    if (!tbody) return;


    const search =
        document.getElementById(
            "searchInput"
        )?.value
        .toLowerCase()
        .trim() || "";


    const students =
        getStudents()
            .filter(block => {

                const student =
                    block.student;


                return (
                    student.nim
                        .toLowerCase()
                        .includes(search)
                    ||
                    student.name
                        .toLowerCase()
                        .includes(search)
                    ||
                    student.major
                        .toLowerCase()
                        .includes(search)
                );

            });


    tbody.innerHTML = "";


    if (students.length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="6"
                    style="text-align:center;padding:30px;">
                    Belum ada data mahasiswa
                </td>
            </tr>
        `;

        return;

    }


    students.forEach(
        (block, index) => {

            const student =
                block.student;


            const row =
                document.createElement("tr");


            row.innerHTML = `

                <td>
                    ${index + 1}
                </td>

                <td>
                    <strong>
                        ${escapeHTML(student.nim)}
                    </strong>
                </td>

                <td>
                    ${escapeHTML(student.name)}
                </td>

                <td>
                    ${escapeHTML(student.major)}
                </td>

                <td>
                    ${escapeHTML(student.year)}
                </td>

                <td>

                    <button
                        class="view-btn"
                        onclick="showBlock(${block.index})"
                    >
                        👁 Lihat
                    </button>

                </td>

            `;


            tbody.appendChild(row);

        }
    );

}


/* =================================================
   RENDER BLOCKCHAIN
================================================= */

function renderBlockchain() {

    const container =
        document.getElementById(
            "blockchainContainer"
        );


    if (!container) return;


    container.innerHTML = "";


    blockchain.chain
        .slice()
        .reverse()
        .forEach(block => {

            const div =
                document.createElement("div");


            div.className = "block";


            if (block.index === 0) {

                div.innerHTML = `

                    <div class="block-header">

                        <span class="block-number">
                            ⛓ Genesis Block #0
                        </span>

                        <span class="badge">
                            System
                        </span>

                    </div>

                    <div class="hash">

                        Hash:
                        ${block.hash}

                    </div>

                `;

            } else {

                div.innerHTML = `

                    <div class="block-header">

                        <span class="block-number">
                            ⛓ Block #${block.index}
                        </span>

                        <span class="block-time">
                            ${formatDate(
                                block.timestamp
                            )}
                        </span>

                    </div>


                    <div class="block-data">

                        <div class="data-item">

                            <small>NIM</small>

                            <strong>
                                ${escapeHTML(
                                    block.student.nim
                                )}
                            </strong>

                        </div>


                        <div class="data-item">

                            <small>Nama</small>

                            <strong>
                                ${escapeHTML(
                                    block.student.name
                                )}
                            </strong>

                        </div>


                        <div class="data-item">

                            <small>Jurusan</small>

                            <strong>
                                ${escapeHTML(
                                    block.student.major
                                )}
                            </strong>

                        </div>


                        <div class="data-item">

                            <small>Tahun Masuk</small>

                            <strong>
                                ${escapeHTML(
                                    block.student.year
                                )}
                            </strong>

                        </div>

                    </div>


                    <small>
                        Previous Hash
                    </small>

                    <div class="hash">
                        ${block.previousHash}
                    </div>


                    <small>
                        Hash
                    </small>

                    <div class="hash">
                        ${block.hash}
                    </div>

                `;

            }


            container.appendChild(div);

        });

}


/* =================================================
   DASHBOARD
================================================= */

function updateDashboard() {

    const totalStudents =
        document.getElementById(
            "totalStudents"
        );


    const totalBlocks =
        document.getElementById(
            "totalBlocks"
        );


    const status =
        document.getElementById(
            "blockchainStatus"
        );


    if (totalStudents) {

        totalStudents.textContent =
            getStudents().length;

    }


    if (totalBlocks) {

        totalBlocks.textContent =
            blockchain.chain.length;

    }


    if (status) {

        status.textContent =
            "Valid";

    }

}


/* =================================================
   VERIFY BLOCKCHAIN
================================================= */

async function verifyBlockchain() {

    const valid =
        await blockchain.isValid();


    const status =
        document.getElementById(
            "blockchainStatus"
        );


    if (valid) {

        if (status) {

            status.textContent =
                "Valid";

        }


        alert(
            "✓ BLOCKCHAIN VALID\n\n" +
            " block Hotu Iha hash Neebe Hanesan No tligasaun Ho loss."
        );

    } else {

        if (status) {

            status.textContent =
                "Tidak Valid";

        }


        alert(
            "✗ BLOCKCHAIN TIDAK VALID\n\n" +
            "Terdapat data yang kemungkinan telah diubah."
        );

    }

}


/* =================================================
   SHOW SECTION
================================================= */

function showSection(sectionId) {

    const sections =
        document.querySelectorAll(
            ".section"
        );


    sections.forEach(
        section =>
            section.classList.add(
                "hidden"
            )
    );


    const selected =
        document.getElementById(
            sectionId
        );


    if (selected) {

        selected.classList.remove(
            "hidden"
        );

    }


    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );


    navItems.forEach(
        item =>
            item.classList.remove(
                "active"
            )
    );


    /*
    Refresh data setiap membuka halaman
    */

    renderStudents();

    renderBlockchain();

}


/* =================================================
   SEARCH PAGE
================================================= */

function searchStudentPage() {

    const input =
        document.getElementById(
            "searchStudent"
        );


    const result =
        document.getElementById(
            "searchResult"
        );


    const keyword =
        input.value
            .toLowerCase()
            .trim();


    if (!keyword) {

        result.innerHTML = `
            <p style="color:#789;">
                Masukkan NIM atau nama mahasiswa.
            </p>
        `;

        return;

    }


    const students =
        getStudents()
            .filter(block => {

                const s =
                    block.student;


                return (
                    s.nim
                        .toLowerCase()
                        .includes(keyword)
                    ||
                    s.name
                        .toLowerCase()
                        .includes(keyword)
                );

            });


    if (students.length === 0) {

        result.innerHTML = `
            <p style="color:#d44;">
                Estudante Lahetan.
            </p>
        `;

        return;

    }


    result.innerHTML =
        students.map(block => {

            const s =
                block.student;


            return `

                <div class="result-card">

                    <h3>
                        🎓
                        ${escapeHTML(s.name)}
                    </h3>

                    <p>
                        <strong>Emis:</strong>
                        ${escapeHTML(s.nim)}
                    </p>

                    <p>
                        <strong>Kursu:</strong>
                        ${escapeHTML(s.major)}
                    </p>

                    <p>
                        <strong>Data Registu:</strong>
                        ${escapeHTML(s.year)}
                    </p>

                    <p>
                        <strong>Blockchain Block:</strong>
                        #${block.index}
                    </p>

                    <button
                        class="view-btn"
                        onclick="showBlock(${block.index})"
                    >
                        Hare Blockchain
                    </button>

                </div>

            `;

        }).join("");

}


/* =================================================
   SHOW BLOCK DETAIL
================================================= */

function showBlock(index) {

    const block =
        blockchain.chain.find(
            b => b.index === index
        );


    if (!block) return;


    const modal =
        document.getElementById(
            "modal"
        );


    const body =
        document.getElementById(
            "modalBody"
        );


    if (index === 0) {

        body.innerHTML = `

            <p>
                <strong>Block:</strong>
                Genesis Block
            </p>

            <p>
                <strong>Index:</strong>
                0
            </p>

            <p>
                <strong>Timestamp:</strong>
                ${formatDate(
                    block.timestamp
                )}
            </p>

            <p>
                <strong>Hash:</strong>
            </p>

            <div class="hash">
                ${block.hash}
            </div>

        `;

    } else {

        body.innerHTML = `

            <p>
                <strong>Block:</strong>
                #${block.index}
            </p>

            <p>
                <strong>Emis:</strong>
                ${escapeHTML(
                    block.student.nim
                )}
            </p>

            <p>
                <strong>Naran:</strong>
                ${escapeHTML(
                    block.student.name
                )}
            </p>

            <p>
                <strong>Kursu:</strong>
                ${escapeHTML(
                    block.student.major
                )}
            </p>

            <p>
                <strong>Data registu:</strong>
                ${escapeHTML(
                    block.student.year
                )}
            </p>

            <p>
                <strong>Timestamp:</strong>
                ${formatDate(
                    block.timestamp
                )}
            </p>

            <p>
                <strong>Previous Hash:</strong>
            </p>

            <div class="hash">
                ${block.previousHash}
            </div>

            <p style="margin-top:15px;">
                <strong>Hash:</strong>
            </p>

            <div class="hash">
                ${block.hash}
            </div>

        `;

    }


    modal.classList.add("show");

}


/* =================================================
   CLOSE MODAL
================================================= */

function closeModal() {

    document
        .getElementById("modal")
        .classList.remove("show");

}


window.addEventListener(
    "click",
    function(event) {

        const modal =
            document.getElementById(
                "modal"
            );


        if (
            event.target === modal
        ) {

            closeModal();

        }

    }
);


/* =================================================
   FORMAT DATE
================================================= */

function formatDate(date) {

    return new Date(date)
        .toLocaleString(
            "id-ID",
            {
                dateStyle: "medium",
                timeStyle: "medium"
            }
        );

}


/* =================================================
   ESCAPE HTML
================================================= */

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        String(value);


    return div.innerHTML;

}

