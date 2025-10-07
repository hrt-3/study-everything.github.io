// PDF生成ボタンとローディング表示の要素を取得
const generatePdfBtn = document.getElementById('generate-pdf-btn');
const loadingIndicator = document.getElementById('loading');

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


    // グリッドの線と数字を描画
    for (let i = 0; i <= gridSize; i++) {
        // 横線
        doc.line(startX, startY + i * cellSize, startX + (gridSize + 1) * cellSize, startY + i * cellSize);
        // 縦線
        doc.line(startX + i * cellSize, startY, startX + i * cellSize, startY + (gridSize + 1) * cellSize);

        // 上辺の数字
        if (i < gridSize) {
            doc.text(topNumbers[i].toString(), startX + (i + 1.5) * cellSize, startY + cellSize / 2 + 5, { align: 'center' });
        }
        // 左辺の数字
        if (i < gridSize) {
            doc.text(sideNumbers[i].toString(), startX + cellSize / 2, startY + (i + 1.5) * cellSize + 5, { align: 'center' });
        }
    }

    // 解答をマス目に書き込む
    if (showAnswers) {
        doc.setFontSize(12);
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                let answer;
                const topNum = topNumbers[j];
                const sideNum = sideNumbers[i];

                if (operation === 'add') {
                    answer = topNum + sideNum;
                } else if (operation === 'subtract') {
                    answer = topNum - sideNum;
                } else if (operation === 'multiply') {
                    answer = topNum * sideNum;
                }

                if (answer !== undefined) {
                    doc.text(answer.toString(), startX + (j + 1.5) * cellSize, startY + (i + 1.5) * cellSize + 5, { align: 'center' });
                }
            }
        }
    }
};


/**
 * PDFを生成する非同期関数
 */
const generatePdf = async () => {
    // ローディング表示を開始
    loadingIndicator.classList.remove('hidden');

    try {
        // jsPDFのインスタンスを生成
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // フォントをVFSに追加してjsPDFで使えるようにする
        // MPLUS1p-Regular-normal.jsで定義されているグローバル変数 `font` を使用
        doc.addFileToVFS('Mplus1p-Regular.ttf', font);
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
        doc.save('hyakumasu-keisan.pdf');

    } catch (error) {
        console.error('PDF生成中にエラーが発生しました:', error);
        alert('PDF生成中にエラーが発生しました。コンソールを確認してください。');
    } finally {
        // ローディング表示を終了
        loadingIndicator.classList.add('hidden');
    }
};

// ボタンにクリックイベントを追加
generatePdfBtn.addEventListener('click', generatePdf);
