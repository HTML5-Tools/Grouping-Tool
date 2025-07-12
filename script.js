// Grouping Tool (Non-WebGL Version) by budou10
const button = document.getElementById('groupButton');
const menberInput = document.getElementById('menber');
const minPeopleInput = document.getElementById('minPeople');
const resultContainer = document.getElementById('groupedMembers');

// ローカルストレージから復元
window.addEventListener('DOMContentLoaded', () => {
    const savedMenber = localStorage.getItem('menber');
    const savedMinPeople = localStorage.getItem('minPeople');
    const savedResult = localStorage.getItem('groupedMembers');
    const savedTime = localStorage.getItem('groupedTime');
    if (savedMenber !== null) menberInput.value = savedMenber;
    if (savedMinPeople !== null) minPeopleInput.value = savedMinPeople;
    if (savedResult !== null) {
        resultContainer.innerHTML = savedResult;
        const resultTitle = document.querySelector('#result h2');
        if (resultTitle) {
            let info = '（前回の結果を復元しました';
            if (savedTime) info += `：${savedTime}`;
            info += '）';
            resultTitle.textContent = 'グループ分け結果 ' + info;
        }
    }
});

function groupMembers() {
    let menber = menberInput.value;
    let minPeople = minPeopleInput.value;
    let menberArray = menber.split('\n').filter(v => v.trim() !== '');
    let numOfMenber = menberArray.length;
    let result = [];
    // 「グループ分け結果」横の復元表示を消す
    const resultTitle = document.querySelector('#result h2');
    if (resultTitle) {
        resultTitle.textContent = 'グループ分け結果';
    }
    if (menber === '') {
        alert('「すべてのメンバー」を入力してください。');
    } else if (minPeople < 1) {
        alert('「一グループの最低人数」は1人以上に設定してください。');
    } else if (parseInt(minPeople) > numOfMenber) {
        alert('「一グループの最低人数」が「すべてのメンバー」の人数を上回っています。');
    } else {
        // グループ分けの処理 ここから
        menberArray = menberArray
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }) => value);
        while (menberArray.length >= minPeople) {
            let group = [];
            while (group.length < minPeople && menberArray.length > 0) {
                group.push(menberArray.shift());
            }
            result.push(group);
        }
        let groupIndex = 0;
        while (menberArray.length > 0) {
            result[groupIndex % result.length].push(menberArray.shift());
            groupIndex++;
        }
        resultContainer.innerHTML = '';
        result.forEach((group, i) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group';
            groupDiv.innerHTML = `&lt;グループ${i + 1}&gt;<br>` + group.map(member => `<div>${member}</div>`).join('');
            resultContainer.appendChild(groupDiv);
        });
        // グループ分けの処理 ここまで

        // ローカルストレージに保存
        localStorage.setItem('menber', menberInput.value);
        localStorage.setItem('minPeople', minPeopleInput.value);
        localStorage.setItem('groupedMembers', resultContainer.innerHTML);
        localStorage.setItem('groupedTime', new Date().toLocaleString());
    }
}
button.addEventListener('click', groupMembers);