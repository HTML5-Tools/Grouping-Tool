// Grouping Tool (Non-WebGL Version) by budou10
const button = document.getElementById('groupButton');
const menberInput = document.getElementById('menber');
const minPeopleInput = document.getElementById('minPeople');
const resultContainer = document.getElementById('groupedMembers');
const menberCount = document.getElementById('menber-count');
const absentCount = document.getElementById('absent-count'); // ←ここで1回だけ宣言
const finalCount = document.getElementById('final-count');

// ローカルストレージから復元
window.addEventListener('DOMContentLoaded', () => {
    const savedMenber = localStorage.getItem('menber');
    const savedAbsent = localStorage.getItem('absent');
    const savedMinPeople = localStorage.getItem('minPeople');
    const savedResult = localStorage.getItem('groupedMembers');
    const savedTime = localStorage.getItem('groupedTime');
    if (savedMenber !== null) menberInput.value = savedMenber;
    if (savedAbsent !== null) document.getElementById('absent').value = savedAbsent;
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
    // ストレージからの読み込み・反映が終わった後に人数表示を更新
    updateCounts();
});

function groupMembers() {
    let menber = menberInput.value;
    let absent = document.getElementById('absent').value;
    let minPeople = minPeopleInput.value;

    // メンバー配列
    let menberArray = menber.split('\n').map(v => v.trim()).filter(v => v !== '');
    // いないメンバー配列
    let absentArray = absent.split('\n').map(v => v.trim()).filter(v => v !== '');

    // すべてのメンバー重複チェック
    const menberDup = menberArray.filter((v, i, arr) => arr.indexOf(v) !== i && v !== "");
    if (menberDup.length > 0) {
        alert('「すべてのメンバー」に重複があります: ' + [...new Set(menberDup)].join(', '));
        return;
    }
    // いないメンバー重複チェック
    const absentDup = absentArray.filter((v, i, arr) => arr.indexOf(v) !== i && v !== "");
    if (absentDup.length > 0) {
        alert('「いないメンバー」に重複があります: ' + [...new Set(absentDup)].join(', '));
        return;
    }

    // いないメンバーがすべてのメンバーに含まれていない場合アラート
    let notFound = absentArray.filter(name => !menberArray.includes(name));
    if (notFound.length > 0) {
        alert('「すべてのメンバー」に存在しない名前が「いないメンバー」に存在します: ' + notFound.join(', '));
        return;
    }

    // いないメンバーを除外
    menberArray = menberArray.filter(name => !absentArray.includes(name));
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
        alert('「一グループの最低人数」が最終的な人数を上回っています。');
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

        // ローカルストレージに保存（いないメンバーも追加）
        localStorage.setItem('menber', menberInput.value);
        localStorage.setItem('absent', document.getElementById('absent').value);
        localStorage.setItem('minPeople', minPeopleInput.value);
        localStorage.setItem('groupedMembers', resultContainer.innerHTML);
        localStorage.setItem('groupedTime', new Date().toLocaleString());
    }
}
button.addEventListener('click', groupMembers);

const downloadButton = document.getElementById('downloadButton');
downloadButton.addEventListener('click', () => {
    let text = '';
    const groups = document.querySelectorAll('#groupedMembers .group');
    if (groups.length === 0) {
        alert('グループ分け結果がありません。');
        return;
    }

    // 日付取得（復元かどうか判定）
    let groupedTime = localStorage.getItem('groupedTime');
    let resultTitle = document.querySelector('#result h2');
    let isRestored = false;
    let usedTime = '';
    if (resultTitle && resultTitle.textContent.includes('復元しました')) {
        isRestored = true;
        usedTime = groupedTime || '';
    } else {
        usedTime = new Date().toLocaleString();
    }

    // ファイル名用の日付（grouped_年_月_日_時_分_秒.txt）
    function dateToFilename(dateStr) {
        const d = new Date(dateStr);
        const pad = n => n.toString().padStart(2, '0');
        return `grouped_${d.getFullYear()}_${pad(d.getMonth()+1)}_${pad(d.getDate())}_${pad(d.getHours())}_${pad(d.getMinutes())}_${pad(d.getSeconds())}.txt`;
    }
    const filename = dateToFilename(usedTime);

    // メンバー・日付・最低人数を記述
    text += '----- グループ分けツール　結果 -----\n';
    text += 'https://grouping-tool.netlify.app/\n\n';
    text += `【グループ分け日時】${usedTime}\n\n`;
    text += '【元のメンバー】\n';
    text += menberInput.value.trim() + '\n\n';
    text += `【一グループの最低人数】${minPeopleInput.value}\n\n`;
    text += '【グループ分け結果】\n';

    groups.forEach((group, i) => {
        text += `＜グループ${i + 1}＞\n`;
        group.querySelectorAll('div').forEach(memberDiv => {
            text += memberDiv.textContent + '\n';
        });
        text += '\n';
    });

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }, 0);
});

function updateCounts() {
    // すべてのメンバー人数
    const menberArray = menberInput.value.split('\n').map(v => v.trim()).filter(v => v !== '');
    menberCount.textContent = `人数：${menberArray.length}`;
    // いないメンバー人数
    const absentArray = document.getElementById('absent').value.split('\n').map(v => v.trim()).filter(v => v !== '');
    absentCount.textContent = `人数：${absentArray.length}`;
    // 最終的な人数（いないメンバーを除いた人数）
    const filtered = menberArray.filter(name => !absentArray.includes(name));
    finalCount.textContent = `最終的な人数：${filtered.length}`;
}
menberInput.addEventListener('input', updateCounts);
document.getElementById('absent').addEventListener('input', updateCounts);
// 初期表示
updateCounts();