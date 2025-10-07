// window.jspdf.jsPDF のようにアクセスできるようにする
window.jsPDF = window.jspdf.jsPDF;

// "PDFを作成する"ボタンが押されたときの処理
document.getElementById('generate-pdf').addEventListener('click', () => {
    // 1. 新しいPDFドキュメントを作成
    const doc = new jsPDF();

    // 2. 百ます計算の問題を生成するロジック（ここは簡略版）
    const numbers1 = Array.from({length: 10}, () => Math.floor(Math.random() * 9) + 1);
    const numbers2 = Array.from({length: 10}, () => Math.floor(Math.random() * 9) + 1);

    // 3. PDFにタイトルを書き込む
    doc.setFontSize(22);
    doc.text("百ます計算", 105, 20, { align: 'center' });
    
    // 4. PDFにマス目と数字を書き込む
    doc.setFontSize(12);
    const startX = 20;
    const startY = 40;
    const cellWidth = 15;

    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 11; j++) {
            doc.rect(startX + j * cellWidth, startY + i * cellWidth, cellWidth, cellWidth); // マス目を描画
            let text = '';
            if (i > 0 && j > 0) {
                // 回答欄なので空欄
            } else if (i === 0 && j > 0) {
                text = numbers1[j-1].toString();
            } else if (j === 0 && i > 0) {
                text = numbers2[i-1].toString();
            }
            doc.text(text, startX + j * cellWidth + 7.5, startY + i * cellWidth + 9, { align: 'center' });
        }
    }

    // 5. PDFファイルを保存する
    doc.save('hyakumasu-keisan.pdf');
});