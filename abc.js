document.addEventListener("DOMContentLoaded", function () {

    const apiKeyInput = document.getElementById("api-key");
    const button = document.getElementById("button");
    const select = document.getElementById("select");
    const textarea = document.getElementById("textarea");
    const table = document.getElementById("table");

    const copyButton = document.getElementById("copy");

    button.addEventListener("click", function () {
        const qs = textarea.value.split(",");

        Promise.allSettled(qs.map((q) => {
            const searchText = q.trim();

            return axios.get("https://bizno.net/api/fapi", {
                params: {
                    key: apiKeyInput.value,
                    gb: select.value,
                    q: searchText,
                    status: "Y",
                    type: "json"
                }
            });
        })).then((response) => {
            console.log("response", response);

            const results = response.filter((item) => {
                return item.status === "fulfilled" && item.value.data.resultCode === 0;
            }).map((item) => {
                const items = item.value.data.items;

                return {
                    q: item.value.config.params.q,
                    items: items.filter(i => i),
                    originItem: item
                }
            });

            return results;
        }).then((results) => {
            console.log("results", results);

            deleteAllRow();
            results.forEach(result => result.items.forEach((item) => {
                const { bno, cno, company, bsttcd, bstt, TaxTypeCd, taxtype, EndDt } = item;

                addRow(result.q, bno, cno, company, bsttcd, bstt, TaxTypeCd, taxtype, EndDt);
            }));
        }).catch((error) => {
            console.error("error", error);
        });
    })

    copyButton.addEventListener("click", function () {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(table);
        selection.removeAllRanges();
        selection.addRange(range);
        document.execCommand('copy'); //clipboard copy
    });

});

function addRow(q, bno, cno, company, bsttcd, bstt, TaxTypeCd, taxtype, EndDt) {
    const tbody = document.querySelector("table > tbody");
    const newRow = tbody.insertRow();

    [...arguments].forEach((argument, index) => {
        const newCell = newRow.insertCell(index);
        const newText = document.createTextNode(argument);
        newCell.appendChild(newText);
    });
}

function deleteAllRow() {
    const table = document.getElementById("table");
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
}