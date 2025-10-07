// PDF生成ボタンとローディング表示の要素を取得
const generatePdfBtn = document.getElementById('generate-pdf-btn');
const loadingIndicator = document.getElementById('loading');

// 読み込んだフォントデータを保存しておくための変数（初回のみ読み込む）
let mplus1pRegularFont = null;

/**
 * 2つの配列をシャッフルする関数（Fisher-Yatesアルゴリズム）
 * @param {Array} array シャッフルしたい配列
 */
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


/**
 * 計算グリッドを描画する共通関数
 * @param {jsPDF} doc - jsPDFのインスタンス
 * @param {string} title - ページのタイトル
 * @param {Array<number>} topNumbers - 上辺の数字配列
 * @param {Array<number>} sideNumbers - 左辺の数字配列
 * @param {string} operation - 計算の種類 ('add', 'subtract', 'multiply')
 * @param {boolean} showAnswers - 解答を表示するかどうか
 */
const drawGrid = (doc, title, topNumbers, sideNumbers, operation, showAnswers) => {
    // 日本語フォントを設定
    doc.setFont('Mplus1p-Regular');

    // ページタイトル
    doc.setFontSize(24);
    doc.text(title, 105, 25, { align: 'center' });

    // 計算記号のマップ
    const opSymbols = {
        'add': '+',
        'subtract': '-',
        'multiply': '×',
    };
    const opSymbol = opSymbols[operation] || '';

    // マス目の設定
    const startX = 15;
    const startY = 40;
    const cellSize = 18;
    const gridSize = 10;
    doc.setFontSize(14);
    doc.setLineWidth(0.2);

    // 左上の計算記号
    doc.text(opSymbol, startX + cellSize / 2, startY + cellSize / 2 + 5, { align: 'center' });

    // グリッドと数字を描画
    for (let i = 0; i <= gridSize; i++) {
        for (let j = 0; j <= gridSize; j++) {
            const x = startX + j * cellSize;
            const y = startY + i * cellSize;
            doc.rect(x, y, cellSize, cellSize);

            let text = '';
            // 上辺の数字
            if (i === 0 && j > 0) {
                text = topNumbers[j - 1].toString();
            }
            // 左辺の数字
            else if (j === 0 && i > 0) {
                text = sideNumbers[i - 1].toString();
            }
            // 解答欄
            else if (i > 0 && j > 0 && showAnswers) {
                const num1 = topNumbers[j - 1];
                const num2 = sideNumbers[i - 1];
                let answer = 0;
                if (operation === 'add') {
                    answer = num1 + num2;
                } else if (operation === 'subtract') {
                    answer = num1 - num2; // 引き算用に数字が調整されている前提
                } else if (operation === 'multiply') {
                    answer = num1 * num2;
                }
                text = answer.toString();
            }

            if (text) {
                doc.text(text, x + cellSize / 2, y + cellSize / 2 + 5, { align: 'center' });
            }
        }
    }
};

// --- メインの処理 ---
generatePdfBtn.addEventListener('click', async () => {
    // ローディング表示を開始し、ボタンを無効化
    loadingIndicator.classList.remove('hidden');
    generatePdfBtn.disabled = true;
    generatePdfBtn.textContent = '生成中...';

    // 非同期処理でUIのフリーズを防ぐ
    await new Promise(resolve => setTimeout(resolve, 50));

    try {
        // --- ★★★ここからが変更点★★★ ---
        // まだフォントを読み込んでいなければ、インターネットから取得する
        if (!mplus1pRegularFont) {
            console.log('フォントデータを読み込んでいます...');
            const fontUrl = 'https://cdn.jsdelivr.net/gh/MrRio/jsPDF/test/reference/Mplus-1p-regular.ttf.base64';
            const response = await fetch(fontUrl);
            if (!response.ok) {
                throw new Error(`フォントの読み込みに失敗しました: ${response.statusText}`);
            }
            mplus1pRegularFont = await response.text();
            console.log('フォントデータの読み込みが完了しました。');
        }
        // --- ★★★変更点はここまで★★★ ---

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // VFS (Virtual File System) にフォントデータを追加
        doc.addFileToVFS('Mplus1p-Regular.ttf', mplus1pRegularFont);
        // フォントを追加
        doc.addFont('Mplus1p-Regular.ttf', 'Mplus1p-Regular', 'normal');

        // ユーザーの選択を取得
        const operation = document.querySelector('input[name="operation"]:checked').value;
        const includeAnswers = document.getElementById('include-answers').checked;

        // 計算方法に応じて数字を生成
        let topNumbers, sideNumbers;
        if (operation === 'subtract') {
            // 引き算：答えがマイナスにならないように、上の数字を大きくする
            topNumbers = shuffleArray(Array.from({ length: 10 }, (_, i) => i + 10)); // 10-19
            sideNumbers = shuffleArray(Array.from({ length: 10 }, (_, i) => i + 1));  // 1-10
        } else {
            // 足し算・掛け算：1桁の数字
            topNumbers = shuffleArray(Array.from({ length: 10 }, (_, i) => i + 1)); // 1-10
            sideNumbers = shuffleArray(Array.from({ length: 10 }, (_, i) => i + 1)); // 1-10
        }

        // 1ページ目：問題を描画
        drawGrid(doc, '百ます計算', topNumbers, sideNumbers, operation, false);

        // 解答を含める場合、2ページ目を追加
        if (includeAnswers) {
            doc.addPage();
            drawGrid(doc, '解答', topNumbers, sideNumbers, operation, true);
        }

        // PDFを保存
        doc.save('hyakumasu-keisan-custom.pdf');

    } catch (error) {
        console.error('PDFの生成中にエラーが発生しました:', error);
        alert('PDFの生成に失敗しました。ネットワーク接続を確認するか、しばらくしてからもう一度お試しください。');
    } finally {
        // ローディング表示を終了し、ボタンを有効化
        loadingIndicator.classList.add('hidden');
        generatePdfBtn.disabled = false;
        generatePdfBtn.textContent = 'PDFを作成する';
    }
});

