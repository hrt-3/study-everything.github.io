// 'PDFを作成する'ボタンの要素を取得
const generatePdfBtn = document.getElementById('generate-pdf-btn');

// ボタンがクリックされたときの処理を登録
generatePdfBtn.addEventListener('click', () => {

    // jsPDFライブラリからjsPDFオブジェクトを取得
    const { jsPDF } = window.jspdf;
    
    // A4サイズの新しいPDFドキュメントを作成
    const doc = new jsPDF();

    // --- ここからPDFの内容を作成 ---

    // タイトルを追加
    // 注意: jsPDFの標準フォントは日本語に非対応のため、日本語は文字化けします。
    // そのため、ここでは英字でタイトルを設定しています。
    // 日本語対応にはフォントファイルを組み込む必要があります。
    doc.setFontSize(24);
    doc.text('Hyakumasu Keisan (100-cell calculation)', 105, 25, { align: 'center' });

    // 計算に使うランダムな数字の配列を2つ生成 (1から9まで)
    const topNumbers = Array.from({ length: 10 }, () => Math.floor(Math.random() * 9) + 1);
    const sideNumbers = Array.from({ length: 10 }, () => Math.floor(Math.random() * 9) + 1);

    // マス目の設定
    const startX = 15;      // マス目を書き始めるX座標
    const startY = 40;      // マス目を書き始めるY座標
    const cellSize = 18;    // 1マスのサイズ
    const gridSize = 10;    // マスの数 (10x10)

    doc.setFontSize(14);
    doc.text('+', startX + cellSize / 2, startY + cellSize / 2 + 5, { align: 'center' });

    // 11x11のマス目と数字を描画
    for (let i = 0; i <= gridSize; i++) { // 行 (縦)
        for (let j = 0; j <= gridSize; j++) { // 列 (横)
            
            // マス目の枠線を描画
            doc.rect(startX + j * cellSize, startY + i * cellSize, cellSize, cellSize);

            let text = '';
            // 1行目に数字を配置 (j > 0)
            if (i === 0 && j > 0) {
                text = topNumbers[j - 1].toString();
            } 
            // 1列目に数字を配置 (i > 0)
            else if (j === 0 && i > 0) {
                text = sideNumbers[i - 1].toString();
            }

            // マスの中心にテキストを配置
            if (text) {
                doc.text(text, startX + j * cellSize + cellSize / 2, startY + i * cellSize + cellSize / 2 + 5, { align: 'center' });
            }
        }
    }
    
    // --- PDFの内容作成はここまで ---

    // 作成したPDFを'hyakumasu-keisan.pdf'という名前でダウンロード
    doc.save('hyakumasu-keisan.pdf');
});
