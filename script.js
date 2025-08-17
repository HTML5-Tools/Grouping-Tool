// Grouping Tool (Non-WebGL Version) by budou10
// const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
// document.querySelector('link#icon').setAttribute('href', isDarkMode ? 'favicon-dark.png' : 'favicon-light.png');
const button = document.getElementById('groupButton');
const menberInput = document.getElementById('menber');
const minPeopleInput = document.getElementById('minPeople');
const resultContainer = document.getElementById('groupedMembers');
const menberCount = document.getElementById('menber-count');
const absentCount = document.getElementById('absent-count'); // ←ここで1回だけ宣言
const finalCount = document.getElementById('final-count');
const moreSettings_1 = document.getElementById('moresettings_1');
const moreSettings_1_label = document.querySelector('label[for="moresettings_1"]');
const moreSettings_1_content = document.querySelector('#moreSettings_1_content');

// ローカルストレージから復元
window.addEventListener('DOMContentLoaded', () => {
    const savedMenber = localStorage.getItem('menber');
    const savedAbsent = localStorage.getItem('absent');
    const savedMinPeople = localStorage.getItem('minPeople');
    const savedResult = localStorage.getItem('groupedMembers');
    const savedTime = localStorage.getItem('groupedTime');
    const savedMoreSet1 = localStorage.getItem('moreSettings_1');
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
    if(savedMoreSet1 !== null){
        moreSettings_1.checked = savedMoreSet1 === 'true';
        moreSets1();
        for (let i = 0; i < savedMinPeople; i++){
            let id = `ms_1_${i}`;
            let textarea = document.getElementById(id);
            if (textarea) {
                textarea.value = localStorage.getItem(`ms_1_${i}`);
            }
        }
    }
    // ストレージからの読み込み・反映が終わった後に人数表示を更新
    updateCounts();
});

function groupMembers() {
    if (minPeopleInput.value < 1) {
        alert('「一グループの最低人数」は1人以上に設定してください。');
        return;
    }
    // 詳細設定のチーム分けが有効か判定
    if (!document.getElementById('ms_1_0')) {
        // ...既存の通常処理...
        console.log("通常の処理が開始しました。");
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
        let numOfMenber = menberArray.length; // ←この位置に移動
        if (parseInt(minPeople) > numOfMenber) {
            alert('「一グループの最低人数」が最終的な人数を上回っています。');
            return;
        }
        let result = [];
        // 「グループ分け結果」横の復元表示を消す
        const resultTitle = document.querySelector('#result h2');
        if (resultTitle) {
            resultTitle.textContent = 'グループ分け結果';
        }
        if (menber === '') {
            alert('「すべてのメンバー」を入力してください。');
            return;
        }
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
    } else {
        // ...詳細設定の処理...
        console.log('詳細設定がされた処理が開始しました。');
        const resultTitle = document.querySelector('#result h2');
        if (resultTitle) {
            resultTitle.textContent = 'グループ分け結果';
        }
        let teams = [];
        let i = 0;
        while (true) {
            const textarea = document.getElementById(`ms_1_${i}`);
            if (!textarea) break;
            const members = textarea.value.split('\n').map(v => v.trim()).filter(v => v !== '');
            teams.push(members);
            i++;
        }
        // 入力値チェック
        if (teams.length === 0) {
            alert('チームの入力欄がありません。');
            return;
        }
        if (teams.some(arr => arr.length === 0)) {
            alert('すべてのチーム欄に1人以上入力してください。');
            return;
        }
        const flatArr = teams.flat();
        // すべてのメンバー重複チェック
        const menberDup = flatArr.filter((v, i, arr) => arr.indexOf(v) !== i && v !== "");
        if (menberDup.length > 0) {
            alert('「すべてのメンバー」に重複があります: ' + [...new Set(menberDup)].join(', '));
            return;
        }
        // いないメンバー配列
        let absentArray = document.getElementById('absent').value.split('\n').map(v => v.trim()).filter(v => v !== '');
        // いないメンバー重複チェック
        const absentDup = absentArray.filter((v, i, arr) => arr.indexOf(v) !== i && v !== "");
        if (absentDup.length > 0) {
            alert('「いないメンバー」に重複があります: ' + [...new Set(absentDup)].join(', '));
            return;
        }
        // いないメンバーがすべてのメンバーに含まれていない場合アラート
        let notFound = absentArray.filter(name => !flatArr.includes(name));
        if (notFound.length > 0) {
            alert('「すべてのメンバー」に存在しない名前が「いないメンバー」に存在します: ' + notFound.join(', '));
            return;
        }
        // いないメンバーを除外
        teams = teams.map(arr => arr.filter(name => !absentArray.includes(name)));
        // 各チームのメンバーをシャッフル
        teams = teams.map(arr => arr.sort(() => Math.random() - 0.5));
        // グループ数は最大チーム人数
        const numGroups = Math.max(...teams.map(team => team.length));
        let result = Array.from({ length: numGroups }, () => []);
        if (numGroups > 0) {
            // 各チームからメンバーを順番に各グループに振り分ける
            for (let teamIndex = 0; teamIndex < teams.length; teamIndex++) {
                for (let memberIndex = 0; memberIndex < teams[teamIndex].length; memberIndex++) {
                    result[memberIndex].push(teams[teamIndex][memberIndex]);
                }
            }
        }
        // グループ表示
        resultContainer.innerHTML = '';
        result.forEach((group, i) => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'group';
            groupDiv.innerHTML = `＜グループ${i + 1}＞<br>` + group.map(member => `<div>${member}</div>`).join('');
            resultContainer.appendChild(groupDiv);
        });
        // ローカルストレージ保存
        localStorage.setItem('menber', '');
        localStorage.setItem('absent', '');
        localStorage.setItem('minPeople', teams.length);
        localStorage.setItem('groupedMembers', resultContainer.innerHTML);
        localStorage.setItem('groupedTime', new Date().toLocaleString());
        localStorage.setItem('moreSettings_1', moreSettings_1.checked);
        for(let i = 0; i < teams.length; i++){
        localStorage.setItem(`ms_1_${i}`, document.getElementById(`ms_1_${i}`).value);
        }
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

// ダークモード切替機能
// const darkModeButton = document.getElementById('darkModeButton');

// function setDarkMode(enabled) {
//     document.body.classList.toggle('dark-mode', enabled);
//     localStorage.setItem('darkMode', enabled ? '1' : '0');
//     darkModeButton.textContent = enabled ? '☀️' : '🌙';
// }

// darkModeButton.addEventListener('click', () => {
//     const isDark = document.body.classList.contains('dark-mode');
//     setDarkMode(!isDark);
// });

// ページ読み込み時にダークモード状態を復元
// window.addEventListener('DOMContentLoaded', () => {
//     const darkMode = localStorage.getItem('darkMode') === '1';
//     setDarkMode(darkMode);
// });
// タイトルクリックでトップへ移動するスクリプト
window.addEventListener('DOMContentLoaded', () => {
    const title_elem = document.getElementById('title');
    console.log('title_elem:', title_elem);
    if (title_elem) {
        title_elem.addEventListener('click', () => {
        window.location.href = 'https://html5tools.netlify.app/';
    });
    }
});
// 詳細設定関連
minPeopleInput.addEventListener('change', () => {
    if( minPeopleInput.value < 1 || isNaN(minPeopleInput.value)) {
        minPeopleInput.value = 1;
    }
    moreSettings_1_label.textContent = `チームを${minPeopleInput.value}つ作り、1グループに一人ずつ入れる。`;
    moreSets1();
});
window.addEventListener('DOMContentLoaded', () => {
    moreSettings_1_label.textContent = `チームを${minPeopleInput.value}つ作り、1グループに一人ずつ入れる。`;
});
function moreSets1(){
    document.querySelector("#moreSettings_1_content").textContent = '';
    if (moreSettings_1.checked){
        menberInput.disabled = true;
        for (let i = 0; i < minPeopleInput.value; i++){
            let id = `ms_1_${i}`;
            let textarea = document.createElement('textarea');
            textarea.setAttribute('id', id);
            textarea.setAttribute('placeholder', `チーム${i + 1}のメンバー`);
            moreSettings_1_content.appendChild(textarea);
        }
    } else {
        menberInput.disabled = false;
    }
};
moreSettings_1.addEventListener("change", moreSets1);
console.log(moreSettings_1_content);